import React, { useState, useEffect } from 'react';
import { LoginPage } from './pages/LoginPage';
import { DashboardPage } from './pages/DashboardPage';
import { ApprovalsPage } from './pages/ApprovalsPage';
import { BunkAdminsPage } from './pages/BunkAdminsPage';
import { UsersPage } from './pages/UsersPage';
import { FeedbackPage } from './pages/FeedbackPage';
import { Sidebar } from './components/Sidebar';
import { superAdminApi } from '../services/api';

export type Page = 'dashboard' | 'approvals' | 'bunkadmins' | 'users' | 'feedback';

export default function App() {
    const [token, setToken] = useState<string | null>(null);
    const [adminName, setAdminName] = useState('Super Admin');
    const [currentPage, setCurrentPage] = useState<Page>('dashboard');
    const [pendingCount, setPendingCount] = useState(0);

    // Restore session and validate
    useEffect(() => {
        const stored = localStorage.getItem('sa_token');
        const storedName = localStorage.getItem('sa_name');
        if (stored) {
            // Quickly verify if token is still valid
            superAdminApi.getMe(stored)
                .then(() => {
                    setToken(stored);
                    if (storedName) setAdminName(storedName);
                })
                .catch(() => {
                    console.warn('Stored token invalid, clearing session');
                    handleLogout();
                });
        }
    }, []);

    // Global scroll animation observer
    useEffect(() => {
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('is-visible');
                }
            });
        }, { threshold: 0.1 });

        const observerInterval = setInterval(() => {
            document.querySelectorAll('.animate-on-scroll:not(.is-observed)').forEach((el) => {
                el.classList.add('is-observed');
                observer.observe(el);
            });
        }, 500);

        return () => {
            clearInterval(observerInterval);
            observer.disconnect();
        };
    }, []);

    // Poll pending count every 30s
    useEffect(() => {
        if (!token) return;
        const load = () =>
            superAdminApi.getBunkAdminStats(token)
                .then((s) => setPendingCount(s.pending || 0))
                .catch(() => { });
        load();
        const interval = setInterval(load, 30000);
        return () => clearInterval(interval);
    }, [token]);

    const handleLogin = (tok: string, name: string) => {
        localStorage.setItem('sa_token', tok);
        localStorage.setItem('sa_name', name);
        setToken(tok);
        setAdminName(name);
    };

    const handleLogout = () => {
        localStorage.removeItem('sa_token');
        localStorage.removeItem('sa_name');
        setToken(null);
        setAdminName('Super Admin');
        setCurrentPage('dashboard');
    };

    if (!token) return <LoginPage onLogin={handleLogin} />;

    const renderPage = () => {
        switch (currentPage) {
            case 'dashboard': return <DashboardPage token={token} />;
            case 'approvals': return <ApprovalsPage token={token} onBadgeUpdate={setPendingCount} />;
            case 'bunkadmins': return <BunkAdminsPage token={token} />;
            case 'users': return <UsersPage token={token} />;
            case 'feedback': return <FeedbackPage token={token} />;
        }
    };

    return (
        <div className="h-screen flex overflow-hidden bg-[#0b1120]">
            <Sidebar
                currentPage={currentPage}
                onNavigate={setCurrentPage}
                onLogout={handleLogout}
                adminName={adminName}
                pendingCount={pendingCount}
            />
            <main className="flex-1 overflow-auto">
                {renderPage()}
            </main>
        </div>
    );
}
