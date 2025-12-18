import { useEffect } from 'react';
import { X } from 'lucide-react';

interface ModalProps {
    isOpen: boolean;
    onClose: () => void;
    title?: string;
    children: React.ReactNode;
    size?: 'sm' | 'md' | 'lg' | 'xl';
}

const Modal = ({ isOpen, onClose, title, children, size = 'md' }: ModalProps) => {
    useEffect(() => {
        if (isOpen) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = 'unset';
        }
        return () => {
            document.body.style.overflow = 'unset';
        };
    }, [isOpen]);

    if (!isOpen) return null;

    const sizeClasses = {
        sm: 'max-w-md',
        md: 'max-w-2xl',
        lg: 'max-w-3xl',
        xl: 'max-w-6xl'
    };

    return (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-[2000] p-4">
            {/* Modal Container */}
            <div
                className={`bg-white dark:bg-[#1c1c1c] rounded-2xl shadow-2xl w-full ${sizeClasses[size]} overflow-hidden max-h-[90vh] flex flex-col border border-gray-100 dark:border-white/10`}
                onClick={(e) => e.stopPropagation()}
            >
                {/* Header */}
                {title && (
                    <div className="flex items-center justify-between px-8 py-6 border-b border-gray-100 dark:border-white/5">
                        <h3 className="text-xl font-bold text-gray-900 dark:text-white tracking-tight">
                            {title}
                        </h3>
                        <button
                            onClick={onClose}
                            className="rounded-full hover:bg-gray-100 dark:hover:bg-white/5 p-2 transition-colors group"
                            type="button"
                        >
                            <X size={20} className="text-gray-400 group-hover:text-gray-600 dark:group-hover:text-white transition-colors" />
                        </button>
                    </div>
                )}

                {/* Body (scrollable if needed) */}
                <div className="overflow-y-auto flex-1">
                    {children}
                </div>
            </div>
        </div>
    );
};

export default Modal;
