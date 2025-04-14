import React from 'react';
import { Link } from 'react-router-dom';

const Footer: React.FC = () => {
  const currentYear = new Date().getFullYear();
  
  return (
    <footer className="bg-white border-t border-gray-200 pt-12 pb-6">
      <div className="wb-container">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
          <div>
            <div className="flex items-center mb-4">
              <span className="text-wb-purple font-bold text-2xl mr-2">WB</span>
              <span className="text-wb-text font-medium text-lg">Анализатор</span>
            </div>
            <p className="text-wb-text text-sm mb-6 max-w-md">
              Инструмент для анализа наличия товаров на видео с использованием 
              технологий самообучающегося искусственного интеллекта.
            </p>
            <p className="text-wb-purple font-medium text-sm">
              Разработано FBX team
            </p>
          </div>
          
          <div>
            <h3 className="text-wb-purple font-bold text-lg mb-5">Разделы</h3>
            <ul className="space-y-3">
              <li>
                <Link to="/" className="text-wb-text hover:text-wb-purple transition-colors text-sm flex items-center">
                  <svg className="w-4 h-4 mr-2 text-wb-purple" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                    <path d="M10.707 2.293a1 1 0 00-1.414 0l-7 7a1 1 0 001.414 1.414L4 10.414V17a1 1 0 001 1h2a1 1 0 001-1v-2a1 1 0 011-1h2a1 1 0 011 1v2a1 1 0 001 1h2a1 1 0 001-1v-6.586l.293.293a1 1 0 001.414-1.414l-7-7z" />
                  </svg>
                  Главная
                </Link>
              </li>
              <li>
                <Link to="/analyze" className="text-wb-text hover:text-wb-purple transition-colors text-sm flex items-center">
                  <svg className="w-4 h-4 mr-2 text-wb-purple" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                    <path d="M2 6a2 2 0 012-2h6a2 2 0 012 2v8a2 2 0 01-2 2H4a2 2 0 01-2-2V6zM14.553 7.106A1 1 0 0014 8v4a1 1 0 00.553.894l2 1A1 1 0 0018 13V7a1 1 0 00-1.447-.894l-2 1z" />
                  </svg>
                  Анализ видео
                </Link>
              </li>
              <li>
                <Link to="/about" className="text-wb-text hover:text-wb-purple transition-colors text-sm flex items-center">
                  <svg className="w-4 h-4 mr-2 text-wb-purple" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                  </svg>
                  О проекте
                </Link>
              </li>
            </ul>
          </div>
          
          <div>
            <h3 className="text-wb-purple font-bold text-lg mb-5">Контакты</h3>
            <ul className="space-y-3">
              <li>
                <a 
                  href="https://github.com/Wijerty/wb-analyzer-ui" 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  className="text-wb-text hover:text-wb-purple transition-colors text-sm flex items-center"
                >
                  <svg className="w-4 h-4 mr-2 text-wb-purple" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M12 0C5.376 0 0 5.376 0 12s5.376 12 12 12 12-5.376 12-12S18.624 0 12 0zm5.568 8.16c-.18 1.896-.96 6.504-1.356 8.628-.168.9-.504 1.2-.816 1.236-.696.06-1.224-.456-1.896-.9-1.056-.696-1.656-1.128-2.676-1.8-1.188-.78-.42-1.212.264-1.908.18-.18 3.252-2.976 3.312-3.228.007-.03.013-.15-.056-.212s-.174-.03-.249-.018c-.106.018-1.8 1.14-5.082 3.366-.48.33-.915.492-1.304.48-.429-.012-1.254-.24-1.878-.444-.756-.24-1.356-.372-1.302-.792.028-.216.325-.432.888-.648 3.469-1.524 5.796-2.532 6.978-3.024 3.312-1.392 4.008-1.632 4.459-1.632.102 0 .336.024.484.144.126.102.162.246.173.342.011.096.019.456-.001.72z"/>
                  </svg>
                  GitHub
                </a>
              </li>
            </ul>
          </div>
        </div>
        
        <div className="border-t border-gray-200 mt-10 pt-6 text-center">
          <p className="text-sm text-wb-text">
            © {currentYear} WB Анализатор by FBX Team. Все права защищены.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;