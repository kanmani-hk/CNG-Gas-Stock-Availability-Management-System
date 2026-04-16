import React, { useEffect, useState } from 'react';
import { Building2, Users, Clock, CheckCircle, XCircle, TrendingUp, Activity, IndianRupee, Save } from 'lucide-react';
import { superAdminApi } from '../../services/api';

interface DashboardPageProps { token: string; }

interface Stats {
    bunkTotal: number; bunkApproved: number; bunkPending: number; bunkRejected: number;
    userTotal: number; userNewWeek: number;
    freePumps: number; busyPumps: number; maintPumps: number;
}

function StatCard({ label, value, sub, icon, gradient, border }: {
    label: string; value: number | string; sub?: string;
    icon: React.ReactNode; gradient: string; border: string;
}) {
    return (
        <div className="glass-card p-6 flex items-start gap-4 hover:scale-[1.02] transition-transform cursor-default"
            style={{ borderColor: border }}>
            <div className={`w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 ${gradient}`}>
                {icon}
            </div>
            <div>
                <p className="text-slate-400 text-sm">{label}</p>
                <p className="text-3xl font-bold text-white mt-0.5">{value}</p>
                {sub && <p className="text-xs text-slate-500 mt-1">{sub}</p>}
            </div>
        </div>
    );
}

