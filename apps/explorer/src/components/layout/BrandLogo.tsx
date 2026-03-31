'use client';

import React from 'react';
import { useTranslation } from 'react-i18next';
import { motion } from 'motion/react';

export const BrandLogo: React.FC = () => {
  const { t } = useTranslation();

  return (
    <motion.div
      whileHover={{ rotate: 5, scale: 1.1 }}
      className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center shadow-lg shadow-blue-200"
    >
      <svg
        className="w-6 h-6 text-white"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
        xmlns="http://www.w3.org/2000/svg"
        aria-label={t('landingPage.header.logo')}
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M13 10V3L4 14h7v7l9-11h-7z"
        />
      </svg>
    </motion.div>
  );
};
