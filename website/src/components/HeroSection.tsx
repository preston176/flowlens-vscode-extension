import { h } from 'preact';

interface HeroSectionProps {
    buttonStateHero: 'idle' | 'joined';
    handleSubmit: (e: Event, scope: 'hero' | 'waitlist') => void;
    getWaitlistCount: () => number;
}

export function HeroSection({ buttonStateHero, handleSubmit, getWaitlistCount }: HeroSectionProps) {
    return (
        <section class="relative min-h-screen flex items-center justify-center overflow-hidden hero-gradient pt-20">
            <div class="network-bg"></div>
            <div class="absolute top-20 left-10 w-64 h-64 bg-blue-500/8 rounded-full blur-3xl animate-pulse-glow"></div>
            <div class="absolute bottom-20 right-10 w-96 h-96 bg-blue-600/6 rounded-full blur-3xl animate-pulse-glow" style="animation-delay: 1.5s;"></div>
            <div class="max-w-7xl mx-auto px-6 py-20 relative z-10 flex flex-col items-center w-full">
                <div class="inline-block mb-6 px-4 py-2 bg-emerald-500/20 border border-emerald-500/30 rounded-full">
                    <span class="text-sm text-emerald-200">✨ Now Available on VS Code Marketplace!</span>
                </div>
                <h1 class="hero-title text-6xl md:text-7xl lg:text-8xl font-bold mb-6 leading-tight text-center">
                    Preserve Your Flow.<br />
                    <span class="gradient-text">Resume Where You Left Off.</span>
                </h1>
                <p class="text-xl md:text-2xl text-gray-200 mb-12 max-w-3xl mx-auto leading-relaxed text-center">
                    FlowLens restores your coding context with one click. <br /> No more lost time, no more distractions.
                </p>
                
                {/* Install Now CTA */}
                <div class="flex flex-col items-center gap-6 mb-12">
                    <div class="flex flex-col sm:flex-row gap-4 items-center">
                        <a 
                            href="https://marketplace.visualstudio.com/items?itemName=preston176.flowlens" 
                            target="_blank" 
                            rel="noopener noreferrer"
                            class="inline-flex items-center gap-3 px-8 py-4 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 rounded-full text-white font-semibold text-lg transition-all transform hover:scale-105 shadow-xl hover:shadow-2xl"
                        >
                            <svg class="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                                <path d="M21.29 4.1L17.08.15A1.23 1.23 0 0015.66 0H2.5A1.5 1.5 0 001 1.5v21A1.5 1.5 0 002.5 24h19a1.5 1.5 0 001.5-1.5V5.86a1.5 1.5 0 00-.71-1.76zM14 2.12l5.88 5.88H14zm7 20.38H3V1.5h9.5v7a1.5 1.5 0 001.5 1.5h7z"/>
                            </svg>
                            Install Now - It's Free!
                        </a>
                        <span class="text-gray-400 text-sm">or</span>
                        <button 
                            onClick={() => document.getElementById('waitlist-form')?.scrollIntoView({ behavior: 'smooth' })}
                            class="px-6 py-4 border-2 border-gray-600 hover:border-gray-500 rounded-full text-white font-semibold transition-all"
                        >
                            Get Updates
                        </button>
                    </div>
                    <div class="flex flex-col sm:flex-row gap-4 text-sm text-gray-300 items-center">
                        <span class="flex items-center gap-2">
                            <svg class="w-4 h-4 text-emerald-500" fill="currentColor" viewBox="0 0 20 20">
                                <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd"/>
                            </svg>
                            Free & Open Source
                        </span>
                        <span class="flex items-center gap-2">
                            <svg class="w-4 h-4 text-emerald-500" fill="currentColor" viewBox="0 0 20 20">
                                <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd"/>
                            </svg>
                            Privacy-First
                        </span>
                        <span class="flex items-center gap-2">
                            <svg class="w-4 h-4 text-emerald-500" fill="currentColor" viewBox="0 0 20 20">
                                <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd"/>
                            </svg>
                            Works Offline
                        </span>
                    </div>
                    <p class="text-sm text-gray-400">Join {getWaitlistCount()}+ developers who've already restored their focus</p>
                </div>
                
                {/* Hidden waitlist form for scroll target */}
                <div id="waitlist-form" class="hidden"></div>
                <div class="relative w-full max-w-5xl mx-auto flex flex-col items-center" aria-label="VS Code product showcase">
                    <img
                        src="/images/sessions-panel-demo.png"
                        alt="FlowLens Sessions Panel Demo Screenshot"
                        class="rounded-xl shadow-2xl border border-gray-800 w-full max-w-4xl bg-[#1e1e1e]"
                        style={{ minHeight: 360, objectFit: 'cover' }}
                        fetchpriority={"high"}
                    />
                    <div class="text-gray-300 text-sm mt-4">(Animated video coming soon)</div>
                </div>
            </div>
        </section>
    );
}
