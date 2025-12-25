import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Activity, User, ChevronRight, Clock } from 'lucide-react';

const DoctorHome = () => {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(true);
    const [patients, setPatients] = useState([]);

    useEffect(() => {
        const initDashboard = async () => {
            try {
                const token = localStorage.getItem('token');
                if (!token) return navigate('/login');
                const headers = { 'x-auth-token': token };

                // 1. Check for Pending Requests
                // 1. Check for Pending Requests
                const requestsRes = await axios.get('http://localhost:5000/api/doctors/requests?status=pending', { headers });
                const pendingRequests = requestsRes.data;

                if (pendingRequests.length > 0) {
                    // Redirect if there are pending requests
                    navigate('/dashboard/doctor/requests');
                    return;
                }

                // 2. Fetch Active Patients for "Ongoing Programs" view
                const patientsRes = await axios.get('http://localhost:5000/api/doctors/active-patients', { headers });
                setPatients(patientsRes.data);
                setLoading(false);

            } catch (err) {
                console.error("Dashboard init failed", err);
                setLoading(false);
            }
        };

        initDashboard();
    }, [navigate]);

    if (loading) return (
        <div className="flex items-center justify-center h-full text-gray-400">
            <Activity className="animate-spin mr-2" /> Loading dashboard...
        </div>
    );

    return (
        <div className="max-w-6xl mx-auto">
            <div className="flex items-center justify-between mb-8">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Ongoing Programs</h1>
                    <p className="text-gray-500 text-sm">Manage your active patient recovery plans</p>
                </div>
            </div>

            {patients.length === 0 ? (
                <div className="bg-white dark:bg-slate-900 rounded-3xl p-12 text-center border border-gray-100 dark:border-slate-800 shadow-sm flex flex-col items-center">
                    <div className="w-20 h-20 bg-indigo-50 dark:bg-slate-800 rounded-full flex items-center justify-center mb-6 text-indigo-600">
                        <User size={40} />
                    </div>
                    <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
                        No active patients.
                    </h2>
                    <p className="text-gray-500">
                        When you accept patient requests, they will appear here.
                    </p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {patients.map(p => (
                        <div
                            key={p.connectionId}
                            onClick={() => navigate(`/dashboard/doctor/patient/${p.connectionId}`)}
                            className="group bg-white dark:bg-slate-900 p-6 rounded-2xl border border-gray-100 dark:border-slate-800 hover:border-indigo-500 dark:hover:border-indigo-500 cursor-pointer transition-all hover:shadow-lg relative"
                        >
                            <div className="flex items-center gap-4 mb-4">
                                <div className="w-12 h-12 rounded-xl bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600 flex items-center justify-center font-bold text-lg">
                                    {p.patient.firstName[0]}
                                </div>
                                <div>
                                    <h3 className="font-bold text-lg text-gray-900 dark:text-white group-hover:text-indigo-600 transition-colors">
                                        {p.patient.firstName} {p.patient.lastName}
                                    </h3>
                                    <p className="text-xs text-gray-400 font-mono mb-1">ID: {p.patient.patientId}</p>
                                    <p className="text-sm text-gray-500">{p.problem}</p>
                                </div>
                            </div>

                            <div className="flex items-center justify-between mt-4 pt-4 border-t border-gray-50 dark:border-slate-800">
                                <div className="flex items-center gap-2 text-xs font-bold text-green-600 bg-green-50 px-2 py-1 rounded">
                                    <Activity size={14} /> Active
                                </div>
                                <div className="text-indigo-600 opacity-0 group-hover:opacity-100 transition-opacity">
                                    <ChevronRight size={20} />
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default DoctorHome;
