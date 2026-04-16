import React, { useState, FormEvent } from 'react';
import { Zap, Lock, Mail, Eye, EyeOff, Shield } from 'lucide-react';
import { superAdminApi } from '../../services/api';

interface LoginPageProps {
    onLogin: (token: string, name: string) => void;
}

export function LoginPage({ onLogin }: LoginPageProps) {
    const [email, setEmail] = useState('superadmin@cng.com');
    const [password, setPassword] = useState('');
    const [showPw, setShowPw] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);
    const [captcha, setCaptcha] = useState({ id: '', question: '' });
    const [captchaAnswer, setCaptchaAnswer] = useState('');

    const fetchCaptcha = async () => {
        try {
            const data = await superAdminApi.getCaptcha();
            setCaptcha({ id: data.captchaId, question: data.question });
        } catch (err) {
            console.error('Captcha fetch failed', err);
        }
    };

    React.useEffect(() => {
        fetchCaptcha();
    }, []);

    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault();
        setError(null);
        setLoading(true);
        if (!captchaAnswer) {
            setError('Please answer the security check');
            setLoading(false);
            return;
        }

        try {
            const result = await superAdminApi.login(email, password, captcha.id, captchaAnswer);
            onLogin(result.token, result.user?.name || 'Super Admin');
        } catch (err) {
            setError((err as Error).message);
            fetchCaptcha();
            setCaptchaAnswer('');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center px-4 relative overflow-hidden font-sans">
            {/* Background Image with Animation/Video-like effect */}
            <div
                className="absolute inset-0 z-0 scale-105 animate-subtle-zoom"
                style={{
                    backgroundImage: 'url("/images/bg.png")',
                    backgroundSize: 'cover',
                    backgroundPosition: 'center',
                    filter: 'brightness(0.25) contrast(1.1)'
                }}
            ></div>

            {/* Overlay gradient for depth */}
            <div className="absolute inset-0 bg-gradient-to-t from-[#040f16] via-transparent to-[#040f16]/90 z-0"></div>

            <div className="w-full max-w-md relative z-10">
                {/* Header */}
                <div className="text-center mb-8">
                    <div className="inline-flex items-center justify-center w-24 h-24 bg-white/10 backdrop-blur-md border border-white/20 rounded-3xl mb-4 shadow-2xl overflow-hidden relative group">
                        <img src="/images/logo.png" alt="CNG Finder Logo" className="w-16 h-16 object-contain z-10 group-hover:scale-110 transition-transform duration-500" />
                    </div>
                    <h1 className="text-4xl font-bold text-white tracking-tight drop-shadow-lg mb-1">Super Admin</h1>
                    <p className="text-slate-300 font-medium">Station Management Portal</p>
                </div>

                {/* Card */}
                <div className="bg-[#0a1924]/80 backdrop-blur-xl border border-white/10 rounded-3xl shadow-[0_20px_50px_rgba(0,0,0,0.5)] p-8 relative overflow-hidden">
                    <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-teal-500 via-cyan-400 to-teal-500 animate-gradient-x"></div>
                    <div className="flex items-center gap-2 mb-6 p-3 rounded-xl bg-teal-500/10 border border-teal-500/20">
                        <Shield size={16} className="text-teal-400" />
                        <span className="text-xs text-teal-300 font-bold uppercase tracking-wider">Secure Access</span>
                    </div>

                    {error && (
                        <div className="mb-4 p-3 rounded-xl text-sm text-red-300 flex items-start gap-2"
                            style={{ background: 'rgba(220,38,38,0.15)', border: '1px solid rgba(220,38,38,0.3)' }}>
                            <span>⚠</span> {error}
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-5">
                        <div>
                            <label className="block text-sm font-medium text-slate-300 mb-2">Email</label>
                            <div className="relative">
                                <Mail size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                                <input
                                    type="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    required
                                    className="w-full pl-10 pr-4 py-3 rounded-xl text-sm text-white placeholder-slate-500 outline-none focus:ring-2 focus:ring-teal-500"
                                    style={{ background: 'rgba(4,15,22,1)', border: '1px solid rgba(56,189,248,0.2)' }}
                                    placeholder="superadmin@cng.com"
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-slate-300 mb-2">Password</label>
                            <div className="relative">
                                <Lock size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                                <input
                                    type={showPw ? 'text' : 'password'}
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    required
                                    className="w-full pl-10 pr-12 py-3 rounded-xl text-sm text-white placeholder-slate-500 outline-none focus:ring-2 focus:ring-teal-500"
                                    style={{ background: 'rgba(4,15,22,1)', border: '1px solid rgba(56,189,248,0.2)' }}
                                    placeholder="Enter password"
                                />
                                <button type="button" onClick={() => setShowPw(!showPw)}
                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white transition-colors">
                                    {showPw ? <EyeOff size={16} /> : <Eye size={16} />}
                                </button>
                            </div>
                        </div>

                        <div className="bg-teal-900/10 p-4 rounded-xl border border-teal-800/20">
                            <label className="block text-sm font-bold text-teal-400 mb-3 text-left">
                                Security Verification
                            </label>
                            <div className="flex flex-col gap-3">
                                <div
                                    className="bg-[#040f16] rounded-lg p-1 flex items-center justify-center h-12 overflow-hidden shadow-inner"
                                    dangerouslySetInnerHTML={{ __html: captcha.question }}
                                />
                                <div className="flex gap-2">
                                    <input
                                        type="text"
                                        value={captchaAnswer}
                                        onChange={(e) => setCaptchaAnswer(e.target.value)}
                                        className="flex-1 px-4 py-2 bg-[#040f16] text-white border border-teal-800/20 rounded-lg outline-none focus:ring-2 focus:ring-teal-500 transition-all placeholder:text-slate-600"
                                        placeholder="Type symbols"
                                        required
                                    />
                                    <button
                                        type="button"
                                        onClick={fetchCaptcha}
                                        className="p-2 text-teal-400 hover:bg-teal-500/10 rounded-lg transition-all"
                                    >
                                        <Zap size={18} />
                                    </button>
                                </div>
                            </div>
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full py-3 rounded-xl font-semibold text-white glow-button disabled:opacity-50"
                        >
                            {loading ? 'Signing in…' : 'Sign In'}
                        </button>
                    </form>

                    <p className="text-center text-xs text-slate-500 mt-6">
                        Default: superadmin@cng.com / SuperAdmin@2026
                    </p>
                </div>
            </div>
        </div>
    );
}
