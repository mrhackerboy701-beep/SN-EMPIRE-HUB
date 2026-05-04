import React, { useEffect, useState } from 'react';
import { useAuthStore } from '../lib/store';
import { GlassCard, Button, Input } from '../components/ui';
import { Users, IndianRupee, Activity, CheckCircle2, XCircle, Check, X, ShieldAlert, Plus, Trash2 } from 'lucide-react';

// Admin Components
export function AdminDashboard() {
  const { token } = useAuthStore();
  const [stats, setStats] = useState<any>({});

  useEffect(() => {
    fetch('/api/admin/stats', {
      headers: { Authorization: `Bearer ${token}` }
    }).then(res => res.json()).then(data => setStats(data));
  }, []);

  const statCards = [
    { title: 'Total Users', value: stats.totalUsers || 0, icon: Users, color: 'blue' },
    { title: 'Active Subscribers', value: stats.activeUsers || 0, icon: CheckCircle2, color: 'green' },
    { title: 'Pending Approvals', value: stats.pendingPayments || 0, icon: Activity, color: 'amber' },
    { title: 'Total Revenue', value: `₹${stats.totalRevenue || 0}`, icon: IndianRupee, color: 'purple' },
  ];

  return (
    <div className="space-y-8">
      <header className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Admin Dashboard</h1>
        <p className="text-zinc-500">Platform overview and statistics.</p>
      </header>

      <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statCards.map((s, i) => (
          <GlassCard key={i}>
            <div className="flex justify-between items-start mb-4">
              <div className={`w-12 h-12 rounded-xl bg-${s.color}-100 dark:bg-${s.color}-900/50 text-${s.color}-600 dark:text-${s.color}-400 flex items-center justify-center`}>
                <s.icon className="w-6 h-6" />
              </div>
            </div>
            <h3 className="text-3xl font-bold mb-1">{s.value}</h3>
            <p className="text-zinc-500 font-medium">{s.title}</p>
          </GlassCard>
        ))}
      </div>
    </div>
  );
}

