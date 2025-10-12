import { h } from 'preact';

export function Footer() {
    return (
        <footer class="relative py-16 bg-black border-t border-gray-800">
            <div class="max-w-7xl mx-auto px-6">
                <div class="flex flex-col md:flex-row justify-between items-center space-y-8 md:space-y-0">
                    <div class="flex items-center space-x-2">
                        <div class="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center">
                            <svg class="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"></svg>
                        </div>
                        <div>
                            <div class="text-lg font-bold gradient-text">FlowLens</div>
                            <div class="text-xs text-gray-200">Built by developers who hate losing flow.</div>
                        </div>
                    </div>
                    <div class="flex items-center space-x-6">
                        <a href="#" class="text-gray-200 hover:text-white transition" aria-label="Twitter">
                            <svg class="w-6 h-6" fill="currentColor" viewBox="0 0 24 24"></svg>
                        </a>
                        <a href="#" class="text-gray-200 hover:text-white transition" aria-label="GitHub">
                            <svg class="w-6 h-6" fill="currentColor" viewBox="0 0 24 24"></svg>
                        </a>
                    </div>
                    <div class="flex items-center space-x-6 text-sm text-gray-200">
                        <a href="#" class="hover:text-white transition">Privacy</a>
                        <a href="#" class="hover:text-white transition">Terms</a>
                        <a href="#" class="hover:text-white transition">Contact</a>
                    </div>
                </div>
                <div class="mt-12 pt-8 border-t border-gray-800 text-center text-sm text-gray-200">
                    <p>© 2025 FlowLens. All rights reserved. Your coding time machine. 🚀</p>
                </div>
            </div>
        </footer>
    );
}
