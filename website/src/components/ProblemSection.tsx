import { h } from 'preact';

export function ProblemSection() {
    return (
        <section class="relative py-32 bg-black">
            <div class="section-divider mb-20"></div>
            <div class="max-w-7xl mx-auto px-6">
                <div class="text-center mb-20">
                    <h2 class="text-5xl md:text-6xl font-bold mb-6">You Lose <span class="gradient-text">Hours</span><br />Rebuilding Context.</h2>
                    <p class="text-xl text-gray-400 max-w-2xl mx-auto">Every interruption costs you focus. FlowLens brings it back instantly.</p>
                </div>
                <div class="grid md:grid-cols-3 gap-8">
                    <div class="card-hover p-8 rounded-2xl bg-gradient-to-br from-gray-900 to-gray-900/50 border border-gray-800">
                        <div class="text-5xl mb-4">🤔</div>
                        <h3 class="text-2xl font-bold mb-4 text-white">Context Lost</h3>
                        <p class="text-gray-400 leading-relaxed">Ever opened VS Code and forgot what you were fixing? That "what was I doing?" moment steals your momentum.</p>
                    </div>
                    <div class="card-hover p-8 rounded-2xl bg-gradient-to-br from-gray-900 to-gray-900/50 border border-gray-800">
                        <div class="text-5xl mb-4">📂</div>
                        <h3 class="text-2xl font-bold mb-4 text-white">Tab Chaos</h3>
                        <p class="text-gray-400 leading-relaxed">Lost in 20 tabs after a quick break? Trying to remember which files matter is mental overhead you don't need.</p>
                    </div>
                    <div class="card-hover p-8 rounded-2xl bg-gradient-to-br from-gray-900 to-gray-900/50 border border-gray-800">
                        <div class="text-5xl mb-4">💭</div>
                        <h3 class="text-2xl font-bold mb-4 text-white">Memory Fade</h3>
                        <p class="text-gray-400 leading-relaxed">Forgot which terminal command you last ran? Or why you opened that specific file? Your brain isn't a bookmark manager.</p>
                    </div>
                </div>
            </div>
        </section>
    );
}
