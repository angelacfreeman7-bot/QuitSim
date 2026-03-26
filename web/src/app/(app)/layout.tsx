import { BottomNav } from "@/components/shared/BottomNav";
import { InstallPrompt } from "@/components/shared/InstallPrompt";

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen pb-20">
      {children}
      <BottomNav />
      <InstallPrompt />
    </div>
  );
}
