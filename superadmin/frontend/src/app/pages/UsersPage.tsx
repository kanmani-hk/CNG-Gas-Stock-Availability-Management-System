import React, { useEffect, useState } from 'react';
import { Users, Mail, Phone, MapPin, Car, Trash2, Search, RefreshCw, Calendar } from 'lucide-react';
import { superAdminApi } from '../../services/api';

interface UsersPageProps { token: string; }

interface CngUser {
    _id: string;
    name: string;
    email: string;
    phone?: string;
    location?: string;
    createdAt: string;
    vehicle?: { name: string; type: string; number: string };
}

export function UsersPage({ token }: UsersPageProps) {
    const [users, setUsers] = useState<CngUser[]>([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [confirmDelete, setConfirmDelete] = useState<string | null>(null);
    const [actionId, setActionId] = useState<string | null>(null);
    const [toast, setToast] = useState<{ msg: string; type: 'success' | 'error' } | null>(null);

    const showToast = (msg: string, type: 'success' | 'error') => {
        setToast({ msg, type });
        setTimeout(() => setToast(null), 3000);
    };

    const load = async () => {
        setLoading(true);
        try {
            const data = await superAdminApi.getUsers(token);
            setUsers(data);
        } catch {
            showToast('Failed to load users', 'error');
        } finally { setLoading(false); }
    };

    useEffect(() => { load(); }, [token]);

    const handleDelete = async (id: string) => {
        setActionId(id);
        try {
            await superAdminApi.deleteUser(token, id);
            showToast('User deleted successfully.', 'success');
            setConfirmDelete(null);
            await load();
        } catch (err) { showToast((err as Error).message, 'error'); }
        finally { setActionId(null); }
    };

    const filtered = users.filter((u) =>
        u.name.toLowerCase().includes(search.toLowerCase()) ||
        u.email.toLowerCase().includes(search.toLowerCase()) ||
        (u.location || '').toLowerCase().includes(search.toLowerCase()) ||
        (u.vehicle?.number || '').toLowerCase().includes(search.toLowerCase())
    );

    return (
        <div className="p-8">
            {toast && (
                <div className={`fixed top-6 right-6 z-50 px-5 py-3 rounded-xl text-sm font-medium text-white shadow-xl
          ${toast.type === 'success' ? 'bg-green-600' : 'bg-red-600'}`}>
                    {toast.msg}
                </div>
            )}

            {confirmDelete && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
                    <div className="glass-card w-full max-w-sm p-6 text-center">
                        <Trash2 size={40} className="mx-auto text-red-400 mb-3" />
                        <h3 className="font-bold text-white text-lg mb-2">Delete User?</h3>
                        <p className="text-sm text-slate-400 mb-5">This will permanently remove the user account. This cannot be undone.</p>
                        <div className="flex gap-3">
                            <button onClick={() => handleDelete(confirmDelete)} disabled={!!actionId}
                                className="flex-1 py-2.5 rounded-xl text-sm font-medium text-white disabled:opacity-50 glow-button"
                                style={{ background: 'linear-gradient(135deg, #dc2626, #991b1b)' }}>
                                {actionId ? 'Deleting…' : 'Delete'}
                            </button>
                            <button onClick={() => setConfirmDelete(null)}
                                className="flex-1 py-2.5 rounded-xl text-sm font-medium text-slate-300"
                                style={{ background: 'rgba(255,255,255,0.07)' }}>
                                Cancel
                            </button>
                        </div>
                    </div>
                </div>
            )}

            <div className="flex items-center justify-between mb-8 animate-on-scroll">
                <div>
                    <h2 className="text-3xl font-bold gradient-text">App Users</h2>
                    <p className="text-slate-400 mt-1">{users.length} registered CNG app users</p>
                </div>
                <button onClick={load} className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium text-teal-300 hover:text-white transition-colors glow-button"
                    style={{ background: 'rgba(124,58,237,0.2)', border: '1px solid rgba(124,58,237,0.4)' }}>
                    <RefreshCw size={15} /> Refresh
                </button>
            </div>

            {/* Search */}
            <div className="mb-6 relative animate-on-scroll" style={{ transitionDelay: '0.1s' }}>
                <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input type="text" placeholder="Search by name, email, location, vehicle number…" value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="w-full pl-9 pr-4 py-2.5 rounded-xl text-sm text-white placeholder-slate-500 outline-none focus:ring-1 focus:ring-teal-500"
                    style={{ background: 'rgba(255,255,255,0.07)', border: '1px solid rgba(255,255,255,0.12)' }} />
            </div>

            {loading ? (
                <div className="flex items-center justify-center h-64">
                    <div className="w-10 h-10 border-2 border-teal-500 border-t-transparent rounded-full animate-spin" />
                </div>
            ) : filtered.length === 0 ? (
                <div className="glass-card p-16 text-center">
                    <Users size={48} className="mx-auto text-slate-600 mb-4" />
                    <p className="text-slate-400">No users found</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4">
                    {filtered.map((user, idx) => (
                        <div key={user._id} className="glass-card p-5 flex flex-col gap-3 hover:scale-[1.01] transition-transform animate-on-scroll"
                            style={{ transitionDelay: `${(idx % 9) * 0.05 + 0.15}s` }}>
                            {/* Avatar + Name */}
                            <div className="flex items-start gap-3">
                                <div className="w-10 h-10 rounded-xl flex items-center justify-center text-sm font-bold text-white flex-shrink-0"
                                    style={{ background: 'linear-gradient(135deg, #2563eb, #1e3a8a)' }}>
                                    {user.name.charAt(0)}
                                </div>
                                <div className="min-w-0 flex-1">
                                    <h3 className="font-bold text-white text-sm truncate">{user.name}</h3>
                                    <p className="text-xs text-slate-400 truncate">{user.email}</p>
                                </div>
                                <button onClick={() => setConfirmDelete(user._id)} disabled={!!actionId}
                                    className="p-1.5 rounded-lg text-slate-500 hover:text-red-400 hover:bg-red-500/15 transition-colors disabled:opacity-40 flex-shrink-0">
                                    <Trash2 size={14} />
                                </button>
                            </div>

                            {/* Details */}
                            <div className="space-y-1.5 text-xs text-slate-400">
                                {user.phone && (
                                    <div className="flex items-center gap-2"><Phone size={11} />{user.phone}</div>
                                )}
                                {user.location && (
                                    <div className="flex items-center gap-2"><MapPin size={11} />{user.location}</div>
                                )}
                                <div className="flex items-center gap-2">
                                    <Calendar size={11} />
                                    Joined {new Date(user.createdAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}
                                </div>
                                {user.vehicle?.number && (
                                    <div className="flex items-center gap-2">
                                        <Car size={11} />
                                        {user.vehicle.type} · {user.vehicle.name} · {user.vehicle.number}
                                    </div>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
