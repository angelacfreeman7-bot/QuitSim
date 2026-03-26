"use client";

import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Crown } from "lucide-react";

interface UpgradeGateProps {
  feature: string;
  children: React.ReactNode;
  locked: boolean;
}

export function UpgradeGate({ feature, children, locked }: UpgradeGateProps) {
  if (!locked) return <>{children}</>;

  return (
    <div className="relative">
      <div className="pointer-events-none opacity-40 blur-[2px] select-none">
        {children}
      </div>
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="absolute inset-0 flex items-center justify-center"
      >
        <div className="rounded-xl border border-primary/20 bg-card/95 px-6 py-5 text-center shadow-lg backdrop-blur-sm max-w-xs">
          <div className="mx-auto mb-3 flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
            <Crown className="h-5 w-5 text-primary" />
          </div>
          <p className="text-sm font-medium mb-1">Pro Feature</p>
          <p className="text-xs text-muted-foreground mb-4">{feature}</p>
          <Button size="sm" className="w-full" onClick={() => {
            // Stub: open upgrade flow
            window.alert("Upgrade flow coming soon! This will connect to Stripe.");
          }}>
            <Crown className="mr-2 h-3.5 w-3.5" />
            Upgrade to Pro
          </Button>
        </div>
      </motion.div>
    </div>
  );
}
