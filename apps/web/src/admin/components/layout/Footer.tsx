import React from 'react';
import { Heart, Github, FileText } from 'lucide-react';

const Footer: React.FC = () => {
    const currentYear = new Date().getFullYear();

    return (
        <footer className="bg-white border-t border-gray-200 py-4 px-6 mt-auto">
            <div className="flex flex-col md:flex-row items-center justify-between text-sm text-gray-600">
                {/* Copyright */}
                <div className="flex items-center space-x-2 mb-2 md:mb-0">
                    <span>© {currentYear} Hotel Management System</span>
                </div>

                {/* Links */}
                <div className="flex items-center space-x-4">
                    <a
                        href="#"
                        className="flex items-center space-x-1 hover:text-blue-600 transition-colors"
                    >
                        <FileText className="w-4 h-4" />
                        <span>Documentación</span>
                    </a>
                    <a
                        href="#"
                        className="flex items-center space-x-1 hover:text-blue-600 transition-colors"
                    >
                        <Github className="w-4 h-4" />
                        <span>GitHub</span>
                    </a>
                    <span className="px-2 py-1 bg-blue-100 text-blue-700 rounded-md text-xs font-semibold">
                        v1.0.0
                    </span>
                </div>
            </div>
        </footer>
    );
};

export default Footer;
