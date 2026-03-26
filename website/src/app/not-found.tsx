export default function NotFound() {
  return (
    <div className="flex min-h-screen items-center justify-center">
      <div className="text-center">
        <h1 className="text-6xl font-bold text-[var(--accent)]">404</h1>
        <p className="mt-4 text-[var(--muted)]">Page not found</p>
        <a
          href="/"
          className="mt-6 inline-block rounded-full bg-[var(--accent)] px-6 py-2 text-sm font-semibold text-black"
        >
          Go Home
        </a>
      </div>
    </div>
  );
}
