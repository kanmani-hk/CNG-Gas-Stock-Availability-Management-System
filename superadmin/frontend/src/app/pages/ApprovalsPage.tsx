import React, { useEffect, useState } from 'react';
import { Clock, CheckCircle, XCircle, Building2, MapPin, User, Phone, RefreshCw } from 'lucide-react';
import { superAdminApi } from '../../services/api';

interface ApprovalsPageProps {
    token: string;
    onBadgeUpdate: (n: number) => void;
}

interface PendingAdmin {
    _id: string;
    name: string;
    email: string;
    phone?: string;
    createdAt: string;
    assignedStation?: {
        _id: string;
        name: string;
        address: string;
        pricePerKg: number;
        operatingHours: string;
        lat: number;
        lng: number;
    };
}

export function ApprovalsPage({ token, onBadgeUpdate }: ApprovalsPageProps) {
    const [pending, setPending] = useState<PendingAdmin[]>([]);
    const [loading, setLoading] = useState(true);
    const [actionId, setActionId] = useState<string | null>(null);
    const [rejectId, setRejectId] = useState<string | null>(null);
    const [rejectReason, setRejectReason] = useState('');
    const [toast, setToast] = useState<{ msg: string; type: 'success' | 'error' } | null>(null);

    const showToast = (msg: string, type: 'success' | 'error') => {
        setToast({ msg, type });
        setTimeout(() => setToast(null), 3000);
    };

    const load = async () => {
        setLoading(true);
        try {
            const data = await superAdminApi.getPending(token);
            setPending(data);
            onBadgeUpdate(data.length);
        } catch {
            showToast('Failed to load pending approvals', 'error');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { load(); }, [token]);

    const handleApprove = async (id: string) => {
        setActionId(id);
        try {
            await superAdminApi.approveBunkAdmin(token, id);
            showToast('Bunk admin approved successfully!', 'success');
            await load();
        } catch (err) {
            showToast((err as Error).message, 'error');
        } finally {
            setActionId(null);
        }
    };

    const handleReject = async () => {
        if (!rejectId) return;
        setActionId(rejectId);
        try {
            await superAdminApi.rejectBunkAdmin(token, rejectId, rejectReason || 'Rejected by super admin');
            showToast('Bunk admin rejected.', 'success');
            setRejectId(null);
            setRejectReason('');
            await load();
        } catch (err) {
            showToast((err as Error).message, 'error');
        } finally {
            setActionId(null);
        }
    };

    return (
        <div className="p-8">
            {/* Toast */}
            {toast && (
                <div className={`fixed top-6 right-6 z-50 px-5 py-3 rounded-xl text-sm font-medium text-white shadow-xl
          ${toast.type === 'success' ? 'bg-green-600' : 'bg-red-600'}`}>
                    {toast.msg}
                </div>
            )}

            {/* Reject Modal */}
            {rejectId && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
                    <div className="glass-card w-full max-w-md p-6">
                        <h3 className="text-lg font-bold text-white mb-2">Reject Registration</h3>
                        <p className="text-sm text-slate-400 mb-4">Provide a reason (optional) to help the admin understand why they were rejected.</p>
                        <textarea
                            value={rejectReason}
                            onChange={(e) => setRejectReason(e.target.value)}
                            rows={3}
                            placeholder="e.g. Invalid address, duplicate bunk location..."
                            className="w-full text-sm text-white placeholder-slate-500 p-3 rounded-xl outline-none resize-none mb-4"
                            style={{ background: 'rgba(255,255,255,0.07)', border: '1px solid rgba(255,255,255,0.12)' }}
                        />
                        <div className="flex gap-3">
                            <button onClick={handleReject} disabled={!!actionId}
                                className="flex-1 py-2.5 rounded-xl font-medium text-white text-sm disabled:opacity-50 glow-button"
                                style={{ background: 'linear-gradient(135deg, #dc2626, #991b1b)' }}>
                                {actionId ? 'Rejecting…' : 'Confirm Reject'}
                            </button>
                            <button onClick={() => { setRejectId(null); setRejectReason(''); }}
                                className="flex-1 py-2.5 rounded-xl font-medium text-slate-300 text-sm"
                                style={{ background: 'rgba(255,255,255,0.07)' }}>
                                Cancel
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Header */}
            <div className="flex items-center justify-between mb-8 animate-on-scroll">
                <div>
                    <h2 className="text-3xl font-bold gradient-text">Pending Approvals</h2>
                    <p className="text-slate-400 mt-1">Review and verify new bunk registration requests</p>
                </div>
                <button onClick={load}
                    className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium text-teal-300 hover:text-white transition-colors glow-button"
                    style={{ background: 'rgba(124,58,237,0.2)', border: '1px solid rgba(124,58,237,0.4)' }}>
                    <RefreshCw size={15} /> Refresh
                </button>
            </div>

            {loading ? (
                <div className="flex items-center justify-center h-64">
                    <div className="w-10 h-10 border-2 border-teal-500 border-t-transparent rounded-full animate-spin" />
                </div>
            ) : pending.length === 0 ? (
                <div className="glass-card p-16 text-center">
                    <CheckCircle size={56} className="mx-auto text-green-400 mb-4 opacity-60" />
                    <h3 className="text-xl font-bold text-white mb-2">All Caught Up!</h3>
                    <p className="text-slate-400">No pending bunk registrations at the moment.</p>
                </div>
            ) : (
                <div className="space-y-5">
                    {pending.map((admin, idx) => (
                        <div key={admin._id} className="glass-card p-6 animate-on-scroll"
                            style={{ borderColor: 'rgba(217,119,6,0.3)', transitionDelay: `${idx * 0.1}s` }}>
                            <div className="flex flex-col lg:flex-row gap-6">
                                {/* Admin Info */}
                                <div className="flex-1">
                                    <div className="flex items-start gap-3 mb-4">
                                        <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 text-sm font-bold text-white"
                                            style={{ background: 'linear-gradient(135deg, #d97706, #78350f)' }}>
                                            {admin.name.charAt(0)}
                                        </div>
                                        <div>
                                            <div className="flex items-center gap-2">
                                                <h3 className="font-bold text-white">{admin.name}</h3>
                                                <span className="px-2 py-0.5 text-xs rounded-full font-medium text-yellow-300"
                                                    style={{ background: 'rgba(217,119,6,0.2)', border: '1px solid rgba(217,119,6,0.4)' }}>
                                                    ⏳ Pending
                                                </span>
                                            </div>
                                            <div className="flex flex-wrap gap-3 mt-1 text-xs text-slate-400">
                                                <span className="flex items-center gap-1"><User size={11} /> {admin.email}</span>
                                                {admin.phone && <span className="flex items-center gap-1"><Phone size={11} /> {admin.phone}</span>}
                                                <span className="flex items-center gap-1"><Clock size={11} /> {new Date(admin.createdAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}</span>
                                            </div>
                                        </div>
                                    </div>

                                    {admin.assignedStation && (
                                        <div className="p-4 rounded-xl space-y-2"
                                            style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' }}>
                                            <div className="flex items-center gap-2 mb-2">
                                                <Building2 size={14} className="text-teal-400" />
                                                <span className="text-sm font-semibold text-white">{admin.assignedStation.name}</span>
                                            </div>
                                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-slate-400">
                                                <span className="flex items-start gap-1.5"><MapPin size={11} className="mt-0.5 flex-shrink-0" />{admin.assignedStation.address}</span>
                                                <span>Price: ₹{admin.assignedStation.pricePerKg}/kg</span>
                                                <span>Hours: {admin.assignedStation.operatingHours}</span>
                                                <span>Coords: {admin.assignedStation.lat?.toFixed(4)}, {admin.assignedStation.lng?.toFixed(4)}</span>
                                            </div>
                                        </div>
                                    )}
                                </div>

                                {/* Action Buttons */}
                                <div className="flex lg:flex-col gap-3 lg:min-w-[160px]">
                                    <button
                                        onClick={() => handleApprove(admin._id)}
                                        disabled={actionId === admin._id}
                                        className="flex-1 lg:flex-none flex items-center justify-center gap-2 py-3 px-4 rounded-xl font-semibold text-sm text-white transition-all hover:opacity-90 disabled:opacity-50 glow-button"
                                        style={{ background: 'linear-gradient(135deg, #059669, #064e3b)' }}>
                                        <CheckCircle size={16} />
                                        {actionId === admin._id ? 'Approving…' : 'Approve'}
                                    </button>
                                    <button
                                        onClick={() => setRejectId(admin._id)}
                                        disabled={!!actionId}
                                        className="flex-1 lg:flex-none flex items-center justify-center gap-2 py-3 px-4 rounded-xl font-semibold text-sm text-white transition-all hover:opacity-90 disabled:opacity-50 glow-button"
                                        style={{ background: 'linear-gradient(135deg, #dc2626, #7f1d1d)' }}>
                                        <XCircle size={16} /> Reject
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
