import React from 'react';
import {
    LayoutDashboard, Clock, Building2, Users, LogOut, Zap, ChevronRight, MessageSquare
} from 'lucide-react';
import type { Page } from '../App';

interface SidebarProps {
    currentPage: Page;
    onNavigate: (p: Page) => void;
    onLogout: () => void;
    adminName: string;
    pendingCount: number;
}

const navItems: { id: Page; label: string; icon: React.ReactNode }[] = [
    { id: 'dashboard', label: 'Dashboard', icon: <LayoutDashboard size={20} /> },
    { id: 'approvals', label: 'Approvals', icon: <Clock size={20} /> },
    { id: 'bunkadmins', label: 'Bunk Admins', icon: <Building2 size={20} /> },
    { id: 'users', label: 'Users', icon: <Users size={20} /> },
    { id: 'feedback', label: 'Feedback', icon: <MessageSquare size={20} /> },
];

export function Sidebar({ currentPage, onNavigate, onLogout, adminName, pendingCount }: SidebarProps) {
    return (
        <aside className="w-64 flex flex-col flex-shrink-0 border-r border-white/10"
            style={{ background: 'rgba(10,25,36,0.95)', backdropFilter: 'blur(20px)' }}>

            {/* Logo */}
            <div className="px-6 py-6 border-b border-white/10">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl overflow-hidden flex items-center justify-center shrink-0 shadow-lg border border-cyan-500/30">
                        <img src="/images/logo.png" alt="CNG Finder Logo" className="w-full h-full object-contain" />
                    </div>
                    <div>
                        <h1 className="font-bold text-white text-xl tracking-tight">CNG Finder</h1>
                        <p className="text-[10px] text-teal-400 font-bold uppercase tracking-wider">Real-time Monitoring</p>
                    </div>
                </div>
            </div>

            {/* Admin badge */}
            <div className="px-6 py-4 border-b border-white/10">
                <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold text-white"
                        style={{ background: 'linear-gradient(135deg, #14b8a6, #38bdf8)' }}>
                        {adminName.charAt(0).toUpperCase()}
                    </div>
                    <div className="min-w-0">
                        <p className="text-sm font-semibold text-white truncate">{adminName}</p>
                        <div className="flex items-center gap-1">
                            <span className="w-2 h-2 rounded-full bg-green-400 pulse-dot inline-block" />
                            <span className="text-xs text-teal-400">Super Admin</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Navigation */}
            <nav className="flex-1 px-3 py-4 space-y-1">
                {navItems.map((item) => {
                    const active = currentPage === item.id;
                    return (
                        <button
                            key={item.id}
                            onClick={() => onNavigate(item.id)}
                            className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-sm font-medium transition-all nav-item
                ${active ? 'sidebar-active text-white' : 'text-slate-400 hover:text-white'}`}
                        >
                            <div className="flex items-center gap-3">
                                <span className={active ? 'text-teal-400' : ''}>{item.icon}</span>
                                {item.label}
                            </div>
                            <div className="flex items-center gap-2">
                                {item.id === 'approvals' && pendingCount > 0 && (
                                    <span className="px-2 py-0.5 text-xs font-bold rounded-full text-white"
                                        style={{ background: 'linear-gradient(135deg, #dc2626, #991b1b)' }}>
                                        {pendingCount}
                                    </span>
                                )}
                                {active && <ChevronRight size={14} className="text-teal-400" />}
                            </div>
                        </button>
                    );
                })}
            </nav>

            {/* Logout */}
            <div className="px-3 py-4 border-t border-white/10">
                <button
                    onClick={onLogout}
                    className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-slate-400 hover:text-red-400 hover:bg-red-500/10 transition-all nav-item glow-button"
                >
                    <LogOut size={20} /> Log Out
                </button>
            </div>
        </aside>
    );
}
