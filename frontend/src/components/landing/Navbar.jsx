import { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Link as ScrollLink } from 'react-scroll';
import { motion, AnimatePresence } from 'framer-motion';
import { Menu, X, Activity, Sun, Moon } from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';

const Navbar = () => {
    const [isScrolled, setIsScrolled] = useState(false);
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    const { isDark, toggleTheme } = useTheme();
    const location = useLocation();
    const isHomePage = location.pathname === '/';

    useEffect(() => {
        const handleScroll = () => {
            setIsScrolled(window.scrollY > 20);
        };
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    const navLinks = [
        { name: 'Home', to: 'home', type: 'scroll' },
        { name: 'Features', to: 'about', type: 'scroll' },
        { name: 'How It Works', to: 'how-it-works', type: 'scroll' },
        { name: 'Testimonials', to: 'testimonials', type: 'scroll' },
        { name: 'Contact', to: '/contact', type: 'router' },
    ];

    return (
        <nav
            className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${isScrolled || !isHomePage
                ? 'bg-white/80 dark:bg-gray-900/80 backdrop-blur-md shadow-lg py-3'
                : 'bg-transparent py-5'
                }`}
        >
            <div className="max-w-7xl mx-auto px-6 flex items-center justify-between">
                {/* Logo */}
                <Link to="/" className="flex items-center gap-2 group">
                    <div className="bg-indigo-600 p-2 rounded-lg text-white group-hover:bg-indigo-700 transition-colors">
                        <Activity size={24} />
                    </div>
                    <span className={`text-2xl font-bold tracking-tight ${isScrolled || !isHomePage ? 'text-gray-900 dark:text-white' : 'text-gray-900 dark:text-white'}`}>
                        Rehab<span className="text-indigo-600">Tracer</span>
                    </span>
                </Link>

                {/* Desktop Nav */}
                <div className="hidden md:flex items-center gap-8">
                    {navLinks.map((link) => {
                        if (link.type === 'scroll') {
                            if (isHomePage) {
                                return (
                                    <ScrollLink
                                        key={link.name}
                                        to={link.to}
                                        smooth={true}
                                        duration={500}
                                        offset={-80}
                                        className="cursor-pointer font-medium text-gray-600 dark:text-gray-300 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors relative group"
                                    >
                                        {link.name}
                                        <span className="absolute inset-x-0 bottom-0 h-0.5 bg-indigo-600 transform scale-x-0 group-hover:scale-x-100 transition-transform origin-left" />
                                    </ScrollLink>
                                );
                            } else {
                                return (
                                    <Link
                                        key={link.name}
                                        to="/"
                                        className="font-medium text-gray-600 dark:text-gray-300 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors"
                                    >
                                        {link.name}
                                    </Link>
                                );
                            }
                        } else {
                            return (
                                <Link
                                    key={link.name}
                                    to={link.to}
                                    className="font-medium text-gray-600 dark:text-gray-300 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors"
                                >
                                    {link.name}
                                </Link>
                            );
                        }
                    })}

                    {/* Theme Toggle */}
                    <button
                        onClick={toggleTheme}
                        className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-600 dark:text-gray-300 transition-colors"
                        title="Toggle Theme"
                    >
                        {isDark ? <Sun size={20} /> : <Moon size={20} />}
                    </button>

                    <Link
                        to="/login"
                        className="px-6 py-2.5 rounded-full bg-indigo-600 text-white font-medium hover:bg-indigo-700 transition-all shadow-lg hover:shadow-indigo-500/30 transform hover:-translate-y-0.5"
                    >
                        Get Started
                    </Link>
                </div>

                {/* Mobile Menu Button */}
                <button
                    className="md:hidden p-2 text-gray-600 dark:text-gray-300"
                    onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                >
                    {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
                </button>
            </div>

            {/* Mobile Menu */}
            <AnimatePresence>
                {mobileMenuOpen && (
                    <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        className="md:hidden bg-white dark:bg-gray-900 border-t border-gray-100 dark:border-gray-800 overflow-hidden"
                    >
                        <div className="px-6 py-4 flex flex-col gap-4">
                            {navLinks.map((link) => {
                                if (link.type === 'scroll') {
                                    if (isHomePage) {
                                        return (
                                            <ScrollLink
                                                key={link.name}
                                                to={link.to}
                                                smooth={true}
                                                duration={500}
                                                offset={-80}
                                                onClick={() => setMobileMenuOpen(false)}
                                                className="font-medium text-gray-600 dark:text-gray-300 py-2 hover:text-indigo-600 dark:hover:text-indigo-400 cursor-pointer"
                                            >
                                                {link.name}
                                            </ScrollLink>
                                        );
                                    } else {
                                        return (
                                            <Link
                                                key={link.name}
                                                to="/"
                                                onClick={() => setMobileMenuOpen(false)}
                                                className="font-medium text-gray-600 dark:text-gray-300 py-2 hover:text-indigo-600 dark:hover:text-indigo-400"
                                            >
                                                {link.name}
                                            </Link>
                                        );
                                    }
                                } else {
                                    return (
                                        <Link
                                            key={link.name}
                                            to={link.to}
                                            onClick={() => setMobileMenuOpen(false)}
                                            className="font-medium text-gray-600 dark:text-gray-300 py-2 hover:text-indigo-600 dark:hover:text-indigo-400"
                                        >
                                            {link.name}
                                        </Link>
                                    );
                                }
                            })}

                            <div className="flex items-center justify-between py-2 text-gray-600 dark:text-gray-300">
                                <span className="font-medium">Dark Mode</span>
                                <button
                                    onClick={toggleTheme}
                                    className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                                >
                                    {isDark ? <Sun size={20} /> : <Moon size={20} />}
                                </button>
                            </div>

                            <Link
                                to="/login"
                                onClick={() => setMobileMenuOpen(false)}
                                className="w-full text-center px-6 py-3 rounded-xl bg-indigo-600 text-white font-medium hover:bg-indigo-700 shadow-md"
                            >
                                Get Started
                            </Link>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </nav>
    );
};

export default Navbar;
