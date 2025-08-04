import { useState, useEffect } from 'react';

interface TourStep {
  target: string;
  title: string;
  content: string;
  placement?: 'top' | 'bottom' | 'bottom-end' | 'left' | 'right';
  disableBeacon?: boolean;
}

const TOUR_STEPS: TourStep[] = [
  {
    target: '[data-tour="user-profile"]',
    title: 'Profil Pengguna',
    content: 'Di sini Anda dapat mengakses pengaturan profil dan melakukan logout dari aplikasi. Klik pada avatar atau nama pengguna untuk membuka menu dropdown.',
    placement: 'bottom-end'
  },
  {
    target: '[data-tour="dashboard-menu"]',
    title: 'Menu Dashboard',
    content: 'Dashboard menampilkan ringkasan data produk berdasarkan segmen bisnis dan tahapan lifecycle. Anda dapat melihat distribusi produk secara visual dan mengakses detail setiap kategori.',
    placement: 'right'
  },
  {
    target: '[data-tour="product-menu"]',
    title: 'Menu Product Catalog',
    content: 'Product Catalog berisi master data seluruh produk dalam sistem. Anda dapat mengelola informasi produk, menambah produk baru, dan memantau status setiap produk.',
    placement: 'right'
  },
  {
    target: '[data-tour="lifecycle-menu"]',
    title: 'Menu Lifecycle',
    content: 'Menu Lifecycle menyediakan visualisasi chart untuk memantau perjalanan lifecycle produk. Anda dapat menganalisis tren dan pola perkembangan produk dari waktu ke waktu.',
    placement: 'right'
  }
];

export const useTour = () => {
  const [isTourOpen, setIsTourOpen] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const [hasSeenTour, setHasSeenTour] = useState(false);

  useEffect(() => {
    // Check if user has seen the tour before
    const tourCompleted = localStorage.getItem('tour-completed');
    if (!tourCompleted) {
      // Longer delay for tour start to ensure all components are fully rendered
      const timer = setTimeout(() => {
        // Double check that the target element exists before starting
        const userProfileElement = document.querySelector('[data-tour="user-profile"]');
        if (userProfileElement && userProfileElement.getBoundingClientRect().width > 0) {
          setIsTourOpen(true);
        } else {
          // If element not ready, wait a bit more
          const retryTimer = setTimeout(() => {
            setIsTourOpen(true);
          }, 1000);
          return () => clearTimeout(retryTimer);
        }
      }, 2500); // Increased from 1000ms to 1500ms
      
      return () => clearTimeout(timer);
    } else {
      setHasSeenTour(true);
    }
  }, []);

  const startTour = () => {
    setCurrentStep(0);
    setIsTourOpen(true);
  };

  const closeTour = () => {
    setIsTourOpen(false);
    localStorage.setItem('tour-completed', 'true');
    setHasSeenTour(true);
  };

  const nextStep = () => {
    if (currentStep < TOUR_STEPS.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      closeTour();
    }
  };

  const prevStep = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const skipTour = () => {
    closeTour();
  };

  return {
    isTourOpen,
    currentStep,
    hasSeenTour,
    tourSteps: TOUR_STEPS,
    startTour,
    closeTour,
    nextStep,
    prevStep,
    skipTour
  };
};