import { useState, useEffect } from "react";
import { Download, X } from "lucide-react";

export default function InstallPWA() {
  const [supportsPWA, setSupportsPWA] = useState(false);
  const [promptInstall, setPromptInstall] = useState<any>(null);
  const [isIOS, setIsIOS] = useState(false);
  const [isStandalone, setIsStandalone] = useState(false);
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    // Check if already installed
    if (window.matchMedia("(display-mode: standalone)").matches || (window.navigator as any).standalone) {
      setIsStandalone(true);
      return;
    }

    // Check if iOS
    const isIosDevice = /iphone|ipad|ipod/.test(window.navigator.userAgent.toLowerCase());
    setIsIOS(isIosDevice);
    if (isIosDevice) {
      setSupportsPWA(true);
    }

    const handler = (e: any) => {
      e.preventDefault();
      setSupportsPWA(true);
      setPromptInstall(e);
    };

    window.addEventListener("beforeinstallprompt", handler);
    return () => window.removeEventListener("beforeinstallprompt", handler);
  }, []);

  const onClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    if (!promptInstall) {
      if (isIOS) {
        alert("To install on iOS: tap the Share button at the bottom of your browser and select 'Add to Home Screen'.");
      }
      return;
    }
    promptInstall.prompt();
  };

  if (!supportsPWA || isStandalone || dismissed) {
    return null;
  }

  return (
    <div className="fixed bottom-4 left-4 right-4 md:left-auto md:right-4 md:w-96 bg-blue-600 text-white p-4 rounded-xl shadow-2xl z-[100] flex items-center justify-between animate-in slide-in-from-bottom-5">
      <div className="flex items-center gap-3">
        <div className="bg-white/20 p-2 rounded-lg">
          <Download className="w-6 h-6 text-white" />
        </div>
        <div>
          <h4 className="font-bold">Install RastaFlow</h4>
          <p className="text-sm text-blue-100">Add to home screen for quick access</p>
        </div>
      </div>
      <div className="flex items-center gap-2">
        <button 
          onClick={onClick}
          className="bg-white text-blue-600 px-4 py-2 rounded-lg font-bold text-sm hover:bg-gray-100 transition-colors shadow-sm"
        >
          Install
        </button>
        <button 
          onClick={() => setDismissed(true)}
          className="text-blue-200 hover:text-white p-1 rounded-full transition-colors"
        >
          <X className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
}
