import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';

const Header: React.FC = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const location = useLocation();
  
  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };
  
  const isActive = (path: string) => {
    return location.pathname === path;
  };

  return (
    <header className="bg-white border-b border-gray-200 shadow-sm sticky top-0 z-50">
      <div className="wb-container">
        <div className="flex items-center justify-between py-4">
          <Link to="/" className="flex items-center">
            <span className="text-wb-purple font-bold text-3xl mr-2">WB</span>
            <span className="text-wb-text font-medium text-lg hidden sm:inline-block">Анализатор</span>
          </Link>
          
          <nav className="hidden md:flex items-center space-x-8">
            <Link 
              to="/" 
              className={`font-medium text-sm ${isActive('/') 
                ? 'text-wb-purple border-b-2 border-wb-purple' 
                : 'text-wb-text hover:text-wb-purple'}`}
            >
              Главная
            </Link>
            <Link 
              to="/analyze" 
              className={`font-medium text-sm ${isActive('/analyze') 
                ? 'text-wb-purple border-b-2 border-wb-purple' 
                : 'text-wb-text hover:text-wb-purple'}`}
            >
              Анализ видео
            </Link>
            <Link 
              to="/about" 
              className={`font-medium text-sm ${isActive('/about') 
                ? 'text-wb-purple border-b-2 border-wb-purple' 
                : 'text-wb-text hover:text-wb-purple'}`}
            >
              О проекте
            </Link>
          </nav>
          
          <div className="md:hidden">
            <button 
              className="text-wb-text hover:text-wb-purple focus:outline-none" 
              onClick={toggleMenu}
              aria-label="Открыть меню"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
          </div>
        </div>
      </div>
      
      {isMenuOpen && (
        <div className="md:hidden bg-white border-t border-gray-200 py-2 px-4 shadow-md">
          <nav className="flex flex-col space-y-3 py-3">
            <Link 
              to="/" 
              className={`font-medium text-sm py-2 px-3 rounded-md ${isActive('/') 
                ? 'bg-wb-gray text-wb-purple' 
                : 'text-wb-text hover:bg-gray-100'}`}
              onClick={() => setIsMenuOpen(false)}
            >
              Главная
            </Link>
            <Link 
              to="/analyze" 
              className={`font-medium text-sm py-2 px-3 rounded-md ${isActive('/analyze') 
                ? 'bg-wb-gray text-wb-purple' 
                : 'text-wb-text hover:bg-gray-100'}`}
              onClick={() => setIsMenuOpen(false)}
            >
              Анализ видео
            </Link>
            <Link 
              to="/about" 
              className={`font-medium text-sm py-2 px-3 rounded-md ${isActive('/about') 
                ? 'bg-wb-gray text-wb-purple' 
                : 'text-wb-text hover:bg-gray-100'}`}
              onClick={() => setIsMenuOpen(false)}
            >
              О проекте
            </Link>
          </nav>
        </div>
      )}
      
      <div className="wb-gradient-bg py-1 text-center text-xs text-white">
        Разработано FBX team © {new Date().getFullYear()}
      </div>
    </header>
  );
};

export default Header;
