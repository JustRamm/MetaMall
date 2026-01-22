import React from 'react';
import { motion } from 'framer-motion';
import { ChevronRight, Users, Box, Star } from 'lucide-react';
import { Button } from './ui/button';

interface StoreCardProps {
    title: string;
    imageUrl: string;
    logoUrl: string;
    tagline: string;
    description: string;
    visitors: string;
    items: string;
    rating: string;
    Render3D?: React.ComponentType | null;
    backgroundColor?: string;
}

const StoreCard: React.FC<StoreCardProps> = ({
    title,
    imageUrl,
    logoUrl,
    tagline,
    description,
    visitors,
    items,
    rating,
    Render3D
}) => {
    return (
        <div className="w-full h-full mx-auto bg-white rounded-3xl overflow-hidden shadow-2xl border border-slate-100 flex flex-col lg:flex-row">
            {/* Visual Section (Left) */}
            <div
                className="lg:flex-[1.3] bg-slate-50 relative flex items-center justify-center p-8 overflow-hidden group"
            >
                <div className="relative w-full h-full flex items-center justify-center min-h-[300px] lg:min-h-full">
                    {Render3D ? (
                        <div className="w-full h-full absolute inset-0">
                            <Render3D />
                        </div>
                    ) : (
                        <img
                            src={imageUrl}
                            alt={title}
                            className="w-full h-auto max-h-[400px] object-contain drop-shadow-2xl transition-transform duration-700 group-hover:scale-105 group-hover:-rotate-1"
                        />
                    )}
                </div>

                {/* Decorative background circle */}
                <div className="absolute inset-0 bg-gradient-to-tr from-slate-100 to-transparent opacity-50 z-0 pointer-events-none" />
            </div>

            {/* Content Section (Right) */}
            <div className="flex-1 p-8 lg:p-12 flex flex-col bg-white">
                <div className="flex items-center gap-4 mb-6">
                    <span className="text-[10px] font-black tracking-[0.2em] text-slate-400 uppercase">
                        Flagship Store
                    </span>
                    <div className="h-px flex-1 bg-slate-100" />
                </div>

                <div className="w-64 h-64 mb-2 p-4 bg-white rounded-2xl flex items-center justify-center">
                    <img src={logoUrl} alt={`${title} logo`} className="w-full h-full object-contain" />
                </div>

                <h3 className="text-3xl font-bold text-slate-900 mb-4 leading-tight">
                    {tagline}
                </h3>

                <p className="text-slate-600 mb-8 leading-relaxed max-w-md">
                    {description}
                </p>

                {/* Stats Grid */}
                <div className="grid grid-cols-3 gap-6 mb-10 border-t border-b border-slate-50 py-6">
                    <div className="flex flex-col gap-2">
                        <span className="text-2xl font-bold text-slate-900">{visitors}</span>
                        <span className="flex items-center gap-1.5 text-xs font-bold text-slate-400 tracking-wider">
                            <Users className="w-3 h-3" /> VISITORS
                        </span>
                    </div>
                    <div className="flex flex-col gap-2">
                        <span className="text-2xl font-bold text-slate-900">{items}</span>
                        <span className="flex items-center gap-1.5 text-xs font-bold text-slate-400 tracking-wider">
                            <Box className="w-3 h-3" /> ITEMS
                        </span>
                    </div>
                    <div className="flex flex-col gap-2">
                        <span className="text-2xl font-bold text-slate-900">{rating}</span>
                        <span className="flex items-center gap-1.5 text-xs font-bold text-slate-400 tracking-wider">
                            <Star className="w-3 h-3" /> RATING
                        </span>
                    </div>
                </div>

                <Button
                    className="w-full sm:w-auto h-14 bg-black text-white hover:bg-zinc-800 rounded-xl text-base font-bold shadow-xl flex items-center justify-between px-8 group"
                >
                    <span>ENTER {title.toUpperCase()} STORE</span>
                    <ChevronRight className="w-5 h-5 transition-transform group-hover:translate-x-1" />
                </Button>
            </div>
        </div>
    );
};

export default StoreCard;
