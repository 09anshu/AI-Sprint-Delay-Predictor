import { useState, useEffect, useCallback } from 'react';
import api from '../api/axios';
import toast from 'react-hot-toast';
import { HiOutlineClipboardList, HiOutlineSearch, HiOutlineChevronLeft, HiOutlineChevronRight } from 'react-icons/hi';

const actionColors = { login: 'badge-info', admin_login: 'badge-info', create: 'badge-success', update: 'badge-warning', delete: 'badge-danger', predict: 'badge-info', block: 'badge-danger', unblock: 'badge-success', settings_update: 'badge-warning' };

const Logs = () => {
  const [logs, setLogs] = useState([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [search, setSearch] = useState('');
  const [actionFilter, setActionFilter] = useState('');
  const [targetFilter, setTargetFilter] = useState('');

  const fetch = useCallback(async () => {
    try { const r = await api.get('/logs', { params: { search, action: actionFilter, target: targetFilter, page, limit: 25 } }); setLogs(r.data.logs); setTotal(r.data.total); setTotalPages(r.data.totalPages); } catch { toast.error('Failed to load logs'); }
  }, [search, actionFilter, targetFilter, page]);

  useEffect(() => { fetch(); }, [fetch]);

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center gap-3"><HiOutlineClipboardList className="w-6 h-6 text-primary-500" /><div><h1 className="text-2xl font-bold">Activity Logs</h1><p className="text-slate-500 text-sm mt-1">{total} total log entries</p></div></div>

      <div className="flex flex-wrap items-center gap-3">
        <div className="relative flex-1 min-w-[200px] max-w-sm"><HiOutlineSearch className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" /><input value={search} onChange={e => { setSearch(e.target.value); setPage(1); }} placeholder="Search logs..." className="input-field pl-9 py-2" /></div>
        <select value={actionFilter} onChange={e => { setActionFilter(e.target.value); setPage(1); }} className="input-field w-auto"><option value="">All Actions</option><option value="login">Login</option><option value="admin_login">Admin Login</option><option value="create">Create</option><option value="update">Update</option><option value="delete">Delete</option><option value="predict">Predict</option><option value="block">Block</option><option value="unblock">Unblock</option></select>
        <select value={targetFilter} onChange={e => { setTargetFilter(e.target.value); setPage(1); }} className="input-field w-auto"><option value="">All Targets</option><option value="user">User</option><option value="project">Project</option><option value="sprint">Sprint</option><option value="prediction">Prediction</option><option value="system">System</option></select>
      </div>

      <div className="card">
        <div className="divide-y divide-slate-200 dark:divide-slate-800">
          {logs.length === 0 ? (
            <div className="text-center py-12 text-slate-400"><HiOutlineClipboardList className="w-12 h-12 mx-auto mb-2 opacity-30" /><p>No logs found</p></div>
          ) : logs.map((log, i) => (
            <div key={i} className="flex items-center gap-4 p-4 hover:bg-slate-50 dark:hover:bg-slate-900/50 transition-colors">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <span className={actionColors[log.action] || 'badge-neutral'}>{log.action}</span>
                  <span className="badge-neutral">{log.target}</span>
                </div>
                <p className="text-sm text-slate-600 dark:text-slate-300">{log.details || 'No details'}</p>
                <p className="text-xs text-slate-400 mt-1">{log.userEmail || 'System'}</p>
              </div>
              <div className="text-right">
                <p className="text-xs text-slate-500">{new Date(log.timestamp).toLocaleDateString()}</p>
                <p className="text-xs text-slate-400">{new Date(log.timestamp).toLocaleTimeString()}</p>
              </div>
            </div>
          ))}
        </div>
        {totalPages > 1 && (
          <div className="flex items-center justify-between p-4 border-t border-slate-200 dark:border-slate-800">
            <p className="text-sm text-slate-500">Page {page} of {totalPages}</p>
            <div className="flex gap-2">
              <button onClick={() => setPage(p => p - 1)} disabled={page <= 1} className="btn-ghost disabled:opacity-30"><HiOutlineChevronLeft className="w-4 h-4" /></button>
              <button onClick={() => setPage(p => p + 1)} disabled={page >= totalPages} className="btn-ghost disabled:opacity-30"><HiOutlineChevronRight className="w-4 h-4" /></button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
export default Logs;
