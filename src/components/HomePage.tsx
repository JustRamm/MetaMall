import React, { useState } from 'react';
import { motion } from 'framer-motion';
import StoreCard from './StoreCard.tsx';
import HMStore3D from './HMStore3D.tsx';
import LuLuStore3D from './LuLuStore3D.tsx';
import hmImage from '../assets/hm_store.png';
import luluImage from '../assets/lulu_store.png';
import logo from '../assets/logo.png';
import hmLogo from '../assets/hm_logo.png';
import luluLogo from '../assets/lulu_logo.png';
import { Button } from './ui/button';
import { ChevronRight, Globe, Box, Zap } from 'lucide-react';

const HomePage = ({ onLogout }: { onLogout: () => void }) => {
    const [isStarted, setIsStarted] = useState(false);
    const [activeStore, setActiveStore] = useState<'hm' | 'lulu'>('hm');

    const handleStart = () => {
        setIsStarted(true);
    };

    const toggleStore = () => {
        setActiveStore(prev => prev === 'hm' ? 'lulu' : 'hm');
    };

    const storesData = {
        hm: {
            title: "H&M",
            imageUrl: hmImage,
            Render3D: HMStore3D,
            logoUrl: hmLogo,
            tagline: "Premium Sustainable Fashion",
            description: "Discover the latest in fashion and home at H&M. From high-end luxury collaborations to everyday essentials, explore our curated collections in a fully immersive virtual boutique.",
            visitors: "1.2k+",
            items: "450+",
            rating: "4.9/5",
            backgroundColor: "#F8FAFC" // Default Slate-50
        },
        lulu: {
            title: "Lulu Hyper",
            imageUrl: luluImage,
            Render3D: LuLuStore3D,
            logoUrl: luluLogo,
            tagline: "Your Daily Global Marketplace",
            description: "Experience the ultimate convenience in virtual grocery shopping. Browse fresh produce, international delicacies, and household essentials in our hyper-realistic 3D marketplace.",
            visitors: "2.5k+",
            items: "15k+",
            rating: "4.7/5"
        }
    };

    return (
        <div className="min-h-screen bg-white text-slate-900 font-sans selection:bg-slate-900 selection:text-white">
            {/* Navigation Bar */}
            <nav className={`fixed left-1/2 -translate-x-1/2 z-50 flex items-center justify-between p-2 rounded-full transition-all duration-700 backdrop-blur-xl border ${isStarted
                ? 'top-6 w-[95%] max-w-7xl bg-white/90 shadow-sm border-slate-200'
                : 'top-10 w-[90%] max-w-5xl bg-white/80 shadow-2xl border-slate-200/60'
                }`}>
                <div className="flex items-center gap-3 pl-4 cursor-pointer hover:scale-105 transition-transform duration-300">
                    <img src={logo} alt="MetaMall" className="h-8 w-auto md:h-10 object-contain" />
                </div>

                <div className="hidden md:flex items-center gap-16 absolute left-1/2 -translate-x-1/2">
                    {['Home', 'Stores', 'Admin', 'About'].map((item) => (
                        <span
                            key={item}
                            onClick={() => item === 'Home' && setIsStarted(false)}
                            className="relative text-sm font-bold text-slate-600 hover:text-black cursor-pointer transition-colors group"
                        >
                            {item}
                            <span className="absolute -bottom-1 left-1/2 w-0 h-0.5 bg-black transition-all duration-300 group-hover:w-full group-hover:left-0"></span>
                        </span>
                    ))}
                </div>

                <div className="pr-1">
                    <Button
                        onClick={onLogout}
                        className="rounded-full bg-black text-white hover:bg-zinc-800 px-6 h-10 md:h-11 shadow-md"
                    >
                        Log Out
                    </Button>
                </div>
            </nav>

            {/* Landing Section */}
            <section className={`relative h-screen w-full overflow-hidden flex items-center ${isStarted ? 'hidden' : 'flex'}`}>

                {/* Background Animation */}
                <div className="absolute inset-0 z-0">
                    <FloatingPaths position={1} />
                    <FloatingPaths position={-1} />
                </div>

                <div className="container mx-auto px-6 md:px-12 relative z-10 grid md:grid-cols-2 gap-12 items-center h-full">
                    {/* Left Content */}
                    <div className="space-y-8">
                        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-slate-100 border border-slate-200 text-xs font-semibold uppercase tracking-wider text-slate-600">
                            <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
                            Next-Gen E-Commerce
                        </div>

                        <h1 className="text-5xl md:text-7xl lg:text-8xl font-extrabold tracking-tight leading-[1.1] text-slate-900">
                            The Future of <br />
                            <span className="text-[#f86a59]">
                                Shopping
                            </span> is Here.
                        </h1>

                        <p className="text-lg md:text-xl text-slate-600 max-w-xl leading-relaxed">
                            Experience <span className="font-bold text-[#f86a59]">MetaMall</span>, a hyper-realistic 3D environment where world-class brands come to life.
                            No downloads, no headsets—just pure immersive shopping in your browser.
                        </p>

                        <div className="flex flex-wrap gap-4 pt-4">
                            <button
                                onClick={handleStart}
                                className="group relative inline-flex h-14 items-center justify-center overflow-hidden rounded-full bg-neutral-950 px-8 font-medium text-neutral-50 transition-all duration-300 hover:bg-neutral-800 hover:ring-2 hover:ring-neutral-800 hover:ring-offset-2"
                            >
                                <span className="mr-2 text-lg">Get Started</span>
                                <ChevronRight className="transition-transform group-hover:translate-x-1" />
                            </button>

                            <button className="inline-flex h-14 items-center justify-center rounded-full border border-slate-200 bg-white px-8 font-medium text-slate-900 transition-colors hover:bg-slate-50 hover:text-slate-900">
                                Watch Demo
                            </button>
                        </div>


                    </div>

                    {/* Right Visual (Abstract) */}
                    <div className="hidden md:block relative h-full">
                        {/* We can place a 3D element or just keep the clean aesthetic with the floating paths */}
                        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-gradient-to-tr from-slate-200 to-transparent rounded-full blur-3xl opacity-50 animate-pulse"></div>
                    </div>
                </div>
            </section>

            {/* Main Content (Store Viewer) */}
            {isStarted && (
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8 }}
                    className="fixed inset-0 z-0 pt-24 pb-6 px-6 bg-slate-50/50 flex flex-col overflow-hidden"
                >
                    {/* H&M Background (Red Tint) */}
                    <motion.div
                        className="absolute inset-0 z-[-1] bg-[#FEE2E2] pointer-events-none"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: activeStore === 'hm' ? 1 : 0 }}
                        transition={{ duration: 1 }}
                    />

                    {/* Lulu Background (Cream) */}
                    <motion.div
                        className="absolute inset-0 z-[-1] bg-[#FEFBF0] pointer-events-none"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: activeStore === 'lulu' ? 1 : 0 }}
                        transition={{ duration: 1 }}
                    />

                    <main className="w-full flex-1 relative min-h-0">
                        <div className="w-full h-full mx-auto">
                            <div className="flex items-center justify-between gap-4 h-full">
                                <button
                                    onClick={toggleStore}
                                    className={`p-2 transition-colors duration-300 hover:scale-110 ${activeStore === 'hm' ? 'invisible' : 'text-slate-400 hover:text-slate-900'}`}
                                    aria-label="Previous Store"
                                >
                                    <ChevronRight className="w-10 h-10 rotate-180" strokeWidth={1.5} />
                                </button>

                                <div className="flex-1">
                                    <StoreCard {...storesData[activeStore]} />
                                </div>

                                <button
                                    onClick={toggleStore}
                                    className={`p-2 transition-colors duration-300 hover:scale-110 ${activeStore === 'lulu' ? 'invisible' : 'text-slate-400 hover:text-slate-900'}`}
                                    aria-label="Next Store"
                                >
                                    <ChevronRight className="w-10 h-10" strokeWidth={1.5} />
                                </button>
                            </div>
                        </div>
                    </main>


                </motion.div>
            )}
        </div>
    );
};

