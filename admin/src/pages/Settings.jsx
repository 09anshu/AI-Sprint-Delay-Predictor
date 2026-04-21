import { useState, useEffect } from 'react';
import api from '../api/axios';
import toast from 'react-hot-toast';
import { HiOutlineCog, HiOutlineServer, HiOutlineKey, HiOutlineDatabase, HiOutlineShieldCheck } from 'react-icons/hi';

const Settings = () => {
  const [settings, setSettings] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => { api.get('/settings').then(r => setSettings(r.data)).catch(() => toast.error('Failed')).finally(() => setLoading(false)); }, []);

  if (loading) return <div className="flex items-center justify-center min-h-[60vh]"><div className="w-10 h-10 border-4 border-primary-500/30 border-t-primary-500 rounded-full animate-spin" /></div>;

  const items = [
    { icon: HiOutlineServer, label: 'ML Service URL', value: settings?.mlServiceUrl, desc: 'Machine learning prediction endpoint' },
    { icon: HiOutlineKey, label: 'JWT Expiry', value: settings?.jwtExpiresIn, desc: 'Token expiration duration' },
    { icon: HiOutlineDatabase, label: 'MongoDB', value: settings?.mongoUri, desc: 'Database connection status' },
    { icon: HiOutlineCog, label: 'Server Port', value: settings?.serverPort, desc: 'Backend API server port' },
    { icon: HiOutlineCog, label: 'Environment', value: settings?.nodeEnv, desc: 'Node.js environment mode' },
  ];

  return (
    <div className="space-y-6 animate-fade-in">
      <div><h1 className="text-2xl font-bold">Settings</h1><p className="text-slate-500 text-sm mt-1">System configuration and API settings</p></div>

      <div className="card divide-y divide-slate-200 dark:divide-slate-800">
        {items.map((item, i) => (
          <div key={i} className="flex items-center gap-4 p-5">
            <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800"><item.icon className="w-5 h-5 text-slate-500" /></div>
            <div className="flex-1"><p className="text-sm font-medium">{item.label}</p><p className="text-xs text-slate-400">{item.desc}</p></div>
            <code className="text-sm bg-slate-50 dark:bg-slate-800 px-3 py-1.5 rounded-lg text-slate-600 dark:text-slate-300">{item.value}</code>
          </div>
        ))}
      </div>

      <div className="card p-5">
        <div className="flex items-center gap-2 mb-4"><HiOutlineShieldCheck className="w-5 h-5 text-primary-500" /><h2 className="text-sm font-semibold">Roles & Permissions</h2></div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {(settings?.roles || []).map(r => (
            <div key={r} className="flex items-center justify-between p-4 rounded-xl bg-slate-50 dark:bg-slate-800">
              <div><p className="text-sm font-medium capitalize">{r}</p><p className="text-xs text-slate-400">{r === 'admin' ? 'Full system access' : 'Standard user access'}</p></div>
              <span className={r === 'admin' ? 'badge-info' : 'badge-neutral'}>{r}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
export default Settings;
