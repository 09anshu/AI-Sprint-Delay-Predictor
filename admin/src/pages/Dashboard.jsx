import { useState, useEffect } from 'react';
import api from '../api/axios';
import toast from 'react-hot-toast';
import KPICard from '../components/KPICard';
import { HiOutlineUsers, HiOutlineFolder, HiOutlineLightningBolt, HiOutlineExclamationCircle, HiOutlineShieldCheck, HiOutlineClock } from 'react-icons/hi';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, BarChart, Bar, PieChart, Pie, Cell, Legend, CartesianGrid } from 'recharts';

const COLORS = ['#10b981', '#f59e0b', '#ef4444'];

const Dashboard = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => { api.get('/dashboard').then(r => setStats(r.data)).catch(() => toast.error('Failed to load dashboard')).finally(() => setLoading(false)); }, []);

  if (loading) return <div className="flex items-center justify-center min-h-[60vh]"><div className="w-10 h-10 border-4 border-primary-500/30 border-t-primary-500 rounded-full animate-spin" /></div>;

  const pieData = stats?.riskDistribution ? Object.entries(stats.riskDistribution).filter(([,v]) => v > 0).map(([name, value]) => ({ name, value })) : [];
  const tooltipStyle = { backgroundColor: 'var(--tw-bg-opacity,1) == 1 ? #fff : #1e293b', borderRadius: '8px', border: '1px solid #e2e8f0', fontSize: '12px' };

  return (
    <div className="space-y-6 animate-fade-in">
      <div><h1 className="text-2xl font-bold">Dashboard</h1><p className="text-slate-500 text-sm mt-1">System overview and analytics</p></div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        <KPICard label="Total Users" value={stats?.totalUsers || 0} icon={HiOutlineUsers} color="primary" />
        <KPICard label="Total Projects" value={stats?.totalProjects || 0} icon={HiOutlineFolder} color="purple" />
        <KPICard label="Total Sprints" value={stats?.totalSprints || 0} icon={HiOutlineLightningBolt} color="amber" />
        <KPICard label="Delayed Sprints" value={stats?.delayedSprints || 0} icon={HiOutlineExclamationCircle} color="red" />
        <KPICard label="Prediction Accuracy" value={`${stats?.predictionAccuracy || 0}%`} icon={HiOutlineShieldCheck} color="green" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 card p-5">
          <h2 className="text-sm font-semibold mb-4">User Growth</h2>
          <ResponsiveContainer width="100%" height={280}>
            <AreaChart data={(stats?.userGrowth || []).map(d => ({ month: d._id, users: d.count }))}>
              <defs><linearGradient id="ug" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="#6366f1" stopOpacity={0.2} /><stop offset="95%" stopColor="#6366f1" stopOpacity={0} /></linearGradient></defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
              <XAxis dataKey="month" fontSize={11} stroke="#94a3b8" />
              <YAxis fontSize={11} stroke="#94a3b8" />
              <Tooltip contentStyle={tooltipStyle} />
              <Area type="monotone" dataKey="users" stroke="#6366f1" fill="url(#ug)" strokeWidth={2} />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        <div className="card p-5">
          <h2 className="text-sm font-semibold mb-4">Risk Distribution</h2>
          {pieData.length > 0 ? (
            <ResponsiveContainer width="100%" height={280}>
              <PieChart><Pie data={pieData} cx="50%" cy="50%" innerRadius={55} outerRadius={90} paddingAngle={4} dataKey="value">
                {pieData.map((e, i) => <Cell key={e.name} fill={COLORS[i % COLORS.length]} />)}
              </Pie><Legend formatter={v => <span style={{ color: '#64748b', fontSize: '12px' }}>{v}</span>} /><Tooltip /></PieChart>
            </ResponsiveContainer>
          ) : <div className="flex items-center justify-center h-[280px] text-slate-400 text-sm">No predictions yet</div>}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="card p-5">
          <h2 className="text-sm font-semibold mb-4">Sprint Delays per Month</h2>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={(stats?.sprintDelays || []).map(d => ({ month: d._id, delays: d.count }))}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
              <XAxis dataKey="month" fontSize={11} stroke="#94a3b8" />
              <YAxis fontSize={11} stroke="#94a3b8" />
              <Tooltip contentStyle={tooltipStyle} />
              <Bar dataKey="delays" fill="#ef4444" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="card p-5">
          <div className="flex items-center gap-2 mb-4"><HiOutlineClock className="w-4 h-4 text-slate-400" /><h2 className="text-sm font-semibold">Recent Activity</h2></div>
          <div className="space-y-2 max-h-[250px] overflow-y-auto">
            {(stats?.recentActivity || []).length > 0 ? stats.recentActivity.map((a, i) => (
              <div key={i} className="flex items-center justify-between p-3 rounded-xl bg-slate-50 dark:bg-slate-900/50 text-sm">
                <div><p className="font-medium text-xs">{a.action} → {a.target}</p><p className="text-xs text-slate-400">{a.userEmail || 'System'}</p></div>
                <span className="text-xs text-slate-400">{new Date(a.timestamp).toLocaleDateString()}</span>
              </div>
            )) : <p className="text-sm text-slate-400 text-center py-8">No recent activity</p>}
          </div>
        </div>
      </div>
    </div>
  );
};
export default Dashboard;
