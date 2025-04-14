import os
import sys
import json
import uuid
import shutil
import logging
import traceback
from typing import Dict, List, Optional, Union, Any
from datetime import datetime

logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s',
    handlers=[
        logging.StreamHandler(),
        logging.FileHandler('server.log')
    ]
)
logger = logging.getLogger(__name__)

logger.info("Starting WB Analyzer API server")

import matplotlib
matplotlib.use('Agg') 

import cv2
import numpy as np
import torch
from PIL import Image
from flask import Flask, request, jsonify, send_from_directory, send_file
from flask_cors import CORS
from werkzeug.utils import secure_filename

sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
from ml.test import ObjectDetector, SSLModel

app = Flask(__name__, static_folder='build')
CORS(app) 

@app.route('/api/results/<result_id>', methods=['OPTIONS'])
def options_results(result_id):
    response = jsonify({})
    response.headers['Access-Control-Allow-Origin'] = '*'
    response.headers['Access-Control-Allow-Methods'] = 'GET, OPTIONS'
    response.headers['Access-Control-Allow-Headers'] = 'Content-Type, Authorization'
    response.headers['Access-Control-Max-Age'] = '3600'
    return response


MODEL_PATH = './models/ssl_model_epoch_80.pth'
UPLOAD_FOLDER = 'uploads'
RESULTS_FOLDER = 'api_results'
ALLOWED_VIDEO_EXTENSIONS = {'mp4', 'avi', 'mov', 'webm'}
ALLOWED_IMAGE_EXTENSIONS = {'jpg', 'jpeg', 'png', 'webp'}

os.makedirs(UPLOAD_FOLDER, exist_ok=True)
os.makedirs(RESULTS_FOLDER, exist_ok=True)
os.makedirs(os.path.join(UPLOAD_FOLDER, 'videos'), exist_ok=True)
os.makedirs(os.path.join(UPLOAD_FOLDER, 'images'), exist_ok=True)

analysis_results = {}

def allowed_file(filename: str, allowed_extensions: set) -> bool:
    return '.' in filename and filename.rsplit('.', 1)[1].lower() in allowed_extensions

