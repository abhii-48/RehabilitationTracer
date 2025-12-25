import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios'; // We should probably use a global axios instance or fetch
import { Bell, X, CheckCircle, AlertCircle, Info } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const NotificationCenter = () => {
    const [notifications, setNotifications] = useState([]);
    const [unreadCount, setUnreadCount] = useState(0);
    const [isOpen, setIsOpen] = useState(false);
    const panelRef = useRef(null);

    // Fetch Notifications
    const fetchNotifications = async () => {
        try {
            const token = localStorage.getItem('token');
            if (!token) return;

            const res = await axios.get('http://localhost:5000/api/notifications', {
                headers: { Authorization: `Bearer ${token}` }
            });
            setNotifications(res.data);
            setUnreadCount(res.data.filter(n => !n.read).length);
        } catch (error) {
            console.error("Failed to fetch notifications");
        }
    };

    useEffect(() => {
        fetchNotifications();
        // Optional: Poll every 30s
        const interval = setInterval(fetchNotifications, 30000);
        return () => clearInterval(interval);
    }, []);

    // Close on click outside
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (panelRef.current && !panelRef.current.contains(event.target)) {
                setIsOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const markAsRead = async (id) => {
        try {
            const token = localStorage.getItem('token');
            // Optimistic update
            setNotifications(prev => prev.map(n => n._id === id ? { ...n, read: true } : n));
            setUnreadCount(prev => Math.max(0, prev - 1));

            await axios.put(`http://localhost:5000/api/notifications/${id}/read`, {}, {
                headers: { Authorization: `Bearer ${token}` }
            });
        } catch (error) {
            console.error("Failed to mark read");
        }
    };

    return (
        <div className="relative" ref={panelRef}>
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="relative p-2 rounded-xl text-gray-500 hover:bg-gray-100 dark:hover:bg-slate-800 transition-colors"
            >
                <Bell size={24} />
                {unreadCount > 0 && (
                    <span className="absolute top-1.5 right-1.5 w-2.5 h-2.5 bg-red-500 border-2 border-white dark:border-slate-900 rounded-full"></span>
                )}
            </button>

            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0, y: 10, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.95 }}
                        className="absolute right-0 top-full mt-2 w-80 sm:w-96 bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-gray-100 dark:border-slate-800 overflow-hidden z-[100]"
                    >
                        <div className="p-4 border-b border-gray-100 dark:border-slate-800 flex justify-between items-center">
                            <h3 className="font-bold text-gray-900 dark:text-white">Notifications</h3>
                            <span className="text-xs font-medium text-gray-500">{unreadCount} unread</span>
                        </div>

                        <div className="max-h-[400px] overflow-y-auto">
                            {notifications.length === 0 ? (
                                <div className="p-8 text-center text-gray-400 text-sm">
                                    No notifications yet.
                                </div>
                            ) : (
                                notifications.map((notif) => (
                                    <div
                                        key={notif._id}
                                        onClick={() => markAsRead(notif._id)}
                                        className={`p-4 border-b border-gray-50 dark:border-slate-800/50 cursor-pointer transition-colors relative
                                            ${!notif.read
                                                // Unread: Transparent Red as requested by user for Decline/Critical
                                                ? notif.type === 'decline'
                                                    ? 'bg-red-500/10 hover:bg-red-500/20'
                                                    : 'bg-indigo-50 dark:bg-indigo-900/10'
                                                : 'hover:bg-gray-50 dark:hover:bg-slate-800'
                                            }
                                        `}
                                    >
                                        <div className="flex gap-3">
                                            <div className="mt-0.5 shrink-0">
                                                {notif.type === 'decline' && <AlertCircle size={18} className="text-red-500" />}
                                                {notif.type === 'success' && <CheckCircle size={18} className="text-green-500" />}
                                                {notif.type === 'info' && <Info size={18} className="text-blue-500" />}
                                            </div>
                                            <div>
                                                <p className={`text-sm ${!notif.read ? 'font-semibold text-gray-900 dark:text-white' : 'text-gray-600 dark:text-gray-400'}`}>
                                                    {notif.message}
                                                </p>
                                                {notif.reason && (
                                                    <p className="text-xs mt-1 text-gray-500 dark:text-gray-400 italic">
                                                        " {notif.reason} "
                                                    </p>
                                                )}
                                                <p className="text-[10px] text-gray-400 mt-2">
                                                    {new Date(notif.createdAt).toLocaleDateString()}
                                                </p>
                                            </div>
                                            {!notif.read && (
                                                <div className="absolute top-4 right-4 w-2 h-2 rounded-full bg-red-500"></div>
                                            )}
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default NotificationCenter;
