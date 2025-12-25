import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Clock, Calendar, CheckCircle, XCircle, Archive, AlertCircle, ChevronRight, User } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const DoctorHistory = () => {
    const navigate = useNavigate();
    const [history, setHistory] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchHistory = async () => {
            try {
                const token = localStorage.getItem('token');
                const res = await axios.get('http://localhost:5000/api/doctors/doctor-history', {
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

    const getStatusParams = (status) => {
        switch (status) {
            case 'completed': return { icon: CheckCircle, color: 'text-green-600', bg: 'bg-green-50', label: 'Completed' };
            case 'declined': return { icon: XCircle, color: 'text-red-600', bg: 'bg-red-50', label: 'Declined' };
            case 'archived': return { icon: Archive, color: 'text-gray-600', bg: 'bg-gray-50', label: 'Archived' };
            default: return { icon: AlertCircle, color: 'text-gray-400', bg: 'bg-gray-50', label: status };
        }
    };

    if (loading) return (
        <div className="flex items-center justify-center h-full py-20 text-gray-400">
            <Clock className="animate-spin mr-2" /> Loading history...
        </div>
    );

    return (
        <div className="max-w-4xl mx-auto">
            <div className="mb-8">
                <h1 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
                    <Clock className="text-indigo-600" /> Patient History
                </h1>
                <p className="text-gray-500 text-sm ml-8">Past rehabilitation programs managed by you</p>
            </div>

            {history.length === 0 ? (
                <div className="bg-white dark:bg-slate-900 rounded-3xl p-12 text-center border border-gray-100 dark:border-slate-800 shadow-sm flex flex-col items-center">
                    <div className="w-16 h-16 bg-gray-50 dark:bg-slate-800 rounded-full flex items-center justify-center mb-4 text-gray-400">
                        <Clock size={32} />
                    </div>
                    <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-1">No history records.</h3>
                    <p className="text-gray-500 text-sm">You don't have any past programs yet.</p>
                </div>
            ) : (
                <div className="space-y-4">
                    {history.map((record) => {
                        const { icon: StatusIcon, color, bg, label } = getStatusParams(record.status);

                        return (
                            <div
                                key={record.connectionId}
                                onClick={() => navigate(`/dashboard/doctor/patient/${record.connectionId}`)}
                                className="group bg-white dark:bg-slate-900 p-5 rounded-xl border border-gray-100 dark:border-slate-800 hover:border-indigo-500 dark:hover:border-indigo-500 cursor-pointer transition-all hover:shadow-md flex items-center justify-between"
                            >
                                <div className="flex items-center gap-4">
                                    <div className={`w-12 h-12 rounded-lg ${bg} ${color} flex items-center justify-center`}>
                                        <StatusIcon size={24} />
                                    </div>
                                    <div>
                                        <h3 className="font-bold text-gray-900 dark:text-white group-hover:text-indigo-600 transition-colors">
                                            {record.patient.firstName} {record.patient.lastName}
                                        </h3>
                                        <div className="flex items-center gap-3 text-sm text-gray-500 mt-1">
                                            <span className="flex items-center gap-1">
                                                <User size={14} />
                                                ID: {record.patient.patientId || 'N/A'}
                                            </span>
                                            <span className="text-gray-300">•</span>
                                            <span>{record.problem}</span>
                                        </div>
                                    </div>
                                </div>

                                <div className="flex items-center gap-6">
                                    <div className="text-right">
                                        <span className={`inline-block px-2.5 py-0.5 rounded text-xs font-bold uppercase tracking-wide ${bg} ${color}`}>
                                            {label}
                                        </span>
                                        <div className="flex items-center gap-1 text-xs text-gray-400 mt-1 justify-end">
                                            <Calendar size={12} />
                                            {new Date(record.updatedAt).toLocaleDateString()}
                                        </div>
                                    </div>
                                    <div className="text-gray-300 group-hover:text-indigo-600 transition-colors">
                                        <ChevronRight size={20} />
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
};

export default DoctorHistory;
