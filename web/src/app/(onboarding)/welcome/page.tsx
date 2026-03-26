"use client";

import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { DoorOpen, Sparkles } from "lucide-react";

export default function WelcomePage() {
  const router = useRouter();

  return (
    <div className="flex min-h-screen flex-col items-center justify-center px-6">
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        className="flex max-w-md flex-col items-center text-center"
      >
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
          className="mb-8 flex h-20 w-20 items-center justify-center rounded-2xl bg-primary/10"
        >
          <DoorOpen className="h-10 w-10 text-primary" />
        </motion.div>

        <h1 className="mb-3 text-4xl font-bold tracking-tight">
          What if you <span className="text-primary">quit</span>?
        </h1>
        <p className="mb-2 text-lg text-muted-foreground">
          See exactly how long your money lasts, stress-test your plan, and find your freedom date.
        </p>
        <p className="mb-10 text-sm text-muted-foreground/70">
          All calculations run on your device first. Your data stays yours.
        </p>

        <div className="flex w-full flex-col gap-3">
          <Button
            size="lg"
            className="h-14 text-base"
            onClick={() => router.push("/setup")}
          >
            <Sparkles className="mr-2 h-5 w-5" />
            Let&apos;s simulate
          </Button>
          <p className="text-xs text-muted-foreground">
            Takes ~60 seconds. No account needed.
          </p>
        </div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.8 }}
        className="absolute bottom-8 flex items-center gap-2 text-xs text-muted-foreground"
      >
        <div className="h-2 w-2 rounded-full bg-green-500" />
        All calcs on-device first &mdash; privacy by default
      </motion.div>
    </div>
  );
}
