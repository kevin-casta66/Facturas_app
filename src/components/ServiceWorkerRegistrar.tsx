"use client";

import { useEffect } from "react";

export default function ServiceWorkerRegistrar() {
  useEffect(() => {
    if (typeof window === "undefined") return;
    if (!("serviceWorker" in navigator)) return;

    const registerSW = async () => {
      try {
        const registration = await navigator.serviceWorker.register("/sw.js", {
          scope: "/",
        });

        // Verificar actualizaciones cada vez que la app se enfoca
        window.addEventListener("focus", () => {
          registration.update();
        });

        registration.addEventListener("updatefound", () => {
          const newWorker = registration.installing;
          if (!newWorker) return;
          newWorker.addEventListener("statechange", () => {
            if (
              newWorker.state === "installed" &&
              navigator.serviceWorker.controller
            ) {
              // Hay una nueva versión disponible — se activa en el próximo reload
              console.log("[SW] Nueva versión disponible.");
            }
          });
        });
      } catch (err) {
        console.warn("[SW] Error al registrar el Service Worker:", err);
      }
    };

    // Registrar después de que la página cargue para no bloquear el render inicial
    if (document.readyState === "complete") {
      registerSW();
    } else {
      window.addEventListener("load", registerSW);
    }
  }, []);

  return null;
}
