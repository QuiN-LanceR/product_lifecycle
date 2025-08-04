"use client";
import React from 'react';
import { useTour } from '@/hooks/useTour';
import { TourOverlay } from './TourOverlay';

interface TourProviderProps {
  children: React.ReactNode;
}

export const TourProvider: React.FC<TourProviderProps> = ({ children }) => {
  const {
    isTourOpen,
    currentStep,
    tourSteps,
    nextStep,
    prevStep,
    skipTour,
    closeTour
  } = useTour();

  return (
    <>
      {children}
      <TourOverlay
        isOpen={isTourOpen}
        currentStep={currentStep}
        tourSteps={tourSteps}
        onNext={nextStep}
        onPrev={prevStep}
        onSkip={skipTour}
        onClose={closeTour}
      />
    </>
  );
};