'use client';

import React from 'react';
import { useTranslation } from 'react-i18next';
import { motion } from 'motion/react';
import { Header } from '../components/layout/Header';
import { Footer } from '../components/layout/Footer';

export default function LandingPage() {
  const { t } = useTranslation();

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <main className="pt-16">
        {/* Hero Section */}
        <section id="home" className="relative py-24 bg-white overflow-hidden">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center">
              <motion.h1
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8 }}
                className="text-5xl font-extrabold text-gray-900 tracking-tight sm:text-6xl"
              >
                {t('landingPage.body.hero.title')}
              </motion.h1>
              <motion.p
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.2 }}
                className="mt-6 text-xl text-gray-500 max-w-2xl mx-auto"
              >
                {t('landingPage.body.hero.subtitle')}
              </motion.p>
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.4 }}
                className="mt-10 flex justify-center space-x-4"
              >
                <button className="bg-blue-600 text-white px-8 py-3 rounded-full text-lg font-semibold hover:bg-blue-700 transition-colors">
                  {t('landingPage.body.hero.cta')}
                </button>
              </motion.div>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section id="features" className="py-24 bg-gray-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <h2 className="text-3xl font-bold text-gray-900">{t('landingPage.body.features.title')}</h2>
              <p className="mt-4 text-gray-500">{t('landingPage.body.features.description')}</p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
              {/* Features would be mapped here */}
              <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100">
                <h3 className="text-xl font-semibold text-gray-900">{t('landingPage.body.features.items.0.title')}</h3>
                <p className="mt-4 text-gray-500 text-sm">{t('landingPage.body.features.items.0.description')}</p>
              </div>
              <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100">
                <h3 className="text-xl font-semibold text-gray-900">{t('landingPage.body.features.items.1.title')}</h3>
                <p className="mt-4 text-gray-500 text-sm">{t('landingPage.body.features.items.1.description')}</p>
              </div>
              <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100">
                <h3 className="text-xl font-semibold text-gray-900">{t('landingPage.body.features.items.2.title')}</h3>
                <p className="mt-4 text-gray-500 text-sm">{t('landingPage.body.features.items.2.description')}</p>
              </div>
            </div>
          </div>
        </section>

        {/* Workflow Section */}
        <section id="workflow" className="py-24 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <h2 className="text-3xl font-bold text-gray-900">{t('landingPage.body.workflow.title')}</h2>
              <p className="mt-4 text-gray-500">{t('landingPage.body.workflow.description')}</p>
            </div>
            <div className="flex flex-col md:flex-row justify-between items-center space-y-12 md:space-y-0 md:space-x-8">
              <div className="text-center max-w-xs">
                <div className="w-12 h-12 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center mx-auto mb-4 font-bold text-lg">1</div>
                <h3 className="text-lg font-semibold text-gray-900">{t('landingPage.body.workflow.steps.0.title')}</h3>
                <p className="mt-2 text-gray-500 text-sm">{t('landingPage.body.workflow.steps.0.description')}</p>
              </div>
              <div className="text-center max-w-xs">
                <div className="w-12 h-12 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center mx-auto mb-4 font-bold text-lg">2</div>
                <h3 className="text-lg font-semibold text-gray-900">{t('landingPage.body.workflow.steps.1.title')}</h3>
                <p className="mt-2 text-gray-500 text-sm">{t('landingPage.body.workflow.steps.1.description')}</p>
              </div>
              <div className="text-center max-w-xs">
                <div className="w-12 h-12 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center mx-auto mb-4 font-bold text-lg">3</div>
                <h3 className="text-lg font-semibold text-gray-900">{t('landingPage.body.workflow.steps.2.title')}</h3>
                <p className="mt-2 text-gray-500 text-sm">{t('landingPage.body.workflow.steps.2.description')}</p>
              </div>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-24 bg-blue-600 text-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h2 className="text-4xl font-bold mb-6">{t('landingPage.body.cta.title')}</h2>
            <p className="text-xl text-blue-100 mb-10 max-w-2xl mx-auto">
              {t('landingPage.body.cta.subtitle')}
            </p>
            <button className="bg-white text-blue-600 px-10 py-4 rounded-full text-lg font-bold hover:bg-blue-50 transition-colors shadow-lg">
              {t('landingPage.body.cta.button')}
            </button>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}
