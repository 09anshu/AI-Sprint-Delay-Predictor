import { useState, useEffect, useCallback } from 'react';
import api from '../api/axios';
import toast from 'react-hot-toast';
import DataTable from '../components/DataTable';
import Modal from '../components/Modal';
import ConfirmDialog from '../components/ConfirmDialog';
import { HiOutlinePencil, HiOutlineTrash } from 'react-icons/hi';

const Projects = () => {
  const [projects, setProjects] = useState([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [search, setSearch] = useState('');
  const [editProject, setEditProject] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [confirm, setConfirm] = useState({ open: false, id: null, name: '' });
  const [form, setForm] = useState({ projectName: '', description: '', teamSize: '', deadline: '' });
  const [submitting, setSubmitting] = useState(false);

  const fetch = useCallback(async () => {
    try { const r = await api.get('/projects', { params: { search, page, limit: 15 } }); setProjects(r.data.projects); setTotal(r.data.total); setTotalPages(r.data.totalPages); } catch { toast.error('Failed to load projects'); }
  }, [search, page]);

  useEffect(() => { fetch(); }, [fetch]);

  const handleSave = async (e) => {
    e.preventDefault(); setSubmitting(true);
    try { await api.put(`/projects/${editProject._id}`, { ...form, teamSize: parseInt(form.teamSize) }); toast.success('Project updated'); setShowModal(false); fetch(); }
    catch { toast.error('Failed to update'); } finally { setSubmitting(false); }
  };

  const handleDelete = async (id) => { try { await api.delete(`/projects/${id}`); toast.success('Project deleted'); fetch(); } catch { toast.error('Failed'); } };
  const openEdit = (p) => { setEditProject(p); setForm({ projectName: p.projectName, description: p.description, teamSize: p.teamSize, deadline: p.deadline?.split('T')[0] || '' }); setShowModal(true); };

  const columns = [
    { key: 'projectName', label: 'Project', render: (v, r) => <div><p className="font-medium">{v}</p><p className="text-xs text-slate-400 line-clamp-1">{r.description}</p></div> },
    { key: 'userId', label: 'Owner', render: v => <span className="text-sm">{v?.name || '—'}</span> },
    { key: 'teamSize', label: 'Team', render: v => <span className="badge-neutral">{v}</span> },
    { key: 'sprintCount', label: 'Sprints', render: v => v || 0 },
    { key: 'delayedCount', label: 'Delayed', render: v => v ? <span className="text-red-500 font-medium">{v}</span> : <span className="text-slate-400">0</span> },
    { key: 'deadline', label: 'Deadline', render: v => <span className="text-xs text-slate-500">{v ? new Date(v).toLocaleDateString() : '—'}</span> },
  ];

  return (
    <div className="space-y-6 animate-fade-in">
      <div><h1 className="text-2xl font-bold">Projects</h1><p className="text-slate-500 text-sm mt-1">{total} total projects</p></div>
      <DataTable columns={columns} data={projects} searchValue={search} onSearch={v => { setSearch(v); setPage(1); }} page={page} totalPages={totalPages} onPageChange={setPage}
        actions={(row) => (
          <div className="flex items-center gap-1 justify-end">
            <button onClick={() => openEdit(row)} className="btn-ghost p-1.5"><HiOutlinePencil className="w-4 h-4" /></button>
            <button onClick={() => setConfirm({ open: true, id: row._id, name: row.projectName })} className="btn-ghost p-1.5"><HiOutlineTrash className="w-4 h-4 text-red-500" /></button>
          </div>
        )}
      />
      <Modal isOpen={showModal} onClose={() => setShowModal(false)} title="Edit Project">
        <form onSubmit={handleSave} className="space-y-4">
          <div><label className="block text-sm font-medium mb-1">Name</label><input value={form.projectName} onChange={e => setForm({ ...form, projectName: e.target.value })} className="input-field" required /></div>
          <div><label className="block text-sm font-medium mb-1">Description</label><textarea value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} className="input-field h-20 resize-none" /></div>
          <div className="grid grid-cols-2 gap-3">
            <div><label className="block text-sm font-medium mb-1">Team Size</label><input type="number" value={form.teamSize} onChange={e => setForm({ ...form, teamSize: e.target.value })} className="input-field" min="1" required /></div>
            <div><label className="block text-sm font-medium mb-1">Deadline</label><input type="date" value={form.deadline} onChange={e => setForm({ ...form, deadline: e.target.value })} className="input-field" /></div>
          </div>
          <div className="flex gap-3 pt-2"><button type="button" onClick={() => setShowModal(false)} className="btn-secondary flex-1">Cancel</button><button type="submit" disabled={submitting} className="btn-primary flex-1">{submitting ? 'Saving...' : 'Save'}</button></div>
        </form>
      </Modal>
      <ConfirmDialog isOpen={confirm.open} onClose={() => setConfirm({ open: false, id: null, name: '' })} onConfirm={() => handleDelete(confirm.id)} title="Delete Project" message={`Delete "${confirm.name}" and all sprints?`} danger />
    </div>
  );
};
export default Projects;