@app.route('/api/analyze', methods=['POST'])
def analyze_video():
    if 'video' not in request.files:
        return jsonify({'error': 'Видео не найдено в запросе'}), 400
    
    video_file = request.files['video']
    if not video_file or not allowed_file(video_file.filename, ALLOWED_VIDEO_EXTENSIONS):
        return jsonify({'error': 'Недопустимый формат видео'}), 400
    
    analysis_id = str(uuid.uuid4())
    os.makedirs(os.path.join(RESULTS_FOLDER, analysis_id), exist_ok=True)
    
    video_filename = secure_filename(video_file.filename)
    video_path = os.path.join(UPLOAD_FOLDER, 'videos', f"{analysis_id}_{video_filename}")
    video_file.save(video_path)

    threshold = float(request.form.get('threshold', 0.85))
    sample_rate = int(request.form.get('sample_rate', 10))

    products = {}

    for key in request.files:
        if key.startswith('product_image_'):
            parts = key.split('_')
            if len(parts) >= 3:
                product_index = int(parts[2])
                image_index = int(parts[3]) if len(parts) >= 4 else 0
                
                product_image = request.files[key]
                if product_image and allowed_file(product_image.filename, ALLOWED_IMAGE_EXTENSIONS):
                    image_filename = secure_filename(product_image.filename)
                    product_id = f"product_{product_index}"

                    product_images_dir = os.path.join(UPLOAD_FOLDER, 'images', f"{analysis_id}_{product_id}")
                    os.makedirs(product_images_dir, exist_ok=True)
                    
                    image_path = os.path.join(product_images_dir, f"image_{image_index}_{image_filename}")
                    product_image.save(image_path)

                    if product_id not in products:
                        products[product_id] = {
                            'id': product_id,
                            'name': f"Товар {product_index + 1}",
                            'image_paths': []
                        }
                    
                    products[product_id]['image_paths'].append(image_path)
    
    product_list = list(products.values())
    
    if not product_list:
        return jsonify({'error': 'Не найдено изображений товаров для анализа'}), 400
    
    try:
        detector = ObjectDetector(MODEL_PATH)
        
        results = []
        video_duration = 0
        
        for product in product_list:
            product_result_dir = os.path.join(RESULTS_FOLDER, analysis_id, product['id'])
            os.makedirs(product_result_dir, exist_ok=True)
            
            output_video_path = os.path.join(product_result_dir, f"result_{product['id']}.mp4")
            
            chart_path = os.path.join(product_result_dir, f"chart_{product['id']}.png")
            
            try:
                frames, similarity_scores, matches = detector.visualize_results_multi_image(
                    video_path=video_path,
                    target_image_paths=product['image_paths'],
                    output_image_path=chart_path,
                    threshold=threshold,
                    sample_rate=sample_rate
                )
                
                detected = len(matches) > 0
                
                if not detected and similarity_scores:
                    max_similarity = max(similarity_scores)
                    if max_similarity >= threshold:
                        detected = True
                        print(f"Товар {product['name']} обнаружен по максимальному значению сходства: {max_similarity}")
                
                if video_duration == 0:
                    cap = cv2.VideoCapture(video_path)
                    fps = cap.get(cv2.CAP_PROP_FPS)
                    total_frames = int(cap.get(cv2.CAP_PROP_FRAME_COUNT))
                    video_duration = int(total_frames / fps)
                    cap.release()
                
                product_image_urls = []
                
                for i, img_path in enumerate(product['image_paths']):
                    dest_path = os.path.join(product_result_dir, f"product_image_{i}.jpg")
                    image = Image.open(img_path)
                    image.save(dest_path)
                    product_image_urls.append(f"/static/{analysis_id}/{product['id']}/product_image_{i}.jpg")
                
                product_result = {
                    'id': product['id'],
                    'productName': product['name'],
                    'productImageUrls': product_image_urls,
                    'chartUrl': f"/static/{analysis_id}/{product['id']}/chart_{product['id']}.png",
                    'detected': detected,
                    'matchCount': len(matches),
                    'maxSimilarity': max(similarity_scores) if similarity_scores else 0,
                    'avgSimilarity': sum(similarity_scores) / len(similarity_scores) if similarity_scores else 0
                }
                
                results.append(product_result)
                
                summary_dest_path = os.path.join(RESULTS_FOLDER, analysis_id, f"chart_{product['id']}.png")
                shutil.copy(chart_path, summary_dest_path)
                
                logger.info(f"Завершен анализ товара {product['name']}, обнаружен: {detected}")
                
            except Exception as e:
                error_message = f"Ошибка при анализе товара {product['name']}: {str(e)}"
                logger.error(error_message)
                logger.error(traceback.format_exc())
                
                product_result = {
                    'id': product['id'],
                    'productName': product['name'],
                    'error': error_message
                }
                results.append(product_result)
        
        analysis_result = {
            'id': analysis_id,
            'timestamp': datetime.now().isoformat(),
            'videoFileName': video_filename,
            'videoUrl': f"/video/{analysis_id}",
            'videoDuration': video_duration,
            'threshold': threshold,
            'sampleRate': sample_rate,
            'products': results
        }
        
        analysis_results[analysis_id] = analysis_result
        
        result_json_path = os.path.join(RESULTS_FOLDER, analysis_id, 'result.json')
        with open(result_json_path, 'w', encoding='utf-8') as f:
            json.dump(analysis_result, f, ensure_ascii=False, indent=2)
        
        client_response = {
            'analysisId': analysis_id,
            'message': f'Анализ видео завершен. Проанализировано {len(results)} товаров.',
            'status': 'success'
        }
        
        logger.info(f"Анализ видео {video_filename} завершен успешно, ID: {analysis_id}")
        return jsonify(client_response), 200
        
    except Exception as e:
        error_message = f"Ошибка при анализе видео: {str(e)}"
        logger.error(error_message)
        logger.error(traceback.format_exc())
        
        try:
            if os.path.exists(video_path):
                os.remove(video_path)
            
            result_dir = os.path.join(RESULTS_FOLDER, analysis_id)
            if os.path.exists(result_dir):
                shutil.rmtree(result_dir)
                
        except Exception as cleanup_error:
            logger.error(f"Ошибка при очистке временных файлов: {str(cleanup_error)}")
        
        return jsonify({'error': error_message}), 500

