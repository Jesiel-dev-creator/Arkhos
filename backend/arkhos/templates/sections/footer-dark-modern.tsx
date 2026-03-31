"use client";

import { cn } from "@/lib/utils";

export default function FooterDarkModern() {
    return (
        <footer className="w-full bg-gradient-to-b from-[#1B004D] to-[#2E0A6F] text-white">
            <div className="max-w-7xl mx-auto px-6 py-16 flex flex-col items-center">
                <div className="flex items-center space-x-3 mb-6">
                    <div className="h-11 w-11 rounded-full bg-white/10 flex items-center justify-center">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" />
                        </svg>
                    </div>
                    <span className="text-xl font-bold">Brand</span>
                </div>
                <p className="text-center max-w-xl text-sm font-normal leading-relaxed text-white/70">
                    Empowering creators worldwide with the most advanced tools. Transform your ideas
                    into reality with our innovative platform.
                </p>

                <div className="mt-10 grid grid-cols-2 md:grid-cols-4 gap-8 w-full max-w-3xl">
                    <div>
                        <h4 className="font-semibold mb-3 text-sm">Product</h4>
                        <ul className="space-y-2 text-sm text-white/60">
                            <li><a href="#" className="hover:text-white transition">Features</a></li>
                            <li><a href="#" className="hover:text-white transition">Pricing</a></li>
                            <li><a href="#" className="hover:text-white transition">Docs</a></li>
                        </ul>
                    </div>
                    <div>
                        <h4 className="font-semibold mb-3 text-sm">Company</h4>
                        <ul className="space-y-2 text-sm text-white/60">
                            <li><a href="#" className="hover:text-white transition">About</a></li>
                            <li><a href="#" className="hover:text-white transition">Blog</a></li>
                            <li><a href="#" className="hover:text-white transition">Careers</a></li>
                        </ul>
                    </div>
                    <div>
                        <h4 className="font-semibold mb-3 text-sm">Resources</h4>
                        <ul className="space-y-2 text-sm text-white/60">
                            <li><a href="#" className="hover:text-white transition">Help Center</a></li>
                            <li><a href="#" className="hover:text-white transition">Community</a></li>
                            <li><a href="#" className="hover:text-white transition">Status</a></li>
                        </ul>
                    </div>
                    <div>
                        <h4 className="font-semibold mb-3 text-sm">Legal</h4>
                        <ul className="space-y-2 text-sm text-white/60">
                            <li><a href="#" className="hover:text-white transition">Privacy</a></li>
                            <li><a href="#" className="hover:text-white transition">Terms</a></li>
                            <li><a href="#" className="hover:text-white transition">Cookies</a></li>
                        </ul>
                    </div>
                </div>
            </div>
            <div className="border-t border-white/10">
                <div className="max-w-7xl mx-auto px-6 py-6 flex flex-col md:flex-row items-center justify-between text-sm font-normal text-white/50 gap-4">
                    <p>&copy; {new Date().getFullYear()} Brand. All rights reserved.</p>
                    <div className="flex gap-6">
                        <a href="#" className="hover:text-white transition">Privacy</a>
                        <a href="#" className="hover:text-white transition">Terms</a>
                        <a href="#" className="hover:text-white transition">Sitemap</a>
                    </div>
                </div>
            </div>
        </footer>
    );
}
