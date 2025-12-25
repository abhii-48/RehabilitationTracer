import { motion } from 'framer-motion';
import { Quote } from 'lucide-react';

const testimonials = [
    {
        name: 'Sarah Jenkins',
        role: 'Knee Surgery Patient',
        image: 'https://randomuser.me/api/portraits/women/44.jpg',
        quote: "RehabTracer made my recovery so much less stressful. Seeing my daily progress kept me motivated to do my exercises every single day.",
    },
    {
        name: 'Dr. Michael Chen',
        role: 'Physiotherapist',
        image: 'https://randomuser.me/api/portraits/men/32.jpg',
        quote: "This platform has revolutionized how I track my patients. I can catch issues early and adjust plans without waiting for the next appointment.",
    },
    {
        name: 'James Wilson',
        role: 'Stroke Survivor',
        image: 'https://randomuser.me/api/portraits/men/86.jpg',
        quote: "Simple, easy to use, and incredibly helpful. The alerts reminded me to take my vitals, which actually saved me from a complication.",
    },
];

const Testimonials = () => {
    return (
        <div id="testimonials" className="py-24 bg-slate-50 dark:bg-slate-900/50 transition-colors duration-300">
            <div className="max-w-7xl mx-auto px-6 lg:px-8">
                <div className="text-center mb-16">
                    <h2 className="text-3xl md:text-4xl font-bold text-slate-900 dark:text-white mb-4">
                        Stories of Recovery
                    </h2>
                    <p className="text-lg text-slate-600 dark:text-slate-400">
                        Hear from the patients and doctors who trust us.
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    {testimonials.map((t, idx) => (
                        <motion.div
                            key={idx}
                            initial={{ opacity: 0, scale: 0.9 }}
                            whileInView={{ opacity: 1, scale: 1 }}
                            viewport={{ once: true }}
                            transition={{ delay: idx * 0.1 }}
                            className="bg-white dark:bg-slate-800 p-8 rounded-3xl shadow-sm border border-slate-100 dark:border-slate-700 flex flex-col relative"
                        >
                            <Quote className="text-indigo-100 dark:text-indigo-900 absolute top-6 right-6" size={48} />
                            <p className="text-slate-600 dark:text-slate-300 mb-6 italic relative z-10">"{t.quote}"</p>
                            <div className="mt-auto flex items-center gap-4">
                                <img
                                    src={t.image}
                                    alt={t.name}
                                    className="w-12 h-12 rounded-full object-cover ring-2 ring-indigo-100 dark:ring-indigo-800"
                                />
                                <div>
                                    <h4 className="font-bold text-slate-900 dark:text-white">{t.name}</h4>
                                    <p className="text-sm text-indigo-600 dark:text-indigo-400">{t.role}</p>
                                </div>
                            </div>
                        </motion.div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default Testimonials;
