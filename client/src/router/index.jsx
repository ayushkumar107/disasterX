import React, { Suspense, lazy } from 'react';
import { createBrowserRouter, RouterProvider } from 'react-router-dom';
const HomePage = lazy(() => import('../pages/HomePage'));
const LoginPage = lazy(() => import('../pages/LoginPage'));
const RegisterPage = lazy(() => import('../pages/RegisterPage'));
const LoadingFallback = () => <div className="h-screen w-screen flex items-center justify-center bg-[var(--color-dx-bg)]">
    <div className="flex flex-col items-center gap-4">
      <div className="w-8 h-8 border-2 border-[var(--color-dx-cyan)] border-t-transparent rounded-full animate-spin" />
      <span className="telemetry-text">INITIALIZING SYSTEM...</span>
    </div>
  </div>;
const router = createBrowserRouter([{
  path: '/',
  element: <Suspense fallback={<LoadingFallback />}>
        <HomePage />
      </Suspense>
}, {
  path: '/login',
  element: <Suspense fallback={<LoadingFallback />}>
        <LoginPage />
      </Suspense>
}, {
  path: '/register',
  element: <Suspense fallback={<LoadingFallback />}>
        <RegisterPage />
      </Suspense>
}, {
  path: '*',
  element: <div className="h-screen w-screen flex items-center justify-center bg-[var(--color-dx-bg)]">
        <div className="text-center">
          <h1 className="text-4xl font-bold text-[var(--color-dx-cyan)] mb-2 font-mono">404</h1>
          <p className="text-[var(--color-dx-muted)] mb-4">Route not found</p>
          <a href="/" className="btn-primary inline-block">Return to Command Center</a>
        </div>
      </div>
}]);
export const AppRouter = () => {
  return <RouterProvider router={router} />;
};