export function DashboardPage({ token }: DashboardPageProps) {
    const [stats, setStats] = useState<Stats | null>(null);
    const [bookings, setBookings] = useState<any[]>([]);
    const [lowStockStations, setLowStockStations] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    const [globalPrice, setGlobalPrice] = useState<number>(0);
    const [priceLoading, setPriceLoading] = useState(false);
    const [priceMessage, setPriceMessage] = useState({ text: '', type: '' });

    useEffect(() => {
        async function load() {
            try {
                const [bunk, user, priceData, bookingData, stationsData] = await Promise.all([
                    superAdminApi.getBunkAdminStats(token),
                    superAdminApi.getUserStats(token),
                    superAdminApi.getGlobalPrice(token),
                    superAdminApi.getAllBookings(token),
                    superAdminApi.getBunkAdmins(token)
                ]);
                // Calculate pump statuses
                let free = 0, busy = 0, maint = 0;
                if (stationsData) {
                    stationsData.forEach((admin: any) => {
                        const sStatus = admin.assignedStation?.pumpStatus || 'free';
                        if (sStatus === 'free') free++;
                        else if (sStatus === 'busy') busy++;
                        else if (sStatus === 'maintenance') maint++;
                    });
                }

                setStats({
                    bunkTotal: bunk.total,
                    bunkApproved: bunk.approved,
                    bunkPending: bunk.pending,
                    bunkRejected: bunk.rejected,
                    userTotal: user.total,
                    userNewWeek: user.newThisWeek,
                    freePumps: free,
                    busyPumps: busy,
                    maintPumps: maint
                });
                setGlobalPrice(priceData.pricePerKg);
                setBookings(bookingData || []);
                
                if (stationsData) {
                    const low = stationsData
                        .filter((admin: any) => admin.assignedStation && admin.assignedStation.stockLevel < 200)
                        .map((admin: any) => ({
                            name: admin.assignedStation.name,
                            stock: admin.assignedStation.stockLevel,
                            admin: admin.name
                        }));
                    setLowStockStations(low);
                }
            } catch (err) {
                console.error("Dashboard load error:", err);
                setStats({
                    bunkTotal: 0, bunkApproved: 0, bunkPending: 0, bunkRejected: 0,
                    userTotal: 0, userNewWeek: 0,
                    freePumps: 0, busyPumps: 0, maintPumps: 0
                });
            } finally {
                setLoading(false);
            }
        }
        load();
    }, [token]);

    const handlePriceUpdate = async () => {
        if (globalPrice <= 0) return;
        setPriceLoading(true);
        setPriceMessage({ text: '', type: '' });
        try {
            const res = await superAdminApi.updateGlobalPrice(token, globalPrice);
            const total = (res.bunkStationsUpdated || 0) + (res.userStationsUpdated || 0);
            setPriceMessage({ text: `Success! Synchronized ${total} records across network.`, type: 'success' });
            setTimeout(() => setPriceMessage({ text: '', type: '' }), 5000);
        } catch (err: any) {
            setPriceMessage({ text: err.message || 'Failed to update price', type: 'error' });
        } finally {
            setPriceLoading(false);
        }
    };

    return (
        <div className="p-8">
            {/* Header */}
            <div className="mb-8">
                <h2 className="text-3xl font-bold gradient-text">Dashboard</h2>
                <p className="text-slate-400 mt-1">Overview of the entire CNG station network</p>
            </div>

            {loading ? (
                <div className="flex items-center justify-center h-64">
                    <div className="w-10 h-10 border-2 border-teal-500 border-t-transparent rounded-full animate-spin" />
                </div>
            ) : (
                <>
                    {/* Stat cards */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-5 mb-8 animate-on-scroll">
                        <StatCard label="Total Bunk Admins" value={stats!.bunkTotal}
                            sub="Registered bunk managers"
                            icon={<Building2 size={22} className="text-white" />}
                            gradient="stat-blue" border="rgba(14,165,233,0.4)" />
                        <StatCard label="Approved Bunks" value={stats!.bunkApproved}
                            sub="Active & operating"
                            icon={<CheckCircle size={22} className="text-white" />}
                            gradient="stat-green" border="rgba(5,150,105,0.4)" />
                        <StatCard label="Pending Approval" value={stats!.bunkPending}
                            sub="Awaiting verification"
                            icon={<Clock size={22} className="text-white" />}
                            gradient="stat-yellow" border="rgba(217,119,6,0.4)" />
                        <StatCard label="Rejected Bunks" value={stats!.bunkRejected}
                            sub="Declined registrations"
                            icon={<XCircle size={22} className="text-white" />}
                            gradient="stat-red" border="rgba(220,38,38,0.4)" />
                        <StatCard label="Total App Users" value={stats!.userTotal}
                            sub="Registered CNG users"
                            icon={<Users size={22} className="text-white" />}
                            gradient="stat-blue" border="rgba(37,99,235,0.4)" />
                        <StatCard label="New Users This Week" value={stats!.userNewWeek}
                            sub="Last 7 days"
                            icon={<TrendingUp size={22} className="text-white" />}
                            gradient="stat-blue" border="rgba(14,165,233,0.4)" />
                    </div>

                    {/* Network Status Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-8 animate-on-scroll" style={{ transitionDelay: '0.1s' }}>
                        <div className="glass-card p-5 border-l-4 border-l-emerald-500 flex items-center justify-between">
                            <div>
                                <p className="text-slate-400 text-xs font-bold uppercase tracking-widest">Free Pumps</p>
                                <p className="text-2xl font-black text-white">{stats!.freePumps || 0}</p>
                            </div>
                            <Activity className="text-emerald-500 opacity-50" />
                        </div>
                        <div className="glass-card p-5 border-l-4 border-l-amber-500 flex items-center justify-between">
                            <div>
                                <p className="text-slate-400 text-xs font-bold uppercase tracking-widest">Busy / Queued</p>
                                <p className="text-2xl font-black text-white">{stats!.busyPumps || 0}</p>
                            </div>
                            <Clock className="text-amber-500 opacity-50 pulse-dot" />
                        </div>
                        <div className="glass-card p-5 border-l-4 border-l-red-500 flex items-center justify-between">
                            <div>
                                <p className="text-slate-400 text-xs font-bold uppercase tracking-widest">In Maintenance</p>
                                <p className="text-2xl font-black text-white">{stats!.maintPumps || 0}</p>
                            </div>
                            <XCircle className="text-red-500 opacity-50 pulse-dot" />
                        </div>
                    </div>

                    {/* Price Management Section */}
                    <div className="glass-card p-6 mb-8 border-l-4 border-l-teal-500 animate-on-scroll" style={{ transitionDelay: '0.2s' }}>
                        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                            <div className="flex items-start gap-4">
                                <div className="w-12 h-12 rounded-xl bg-teal-900/30 flex items-center justify-center flex-shrink-0 text-teal-400">
                                    <IndianRupee size={24} />
                                </div>
                                <div>
                                    <h3 className="text-xl font-bold text-white">CNG Global Price Management</h3>
                                    <p className="text-slate-400 text-sm mt-1">Update price for ALL stations in the network simultaneously</p>
                                </div>
                            </div>
                            
                            <div className="flex items-center gap-4 bg-black/20 p-2 rounded-2xl border border-white/5">
                                <div className="px-4">
                                    <p className="text-[10px] uppercase tracking-wider text-slate-500 font-bold mb-1">Current Price (₹/kg)</p>
                                    <input 
                                        type="number" 
                                        value={globalPrice}
                                        onChange={(e) => setGlobalPrice(Number(e.target.value))}
                                        className="bg-transparent text-2xl font-bold text-white w-24 outline-none focus:text-teal-400 transition-colors"
                                        step="0.01"
                                    />
                                </div>
                                <button
                                    onClick={handlePriceUpdate}
                                    disabled={priceLoading}
                                    className="h-12 px-6 rounded-xl bg-gradient-to-r from-teal-600 to-cyan-600 text-white font-bold flex items-center gap-2 hover:shadow-[0_0_20px_rgba(20,184,166,0.4)] transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    {priceLoading ? (
                                        <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                    ) : (
                                        <>
                                            <Save size={18} />
                                            Update All
                                        </>
                                    )}
                                </button>
                            </div>
                        </div>
                        {priceMessage.text && (
                            <div className={`mt-4 p-3 rounded-lg text-sm font-medium ${
                                priceMessage.type === 'success' ? 'bg-green-500/10 text-green-400 border border-green-500/20' : 'bg-red-500/10 text-red-400 border border-red-500/20'
                            }`}>
                                {priceMessage.text}
                            </div>
                        )}
                    </div>

                    {/* Low Stock Alerts */}
                    {lowStockStations.length > 0 && (
                        <div className="glass-card p-6 mb-8 border-l-4 border-l-red-500 bg-red-500/5">
                            <div className="flex items-center gap-3 mb-6">
                                <div className="w-10 h-10 rounded-lg bg-red-900/30 flex items-center justify-center text-red-400">
                                    <Activity size={20} />
                                </div>
                                <h3 className="text-xl font-bold text-white">Critical Inventory Alerts</h3>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                                {lowStockStations.map((station, idx) => (
                                    <div key={idx} className="bg-red-900/10 border border-red-500/20 rounded-xl p-4 flex flex-col justify-between">
                                        <div>
                                            <p className="font-bold text-white text-sm">{station.name}</p>
                                            <p className="text-xs text-slate-500">Managed by {station.admin}</p>
                                        </div>
                                        <div className="mt-3 flex items-center justify-between">
                                            <span className="text-xl font-black text-red-500">{station.stock} kg</span>
                                            <span className="text-[10px] font-bold text-red-400 animate-pulse">REFILL NEEDED</span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Recent Bookings Section */}
                    <div className="glass-card p-6 mb-8 border-l-4 border-l-green-500 animate-on-scroll" style={{ transitionDelay: '0.3s' }}>
                        <div className="flex items-center justify-between mb-6">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-lg bg-green-900/30 flex items-center justify-center text-green-400">
                                    <Clock size={20} />
                                </div>
                                <h3 className="text-xl font-bold text-white">Recent Network Bookings</h3>
                            </div>
                            <span className="text-xs font-bold text-slate-500 uppercase tracking-widest">Live across all bunks</span>
                        </div>

                        {bookings.length > 0 ? (
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                {bookings.slice(0, 6).map((booking, idx) => (
                                    <div key={idx} className="bg-black/20 border border-white/5 rounded-xl p-4 hover:border-green-500/30 transition-colors">
                                        <div className="flex justify-between items-start mb-2">
                                            <p className="font-bold text-white">{booking.driverName}</p>
                                            <span className={`text-[10px] px-2 py-0.5 rounded font-bold uppercase ${
                                                booking.status === 'confirmed' ? 'bg-green-500/10 text-green-400' :
                                                booking.status === 'completed' ? 'bg-blue-500/10 text-blue-400' :
                                                'bg-slate-800 text-slate-400'
                                            }`}>
                                                {booking.status}
                                            </span>
                                        </div>
                                        <div className="space-y-1">
                                            <p className="text-xs text-slate-400 flex items-center gap-1">
                                                <Building2 size={12} className="text-green-500" />
                                                {booking.stationName}
                                            </p>
                                            <p className="text-xs text-slate-400 flex items-center gap-1">
                                                <TrendingUp size={12} className="text-blue-500" />
                                                {booking.vehicleNumber} ({booking.timeSlot})
                                            </p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="bg-black/10 rounded-xl p-12 text-center border border-dashed border-white/5">
                                <p className="text-slate-500 italic">No bookings found in the network yet.</p>
                            </div>
                        )}
                    </div>

                    {/* System Status */}
                    <div className="glass-card p-6 animate-on-scroll" style={{ transitionDelay: '0.4s' }}>
                        <div className="flex items-center gap-2 mb-4">
                            <Activity size={18} className="text-teal-400" />
                            <h3 className="font-semibold text-white">System Status</h3>
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                            {[
                                { label: 'Super Admin API', port: 5002, color: 'green' },
                                { label: 'Bunk Admin API', port: 5001, color: 'blue' },
                                { label: 'CNG User API', port: 5000, color: 'indigo' },
                            ].map((s) => (
                                <div key={s.port} className="flex items-center gap-3 p-3 rounded-xl"
                                    style={{ background: 'rgba(255,255,255,0.04)' }}>
                                    <span className={`w-2.5 h-2.5 rounded-full bg-${s.color}-400 pulse-dot`} />
                                    <div>
                                        <p className="text-sm text-white font-medium">{s.label}</p>
                                        <p className="text-xs text-slate-500">localhost:{s.port}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </>
            )}
        </div>
    );
}
