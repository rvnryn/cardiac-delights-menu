"use client";

import { useEffect } from "react";
import { registerServiceWorker } from "./service-worker";

export default function ServiceWorkerProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  useEffect(() => {
    // Register service worker on app startup
    registerServiceWorker().catch(console.error);
  }, []);

  return <>{children}</>;
}
