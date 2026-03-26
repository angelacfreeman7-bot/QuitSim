"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useSimStore } from "@/stores/useSimStore";

export default function Home() {
  const router = useRouter();
  const onboarded = useSimStore((s) => s.onboarded);

  useEffect(() => {
    if (onboarded) {
      router.replace("/dashboard");
    } else {
      router.replace("/welcome");
    }
  }, [onboarded, router]);

  return (
    <div className="flex min-h-screen items-center justify-center">
      <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
    </div>
  );
}
