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
                <div class="inline-block mb-6 px-4 py-2 bg-blue-500/10 border border-blue-500/20 rounded-full">
                    <span class="text-sm text-blue-300">✨ Your Coding Time Machine</span>
                </div>
                <h1 class="hero-title text-6xl md:text-7xl lg:text-8xl font-bold mb-6 leading-tight text-center">
                    Preserve Your Flow.<br />
                    <span class="gradient-text">Resume Where You Left Off.</span>
                </h1>
                <p class="text-xl md:text-2xl text-gray-400 mb-12 max-w-3xl mx-auto leading-relaxed text-center">
                    FlowLens restores your coding context with one click. No more lost time, no more distractions.
                </p>
                <div class="max-w-md mx-auto mb-12">
                    <form class="flex flex-col sm:flex-row gap-4" onSubmit={(e) => handleSubmit(e, 'hero')}>
                        <input
                            type="email"
                            placeholder="Enter your email"
                            required
                            class="flex-1 px-6 py-4 rounded-full bg-gray-900 border border-gray-700 text-white placeholder-gray-500 transition"
                        />
                        <button type="submit" class={`btn-primary px-8 py-4 rounded-full text-white font-semibold whitespace-nowrap ${buttonStateHero === 'joined' ? 'bg-emerald-600' : ''}`}>
                            {buttonStateHero === 'joined' ? '✓ Joined!' : 'Join Early Access'}
                        </button>
                    </form>
                    <p class="text-sm text-gray-500 mt-4 text-center">Join {getWaitlistCount()}+ developers restoring their focus</p>
                </div>
                <div class="relative w-full max-w-5xl mx-auto flex flex-col items-center" aria-label="VS Code product showcase">
                    <img
                        src="/images/sessions-panel-demo.png"
                        alt="FlowLens Sessions Panel Demo Screenshot"
                        class="rounded-xl shadow-2xl border border-gray-800 w-full max-w-4xl bg-[#1e1e1e]"
                        style={{ minHeight: 360, objectFit: 'cover' }}
                    />
                    <div class="text-gray-400 text-sm mt-4">(Animated video coming soon)</div>
                </div>
            </div>
        </section>
    );
}
