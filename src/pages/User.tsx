import { apiFetch } from '../lib/api';
import * as React from 'react';
import { useAuthStore } from '../lib/store';
import { GlassCard, Button, Input } from '../components/ui';
import { 
  AlertCircle, 
  IndianRupee, 
  Compass, 
  CheckCircle2, 
  Shield, 
  Settings, 
  Link as LinkIcon, 
  Lock, 
  Users, 
  Youtube, 
  Send, 
  MessageCircle, 
  Upload, 
  Loader2, 
  History, 
  Check, 
  X, 
  Clock 
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { GoogleGenAI, Type } from "@google/genai";
import { cn } from '../lib/utils';

export function Dashboard() {
  const { user, token, updateUser } = useAuthStore();
  const [settings, setSettings] = React.useState<any>({});
  const navigate = useNavigate();

  React.useEffect(() => {
    apiFetch('/api/auth/me', {
      headers: { Authorization: `Bearer ${token}` }
    }).then(res => res.json()).then(data => {
      if(!data.error) updateUser(data);
    });

    apiFetch('/api/settings', {
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
  const [settings, setSettings] = React.useState<any>({});
  const { token, user, updateUser } = useAuthStore();
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    apiFetch('/api/auth/me', {
      headers: { Authorization: `Bearer ${token}` }
    }).then(res => res.json()).then(data => {
      if(!data.error) updateUser(data);
    });

    apiFetch('/api/settings', {
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
  const [file, setFile] = React.useState<File | null>(null);
  const [qrCode, setQrCode] = React.useState('');
  const [plans, setPlans] = React.useState<any[]>([]);
  const [selectedPlanId, setSelectedPlanId] = React.useState<number>(0);
  const [loading, setLoading] = React.useState(false);
  const [analyzing, setAnalyzing] = React.useState(false);
  const [msg, setMsg] = React.useState('');
  const [history, setHistory] = React.useState<any[]>([]);
  
  // Extracted details
  const [transactionId, setTransactionId] = React.useState('');
  const [amount, setAmount] = React.useState('');
  const [isToday, setIsToday] = React.useState<boolean | null>(null);

  const fetchHistory = () => {
    apiFetch('/api/user/payments', { headers: { Authorization: `Bearer ${token}` } })
      .then(res => res.json())
      .then(data => setHistory(Array.isArray(data) ? data : []));
  };

  React.useEffect(() => {
    apiFetch('/api/settings', {
      headers: { Authorization: `Bearer ${token}` }
    }).then(res => res.json()).then(data => setQrCode(data.upiQrCode));
    
    apiFetch('/api/plans', {
      headers: { Authorization: `Bearer ${token}` }
    }).then(res => res.json()).then(data => {
      if (Array.isArray(data)) {
         setPlans(data);
         if (data.length > 0) setSelectedPlanId(data[0].id);
      } else {
         setPlans([]);
      }
    }).catch(() => setPlans([]));

    fetchHistory();
  }, []);

  const analyzeImage = async (file: File) => {
    setAnalyzing(true);
    setMsg('');
    try {
      const reader = new FileReader();
      const base64Promise = new Promise<string>((resolve) => {
        reader.onload = () => resolve((reader.result as string).split(',')[1]);
        reader.readAsDataURL(file);
      });
      const base64 = await base64Promise;

      const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
      const response = await ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: [
          {
            parts: [
              { inlineData: { data: base64, mimeType: file.type } },
              { text: "Analyze this UPI payment screenshot. Extract the Transaction ID/UTR number and the Amount paid. Also check if the date mentioned in the screenshot is today (today's date is " + new Date().toLocaleDateString() + "). Return as JSON only." }
            ]
          }
        ],
        config: {
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              transactionId: { type: Type.STRING },
              amount: { type: Type.NUMBER },
              isToday: { type: Type.BOOLEAN },
              confidence: { type: Type.NUMBER }
            },
            required: ["transactionId", "amount", "isToday"]
          }
        }
      });

      const result = JSON.parse(response.text || '{}');
      setTransactionId(result.transactionId || '');
      setAmount(result.amount ? result.amount.toString() : '');
      setIsToday(result.isToday);
      
      if (result.isToday === false) {
        setMsg('Warning: This screenshot does not appear to be from today.');
      } else {
        setMsg('Screenshot analyzed successfully!');
      }
    } catch (err) {
      console.error(err);
      setMsg('AI Analysis failed, please enter details manually.');
    } finally {
      setAnalyzing(false);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      setFile(selectedFile);
      analyzeImage(selectedFile);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file || !selectedPlanId) return;
    setLoading(true);
    setMsg('');
    const form = new FormData();
    form.append('screenshot', file);
    form.append('planId', selectedPlanId.toString());
    form.append('transactionId', transactionId);
    form.append('amount', amount);

    try {
      const res = await apiFetch('/api/payments', {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
        body: form
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setMsg('Payment screenshot uploaded successfully. Pending approval.');
      setFile(null);
      setTransactionId('');
      setAmount('');
      setIsToday(null);
      fetchHistory();
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
          <h4 className="font-bold text-lg mb-6">Upload & Verify Proof</h4>
          
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="relative">
              <div className={cn(
                "border-2 border-dashed rounded-2xl p-8 transition-all flex flex-col items-center justify-center text-center",
                file ? "border-green-500 bg-green-50/10" : "border-zinc-300 dark:border-zinc-800 hover:border-yellow-500",
                analyzing && "opacity-50 pointer-events-none"
              )}>
                <input 
                  type="file" 
                  accept="image/*" 
                  onChange={handleFileChange}
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                  disabled={loading || analyzing}
                />
                
                {analyzing ? (
                  <div className="flex flex-col items-center">
                    <Loader2 className="w-10 h-10 text-yellow-600 animate-spin mb-3" />
                    <p className="font-medium text-zinc-700 dark:text-zinc-300">AI is analyzing screenshot...</p>
                    <p className="text-xs text-zinc-500 mt-1">Verifying date, amount and transaction ID</p>
                  </div>
                ) : file ? (
                  <div className="flex flex-col items-center">
                    <CheckCircle2 className="w-10 h-10 text-green-500 mb-3" />
                    <p className="font-medium text-zinc-700 dark:text-zinc-300">{file.name}</p>
                    <button type="button" onClick={() => setFile(null)} className="text-xs text-red-500 mt-2 hover:underline">Change File</button>
                  </div>
                ) : (
                  <div className="flex flex-col items-center">
                    <Upload className="w-10 h-10 text-zinc-400 mb-3" />
                    <p className="font-medium text-zinc-700 dark:text-zinc-300">Click or drag payment screenshot</p>
                    <p className="text-xs text-zinc-500 mt-1">Supports PNG, JPG (Max 5MB)</p>
                  </div>
                )}
              </div>
            </div>

            {(file || transactionId || amount) && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 animate-in fade-in slide-in-from-top-4">
                <div>
                  <label className="text-xs font-bold text-zinc-500 uppercase tracking-wider mb-1.5 block px-1">Transaction ID / UTR</label>
                  <Input 
                    placeholder="Enter Transaction ID" 
                    value={transactionId}
                    onChange={(e: any) => setTransactionId(e.target.value)}
                    required
                    className="bg-zinc-50 dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-zinc-500 uppercase tracking-wider mb-1.5 block px-1">Amount Paid (₹)</label>
                  <Input 
                    type="number"
                    placeholder="Enter Amount" 
                    value={amount}
                    onChange={(e: any) => setAmount(e.target.value)}
                    required
                    className="bg-zinc-50 dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800"
                  />
                </div>
              </div>
            )}

            {isToday === false && (
              <div className="p-4 rounded-xl bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 flex gap-3 text-red-600 dark:text-red-400 text-sm">
                <AlertCircle className="w-5 h-5 flex-shrink-0" />
                <p><strong>Warning:</strong> Our AI suggests this payment is not from today. Please ensure you are uploading a fresh screenshot.</p>
              </div>
            )}

            <Button type="submit" disabled={loading || analyzing || !file || !transactionId || !amount} className="w-full py-4 text-lg shadow-lg shadow-yellow-600/20 h-auto">
              {loading ? (
                <>
                  <Loader2 className="w-5 h-5 mr-2 animate-spin" /> Submitting...
                </>
              ) : 'Submit Payment Proof'}
            </Button>
          </form>
          {msg && <p className={cn("mt-4 text-sm font-semibold text-center", msg.includes('Error') || msg.includes('Warning') ? 'text-red-500' : 'text-green-500')}>{msg}</p>}
        </div>
      </GlassCard>

      {/* Payment History */}
      <section className="mt-12">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-xl bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center">
            <History className="w-5 h-5 text-zinc-600 dark:text-zinc-400" />
          </div>
          <div>
            <h2 className="text-2xl font-bold">Payment History</h2>
            <p className="text-sm text-zinc-500 font-medium">Track your recent transactions</p>
          </div>
        </div>

        <GlassCard className="p-0 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-zinc-50/50 dark:bg-zinc-900/50 text-zinc-500 text-[10px] uppercase font-bold tracking-[0.2em] border-b border-zinc-100 dark:border-zinc-800">
                  <th className="p-5">Date</th>
                  <th className="p-5">Amount</th>
                  <th className="p-5">Transaction ID</th>
                  <th className="p-5 text-center">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800">
                {history.length > 0 ? history.map((h) => (
                  <tr key={h.id} className="hover:bg-zinc-50/30 dark:hover:bg-zinc-800/30 transition-colors">
                    <td className="p-5">
                      <div className="flex flex-col">
                        <span className="font-semibold text-sm">{new Date(h.createdAt).toLocaleDateString()}</span>
                        <span className="text-[10px] text-zinc-400 font-bold">{new Date(h.createdAt).toLocaleTimeString()}</span>
                      </div>
                    </td>
                    <td className="p-5">
                      <span className="font-bold text-yellow-600 dark:text-yellow-400 text-lg">₹{h.amount}</span>
                    </td>
                    <td className="p-5">
                      <code className="bg-zinc-100 dark:bg-zinc-800 px-2 py-1 rounded text-xs font-mono opacity-80">{h.transactionId || '---'}</code>
                    </td>
                    <td className="p-5 text-center">
                      {h.status === 'approved' ? (
                        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400 text-[10px] font-bold uppercase tracking-wider">
                          <Check className="w-3 h-3" /> Approved
                        </div>
                      ) : h.status === 'rejected' ? (
                        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 text-[10px] font-bold uppercase tracking-wider">
                          <X className="w-3 h-3" /> Rejected
                        </div>
                      ) : (
                        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 text-[10px] font-bold uppercase tracking-wider">
                          <Clock className="w-3 h-3 animate-pulse" /> Pending
                        </div>
                      )}
                    </td>
                  </tr>
                )) : (
                  <tr>
                    <td colSpan={4} className="p-12 text-center text-zinc-400 font-medium italic">No payment history found.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </GlassCard>
      </section>
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
