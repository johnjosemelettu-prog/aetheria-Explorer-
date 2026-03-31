'use client'

import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'motion/react'
import { Button } from '@/components/ui/button'
import { X, ChevronRight, ChevronLeft, Sparkles, Target, Zap, Bot, Camera, Wand2 } from 'lucide-react'
import { cn } from '@/lib/utils'

interface TourStep {
  target: string
  title: string
  content: string
  icon: React.ElementType
  position: 'top' | 'bottom' | 'left' | 'right' | 'center'
}

import { useTranslation } from '@/lib/i18n'

export function OnboardingTour() {
  const { t } = useTranslation()
  const [currentStep, setCurrentStep] = useState(-1)
  const [isVisible, setIsVisible] = useState(false)
  const [targetRect, setTargetRect] = useState<DOMRect | null>(null)

  const TOUR_STEPS: TourStep[] = [
    {
      target: 'header-node',
      title: t('onboarding.steps.header.title'),
      content: t('onboarding.steps.header.content'),
      icon: Zap,
      position: 'bottom'
    },
    {
      target: 'season-pass',
      title: t('onboarding.steps.season.title'),
      content: t('onboarding.steps.season.content'),
      icon: Target,
      position: 'top'
    },
    {
      target: 'itinerary-node',
      title: t('onboarding.steps.itinerary.title'),
      content: t('onboarding.steps.itinerary.content'),
      icon: Bot,
      position: 'right'
    },
    {
      target: 'vision-hub',
      title: t('onboarding.steps.vision.title'),
      content: t('onboarding.steps.vision.content'),
      icon: Camera,
      position: 'left'
    },
    {
      target: 'postcard-studio',
      title: t('onboarding.steps.postcard.title'),
      content: t('onboarding.steps.postcard.content'),
      icon: Wand2,
      position: 'top'
    },
    {
      target: 'vibe-radar',
      title: t('onboarding.steps.vibe.title'),
      content: t('onboarding.steps.vibe.content'),
      icon: Sparkles,
      position: 'left'
    }
  ]

  useEffect(() => {
    const hasSeenTour = localStorage.getItem('aetheria_tour_seen')
    if (!hasSeenTour) {
      // Delay start for better UX
      const timer = setTimeout(() => {
        setIsVisible(true)
        setCurrentStep(0)
      }, 2000)
      return () => clearTimeout(timer)
    }
  }, [])

  useEffect(() => {
    if (currentStep >= 0 && currentStep < TOUR_STEPS.length) {
      const element = document.getElementById(TOUR_STEPS[currentStep].target)
      if (element) {
        element.scrollIntoView({ behavior: 'smooth', block: 'center' })
        // Small delay to allow scroll to finish
        setTimeout(() => {
          setTargetRect(element.getBoundingClientRect())
        }, 500)
      }
    } else {
      setTargetRect(null)
    }
  }, [currentStep])

  const handleNext = () => {
    if (currentStep < TOUR_STEPS.length - 1) {
      setCurrentStep(prev => prev + 1)
    } else {
      completeTour()
    }
  }

  const handlePrev = () => {
    if (currentStep > 0) {
      setCurrentStep(prev => prev - 1)
    }
  }

  const completeTour = () => {
    setIsVisible(false)
    localStorage.setItem('aetheria_tour_seen', 'true')
  }

  if (!isVisible || currentStep === -1) return null

  const step = TOUR_STEPS[currentStep]

  return (
    <div className="fixed inset-0 z-[100] pointer-events-none">
      {/* Backdrop with hole */}
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="absolute inset-0 bg-black/60 backdrop-blur-[2px] pointer-events-auto"
        style={{
          clipPath: targetRect ? `polygon(
            0% 0%, 
            0% 100%, 
            ${targetRect.left}px 100%, 
            ${targetRect.left}px ${targetRect.top}px, 
            ${targetRect.right}px ${targetRect.top}px, 
            ${targetRect.right}px ${targetRect.bottom}px, 
            ${targetRect.left}px ${targetRect.bottom}px, 
            ${targetRect.left}px 100%, 
            100% 100%, 
            100% 0%
          )` : 'none'
        }}
      />

      <AnimatePresence mode="wait">
        <motion.div
          key={currentStep}
          initial={{ opacity: 0, scale: 0.9, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9, y: 20 }}
          className={cn(
            "absolute pointer-events-auto w-[320px] bg-card border border-border shadow-2xl rounded-[2rem] p-8 z-[101]",
            !targetRect && "top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2"
          )}
          style={targetRect ? {
            top: step.position === 'bottom' ? targetRect.bottom + 20 : 
                 step.position === 'top' ? targetRect.top - 340 : 
                 step.position === 'center' ? targetRect.top + (targetRect.height / 2) - 150 :
                 targetRect.top,
            left: step.position === 'right' ? targetRect.right + 20 :
                  step.position === 'left' ? targetRect.left - 340 :
                  targetRect.left + (targetRect.width / 2) - 160
          } : {}}
        >
          <div className="flex items-start justify-between mb-6">
            <div className="p-3 rounded-2xl bg-primary/10 text-primary">
              <step.icon className="h-6 w-6" />
            </div>
            <Button 
              variant="ghost" 
              size="icon" 
              className="rounded-full h-8 w-8 hover:bg-muted"
              onClick={completeTour}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>

          <div className="space-y-3 mb-8">
            <h3 className="font-headline text-2xl font-black uppercase italic tracking-tighter text-foreground">
              {step.title}
            </h3>
            <p className="text-sm text-muted-foreground leading-relaxed font-medium">
              {step.content}
            </p>
          </div>

          <div className="flex items-center justify-between">
            <div className="flex gap-1.5">
              {TOUR_STEPS.map((_, idx) => (
                <div 
                  key={idx} 
                  className={cn(
                    "h-1.5 rounded-full transition-all duration-300",
                    idx === currentStep ? "w-6 bg-primary" : "w-1.5 bg-muted"
                  )}
                />
              ))}
            </div>

            <div className="flex gap-2">
              {currentStep > 0 && (
                <Button 
                  variant="outline" 
                  size="icon" 
                  className="rounded-full h-10 w-10 border-border"
                  onClick={handlePrev}
                >
                  <ChevronLeft className="h-4 w-4" />
                </Button>
              )}
              <Button 
                className="rounded-full h-10 px-6 bg-primary text-white font-black uppercase tracking-widest text-[10px]"
                onClick={handleNext}
              >
                {currentStep === TOUR_STEPS.length - 1 ? t('onboarding.finish') : t('onboarding.next')}
                <ChevronRight className="ml-2 h-4 w-4" />
              </Button>
            </div>
          </div>
        </motion.div>
      </AnimatePresence>
    </div>
  )
}
