import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Activity, Clock, ChevronRight, User, AlertCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const History = () => {
    const navigate = useNavigate();
    const [history, setHistory] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchHistory = async () => {
            try {
                const token = localStorage.getItem('token');
                const res = await axios.get('http://localhost:5000/api/doctors/history', {
                    headers: { 'x-auth-token': token }
                });
                setHistory(res.data);
                setLoading(false);
            } catch (err) {
                console.error("Failed to fetch history", err);
                setLoading(false);
            }
        };
        fetchHistory();
    }, []);

    const getStatusColor = (status) => {
        switch (status) {
            case 'completed': return 'bg-green-100 text-green-700';
            case 'declined': return 'bg-red-100 text-red-700';
            case 'archived': return 'bg-gray-100 text-gray-700';
            default: return 'bg-gray-100 text-gray-700';
        }
    };

    if (loading) return (
        <div className="flex items-center justify-center h-full py-20 text-gray-400">
            <Activity className="animate-spin mr-2" /> Loading history...
        </div>
    );

    return (
        <div className="max-w-4xl mx-auto py-8">
            <div className="mb-8">
                <h1 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
                    <Clock className="text-indigo-600" /> History
                </h1>
                <p className="text-gray-500 text-sm">Past rehabilitation programs</p>
            </div>

            {history.length === 0 ? (
                <div className="bg-white dark:bg-slate-900 rounded-3xl p-12 text-center border border-gray-100 dark:border-slate-800 shadow-sm flex flex-col items-center">
                    <div className="w-16 h-16 bg-gray-50 dark:bg-slate-800 rounded-full flex items-center justify-center mb-4 text-gray-400">
                        <Clock size={32} />
                    </div>
                    <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-2">No history metadata.</h2>
                    <p className="text-gray-500">You don't have any past programs yet.</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {history.map(prog => (
                        <div
                            key={prog.connectionId}
                            onClick={() => navigate(`/dashboard/patient/program/${prog.connectionId}`)}
                            className="group bg-white dark:bg-slate-900 p-6 rounded-2xl border border-gray-100 dark:border-slate-800 hover:border-indigo-500 dark:hover:border-indigo-500 cursor-pointer transition-all hover:shadow-lg relative opacity-75 hover:opacity-100"
                        >
                            <div className="flex items-start justify-between mb-4">
                                <div className="flex items-center gap-4">
                                    <div className="w-12 h-12 rounded-xl bg-gray-100 dark:bg-slate-800 text-gray-500 flex items-center justify-center font-bold text-lg grayscale">
                                        {prog.doctor.firstName[0]}
                                    </div>
                                    <div>
                                        <h3 className="font-bold text-lg text-gray-900 dark:text-white group-hover:text-indigo-600 transition-colors">
                                            Dr. {prog.doctor.firstName} {prog.doctor.lastName}
                                        </h3>
                                        <div className="flex items-center gap-2 text-sm text-gray-500">
                                            <span className={`px-2 py-0.5 rounded text-xs font-bold uppercase tracking-wider ${getStatusColor(prog.status)}`}>
                                                {prog.status}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                                <div className="p-2 bg-gray-50 dark:bg-slate-800 rounded-full text-gray-400 group-hover:bg-indigo-50 group-hover:text-indigo-600 transition-colors">
                                    <ChevronRight size={20} />
                                </div>
                            </div>
                            <div className="flex items-center justify-between text-sm text-gray-500 mt-2">
                                <div className="flex items-center gap-2">
                                    <User size={14} />
                                    <span>{prog.doctor.domain}</span>
                                </div>
                                <span className="text-xs">
                                    Ended: {new Date(prog.updatedAt).toLocaleDateString()}
                                </span>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default History;
