import { useState, useEffect } from 'react';
import api from '../api/axios';
import toast from 'react-hot-toast';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, Legend } from 'recharts';

const Analytics = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => { api.get('/analytics').then(r => setData(r.data)).catch(() => toast.error('Failed to load analytics')).finally(() => setLoading(false)); }, []);

  if (loading) return <div className="flex items-center justify-center min-h-[60vh]"><div className="w-10 h-10 border-4 border-primary-500/30 border-t-primary-500 rounded-full animate-spin" /></div>;

  const trendData = (data?.delayTrends || []).map(d => ({ month: d._id, delayed: d.delayed, onTime: d.onTime, total: d.total }));
  const bugData = (data?.bugCorrelation || []).map(d => ({ status: d._id, avgBugs: Math.round(d.avgBugs * 10) / 10, avgPoints: Math.round(d.avgStoryPoints * 10) / 10, count: d.count }));
  const teamData = (data?.teamPerformance || []).map(d => ({ name: d.project?.projectName || 'Unknown', delayed: d.delayed, total: d.totalSprints, completion: Math.round((d.avgCompletion || 0) * 100) }));

  return (
    <div className="space-y-6 animate-fade-in">
      <div><h1 className="text-2xl font-bold">Analytics</h1><p className="text-slate-500 text-sm mt-1">Advanced sprint and performance analytics</p></div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="card p-5">
          <h2 className="text-sm font-semibold mb-4">Delay Trends Over Time</h2>
          {trendData.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={trendData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis dataKey="month" fontSize={11} stroke="#94a3b8" />
                <YAxis fontSize={11} stroke="#94a3b8" />
                <Tooltip />
                <Legend />
                <Line type="monotone" dataKey="delayed" stroke="#ef4444" strokeWidth={2} name="Delayed" />
                <Line type="monotone" dataKey="onTime" stroke="#10b981" strokeWidth={2} name="On Time" />
              </LineChart>
            </ResponsiveContainer>
          ) : <div className="flex items-center justify-center h-[300px] text-slate-400 text-sm">No trend data available</div>}
        </div>

        <div className="card p-5">
          <h2 className="text-sm font-semibold mb-4">Bug vs Delay Correlation</h2>
          {bugData.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={bugData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis dataKey="status" fontSize={11} stroke="#94a3b8" />
                <YAxis fontSize={11} stroke="#94a3b8" />
                <Tooltip />
                <Legend />
                <Bar dataKey="avgBugs" fill="#ef4444" radius={[4, 4, 0, 0]} name="Avg Bugs" />
                <Bar dataKey="avgPoints" fill="#6366f1" radius={[4, 4, 0, 0]} name="Avg Story Points" />
              </BarChart>
            </ResponsiveContainer>
          ) : <div className="flex items-center justify-center h-[300px] text-slate-400 text-sm">No correlation data</div>}
        </div>
      </div>

      <div className="card p-5">
        <h2 className="text-sm font-semibold mb-4">Team Performance (Top 10 Projects)</h2>
        {teamData.length > 0 ? (
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={teamData} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
              <XAxis type="number" fontSize={11} stroke="#94a3b8" />
              <YAxis type="category" dataKey="name" fontSize={11} stroke="#94a3b8" width={120} />
              <Tooltip />
              <Legend />
              <Bar dataKey="delayed" fill="#ef4444" radius={[0, 4, 4, 0]} name="Delayed" />
              <Bar dataKey="total" fill="#6366f1" radius={[0, 4, 4, 0]} name="Total Sprints" />
            </BarChart>
          </ResponsiveContainer>
        ) : <div className="flex items-center justify-center h-[300px] text-slate-400 text-sm">No team data available</div>}
      </div>
    </div>
  );
};
export default Analytics;
