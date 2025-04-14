import os
import torch
import torch.nn as nn
import torchvision
import torchvision.transforms as transforms
from PIL import Image
import cv2
import numpy as np
import matplotlib

matplotlib.use('Agg')
import matplotlib.pyplot as plt
from tqdm import tqdm
import datetime


# Определяем класс модели, аналогичный тому, что использовался при обучении
class SSLModel(nn.Module):
    def __init__(self, feature_dim=128):
        super(SSLModel, self).__init__()
        resnet = torchvision.models.resnet50(pretrained=False)
        self.encoder = nn.Sequential(*list(resnet.children())[:-1])
        self.projection = nn.Sequential(
            nn.Linear(2048, 512),
            nn.ReLU(inplace=True),
            nn.Linear(512, feature_dim)
        )

    def forward(self, x):
        h = self.encoder(x)
        h = h.view(h.size(0), -1)
        z = self.projection(h)
        return h, z


class ObjectDetector:
    """Класс для обнаружения объектов на видео с использованием обученной модели SSL."""

    def __init__(self, model_path, device=None):
        """
        Инициализация детектора объектов.
        Args:
            model_path (str): Путь к файлу с предобученной моделью.
            device (torch.device, optional): Устройство для вычислений (CPU/GPU).
        """
        if device is None:
            self.device = torch.device("cuda" if torch.cuda.is_available() else "cpu")
        else:
            self.device = device
        print(f"Используется устройство: {self.device}")

        # Загружаем предобученную модель
        self.model = self.load_model(model_path)

        # Преобразование для изображений
        self.transform = transforms.Compose([
            transforms.Resize((224, 224)),
            transforms.ToTensor(),
            transforms.Normalize(mean=[0.485, 0.456, 0.406], std=[0.229, 0.224, 0.225])
        ])

    def load_model(self, model_path):
        """Загрузка предобученной модели."""
        model = SSLModel(feature_dim=128)
        model.load_state_dict(torch.load(model_path, map_location=self.device))
        model.to(self.device)
        model.eval()
        return model

    def get_image_features(self, image_path):
        """Получение признаков из изображения."""
        image = Image.open(image_path).convert('RGB')
        image_tensor = self.transform(image).unsqueeze(0).to(self.device)
        with torch.no_grad():
            features, _ = self.model(image_tensor)
        return features

    def process_video(self, video_path, target_image_path, additional_images=None, output_path=None, threshold=0.85,
                      sample_rate=10):
        """
        Обработка видео для обнаружения объекта с опциональными дополнительными изображениями.
        Args:
            video_path (str): Путь к видео.
            target_image_path (str): Путь к основному изображению целевого объекта.
            additional_images (list, optional): Список путей к дополнительным изображениям объекта.
            output_path (str, optional): Путь для сохранения обработанного видео.
            threshold (float, optional): Порог сходства для обнаружения объекта.
            sample_rate (int, optional): Частота выборки кадров из видео.
        """
        # Собираем все изображения в один список
        all_image_paths = [target_image_path]
        if additional_images:
            for img_path in additional_images:
                if os.path.exists(img_path):
                    all_image_paths.append(img_path)
                else:
                    print(f"Предупреждение: файл {img_path} не найден и будет пропущен")

        # Получаем признаки для всех целевых изображений
        target_features_list = []
        for target_path in all_image_paths:
            target_features = self.get_image_features(target_path)
            target_features_list.append(target_features)

        # Открываем видео
        cap = cv2.VideoCapture(video_path)
        width = int(cap.get(cv2.CAP_PROP_FRAME_WIDTH))
        height = int(cap.get(cv2.CAP_PROP_FRAME_HEIGHT))
        fps = cap.get(cv2.CAP_PROP_FPS)
        total_frames = int(cap.get(cv2.CAP_PROP_FRAME_COUNT))

        # Создаем объект для записи выходного видео, если указан путь
        out = None
        if output_path:
            fourcc = cv2.VideoWriter_fourcc(*'mp4v')
            out = cv2.VideoWriter(output_path, fourcc, fps, (width, height))

        # Подготавливаем целевые изображения для отображения
        target_images = []
        for target_path in all_image_paths:
            target_img = cv2.imread(target_path)
            target_img = cv2.resize(target_img, (150, 150))
            target_images.append(target_img)

        frame_count = 0
        processed_count = 0
        matches = []
        scores = []

        with tqdm(total=total_frames, desc="Обработка видео") as pbar:
            while True:
                ret, frame = cap.read()
                if not ret:
                    break

                # Обрабатываем только каждый sample_rate кадр
                if frame_count % sample_rate == 0:
                    # Преобразуем кадр и получаем признаки
                    rgb_frame = cv2.cvtColor(frame, cv2.COLOR_BGR2RGB)
                    frame_pil = Image.fromarray(rgb_frame)
                    frame_tensor = self.transform(frame_pil).unsqueeze(0).to(self.device)

                    with torch.no_grad():
                        frame_features, _ = self.model(frame_tensor)

                    # Вычисляем косинусное сходство с каждым целевым изображением
                    # и берем максимальное значение
                    max_similarity = -1
                    best_match_idx = -1
                    for idx, target_features in enumerate(target_features_list):
                        similarity = nn.functional.cosine_similarity(target_features, frame_features).item()
                        if similarity > max_similarity:
                            max_similarity = similarity
                            best_match_idx = idx

                    scores.append(max_similarity)

                    # Если объект обнаружен, добавляем индекс кадра и индекс лучшего изображения
                    if max_similarity > threshold:
                        matches.append((processed_count, best_match_idx))

                    processed_count += 1

                    # Если нужно создать выходное видео, обрабатываем кадр
                    if output_path:
                        # Отображаем все эталонные изображения в верхней части кадра
                        # Размещаем их в ряд
                        img_width = 100
                        img_height = 100
                        for i, target_img in enumerate(target_images):
                            small_img = cv2.resize(target_img, (img_width, img_height))
                            x_offset = 10 + i * (img_width + 5)
                            frame[10:10 + img_height, x_offset:x_offset + img_width] = small_img

                            # Выделяем лучшее совпадение если объект найден
                            if max_similarity > threshold and best_match_idx == i:
                                cv2.rectangle(frame, (x_offset - 2, 8), (x_offset + img_width + 2, 12 + img_height),
                                              (0, 255, 0), 2)

                        # Добавляем информацию о сходстве
                        text = f"Сходство: {max_similarity:.2f}"
                        cv2.putText(frame, text, (10, 130), cv2.FONT_HERSHEY_SIMPLEX, 0.6, (0, 255, 0), 2)

                        # Если объект найден, отмечаем это на кадре
                        if max_similarity > threshold:
                            cv2.putText(frame, "ОБЪЕКТ НАЙДЕН", (10, 160), cv2.FONT_HERSHEY_SIMPLEX, 0.7, (0, 0, 255),
                                        2)

                        out.write(frame)

                frame_count += 1
                pbar.update(1)

                # Освобождаем память CUDA каждые 100 кадров
                if frame_count % 100 == 0 and torch.cuda.is_available():
                    torch.cuda.empty_cache()

        # Освобождаем ресурсы
        cap.release()
        if out:
            out.release()

        if output_path:
            print(f"Видео обработано и сохранено в {output_path}")

        # Добавляем вывод итоговой информации
        if matches:
            print(f"ИТОГ: Объект найден на видео! Обнаружен в {len(matches)} кадрах из {processed_count} обработанных.")
        else:
            print("ИТОГ: Объект НЕ найден на видео!")

        return matches, scores

    def visualize_results(self, video_path, target_image_path, additional_images=None, output_image_path=None,
                          threshold=0.85, sample_rate=10):
        """
        Визуализация результатов обнаружения объекта с опциональными дополнительными изображениями.
        Args:
            video_path (str): Путь к видео.
            target_image_path (str): Путь к основному изображению целевого объекта.
            additional_images (list, optional): Список путей к дополнительным изображениям объекта.
            output_image_path (str, optional): Путь для сохранения изображения с результатами.
            threshold (float, optional): Порог сходства для обнаружения объекта.
            sample_rate (int, optional): Частота выборки кадров из видео.
        """
        # Собираем все изображения в один список
        all_image_paths = [target_image_path]
        if additional_images:
            all_image_paths.extend(additional_images)

        # Получаем индексы кадров с обнаруженным объектом и сходство для всех кадров
        matches, scores = self.process_video(
            video_path,
            target_image_path,
            additional_images=additional_images,
            output_path=None,
            threshold=threshold,
            sample_rate=sample_rate
        )

        # Извлекаем кадры с обнаруженным объектом
        frames_with_objects = []
        if matches:
            cap = cv2.VideoCapture(video_path)
            for idx, img_idx in matches[:min(5, len(matches))]:
                cap.set(cv2.CAP_PROP_POS_FRAMES, idx * sample_rate)
                ret, frame = cap.read()
                if ret:
                    frame = cv2.cvtColor(frame, cv2.COLOR_BGR2RGB)
                    frames_with_objects.append((idx, img_idx, frame))
            cap.release()

        # Создаем график
        plt.figure(figsize=(15, 10))

        # Отображаем график сходства
        plt.subplot(2, 1, 1)
        plt.plot(scores)
        plt.axhline(y=threshold, color='r', linestyle='--', label=f'Порог ({threshold})')
        plt.xlabel('Номер кадра')
        plt.ylabel('Сходство')
        plt.title(f'Сходство по кадрам (обнаружено объектов: {len(matches)})')
        plt.legend()
        plt.grid(True)

        # Отображаем целевые изображения и найденные кадры
        if frames_with_objects:
            # Загружаем целевые изображения
            target_images = []
            for path in all_image_paths:
                img = cv2.imread(path)
                img = cv2.cvtColor(img, cv2.COLOR_BGR2RGB)
                target_images.append(img)

            # Отображаем целевые изображения в верхнем ряду
            plt.subplot(2, len(target_images) + len(frames_with_objects), 1)
            plt.imshow(target_images[0])
            plt.title('Целевой объект')
            plt.axis('off')

            for i, img in enumerate(target_images[1:]):
                plt.subplot(2, len(target_images) + len(frames_with_objects), i + 2)
                plt.imshow(img)
                plt.title(f'Доп. изображение {i+1}')
                plt.axis('off')

            # Отображаем найденные кадры
            for i, (idx, img_idx, frame) in enumerate(frames_with_objects):
                plt.subplot(2, len(target_images) + len(frames_with_objects), len(target_images) + i + 1)
                plt.imshow(frame)
                plt.title(f'Кадр {idx * sample_rate}, сходство с {img_idx + 1}')
                plt.axis('off')

        plt.tight_layout()

        # Сохраняем или показываем результат
        if output_image_path:
            plt.savefig(output_image_path)
            print(f"График сохранен в {output_image_path}")
        else:
            plt.show()

        plt.close()

        return matches, scores, frames_with_objects

    def visualize_results_multi_image(self, video_path, target_image_paths, output_image_path=None, threshold=0.85,
                                      sample_rate=10):
        """
        Визуализация результатов обнаружения объекта с несколькими изображениями и создание графика.
        Args:
            video_path (str): Путь к видео.
            target_image_paths (list): Список путей к изображениям целевого объекта.
            output_image_path (str, optional): Путь для сохранения изображения с результатами.
            threshold (float, optional): Порог сходства для обнаружения объекта.
            sample_rate (int, optional): Частота выборки кадров из видео.
        """
        if not target_image_paths:
            raise ValueError("Необходимо предоставить хотя бы одно изображение товара.")

        primary_image = target_image_paths[0]
        additional_images = target_image_paths[1:] if len(target_image_paths) > 1 else None

        # Вызываем основной метод визуализации
        matches, scores, frames = self.visualize_results(
            video_path,
            primary_image,
            additional_images=additional_images,
            output_image_path=output_image_path,
            threshold=threshold,
            sample_rate=sample_rate
        )

        return len(matches) > 0, scores, matches

    def analyze_multiple_products(self, video_path, product_images, output_dir=None, threshold=0.85, sample_rate=10):
        """
        Анализ видео на наличие нескольких продуктов.
        Args:
            video_path (str): Путь к видео.
            product_images (dict): Словарь с идентификаторами продуктов и списками путей к их изображениям.
            output_dir (str, optional): Директория для сохранения результатов.
            threshold (float, optional): Порог сходства для обнаружения объектов.
            sample_rate (int, optional): Частота выборки кадров из видео.
        Returns:
            dict: Словарь с результатами анализа для каждого продукта.
        """
        results = {}

        # Создаем директорию для результатов, если указана
        if output_dir and not os.path.exists(output_dir):
            os.makedirs(output_dir)

        # Для каждого продукта выполняем анализ
        for product_id, image_paths in product_images.items():
            print(f"\nАнализ продукта {product_id}...")

            # Создаем путь для сохранения графика
            chart_path = None
            if output_dir:
                chart_path = os.path.join(output_dir, f"{product_id}_chart.png")

            # Анализируем видео для текущего продукта
            detected, scores, matches = self.visualize_results_multi_image(
                video_path=video_path,
                target_image_paths=image_paths,
                output_image_path=chart_path,
                threshold=threshold,
                sample_rate=sample_rate
            )

            # Формируем результат
            results[product_id] = {
                "detected": detected,
                "match_count": len(matches),
                "max_similarity": max(scores) if scores else 0,
                "avg_similarity": sum(scores) / len(scores) if scores else 0,
                "chart_path": chart_path
            }

            if detected:
                print(f"✅ Продукт {product_id} НАЙДЕН на видео!")
                print(f"   - Количество совпадений: {len(matches)}")
                print(f"   - Максимальное сходство: {max(scores):.4f}")
                print(f"   - Среднее сходство: {sum(scores) / len(scores):.4f}")
            else:
                print(f"❌ Продукт {product_id} НЕ НАЙДЕН на видео.")
                if scores:
                    print(f"   - Максимальное сходство: {max(scores):.4f} (ниже порога {threshold})")

            if chart_path:
                print(f"   - График сохранен в {chart_path}")

        return results

    def create_summary_report(self, video_path, product_images, output_path, threshold=0.85, sample_rate=10):
        """
        Создание сводного отчета по анализу нескольких продуктов.
        Args:
            video_path (str): Путь к видео.
            product_images (dict): Словарь с идентификаторами продуктов и списками путей к их изображениям.
            output_path (str): Путь для сохранения отчета.
            threshold (float, optional): Порог сходства для обнаружения объектов.
            sample_rate (int, optional): Частота выборки кадров из видео.
        """
        # Анализируем все продукты
        results = self.analyze_multiple_products(
            video_path=video_path,
            product_images=product_images,
            threshold=threshold,
            sample_rate=sample_rate
        )

        # Создаем директорию для результатов, если необходимо
        output_dir = os.path.dirname(output_path)
        if output_dir and not os.path.exists(output_dir):
            os.makedirs(output_dir)

        # Создаем сводный отчет
        with open(output_path, 'w', encoding='utf-8') as f:
            f.write("# Отчет по анализу видео на наличие товаров\n\n")
            f.write(f"Дата анализа: {datetime.datetime.now().strftime('%Y-%m-%d %H:%M:%S')}\n")
            f.write(f"Видео: {os.path.basename(video_path)}\n")
            f.write(f"Порог обнаружения: {threshold}\n")
            f.write(f"Частота выборки кадров: каждый {sample_rate}-й\n\n")

            f.write("## Сводка результатов\n\n")
            f.write("| Товар | Обнаружен | Количество совпадений | Макс. сходство | Сред. сходство |\n")
            f.write("|-------|-----------|------------------------|----------------|---------------|\n")

            for product_id, result in results.items():
                detected = "✅" if result["detected"] else "❌"
                f.write(f"| {product_id} | {detected} | {result['match_count']} | {result['max_similarity']:.4f} | "
                        f"{result['avg_similarity']:.4f} |\n")

            f.write("\n## Детальные результаты\n\n")
            for product_id, result in results.items():
                f.write(f"### Товар {product_id}\n\n")
                f.write(f"- **Обнаружен:** {'Да' if result['detected'] else 'Нет'}\n")
                f.write(f"- **Количество совпадений:** {result['match_count']}\n")
                f.write(f"- **Максимальное сходство:** {result['max_similarity']:.4f}\n")
                f.write(f"- **Среднее сходство:** {result['avg_similarity']:.4f}\n\n")

        print(f"Сводный отчет сохранен в {output_path}")

    def visualize_products_separately(self, video_path, product_images, output_dir, threshold=0.85, sample_rate=10):
        """
        Визуализация результатов по каждому продукту по отдельности.
        Args:
            video_path (str): Путь к видео.
            product_images (dict): Словарь с идентификаторами продуктов и списками путей к их изображениям.
            output_dir (str): Директория для сохранения результатов.
            threshold (float, optional): Порог сходства для обнаружения объектов.
            sample_rate (int, optional): Частота выборки кадров из видео.
        """
        # Создаем директорию для результатов
        if not os.path.exists(output_dir):
            os.makedirs(output_dir)

        # Для каждого продукта создаем отдельный график
        for product_id, image_paths in product_images.items():
            print(f"\nВизуализация продукта {product_id}...")
            chart_path = os.path.join(output_dir, f"{product_id}_chart.png")

            self.visualize_results_multi_image(
                video_path=video_path,
                target_image_paths=image_paths,
                output_image_path=chart_path,
                threshold=threshold,
                sample_rate=sample_rate
            )

            print(f"График для товара {product_id} сохранен в {chart_path}")

        # Создаем сводный график
        self._create_combined_chart(video_path, product_images, output_dir, threshold, sample_rate)

    def _create_combined_chart(self, video_path, product_images, output_dir, threshold=0.85, sample_rate=10):
        """
        Создание сводного графика сравнения всех продуктов.
        Args:
            video_path (str): Путь к видео.
            product_images (dict): Словарь с идентификаторами продуктов и списками путей к их изображениям.
            output_dir (str): Директория для сохранения результатов.
            threshold (float, optional): Порог сходства для обнаружения объектов.
            sample_rate (int, optional): Частота выборки кадров из видео.
        """
        # Считаем общую длительность видео
        cap = cv2.VideoCapture(video_path)
        total_frames = int(cap.get(cv2.CAP_PROP_FRAME_COUNT))
        fps = cap.get(cv2.CAP_PROP_FPS)
        cap.release()

        # Рассчитываем число кадров для анализа
        total_processed_frames = total_frames // sample_rate

        plt.figure(figsize=(15, 10))
        plt.subplot(1, 1, 1)

        # Создаем график для каждого товара
        all_scores = {}
        line_styles = ['-', '--', '-.', ':']
        colors = ['blue', 'green', 'red', 'purple', 'orange', 'brown', 'pink', 'gray']

        for idx, (product_id, image_paths) in enumerate(product_images.items()):
            print(f"Анализируем товар {product_id} для сводного графика...")

            # Используем только первое изображение каждого товара для простоты
            primary_image = image_paths[0]
            additional_images = image_paths[1:] if len(image_paths) > 1 else None

            # Получаем оценки сходства для данного товара
            _, scores = self.process_video(
                video_path,
                primary_image,
                additional_images=additional_images,
                threshold=threshold,
                sample_rate=sample_rate
            )

            all_scores[product_id] = scores

            # Отображаем график для данного товара
            line_style = line_styles[idx % len(line_styles)]
            color = colors[idx % len(colors)]
            plt.plot(scores, linestyle=line_style, color=color, label=f'Товар {product_id}')

        # Добавляем порог
        plt.axhline(y=threshold, color='r', linestyle='--', label=f'Порог ({threshold})')

        # Оформляем график
        plt.xlabel('Номер кадра')
        plt.ylabel('Сходство')
        plt.title('Сравнение сходства товаров по кадрам')
        plt.legend(loc='upper right')
        plt.grid(True)

        # Добавляем метки времени на оси X
        seconds_labels = [f"{int((i * sample_rate) / fps // 60)}:{int((i * sample_rate) / fps % 60):02d}"
                         for i in range(0, total_processed_frames, total_processed_frames // 10)]
        plt.xticks(range(0, total_processed_frames, total_processed_frames // 10), seconds_labels, rotation=45)

        # Сохраняем график
        combined_chart_path = os.path.join(output_dir, "combined_chart.png")
        plt.tight_layout()
        plt.savefig(combined_chart_path)
        plt.close()

        print(f"Сводный график сохранен в {combined_chart_path}")


def main():
    # Параметры
    model_path = "models/ssl_model_epoch_80.pth"
    video_path = "vid_pic/WB_IMG_9_2.mp4"
    
    # Подготавливаем данные для демонстрации множественного анализа
    product_images = {
        "Куртка_1": ["img/Куртка_1.jpeg"],
        "Тоник_1": ["img/Тоник_1.jpeg"],
        "Футболка_1": ["img/Футболка_1.jpeg"]
    }
    
    # Инициализируем детектор объектов
    detector = ObjectDetector(model_path)
    
    # Создаем директорию для результатов, если её нет
    if not os.path.exists("results"):
        os.makedirs("results")
    
    if not os.path.exists("results_individual"):
        os.makedirs("results_individual")
    
    # 1. Визуализация для отдельных товаров
    detector.visualize_products_separately(
        video_path=video_path,
        product_images=product_images,
        output_dir="results_individual",
        threshold=0.85,
        sample_rate=10
    )
    
    # 2. Создание сводного отчета
    detector.create_summary_report(
        video_path=video_path,
        product_images=product_images,
        output_path="results/summary_report.md",
        threshold=0.85,
        sample_rate=10
    )


if __name__ == "__main__":
    main()