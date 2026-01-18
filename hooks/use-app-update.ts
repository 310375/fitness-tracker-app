import { useEffect, useState } from 'react';
import { Platform } from 'react-native';

export function useAppUpdate() {
  const [updateAvailable, setUpdateAvailable] = useState(false);
  const [registration, setRegistration] = useState<ServiceWorkerRegistration | null>(null);

  useEffect(() => {
    if (Platform.OS !== 'web') return;

    // Service Worker registrieren
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker
        .register('/service-worker.js', { scope: '/' })
        .then(reg => {
          setRegistration(reg);

          // Auf Updates prüfen
          reg.addEventListener('updatefound', () => {
            const newWorker = reg.installing;
            if (newWorker) {
              newWorker.addEventListener('statechange', () => {
                if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
                  // Neue Version verfügbar
                  setUpdateAvailable(true);
                }
              });
            }
          });

          // Regelmäßig auf Updates prüfen (alle 60 Sekunden)
          const interval = setInterval(() => {
            reg.update();
          }, 60000);

          return () => clearInterval(interval);
        })
        .catch(error => {
          console.error('Service Worker registration failed:', error);
        });
    }
  }, []);

  const applyUpdate = () => {
    if (registration?.waiting) {
      registration.waiting.postMessage({ type: 'SKIP_WAITING' });
      window.location.reload();
    }
  };

  return { updateAvailable, applyUpdate };
}
