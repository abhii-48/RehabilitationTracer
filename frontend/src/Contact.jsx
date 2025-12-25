import { useState } from 'react';
import Navbar from './components/landing/Navbar';
import { motion } from 'framer-motion';

const Contact = () => {
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        subject: 'General Inquiry',
        message: ''
    });

    const [status, setStatus] = useState('idle'); // idle, loading, success, error
    const [responseMsg, setResponseMsg] = useState('');

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setStatus('loading');
        setResponseMsg('');

        try {
            const res = await fetch('http://localhost:5000/api/contact', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(formData)
            });

            const data = await res.json();

            if (res.ok) {
                setStatus('success');
                setResponseMsg('Thanks for reaching out! We’ll get back to you within 24–48 hours.');
                setFormData({
                    name: '',
                    email: '',
                    subject: 'General Inquiry',
                    message: ''
                });
            } else {
                setStatus('error');
                setResponseMsg(data.msg || 'Something went wrong. Please try again.');
            }
        } catch (err) {
            console.error(err);
            setStatus('error');
            setResponseMsg('Failed to send message. Please check your connection.');
        }
    };

    return (
        <div className="min-h-screen bg-white dark:bg-slate-900 transition-colors duration-300">
            <Navbar />

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-32 pb-16">
                <div className="max-w-2xl mx-auto">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5 }}
                        className="text-center mb-12"
                    >
                        <h1 className="text-4xl font-extrabold text-gray-900 dark:text-white sm:text-5xl">
                            Contact Us
                        </h1>
                        <p className="mt-4 text-xl text-gray-600 dark:text-gray-300">
                            Have questions or feedback? We'd love to hear from you.
                        </p>
                    </motion.div>

                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5, delay: 0.1 }}
                        className="bg-white dark:bg-slate-800 shadow-xl rounded-2xl p-8 sm:p-10 border border-gray-100 dark:border-slate-700"
                    >
                        <form onSubmit={handleSubmit} className="space-y-6">
                            {/* Full Name */}
                            <div>
                                <label htmlFor="name" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                                    Full Name <span className="text-red-500">*</span>
                                </label>
                                <div className="mt-1">
                                    <input
                                        type="text"
                                        name="name"
                                        id="name"
                                        required
                                        value={formData.name}
                                        onChange={handleChange}
                                        className="block w-full rounded-md border-gray-300 dark:border-slate-600 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:bg-slate-700 dark:text-white py-3 px-4"
                                        placeholder="John Doe"
                                    />
                                </div>
                            </div>

                            {/* Email */}
                            <div>
                                <label htmlFor="email" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                                    Email Address <span className="text-red-500">*</span>
                                </label>
                                <div className="mt-1">
                                    <input
                                        type="email"
                                        name="email"
                                        id="email"
                                        required
                                        value={formData.email}
                                        onChange={handleChange}
                                        className="block w-full rounded-md border-gray-300 dark:border-slate-600 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:bg-slate-700 dark:text-white py-3 px-4"
                                        placeholder="john@example.com"
                                    />
                                </div>
                            </div>

                            {/* Subject */}
                            <div>
                                <label htmlFor="subject" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                                    Subject
                                </label>
                                <div className="mt-1">
                                    <select
                                        name="subject"
                                        id="subject"
                                        value={formData.subject}
                                        onChange={handleChange}
                                        className="block w-full rounded-md border-gray-300 dark:border-slate-600 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:bg-slate-700 dark:text-white py-3 px-4"
                                    >
                                        <option value="General Inquiry">General Inquiry</option>
                                        <option value="Technical Issue">Technical Issue</option>
                                        <option value="Doctor Onboarding">Doctor Onboarding</option>
                                        <option value="Feedback">Feedback</option>
                                    </select>
                                </div>
                            </div>

                            {/* Message */}
                            <div>
                                <label htmlFor="message" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                                    Message <span className="text-red-500">*</span>
                                </label>
                                <div className="mt-1">
                                    <textarea
                                        name="message"
                                        id="message"
                                        rows="4"
                                        required
                                        value={formData.message}
                                        onChange={handleChange}
                                        className="block w-full rounded-md border-gray-300 dark:border-slate-600 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:bg-slate-700 dark:text-white py-3 px-4"
                                        placeholder="How can we help you?"
                                    />
                                </div>
                            </div>

                            {/* Status Messages */}
                            {status === 'success' && (
                                <div className="rounded-md bg-green-50 p-4 border border-green-200">
                                    <div className="flex">
                                        <div className="flex-shrink-0">
                                            <svg className="h-5 w-5 text-green-400" viewBox="0 0 20 20" fill="currentColor">
                                                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                                            </svg>
                                        </div>
                                        <div className="ml-3">
                                            <p className="text-sm font-medium text-green-800">{responseMsg}</p>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {status === 'error' && (
                                <div className="rounded-md bg-red-50 p-4 border border-red-200">
                                    <div className="flex">
                                        <div className="flex-shrink-0">
                                            <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                                                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                                            </svg>
                                        </div>
                                        <div className="ml-3">
                                            <p className="text-sm font-medium text-red-800">{responseMsg}</p>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* Submit Button */}
                            <div>
                                <button
                                    type="submit"
                                    disabled={status === 'loading'}
                                    className={`w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors ${status === 'loading' ? 'opacity-75 cursor-not-allowed' : ''
                                        }`}
                                >
                                    {status === 'loading' ? (
                                        <span className="flex items-center">
                                            <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                            </svg>
                                            Sending...
                                        </span>
                                    ) : (
                                        'Send Message'
                                    )}
                                </button>
                            </div>
                        </form>
                    </motion.div>
                </div>
            </div>
        </div>
    );
};

export default Contact;
