import Link from "next/link";

export default function NotFound() {
  return (
    <div className="flex min-h-screen items-center justify-center px-4">
      <div className="text-center max-w-sm">
        <div className="text-4xl mb-4">🔍</div>
        <h2 className="text-lg font-bold mb-2">Page not found</h2>
        <p className="text-sm text-muted-foreground mb-6">
          This page doesn&apos;t exist. Let&apos;s get you back on track.
        </p>
        <Link
          href="/dashboard"
          className="inline-flex items-center justify-center rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/80"
        >
          Go to Dashboard
        </Link>
      </div>
    </div>
  );
}
