import { Navigate, Outlet, Link, useLocation } from 'react-router-dom';
import { useAuthStore } from '../lib/store';
import { LayoutDashboard, Compass, CreditCard, User, LogOut, Settings as SettingsIcon, Users, Sun, Moon, Youtube, Send, MessageCircle, Instagram, Menu, X } from 'lucide-react';
import { apiFetch } from '../lib/api';
import * as React from 'react';
import { cn } from '../lib/utils';
import { motion, AnimatePresence } from 'motion/react';

export function ProtectedRoute({ adminOnly = false }: { adminOnly?: boolean }) {
  const { token, user } = useAuthStore();
  
  if (!token) return <Navigate to="/login" replace />;
  if (adminOnly && user?.role !== 'admin') return <Navigate to="/dashboard" replace />;
  
  return <Outlet />;
}

export function AppLayout() {
  const { user, logout, token } = useAuthStore();
  const location = useLocation();
  const [themeMode, setThemeMode] = React.useState(localStorage.getItem('themeMode') || 'dark');
  const [settings, setSettings] = React.useState<any>({});
  const [isSidebarOpen, setIsSidebarOpen] = React.useState(false);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = React.useState(false);
  
  React.useEffect(() => {
    // Sync theme on mount and when changed
    if (themeMode === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    localStorage.setItem('themeMode', themeMode);
  }, [themeMode]);

  React.useEffect(() => {
    if (token) {
      apiFetch('/api/settings', { headers: { Authorization: `Bearer ${token}` } })
        .then(res => res.json())
        .then(data => setSettings(data))
        .catch(console.error);
    }
  }, [token]);

  const toggleTheme = () => setThemeMode(themeMode === 'dark' ? 'light' : 'dark');
  const toggleSidebar = () => setIsSidebarOpen(!isSidebarOpen);

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

  // Close sidebar on route change for mobile
  React.useEffect(() => {
    setIsSidebarOpen(false);
  }, [location.pathname]);

  return (
    <div className="min-h-screen flex bg-zinc-50 dark:bg-zinc-950 transition-colors duration-300">
      {/* Mobile Overlay */}
      <AnimatePresence>
        {isSidebarOpen && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setIsSidebarOpen(false)}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 lg:hidden"
          />
        )}
      </AnimatePresence>

      {/* Sidebar */}
      <motion.aside 
        initial={false}
        animate={{ 
          x: (isSidebarOpen || window.innerWidth >= 1024) ? 0 : -280,
          opacity: (isSidebarOpen || window.innerWidth >= 1024) ? 1 : 0,
          width: (isSidebarOpen || window.innerWidth < 1024) ? 280 : (isSidebarCollapsed ? 80 : 280)
        }}
        className={cn(
          "fixed h-full glass-panel border-r border-zinc-200/50 dark:border-zinc-800/50 z-50 flex flex-col transition-all duration-300 ease-in-out lg:translate-x-0 lg:opacity-100",
          (!isSidebarOpen && window.innerWidth < 1024) && "pointer-events-none"
        )}
      >
        <div className="h-20 flex items-center justify-between px-6 border-b border-zinc-200/50 dark:border-zinc-800/50">
          <div className="flex items-center overflow-hidden">
            <div className="min-w-[32px] h-8 rounded-lg bg-yellow-600 flex items-center justify-center mr-3 scale-90">
              <Compass className="text-white w-5 h-5" />
            </div>
            {!isSidebarCollapsed && <span className="font-bold text-xl tracking-tight text-yellow-600 truncate">AdminPanel</span>}
          </div>
          <button 
            onClick={() => setIsSidebarOpen(false)}
            className="p-2 rounded-xl hover:bg-zinc-100 dark:hover:bg-zinc-800 lg:hidden"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
        
        <div className="flex-1 py-6 px-3 space-y-1.5 overflow-y-auto custom-scrollbar">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path || (item.path !== '/admin' && item.path !== '/dashboard' && location.pathname.startsWith(item.path));
            return (
              <Link 
                key={item.path} 
                to={item.path}
                title={isSidebarCollapsed ? item.name : ''}
                className={cn(
                  "flex items-center rounded-2xl transition-all duration-200 group",
                  isSidebarCollapsed ? "px-0 justify-center h-12 w-12 mx-auto" : "px-4 py-3",
                  isActive 
                    ? "bg-yellow-600 text-white shadow-lg shadow-yellow-600/20 font-medium" 
                    : "text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800/50"
                )}
              >
                <Icon className={cn("w-5 h-5 transition-transform group-hover:scale-110", !isSidebarCollapsed && "mr-3", isActive ? "text-white" : "opacity-70")} />
                {!isSidebarCollapsed && <span className="truncate">{item.name}</span>}
              </Link>
            );
          })}

          {user?.role !== 'admin' && !isSidebarCollapsed && (settings.youtubeLink || settings.telegramLink || settings.whatsappLink || settings.instagramLink) && (
            <div className="mt-8 pt-6 border-t border-zinc-200/50 dark:border-zinc-800/50">
              <span className="px-4 text-[10px] font-bold text-zinc-400 uppercase tracking-[0.2em] mb-4 block">Connect</span>
              <div className="grid grid-cols-2 gap-2 px-2">
                {settings.youtubeLink && (
                  <a href={settings.youtubeLink} target="_blank" rel="noopener noreferrer" className="flex flex-col items-center justify-center p-3 rounded-2xl bg-zinc-100 dark:bg-zinc-800/50 hover:text-red-500 transition-all hover:scale-105">
                    <Youtube className="w-5 h-5 mb-1" />
                    <span className="text-[10px] font-medium">YouTube</span>
                  </a>
                )}
                {settings.instagramLink && (
                  <a href={settings.instagramLink} target="_blank" rel="noopener noreferrer" className="flex flex-col items-center justify-center p-3 rounded-2xl bg-zinc-100 dark:bg-zinc-800/50 hover:text-pink-500 transition-all hover:scale-105">
                    <Instagram className="w-5 h-5 mb-1" />
                    <span className="text-[10px] font-medium">Insta</span>
                  </a>
                )}
                {settings.telegramLink && (
                  <a href={settings.telegramLink} target="_blank" rel="noopener noreferrer" className="flex flex-col items-center justify-center p-3 rounded-2xl bg-zinc-100 dark:bg-zinc-800/50 hover:text-blue-500 transition-all hover:scale-105">
                    <Send className="w-5 h-5 mb-1" />
                    <span className="text-[10px] font-medium">Telegram</span>
                  </a>
                )}
                {settings.whatsappLink && (
                  <a href={settings.whatsappLink} target="_blank" rel="noopener noreferrer" className="flex flex-col items-center justify-center p-3 rounded-2xl bg-zinc-100 dark:bg-zinc-800/50 hover:text-green-500 transition-all hover:scale-105">
                    <MessageCircle className="w-5 h-5 mb-1" />
                    <span className="text-[10px] font-medium">WhatsApp</span>
                  </a>
                )}
              </div>
            </div>
          )}
        </div>

        <div className="p-4 border-t border-zinc-200/50 dark:border-zinc-800/50">
          <button 
            onClick={logout}
            className={cn(
              "flex items-center text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 rounded-2xl transition-colors font-medium",
              isSidebarCollapsed ? "h-12 w-12 justify-center mx-auto" : "w-full px-4 py-3"
            )}
            title={isSidebarCollapsed ? 'Logout' : ''}
          >
            <LogOut className={cn("w-5 h-5 opacity-70", !isSidebarCollapsed && "mr-3")} />
            {!isSidebarCollapsed && <span>Logout</span>}
          </button>
        </div>
      </motion.aside>

      {/* Main Content */}
      <div className={cn(
        "flex-1 flex flex-col min-h-screen relative transition-all duration-300",
        isSidebarCollapsed ? "lg:ml-20" : "lg:ml-72"
      )}>
        <header className="h-20 glass-panel border-b border-zinc-200/50 dark:border-zinc-800/50 sticky top-0 z-30 flex items-center justify-between px-4 lg:px-8">
          <div className="flex items-center gap-4">
            <button 
              onClick={toggleSidebar}
              className="p-3 rounded-2xl bg-zinc-100 dark:bg-zinc-800/50 hover:bg-yellow-600 hover:text-white transition-all lg:hidden"
            >
              <Menu className="w-5 h-5" />
            </button>
            <button 
              onClick={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
              className="p-3 rounded-2xl bg-zinc-100 dark:bg-zinc-800/50 hover:bg-yellow-600 hover:text-white transition-all hidden lg:block"
            >
              <Menu className="w-5 h-5" />
            </button>
            <h2 className="text-xl font-bold tracking-tight text-zinc-800 dark:text-zinc-100 capitalize">
              {location.pathname.split('/').pop()?.replace('-', ' ') || 'Overview'}
            </h2>
          </div>
          
          <div className="flex items-center gap-3">
            <button onClick={toggleTheme} className="p-3 rounded-2xl bg-zinc-100 dark:bg-zinc-800/50 hover:bg-zinc-200 dark:hover:bg-zinc-700 transition-colors">
              {themeMode === 'dark' ? <Sun className="w-5 h-5 text-yellow-400" /> : <Moon className="w-5 h-5 text-zinc-600" />}
            </button>
            
            <div className="p-1 pr-4 rounded-2xl bg-zinc-100 dark:bg-zinc-800/50 flex items-center gap-3 border border-zinc-200/50 dark:border-zinc-800/50 hidden sm:flex">
              <div className="h-8 w-8 rounded-xl bg-yellow-600 flex items-center justify-center text-white font-bold text-sm">
                {user?.name?.charAt(0).toUpperCase()}
              </div>
              <span className="text-sm font-semibold opacity-80 max-w-[100px] truncate">{user?.name}</span>
            </div>
          </div>
        </header>
        
        <main className="flex-1 p-4 lg:p-8 overflow-x-hidden">
          <div className="max-w-7xl mx-auto">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
}