function FloatingPaths({ position }: { position: number }) {
    const paths = Array.from({ length: 36 }, (_, i) => ({
        id: i,
        d: `M-${380 - i * 5 * position} -${189 + i * 6}C-${380 - i * 5 * position
            } -${189 + i * 6} -${312 - i * 5 * position} ${216 - i * 6} ${152 - i * 5 * position
            } ${343 - i * 6}C${616 - i * 5 * position} ${470 - i * 6} ${684 - i * 5 * position
            } ${875 - i * 6} ${684 - i * 5 * position} ${875 - i * 6}`,
        color: `rgba(46, 125, 50, ${0.05 + i * 0.01})`, // MetaMall Green tint
        width: 0.5 + i * 0.03,
    }));

    return (
        <div className="pointer-events-none absolute inset-0">
            <svg
                className="h-full w-full text-slate-900 opacity-20"
                viewBox="0 0 696 316"
                fill="none"
            >
                <title>Background Paths</title>
                {paths.map((path) => (
                    <motion.path
                        key={path.id}
                        d={path.d}
                        stroke="currentColor"
                        strokeWidth={path.width}
                        strokeOpacity={0.1 + path.id * 0.03}
                        initial={{ pathLength: 0.3, opacity: 0.6 }}
                        animate={{
                            pathLength: 1,
                            opacity: [0.3, 0.6, 0.3],
                            pathOffset: [0, 1, 0],
                        }}
                        transition={{
                            duration: 20 + Math.random() * 10,
                            repeat: Number.POSITIVE_INFINITY,
                            ease: 'linear',
                        }}
                    />
                ))}
            </svg>
        </div>
    );
}

export default HomePage;
