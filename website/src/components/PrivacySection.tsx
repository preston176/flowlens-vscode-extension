import { h } from 'preact';

export function PrivacySection() {
    return (
        <section id="privacy" class="relative py-32 bg-gradient-to-b from-black to-gray-900">
            <div class="max-w-5xl mx-auto px-6 text-center">
                <div class="inline-block mb-6 px-4 py-2 bg-green-500/10 border border-green-500/20 rounded-full">
                    <span class="text-sm text-green-300">🔒 100% Private & Secure</span>
                </div>
                <h2 class="text-5xl md:text-6xl font-bold mb-6"><span class="gradient-text">100% Local.</span><br />Private. Yours.</h2>
                <p class="text-xl text-gray-400 mb-12 max-w-3xl mx-auto leading-relaxed">FlowLens never uploads your code or telemetry. All context data stays on your machine, encrypted and secure. We don't see what you're working on — and we don't want to.</p>
                <div class="grid md:grid-cols-3 gap-8 max-w-4xl mx-auto">
                    <div class="p-6 rounded-xl bg-gray-900/50 border border-gray-800">
                        <div class="text-3xl mb-3">🔐</div>
                        <h3 class="font-bold mb-2">Local First</h3>
                        <p class="text-sm text-gray-400">All data stored locally on your device</p>
                    </div>
                    <div class="p-6 rounded-xl bg-gray-900/50 border border-gray-800">
                        <div class="text-3xl mb-3">🚫</div>
                        <h3 class="font-bold mb-2">No Tracking</h3>
                        <p class="text-sm text-gray-400">Zero telemetry or analytics collected</p>
                    </div>
                    <div class="p-6 rounded-xl bg-gray-900/50 border border-gray-800">
                        <div class="text-3xl mb-3">🔑</div>
                        <h3 class="font-bold mb-2">Encrypted</h3>
                        <p class="text-sm text-gray-400">End-to-end encryption for sync</p>
                    </div>
                </div>
            </div>
        </section>
    );
}
