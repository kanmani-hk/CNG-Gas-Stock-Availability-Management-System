import React, { useState, useEffect } from 'react';
import { Mail, MessageSquare, Calendar, User, Trash2, RefreshCw } from 'lucide-react';
import { superAdminApi } from '../../services/api';

interface Feedback {
    _id: string;
    name: string;
    email: string;
    subject: string;
    message: string;
    createdAt: string;
}

interface FeedbackPageProps {
    token: string;
}

export function FeedbackPage({ token }: FeedbackPageProps) {
    const [feedbacks, setFeedbacks] = useState<Feedback[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const loadFeedback = async () => {
        setIsLoading(true);
        setError(null);
        try {
            const data = await superAdminApi.getFeedback(token);
            setFeedbacks(data);
        } catch (err: any) {
            setError(err.message || 'Failed to load feedback');
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        loadFeedback();
    }, [token]);

    const handleDelete = async (id: string) => {
        if (!window.confirm('Are you sure you want to delete this feedback?')) return;
        try {
            await superAdminApi.deleteFeedback(token, id);
            setFeedbacks(prev => prev.filter(f => f._id !== id));
        } catch (err: any) {
            alert('Failed to delete feedback');
        }
    };

    const formatDate = (dateStr: string) => {
        return new Date(dateStr).toLocaleString('en-IN', {
            day: '2-digit',
            month: 'short',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    return (
        <div className="p-8">
            <div className="flex justify-between items-center mb-8">
                <div>
                    <h1 className="text-3xl font-bold text-white tracking-tight mb-2">User Feedback</h1>
                    <p className="text-slate-400">Review and manage feedback sent by users from the contact page</p>
                </div>
                <button
                    onClick={loadFeedback}
                    className="p-3 bg-white/5 border border-white/10 rounded-xl text-teal-400 hover:bg-white/10 transition-all shadow-xl flex items-center gap-2 group"
                    title="Refresh List"
                >
                    <RefreshCw className={`w-5 h-5 ${isLoading ? 'animate-spin' : 'group-hover:rotate-180 transition-transform duration-500'}`} />
                    <span className="font-semibold">Refresh</span>
                </button>
            </div>

            {error && (
                <div className="bg-rose-900/20 border border-rose-800/50 text-rose-400 p-4 rounded-xl mb-6 flex items-center gap-3">
                    <span className="text-xl">⚠️</span>
                    <p>{error}</p>
                </div>
            )}

            {isLoading && feedbacks.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-20">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-teal-500"></div>
                </div>
            ) : (
                <div className="grid gap-6">
                    {feedbacks.map((item) => (
                        <div key={item._id} className="bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl overflow-hidden hover:border-white/20 transition-all group shadow-2xl">
                            <div className="p-6">
                                <div className="flex justify-between items-start mb-4">
                                    <div className="flex gap-4">
                                        <div className="w-12 h-12 bg-teal-500/10 rounded-xl flex items-center justify-center border border-teal-500/20">
                                            <MessageSquare className="w-6 h-6 text-teal-400" />
                                        </div>
                                        <div>
                                            <h3 className="text-xl font-bold text-white mb-1 tracking-tight">{item.subject}</h3>
                                            <div className="flex items-center gap-4 text-sm text-slate-400">
                                                <div className="flex items-center gap-1.5">
                                                    <User className="w-4 h-4 text-slate-500" />
                                                    <span>{item.name}</span>
                                                </div>
                                                <div className="flex items-center gap-1.5">
                                                    <Mail className="w-4 h-4 text-slate-500" />
                                                    <a href={`mailto:${item.email}`} className="hover:text-teal-400 transition-colors">{item.email}</a>
                                                </div>
                                                <div className="flex items-center gap-1.5">
                                                    <Calendar className="w-4 h-4 text-slate-500" />
                                                    <span>{formatDate(item.createdAt)}</span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                    <button
                                        onClick={() => handleDelete(item._id)}
                                        className="p-2 text-slate-500 hover:text-rose-400 hover:bg-rose-400/10 rounded-lg transition-all opacity-0 group-hover:opacity-100"
                                        title="Delete Feedback"
                                    >
                                        <Trash2 className="w-5 h-5" />
                                    </button>
                                </div>
                                <div className="bg-black/20 rounded-xl p-5 border border-white/5">
                                    <p className="text-slate-300 leading-relaxed whitespace-pre-wrap">
                                        {item.message}
                                    </p>
                                </div>
                            </div>
                        </div>
                    ))}

                    {feedbacks.length === 0 && !isLoading && (
                        <div className="text-center py-20 bg-white/5 rounded-3xl border border-white/10">
                            <MessageSquare className="w-16 h-16 text-slate-600 mx-auto mb-4 opacity-20" />
                            <h3 className="text-xl font-semibold text-slate-400 mb-2">No feedback found</h3>
                            <p className="text-slate-500">User feedback messages will appear here.</p>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}