@app.route('/api/results/<result_id>', methods=['GET'])
def get_result(result_id):
    if result_id in analysis_results:
        return jsonify(analysis_results[result_id]), 200
    
    result_json_path = os.path.join(RESULTS_FOLDER, result_id, 'result.json')
    if os.path.exists(result_json_path):
        try:
            with open(result_json_path, 'r', encoding='utf-8') as f:
                result_data = json.load(f)
                
                analysis_results[result_id] = result_data
                
                return jsonify(result_data), 200
        except Exception as e:
            error_message = f"Ошибка при чтении результатов анализа: {str(e)}"
            logger.error(error_message)
            return jsonify({'error': error_message}), 500
    
    return jsonify({'error': 'Результаты анализа не найдены'}), 404

@app.route('/api/cancel-analysis/<analysis_id>', methods=['POST'])
def cancel_analysis(analysis_id):
    try:
        video_pattern = f"{analysis_id}_*"
        for file in os.listdir(os.path.join(UPLOAD_FOLDER, 'videos')):
            if file.startswith(f"{analysis_id}_"):
                os.remove(os.path.join(UPLOAD_FOLDER, 'videos', file))
        
        for dir_name in os.listdir(os.path.join(UPLOAD_FOLDER, 'images')):
            if dir_name.startswith(f"{analysis_id}_"):
                shutil.rmtree(os.path.join(UPLOAD_FOLDER, 'images', dir_name))
        
        result_dir = os.path.join(RESULTS_FOLDER, analysis_id)
        if os.path.exists(result_dir):
            shutil.rmtree(result_dir)
        
        if analysis_id in analysis_results:
            del analysis_results[analysis_id]
        
        return jsonify({'message': 'Анализ успешно отменен'}), 200
    except Exception as e:
        error_message = f"Ошибка при отмене анализа: {str(e)}"
        logger.error(error_message)
        return jsonify({'error': error_message}), 500

@app.route('/api/results', methods=['GET'])
def get_results():
    all_results = []
    
    for result_id in os.listdir(RESULTS_FOLDER):
        result_json_path = os.path.join(RESULTS_FOLDER, result_id, 'result.json')
        
        if not os.path.isdir(os.path.join(RESULTS_FOLDER, result_id)) or result_id == '.gitkeep':
            continue
            
        if os.path.exists(result_json_path):
            try:
                with open(result_json_path, 'r', encoding='utf-8') as f:
                    result_data = json.load(f)
                    
                    summary = {
                        'id': result_data.get('id'),
                        'timestamp': result_data.get('timestamp'),
                        'videoFileName': result_data.get('videoFileName'),
                        'productCount': len(result_data.get('products', [])),
                        'detectedCount': sum(1 for p in result_data.get('products', []) if p.get('detected', False))
                    }
                    all_results.append(summary)
            except Exception as e:
                logger.error(f"Ошибка при чтении данных анализа {result_id}: {str(e)}")
    
    all_results.sort(key=lambda x: x.get('timestamp', ''), reverse=True)
    
    return jsonify(all_results), 200

@app.route('/static/<path:filename>')
def serve_static(filename):
    parts = filename.split('/')
    if len(parts) >= 1:
        analysis_id = parts[0]
        if len(parts) >= 2:
            product_id = parts[1]
            if len(parts) >= 3:
                file_path = '/'.join(parts[2:])
                return send_from_directory(
                    os.path.join(RESULTS_FOLDER, analysis_id, product_id),
                    file_path
                )
        
        file_path = '/'.join(parts[1:])
        return send_from_directory(
            os.path.join(RESULTS_FOLDER, analysis_id),
            file_path
        )
    
    return jsonify({'error': 'Некорректный путь к статическому файлу'}), 400

@app.route('/api/is-model-available', methods=['GET'])
def is_model_available():
    if os.path.exists(MODEL_PATH):
        try:
            if os.path.getsize(MODEL_PATH) > 1000000:  # 1MB
                return jsonify({
                    'available': True, 
                    'message': 'Модель доступна',
                    'size': os.path.getsize(MODEL_PATH)
                }), 200
            else:
                return jsonify({
                    'available': False, 
                    'message': 'Файл модели слишком маленький, возможно, он поврежден',
                    'size': os.path.getsize(MODEL_PATH)
                }), 200
        except Exception as e:
            return jsonify({
                'available': False, 
                'message': f'Ошибка при проверке модели: {str(e)}',
                'error': str(e)
            }), 200
    else:
        return jsonify({
            'available': False, 
            'message': f'Файл модели не найден по пути {MODEL_PATH}'
        }), 200

