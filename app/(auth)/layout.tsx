export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <main className="flex min-h-screen items-center justify-center px-4 bg-gradient-to-br from-primary-50 to-neutral-100">
      <div className="w-full max-w-sm">
        <div className="mb-8 text-center">
          <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-2xl bg-primary-700 text-xl font-semibold text-white">
            🏢
          </div>
          <h1 className="text-3xl font-bold text-primary-700">Themefisher</h1>
          <p className="mt-1 text-sm text-neutral-500">Office Service Management</p>
        </div>
        {children}
      </div>
    </main>
  );
}
