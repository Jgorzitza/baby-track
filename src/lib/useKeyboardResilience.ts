import { useEffect } from 'react';

/**
 * Hook to handle mobile keyboard open/close events to prevent layout breakages.
 * It uses the Visual Viewport API to adjust the layout when the keyboard appears.
 */
export const useKeyboardResilience = () => {
  useEffect(() => {
    if (!window.visualViewport) return;

    const onResize = () => {
      const viewport = window.visualViewport;
      if (!viewport) return;

      // When the keyboard is open, the visual viewport height decreases.
      // We can use this to adjust our CSS variables or handle specific scrolling logic.
      const isKeyboardOpen = viewport.height < window.innerHeight * 0.8;
      
      if (isKeyboardOpen) {
        document.body.classList.add('keyboard-open');
        // Optional: Ensure the active element is visible
        if (document.activeElement) {
          document.activeElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
      } else {
        document.body.classList.remove('keyboard-open');
      }
    };

    window.visualViewport.addEventListener('resize', onResize);
    return () => window.visualViewport?.removeEventListener('resize', onResize);
  }, []);
};
