import { useEffect, useState, lazy, Suspense, ReactNode } from 'react';
import * as React from 'react';
import { apiFetch } from './lib/api';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';

class ErrorBoundary extends React.Component<any, any> {
  constructor(props: any) {
    super(props);
    (this as any).state = { hasError: false };
  }

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error: any) {
    if (error?.message?.includes('Failed to fetch dynamically imported module') || error?.message?.includes('text/html')) {
        const reloaded = sessionStorage.getItem('chunk-failed-reload');
        if (!reloaded) {
           sessionStorage.setItem('chunk-failed-reload', 'true');
           window.location.reload();
        }
    }
  }

  render() {
    if ((this as any).state.hasError) {
      return <div className="flex h-screen items-center justify-center p-8 text-center text-red-500">
         An update is available. Please <button className="underline ml-1 text-yellow-500" onClick={() => window.location.reload()}>refresh the page</button>.
      </div>;
    }
    return (this as any).props.children;
  }
}

import { AppLayout, ProtectedRoute } from './components/Layout';
import { useAuthStore } from './lib/store';
import Landing from './pages/Landing';
import { Login, Register } from './pages/Auth';
const Dashboard = lazy(() => import('./pages/User').then(m => ({ default: m.Dashboard })));
const Services = lazy(() => import('./pages/User').then(m => ({ default: m.Services })));
const Payment = lazy(() => import('./pages/User').then(m => ({ default: m.Payment })));
const Profile = lazy(() => import('./pages/User').then(m => ({ default: m.Profile })));
const AdminDashboard = lazy(() => import('./pages/Admin').then(m => ({ default: m.AdminDashboard })));
const AdminUsers = lazy(() => import('./pages/Admin').then(m => ({ default: m.AdminUsers })));
const AdminPayments = lazy(() => import('./pages/Admin').then(m => ({ default: m.AdminPayments })));
const AdminSettings = lazy(() => import('./pages/Admin').then(m => ({ default: m.AdminSettings })));

function RedSnow() {
  const [flakes, setFlakes] = React.useState<any[]>([]);

  React.useEffect(() => {
    const newFlakes = Array.from({ length: 40 }).map((_, i) => ({
      id: i,
      left: `${Math.random() * 100}%`,
      duration: `${Math.random() * 5 + 5}s`,
      delay: `${Math.random() * -10}s`,
      size: `${Math.random() * 5 + 3}px`,
      opacity: Math.random() * 0.6 + 0.2,
    }));
    setFlakes(newFlakes);
  }, []);

  return (
    <div className="fixed inset-0 pointer-events-none z-[100] overflow-hidden" aria-hidden="true">
      {flakes.map((flake) => (
        <div
          key={flake.id}
          className="absolute rounded-full bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.8)]"
          style={{
            left: flake.left,
            top: '-20px',
            width: flake.size,
            height: flake.size,
            opacity: flake.opacity,
            animation: `snow-fall ${flake.duration} linear infinite`,
            animationDelay: flake.delay,
          }}
        />
      ))}
      <style>{`
        @keyframes snow-fall {
          0% {
            transform: translateY(-20px) translateX(0px);
          }
          100% {
            transform: translateY(110vh) translateX(30px);
          }
        }
      `}</style>
    </div>
  );
}

export default function App() {
  const { user, token } = useAuthStore();
  const [themeMode] = React.useState(localStorage.getItem('themeMode') || 'dark');

  React.useEffect(() => {
    if (themeMode === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [themeMode]);

  React.useEffect(() => {
    const _themes: Record<string, Record<number, string>> = {
      blue: { 50: '#eff6ff', 100: '#dbeafe', 200: '#bfdbfe', 300: '#93c5fd', 400: '#60a5fa', 500: '#3b82f6', 600: '#2563eb', 700: '#1d4ed8', 800: '#1e40af', 900: '#1e3a8a', 950: '#172554' },
      purple: { 50: '#faf5ff', 100: '#f3e8ff', 200: '#e9d5ff', 300: '#d8b4fe', 400: '#c084fc', 500: '#a855f7', 600: '#9333ea', 700: '#7e22ce', 800: '#6b21a8', 900: '#581c87', 950: '#3b0764' },
      green: { 50: '#f0fdf4', 100: '#dcfce7', 200: '#bbf7d0', 300: '#86efac', 400: '#4ade80', 500: '#22c55e', 600: '#16a34a', 700: '#15803d', 800: '#166534', 900: '#14532d', 950: '#052e16' },
      red: { 50: '#fef2f2', 100: '#fee2e2', 200: '#fecaca', 300: '#fca5a5', 400: '#f87171', 500: '#ef4444', 600: '#dc2626', 700: '#b91c1c', 800: '#991b1b', 900: '#7f1d1d', 950: '#450a0a' },
    };

    apiFetch('/api/theme') // can fetch globally without auth
      .then(res => res.json())
      .then(data => {
          const color = data.themeColor || 'yellow';
          if (color && _themes[color]) {
               const style = document.createElement('style');
               let css = ':root {';
               for (const [weight, hex] of Object.entries(_themes[color])) {
                   css += `\n  --color-yellow-${weight}: ${hex};`;
               }
               css += '\n}';
               style.id = 'dynamic-theme';
               const existing = document.getElementById('dynamic-theme');
               if(existing) existing.remove();
               style.innerHTML = css;
               document.head.appendChild(style);
          } else {
               const existing = document.getElementById('dynamic-theme');
               if(existing) existing.remove();
          }
      }).catch(() => {});
  }, [token]); // re-run if token changes just in case, but really runs once

  return (
    <>
      <RedSnow />
      <Router>
        <ErrorBoundary>
        <Suspense fallback={<div className="flex h-screen items-center justify-center text-yellow-500">Loading...</div>}>
          <Routes>
            <Route path="/" element={<Landing />} />
          <Route path="/login" element={user ? <Navigate to={user.role === 'admin' ? '/admin' : '/dashboard'} /> : <Login />} />
          <Route path="/register" element={user ? <Navigate to={user.role === 'admin' ? '/admin' : '/dashboard'} /> : <Register />} />
          
          {/* User Routes */}
          <Route element={<ProtectedRoute />}>
            <Route element={<AppLayout />}>
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/services" element={<Services />} />
              <Route path="/payment" element={<Payment />} />
              <Route path="/profile" element={<Profile />} />
            </Route>
          </Route>

          {/* Admin Routes */}
          <Route element={<ProtectedRoute adminOnly />}>
            <Route element={<AppLayout />}>
              <Route path="/admin" element={<AdminDashboard />} />
              <Route path="/admin/users" element={<AdminUsers />} />
              <Route path="/admin/payments" element={<AdminPayments />} />
              <Route path="/admin/settings" element={<AdminSettings />} />
            </Route>
          </Route>
        </Routes>
        </Suspense>
        </ErrorBoundary>
    </Router>
    </>
  );
}
