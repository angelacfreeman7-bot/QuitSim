"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { WifiOff } from "lucide-react";

export function OfflineBanner() {
  const [online, setOnline] = useState(true);

  useEffect(() => {
    setOnline(navigator.onLine);

    const goOnline = () => setOnline(true);
    const goOffline = () => setOnline(false);

    window.addEventListener("online", goOnline);
    window.addEventListener("offline", goOffline);
    return () => {
      window.removeEventListener("online", goOnline);
      window.removeEventListener("offline", goOffline);
    };
  }, []);

  return (
    <AnimatePresence>
      {!online && (
        <motion.div
          initial={{ height: 0, opacity: 0 }}
          animate={{ height: "auto", opacity: 1 }}
          exit={{ height: 0, opacity: 0 }}
          className="overflow-hidden bg-yellow-500/10 border-b border-yellow-500/20"
        >
          <div className="flex items-center justify-center gap-2 px-4 py-2">
            <WifiOff className="h-3.5 w-3.5 text-yellow-500" />
            <p className="text-xs text-yellow-500">
              No internet — basic sim still works
            </p>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
