import { useState, useEffect, useCallback } from 'react';
import api from '../api/axios';
import toast from 'react-hot-toast';
import DataTable from '../components/DataTable';
import Modal from '../components/Modal';
import ConfirmDialog from '../components/ConfirmDialog';
import { HiOutlinePencil, HiOutlineTrash } from 'react-icons/hi';

const Sprints = () => {
  const [sprints, setSprints] = useState([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [editSprint, setEditSprint] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [confirm, setConfirm] = useState({ open: false, id: null, name: '' });
  const [form, setForm] = useState({ sprintName: '', duration: '', storyPoints: '', completedPoints: '', bugs: '', dependencies: '' });
  const [submitting, setSubmitting] = useState(false);

  const fetch = useCallback(async () => {
    try { const r = await api.get('/sprints', { params: { search, status: statusFilter, page, limit: 15 } }); setSprints(r.data.sprints); setTotal(r.data.total); setTotalPages(r.data.totalPages); } catch { toast.error('Failed to load sprints'); }
  }, [search, statusFilter, page]);

  useEffect(() => { fetch(); }, [fetch]);

  const handleSave = async (e) => {
    e.preventDefault(); setSubmitting(true);
    try { await api.put(`/sprints/${editSprint._id}`, { ...form, duration: parseInt(form.duration), storyPoints: parseInt(form.storyPoints), completedPoints: parseInt(form.completedPoints) || 0, bugs: parseInt(form.bugs) || 0, dependencies: parseInt(form.dependencies) || 0 }); toast.success('Sprint updated'); setShowModal(false); fetch(); }
    catch { toast.error('Failed'); } finally { setSubmitting(false); }
  };

  const handleDelete = async (id) => { try { await api.delete(`/sprints/${id}`); toast.success('Sprint deleted'); fetch(); } catch { toast.error('Failed'); } };
  const openEdit = (s) => { setEditSprint(s); setForm({ sprintName: s.sprintName, duration: s.duration, storyPoints: s.storyPoints, completedPoints: s.completedPoints, bugs: s.bugs, dependencies: s.dependencies }); setShowModal(true); };

  const columns = [
    { key: 'sprintName', label: 'Sprint', render: (v, r) => <div><p className="font-medium">{v}</p><p className="text-xs text-slate-400">{r.projectId?.projectName || '—'}</p></div> },
    { key: 'duration', label: 'Duration', render: v => `${v}d` },
    { key: 'storyPoints', label: 'Points', render: (v, r) => <span>{r.completedPoints}/{v}</span> },
    { key: 'bugs', label: 'Bugs' },
    { key: 'dependencies', label: 'Deps' },
    { key: 'predictionResult', label: 'Status', render: v => v?.label ? <span className={v.label === 'Delayed' ? 'badge-danger' : 'badge-success'}>{v.label}</span> : <span className="badge-neutral">Pending</span> },
  ];

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div><h1 className="text-2xl font-bold">Sprints</h1><p className="text-slate-500 text-sm mt-1">{total} total sprints</p></div>
        <select value={statusFilter} onChange={e => { setStatusFilter(e.target.value); setPage(1); }} className="input-field w-auto">
          <option value="">All Status</option><option value="delayed">Delayed</option><option value="ontime">On Time</option><option value="pending">Pending</option>
        </select>
      </div>
      <DataTable columns={columns} data={sprints} searchValue={search} onSearch={v => { setSearch(v); setPage(1); }} page={page} totalPages={totalPages} onPageChange={setPage}
        actions={(row) => (
          <div className="flex items-center gap-1 justify-end">
            <button onClick={() => openEdit(row)} className="btn-ghost p-1.5"><HiOutlinePencil className="w-4 h-4" /></button>
            <button onClick={() => setConfirm({ open: true, id: row._id, name: row.sprintName })} className="btn-ghost p-1.5"><HiOutlineTrash className="w-4 h-4 text-red-500" /></button>
          </div>
        )}
      />
      <Modal isOpen={showModal} onClose={() => setShowModal(false)} title="Edit Sprint">
        <form onSubmit={handleSave} className="space-y-4">
          <div><label className="block text-sm font-medium mb-1">Name</label><input value={form.sprintName} onChange={e => setForm({ ...form, sprintName: e.target.value })} className="input-field" required /></div>
          <div className="grid grid-cols-2 gap-3">
            <div><label className="block text-sm font-medium mb-1">Duration</label><input type="number" value={form.duration} onChange={e => setForm({ ...form, duration: e.target.value })} className="input-field" min="1" required /></div>
            <div><label className="block text-sm font-medium mb-1">Story Points</label><input type="number" value={form.storyPoints} onChange={e => setForm({ ...form, storyPoints: e.target.value })} className="input-field" min="0" required /></div>
          </div>
          <div className="grid grid-cols-3 gap-3">
            <div><label className="block text-sm font-medium mb-1">Completed</label><input type="number" value={form.completedPoints} onChange={e => setForm({ ...form, completedPoints: e.target.value })} className="input-field" min="0" /></div>
            <div><label className="block text-sm font-medium mb-1">Bugs</label><input type="number" value={form.bugs} onChange={e => setForm({ ...form, bugs: e.target.value })} className="input-field" min="0" /></div>
            <div><label className="block text-sm font-medium mb-1">Deps</label><input type="number" value={form.dependencies} onChange={e => setForm({ ...form, dependencies: e.target.value })} className="input-field" min="0" /></div>
          </div>
          <div className="flex gap-3 pt-2"><button type="button" onClick={() => setShowModal(false)} className="btn-secondary flex-1">Cancel</button><button type="submit" disabled={submitting} className="btn-primary flex-1">{submitting ? 'Saving...' : 'Save'}</button></div>
        </form>
      </Modal>
      <ConfirmDialog isOpen={confirm.open} onClose={() => setConfirm({ open: false, id: null, name: '' })} onConfirm={() => handleDelete(confirm.id)} title="Delete Sprint" message={`Delete "${confirm.name}"?`} danger />
    </div>
  );
};
export default Sprints;
