import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Activity, Plus, ChevronRight, User } from 'lucide-react';
import ConnectDoctorModal from './ConnectDoctorModal';

const MyRecovery = () => {
    const navigate = useNavigate();
    const [programs, setPrograms] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isConnectModalOpen, setIsConnectModalOpen] = useState(false);

    useEffect(() => {
        const fetchPrograms = async () => {
            try {
                const token = localStorage.getItem('token');
                const res = await axios.get('http://localhost:5000/api/doctors/active-doctors', {
                    headers: { 'x-auth-token': token }
                });
                setPrograms(res.data);
                setLoading(false);
            } catch (err) {
                console.error("Failed to fetch programs", err);
                setLoading(false);
            }
        };
        fetchPrograms();
    }, []);

    if (loading) return (
        <div className="flex items-center justify-center h-full py-20 text-gray-400">
            <Activity className="animate-spin mr-2" /> Loading your recovery plan...
        </div>
    );

    return (
        <div className="max-w-4xl mx-auto py-8">
            <div className="flex items-center justify-between mb-8">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900 dark:text-white">My Recovery</h1>
                    <p className="text-gray-500 text-sm">Track your rehabilitation progress</p>
                </div>
                {programs.length > 0 && (
                    <button
                        onClick={() => setIsConnectModalOpen(true)}
                        className="flex items-center gap-2 px-4 py-2 bg-indigo-50 text-indigo-600 rounded-xl font-bold text-sm hover:bg-indigo-100 transition-colors"
                    >
                        <Plus size={16} /> Find New Doctor
                    </button>
                )}
            </div>

            {programs.length === 0 ? (
                // Empty State
                <div className="bg-white dark:bg-slate-900 rounded-3xl p-12 text-center border border-gray-100 dark:border-slate-800 shadow-sm flex flex-col items-center">
                    <div className="w-20 h-20 bg-indigo-50 dark:bg-slate-800 rounded-full flex items-center justify-center mb-6 text-indigo-600">
                        <Activity size={40} />
                    </div>
                    <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
                        You are not enrolled in any recovery program yet.
                    </h2>
                    <p className="text-gray-500 mb-8 max-w-md">
                        Connect with a specialist to start your personalized rehabilitation journey.
                    </p>
                    <button
                        onClick={() => setIsConnectModalOpen(true)}
                        className="px-8 py-3 bg-indigo-600 text-white rounded-xl font-bold hover:bg-indigo-700 transition-all shadow-lg hover:shadow-indigo-500/30 flex items-center gap-2"
                    >
                        Find a Doctor
                    </button>
                </div>
            ) : (
                // Active Programs Grid
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {programs.map(prog => (
                        <div
                            key={prog.connectionId}
                            onClick={() => navigate(`/dashboard/patient/program/${prog.connectionId}`)}
                            className="group bg-white dark:bg-slate-900 p-6 rounded-2xl border border-gray-100 dark:border-slate-800 hover:border-indigo-500 dark:hover:border-indigo-500 cursor-pointer transition-all hover:shadow-lg relative overflow-hidden"
                        >
                            <div className="flex items-start justify-between mb-4">
                                <div className="flex items-center gap-4">
                                    <div className="w-12 h-12 rounded-xl bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600 flex items-center justify-center font-bold text-lg">
                                        {prog.doctor.firstName[0]}
                                    </div>
                                    <div>
                                        <h3 className="font-bold text-lg text-gray-900 dark:text-white group-hover:text-indigo-600 transition-colors">
                                            Dr. {prog.doctor.firstName} {prog.doctor.lastName}
                                        </h3>
                                        <div className="flex items-center gap-2 text-sm text-gray-500">
                                            <span className="bg-gray-100 dark:bg-slate-800 px-2 py-0.5 rounded text-xs font-bold uppercase tracking-wider">
                                                {prog.problem}
                                            </span>
                                            <span className="bg-green-600 text-white px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider shadow-sm">
                                                {prog.status === 'accepted' ? 'Ongoing' : prog.status}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                                <div className="p-2 bg-gray-50 dark:bg-slate-800 rounded-full text-gray-400 group-hover:bg-indigo-50 group-hover:text-indigo-600 transition-colors">
                                    <ChevronRight size={20} />
                                </div>
                            </div>

                            <div className="flex items-center gap-2 text-sm text-gray-500">
                                <User size={14} />
                                <span>{prog.doctor.domain}</span>
                                <span className="text-gray-300">•</span>
                                <span className="font-mono text-xs bg-gray-100 dark:bg-slate-800 px-1.5 py-0.5 rounded">ID: {prog.doctor.doctorId}</span>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            <ConnectDoctorModal
                isOpen={isConnectModalOpen}
                onClose={() => setIsConnectModalOpen(false)}
            />
        </div>
    );
};

export default MyRecovery;
