

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Button } from './button';
import {
    Apple as AppleIcon,
    ChevronLeft as ChevronLeftIcon,
    ChevronRight as ChevronRightIcon,
    Github as GithubIcon,
    Grid2X2Plus as Grid2x2PlusIcon,
    Lock as LockIcon,
    User as UserIcon,
} from 'lucide-react';
import { Input } from './input';

export function AuthPage({ onLogin }: { onLogin: () => void }) {
    const [isSignUp, setIsSignUp] = useState(false);
    return (
        <main className="min-h-screen w-full md:grid md:grid-cols-2 bg-white overflow-hidden relative">
            {/* Left Side - Artistic/Testimonial */}
            <div className="relative hidden h-full flex-col justify-between p-10 md:flex border-r border-slate-100 bg-white text-slate-900">

                {/* Floating Background Lines */}
                <div className="absolute inset-0 z-0 overflow-hidden">
                    <FloatingPaths position={-0.2} />
                </div>

                {/* Testimonial Bottom Left */}
                <div className="z-20 max-w-lg mt-auto mb-10">
                    <blockquote className="space-y-4">
                        <p className="text-2xl font-medium leading-relaxed">
                            &ldquo;All the beauty in this world and what use if i cant experience it.&rdquo;
                        </p>
                        <footer className="font-semibold text-lg flex items-center gap-2">
                            <span>~ Karthika</span>
                        </footer>
                    </blockquote>
                </div>
            </div>

            {/* Right Side - Auth Form */}
            <div className="relative flex flex-col justify-center px-8 py-12 lg:px-12 bg-white">


                {/* Auth Content */}
                <div className="mx-auto w-full max-w-md space-y-8">
                    <div className="space-y-2 text-center md:text-left">
                        <h1 className="text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
                            {isSignUp ? "Create an Account" : "Sign In or Join Now!"}
                        </h1>
                        <p className="text-slate-500">
                            {isSignUp ? "Enter your details to create your account." : "login or create your metamall account."}
                        </p>
                    </div>

                    {/* Social Buttons Stack */}
                    <div className="space-y-3">
                        <Button variant="outline" className="w-full h-12 justify-center bg-black text-white hover:bg-zinc-800 hover:text-white border-0 font-medium rounded-lg text-base">
                            <GoogleIcon className="mr-3 size-5 text-white" />
                            Continue with Google
                        </Button>
                        <Button variant="outline" className="w-full h-12 justify-center bg-black text-white hover:bg-zinc-800 hover:text-white border-0 font-medium rounded-lg text-base">
                            <AppleIcon className="mr-3 size-5 text-white" />
                            Continue with Apple
                        </Button>
                        <Button variant="outline" className="w-full h-12 justify-center bg-black text-white hover:bg-zinc-800 hover:text-white border-0 font-medium rounded-lg text-base">
                            <GithubIcon className="mr-3 size-5 text-white" />
                            Continue with GitHub
                        </Button>
                    </div>

                    <div className="relative">
                        <div className="absolute inset-0 flex items-center">
                            <span className="w-full border-t border-slate-200" />
                        </div>
                        <div className="relative flex justify-center text-xs uppercase">
                            <span className="bg-white px-2 text-slate-500">
                                OR
                            </span>
                        </div>
                    </div>

                    {/* Email Form */}
                    <form onSubmit={(e) => { e.preventDefault(); onLogin(); }} className="space-y-4">
                        {isSignUp && (
                            <div className="space-y-2">
                                <p className="text-xs font-medium text-slate-500">Full Name</p>
                                <div className="relative">
                                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500">
                                        <UserIcon className="size-5" />
                                    </span>
                                    <Input
                                        type="text"
                                        placeholder="John Doe"
                                        className="h-12 pl-10 border-slate-200 bg-slate-50 text-base placeholder:text-slate-400 focus-visible:ring-black focus-visible:border-black rounded-lg"
                                        required
                                    />
                                </div>
                            </div>
                        )}

                        <div className="space-y-2">
                            <p className="text-xs font-medium text-slate-500">
                                {isSignUp ? "Email Address" : "Enter your email address to sign in or create an account"}
                            </p>
                            <div className="relative">
                                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 font-medium text-lg">@</span>
                                <Input
                                    type="email"
                                    placeholder="your.email@example.com"
                                    className="h-12 pl-10 border-slate-200 bg-slate-50 text-base placeholder:text-slate-400 focus-visible:ring-black focus-visible:border-black rounded-lg"
                                    required
                                />
                            </div>
                        </div>

                        {isSignUp && (
                            <div className="space-y-2">
                                <p className="text-xs font-medium text-slate-500">Password</p>
                                <div className="relative">
                                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500">
                                        <LockIcon className="size-5" />
                                    </span>
                                    <Input
                                        type="password"
                                        placeholder="••••••••"
                                        className="h-12 pl-10 border-slate-200 bg-slate-50 text-base placeholder:text-slate-400 focus-visible:ring-black focus-visible:border-black rounded-lg"
                                        required
                                    />
                                </div>
                            </div>
                        )}
                        <Button
                            type="submit"
                            className="w-full h-12 bg-black text-white hover:bg-zinc-800 rounded-lg text-base font-bold shadow-lg"
                        >
                            {isSignUp ? "Sign Up" : "Continue With Email"}
                        </Button>
                    </form>

                    <div className="text-center text-sm">
                        <p className="text-slate-500">
                            {isSignUp ? "Already have an account? " : "Don't have an account? "}
                            <button
                                type="button"
                                onClick={() => setIsSignUp(!isSignUp)}
                                className="font-bold text-slate-900 hover:underline"
                            >
                                {isSignUp ? "Sign In" : "Sign Up"}
                            </button>
                        </p>
                    </div>

                    <p className="text-xs text-slate-500 leading-relaxed">
                        By clicking continue, you agree to our{' '}
                        <a href="#" className="underline underline-offset-4 hover:text-slate-900">
                            Terms of Service
                        </a>{' '}
                        and{' '}
                        <a href="#" className="underline underline-offset-4 hover:text-slate-900">
                            Privacy Policy
                        </a>
                        .
                    </p>
                </div>
            </div>
        </main>
    );
}

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
                className="h-full w-full text-slate-900 dark:text-slate-900"
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
                            duration: 15 + Math.random() * 15,
                            repeat: Number.POSITIVE_INFINITY,
                            ease: 'linear',
                        }}
                    />
                ))}
            </svg>
        </div>
    );
}

const GoogleIcon = (props: React.ComponentProps<'svg'>) => (
    <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 24 24"
        fill="currentColor"
        {...props}
    >
        <g>
            <path d="M12.479,14.265v-3.279h11.049c0.108,0.571,0.164,1.247,0.164,1.979c0,2.46-0.672,5.502-2.84,7.669   C18.744,22.829,16.051,24,12.483,24C5.869,24,0.308,18.613,0.308,12S5.869,0,12.483,0c3.659,0,6.265,1.436,8.223,3.307L18.392,5.62   c-1.404-1.317-3.307-2.341-5.913-2.341C7.65,3.279,3.873,7.171,3.873,12s3.777,8.721,8.606,8.721c3.132,0,4.916-1.258,6.059-2.401   c0.927-0.927,1.537-2.251,1.777-4.059L12.479,14.265z" />
        </g>
    </svg>
);
