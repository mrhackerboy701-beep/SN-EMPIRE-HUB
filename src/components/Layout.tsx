import { Navigate, Outlet, Link, useLocation } from 'react-router-dom';
import { useAuthStore } from '../lib/store';
import { LayoutDashboard, Compass, CreditCard, User, LogOut, Settings as SettingsIcon, Users, Sun, Moon, FileText, Youtube, Send, MessageCircle, Instagram } from 'lucide-react';
import React, { useState, useEffect } from 'react';
import { cn } from '../lib/utils';
import { motion } from 'framer-motion';

export function ProtectedRoute({ adminOnly = false }: { adminOnly?: boolean }) {
  const { token, user } = useAuthStore();
  
  if (!token) return <Navigate to="/login" replace />;
  if (adminOnly && user?.role !== 'admin') return <Navigate to="/dashboard" replace />;
  
  return <Outlet />;
}

export function AppLayout() {
  const { user, logout, token } = useAuthStore();
  const location = useLocation();
  const [themeMode, setThemeMode] = useState(localStorage.getItem('themeMode') || 'dark');
  const [settings, setSettings] = useState<any>({});
  
  useEffect(() => {
    // Sync theme on mount and when changed
    if (themeMode === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    localStorage.setItem('themeMode', themeMode);
  }, [themeMode]);

  useEffect(() => {
    if (token) {
      fetch('/api/settings', { headers: { Authorization: `Bearer ${token}` } })
        .then(res => res.json())
        .then(data => setSettings(data))
        .catch(console.error);
    }
  }, [token]);

  const toggleTheme = () => setThemeMode(themeMode === 'dark' ? 'light' : 'dark');

  const navItems = user?.role === 'admin' 
    ? [
        { name: 'Overview', path: '/admin', icon: LayoutDashboard },
        { name: 'Users', path: '/admin/users', icon: Users },
        { name: 'Payments', path: '/admin/payments', icon: CreditCard },
        { name: 'Settings', path: '/admin/settings', icon: SettingsIcon },
      ]
    : [
        { name: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
        { name: 'Services', path: '/services', icon: Compass },
        { name: 'Payment', path: '/payment', icon: CreditCard },
        { name: 'Profile', path: '/profile', icon: User },
      ];

  return (
    <div className="min-h-screen flex bg-transparent transition-colors duration-300">
      {/* Sidebar */}
      <motion.aside 
        initial={{ x: -250 }}
        animate={{ x: 0 }}
        className="w-64 fixed h-full glass-panel border-r border-zinc-200/50 dark:border-zinc-800/50 z-20 flex flex-col"
      >
        <div className="h-20 flex items-center px-8 border-b border-zinc-200/50 dark:border-zinc-800/50">
          <div className="w-8 h-8 rounded-lg bg-yellow-600 flex items-center justify-center mr-3">
            <Compass className="text-white w-5 h-5" />
          </div>
          <span className="font-bold text-xl tracking-tight">PremiumUI</span>
        </div>
        
        <div className="flex-1 py-6 px-4 space-y-2 overflow-y-auto">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path || (item.path !== '/admin' && location.pathname.startsWith(item.path));
            return (
              <Link 
                key={item.path} 
                to={item.path}
                className={cn(
                  "flex items-center px-4 py-3 rounded-xl transition-all duration-200",
                  isActive 
                    ? "bg-yellow-600/10 text-yellow-600 dark:bg-yellow-500/20 dark:text-yellow-400 font-medium" 
                    : "text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800"
                )}
              >
                <Icon className={cn("w-5 h-5 mr-3", isActive ? "text-yellow-600 dark:text-yellow-400" : "opacity-70")} />
                {item.name}
              </Link>
            );
          })}

          {user?.role !== 'admin' && (settings.youtubeLink || settings.telegramLink || settings.whatsappLink || settings.instagramLink) && (
            <div className="mt-8 pt-6 border-t border-zinc-200/50 dark:border-zinc-800/50">
              <span className="px-4 text-xs font-semibold text-zinc-500 uppercase tracking-widest mb-3 block">Connect With Us</span>
              {settings.youtubeLink && (
                <a href={settings.youtubeLink} target="_blank" rel="noopener noreferrer" className="flex items-center px-4 py-2 text-zinc-600 dark:text-zinc-400 hover:text-red-500 transition-colors">
                  <Youtube className="w-5 h-5 mr-3" />
                  YouTube
                </a>
              )}
              {settings.instagramLink && (
                <a href={settings.instagramLink} target="_blank" rel="noopener noreferrer" className="flex items-center px-4 py-2 text-zinc-600 dark:text-zinc-400 hover:text-pink-500 transition-colors">
                  <Instagram className="w-5 h-5 mr-3" />
                  Instagram
                </a>
              )}
              {settings.telegramLink && (
                <a href={settings.telegramLink} target="_blank" rel="noopener noreferrer" className="flex items-center px-4 py-2 text-zinc-600 dark:text-zinc-400 hover:text-blue-500 transition-colors">
                  <Send className="w-5 h-5 mr-3" />
                  Telegram
                </a>
              )}
              {settings.whatsappLink && (
                <a href={settings.whatsappLink} target="_blank" rel="noopener noreferrer" className="flex items-center px-4 py-2 text-zinc-600 dark:text-zinc-400 hover:text-green-500 transition-colors">
                  <MessageCircle className="w-5 h-5 mr-3" />
                  WhatsApp
                </a>
              )}
            </div>
          )}
        </div>

        <div className="p-4 border-t border-zinc-200/50 dark:border-zinc-800/50">
          <button 
            onClick={logout}
            className="flex w-full items-center px-4 py-3 text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 rounded-xl transition-colors"
          >
            <LogOut className="w-5 h-5 mr-3 opacity-70" />
            Logout
          </button>
        </div>
      </motion.aside>

      {/* Main Content */}
      <div className="flex-1 ml-64 flex flex-col min-h-screen">
        <header className="h-20 glass-panel border-b border-zinc-200/50 dark:border-zinc-800/50 sticky top-0 z-10 flex items-center justify-between px-8">
          <h2 className="text-xl font-semibold opacity-90 capitalize">
            {location.pathname.split('/').pop() || 'Dashboard'}
          </h2>
          
          <div className="flex items-center gap-4">
            <button onClick={toggleTheme} className="p-2 rounded-full hover:bg-zinc-200 dark:hover:bg-zinc-800 transition-colors">
              {themeMode === 'dark' ? <Sun className="w-5 h-5 text-yellow-400" /> : <Moon className="w-5 h-5 text-zinc-600" />}
            </button>
            
            <div className="h-10 w-10 rounded-full bg-gradient-to-r from-yellow-500 to-yellow-500 flex items-center justify-center text-white font-bold shadow-md">
              {user?.name?.charAt(0).toUpperCase()}
            </div>
          </div>
        </header>
        
        <main className="flex-1 p-8 overflow-x-hidden">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
