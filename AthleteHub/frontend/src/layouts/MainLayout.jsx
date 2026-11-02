import { Outlet, useLocation } from 'react-router-dom';

export default function MainLayout() {
  const location = useLocation();
  
  const isAuthRoute = location.pathname === '/login' || location.pathname === '/register';

  if (location.pathname === '/') {
    return <Outlet />;
  }

  if (isAuthRoute) {
    return (
      <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-background p-6 font-sans text-foreground">
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute left-[-8%] top-[-6%] h-80 w-80 rounded-full bg-primary/10 blur-3xl" />
          <div className="absolute bottom-[-10%] right-[-10%] h-96 w-96 rounded-full bg-secondary/15 blur-3xl" />
        </div>
        <Outlet />
      </div>
    );
  }

  return (
    <div className="relative flex min-h-screen bg-background font-sans text-foreground">
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute left-[-8%] top-[-4%] h-80 w-80 rounded-full bg-primary/10 blur-3xl" />
        <div className="absolute right-[-4%] top-[12%] h-[28rem] w-[28rem] rounded-full bg-secondary/12 blur-3xl" />
      </div>
      <main className="flex-1 overflow-y-auto px-4 py-6 sm:px-6 lg:px-8 lg:py-8">
        <div className="mx-auto w-full max-w-[1480px] animate-fade-in">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
