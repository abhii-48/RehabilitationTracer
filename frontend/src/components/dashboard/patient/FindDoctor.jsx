import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, Stethoscope, User, Clock, ArrowRight, X, CheckCircle, AlertCircle } from 'lucide-react';

const problemMapping = {
    'knee': 'Orthopedic Specialist',
    'back': 'Physiotherapist',
    'neck': 'Physiotherapist',
    'fracture': 'Orthopedic Specialist',
    'muscle': 'Sports Injury Specialist',
    'headache': 'Neurologist (Rehabilitation)',
    'stroke': 'Neurologist (Rehabilitation)',
    'anxiety': 'Psychologist (Rehabilitation Support)',
    'age': 'Geriatric Care Specialist',
    'pain': 'Pain Management Specialist'
};

const FindDoctor = () => {
    const [query, setQuery] = useState('');
    const [suggestedDomain, setSuggestedDomain] = useState(null);
    const [doctors, setDoctors] = useState([]);
    const [loading, setLoading] = useState(false);
    const [selectedDoctor, setSelectedDoctor] = useState(null);
    const [connectionMsg, setConnectionMsg] = useState('');
    const [requestStatus, setRequestStatus] = useState(null); // 'success', 'error'

    // Debounce search to find domain
    useEffect(() => {
        const lowerQ = query.toLowerCase();
        const foundKey = Object.keys(problemMapping).find(key => lowerQ.includes(key));
        if (foundKey) {
            setSuggestedDomain(problemMapping[foundKey]);
        } else {
            setSuggestedDomain(null);
        }
    }, [query]);

    const fetchDoctors = async (domain) => {
        setLoading(true);
        try {
            const token = localStorage.getItem('token');
            const res = await fetch(`http://localhost:5000/api/doctors/search?domain=${encodeURIComponent(domain)}`, {
                headers: { 'x-auth-token': token }
            });
            const data = await res.json();
            setDoctors(data);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const handleConnect = async () => {
        if (!selectedDoctor) return;

        try {
            const token = localStorage.getItem('token');
            const user = JSON.parse(localStorage.getItem('user'));

            const res = await fetch('http://localhost:5000/api/doctors/connect', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'x-auth-token': token
                },
                body: JSON.stringify({
                    patientId: user.id, // Ensure this matches what your login returns (userId vs patientId)
                    // Note: If user.id is the MongoDB _id, that works for the ref. 
                    // If login returns the formatted "RT-P-...", we might need to send the _id.
                    // Let's assume user.id is the User Model _id for now based on authRoutes.
                    // Wait, in authRoutes:
                    // payload = { user: { id: user.id ... } } -> This is the _id. Correct.
                    doctorId: selectedDoctor._id,
                    problem: query,
                    message: connectionMsg
                })
            });

            const data = await res.json();
            if (!res.ok) throw new Error(data.msg || 'Failed to send request');

            setRequestStatus('success');
            setTimeout(() => {
                setSelectedDoctor(null);
                setRequestStatus(null);
                setConnectionMsg('');
            }, 2000);
        } catch (err) {
            alert(err.message);
            setRequestStatus('error');
        }
    };

    return (
        <div className="space-y-8 min-h-[80vh]">
            <div className="text-center space-y-4">
                <h1 className="text-3xl font-bold text-gray-800 dark:text-white">Find Your Specialist</h1>
                <p className="text-gray-500 dark:text-gray-400">Describe your problem, and we'll connect you with the right expert.</p>

                <div className="relative max-w-2xl mx-auto">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={24} />
                    <input
                        type="text"
                        value={query}
                        onChange={(e) => setQuery(e.target.value)}
                        placeholder="e.g., Severe lower back pain..."
                        className="w-full pl-14 pr-6 py-4 text-lg rounded-2xl shadow-lg border-none bg-white dark:bg-slate-800 focus:ring-2 focus:ring-indigo-500 transition-all dark:text-white placeholder:text-gray-300"
                    />
                </div>

                <AnimatePresence>
                    {suggestedDomain && (
                        <motion.div
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -10 }}
                            className="flex justify-center mt-4"
                        >
                            <button
                                onClick={() => fetchDoctors(suggestedDomain)}
                                className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-2 rounded-full font-medium shadow-md hover:shadow-lg transition-all"
                            >
                                <Stethoscope size={18} />
                                Consult a {suggestedDomain}
                            </button>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>

            {/* Doctor List */}
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 pt-6">
                {loading && <p className="text-center col-span-full text-gray-500">Searching specialists...</p>}

                {doctors.map(doc => (
                    <motion.div
                        key={doc._id}
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="bg-white dark:bg-slate-800 rounded-2xl p-6 shadow-sm border border-gray-100 dark:border-slate-700 hover:-translate-y-1 hover:shadow-xl transition-all group"
                    >
                        <div className="flex items-start justify-between mb-4">
                            <div className="flex gap-4">
                                <div className="w-12 h-12 rounded-full bg-indigo-100 dark:bg-indigo-900/40 flex items-center justify-center text-indigo-600 dark:text-indigo-400 font-bold text-xl">
                                    {doc.firstName[0]}
                                </div>
                                <div>
                                    <h3 className="font-bold text-lg text-gray-800 dark:text-white">Dr. {doc.firstName} {doc.lastName}</h3>
                                    <p className="text-sm text-indigo-600 dark:text-indigo-400 font-medium">{doc.domain}</p>
                                </div>
                            </div>
                        </div>

                        <div className="flex items-center gap-4 text-sm text-gray-500 dark:text-gray-400 mb-6">
                            <div className="flex items-center gap-1">
                                <Clock size={16} />
                                <span>10+ Yrs Exp</span>
                            </div>
                            <div className="flex items-center gap-1">
                                <User size={16} />
                                <span>500+ Patients</span>
                            </div>
                        </div>

                        <div className="flex gap-3">
                            <button className="flex-1 py-2 rounded-xl text-sm font-medium border border-gray-200 dark:border-slate-600 text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-slate-700 transition-colors">
                                View Profile
                            </button>
                            <button
                                onClick={() => setSelectedDoctor(doc)}
                                className="flex-1 py-2 rounded-xl text-sm font-medium bg-indigo-600 text-white hover:bg-indigo-700 shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2"
                            >
                                Connect <ArrowRight size={16} />
                            </button>
                        </div>
                    </motion.div>
                ))}
            </div>

            {/* Connection Modal */}
            <AnimatePresence>
                {selectedDoctor && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4"
                    >
                        <motion.div
                            initial={{ scale: 0.9, y: 20 }}
                            animate={{ scale: 1, y: 0 }}
                            exit={{ scale: 0.9, y: 20 }}
                            className="bg-white dark:bg-slate-900 w-full max-w-lg rounded-3xl shadow-2xl overflow-hidden"
                        >
                            <div className="p-6 border-b border-gray-100 dark:border-slate-800 flex justify-between items-center">
                                <h3 className="text-xl font-bold text-gray-900 dark:text-white">Request Connection</h3>
                                <button onClick={() => setSelectedDoctor(null)} className="p-2 hover:bg-gray-100 dark:hover:bg-slate-800 rounded-full transition-colors">
                                    <X size={20} className="text-gray-500" />
                                </button>
                            </div>

                            <div className="p-6 space-y-4">
                                <div className="flex items-center gap-4 bg-indigo-50 dark:bg-indigo-900/20 p-4 rounded-xl">
                                    <div className="w-10 h-10 rounded-full bg-indigo-100 dark:bg-indigo-900/50 flex items-center justify-center text-indigo-600 dark:text-indigo-400 font-bold">
                                        {selectedDoctor.firstName[0]}
                                    </div>
                                    <div>
                                        <p className="text-sm text-gray-500 dark:text-gray-400">Connecting with</p>
                                        <p className="font-bold text-gray-900 dark:text-white">Dr. {selectedDoctor.firstName} {selectedDoctor.lastName}</p>
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Describe your problem briefly</label>
                                    <textarea
                                        rows="4"
                                        value={connectionMsg}
                                        onChange={(e) => setConnectionMsg(e.target.value)}
                                        className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-slate-700 bg-gray-50 dark:bg-slate-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500 outline-none resize-none"
                                        placeholder="Hi Dr., I have been experiencing..."
                                    ></textarea>
                                </div>
                            </div>

                            <div className="p-6 border-t border-gray-100 dark:border-slate-800 flex justify-end gap-3">
                                {requestStatus === 'success' ? (
                                    <div className="flex items-center gap-2 text-green-600 font-bold px-4">
                                        <CheckCircle size={20} /> Request Sent!
                                    </div>
                                ) : (
                                    <>
                                        <button
                                            onClick={() => setSelectedDoctor(null)}
                                            className="px-6 py-2 rounded-xl text-gray-600 dark:text-gray-400 font-medium hover:bg-gray-100 dark:hover:bg-slate-800 transition-colors"
                                        >
                                            Cancel
                                        </button>
                                        <button
                                            onClick={handleConnect}
                                            className="px-6 py-2 rounded-xl bg-indigo-600 text-white font-bold hover:bg-indigo-700 shadow-lg shadow-indigo-500/20 transition-all hover:scale-105"
                                        >
                                            Send Request
                                        </button>
                                    </>
                                )}
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default FindDoctor;
