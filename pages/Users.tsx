
import React, { useState, useEffect } from 'react';
import { 
  UserPlus, 
  Shield, 
  Mail, 
  ToggleLeft,
  ToggleRight,
  CheckCircle2,
  XCircle,
  X,
  Save,
  Loader2,
  CheckCircle
} from 'lucide-react';
import { callBackend } from '../services/api';
import { User, UserRole } from '../types';

export const Users: React.FC = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);

  // Form State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<Partial<User> | null>(null);
  const [formLoading, setFormLoading] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');

  const fetchUsers = async () => {
    setLoading(true);
    const res = await callBackend<User[]>('getUsers');
    setUsers(res);
    setLoading(false);
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleOpenModal = (user: User | null = null) => {
    setEditingUser(user || {
      name: '',
      email: '',
      role: UserRole.STAFF,
      active: true
    });
    setIsModalOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormLoading(true);
    try {
      await callBackend('saveUser', editingUser);
      setSuccessMsg('User saved successfully!');
      setTimeout(() => {
        setSuccessMsg('');
        setIsModalOpen(false);
        fetchUsers();
      }, 1500);
    } finally {
      setFormLoading(false);
    }
  };

  const toggleStatus = async (user: User) => {
    await callBackend('saveUser', { ...user, active: !user.active });
    fetchUsers();
  };

  return (
    <div className="space-y-6 pb-12">
      {/* COMPLETED: User Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-white w-full max-w-md rounded-2xl shadow-2xl overflow-hidden animate-in zoom-in duration-200">
            <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-slate-50">
              <h3 className="text-xl font-bold text-slate-900">{editingUser?.id ? 'Edit User' : 'Add User'}</h3>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-slate-900"><X /></button>
            </div>
            <form onSubmit={handleSave} className="p-6 space-y-4">
              <div className="space-y-1">
                <label className="text-sm font-bold text-slate-700">Full Name</label>
                <input required value={editingUser?.name} onChange={e => setEditingUser({...editingUser!, name: e.target.value})} className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-slate-900" />
              </div>
              <div className="space-y-1">
                <label className="text-sm font-bold text-slate-700">Email Address</label>
                <input type="email" required value={editingUser?.email} onChange={e => setEditingUser({...editingUser!, email: e.target.value})} className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-slate-900" />
              </div>
              <div className="space-y-1">
                <label className="text-sm font-bold text-slate-700">System Role</label>
                <select required value={editingUser?.role} onChange={e => setEditingUser({...editingUser!, role: e.target.value as UserRole})} className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-slate-900">
                  <option value={UserRole.ADMIN}>Administrator</option>
                  <option value={UserRole.MANAGER}>Manager</option>
                  <option value={UserRole.STAFF}>Staff Member</option>
                </select>
              </div>
              {successMsg && <div className="flex items-center gap-2 text-green-700 text-sm font-bold"><CheckCircle className="w-4 h-4" /> {successMsg}</div>}
              <div className="flex gap-3 pt-4">
                <button type="button" onClick={() => setIsModalOpen(false)} className="flex-1 py-3 text-sm font-bold text-slate-600 hover:bg-slate-100 rounded-xl">Cancel</button>
                <button type="submit" disabled={formLoading} className="flex-1 py-3 bg-slate-900 text-white text-sm font-bold rounded-xl hover:bg-slate-800 flex items-center justify-center gap-2">
                  {formLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <><Save className="w-4 h-4" /> Save User</>}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900">User Management</h2>
          <p className="text-slate-500 text-sm">Manage system access for staff and managers</p>
        </div>
        <button onClick={() => handleOpenModal()} className="flex items-center justify-center gap-2 px-4 py-2.5 bg-slate-900 text-white rounded-xl text-sm font-semibold hover:bg-slate-800 transition-colors shadow-lg shadow-slate-900/10">
          <UserPlus className="w-4 h-4" />
          Add New User
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {loading ? (
          <div className="col-span-full py-20 text-center text-slate-400">Loading users...</div>
        ) : users.map(user => (
          <div key={user.id} className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm relative overflow-hidden flex flex-col h-full group">
            <div className={`absolute top-0 right-0 p-1.5 ${user.active ? 'bg-green-500' : 'bg-slate-300'}`} />
            
            <div className="flex items-center gap-4 mb-6">
               <div className="w-12 h-12 rounded-2xl bg-slate-100 flex items-center justify-center text-slate-900 font-bold text-lg shrink-0 uppercase">
                  {user.name.charAt(0)}
               </div>
               <div className="min-w-0">
                  <h3 className="font-bold text-slate-900 truncate">{user.name}</h3>
                  <div className="flex items-center gap-1.5 text-xs text-slate-500 truncate">
                    <Mail className="w-3 h-3 shrink-0" />
                    <span className="truncate">{user.email}</span>
                  </div>
               </div>
            </div>

            <div className="space-y-3 flex-1">
               <div className="flex items-center justify-between py-2 px-3 bg-slate-50 rounded-lg">
                  <div className="flex items-center gap-2 text-[10px] font-bold text-slate-500 uppercase tracking-widest">
                     <Shield className="w-3.5 h-3.5" /> Role
                  </div>
                  <span className={`text-[10px] font-bold px-2 py-1 rounded-md ${user.role === UserRole.ADMIN ? 'bg-purple-100 text-purple-700' : user.role === UserRole.MANAGER ? 'bg-blue-100 text-blue-700' : 'bg-slate-100 text-slate-700'}`}>
                    {user.role}
                  </span>
               </div>
               <div className="flex items-center justify-between py-2 px-3 bg-slate-50 rounded-lg">
                  <div className="flex items-center gap-2 text-[10px] font-bold text-slate-500 uppercase tracking-widest">
                     {user.active ? <ToggleRight className="w-3.5 h-3.5 text-green-500" /> : <ToggleLeft className="w-3.5 h-3.5 text-slate-400" />} Status
                  </div>
                  <span className={`text-[10px] font-bold flex items-center gap-1 ${user.active ? 'text-green-600' : 'text-slate-400'}`}>
                    {user.active ? <CheckCircle2 className="w-3 h-3" /> : <XCircle className="w-3 h-3" />} {user.active ? 'Active' : 'Inactive'}
                  </span>
               </div>
            </div>

            <div className="mt-6 pt-4 border-t border-slate-100 flex gap-2">
               <button onClick={() => handleOpenModal(user)} className="flex-1 py-2 text-xs font-bold text-slate-600 hover:bg-slate-50 rounded-lg transition-colors border border-transparent hover:border-slate-200">Edit Profile</button>
               <button onClick={() => toggleStatus(user)} className={`flex-1 py-2 text-xs font-bold rounded-lg transition-colors border border-transparent ${user.active ? 'text-red-600 hover:bg-red-50 hover:border-red-100' : 'text-green-600 hover:bg-green-50 hover:border-green-100'}`}>
                 {user.active ? 'Deactivate' : 'Activate'}
               </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
