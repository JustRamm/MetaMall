import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import logo from '../assets/logo.png';

interface SplashScreenProps {
    onComplete: () => void;
}

const SplashScreen: React.FC<SplashScreenProps> = ({ onComplete }) => {
    const [progress, setProgress] = useState(0);

    useEffect(() => {
        // Progress bar simulation
        const timer = setInterval(() => {
            setProgress((prev) => {
                if (prev >= 100) {
                    clearInterval(timer);
                    return 100;
                }
                return prev + 2;
            });
        }, 40);

        // Completion delay to allow exit animation
        const completeTimer = setTimeout(() => {
            onComplete();
        }, 3500);

        return () => {
            clearInterval(timer);
            clearTimeout(completeTimer);
        };
    }, [onComplete]);

    return (
        <div className="fixed inset-0 z-[9999] flex flex-col items-center justify-center bg-white text-slate-900 overflow-hidden">
            {/* Background Decor */}
            <div className="absolute inset-0 z-0 opacity-30">
                <div className="absolute top-[-20%] right-[-10%] w-[600px] h-[600px] rounded-full bg-gradient-to-br from-slate-100 to-transparent blur-3xl" />
                <div className="absolute bottom-[-20%] left-[-10%] w-[500px] h-[500px] rounded-full bg-gradient-to-tr from-[#f86a59]/10 to-transparent blur-3xl" />
            </div>

            <div className="relative z-10 flex flex-col items-center">
                {/* Animated Logo */}
                <motion.div
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ duration: 1, ease: "easeOut" }}
                    className="mb-8 relative"
                >
                    <div className="relative w-32 h-32 md:w-40 md:h-40 flex items-center justify-center">
                        {/* Pulse Effect */}
                        <motion.div
                            animate={{ scale: [1, 1.1, 1], opacity: [0.5, 0, 0.5] }}
                            transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                            className="absolute inset-0 rounded-full bg-[#f86a59]/20 blur-xl"
                        />
                        <img
                            src={logo}
                            alt="MetaMall Logo"
                            className="w-full h-full object-contain drop-shadow-2xl"
                        />
                    </div>
                </motion.div>

                {/* Text Animations */}
                <motion.div
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: 0.5, duration: 0.8 }}
                    className="text-center space-y-2"
                >
                    <h1 className="text-4xl md:text-6xl font-black tracking-tight text-slate-900">
                        MetaMall
                    </h1>
                    <p className="text-lg md:text-xl font-medium text-slate-500 tracking-wide uppercase">
                        The Future of Retail
                    </p>
                </motion.div>

                {/* Custom Progress Bar */}
                <motion.div
                    initial={{ opacity: 0, width: 0 }}
                    animate={{ opacity: 1, width: "240px" }}
                    transition={{ delay: 0.8, duration: 0.5 }}
                    className="mt-12 h-1.5 bg-slate-100 rounded-full overflow-hidden relative"
                >
                    <motion.div
                        className="absolute left-0 top-0 h-full bg-[#f86a59]"
                        style={{ width: `${progress}%` }}
                    />
                </motion.div>

                <motion.p
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 1 }}
                    className="mt-4 text-xs font-semibold text-slate-400"
                >
                    {progress < 100 ? "Loading Experience..." : "Ready"}
                </motion.p>
            </div>
        </div>
    );
};

export default SplashScreen;
