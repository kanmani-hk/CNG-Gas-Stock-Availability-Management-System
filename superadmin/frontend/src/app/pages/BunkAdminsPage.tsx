import React, { useEffect, useState } from 'react';
import { Building2, MapPin, Mail, Phone, Clock, CheckCircle, XCircle, Trash2, Search, RefreshCw } from 'lucide-react';
import { superAdminApi } from '../../services/api';

interface BunkAdminsPageProps { token: string; }

interface BunkAdmin {
    _id: string;
    name: string;
    email: string;
    phone?: string;
    status: 'pending' | 'approved' | 'rejected';
    createdAt: string;
    assignedStation?: {
        name: string;
        address: string;
        pricePerKg: number;
        stockLevel: number;
        operatingHours: string;
    };
}

const statusStyles: Record<string, { bg: string; text: string; label: string }> = {
    approved: { bg: 'rgba(5,150,105,0.2)', text: '#34d399', label: '✓ Approved' },
    pending: { bg: 'rgba(217,119,6,0.2)', text: '#fbbf24', label: '⏳ Pending' },
    rejected: { bg: 'rgba(220,38,38,0.2)', text: '#f87171', label: '✗ Rejected' },
};

export function BunkAdminsPage({ token }: BunkAdminsPageProps) {
    const [admins, setAdmins] = useState<BunkAdmin[]>([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [filter, setFilter] = useState<'all' | 'approved' | 'pending' | 'rejected'>('all');
    const [actionId, setActionId] = useState<string | null>(null);
    const [confirmDelete, setConfirmDelete] = useState<string | null>(null);
    const [toast, setToast] = useState<{ msg: string; type: 'success' | 'error' } | null>(null);

    const showToast = (msg: string, type: 'success' | 'error') => {
        setToast({ msg, type });
        setTimeout(() => setToast(null), 3000);
    };

    const load = async () => {
        setLoading(true);
        try {
            const data = await superAdminApi.getBunkAdmins(token);
            setAdmins(data);
        } catch {
            showToast('Failed to load bunk admins', 'error');
        } finally { setLoading(false); }
    };

    useEffect(() => { load(); }, [token]);

    const handleApprove = async (id: string) => {
        setActionId(id);
        try {
            await superAdminApi.approveBunkAdmin(token, id);
            showToast('Bunk admin approved!', 'success');
            await load();
        } catch (err) { showToast((err as Error).message, 'error'); }
        finally { setActionId(null); }
    };

    const handleReject = async (id: string) => {
        setActionId(id);
        try {
            await superAdminApi.rejectBunkAdmin(token, id);
            showToast('Bunk admin rejected.', 'success');
            await load();
        } catch (err) { showToast((err as Error).message, 'error'); }
        finally { setActionId(null); }
    };

    const handleDelete = async (id: string) => {
        setActionId(id);
        try {
            await superAdminApi.deleteBunkAdmin(token, id);
            showToast('Bunk admin deleted.', 'success');
            setConfirmDelete(null);
            await load();
        } catch (err) { showToast((err as Error).message, 'error'); }
        finally { setActionId(null); }
    };

    const filtered = admins.filter((a) => {
        const matchSearch = a.name.toLowerCase().includes(search.toLowerCase()) ||
            a.email.toLowerCase().includes(search.toLowerCase()) ||
            (a.assignedStation?.name || '').toLowerCase().includes(search.toLowerCase());
        const matchFilter = filter === 'all' || a.status === filter;
        return matchSearch && matchFilter;
    });

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
                        <h3 className="font-bold text-white text-lg mb-2">Delete Bunk Admin?</h3>
                        <p className="text-sm text-slate-400 mb-5">This will permanently delete the admin and their station. This action cannot be undone.</p>
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
                    <h2 className="text-3xl font-bold gradient-text">Bunk Admins</h2>
                    <p className="text-slate-400 mt-1">{admins.length} registered bunk administrators</p>
                </div>
                <button onClick={load} className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium text-teal-300 hover:text-white transition-colors glow-button"
                    style={{ background: 'rgba(124,58,237,0.2)', border: '1px solid rgba(124,58,237,0.4)' }}>
                    <RefreshCw size={15} /> Refresh
                </button>
            </div>

            {/* Search & Filter */}
            <div className="flex gap-3 mb-6 animate-on-scroll" style={{ transitionDelay: '0.1s' }}>
                <div className="flex-1 relative">
                    <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input type="text" placeholder="Search by name, email, station…" value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="w-full pl-9 pr-4 py-2.5 rounded-xl text-sm text-white placeholder-slate-500 outline-none focus:ring-1 focus:ring-teal-500"
                        style={{ background: 'rgba(255,255,255,0.07)', border: '1px solid rgba(255,255,255,0.12)' }} />
                </div>
                <select value={filter} onChange={(e) => setFilter(e.target.value as any)}
                    className="px-4 py-2.5 rounded-xl text-sm text-white outline-none focus:ring-1 focus:ring-teal-500 cursor-pointer"
                    style={{ background: 'rgba(255,255,255,0.07)', border: '1px solid rgba(255,255,255,0.12)' }}>
                    <option value="all">All Status</option>
                    <option value="approved">Approved</option>
                    <option value="pending">Pending</option>
                    <option value="rejected">Rejected</option>
                </select>
            </div>

            {loading ? (
                <div className="flex items-center justify-center h-64">
                    <div className="w-10 h-10 border-2 border-teal-500 border-t-transparent rounded-full animate-spin" />
                </div>
            ) : filtered.length === 0 ? (
                <div className="glass-card p-16 text-center">
                    <Building2 size={48} className="mx-auto text-slate-600 mb-4" />
                    <p className="text-slate-400">No bunk admins found</p>
                </div>
            ) : (
                <div className="space-y-4">
                    {filtered.map((admin, idx) => {
                        const ss = statusStyles[admin.status] || statusStyles.pending;
                        return (
                            <div key={admin._id} className="glass-card p-5 flex flex-col lg:flex-row gap-4 animate-on-scroll"
                                style={{ transitionDelay: `${(idx % 10) * 0.05 + 0.15}s` }}>
                                {/* Left: Info */}
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-start gap-3 mb-3">
                                        <div className="w-10 h-10 rounded-xl flex items-center justify-center text-sm font-bold text-white flex-shrink-0"
                                            style={{ background: 'linear-gradient(135deg, #7c3aed, #2563eb)' }}>
                                            {admin.name.charAt(0)}
                                        </div>
                                        <div className="min-w-0">
                                            <div className="flex flex-wrap items-center gap-2">
                                                <h3 className="font-bold text-white">{admin.name}</h3>
                                                <span className="px-2 py-0.5 text-xs font-medium rounded-full"
                                                    style={{ background: ss.bg, color: ss.text, border: `1px solid ${ss.text}40` }}>
                                                    {ss.label}
                                                </span>
                                            </div>
                                            <div className="flex flex-wrap gap-3 mt-1 text-xs text-slate-400">
                                                <span className="flex items-center gap-1"><Mail size={11} />{admin.email}</span>
                                                {admin.phone && <span className="flex items-center gap-1"><Phone size={11} />{admin.phone}</span>}
                                                <span className="flex items-center gap-1"><Clock size={11} />{new Date(admin.createdAt).toLocaleDateString('en-IN')}</span>
                                            </div>
                                        </div>
                                    </div>
                                    {admin.assignedStation && (
                                        <div className="p-3 rounded-xl text-xs text-slate-400 space-y-1"
                                            style={{ background: 'rgba(255,255,255,0.04)' }}>
                                            <div className="flex items-center gap-1.5 text-white font-medium">
                                                <Building2 size={12} className="text-teal-400" />{admin.assignedStation.name}
                                                <span className="ml-auto text-slate-400">₹{admin.assignedStation.pricePerKg}/kg</span>
                                            </div>
                                            <div className="flex items-start gap-1.5"><MapPin size={11} className="mt-0.5 flex-shrink-0" />{admin.assignedStation.address}</div>
                                            <div>Stock: {admin.assignedStation.stockLevel} kg &nbsp;·&nbsp; {admin.assignedStation.operatingHours}</div>
                                        </div>
                                    )}
                                </div>
                                {/* Right: Actions */}
                                <div className="flex lg:flex-col gap-2 lg:min-w-max">
                                    {admin.status === 'pending' && (
                                        <button onClick={() => handleApprove(admin._id)} disabled={!!actionId}
                                            className="flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-semibold text-white disabled:opacity-50 glow-button"
                                            style={{ background: 'linear-gradient(135deg, #059669,#064e3b)' }}>
                                            <CheckCircle size={14} /> Approve
                                        </button>
                                    )}
                                    {admin.status === 'pending' && (
                                        <button onClick={() => handleReject(admin._id)} disabled={!!actionId}
                                            className="flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-semibold text-white disabled:opacity-50 glow-button"
                                            style={{ background: 'linear-gradient(135deg, #dc2626,#7f1d1d)' }}>
                                            <XCircle size={14} /> Reject
                                        </button>
                                    )}
                                    {admin.status === 'rejected' && (
                                        <button onClick={() => handleApprove(admin._id)} disabled={!!actionId}
                                            className="flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-semibold text-white disabled:opacity-50 glow-button"
                                            style={{ background: 'linear-gradient(135deg, #059669,#064e3b)' }}>
                                            <CheckCircle size={14} /> Re-approve
                                        </button>
                                    )}
                                    <button onClick={() => setConfirmDelete(admin._id)} disabled={!!actionId}
                                        className="flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-semibold text-red-400 hover:text-white hover:bg-red-600/30 transition-colors disabled:opacity-50">
                                        <Trash2 size={14} /> Delete
                                    </button>
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
}
