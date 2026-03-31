'use client';

import React from 'react';
import { useTranslation } from 'react-i18next';

export const Footer: React.FC = () => {
  const { t } = useTranslation();

  return (
    <footer className="bg-gray-900 text-white py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div>
            <span className="text-xl font-bold text-white">
              {t('landingPage.header.brand')}
              <span className="text-blue-400 ml-1">{t('landingPage.header.ai')}</span>
            </span>
            <p className="mt-4 text-gray-400 text-sm">
              {t('landingPage.footer.tagline')}
            </p>
          </div>
          <div className="flex flex-col space-y-4">
            <h3 className="text-sm font-semibold text-white uppercase tracking-wider">Company</h3>
            <a href="#" className="text-gray-400 hover:text-white transition-colors text-sm">
              {t('landingPage.footer.links.privacy')}
            </a>
            <a href="#" className="text-gray-400 hover:text-white transition-colors text-sm">
              {t('landingPage.footer.links.terms')}
            </a>
            <a href="#" className="text-gray-400 hover:text-white transition-colors text-sm">
              {t('landingPage.footer.links.contact')}
            </a>
          </div>
          <div className="flex flex-col space-y-4">
            <h3 className="text-sm font-semibold text-white uppercase tracking-wider">Connect</h3>
            <div className="flex space-x-4">
              {/* Social icons would go here */}
            </div>
          </div>
        </div>
        <div className="mt-12 pt-8 border-t border-gray-800 text-center">
          <p className="text-gray-400 text-xs">
            {t('landingPage.footer.copyright')}
          </p>
        </div>
      </div>
    </footer>
  );
};
