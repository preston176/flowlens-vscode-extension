import { h } from 'preact';

interface WaitlistSectionProps {
    buttonStateWaitlist: 'idle' | 'joined';
    handleSubmit: (e: Event, scope: 'hero' | 'waitlist') => void;
    getWaitlistCount: () => number;
}

export function WaitlistSection({ buttonStateWaitlist, handleSubmit, getWaitlistCount }: WaitlistSectionProps) {
    return (
        <section id="waitlist" class="relative py-32 bg-gradient-to-b from-black via-blue-900/8 to-black overflow-hidden">
            <div class="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-4xl h-full bg-gradient-to-b from-blue-500/12 via-transparent to-transparent blur-3xl"></div>
            <div class="max-w-4xl mx-auto px-6 text-center relative z-10">
                <h2 class="text-5xl md:text-7xl font-bold mb-6">Stop Losing Your <span class="gradient-text">Flow</span></h2>
                <p class="text-xl md:text-2xl text-gray-400 mb-8 leading-relaxed text-center">Join {getWaitlistCount()}+ developers who are reclaiming their focus.</p>
                
                <div class="mb-12 p-6 bg-gradient-to-r from-emerald-500/10 to-blue-500/10 border border-emerald-500/20 rounded-2xl">
                    <p class="text-lg text-emerald-300 mb-4">🎉 <strong>Early Access Now Available!</strong></p>
                    <a 
                        href="https://marketplace.visualstudio.com/items?itemName=preston176.flowlens" 
                        target="_blank" 
                        rel="noopener noreferrer"
                        class="inline-flex items-center gap-2 px-6 py-3 bg-emerald-600 hover:bg-emerald-700 rounded-full text-white font-semibold transition-all transform hover:scale-105"
                    >
                        Download from VS Code Marketplace →
                    </a>
                </div>
                
                <p class="text-lg text-gray-400 mb-6">Want to stay updated on new features?</p>
                
                <form class="max-w-lg mx-auto mb-8" onSubmit={(e) => handleSubmit(e, 'waitlist')}>
                    <div class="flex flex-col sm:flex-row gap-4">
                        <input type="email" name="email" placeholder="your.email@example.com" required class="flex-1 px-6 py-5 rounded-full bg-gray-900 border border-gray-700 text-white placeholder-gray-500 transition text-lg" />
                        <button type="submit" class={`btn-primary px-10 py-5 rounded-full text-white font-bold whitespace-nowrap text-lg ${buttonStateWaitlist === 'joined' ? 'bg-emerald-600' : ''}`}>
                            {buttonStateWaitlist === 'joined' ? '✓ Subscribed!' : 'Get Updates →'}
                        </button>
                    </div>
                </form>
                <p class="text-sm text-gray-500">✨ Get notified about new features & updates • No spam, ever</p>
                <div class="mt-16 flex flex-wrap justify-center items-center gap-8 text-gray-500">
                    <div class="flex items-center space-x-2"><svg class="w-5 h-5 text-green-500" fill="currentColor" viewBox="0 0 20 20"><path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd" /></svg><span>100% Free</span></div>
                    <div class="flex items-center space-x-2"><svg class="w-5 h-5 text-green-500" fill="currentColor" viewBox="0 0 20 20"><path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd" /></svg><span>Privacy-First</span></div>
                    <div class="flex items-center space-x-2"><svg class="w-5 h-5 text-green-500" fill="currentColor" viewBox="0 0 20 20"><path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd" /></svg><span>Early Feature Access</span></div>
                </div>
            </div>
        </section>
    );
}
