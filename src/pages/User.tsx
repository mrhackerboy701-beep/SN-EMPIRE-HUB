import React, { useEffect, useState } from 'react';
import { useAuthStore } from '../lib/store';
import { GlassCard, Button, Input } from '../components/ui';
import { AlertCircle, IndianRupee, Compass, CheckCircle2, Shield, Settings, Link as LinkIcon, Lock, Users, Youtube, Send, MessageCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export function Dashboard() {
  const { user, token, updateUser } = useAuthStore();
  const [settings, setSettings] = useState<any>({});
  const navigate = useNavigate();

  useEffect(() => {
    // Refresh user data to get latest payment status
    fetch('/api/auth/me', {
      headers: { Authorization: `Bearer ${token}` }
    }).then(res => res.json()).then(data => {
      if(!data.error) updateUser(data);
    });

    fetch('/api/settings', {
      headers: { Authorization: `Bearer ${token}` }
    }).then(res => res.json()).then(data => {
      setSettings(data);
    });
  }, []);

  const isActive = user?.subscriptionStatus === 'active';

  return (
    <div className="space-y-8 max-w-6xl mx-auto">
      <header className="mb-10">
        <h1 className="text-3xl font-bold mb-2">Welcome back, {user?.name}</h1>
        <p className="text-zinc-500 text-lg">Here's your account overview.</p>
      </header>

      {!isActive && (
        <GlassCard className="border-l-4 border-yellow-500 bg-yellow-50/50 dark:bg-yellow-900/20">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-full bg-yellow-100 dark:bg-yellow-900/50 flex items-center justify-center flex-shrink-0">
              <AlertCircle className="w-6 h-6 text-yellow-600 dark:text-yellow-400" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-yellow-900 dark:text-yellow-200 mb-1">Subscription Inactive</h3>
              <p className="text-yellow-800/80 dark:text-yellow-300/80 mb-4">You need an active subscription (₹200/month) to access Premium Services.</p>
              <Button onClick={() => navigate('/payment')} className="bg-yellow-600 hover:bg-yellow-700 text-white shadow-yellow-500/30">Activate Plan Now</Button>
            </div>
          </div>
        </GlassCard>
      )}

      {isActive && (
        <GlassCard className="border-l-4 border-green-500 bg-green-50/50 dark:bg-green-900/20">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-full bg-green-100 dark:bg-green-900/50 flex items-center justify-center flex-shrink-0">
              <CheckCircle2 className="w-6 h-6 text-green-600 dark:text-green-400" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-green-900 dark:text-green-200 mb-1">Active Subscription</h3>
              <p className="text-green-800/80 dark:text-green-300/80">You have full access to all premium features.</p>
            </div>
          </div>
        </GlassCard>
      )}

      <div className="grid md:grid-cols-2 lg:grid-cols-2 gap-6 mb-8">
        <GlassCard>
          <div className="w-10 h-10 rounded-lg bg-indigo-100 dark:bg-indigo-900/50 text-indigo-600 dark:text-indigo-400 flex items-center justify-center mb-4">
            <Shield className="w-5 h-5" />
          </div>
          <h3 className="text-lg font-bold mb-1">Plan Name</h3>
          <p className="text-zinc-500 mb-4">{user?.planName || 'Free'}</p>
          <Button variant="outline" className="w-full" onClick={() => navigate('/payment')}>Upgrade Plan</Button>
        </GlassCard>

        <GlassCard>
          <div className="w-10 h-10 rounded-lg bg-yellow-100 dark:bg-yellow-900/50 text-yellow-600 dark:text-yellow-400 flex items-center justify-center mb-4">
            <Compass className="w-5 h-5" />
          </div>
          <h3 className="text-lg font-bold mb-1">Services Status</h3>
          <p className="text-zinc-500 mb-4">{isActive ? 'Active' : 'Locked'}</p>
          <Button variant="outline" className="w-full" onClick={() => navigate('/services')}>View Services</Button>
        </GlassCard>
      </div>

    </div>
  );
}

export function Services() {
  const [settings, setSettings] = useState<any>({});
  const { token, user, updateUser } = useAuthStore();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Refresh user data to get latest payment status
    fetch('/api/auth/me', {
      headers: { Authorization: `Bearer ${token}` }
    }).then(res => res.json()).then(data => {
      if(!data.error) updateUser(data);
    });

    fetch('/api/settings', {
      headers: { Authorization: `Bearer ${token}` }
    }).then(res => res.json()).then(data => {
      setSettings(data);
      setLoading(false);
    });
  }, [token]);

  const isActive = user?.subscriptionStatus === 'active';

  const services = [
    { title: settings.serviceShoppingName || 'Shopping Platform', desc: 'Premium e-commerce tools', url: settings.serviceShopping, icon: Compass, color: 'blue' },
    { title: settings.serviceSMMName || 'SMM Panel', desc: 'Social media management', url: settings.serviceSMM, icon: Settings, color: 'purple' },
    { title: settings.serviceThirdName || 'Custom Tool', desc: 'Analytics & more', url: settings.serviceThird, icon: Shield, color: 'emerald' },
  ];

  if (settings.serviceFourthName || settings.serviceFourth) {
    services.push({ title: settings.serviceFourthName || 'Additional Service', desc: 'Extra premium tools', url: settings.serviceFourth, icon: LinkIcon, color: 'indigo' });
  }

  if (loading) return <div>Loading...</div>;

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      <header className="mb-10">
        <h1 className="text-3xl font-bold mb-2">Connected Services</h1>
        <p className="text-zinc-500 text-lg">Access your premium tools.</p>
      </header>

      <div className="grid md:grid-cols-3 gap-6">
        {services.map((s, i) => (
          <GlassCard key={i} className="flex flex-col relative overflow-hidden group">
            {!isActive && (
              <div className="absolute inset-0 z-10 bg-zinc-100/60 dark:bg-black/60 backdrop-blur-[2px] flex flex-col items-center justify-center">
                <div className="w-12 h-12 rounded-full bg-white dark:bg-zinc-900 shadow-lg flex items-center justify-center mb-3">
                  <Lock className="w-5 h-5 text-zinc-500" />
                </div>
                <span className="font-semibold text-zinc-700 dark:text-zinc-300">Locked</span>
              </div>
            )}
            
            <div className={`w-14 h-14 rounded-2xl bg-${s.color}-100 dark:bg-${s.color}-900/50 text-${s.color}-600 dark:text-${s.color}-400 flex items-center justify-center mb-6 transition-transform group-hover:scale-110`}>
              <s.icon className="w-7 h-7" />
            </div>
            <h3 className="text-xl font-bold mb-2">{s.title}</h3>
            <p className="text-zinc-500 mb-6 flex-1">{s.desc}</p>
            
            <a 
              href={isActive ? s.url : '#'} 
              target={isActive ? "_blank" : "_self"} 
              rel="noreferrer"
              className="inline-flex w-full items-center justify-center gap-2 px-4 py-2.5 rounded-xl font-medium transition-colors bg-zinc-100 hover:bg-zinc-200 text-zinc-800 dark:bg-zinc-900 dark:hover:bg-zinc-700 dark:text-zinc-200"
            >
              <LinkIcon className="w-4 h-4" /> Open Now
            </a>
          </GlassCard>
        ))}
      </div>
    </div>
  );
}

