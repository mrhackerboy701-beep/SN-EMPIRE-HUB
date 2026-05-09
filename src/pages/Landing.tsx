import * as React from 'react';
import { apiFetch } from '../lib/api';
import { GlassCard, Button } from '../components/ui';
import { Compass, UserCheck, TrendingUp, ShoppingBag, Gamepad2, ArrowRight, Sun, Moon, Users, ShoppingCart } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'motion/react';

// A simple count-up component
function AnimatedCounter({ endValue, duration = 2 }: { endValue: string, duration?: number }) {
  const [count, setCount] = React.useState(0);
  const target = parseInt(endValue.replace(/\D/g,'')) || 0;
  const suffix = endValue.replace(/[0-9]/g, '');

  React.useEffect(() => {
    if(!target) return;
    let start = 0;
    const increment = target / (duration * 60);
    const timer = setInterval(() => {
      start += increment;
      if(start >= target) {
        setCount(target);
        clearInterval(timer);
      } else {
        setCount(Math.floor(start));
      }
    }, 1000 / 60);
    return () => clearInterval(timer);
  }, [target, duration]);

  if(!target) return <span>{endValue}</span>;
  return <span>{count.toLocaleString()}{suffix}</span>;
}

export default function Landing() {
  const navigate = useNavigate();
  const [settings, setSettings] = React.useState<any>({});
  const [themeMode, setThemeMode] = React.useState(localStorage.getItem('themeMode') || 'dark');

  React.useEffect(() => {
    apiFetch('/api/public-settings').then(res => res.json()).then(data => {
      setSettings(data);
    }).catch(console.error);
  }, []);

  React.useEffect(() => {
    if (themeMode === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    localStorage.setItem('themeMode', themeMode);
  }, [themeMode]);

  const toggleTheme = () => setThemeMode(themeMode === 'dark' ? 'light' : 'dark');

  const websiteDescription = settings.websiteDescription || "This is a 3-in-1 platform where users can shop with Cash on Delivery, grow social media (likes, followers, views), and start an online business or join Free Fire tournaments.";
  const ceoDescription = settings.ceoDescription || "Digital Entrepreneur and Social Media Manager helping people grow online and start their own business.";
  const ceoName = settings.ceoName || "Shivam Nirmalkar";
  const liveStatsUsers = settings.liveStatsUsers || "10,000+";
  const liveStatsOrders = settings.liveStatsOrders || "25,000+";

  return (
    <div className="min-h-screen flex flex-col bg-transparent font-sans transition-colors duration-300">
      
      {/* Header */}
      <header className="absolute top-0 w-full p-6 flex justify-between items-center z-20 max-w-7xl mx-auto left-0 right-0">
        <div className="flex items-center gap-2">
          <div className="w-10 h-10 rounded-xl bg-yellow-500 shadow-lg shadow-yellow-500/20 flex items-center justify-center">
            <Compass className="text-black w-6 h-6" />
          </div>
        </div>
        <div className="flex items-center gap-4">
          <button onClick={toggleTheme} className="p-2 rounded-full hover:bg-zinc-200 dark:hover:bg-zinc-800 transition-colors">
            {themeMode === 'dark' ? <Sun className="w-5 h-5 text-yellow-400" /> : <Moon className="w-5 h-5 text-zinc-600" />}
          </button>
          <Link to="/login" className="font-semibold text-zinc-700 dark:text-zinc-300 hover:text-yellow-500 dark:hover:text-yellow-400 transition-colors">
            Login
          </Link>
          <Button className="bg-yellow-500 hover:bg-yellow-600 text-black font-bold rounded-xl" onClick={() => navigate('/register')}>
            Get Started
          </Button>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 flex flex-col justify-center items-center px-4 pt-24 pb-20 relative overflow-hidden">
        
        {/* Background glow effects */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-[10%] left-[50%] -translate-x-[50%] w-[600px] h-[600px] rounded-full bg-yellow-400/5 dark:bg-yellow-500/10 blur-[120px]" />
        </div>

        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="text-center max-w-4xl mx-auto z-10 w-full"
        >
          {/* Main Title */}
          <h1 className="text-5xl md:text-7xl font-extrabold tracking-tighter mb-4 text-zinc-900 dark:text-white">
            <span className="text-zinc-900 dark:text-white block drop-shadow-md">SN <span className="text-yellow-500 italic">Empire Hub</span></span>
          </h1>
          
          {/* Tagline */}
          <h2 className="text-2xl md:text-3xl font-bold text-zinc-600 dark:text-zinc-300 mb-8 tracking-tight">
            Shop <span className="text-yellow-500 mx-1">•</span> Grow <span className="text-yellow-500 mx-1">•</span> Earn – All in One Place
          </h2>

          {/* CEO Section (Moved to Top) */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.6 }}
            className="w-full max-w-2xl mx-auto mb-10"
          >
            <GlassCard className="relative overflow-hidden group border-yellow-500/20 hover:border-yellow-500/50 transition-all shadow-2xl shadow-yellow-500/10 bg-white/60 dark:bg-[#111111]/80 backdrop-blur-xl">
              <div className="absolute top-0 left-0 w-2 h-full bg-gradient-to-b from-yellow-400 to-yellow-600" />
              <div className="text-left flex flex-col md:flex-row items-center gap-6 p-4">
                <div className="w-32 h-40 rounded-2xl bg-zinc-200 dark:bg-zinc-800 border-4 border-yellow-500/30 flex items-center justify-center flex-shrink-0 relative overflow-hidden shadow-lg">
                   {settings.ceoImage ? (
                     <img src={settings.ceoImage} alt={ceoName} className="w-full h-full object-cover" />
                   ) : (
                     <UserCheck className="w-12 h-12 text-yellow-600 dark:text-yellow-400" />
                   )}
                </div>
                <div>
                  <h3 className="text-xs font-bold text-yellow-600 dark:text-yellow-500 uppercase tracking-widest mb-1">Founder & CEO</h3>
                  <h4 className="text-3xl font-black text-zinc-900 dark:text-white mb-2">{ceoName}</h4>
                  <p className="text-zinc-600 dark:text-zinc-300 text-lg leading-relaxed italic">"{ceoDescription}"</p>
                </div>
              </div>
            </GlassCard>
          </motion.div>

          {/* Description */}
          <p className="text-lg md:text-xl text-zinc-500 dark:text-zinc-400 mb-12 max-w-2xl mx-auto leading-relaxed border-b border-zinc-200 dark:border-zinc-800/60 pb-10">
            {websiteDescription}
          </p>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-16">
            <Button 
              className="text-lg px-8 py-6 bg-gradient-to-r from-yellow-400 to-yellow-600 hover:from-yellow-500 hover:to-yellow-700 hover:scale-105 transition-all text-black font-extrabold rounded-2xl shadow-xl shadow-yellow-500/20"
              onClick={() => navigate('/register')}
            >
              Get Started <ArrowRight className="ml-2 w-5 h-5" />
            </Button>
            <Button 
              variant="outline" 
              className="text-lg px-8 py-6 rounded-2xl bg-white/50 dark:bg-zinc-900/50 backdrop-blur font-semibold border-zinc-300 dark:border-zinc-700 hover:bg-zinc-100 dark:hover:bg-zinc-800 dark:text-white transition-all shadow-lg"
              onClick={() => navigate('/login')}
            >
              Login to Account
            </Button>
          </div>
          
          {/* Live Stats */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4, duration: 0.6 }}
            className="grid grid-cols-2 gap-4 max-w-2xl mx-auto mb-16"
          >
            <GlassCard className="flex flex-col items-center justify-center p-6 border-zinc-200 dark:border-zinc-800/80 bg-white/40 dark:bg-[#111111]/80 backdrop-blur-md shadow-xl">
              <Users className="w-8 h-8 text-yellow-500 mb-2" />
              <div className="text-3xl font-black text-zinc-900 dark:text-white mb-1">
                <AnimatedCounter endValue={liveStatsUsers} />
              </div>
              <div className="text-sm font-semibold text-zinc-500 uppercase tracking-widest">Total Users</div>
            </GlassCard>
            <GlassCard className="flex flex-col items-center justify-center p-6 border-zinc-200 dark:border-zinc-800/80 bg-white/40 dark:bg-[#111111]/80 backdrop-blur-md shadow-xl">
              <ShoppingCart className="w-8 h-8 text-yellow-500 mb-2" />
              <div className="text-3xl font-black text-zinc-900 dark:text-white mb-1">
                <AnimatedCounter endValue={liveStatsOrders} />
              </div>
              <div className="text-sm font-semibold text-zinc-500 uppercase tracking-widest">Orders / Customers</div>
            </GlassCard>
          </motion.div>

          {/* Features highlight */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-3xl mx-auto opacity-80">
            <div className="flex flex-col items-center gap-2"><ShoppingBag className="w-8 h-8 text-yellow-500 drop-shadow-md" /> <span className="text-sm font-semibold dark:text-white">Shopping (COD)</span></div>
            <div className="flex flex-col items-center gap-2"><TrendingUp className="w-8 h-8 text-yellow-500 drop-shadow-md" /> <span className="text-sm font-semibold dark:text-white">SMM Growth</span></div>
            <div className="flex flex-col items-center gap-2"><Gamepad2 className="w-8 h-8 text-yellow-500 drop-shadow-md" /> <span className="text-sm font-semibold dark:text-white">Tournaments</span></div>
            <div className="flex flex-col items-center gap-2"><Compass className="w-8 h-8 text-yellow-500 drop-shadow-md" /> <span className="text-sm font-semibold dark:text-white">Online Biz</span></div>
          </div>

        </motion.div>
      </main>
    </div>
  );
}
