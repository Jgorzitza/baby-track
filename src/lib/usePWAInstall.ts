import { useState, useEffect } from 'react';

interface BeforeInstallPromptEvent extends Event {
  readonly platforms: string[];
  readonly userChoice: Promise<{
    outcome: 'accepted' | 'dismissed';
    platform: string;
  }>;
  prompt(): Promise<void>;
}

export const usePWAInstall = () => {
  const getIsStandalone = () =>
    window.matchMedia('(display-mode: standalone)').matches ||
    ((window.navigator as Navigator & { standalone?: boolean }).standalone ?? false);
  const getManualInstallSupport = () => {
    const userAgent = window.navigator.userAgent.toLowerCase();
    const isIos = /iphone|ipad|ipod/.test(userAgent);
    const isSafari = /safari/.test(userAgent) && !/crios|fxios|edgios/.test(userAgent);
    return isIos && isSafari && !getIsStandalone();
  };
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [installState, setInstallState] = useState<'idle' | 'prompting' | 'dismissed' | 'accepted' | 'error'>('idle');
  const [installError, setInstallError] = useState<string | null>(null);
  const [isInstallable, setIsInstallable] = useState(false);
  const [isInstalled, setIsInstalled] = useState(() => getIsStandalone());
  const [showManualInstallHint, setShowManualInstallHint] = useState(() => getManualInstallSupport());

  useEffect(() => {
    const handler = (e: Event) => {
      // Prevent the mini-infobar from appearing on mobile
      e.preventDefault();
      // Stash the event so it can be triggered later.
      setDeferredPrompt(e as BeforeInstallPromptEvent);
      setIsInstallable(true);
      setInstallState('idle');
      setInstallError(null);
    };

    const handleInstalled = () => {
      setDeferredPrompt(null);
      setIsInstallable(false);
      setIsInstalled(true);
      setShowManualInstallHint(false);
      setInstallState('accepted');
      setInstallError(null);
    };

    window.addEventListener('beforeinstallprompt', handler);
    window.addEventListener('appinstalled', handleInstalled);

    return () => {
      window.removeEventListener('beforeinstallprompt', handler);
      window.removeEventListener('appinstalled', handleInstalled);
    };
  }, []);

  const install = async () => {
    if (!deferredPrompt) {
      setInstallState('error');
      setInstallError('Install prompt is not available right now. Try again from a supported mobile browser.');
      return;
    }

    setInstallState('prompting');
    setInstallError(null);

    // Show the install prompt
    try {
      await deferredPrompt.prompt();

      // Wait for the user to respond to the prompt
      const { outcome } = await deferredPrompt.userChoice;
      setDeferredPrompt(null);
      setIsInstallable(false);
      setInstallState(outcome);
      if (outcome === 'dismissed') {
        setInstallError('Install was dismissed. You can try again when the browser offers the prompt.');
      }
    } catch {
      setDeferredPrompt(null);
      setIsInstallable(false);
      setInstallState('error');
      setInstallError('Unable to show the install prompt on this device.');
    }
  };

  return {
    isInstallable,
    isInstalled,
    showManualInstallHint,
    manualInstallMessage: showManualInstallHint ? 'Open Safari share menu and choose Add to Home Screen.' : null,
    install,
    installState,
    installError,
  };
};
