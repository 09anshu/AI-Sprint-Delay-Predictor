/**
 * Dashboard.jsx — Main dashboard page with SaaS-style analytics.
 * 
 * Features:
 *   - Summary cards (Total Projects, Sprints, Delayed, On-Time)
 *   - Sprint performance trends chart (Line/Area)
 *   - Delay distribution chart (Pie/Doughnut)
 *   - Recent activity feed
 */

import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/axios';
import toast from 'react-hot-toast';
import {
  HiOutlineFolder,
  HiOutlineLightningBolt,
  HiOutlineExclamationCircle,
  HiOutlineCheckCircle,
  HiOutlineClock,
  HiOutlineChartBar,
} from 'react-icons/hi';
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, PieChart, Pie, Cell, Legend,
} from 'recharts';

const COLORS = ['#10b981', '#f59e0b', '#ef4444'];

const Dashboard = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    fetchDashboardStats();
  }, []);

  const fetchDashboardStats = async () => {
    try {
      const res = await api.get('/sprints/stats/dashboard');
      setStats(res.data);
    } catch (error) {
      toast.error('Failed to load dashboard data');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-primary-500/30 border-t-primary-500 rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-dark-400">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  const summaryCards = [
    {
      label: 'Total Projects',
      value: stats?.totalProjects || 0,
      icon: HiOutlineFolder,
      color: 'from-primary-500 to-primary-400',
      bg: 'bg-primary-500/10',
      textColor: 'text-primary-400',
    },
    {
      label: 'Total Sprints',
      value: stats?.totalSprints || 0,
      icon: HiOutlineLightningBolt,
      color: 'from-teal-500 to-teal-400',
      bg: 'bg-teal-500/10',
      textColor: 'text-teal-400',
    },
    {
      label: 'Delayed Sprints',
      value: stats?.delayedSprints || 0,
      icon: HiOutlineExclamationCircle,
      color: 'from-red-500 to-red-400',
      bg: 'bg-red-500/10',
      textColor: 'text-red-400',
    },
    {
      label: 'On-Time Sprints',
      value: stats?.onTimeSprints || 0,
      icon: HiOutlineCheckCircle,
      color: 'from-emerald-500 to-emerald-400',
      bg: 'bg-emerald-500/10',
      textColor: 'text-emerald-400',
    },
  ];

  const pieData = stats?.severityDistribution
    ? [
        { name: 'Low', value: stats.severityDistribution.Low || 0 },
        { name: 'Medium', value: stats.severityDistribution.Medium || 0 },
        { name: 'High', value: stats.severityDistribution.High || 0 },
      ].filter(d => d.value > 0)
    : [];

  const performanceData = stats?.performanceData?.slice(0, 10) || [];

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-dark-100">Dashboard</h1>
          <p className="text-dark-400 text-sm mt-1">Overview of your sprint analytics and predictions</p>
        </div>
        <button onClick={() => navigate('/projects')} className="btn-primary">
          View Projects
        </button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {summaryCards.map((card, index) => (
          <div
            key={card.label}
            className="stat-card group"
            style={{ animationDelay: `${index * 100}ms` }}
          >
            <div className="flex items-center justify-between">
              <div className={`p-2.5 rounded-xl ${card.bg}`}>
                <card.icon className={`w-5 h-5 ${card.textColor}`} />
              </div>
              <span className={`text-3xl font-bold ${card.textColor}`}>
                {card.value}
              </span>
            </div>
            <p className="text-sm text-dark-400 mt-1">{card.label}</p>
          </div>
        ))}
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Performance Trends */}
        <div className="lg:col-span-2 glass-card p-6">
          <div className="flex items-center gap-2 mb-6">
            <HiOutlineChartBar className="w-5 h-5 text-primary-400" />
            <h2 className="text-lg font-semibold text-dark-200">Sprint Performance</h2>
          </div>
          {performanceData.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <AreaChart data={performanceData}>
                <defs>
                  <linearGradient id="colorCompletion" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#06b6d4" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#06b6d4" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="colorBugs" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#ef4444" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#ef4444" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                <XAxis dataKey="name" stroke="#64748b" fontSize={11} tickLine={false} />
                <YAxis stroke="#64748b" fontSize={11} tickLine={false} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#1e293b',
                    border: '1px solid #334155',
                    borderRadius: '12px',
                    color: '#e2e8f0',
                    fontSize: '12px',
                  }}
                />
                <Area type="monotone" dataKey="completion" stroke="#06b6d4" fill="url(#colorCompletion)" strokeWidth={2} name="Completion %" />
                <Area type="monotone" dataKey="bugs" stroke="#ef4444" fill="url(#colorBugs)" strokeWidth={2} name="Bugs" />
              </AreaChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex items-center justify-center h-[300px] text-dark-500">
              <div className="text-center">
                <HiOutlineChartBar className="w-12 h-12 mx-auto mb-2 opacity-30" />
                <p>No sprint data yet. Create sprints to see performance trends.</p>
              </div>
            </div>
          )}
        </div>

        {/* Delay Distribution */}
        <div className="glass-card p-6">
          <div className="flex items-center gap-2 mb-6">
            <HiOutlineExclamationCircle className="w-5 h-5 text-amber-400" />
            <h2 className="text-lg font-semibold text-dark-200">Risk Distribution</h2>
          </div>
          {pieData.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={100}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {pieData.map((entry, index) => (
                    <Cell key={entry.name} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Legend
                  formatter={(value) => <span style={{ color: '#94a3b8', fontSize: '12px' }}>{value}</span>}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#1e293b',
                    border: '1px solid #334155',
                    borderRadius: '12px',
                    color: '#e2e8f0',
                    fontSize: '12px',
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex items-center justify-center h-[300px] text-dark-500">
              <div className="text-center">
                <HiOutlineExclamationCircle className="w-12 h-12 mx-auto mb-2 opacity-30" />
                <p className="text-sm">No predictions yet</p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Recent Activity */}
      <div className="glass-card p-6">
        <div className="flex items-center gap-2 mb-6">
          <HiOutlineClock className="w-5 h-5 text-teal-400" />
          <h2 className="text-lg font-semibold text-dark-200">Recent Activity</h2>
        </div>
        {stats?.recentActivity?.length > 0 ? (
          <div className="space-y-3">
            {stats.recentActivity.map((activity) => (
              <div
                key={activity.id}
                className="flex items-center justify-between p-4 bg-dark-700/20 rounded-xl hover:bg-dark-700/40 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <div className={`w-2 h-2 rounded-full ${
                    activity.status === 'Delayed' ? 'bg-red-400' :
                    activity.status === 'Not Delayed' ? 'bg-emerald-400' : 'bg-dark-500'
                  }`}></div>
                  <div>
                    <p className="text-sm font-medium text-dark-200">{activity.name}</p>
                    <p className="text-xs text-dark-500">
                      {new Date(activity.date).toLocaleDateString('en-US', {
                        month: 'short', day: 'numeric', year: 'numeric'
                      })}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  {activity.severity !== 'N/A' && (
                    <span className={`text-xs px-2 py-1 rounded-lg ${
                      activity.severity === 'Low' ? 'badge-success' :
                      activity.severity === 'Medium' ? 'badge-warning' : 'badge-danger'
                    }`}>
                      {activity.severity}
                    </span>
                  )}
                  <span className={`text-xs font-medium ${
                    activity.status === 'Delayed' ? 'text-red-400' :
                    activity.status === 'Not Delayed' ? 'text-emerald-400' : 'text-dark-500'
                  }`}>
                    {activity.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8 text-dark-500">
            <HiOutlineClock className="w-12 h-12 mx-auto mb-2 opacity-30" />
            <p className="text-sm">No recent activity. Start by creating a project!</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Dashboard;
