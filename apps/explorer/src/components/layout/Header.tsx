'use client';

import React from 'react';
import { useTranslation } from 'react-i18next';
import { motion } from 'motion/react';
import { BrandLogo } from './BrandLogo';
import i18n from '../../lib/i18next-config';

export const Header: React.FC = () => {
  const { t } = useTranslation();

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-md border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center">
            <BrandLogo />
            <div className="ml-2 flex flex-col">
              <span className="text-xl font-bold text-gray-900 leading-none">
                {t('landingPage.header.brand')}
                <span className="text-blue-600 ml-1">{t('landingPage.header.ai')}</span>
              </span>
              <span className="text-[10px] uppercase tracking-widest text-gray-500 font-medium">
                {t('landingPage.header.journeySynthesized')}
              </span>
            </div>
          </div>
          <nav className="hidden md:flex space-x-8">
            <a href="#home" className="text-sm font-medium text-gray-700 hover:text-blue-600 transition-colors">
              {t('landingPage.header.links.home')}
            </a>
            <a href="#features" className="text-sm font-medium text-gray-700 hover:text-blue-600 transition-colors">
              {t('landingPage.header.links.features')}
            </a>
            <a href="#workflow" className="text-sm font-medium text-gray-700 hover:text-blue-600 transition-colors">
              {t('landingPage.header.links.workflow')}
            </a>
          </nav>
          <div className="flex items-center space-x-4">
            <select
              onChange={(e) => i18n?.changeLanguage(e.target.value)}
              value={i18n?.language || 'en'}
              className="text-sm border border-gray-300 rounded-md px-2 py-1 bg-white"
            >
              <option value="en">English</option>
              <option value="ar">العربية</option>
              <option value="es">Español</option>
              <option value="hi">हिन्दी</option>
              <option value="ja">日本語</option>
              <option value="fr">Français</option>
              <option value="de">Deutsch</option>
              <option value="it">Italiano</option>
              <option value="ko">한국어</option>
              <option value="pt">Português</option>
              <option value="ru">Русский</option>
              <option value="zh">中文</option>
              <option value="tr">Türkçe</option>
              <option value="vi">Tiếng Việt</option>
              <option value="th">ไทย</option>
              <option value="nl">Nederlands</option>
              <option value="pl">Polski</option>
              <option value="id">Bahasa Indonesia</option>
              <option value="ms">Bahasa Melayu</option>
            </select>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="bg-blue-600 text-white px-4 py-2 rounded-full text-sm font-semibold hover:bg-blue-700 transition-colors"
            >
              {t('landingPage.header.links.cta')}
            </motion.button>
          </div>
        </div>
      </div>
    </header>
  );
};