export function Payment() {
  const { token, user } = useAuthStore();
  const [file, setFile] = useState<File | null>(null);
  const [qrCode, setQrCode] = useState('');
  const [plans, setPlans] = useState<any[]>([]);
  const [selectedPlanId, setSelectedPlanId] = useState<number>(0);
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState('');

  useEffect(() => {
    fetch('/api/settings', {
      headers: { Authorization: `Bearer ${token}` }
    }).then(res => res.json()).then(data => setQrCode(data.upiQrCode));
    
    fetch('/api/plans', {
      headers: { Authorization: `Bearer ${token}` }
    }).then(res => res.json()).then(data => {
      setPlans(data);
      if (data.length > 0) setSelectedPlanId(data[0].id);
    });
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file || !selectedPlanId) return;
    setLoading(true);
    setMsg('');
    const form = new FormData();
    form.append('screenshot', file);
    form.append('planId', selectedPlanId.toString());

    try {
      const res = await fetch('/api/payments', {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
        body: form
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setMsg('Payment screenshot uploaded successfully. Pending approval.');
      setFile(null);
    } catch (err: any) {
      setMsg(err.message || 'Error uploading file');
    } finally {
      setLoading(false);
    }
  };

  const selectedPlan = plans.find(p => p.id === selectedPlanId);

  return (
    <div className="max-w-4xl mx-auto space-y-8 pb-10">
      <header className="mb-10 text-center">
        <h1 className="text-3xl font-bold mb-2">Subscription & Payment</h1>
        <p className="text-zinc-500 text-lg">Purchase or upgrade your premium plan.</p>
      </header>

      <div className="grid md:grid-cols-3 gap-6 mb-8">
        {plans.map(p => (
           <GlassCard 
              key={p.id} 
              className={`cursor-pointer transition-all border-2 ${selectedPlanId === p.id ? 'border-yellow-500 scale-105 shadow-yellow-500/20 shadow-xl' : 'border-transparent hover:border-zinc-300 dark:hover:border-zinc-600'}`}
              onClick={() => setSelectedPlanId(p.id)}
           >
              {p.badge && <div className="absolute top-0 right-0 bg-yellow-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-bl-lg rounded-tr-xl">{p.badge}</div>}
              <h3 className="font-bold text-lg mb-1">{p.name}</h3>
              <div className="text-3xl font-extrabold text-yellow-600 dark:text-yellow-400 mb-1">₹{p.price}</div>
              <p className="text-xs text-zinc-500 uppercase font-medium tracking-wider mb-4">{p.duration}</p>
              <ul className="space-y-2 text-sm">
                {p.features?.split('|').filter(Boolean).map((f: string, i: number) => (
                   <li key={i} className="flex items-start gap-2">
                     <CheckCircle2 className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                     <span className="text-zinc-600 dark:text-zinc-400">{f}</span>
                   </li>
                ))}
              </ul>
           </GlassCard>
        ))}
      </div>

      <GlassCard className="p-8">
        {selectedPlan ? (
          <div className="flex flex-col md:flex-row gap-8 items-center">
            <div className="flex-1 text-center md:text-left">
              <h3 className="text-2xl font-bold mb-2">Selected: {selectedPlan.name}</h3>
              <div className="text-4xl font-extrabold text-yellow-600 dark:text-yellow-400 mb-4">₹{selectedPlan.price} <span className="text-lg font-medium text-zinc-500">/ {selectedPlan.duration}</span></div>
              <p className="text-zinc-600 dark:text-zinc-400 mb-6">Scan the QR code to pay using any UPI app (GPay, PhonePe, Paytm). Then upload the screenshot below.</p>
            </div>
            
            <div className="w-48 h-48 rounded-xl border-2 border-dashed border-zinc-300 dark:border-zinc-800 p-2 flex items-center justify-center bg-white flex-shrink-0">
              {qrCode ? (
                <img src={qrCode} alt="UPI QR Code" className="w-full h-full object-contain rounded-lg" />
              ) : (
                <span className="text-zinc-400 text-sm italic">Admin hasn't set QR yet</span>
              )}
            </div>
          </div>
        ) : (
          <div className="text-center py-8 text-zinc-500">Please select a plan above.</div>
        )}

        <div className="mt-10 pt-8 border-t border-zinc-200 dark:border-zinc-800">
          <h4 className="font-bold text-lg mb-4">Upload screenshot</h4>
          <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-4 items-end">
            <div className="flex-1 w-full">
              <Input 
                type="file" 
                accept="image/*" 
                onChange={(e: any) => setFile(e.target.files[0])}
                required
                className="bg-transparent border-dashed border-2 py-8 cursor-pointer"
              />
            </div>
            <Button type="submit" disabled={loading || !file || !selectedPlanId} className="w-full sm:w-auto min-w-[150px] py-3 h-[90px]">
              {loading ? 'Uploading...' : 'Submit Proof'}
            </Button>
          </form>
          {msg && <p className={`mt-4 text-sm font-medium ${msg.includes('Error') ? 'text-red-500' : 'text-green-500'}`}>{msg}</p>}
        </div>
      </GlassCard>
    </div>
  );
}

export function Profile() {
  const { user } = useAuthStore();
  return (
    <div className="max-w-2xl mx-auto space-y-8">
       <header className="mb-10">
        <h1 className="text-3xl font-bold mb-2">Your Profile</h1>
      </header>
      <GlassCard>
        <div className="flex items-center gap-6 mb-8">
          <div className="w-24 h-24 rounded-full bg-gradient-to-r from-yellow-500 to-yellow-500 flex items-center justify-center text-white text-3xl font-bold">
            {user?.name?.charAt(0)}
          </div>
          <div>
            <h2 className="text-2xl font-bold mb-1">{user?.name}</h2>
            <p className="text-zinc-500">{user?.email}</p>
          </div>
        </div>
        
        <div className="space-y-4 pt-6 border-t border-zinc-200 dark:border-zinc-800">
          <div className="flex justify-between py-2 border-b border-zinc-100 dark:border-zinc-800">
            <span className="text-zinc-500">Status</span>
            <span className="font-medium capitalize">{user?.status}</span>
          </div>
          <div className="flex justify-between py-2 border-b border-zinc-100 dark:border-zinc-800">
            <span className="text-zinc-500">Subscription</span>
            <span className="font-medium capitalize">{user?.subscriptionStatus}</span>
          </div>
          <div className="flex justify-between py-2 border-b border-zinc-100 dark:border-zinc-800">
            <span className="text-zinc-500">Role</span>
            <span className="font-medium capitalize">{user?.role}</span>
          </div>
        </div>
      </GlassCard>
    </div>
  );
}
