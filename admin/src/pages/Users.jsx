import { useState, useEffect, useCallback } from 'react';
import api from '../api/axios';
import toast from 'react-hot-toast';
import DataTable from '../components/DataTable';
import Modal from '../components/Modal';
import ConfirmDialog from '../components/ConfirmDialog';
import { HiOutlinePlus, HiOutlinePencil, HiOutlineTrash, HiOutlineBan, HiOutlineCheck } from 'react-icons/hi';

const Users = () => {
  const [users, setUsers] = useState([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [search, setSearch] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editUser, setEditUser] = useState(null);
  const [confirm, setConfirm] = useState({ open: false, id: null, name: '' });
  const [form, setForm] = useState({ name: '', email: '', password: '', role: 'user' });
  const [submitting, setSubmitting] = useState(false);

  const fetch = useCallback(async () => {
    try {
      const r = await api.get('/users', { params: { search, page, limit: 15 } });
      setUsers(r.data.users); setTotal(r.data.total); setTotalPages(r.data.totalPages);
    } catch { toast.error('Failed to load users'); }
  }, [search, page]);

  useEffect(() => { fetch(); }, [fetch]);

  const handleSave = async (e) => {
    e.preventDefault(); setSubmitting(true);
    try {
      if (editUser) { await api.put(`/users/${editUser._id}`, { name: form.name, email: form.email, role: form.role }); toast.success('User updated'); }
      else { await api.post('/users', form); toast.success('User created'); }
      setShowModal(false); setEditUser(null); setForm({ name: '', email: '', password: '', role: 'user' }); fetch();
    } catch (e) { toast.error(e.response?.data?.message || 'Failed'); } finally { setSubmitting(false); }
  };

  const handleDelete = async (id) => { try { await api.delete(`/users/${id}`); toast.success('User deleted'); fetch(); } catch { toast.error('Failed to delete'); } };
  const handleBlock = async (id) => { try { await api.put(`/users/${id}/block`); toast.success('Status toggled'); fetch(); } catch { toast.error('Failed'); } };
  const openEdit = (u) => { setEditUser(u); setForm({ name: u.name, email: u.email, password: '', role: u.role }); setShowModal(true); };

  const columns = [
    { key: 'name', label: 'Name', render: (v, r) => <div><p className="font-medium">{v}</p><p className="text-xs text-slate-400">{r.email}</p></div> },
    { key: 'role', label: 'Role', render: v => <span className={v === 'admin' ? 'badge-info' : 'badge-neutral'}>{v}</span> },
    { key: 'status', label: 'Status', render: v => <span className={v === 'active' ? 'badge-success' : 'badge-danger'}>{v || 'active'}</span> },
    { key: 'createdAt', label: 'Joined', render: v => <span className="text-xs text-slate-500">{new Date(v).toLocaleDateString()}</span> },
  ];

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div><h1 className="text-2xl font-bold">Users</h1><p className="text-slate-500 text-sm mt-1">{total} total users</p></div>
        <button onClick={() => { setEditUser(null); setForm({ name: '', email: '', password: '', role: 'user' }); setShowModal(true); }} className="btn-primary flex items-center gap-2"><HiOutlinePlus className="w-4 h-4" />Add User</button>
      </div>
      <DataTable columns={columns} data={users} searchValue={search} onSearch={v => { setSearch(v); setPage(1); }} page={page} totalPages={totalPages} onPageChange={setPage}
        actions={(row) => (
          <div className="flex items-center gap-1 justify-end">
            <button onClick={() => openEdit(row)} className="btn-ghost p-1.5" title="Edit"><HiOutlinePencil className="w-4 h-4" /></button>
            <button onClick={() => handleBlock(row._id)} className="btn-ghost p-1.5" title={row.status === 'blocked' ? 'Unblock' : 'Block'}>{row.status === 'blocked' ? <HiOutlineCheck className="w-4 h-4 text-emerald-500" /> : <HiOutlineBan className="w-4 h-4 text-amber-500" />}</button>
            <button onClick={() => setConfirm({ open: true, id: row._id, name: row.name })} className="btn-ghost p-1.5" title="Delete"><HiOutlineTrash className="w-4 h-4 text-red-500" /></button>
          </div>
        )}
      />
      <Modal isOpen={showModal} onClose={() => setShowModal(false)} title={editUser ? 'Edit User' : 'Add User'}>
        <form onSubmit={handleSave} className="space-y-4">
          <div><label className="block text-sm font-medium mb-1">Name</label><input value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} className="input-field" required /></div>
          <div><label className="block text-sm font-medium mb-1">Email</label><input type="email" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} className="input-field" required /></div>
          {!editUser && <div><label className="block text-sm font-medium mb-1">Password</label><input type="password" value={form.password} onChange={e => setForm({ ...form, password: e.target.value })} className="input-field" required minLength={6} /></div>}
          <div><label className="block text-sm font-medium mb-1">Role</label><select value={form.role} onChange={e => setForm({ ...form, role: e.target.value })} className="input-field"><option value="user">User</option><option value="admin">Admin</option></select></div>
          <div className="flex gap-3 pt-2"><button type="button" onClick={() => setShowModal(false)} className="btn-secondary flex-1">Cancel</button><button type="submit" disabled={submitting} className="btn-primary flex-1">{submitting ? 'Saving...' : 'Save'}</button></div>
        </form>
      </Modal>
      <ConfirmDialog isOpen={confirm.open} onClose={() => setConfirm({ open: false, id: null, name: '' })} onConfirm={() => handleDelete(confirm.id)} title="Delete User" message={`Delete "${confirm.name}" and all their data?`} danger />
    </div>
  );
};
export default Users;
