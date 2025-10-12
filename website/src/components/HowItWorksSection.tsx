import { h } from 'preact';

export function HowItWorksSection() {
    return (
        <section id="how-it-works" class="relative py-32 bg-black">
            <div class="section-divider mb-20"></div>
            <div class="max-w-7xl mx-auto px-6">
                <div class="text-center mb-20">
                    <h2 class="text-5xl md:text-6xl font-bold mb-6">How It <span class="gradient-text">Works</span></h2>
                    <p class="text-xl text-gray-400">Three steps to never lose context again</p>
                </div>
                <div class="grid md:grid-cols-3 gap-12">
                    <div class="text-center">
                        <div class="w-20 h-20 mx-auto mb-6 rounded-2xl bg-gradient-to-br from-blue-500/15 to-blue-600/15 border border-blue-500/25 flex items-center justify-center">
                            <span class="text-4xl font-bold gradient-text">1</span>
                        </div>
                        <h3 class="text-2xl font-bold mb-4">📸 Capture</h3>
                        <p class="text-gray-400 leading-relaxed">FlowLens tracks your coding flow locally in real-time. Files, tabs, terminals, git state — everything that matters.</p>
                    </div>
                    <div class="text-center">
                        <div class="w-20 h-20 mx-auto mb-6 rounded-2xl bg-gradient-to-br from-blue-500/15 to-blue-600/15 border border-blue-500/25 flex items-center justify-center">
                            <span class="text-4xl font-bold gradient-text">2</span>
                        </div>
                        <h3 class="text-2xl font-bold mb-4">🔐 Sync</h3>
                        <p class="text-gray-400 leading-relaxed">It securely saves context metadata (never your code) so you can resume across machines or after restarts.</p>
                    </div>
                    <div class="text-center">
                        <div class="w-20 h-20 mx-auto mb-6 rounded-2xl bg-gradient-to-br from-blue-500/15 to-blue-600/15 border border-blue-500/25 flex items-center justify-center">
                            <span class="text-4xl font-bold gradient-text">3</span>
                        </div>
                        <h3 class="text-2xl font-bold mb-4">⚡ Resume</h3>
                        <p class="text-gray-400 leading-relaxed">One click reopens exactly how you left off. Your flow state, instantly restored. No mental overhead.</p>
                    </div>
                </div>
            </div>
        </section>
    );
}
