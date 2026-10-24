import React, { useEffect, useState } from 'react';
import { Download, Share } from 'lucide-react';

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed'; platform: string }>;
}

export const PWAInstallButton: React.FC = () => {
  const [deferredPrompt, setDeferredPrompt] =
    useState<BeforeInstallPromptEvent | null>(null);
  const [isInstalled, setIsInstalled] = useState(false);
  const [isIOS, setIsIOS] = useState(false);
  const [showIOSGuide, setShowIOSGuide] = useState(false);

  useEffect(() => {
    // Detect standalone mode
    const isStandalone =
      window.matchMedia('(display-mode: standalone)').matches ||
      (window.navigator as unknown as { standalone?: boolean }).standalone ===
        true;
    setIsInstalled(isStandalone);

    // Detect iOS
    const userAgent = window.navigator.userAgent.toLowerCase();
    const isIOSDevice = /iphone|ipad|ipod/.test(userAgent);
    setIsIOS(isIOSDevice);

    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
    };

    const handleAppInstalled = () => {
      setIsInstalled(true);
      setDeferredPrompt(null);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    window.addEventListener('appinstalled', handleAppInstalled);

    return () => {
      window.removeEventListener(
        'beforeinstallprompt',
        handleBeforeInstallPrompt
      );
      window.removeEventListener('appinstalled', handleAppInstalled);
    };
  }, []);

  const handleInstall = async () => {
    if (!deferredPrompt) return;
    await deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === 'accepted') {
      setIsInstalled(true);
      setDeferredPrompt(null);
    }
  };

  if (isInstalled) return null;

  return (
    <>
      {deferredPrompt ? (
        <button
          onClick={handleInstall}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-emerald-500 hover:bg-emerald-400 text-white font-arcade text-xs font-bold shadow-md shadow-emerald-500/25 transition active:scale-95"
        >
          <Download className="w-3.5 h-3.5" />
          <span>INSTALL APP</span>
        </button>
      ) : isIOS ? (
        <button
          onClick={() => setShowIOSGuide(true)}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-sky-500 hover:bg-sky-400 text-white font-arcade text-xs font-bold shadow-md shadow-sky-500/25 transition active:scale-95"
        >
          <Download className="w-3.5 h-3.5" />
          <span>INSTALL APP</span>
        </button>
      ) : null}

      {/* iOS Safari Guide Modal */}
      {showIOSGuide && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 select-none animate-in fade-in">
          <div className="w-full max-w-xs rounded-3xl bg-white p-5 shadow-2xl border-4 border-sky-300 text-center">
            <div className="w-12 h-12 rounded-full bg-sky-100 text-sky-600 flex items-center justify-center mx-auto mb-3">
              <Share className="w-6 h-6" />
            </div>
            <h3 className="font-arcade text-lg font-black text-slate-900">
              Install on iPhone / iPad
            </h3>
            <p className="text-xs text-slate-600 mt-2 text-left space-y-1.5 bg-sky-50 p-3 rounded-2xl border border-sky-100">
              <span>1. Tap the <strong>Share</strong> icon in the Safari toolbar.</span>
              <br />
              <span>2. Scroll down and tap <strong>Add to Home Screen</strong>.</span>
              <br />
              <span>3. Open Flying Hasnain in full screen anytime!</span>
            </p>
            <button
              onClick={() => setShowIOSGuide(false)}
              className="mt-4 w-full rounded-xl bg-sky-500 py-2.5 font-arcade text-xs font-bold text-white hover:bg-sky-400 transition"
            >
              GOT IT
            </button>
          </div>
        </div>
      )}
    </>
  );
};