export function AdminUsers() {
  const { token } = useAuthStore();
  const [users, setUsers] = useState<any[]>([]);

  const fetchUsers = () => {
    fetch('/api/admin/users', { headers: { Authorization: `Bearer ${token}` } })
      .then(res => res.json())
      .then(data => setUsers(data));
  };
  
  useEffect(() => fetchUsers(), []);

  const toggleUserStatus = async (id: number, currentStatus: string) => {
    const newStatus = currentStatus === 'active' ? 'blocked' : 'active';
    await fetch(`/api/admin/users/${id}/status`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      body: JSON.stringify({ status: newStatus })
    });
    fetchUsers();
  };

  return (
    <div className="space-y-8 max-w-6xl">
      <header className="mb-8 flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold mb-2">User Management</h1>
          <p className="text-zinc-500">View and manage all registered users.</p>
        </div>
      </header>

      <GlassCard className="p-0 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-zinc-50/50 dark:bg-zinc-900/60 border-b border-zinc-200 dark:border-zinc-800">
                <th className="p-4 font-semibold text-sm">User</th>
                <th className="p-4 font-semibold text-sm">Contact Info</th>
                <th className="p-4 font-semibold text-sm">Password</th>
                <th className="p-4 font-semibold text-sm">Joined</th>
                <th className="p-4 font-semibold text-sm">Sub Status</th>
                <th className="p-4 font-semibold text-sm">Total Paid</th>
                <th className="p-4 font-semibold text-sm">Account Status</th>
                <th className="p-4 font-semibold text-sm text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800">
              {users.map(u => (
                <tr key={u.id} className="hover:bg-zinc-50/30 dark:hover:bg-zinc-800/30 transition-colors">
                  <td className="p-4 font-medium">{u.name}</td>
                  <td className="p-4 text-sm text-zinc-500">
                    <div>{u.email}</div>
                    {u.mobile && <div className="text-xs text-zinc-400 mt-1">{u.mobile}</div>}
                  </td>
                  <td className="p-4 text-sm font-mono text-zinc-900 dark:text-zinc-100">{u.plainPassword || 'Hidden'}</td>
                  <td className="p-4 text-sm text-zinc-500">{new Date(u.joinDate).toLocaleDateString()}</td>
                  <td className="p-4">
                    <span className={`inline-flex px-2.5 py-1 rounded-full text-xs font-semibold ${u.subscriptionStatus === 'active' ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' : 'bg-zinc-100 text-zinc-700 dark:bg-zinc-900 dark:text-zinc-300'}`}>
                      {u.subscriptionStatus}
                    </span>
                  </td>
                  <td className="p-4 font-mono font-medium">₹{u.totalPaid}</td>
                  <td className="p-4">
                    <span className={`inline-flex px-2.5 py-1 rounded-full text-xs font-semibold ${u.status === 'blocked' ? 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400' : 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400'}`}>
                      {u.status}
                    </span>
                  </td>
                  <td className="p-4 text-right">
                    <Button 
                      variant={u.status === 'blocked' ? 'outline' : 'ghost'}
                      className={u.status === 'blocked' ? '' : 'text-red-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20'}
                      onClick={() => toggleUserStatus(u.id, u.status)}
                    >
                      {u.status === 'blocked' ? 'Unblock' : 'Block'}
                    </Button>
                  </td>
                </tr>
              ))}
              {users.length === 0 && (
                <tr><td colSpan={8} className="p-8 text-center text-zinc-500">No users found.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </GlassCard>
    </div>
  );
}

export function AdminPayments() {
  const { token } = useAuthStore();
  const [payments, setPayments] = useState<any[]>([]);

  const fetchPayments = () => {
    fetch('/api/admin/payments', { headers: { Authorization: `Bearer ${token}` } })
      .then(res => res.json())
      .then(data => setPayments(data));
  };
  
  useEffect(() => fetchPayments(), []);

  const handleAction = async (id: number, status: string) => {
    await fetch(`/api/admin/payments/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      body: JSON.stringify({ status })
    });
    fetchPayments();
  };

  return (
    <div className="space-y-8 max-w-6xl">
      <header className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Payment Approvals</h1>
        <p className="text-zinc-500">Review and approve subscription payments.</p>
      </header>

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {payments.map(p => (
          <GlassCard key={p.id} className="flex flex-col">
            <div className="flex justify-between items-start mb-4">
              <div>
                <h3 className="font-bold">{p.userName}</h3>
                <p className="text-xs text-zinc-500">{p.userEmail}</p>
                <div className="mt-1 text-sm font-semibold text-yellow-600 dark:text-yellow-400">
                  {p.planName ? p.planName : 'Basic Plan'} - ₹{p.amount}
                </div>
              </div>
              <span className={`inline-flex px-2 py-1 rounded-full text-xs font-semibold ${
                p.status === 'pending' ? 'bg-yellow-100 text-yellow-700' :
                p.status === 'approved' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
              }`}>
                {p.status}
              </span>
            </div>
            
            <div className="bg-zinc-100 dark:bg-zinc-900 rounded-xl p-2 mb-4 h-48 flex items-center justify-center overflow-hidden">
              <a href={p.screenshotUrl} target="_blank" rel="noreferrer" className="block w-full h-full">
                <img src={p.screenshotUrl} alt="Payment proof" className="w-full h-full object-contain" />
              </a>
            </div>
            
            <div className="flex border-t border-zinc-200 dark:border-zinc-800 pt-4 mt-auto">
              <div className="flex-1">
                <div className="text-xs text-zinc-500">Amount</div>
                <div className="font-bold tracking-tight">₹{p.amount}</div>
              </div>
              <div className="flex-1 text-right">
                <div className="text-xs text-zinc-500">Date</div>
                <div className="text-sm font-medium">{new Date(p.createdAt).toLocaleDateString()}</div>
              </div>
            </div>
            
            {p.status === 'pending' && (
              <div className="flex gap-2 mt-4 pt-4 border-t border-zinc-200 dark:border-zinc-800">
                <Button variant="danger" className="flex-1 flex justify-center py-2" onClick={() => handleAction(p.id, 'rejected')}><X className="w-5 h-5"/></Button>
                <Button className="flex-1 flex justify-center bg-green-500 hover:bg-green-600 shadow-green-500/30 py-2" onClick={() => handleAction(p.id, 'approved')}><Check className="w-5 h-5"/></Button>
              </div>
            )}
          </GlassCard>
        ))}
        {payments.length === 0 && (
          <div className="col-span-full p-12 text-center text-zinc-500">
            No payments requiring approval right now.
          </div>
        )}
      </div>
    </div>
  );
}

export function AdminSettings() {
  const { token } = useAuthStore();
  const [settings, setSettings] = useState<any>({ serviceShopping: '', serviceSMM: '', serviceThird: '', themeColor: 'yellow' });
  const [file, setFile] = useState<File | null>(null);
  const [msg, setMsg] = useState('');
  const [plans, setPlans] = useState<any[]>([]);

  const fetchPlans = () => {
    fetch('/api/admin/plans', { headers: { Authorization: `Bearer ${token}` } })
      .then(res => res.json()).then(data => setPlans(data));
  };

  useEffect(() => {
    fetch('/api/settings', { headers: { Authorization: `Bearer ${token}` } })
      .then(res => res.json()).then(data => setSettings(data));
    fetchPlans();
  }, []);

  const handleUpdatePlatform = async (e: React.FormEvent) => {
    e.preventDefault();
    await fetch('/api/admin/settings', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      body: JSON.stringify({
        serviceShopping: settings.serviceShopping,
        serviceSMM: settings.serviceSMM,
        serviceThird: settings.serviceThird,
        serviceShoppingName: settings.serviceShoppingName,
        serviceSMMName: settings.serviceSMMName,
        serviceThirdName: settings.serviceThirdName,
        serviceFourth: settings.serviceFourth,
        serviceFourthName: settings.serviceFourthName,
        themeColor: settings.themeColor,
        youtubeLink: settings.youtubeLink,
        telegramLink: settings.telegramLink,
        whatsappLink: settings.whatsappLink,
        instagramLink: settings.instagramLink,
        websiteDescription: settings.websiteDescription,
        ceoDescription: settings.ceoDescription,
        ceoName: settings.ceoName,
        liveStatsUsers: settings.liveStatsUsers,
        liveStatsOrders: settings.liveStatsOrders
      })
    });
    setMsg('Settings updated successfully! Reloading to apply theme...');
    setTimeout(() => {
      setMsg('');
      window.location.reload();
    }, 1500);
  };

  const handleUploadQr = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file) return;
    const form = new FormData();
    form.append('qr', file);
    await fetch('/api/admin/qr', {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}` },
      body: form
    });
    setMsg('QR Code updated correctly!');
    setTimeout(() => setMsg(''), 3000);
  };

  const handleCeoImageUpload = async (e: any) => {
    const file = e.target.files[0];
    if (!file) return;
    const form = new FormData();
    form.append('image', file);
    const res = await fetch('/api/admin/ceo-image', {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}` },
      body: form
    });
    const data = await res.json();
    if (data.success) {
      setSettings((s: any) => ({ ...s, ceoImage: data.imageUrl }));
      setMsg('CEO Image uploaded successfully!');
      setTimeout(() => setMsg(''), 1500);
    }
  };

  const addPlan = async () => {
    await fetch('/api/admin/plans', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      body: JSON.stringify({ name: 'New Plan', price: 999, duration: 'monthly', features: 'New Feature', badge: '' })
    });
    fetchPlans();
  };

  const updatePlan = async (id: number, field: string, value: any) => {
    const plan = plans.find(p => p.id === id);
    if (!plan) return;
    const updated = { ...plan, [field]: value };
    await fetch(`/api/admin/plans/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      body: JSON.stringify(updated)
    });
    fetchPlans();
  };

  const deletePlan = async (id: number) => {
    await fetch(`/api/admin/plans/${id}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${token}` }
    });
    fetchPlans();
  };

  return (
    <div className="max-w-6xl space-y-8 pb-10">
      <header className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Platform Settings</h1>
        <p className="text-zinc-500">Configure global platform URLs, theme, and plans.</p>
      </header>

      {msg && (
        <div className="p-4 bg-green-50 text-green-700 dark:bg-green-900/30 dark:text-green-400 rounded-xl font-medium">
          {msg}
        </div>
      )}

      <div className="grid lg:grid-cols-2 gap-8">
        <GlassCard>
          <h3 className="text-xl font-bold mb-6 flex items-center gap-2"><CheckCircle2 className="w-5 h-5 text-yellow-500"/> Platform & Theme Settings</h3>
          <form onSubmit={handleUpdatePlatform} className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1">Theme Color</label>
              <select 
                className="w-full px-4 py-3 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white/50 dark:bg-zinc-900/60 backdrop-blur-sm focus:outline-none focus:ring-2 focus:ring-yellow-500 transition-all text-zinc-800 dark:text-white"
                value={settings.themeColor || 'yellow'} 
                onChange={(e) => setSettings({...settings, themeColor: e.target.value})}
              >
                <option value="yellow">Yellow & Black (Default)</option>
                <option value="blue">Blue & Black</option>
                <option value="purple">Purple & Black</option>
                <option value="green">Green & Black</option>
                <option value="red">Red & Black</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Shopping Platform Name</label>
              <Input 
                placeholder="Shopping Platform"
                value={settings.serviceShoppingName || ''} 
                onChange={(e: any) => setSettings({...settings, serviceShoppingName: e.target.value})}
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Shopping Platform URL</label>
              <Input 
                value={settings.serviceShopping || ''} 
                onChange={(e: any) => setSettings({...settings, serviceShopping: e.target.value})}
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">SMM Panel Name</label>
              <Input 
                placeholder="SMM Panel"
                value={settings.serviceSMMName || ''} 
                onChange={(e: any) => setSettings({...settings, serviceSMMName: e.target.value})}
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">SMM Panel URL</label>
              <Input 
                value={settings.serviceSMM || ''} 
                onChange={(e: any) => setSettings({...settings, serviceSMM: e.target.value})}
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Third Service Name</label>
              <Input 
                placeholder="Custom Tool"
                value={settings.serviceThirdName || ''} 
                onChange={(e: any) => setSettings({...settings, serviceThirdName: e.target.value})}
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Third Service URL</label>
              <Input 
                value={settings.serviceThird || ''} 
                onChange={(e: any) => setSettings({...settings, serviceThird: e.target.value})}
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Fourth Service Name</label>
              <Input 
                placeholder="Future Service"
                value={settings.serviceFourthName || ''} 
                onChange={(e: any) => setSettings({...settings, serviceFourthName: e.target.value})}
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Fourth Service URL</label>
              <Input 
                value={settings.serviceFourth || ''} 
                onChange={(e: any) => setSettings({...settings, serviceFourth: e.target.value})}
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">YouTube Link</label>
              <Input 
                placeholder="https://youtube.com/..."
                value={settings.youtubeLink || ''} 
                onChange={(e: any) => setSettings({...settings, youtubeLink: e.target.value})}
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Telegram Link</label>
              <Input 
                placeholder="https://t.me/..."
                value={settings.telegramLink || ''} 
                onChange={(e: any) => setSettings({...settings, telegramLink: e.target.value})}
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">WhatsApp Link</label>
              <Input 
                placeholder="https://wa.me/..."
                value={settings.whatsappLink || ''} 
                onChange={(e: any) => setSettings({...settings, whatsappLink: e.target.value})}
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Instagram Link</label>
              <Input 
                placeholder="https://instagram.com/..."
                value={settings.instagramLink || ''} 
                onChange={(e: any) => setSettings({...settings, instagramLink: e.target.value})}
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Website Description</label>
              <textarea 
                className="flex w-full rounded-md border border-zinc-300 dark:border-zinc-700 bg-transparent px-3 py-2 text-sm placeholder:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent dark:text-white"
                placeholder="This is a 3-in-1 platform..."
                rows={3}
                value={settings.websiteDescription !== undefined ? settings.websiteDescription : 'This is a 3-in-1 platform where users can shop with Cash on Delivery, grow social media (likes, followers, views), and start an online business or join Free Fire tournaments.'} 
                onChange={(e: any) => setSettings({...settings, websiteDescription: e.target.value})}
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Live Stats: Total Users (Display)</label>
              <Input 
                placeholder="e.g. 50,000+"
                value={settings.liveStatsUsers || ''} 
                onChange={(e: any) => setSettings({...settings, liveStatsUsers: e.target.value})}
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Live Stats: Total Orders/Customers</label>
              <Input 
                placeholder="e.g. 100,000+"
                value={settings.liveStatsOrders || ''} 
                onChange={(e: any) => setSettings({...settings, liveStatsOrders: e.target.value})}
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">CEO Name</label>
              <Input 
                placeholder="Shivam Nirmalkar"
                value={settings.ceoName !== undefined ? settings.ceoName : 'Shivam Nirmalkar'} 
                onChange={(e: any) => setSettings({...settings, ceoName: e.target.value})}
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">CEO Description</label>
              <textarea 
                className="flex w-full rounded-md border border-zinc-300 dark:border-zinc-700 bg-transparent px-3 py-2 text-sm placeholder:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent dark:text-white"
                placeholder="Digital Entrepreneur..."
                rows={2}
                value={settings.ceoDescription !== undefined ? settings.ceoDescription : 'Digital Entrepreneur and Social Media Manager helping people grow online and start their own business.'} 
                onChange={(e: any) => setSettings({...settings, ceoDescription: e.target.value})}
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">CEO Image Upload</label>
              <div className="flex items-center gap-4">
                <Input type="file" onChange={handleCeoImageUpload} accept="image/*" />
              </div>
              {settings.ceoImage && (
                <img src={settings.ceoImage} alt="CEO" className="mt-2 w-16 h-16 object-cover rounded-full border border-zinc-200 dark:border-zinc-800" />
              )}
            </div>
            <Button type="submit" className="mt-4 w-full">Save Platform Settings</Button>
          </form>
        </GlassCard>

        <GlassCard>
          <h3 className="text-xl font-bold mb-6 flex items-center gap-2"><IndianRupee className="w-5 h-5 text-yellow-500"/> Payment UPI QR</h3>
          <div className="mb-6">
            <p className="text-sm text-zinc-500 mb-3">Current QR Code:</p>
            {settings.upiQrCode ? (
              <img src={settings.upiQrCode} alt="QR" className="w-32 h-32 object-contain border border-zinc-200 dark:border-zinc-800 rounded-lg" />
            ) : <span className="text-zinc-400 italic text-sm">No QR uploaded yet</span>}
          </div>
          
          <form onSubmit={handleUploadQr} className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1">Upload New QR Code Image</label>
              <Input type="file" accept="image/*" onChange={(e: any) => setFile(e.target.files[0])} required />
            </div>
            <Button type="submit" variant="outline" className="w-full">Upload QR Code</Button>
          </form>
        </GlassCard>
      </div>

      <GlassCard>
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-xl font-bold flex items-center gap-2"><CheckCircle2 className="w-5 h-5 text-yellow-500"/> Subscription Plans</h3>
          <Button onClick={addPlan} className="py-2 px-4 flex items-center gap-2"><Plus className="w-4 h-4" /> Add Plan</Button>
        </div>
        
        <div className="space-y-4">
          {plans.map((p) => (
            <div key={p.id} className="border border-zinc-200 dark:border-zinc-800 rounded-xl p-4 flex flex-col md:flex-row gap-4 bg-zinc-50/50 dark:bg-zinc-900/30">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 flex-1">
                <div>
                  <label className="block text-xs font-medium mb-1 text-zinc-500">Plan Name</label>
                  <Input value={p.name} onChange={(e: any) => updatePlan(p.id, 'name', e.target.value)} className="py-2 text-sm" />
                </div>
                <div>
                  <label className="block text-xs font-medium mb-1 text-zinc-500">Price (₹)</label>
                  <Input type="number" value={p.price} onChange={(e: any) => updatePlan(p.id, 'price', parseInt(e.target.value))} className="py-2 text-sm" />
                </div>
                <div>
                  <label className="block text-xs font-medium mb-1 text-zinc-500">Duration</label>
                  <select 
                    className="w-full px-4 py-2 text-sm rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white/50 dark:bg-zinc-900/60 backdrop-blur-sm focus:outline-none focus:ring-2 focus:ring-yellow-500 transition-all text-zinc-800 dark:text-white"
                    value={p.duration} 
                    onChange={(e: any) => updatePlan(p.id, 'duration', e.target.value)}
                  >
                    <option value="monthly">Monthly</option>
                    <option value="lifetime">Lifetime</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-medium mb-1 text-zinc-500">Badge (Optional)</label>
                  <Input value={p.badge} onChange={(e: any) => updatePlan(p.id, 'badge', e.target.value)} className="py-2 text-sm" placeholder="e.g. POPULAR" />
                </div>
                <div className="col-span-2 md:col-span-4">
                  <label className="block text-xs font-medium mb-1 text-zinc-500">Features (Pipe | separated)</label>
                  <Input value={p.features} onChange={(e: any) => updatePlan(p.id, 'features', e.target.value)} className="py-2 text-sm" />
                </div>
              </div>
              <div className="flex items-center">
                <Button variant="danger" className="p-3" onClick={() => deletePlan(p.id)}><Trash2 className="w-5 h-5"/></Button>
              </div>
            </div>
          ))}
          {plans.length === 0 && <p className="text-zinc-500 text-center py-4">No plans configured.</p>}
        </div>
      </GlassCard>
    </div>
  );
}
