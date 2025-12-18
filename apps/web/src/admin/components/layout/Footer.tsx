import React from 'react';
import { Github } from 'lucide-react';

const Footer: React.FC = () => {
    const currentYear = new Date().getFullYear();

    return (
        <footer className="bg-white dark:bg-[#111111] border-t border-gray-100 dark:border-white/5 py-6 px-8 mt-auto transition-colors duration-300">
            <div className="flex flex-col md:flex-row items-center justify-between text-sm text-gray-500 dark:text-gray-400">
                {/* Copyright */}
                <div className="flex items-center space-x-2 mb-4 md:mb-0 font-medium">
                    <span>© {currentYear} Hotel Management System</span>
                </div>

                {/* Links */}
                <div className="flex items-center space-x-6">
                    <a
                        href="https://github.com/MoisesNEY/hotel-management-system"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center space-x-2 hover:text-gold-default transition-colors font-medium"
                    >
                        <Github className="w-4 h-4" />
                        <span>GitHub</span>
                    </a>
                    <span className="px-3 py-1 bg-gold-default/10 text-gold-default rounded-full text-[10px] font-bold uppercase tracking-wider">
                        v1.0.0
                    </span>
                </div>
            </div>
        </footer>
    );
};

export default Footer;
