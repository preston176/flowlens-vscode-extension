import { h } from 'preact';

export function TestimonialsSection() {
    return (
        <section class="relative py-32 bg-black">
            <div class="section-divider mb-20"></div>
            <div class="max-w-7xl mx-auto px-6">
                <div class="text-center mb-20">
                    <h2 class="text-5xl md:text-6xl font-bold mb-6">Loved by <span class="gradient-text">Developers</span></h2>
                    <p class="text-xl text-gray-400">Early testers are already seeing results</p>
                </div>
                <div class="grid md:grid-cols-3 gap-8">
                    <div class="testimonial-card p-8 rounded-2xl card-hover">
                        <div class="flex items-center space-x-1 mb-4"><span class="text-yellow-400">⭐⭐⭐⭐⭐</span></div>
                        <p class="text-gray-300 mb-6 leading-relaxed">"FlowLens saved me at least 2 hours this week. No more 'what was I doing?' moments when I context switch."</p>
                        <div class="flex items-center space-x-3"><div class="w-10 h-10 rounded-full bg-gradient-to-br from-blue-400 to-blue-500"></div></div>
                    </div>
                    <div class="testimonial-card p-8 rounded-2xl card-hover">
                        <div class="flex items-center space-x-1 mb-4"><span class="text-yellow-400">⭐⭐⭐⭐⭐</span></div>
                        <p class="text-gray-300 mb-6 leading-relaxed">"Finally! A tool that understands how developers actually work. Context switching just became painless."</p>
                        <div class="flex items-center space-x-3"><div class="w-10 h-10 rounded-full bg-gradient-to-br from-slate-400 to-slate-500"></div></div>
                    </div>
                    <div class="testimonial-card p-8 rounded-2xl card-hover">
                        <div class="flex items-center space-x-1 mb-4"><span class="text-yellow-400">⭐⭐⭐⭐⭐</span></div>
                        <p class="text-gray-300 mb-6 leading-relaxed">"This is exactly what I needed. Opening VS Code in the morning no longer fills me with dread."</p>
                        <div class="flex items-center space-x-3"><div class="w-10 h-10 rounded-full bg-gradient-to-br from-emerald-500 to-emerald-600"></div></div>
                    </div>
                </div>
            </div>
        </section>
    );
}
