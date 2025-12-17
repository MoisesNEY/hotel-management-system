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
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-[2000]">
            {/* Modal Container */}
            <div
                className={`bg-white rounded-2xl shadow-xl w-full ${sizeClasses[size]} mx-4 md:mx-0 overflow-hidden max-h-[90vh] flex flex-col`}
                onClick={(e) => e.stopPropagation()}
            >
                {/* Header */}
                {title && (
                    <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
                        <h3 className="text-lg md:text-xl font-semibold text-[var(--paper-text-title)]">
                            {title}
                        </h3>
                        <button
                            onClick={onClose}
                            className="rounded-full hover:bg-gray-100 p-1 transition-colors"
                            type="button"
                        >
                            <X size={20} className="text-gray-600" />
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
