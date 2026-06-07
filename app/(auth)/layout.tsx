export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <main className="flex min-h-screen items-center justify-center px-4">
      <div className="w-full max-w-sm">
        <div className="mb-8 text-center">
          <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-2xl bg-canteen-accent text-xl font-semibold text-white">
            ☕
          </div>
          <h1 className="text-2xl">The Canteen</h1>
          <p className="mt-1 text-sm text-canteen-muted">Office cafeteria ordering</p>
        </div>
        {children}
      </div>
    </main>
  );
}
