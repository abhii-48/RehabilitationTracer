import { motion, AnimatePresence } from 'framer-motion';
import { X, Check } from 'lucide-react';
import { useState, useEffect } from 'react';

const LegalModal = ({ isOpen, onClose, title, content }) => {
    const [accepted, setAccepted] = useState(false);

    // Reset accepted state when modal opens
    useEffect(() => {
        if (isOpen) setAccepted(false);
    }, [isOpen]);

    return (
        <AnimatePresence>
            {isOpen && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center px-4">
                    {/* Backdrop with Blur */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
                    />

                    {/* Modal Content */}
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95, y: 20 }}
                        className="relative w-full max-w-4xl bg-white dark:bg-slate-900 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[85vh]"
                    >
                        {/* Header */}
                        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 dark:border-slate-800">
                            <h3 className="text-xl font-bold text-gray-900 dark:text-white">{title}</h3>
                            <button
                                onClick={onClose}
                                className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-slate-800 text-gray-500 dark:text-slate-400 transition-colors"
                            >
                                <X size={20} />
                            </button>
                        </div>

                        {/* Scrollable Content */}
                        <div className="flex-1 overflow-y-auto p-6 md:p-8 space-y-4 text-gray-600 dark:text-slate-300 leading-relaxed">
                            {content}
                        </div>

                        {/* Footer with Checkbox */}
                        <div className="p-6 border-t border-gray-100 dark:border-slate-800 bg-gray-50 dark:bg-slate-950 flex flex-col sm:flex-row items-center justify-between gap-4">
                            <label className="flex items-center gap-3 cursor-pointer group">
                                <div className={`w-6 h-6 rounded border flex items-center justify-center transition-colors ${accepted ? 'bg-indigo-600 border-indigo-600 text-white' : 'bg-white dark:bg-slate-800 border-gray-300 dark:border-slate-600'}`}>
                                    {accepted && <Check size={14} strokeWidth={3} />}
                                </div>
                                <input
                                    type="checkbox"
                                    className="hidden"
                                    checked={accepted}
                                    onChange={(e) => setAccepted(e.target.checked)}
                                />
                                <span className="text-gray-700 dark:text-slate-300 select-none group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                                    I have read and accept the {title}
                                </span>
                            </label>

                            <button
                                disabled={!accepted}
                                onClick={onClose}
                                className={`px-6 py-2.5 rounded-xl font-bold transition-all ${accepted
                                        ? 'bg-indigo-600 text-white hover:bg-indigo-700 shadow-lg shadow-indigo-500/30'
                                        : 'bg-gray-200 dark:bg-slate-800 text-gray-400 cursor-not-allowed'
                                    }`}
                            >
                                Confirm & Close
                            </button>
                        </div>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
};

export default LegalModal;
