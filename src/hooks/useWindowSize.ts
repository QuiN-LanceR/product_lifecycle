import { useState, useEffect } from 'react';

interface WindowSize {
  width: number;
  height: number;
}

export function useWindowSize(): WindowSize {
  const [windowSize, setWindowSize] = useState<WindowSize>({
    width: 0,
    height: 0,
  });

  useEffect(() => {
    function handleResize() {
      setWindowSize({
        width: window.innerWidth,
        height: window.innerHeight,
      });
    }

    // Set initial size
    handleResize();

    // Add event listener
    window.addEventListener('resize', handleResize);
    
    // Detect zoom changes
    let resizeTimer: NodeJS.Timeout;
    const handleZoomResize = () => {
      clearTimeout(resizeTimer);
      resizeTimer = setTimeout(() => {
        handleResize();
        // Force chart.js to resize
        window.dispatchEvent(new Event('resize'));
      }, 100);
    };

    window.addEventListener('wheel', handleZoomResize, { passive: true });
    
    // Cleanup
    return () => {
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('wheel', handleZoomResize);
      clearTimeout(resizeTimer);
    };
  }, []);

  return windowSize;
}