import React from 'react';
import { CheckCircle2, X, Download } from 'lucide-react';

interface PaymentSuccessModalProps {
    isOpen: boolean;
    onClose: () => void;
    paymentData: {
        amount: number;
        transactionId: string;
        invoiceId: number;
        date: string;
    } | null;
}

const PaymentSuccessModal: React.FC<PaymentSuccessModalProps> = ({ isOpen, onClose, paymentData }) => {
    if (!isOpen || !paymentData) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="bg-[#1a1a1a] border border-[#d4af37]/30 rounded-2xl w-full max-w-md p-8 relative shadow-2xl shadow-[#d4af37]/10 transform transition-all scale-100">
                
                {/* Close Button */}
                <button 
                    onClick={onClose}
                    className="absolute top-4 right-4 text-gray-400 hover:text-white transition-colors"
                >
                    <X size={24} />
                </button>

                <div className="flex flex-col items-center text-center">
                    
                    {/* Animated Icon */}
                    <div className="w-20 h-20 bg-[#d4af37]/10 rounded-full flex items-center justify-center mb-6 animate-bounce-slow">
                        <CheckCircle2 size={40} className="text-[#d4af37]" />
                    </div>

                    <h2 className="text-2xl font-light text-white mb-2">¡Pago Exitoso!</h2>
                    <p className="text-gray-400 mb-8 text-sm">
                        Su transacción se ha completado correctamente.
                    </p>

                    {/* Receipt Card */}
                    <div className="w-full bg-white/5 rounded-xl p-6 border border-white/5 mb-8">
                        <div className="flex justify-between items-center mb-4 pb-4 border-b border-white/5">
                            <span className="text-gray-400 text-sm">Monto Total</span>
                            <span className="text-2xl font-bold text-[#d4af37]">
                                ${paymentData.amount.toFixed(2)}
                            </span>
                        </div>
                        
                        <div className="space-y-3">
                             <div className="flex justify-between text-sm">
                                 <span className="text-gray-500">ID de Transacción</span>
                                 <span className="text-white font-mono">{paymentData.transactionId}</span>
                            </div>
                            <div className="flex justify-between text-sm">
                                <span className="text-gray-500">Factura #</span>
                                <span className="text-white">INT-{paymentData.invoiceId}</span>
                            </div>
                            <div className="flex justify-between text-sm">
                                <span className="text-gray-500">Fecha</span>
                                <span className="text-white">{new Date(paymentData.date).toLocaleDateString()}</span>
                            </div>
                        </div>
                    </div>

                    {/* Actions */}
                    <button 
                        onClick={onClose}
                        className="w-full py-3.5 bg-[#d4af37] text-black font-bold rounded-xl hover:bg-[#b8962d] transition-all flex items-center justify-center gap-2 mb-3"
                    >
                        Continuar
                    </button>
                    
                    <button className="w-full py-3.5 bg-transparent border border-white/10 text-white font-medium rounded-xl hover:bg-white/5 transition-all flex items-center justify-center gap-2 text-sm">
                       <Download size={16} /> Descargar Recibo (PDF)
                    </button>

                </div>
            </div>
        </div>
    );
};

export default PaymentSuccessModal;
