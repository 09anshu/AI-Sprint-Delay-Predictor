import { useState, useEffect } from 'react';
import api from '../api/axios';
import toast from 'react-hot-toast';
import DataTable from '../components/DataTable';
import KPICard from '../components/KPICard';
import { HiOutlineSparkles, HiOutlineExclamationCircle, HiOutlineCheckCircle, HiOutlineChartBar } from 'react-icons/hi';

const Predictions = () => {
  const [data, setData] = useState({ predictions: [], stats: {}, total: 0, totalPages: 1 });
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);

  useEffect(() => { api.get('/predictions', { params: { page, limit: 15 } }).then(r => setData(r.data)).catch(() => toast.error('Failed')).finally(() => setLoading(false)); }, [page]);

  if (loading) return <div className="flex items-center justify-center min-h-[60vh]"><div className="w-10 h-10 border-4 border-primary-500/30 border-t-primary-500 rounded-full animate-spin" /></div>;

  const columns = [
    { key: 'projectId', label: 'Project', render: v => <span className="font-medium">{v?.projectName || '—'}</span> },
    { key: 'sprintName', label: 'Sprint' },
    { key: 'predictionResult', label: 'Prediction', render: v => <span className={v?.label === 'Delayed' ? 'badge-danger' : 'badge-success'}>{v?.label}</span> },
    { key: '_severity', label: 'Severity', render: (_, r) => { const s = r.predictionResult?.severity; return <span className={s === 'High' ? 'badge-danger' : s === 'Medium' ? 'badge-warning' : 'badge-success'}>{s || '—'}</span>; } },
    { key: '_confidence', label: 'Confidence', render: (_, r) => <span className="font-medium">{Math.round((r.predictionResult?.confidence || 0) * 100)}%</span> },
    { key: '_risk', label: 'Risk Level', render: (_, r) => <span className="text-sm">{r.predictionResult?.riskLevel || '—'}</span> },
  ];

  return (
    <div className="space-y-6 animate-fade-in">
      <div><h1 className="text-2xl font-bold">Predictions</h1><p className="text-slate-500 text-sm mt-1">Model performance and prediction history</p></div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <KPICard label="Total Predictions" value={data.stats.totalPredictions || 0} icon={HiOutlineSparkles} color="primary" />
        <KPICard label="Delayed" value={data.stats.delayed || 0} icon={HiOutlineExclamationCircle} color="red" />
        <KPICard label="On Time" value={data.stats.notDelayed || 0} icon={HiOutlineCheckCircle} color="green" />
        <KPICard label="Avg Confidence" value={`${Math.round((data.stats.avgConfidence || 0) * 100)}%`} icon={HiOutlineChartBar} color="amber" />
      </div>
      <DataTable columns={columns} data={data.predictions} page={page} totalPages={data.totalPages} onPageChange={setPage} />
    </div>
  );
};
export default Predictions;
