import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { User, Clock, CheckCircle, XCircle, MessageSquare } from 'lucide-react';

const DoctorOverview = () => {
    const [requests, setRequests] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchRequests();
    }, []);

    const fetchRequests = async () => {
        try {
            const token = localStorage.getItem('token');
            const res = await fetch('http://localhost:5000/api/doctors/requests', {
                headers: { 'x-auth-token': token }
            });
            const data = await res.json();
            setRequests(data);
        } catch (err) {
            console.error("Failed to fetch requests", err);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="space-y-8">
            <header>
                <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Good Morning, Doctor</h1>
                <p className="text-gray-500 mt-2">You have {requests.length} pending patient requests.</p>
            </header>

            {loading ? (
                <div className="text-center py-20 text-gray-400">Loading requests...</div>
            ) : requests.length === 0 ? (
                <div className="bg-white dark:bg-slate-800 p-12 rounded-3xl text-center shadow-sm">
                    <div className="w-16 h-16 bg-gray-100 dark:bg-slate-700 rounded-full flex items-center justify-center mx-auto mb-4">
                        <CheckCircle className="text-gray-400" size={32} />
                    </div>
                    <h3 className="text-xl font-bold text-gray-900 dark:text-white">All caught up!</h3>
                    <p className="text-gray-500 mt-2">No pending connection requests at the moment.</p>
                </div>
            ) : (
                <div className="grid gap-4">
                    {requests.map(req => (
                        <motion.div
                            key={req._id}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="bg-white dark:bg-slate-800 p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-slate-700 flex flex-col md:flex-row items-start md:items-center gap-6"
                        >
                            {/* Patient Info */}
                            <div className="flex items-center gap-4 min-w-[200px]">
                                <div className="w-12 h-12 bg-indigo-100 rounded-full flex items-center justify-center text-indigo-600 font-bold text-lg">
                                    {req.patient?.firstName?.[0] || 'P'}
                                </div>
                                <div>
                                    <h3 className="font-bold text-gray-900 dark:text-white">
                                        {req.patient?.firstName} {req.patient?.lastName}
                                    </h3>
                                    <p className="text-xs font-mono text-gray-400">{req.patientId}</p>
                                </div>
                            </div>

                            {/* Problem */}
                            <div className="flex-1 bg-gray-50 dark:bg-slate-900 p-4 rounded-xl">
                                <div className="flex items-center gap-2 mb-2">
                                    <span className="bg-red-100 text-red-600 px-2 py-0.5 rounded text-xs font-bold uppercase">{req.problem}</span>
                                    <span className="text-xs text-gray-400 flex items-center gap-1">
                                        <Clock size={12} /> {new Date(req.createdAt).toLocaleDateString()}
                                    </span>
                                </div>
                                <p className="text-gray-600 dark:text-gray-300 text-sm">
                                    <MessageSquare size={14} className="inline mr-1 text-gray-400" />
                                    "{req.message}"
                                </p>
                            </div>

                            {/* Actions */}
                            <div className="flex gap-2">
                                <button className="px-4 py-2 bg-green-50 text-green-600 hover:bg-green-100 rounded-xl font-medium text-sm transition-colors">
                                    Accept
                                </button>
                                <button className="px-4 py-2 bg-red-50 text-red-600 hover:bg-red-100 rounded-xl font-medium text-sm transition-colors">
                                    Decline
                                </button>
                            </div>
                        </motion.div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default DoctorOverview;
