import React, { useState, useEffect } from 'react';
import { GlassCard, Button, Input } from '../components/ui';
import { Link, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../lib/store';
import { Mail, Lock, User, AlertCircle, Phone, UserCheck } from 'lucide-react';

export function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [settings, setSettings] = useState<any>({});
  const { login } = useAuthStore();
  const navigate = useNavigate();

  useEffect(() => {
    fetch('/api/public-settings').then(res => res.json()).then(data => {
      setSettings(data);
    }).catch(console.error);
  }, []);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      
      login(data.token, data.user);
      navigate(data.user.role === 'admin' ? '/admin' : '/dashboard');
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-transparent p-4 relative overflow-hidden">
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-yellow-500/20 rounded-full blur-[100px]" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-purple-500/20 rounded-full blur-[100px]" />
      
      <GlassCard className="w-full max-w-md z-10 p-8 shadow-2xl">
        <div className="text-center mb-8">
          {(settings.ceoImage || settings.ceoName) && (
            <div className="flex flex-col items-center justify-center mb-6">
              <div className="w-20 h-20 rounded-full border-2 border-yellow-500 overflow-hidden mb-2 bg-zinc-800 flex items-center justify-center">
                {settings.ceoImage ? (
                  <img src={settings.ceoImage} alt={settings.ceoName} className="w-full h-full object-cover" />
                ) : (
                  <UserCheck className="w-8 h-8 text-yellow-500" />
                )}
              </div>
              <h3 className="text-sm font-semibold text-zinc-400 mb-1">Founder & CEO</h3>
              <div className="bg-black px-4 py-1.5 rounded-lg border-2 border-yellow-500 shadow-xl shadow-yellow-500/10">
                <p className="font-black text-xl text-yellow-500 uppercase tracking-widest">{settings.ceoName || 'Shivam Nirmalkar'}</p>
              </div>
            </div>
          )}
          <h2 className="text-3xl font-bold mb-2">Welcome back</h2>
          <p className="text-zinc-500">Sign in to your account to continue</p>
        </div>

        {error && (
          <div className="mb-6 p-4 rounded-xl bg-red-50 dark:bg-red-900/30 text-red-600 dark:text-red-400 flex items-center gap-3">
            <AlertCircle className="w-5 h-5 flex-shrink-0" />
            <p className="font-medium text-sm">{error}</p>
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-5">
          <div>
            <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1.5 ml-1">Email Address</label>
            <div className="relative border-zinc-200 focus-within:border-yellow-500 rounded-xl">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-zinc-400">
                <Mail className="w-5 h-5" />
              </div>
              <Input 
                className="pl-11"
                type="email" 
                placeholder="you@example.com"
                value={email} 
                onChange={(e: any) => setEmail(e.target.value)}
                required
              />
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-1.5 px-1">
              <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300">Password</label>
              <a 
                href="https://wa.me/919516862495?text=Hi,%20I%20have%20forgotten%20my%20password.%20Can%20you%20help%20me%20recover%20it?" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-xs text-indigo-600 dark:text-indigo-400 hover:underline"
              >
                Forgot Password?
              </a>
            </div>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-zinc-400">
                <Lock className="w-5 h-5" />
              </div>
              <Input 
                className="pl-11"
                type="password" 
                placeholder="••••••••"
                value={password} 
                onChange={(e: any) => setPassword(e.target.value)}
                required
              />
            </div>
          </div>

          <Button type="submit" className="w-full py-3 mt-4" disabled={loading}>
            {loading ? 'Signing in...' : 'Sign In'}
          </Button>
        </form>

        <p className="text-center mt-8 text-sm text-zinc-600 dark:text-zinc-400">
          Don't have an account? <Link to="/register" className="font-medium text-yellow-600 dark:text-yellow-400 hover:text-yellow-500">Create one now</Link>
        </p>
      </GlassCard>
    </div>
  );
}

export function Register() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [mobile, setMobile] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [settings, setSettings] = useState<any>({});
  const navigate = useNavigate();

  useEffect(() => {
    fetch('/api/public-settings').then(res => res.json()).then(data => {
      setSettings(data);
    }).catch(console.error);
  }, []);

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, password, mobile })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      
      // Auto login after test
      const loginRes = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });
      const loginData = await loginRes.json();
      useAuthStore.getState().login(loginData.token, loginData.user);
      navigate('/dashboard');
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-transparent p-4 relative overflow-hidden">
      <div className="absolute top-1/4 right-1/4 w-96 h-96 bg-yellow-500/20 rounded-full blur-[100px]" />
      <div className="absolute bottom-1/4 left-1/4 w-96 h-96 bg-indigo-500/20 rounded-full blur-[100px]" />
      
      <GlassCard className="w-full max-w-md z-10 p-8 shadow-2xl">
        <div className="text-center mb-8">
          {(settings.ceoImage || settings.ceoName) && (
            <div className="flex flex-col items-center justify-center mb-6">
              <div className="w-20 h-20 rounded-full border-2 border-yellow-500 overflow-hidden mb-2 bg-zinc-800 flex items-center justify-center">
                {settings.ceoImage ? (
                  <img src={settings.ceoImage} alt={settings.ceoName} className="w-full h-full object-cover" />
                ) : (
                  <UserCheck className="w-8 h-8 text-yellow-500" />
                )}
              </div>
              <h3 className="text-sm font-semibold text-zinc-400 mb-1">Founder & CEO</h3>
              <div className="bg-black px-4 py-1.5 rounded-lg border-2 border-yellow-500 shadow-xl shadow-yellow-500/10">
                <p className="font-black text-xl text-yellow-500 uppercase tracking-widest">{settings.ceoName || 'Shivam Nirmalkar'}</p>
              </div>
            </div>
          )}
          <h2 className="text-3xl font-bold mb-2">Create an account</h2>
          <p className="text-zinc-500">Join us and access premium services</p>
        </div>

        {error && (
          <div className="mb-6 p-4 rounded-xl bg-red-50 dark:bg-red-900/30 text-red-600 dark:text-red-400 flex items-center gap-3">
            <AlertCircle className="w-5 h-5 flex-shrink-0" />
            <p className="font-medium text-sm">{error}</p>
          </div>
        )}

        <form onSubmit={handleRegister} className="space-y-5">
          <div>
            <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1.5 ml-1">Full Name</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-zinc-400">
                <User className="w-5 h-5" />
              </div>
              <Input 
                className="pl-11"
                placeholder="John Doe"
                value={name} 
                onChange={(e: any) => setName(e.target.value)}
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1.5 ml-1">Email Address</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-zinc-400">
                <Mail className="w-5 h-5" />
              </div>
              <Input 
                className="pl-11"
                type="email" 
                placeholder="you@example.com"
                value={email} 
                onChange={(e: any) => setEmail(e.target.value)}
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1.5 ml-1">Mobile Number</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-zinc-400">
                <Phone className="w-5 h-5" />
              </div>
              <Input 
                className="pl-11"
                type="tel" 
                placeholder="1234567890"
                value={mobile} 
                onChange={(e: any) => setMobile(e.target.value)}
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1.5 ml-1">Password</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-zinc-400">
                <Lock className="w-5 h-5" />
              </div>
              <Input 
                className="pl-11"
                type="password" 
                placeholder="••••••••"
                value={password} 
                onChange={(e: any) => setPassword(e.target.value)}
                required
                minLength={6}
              />
            </div>
          </div>

          <Button type="submit" className="w-full py-3 mt-4" disabled={loading}>
            {loading ? 'Creating account...' : 'Create Account'}
          </Button>
        </form>

        <p className="text-center mt-8 text-sm text-zinc-600 dark:text-zinc-400">
          Already have an account? <Link to="/login" className="font-medium text-yellow-600 dark:text-yellow-400 hover:text-yellow-500">Log in</Link>
        </p>
      </GlassCard>
    </div>
  );
}
