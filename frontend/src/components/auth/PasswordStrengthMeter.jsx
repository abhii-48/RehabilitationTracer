import { motion } from 'framer-motion';
import { Check, X } from 'lucide-react';
import { useEffect, useState } from 'react';

const PasswordStrengthMeter = ({ password }) => {
    const [strength, setStrength] = useState(0);
    const [checks, setChecks] = useState({
        length: false,
        lowercase: false,
        uppercase: false,
        number: false,
        symbol: false
    });

    useEffect(() => {
        const newChecks = {
            length: password.length >= 6,
            lowercase: /[a-z]/.test(password),
            uppercase: /[A-Z]/.test(password),
            number: /\d/.test(password),
            symbol: /[!@#$%^&*(),.?":{}|<>]/.test(password)
        };

        setChecks(newChecks);

        const strengthCount = Object.values(newChecks).filter(Boolean).length;
        setStrength(strengthCount); // 0 to 5
    }, [password]);

    const getStrengthColor = () => {
        if (strength <= 1) return 'bg-red-500';
        if (strength <= 3) return 'bg-yellow-500';
        if (strength === 4) return 'bg-blue-500';
        return 'bg-green-500';
    };

    const getLabel = () => {
        if (strength <= 1) return 'Weak';
        if (strength <= 3) return 'Medium';
        if (strength === 4) return 'Strong';
        return 'Very Strong';
    };

    return (
        <div className="mt-2 space-y-2">
            {/* Bars */}
            <div className="flex gap-1 h-1.5 w-full">
                {[1, 2, 3, 4, 5].map((level) => (
                    <div
                        key={level}
                        className={`h-full flex-1 rounded-full transition-all duration-300 ${level <= strength ? getStrengthColor() : 'bg-gray-200 dark:bg-slate-700'
                            }`}
                    />
                ))}
            </div>

            <p className={`text-xs text-right font-medium transition-colors ${strength <= 1 ? 'text-red-500' :
                    strength <= 3 ? 'text-yellow-600' :
                        strength === 4 ? 'text-blue-600' : 'text-green-600'
                }`}>
                {getLabel()}
            </p>

            {/* Checklist */}
            <div className="grid grid-cols-2 gap-2 mt-2">
                {[
                    { label: '6+ Characters', check: checks.length },
                    { label: 'Lowercase (a-z)', check: checks.lowercase },
                    { label: 'Uppercase (A-Z)', check: checks.uppercase },
                    { label: 'Number (0-9)', check: checks.number },
                    { label: 'Symbol (!@#$)', check: checks.symbol },
                ].map((item, i) => (
                    <div key={i} className="flex items-center gap-2 text-xs">
                        {item.check ?
                            <Check size={12} className="text-green-500" /> :
                            <X size={12} className="text-gray-400" />
                        }
                        <span className={item.check ? 'text-green-600 dark:text-green-400' : 'text-gray-500'}>
                            {item.label}
                        </span>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default PasswordStrengthMeter;