@app.route('/api/system-info', methods=['GET'])
def system_info():
    try:
        info = {
            'python_version': sys.version,
            'cuda_available': torch.cuda.is_available(),
            'device_count': torch.cuda.device_count() if torch.cuda.is_available() else 0,
            'device_name': torch.cuda.get_device_name(0) if torch.cuda.is_available() and torch.cuda.device_count() > 0 else 'CPU',
            'platform': sys.platform,
            'model_path': MODEL_PATH,
            'model_exists': os.path.exists(MODEL_PATH),
            'model_size': os.path.getsize(MODEL_PATH) if os.path.exists(MODEL_PATH) else 0,
            'opencv_version': cv2.__version__,
            'torch_version': torch.__version__,
            'api_version': '1.0.0',
            'app_name': 'WB Analyzer'
        }
        return jsonify(info), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/video/<path:video_id>')
def serve_video(video_id):
    try:
        video_dir = os.path.join(UPLOAD_FOLDER, 'videos')
        for file in os.listdir(video_dir):
            if file.startswith(f"{video_id}_"):
                return send_from_directory(video_dir, file)
        
        return jsonify({'error': 'Видео не найдено'}), 404
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/upload-temp-image', methods=['POST'])
def upload_temp_image():
    if 'image' not in request.files:
        return jsonify({'error': 'Изображение не найдено в запросе'}), 400
    
    image_file = request.files['image']
    if not image_file or not allowed_file(image_file.filename, ALLOWED_IMAGE_EXTENSIONS):
        return jsonify({'error': 'Недопустимый формат изображения'}), 400
    
    temp_id = str(uuid.uuid4())
    
    temp_dir = os.path.join(UPLOAD_FOLDER, 'temp')
    os.makedirs(temp_dir, exist_ok=True)
    
    filename = secure_filename(image_file.filename)
    temp_path = os.path.join(temp_dir, f"{temp_id}_{filename}")
    image_file.save(temp_path)
    
    return jsonify({
        'tempId': temp_id,
        'imageUrl': f"/temp/{temp_id}_{filename}"
    }), 200

@app.route('/temp/<path:filename>')
def serve_temp_file(filename):
    temp_dir = os.path.join(UPLOAD_FOLDER, 'temp')
    return send_from_directory(temp_dir, filename)

@app.route('/api/analyze-test', methods=['POST'])
def analyze_test():
    try:
        if 'video' not in request.files:
            return jsonify({'error': 'Видео не найдено в запросе'}), 400
        
        video_file = request.files['video']
        if not video_file or not allowed_file(video_file.filename, ALLOWED_VIDEO_EXTENSIONS):
            return jsonify({'error': 'Недопустимый формат видео'}), 400
        
        product_count = 0
        product_images_count = 0
        
        for key in request.files:
            if key.startswith('product_image_'):
                parts = key.split('_')
                if len(parts) >= 3:
                    product_index = int(parts[2])
                    product_count = max(product_count, product_index + 1)
                    product_images_count += 1
        
        threshold = float(request.form.get('threshold', 0.85))
        sample_rate = int(request.form.get('sample_rate', 10))
        
        return jsonify({
            'message': 'Тестовая загрузка успешна',
            'videoName': video_file.filename,
            'videoSize': len(video_file.read()),
            'productCount': product_count,
            'productImagesCount': product_images_count,
            'threshold': threshold,
            'sampleRate': sample_rate,
            'test': True
        }), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/<path:path>', methods=['GET', 'POST', 'OPTIONS'])
def api_fallback(path):
    logger.warning(f"Попытка доступа к неизвестному API эндпоинту: {request.method} /api/{path}")
    return jsonify({'error': 'API эндпоинт не найден'}), 404

@app.route('/', defaults={'path': ''})
@app.route('/<path:path>')
def serve_react(path):
    if path.startswith('api/'):
        return jsonify({'error': 'Неверный путь API'}), 404
    
    static_file = os.path.join(app.static_folder, path)
    if os.path.isfile(static_file):
        return send_from_directory(app.static_folder, path)
    
    return send_from_directory(app.static_folder, 'index.html')

if __name__ == "__main__":
    if not os.path.exists(MODEL_PATH):
        logger.warning(f"Модель не найдена по пути {MODEL_PATH}. Некоторые функции будут недоступны.")
        print(f"ВНИМАНИЕ: Модель не найдена. Пожалуйста, убедитесь, что файл модели доступен по пути: {MODEL_PATH}")
    
    app.run(host='0.0.0.0', port=5000, debug=True)
