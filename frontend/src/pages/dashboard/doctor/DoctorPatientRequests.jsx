import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';
import { Check, X, Clock, AlertCircle, Search, User, Filter } from 'lucide-react';
import { toast } from 'react-hot-toast';

const DoctorPatientRequests = () => {
    const [activeTab, setActiveTab] = useState('pending'); // 'pending' | 'accepted' | 'declined'
    const [requests, setRequests] = useState([]);
    const [loading, setLoading] = useState(true);

    // Decline Modal State
    const [declineModalOpen, setDeclineModalOpen] = useState(false);
    const [selectedRequestId, setSelectedRequestId] = useState(null);
    const [declineReason, setDeclineReason] = useState('');

    useEffect(() => {
        fetchRequests();
    }, [activeTab]);

    const fetchRequests = async () => {
        setLoading(true);
        try {
            const token = localStorage.getItem('token');
            const res = await axios.get(`http://localhost:5000/api/doctors/requests?status=${activeTab}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setRequests(res.data);
        } catch (error) {
            console.error("Error fetching requests:", error);
            // toast.error("Failed to load requests");
        } finally {
            setLoading(false);
        }
    };

    const handleAccept = async (id) => {
        try {
            const token = localStorage.getItem('token');
            await axios.put(`http://localhost:5000/api/doctors/request/${id}/accept`, {}, {
                headers: { Authorization: `Bearer ${token}` }
            });
            toast.success("Request Accepted");
            // Remove from list (animation)
            setRequests(prev => prev.filter(r => r._id !== id));
        } catch (error) {
            toast.error("Failed to accept request");
        }
    };

    const openDeclineModal = (id) => {
        setSelectedRequestId(id);
        setDeclineReason('');
        setDeclineModalOpen(true);
    };

    const handleDeclineSubmit = async () => {
        if (!declineReason.trim()) {
            toast.error("Please enter a reason");
            return;
        }

        try {
            const token = localStorage.getItem('token');
            await axios.put(`http://localhost:5000/api/doctors/request/${selectedRequestId}/decline`,
                { reason: declineReason },
                { headers: { Authorization: `Bearer ${token}` } }
            );
            toast.success("Request Declined & Notification Sent");
            setDeclineModalOpen(false);
            setRequests(prev => prev.filter(r => r._id !== selectedRequestId));
        } catch (error) {
            toast.error("Failed to decline request");
        }
    };

    return (
        <div className="max-w-6xl mx-auto">
            {/* Header / Tabs */}
            <div className="flex items-center justify-between mb-8">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Patient Requests</h1>
                    <p className="text-gray-500 text-sm mt-1">Manage incoming connection requests</p>
                </div>

                {/* Aesthetic Minimal Buttons/Tabs */}
                <div className="flex bg-white dark:bg-slate-800 p-1.5 rounded-xl shadow-sm border border-gray-100 dark:border-slate-700">
                    {['pending', 'accepted', 'declined'].map((tab) => (
                        <button
                            key={tab}
                            onClick={() => setActiveTab(tab)}
                            className={`px-5 py-2 rounded-lg text-sm font-medium transition-all duration-200 capitalize ${activeTab === tab
                                    ? 'bg-indigo-600 text-white shadow-md shadow-indigo-500/20'
                                    : 'text-gray-500 hover:text-gray-800 dark:hover:text-gray-300'
                                }`}
                        >
                            {tab}
                        </button>
                    ))}
                </div>
            </div>

            {/* List */}
            <div className="space-y-4">
                <AnimatePresence>
                    {loading ? (
                        <div className="text-center py-20 text-gray-400">Loading requests...</div>
                    ) : requests.length === 0 ? (
                        <div className="text-center py-20 bg-white dark:bg-slate-900 rounded-3xl border border-dashed border-gray-200 dark:border-slate-800">
                            <User size={48} className="mx-auto text-gray-300 mb-4" />
                            <p className="text-gray-500 font-medium">No {activeTab} requests found.</p>
                        </div>
                    ) : (
                        requests.map((req) => (
                            <motion.div
                                key={req._id}
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, height: 0 }}
                                className="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-gray-100 dark:border-slate-800 shadow-sm hover:shadow-md transition-shadow flex flex-col md:flex-row gap-6"
                            >
                                {/* Patient Info */}
                                <div className="flex-1">
                                    <div className="flex items-center gap-3 mb-2">
                                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-400 to-indigo-500 flex items-center justify-center text-white font-bold">
                                            {req.patient?.firstName?.[0] || 'P'}
                                        </div>
                                        <div>
                                            <h3 className="font-bold text-gray-900 dark:text-white">
                                                {req.patient?.firstName} {req.patient?.lastName}
                                            </h3>
                                            <p className="text-xs text-gray-500">ID: {req.patientId}</p>
                                        </div>
                                    </div>

                                    <div className="bg-gray-50 dark:bg-slate-800/50 p-4 rounded-xl mt-3">
                                        <div className="mb-2">
                                            <span className="text-xs font-semibold text-indigo-500 uppercase tracking-wide">Problem Domain</span>
                                            <p className="text-sm font-medium text-gray-800 dark:text-gray-200">{req.problem}</p>
                                        </div>
                                        <div>
                                            <span className="text-xs font-semibold text-gray-400 uppercase tracking-wide">Message</span>
                                            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1 italic">"{req.message}"</p>
                                        </div>
                                    </div>
                                </div>

                                {/* Actions */}
                                {activeTab === 'pending' && (
                                    <div className="flex flex-col justify-center gap-3 min-w-[140px]">
                                        <button
                                            onClick={() => handleAccept(req._id)}
                                            className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-semibold text-sm transition-colors flex items-center justify-center gap-2"
                                        >
                                            <Check size={16} /> Accept
                                        </button>
                                        <button
                                            onClick={() => openDeclineModal(req._id)}
                                            className="w-full py-2.5 bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-700 text-gray-600 dark:text-gray-400 hover:bg-red-50 dark:hover:bg-red-900/10 hover:text-red-600 hover:border-red-200 transition-colors rounded-xl font-semibold text-sm flex items-center justify-center gap-2"
                                        >
                                            <X size={16} /> Decline
                                        </button>
                                    </div>
                                )}

                                {activeTab !== 'pending' && (
                                    <div className="flex items-center px-6 border-l border-gray-100 dark:border-slate-800">
                                        <span className={`px-4 py-1.5 rounded-full text-sm font-bold capitalize ${activeTab === 'accepted' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                                            }`}>
                                            {activeTab}
                                        </span>
                                    </div>
                                )}
                            </motion.div>
                        ))
                    )}
                </AnimatePresence>
            </div>

            {/* Decline Modal */}
            <AnimatePresence>
                {declineModalOpen && (
                    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="absolute inset-0 bg-black/40 backdrop-blur-sm"
                            onClick={() => setDeclineModalOpen(false)}
                        />
                        <motion.div
                            initial={{ scale: 0.95, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.95, opacity: 0 }}
                            className="bg-white dark:bg-slate-900 w-full max-w-md rounded-3xl shadow-2xl p-6 relative z-10"
                        >
                            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4">Decline Request</h3>
                            <p className="text-sm text-gray-500 mb-4">
                                Please provide a reason for declining. This will be sent to the patient.
                            </p>
                            <textarea
                                value={declineReason}
                                onChange={(e) => setDeclineReason(e.target.value)}
                                placeholder="E.g., I am not specializing in this area..."
                                className="w-full h-32 p-4 rounded-xl bg-gray-50 dark:bg-slate-800 border-none outline-none focus:ring-2 ring-indigo-500/50 resize-none text-gray-700 dark:text-gray-200 mb-6"
                            />
                            <div className="flex gap-3">
                                <button
                                    onClick={() => setDeclineModalOpen(false)}
                                    className="flex-1 py-3 text-gray-500 hover:bg-gray-100 rounded-xl font-semibold"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={handleDeclineSubmit}
                                    className="flex-1 py-3 bg-red-600 hover:bg-red-700 text-white rounded-xl font-bold shadow-lg shadow-red-500/20"
                                >
                                    Send Reason
                                </button>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default DoctorPatientRequests;
