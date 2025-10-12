import { h } from 'preact';

export function Navigation() {
    return (
        <nav class="fixed top-0 w-full z-50 bg-black/80 backdrop-blur-lg border-b border-gray-800/50">
            <div class="max-w-7xl mx-auto px-6 py-4">
                <div class="flex items-center justify-between">
                    <a href="#" class="flex items-center space-x-2" aria-label="FlowLens Home">
                        <div class="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center">
                            <svg class="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                            </svg>
                        </div>
                        <span class="text-xl font-bold gradient-text">FlowLens</span>
                    </a>
                    <div class="hidden md:flex items-center space-x-8">
                        <a href="#how-it-works" class="text-gray-300 hover:text-white transition">How It Works</a>
                        <a href="#privacy" class="text-gray-300 hover:text-white transition">Privacy</a>
                        <a href="#waitlist" class="btn-primary px-6 py-2 rounded-full text-white font-medium">Join Waitlist</a>
                    </div>
                </div>
            </div>
        </nav>
    );
}
