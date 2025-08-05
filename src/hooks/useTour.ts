import { useState, useEffect, useCallback } from 'react';

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
    const [isInitialized, setIsInitialized] = useState(false);

    // Function to check if all tour elements are available
    const checkTourElements = useCallback(() => {
        const userProfileElement = document.querySelector('[data-tour="user-profile"]');
        const dashboardElement = document.querySelector('[data-tour="dashboard-menu"]');
        
        console.log('Checking tour elements:', {
        userProfile: !!userProfileElement,
        dashboard: !!dashboardElement,
        userProfileVisible: userProfileElement ? userProfileElement.getBoundingClientRect().width > 0 : false
        });
        
        return userProfileElement && 
            userProfileElement.getBoundingClientRect().width > 0 &&
            dashboardElement;
    }, []);

    // Function to start tour with multiple retry attempts
    const startTourWithDelay = useCallback(() => {
        let attempts = 0;
        const maxAttempts = 10;
        const baseDelay = 500;
        
        const attemptStart = () => {
        attempts++;
        console.log(`Tour start attempt ${attempts}/${maxAttempts}`);
        
        if (checkTourElements()) {
            console.log('All tour elements found, starting tour');
            setIsTourOpen(true);
            return;
        }
        
        if (attempts < maxAttempts) {
            const delay = baseDelay * attempts; // Increasing delay
            console.log(`Retrying in ${delay}ms`);
            setTimeout(attemptStart, delay);
        } else {
            console.log('Max attempts reached, tour will not start automatically');
            // Still set hasSeenTour to true so manual button appears
            setHasSeenTour(true);
        }
        };
        
        // Start first attempt after initial delay
        setTimeout(attemptStart, 2000);
    }, [checkTourElements]);

    // Initialize tour state
    useEffect(() => {
        if (isInitialized) return;
        
        console.log('Initializing tour...');
        const tourCompleted = localStorage.getItem('tour-completed');
        console.log('Tour completed status:', tourCompleted);
        
        if (!tourCompleted) {
        console.log('Tour not completed, will start automatically');
        startTourWithDelay();
        } else {
        console.log('Tour already completed');
        setHasSeenTour(true);
        }
        
        setIsInitialized(true);
    }, [isInitialized, startTourWithDelay]);

    const closeTour = useCallback(() => {
        console.log('Closing tour');
        setIsTourOpen(false);
        localStorage.setItem('tour-completed', 'true');
        setHasSeenTour(true);
    }, []);

    const nextStep = useCallback(() => {
        if (currentStep < TOUR_STEPS.length - 1) {
        setCurrentStep(currentStep + 1);
        } else {
        closeTour();
        }
    }, [currentStep, closeTour]);

    const prevStep = useCallback(() => {
        if (currentStep > 0) {
        setCurrentStep(currentStep - 1);
        }
    }, [currentStep]);

    const skipTour = useCallback(() => {
        closeTour();
    }, [closeTour]);

    const resetTour = useCallback(() => {
        localStorage.removeItem('tour-completed');
        setHasSeenTour(false);
        setIsTourOpen(false);
        setCurrentStep(0);
        setIsInitialized(false); // This will trigger re-initialization
    }, []);

    const startTour = useCallback(() => {
        setCurrentStep(0);
        setIsTourOpen(true);
        // Pastikan hasSeenTour tidak menghalangi tour manual
        if (!hasSeenTour) {
            setHasSeenTour(true);
        }
    }, [hasSeenTour]);

  return {
    isTourOpen,
    currentStep,
    hasSeenTour,
    tourSteps: TOUR_STEPS,
    startTour,
    closeTour,
    nextStep,
    prevStep,
    skipTour,
    resetTour
  };
};