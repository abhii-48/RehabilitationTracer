import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, X, Stethoscope, ChevronRight, CheckCircle, ArrowRight } from 'lucide-react';

const problemMapping = {
    'knee': 'Orthopedic Specialist',
    'back': 'Physiotherapist',
    'neck': 'Physiotherapist',
    'fracture': 'Orthopedic Specialist',
    'muscle': 'Sports Injury Specialist',
    'pain': 'Pain Management Specialist'
};

const ConnectDoctorModal = ({ isOpen, onClose }) => {
    const [step, setStep] = useState(1); // 1: Search, 2: List, 3: Details, 4: Connect
    const [query, setQuery] = useState('');
    const [suggestedDomain, setSuggestedDomain] = useState(null);
    const [doctors, setDoctors] = useState([]);
    const [selectedDoctor, setSelectedDoctor] = useState(null);
    const [connectionMsg, setConnectionMsg] = useState('');
    const [loading, setLoading] = useState(false);

    // Feedback State
    const [status, setStatus] = useState('idle'); // idle, loading, success, error
    const [feedbackMessage, setFeedbackMessage] = useState('');

    // Reset when modal opens
    useEffect(() => {
        if (isOpen) {
            setStep(1);
            setQuery('');
            setDoctors([]);
            setSelectedDoctor(null);
            setStatus('idle');
            setFeedbackMessage('');
            setConnectionMsg('');
        }
    }, [isOpen]);

    // Live suggestion logic
    useEffect(() => {
        const lowerQ = query.toLowerCase();
        const foundKey = Object.keys(problemMapping).find(key => lowerQ.includes(key));
        setSuggestedDomain(foundKey ? problemMapping[foundKey] : null);
    }, [query]);

    const handleSearch = async (domain) => {
        setLoading(true);
        try {
            const token = localStorage.getItem('token');
            console.log("Searching for domain:", domain, "Token:", token ? "Present" : "Missing");

            const res = await fetch(`http://localhost:5000/api/doctors/search?domain=${encodeURIComponent(domain)}`, {
                headers: { 'x-auth-token': token }
            });

            if (!res.ok) {
                const errData = await res.json();
                console.error("Search API Error:", errData);
                setDoctors([]); // Clear doctors on error
                return;
            }

            const data = await res.json();
            console.log("Search Results:", data);

            if (Array.isArray(data)) {
                setDoctors(data);
                setStep(2);
            } else {
                console.error("API returned non-array:", data);
                setDoctors([]);
            }
        } catch (err) {
            console.error("Search Fetch Error:", err);
            setDoctors([]);
        } finally {
            setLoading(false);
        }
    };

    const checkConnection = async (doctor) => {
        setLoading(true);
        try {
            const token = localStorage.getItem('token');
            const res = await fetch(`http://localhost:5000/api/doctors/check-connection/${doctor._id}`, {
                headers: { 'x-auth-token': token }
            });
            const data = await res.json();

            if (data.exists) {
                // Connection exists
                setSelectedDoctor(doctor);
                setStep(4);
                setStatus('error'); // Use error state to show warning
                setFeedbackMessage(`You are already connected to Dr. ${doctor.lastName} (Status: ${data.status}).`);
            } else {
                setSelectedDoctor(doctor);
                setStep(4);
                // Clear any previous messages
                setStatus('idle');
                setFeedbackMessage('');
            }
        } catch (err) {
            console.error("Check Connection Error:", err);
            // specific error handling if endpoint fails (e.g. 404 if route not waiting) is not needed as we proceed to allow connect but maybe fail later
            setSelectedDoctor(doctor);
            setStep(4);
        } finally {
            setLoading(false);
        }
    };

    const handleConnectSubmit = async () => {
        // If we are in 'error' state from checkConnection (meaning connection exists), block submission.
        // Or if the error message implies existing connection.
        if (status === 'error' && feedbackMessage.includes('already connected')) {
            return;
        }

        if (!connectionMsg.trim()) {
            setStatus('error');
            setFeedbackMessage('Please describe your problem.');
            return;
        }

        setStatus('loading');
        try {
            const token = localStorage.getItem('token');
            const userString = localStorage.getItem('user');

            if (!token || !userString) {
                setStatus('error');
                setFeedbackMessage('Authentication error. Please log in again.');
                return;
            }

            const user = JSON.parse(userString);

            const res = await fetch('http://localhost:5000/api/doctors/connect', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'x-auth-token': token
                },
                body: JSON.stringify({
                    patientId: user.id,
                    doctorId: selectedDoctor._id,
                    problem: query,
                    message: connectionMsg
                })
            });

            const data = await res.json();

            if (res.ok) {
                setStatus('success');
                setFeedbackMessage('Request sent! The doctor has been notified.');
                // Auto close after 2 seconds
                setTimeout(() => {
                    onClose();
                }, 2000);
            } else {
                setStatus('error');
                setFeedbackMessage(data.msg || 'Failed to send request.');
            }
        } catch (err) {
            console.error(err);
            setStatus('error');
            setFeedbackMessage('Network error. Unable to connect to server.');
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
            <motion.div
                initial={{ scale: 0.95, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className="bg-white dark:bg-slate-900 w-full max-w-2xl h-[600px] rounded-3xl shadow-2xl flex flex-col overflow-hidden"
            >
                {/* Header */}
                <div className="p-6 border-b border-gray-100 dark:border-slate-800 flex justify-between items-center">
                    <div>
                        <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                            {step === 1 && "Start a Check-up"}
                            {step === 2 && `Doctors for "${suggestedDomain}"`}
                            {step === 3 && "Doctor Profile"}
                            {step === 4 && "Request Connection"}
                        </h2>
                        {step === 1 && <p className="text-sm text-gray-500">Describe your problem to find a specialist</p>}
                    </div>
                    <button onClick={onClose} className="p-2 hover:bg-gray-100 dark:hover:bg-slate-800 rounded-full">
                        <X size={20} className="text-gray-500" />
                    </button>
                </div>

                {/* Body */}
                <div className="flex-1 overflow-y-auto p-6">

                    {/* STEP 1: SEARCH */}
                    {step === 1 && (
                        <div className="flex flex-col items-center justify-center h-full space-y-6">
                            <div className="w-full relative">
                                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={24} />
                                <input
                                    autoFocus
                                    type="text"
                                    value={query}
                                    onChange={(e) => setQuery(e.target.value)}
                                    placeholder="Examples: 'Severe back pain', 'Knee injury'..."
                                    className="w-full pl-14 pr-6 py-4 text-lg rounded-2xl bg-gray-50 dark:bg-slate-800 border-none focus:ring-2 focus:ring-indigo-500 transition-all dark:text-white"
                                />
                            </div>

                            <AnimatePresence>
                                {suggestedDomain && (
                                    <motion.button
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        onClick={() => handleSearch(suggestedDomain)}
                                        className="flex items-center gap-3 bg-indigo-600 hover:bg-indigo-700 text-white px-8 py-3 rounded-full font-medium shadow-lg transition-all"
                                    >
                                        <Stethoscope size={20} />
                                        <span>Consult a <strong>{suggestedDomain}</strong></span>
                                        <ChevronRight size={18} />
                                    </motion.button>
                                )}
                            </AnimatePresence>
                        </div>
                    )}

                    {/* STEP 2: DOCTOR LIST */}
                    {step === 2 && (
                        <div className="space-y-4">
                            {loading ? <p className="text-center text-gray-500">Finding experts...</p> : doctors.length === 0 ? <p className="text-center">No doctors found for this domain.</p> : null}

                            {doctors.map(doc => (
                                <motion.div
                                    key={doc._id}
                                    initial={{ opacity: 0, x: -10 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    className="flex items-center p-4 bg-gray-50 dark:bg-slate-800 rounded-2xl hover:bg-white dark:hover:bg-slate-700 border border-transparent hover:border-gray-200 dark:hover:border-slate-600 hover:shadow-lg transition-all"
                                >
                                    <div className="w-14 h-14 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600 font-bold text-xl mr-4">
                                        {doc.firstName[0]}
                                    </div>
                                    <div className="flex-1">
                                        <h3 className="font-bold text-gray-900 dark:text-white">Dr. {doc.firstName} {doc.lastName}</h3>
                                        <p className="text-sm text-indigo-600 dark:text-indigo-400 font-medium">{doc.domain}</p>
                                    </div>
                                    <div className="flex gap-2">
                                        <button
                                            onClick={() => { setSelectedDoctor(doc); setStep(3); }}
                                            className="px-4 py-2 text-sm font-medium text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-slate-600 rounded-lg"
                                        >
                                            View Details
                                        </button>
                                        <button
                                            onClick={() => checkConnection(doc)}
                                            className="px-4 py-2 text-sm font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg"
                                        >
                                            Connect
                                        </button>
                                    </div>
                                </motion.div>
                            ))}
                        </div>
                    )}

                    {/* STEP 3: DETAILS */}
                    {step === 3 && selectedDoctor && (
                        <div className="space-y-6 text-center">
                            <div className="w-24 h-24 rounded-full bg-indigo-100 mx-auto flex items-center justify-center text-indigo-600 font-bold text-4xl">
                                {selectedDoctor.firstName[0]}
                            </div>
                            <div>
                                <h3 className="text-2xl font-bold text-gray-900 dark:text-white">Dr. {selectedDoctor.firstName} {selectedDoctor.lastName}</h3>
                                <p className="text-lg text-indigo-600 dark:text-indigo-400">{selectedDoctor.domain}</p>
                            </div>

                            <div className="grid grid-cols-2 gap-4 text-left bg-gray-50 dark:bg-slate-800 p-6 rounded-2xl">
                                <div>
                                    <p className="text-sm text-gray-500">Patients Treated</p>
                                    <p className="text-xl font-bold text-gray-900 dark:text-white">{selectedDoctor.patientsTreated || "100+"}</p>
                                </div>
                                <div>
                                    <p className="text-sm text-gray-500">Experience</p>
                                    <p className="text-xl font-bold text-gray-900 dark:text-white">{selectedDoctor.experience || "5+ Years"}</p>
                                </div>
                                <div className="col-span-2 mt-2">
                                    <p className="text-sm text-gray-500">About</p>
                                    <p className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed">
                                        {selectedDoctor.about || "Dedicated to helping patients regain full mobility."}
                                    </p>
                                </div>
                            </div>

                            <div className="flex gap-4 justify-center">
                                <button onClick={() => setStep(2)} className="px-6 py-3 text-gray-500 font-medium hover:bg-gray-100 dark:hover:bg-slate-800 rounded-xl">Back</button>
                                <button onClick={() => setStep(4)} className="px-8 py-3 bg-indigo-600 text-white font-bold rounded-xl shadow-lg hover:bg-indigo-700">Connect Now</button>
                            </div>
                        </div>
                    )}

                    {/* STEP 4: CONNECT FORM */}
                    {step === 4 && (
                        <div className="space-y-6">
                            {status === 'success' ? (
                                <div className="flex flex-col items-center justify-center h-full space-y-4 pt-10">
                                    <div className="w-20 h-20 rounded-full bg-green-100 flex items-center justify-center text-green-600">
                                        <CheckCircle size={40} />
                                    </div>
                                    <h3 className="text-2xl font-bold text-gray-800 dark:text-white">Request Sent!</h3>
                                    <p className="text-gray-500 text-center max-w-sm">{feedbackMessage}</p>
                                </div>
                            ) : (
                                <>
                                    <div className="bg-indigo-50 dark:bg-indigo-900/20 p-4 rounded-xl flex items-center gap-4">
                                        <div className="w-10 h-10 rounded-full bg-indigo-100 dark:bg-indigo-900/50 flex items-center justify-center text-indigo-600 dark:text-indigo-400 font-bold">
                                            {selectedDoctor.firstName[0]}
                                        </div>
                                        <div>
                                            <p className="text-sm text-gray-500 dark:text-gray-400">Connecting with</p>
                                            <p className="font-bold text-gray-900 dark:text-white">Dr. {selectedDoctor.firstName} {selectedDoctor.lastName}</p>
                                        </div>
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Message to Doctor</label>
                                        <textarea
                                            value={connectionMsg}
                                            onChange={(e) => setConnectionMsg(e.target.value)}
                                            rows={4}
                                            className="w-full p-4 border border-gray-200 dark:border-slate-700 rounded-xl bg-gray-50 dark:bg-slate-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500 outline-none resize-none"
                                            placeholder="Briefly describe your pain and history..."
                                        ></textarea>
                                    </div>

                                    {status === 'error' && (
                                        <div className="p-3 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 rounded-lg text-sm text-center font-medium">
                                            {feedbackMessage}
                                        </div>
                                    )}

                                    <button
                                        onClick={handleConnectSubmit}
                                        disabled={status === 'loading'}
                                        className={`w-full py-4 rounded-xl font-bold shadow-lg flex items-center justify-center gap-2 transition-all
                                            ${status === 'loading'
                                                ? 'bg-gray-300 cursor-not-allowed text-gray-500'
                                                : 'bg-indigo-600 text-white hover:bg-indigo-700 hover:scale-[1.02]'
                                            }`}
                                    >
                                        {status === 'loading' ? 'Sending...' : 'Send Request'}
                                        {status !== 'loading' && <ArrowRight size={18} />}
                                    </button>
                                </>
                            )}
                        </div>
                    )}
                </div>
            </motion.div>
        </div>
    );
};

export default ConnectDoctorModal;
