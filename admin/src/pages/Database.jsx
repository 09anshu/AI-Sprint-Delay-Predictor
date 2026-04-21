import { useState, useEffect, useCallback } from 'react';
import api from '../api/axios';
import toast from 'react-hot-toast';
import ConfirmDialog from '../components/ConfirmDialog';
import { HiOutlineSearch, HiOutlineTrash, HiOutlineChevronLeft, HiOutlineChevronRight, HiOutlineDatabase } from 'react-icons/hi';

const collections = ['users', 'projects', 'sprints', 'logs'];

const Database = () => {
  const [active, setActive] = useState('users');
  const [records, setRecords] = useState([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [search, setSearch] = useState('');
  const [confirm, setConfirm] = useState({ open: false, id: null });

  const fetch = useCallback(async () => {
    try { const r = await api.get(`/database/${active}`, { params: { search, page, limit: 20 } }); setRecords(r.data.records); setTotal(r.data.total); setTotalPages(r.data.totalPages); } catch { toast.error('Failed to load records'); }
  }, [active, search, page]);

  useEffect(() => { setPage(1); setSearch(''); }, [active]);
  useEffect(() => { fetch(); }, [fetch]);

  const handleDelete = async (id) => { try { await api.delete(`/database/${active}/${id}`); toast.success('Record deleted'); fetch(); } catch { toast.error('Failed'); } };

  const getColumns = () => {
    if (records.length === 0) return [];
    const skip = ['__v', 'password'];
    return Object.keys(records[0]).filter(k => !skip.includes(k));
  };

  const formatVal = (v) => {
    if (v === null || v === undefined) return '—';
    if (typeof v === 'object' && v instanceof Object) return JSON.stringify(v).slice(0, 60);
    if (typeof v === 'string' && v.match(/^\d{4}-\d{2}-\d{2}/)) return new Date(v).toLocaleString();
    return String(v).slice(0, 50);
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center gap-3"><HiOutlineDatabase className="w-6 h-6 text-primary-500" /><div><h1 className="text-2xl font-bold">Database</h1><p className="text-slate-500 text-sm mt-1">View and manage raw database records</p></div></div>

      <div className="flex items-center gap-2">
        {collections.map(c => (
          <button key={c} onClick={() => setActive(c)} className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${active === c ? 'bg-primary-600 text-white' : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700'}`}>{c.charAt(0).toUpperCase() + c.slice(1)}</button>
        ))}
        <span className="text-sm text-slate-400 ml-auto">{total} records</span>
      </div>

      <div className="card overflow-hidden">
        <div className="p-4 border-b border-slate-200 dark:border-slate-800">
          <div className="relative max-w-sm"><HiOutlineSearch className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" /><input value={search} onChange={e => { setSearch(e.target.value); setPage(1); }} placeholder={`Search ${active}...`} className="input-field pl-9 py-2" /></div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead><tr className="border-b border-slate-200 dark:border-slate-800">{getColumns().map(c => <th key={c} className="text-left px-3 py-2.5 font-semibold text-slate-500 uppercase tracking-wider whitespace-nowrap">{c}</th>)}<th className="px-3 py-2.5"></th></tr></thead>
            <tbody>
              {records.length === 0 ? <tr><td colSpan={99} className="text-center py-12 text-slate-400">No records found</td></tr> : records.map((r, i) => (
                <tr key={r._id || i} className="border-b border-slate-100 dark:border-slate-800/50 hover:bg-slate-50 dark:hover:bg-slate-900/50">
                  {getColumns().map(c => <td key={c} className="px-3 py-2.5 whitespace-nowrap max-w-[200px] truncate">{formatVal(r[c])}</td>)}
                  <td className="px-3 py-2.5"><button onClick={() => setConfirm({ open: true, id: r._id })} className="btn-ghost p-1"><HiOutlineTrash className="w-3.5 h-3.5 text-red-500" /></button></td>
                </tr>
              ))}
            </tbody>
          </table>
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
      <ConfirmDialog isOpen={confirm.open} onClose={() => setConfirm({ open: false, id: null })} onConfirm={() => handleDelete(confirm.id)} title="Delete Record" message="Permanently delete this record?" danger />
    </div>
  );
};
export default Database;
