import React from 'react';
import { X, Printer, Download, Building2, Phone, Globe } from 'lucide-react';
import type { InvoiceDTO } from '../../types/adminTypes';
import { useAuth } from '../../contexts/AuthProvider';

interface InvoiceDetailsModalProps {
    isOpen: boolean;
    onClose: () => void;
    invoice: InvoiceDTO | null;
}

const InvoiceDetailsModal: React.FC<InvoiceDetailsModalProps> = ({ isOpen, onClose, invoice }) => {
    const { userProfile } = useAuth();
    
    if (!isOpen || !invoice) return null;

    return (
        <div className="fixed inset-0 z-[1000] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200" onClick={onClose}>
            <div className="bg-white text-black w-full max-w-3xl rounded-lg shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200" onClick={e => e.stopPropagation()}>
                
                {/* Header Actions */}
                <div className="bg-gray-100 border-b p-4 flex justify-between items-center">
                    <h3 className="font-semibold text-gray-600">Detalle de Factura</h3>
                    <div className="flex gap-2">
                        <button className="p-2 hover:bg-gray-200 rounded-lg transition-colors text-gray-600" title="Imprimir" onClick={() => window.print()}>
                            <Printer size={18} />
                        </button>
                         <button className="p-2 hover:bg-gray-200 rounded-lg transition-colors text-gray-600" title="Descargar PDF">
                            <Download size={18} />
                        </button>
                        <button onClick={onClose} className="p-2 hover:bg-red-100 hover:text-red-600 rounded-lg transition-colors text-gray-500">
                            <X size={20} />
                        </button>
                    </div>
                </div>

                {/* Invoice Content - Printable Area */}
                <div className="p-10 md:p-16 bg-white print:p-0" id="invoice-content">
                    
                    {/* Invoice Header */}
                    <div className="flex justify-between items-start mb-12">
                        <div>
                             <h1 className="text-4xl font-bold text-[#d4af37] mb-2">GRAN HOTEL</h1>
                             <p className="text-gray-500 text-sm tracking-wide">LUXURY & RESORT</p>
                        </div>
                        <div className="text-right">
                            <h2 className="text-2xl font-bold text-gray-800 mb-1">FACTURA</h2>
                            <p className="text-gray-500 font-mono text-lg">#{invoice.code}</p>
                            <div className={`mt-2 inline-block px-3 py-1 text-xs font-bold rounded border ${invoice.status === 'PAID' ? 'bg-green-100 text-green-700 border-green-200' : 'bg-orange-100 text-orange-700 border-orange-200'}`}>
                                {invoice.status === 'PAID' ? 'PAGADA' : 'PENDIENTE'}
                            </div>
                        </div>
                    </div>

                    {/* Info Grid */}
                    <div className="flex justify-between mb-12 border-t border-b border-gray-100 py-8">
                        <div>
                            <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Emisor</h4>
                            <p className="font-bold text-gray-800">Gran Hotel León S.A.</p>
                            <div className="text-sm text-gray-500 mt-1 flex flex-col gap-0.5">
                                <span className="flex items-center gap-2"><Building2 size={12}/> Av. Central 123, León, Nicaragua</span>
                                <span className="flex items-center gap-2"><Phone size={12}/> +505 2311-0000</span>
                                <span className="flex items-center gap-2"><Globe size={12}/> www.granhotel.com.ni</span>
                            </div>
                        </div>
                        <div className="text-right">
                             <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Cliente</h4>
                             <p className="font-bold text-gray-800">{userProfile?.firstName} {userProfile?.lastName}</p>
                             <p className="text-sm text-gray-500">{userProfile?.email}</p>
                             <p className="text-sm text-gray-500 mt-4"><span className="font-medium">Fecha Emisión:</span> {new Date(invoice.issueDate).toLocaleDateString()}</p>
                             <p className="text-sm text-gray-500"><span className="font-medium">Fecha Vencimiento:</span> {new Date(invoice.dueDate).toLocaleDateString()}</p>
                        </div>
                    </div>

                    {/* Items Table */}
                    <div className="mb-0">
                        <table className="w-full text-left">
                            <thead>
                                <tr className="border-b-2 border-gray-100">
                                    <th className="py-3 text-xs font-bold text-gray-400 uppercase tracking-wider w-1/2">Descripción</th>
                                    <th className="py-3 text-xs font-bold text-gray-400 uppercase tracking-wider text-right">Cant.</th>
                                    <th className="py-3 text-xs font-bold text-gray-400 uppercase tracking-wider text-right">Precio Unit.</th>
                                    <th className="py-3 text-xs font-bold text-gray-400 uppercase tracking-wider text-right">Total</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-50">
                                {invoice.items && invoice.items.length > 0 ? invoice.items.map((item, index) => (
                                    <tr key={index}>
                                        <td className="py-4 text-gray-700 font-medium">{item.description}</td>
                                        <td className="py-4 text-right text-gray-600">{item.quantity}</td>
                                        <td className="py-4 text-right text-gray-600">${item.unitPrice.toFixed(2)}</td>
                                        <td className="py-4 text-right text-gray-800 font-bold">${item.totalPrice.toFixed(2)}</td>
                                    </tr>
                                )) : (
                                    <tr>
                                        <td colSpan={4} className="py-8 text-center text-gray-400 italic">No hay items detallados en esta factura.</td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>

                    {/* Totals */}
                    <div className="flex justify-end mt-6">
                        <div className="w-64 bg-gray-50 rounded-lg p-6">
                            <div className="flex justify-between mb-2">
                                <span className="text-sm text-gray-500">Subtotal</span>
                                <span className="text-sm font-medium text-gray-800">${(invoice.totalAmount / 1.15).toFixed(2)}</span>
                            </div>
                            <div className="flex justify-between mb-4 pb-4 border-b border-gray-200">
                                <span className="text-sm text-gray-500">Impuestos (15%)</span>
                                <span className="text-sm font-medium text-gray-800">${(invoice.totalAmount - (invoice.totalAmount / 1.15)).toFixed(2)}</span>
                            </div>
                            <div className="flex justify-between items-center">
                                <span className="text-base font-bold text-gray-800">Total</span>
                                <span className="text-xl font-bold text-[#d4af37]">${invoice.totalAmount.toFixed(2)}</span>
                            </div>
                        </div>
                    </div>
                    
                    {/* Footer */}
                    <div className="mt-16 pt-8 border-t border-gray-100 text-center text-gray-400 text-xs">
                        <p>Gracias por su preferencia.</p>
                        <p>Si tiene preguntas sobre esta factura, por favor contáctenos a billing@granhotel.com</p>
                    </div>

                </div>
            </div>
            
            <style>
                {`
                    @media print {
                        body * {
                            visibility: hidden;
                        }
                        #invoice-content, #invoice-content * {
                            visibility: visible;
                        }
                        #invoice-content {
                            position: absolute;
                            left: 0;
                            top: 0;
                            width: 100%;
                            padding: 20px;
                        }
                    }
                `}
            </style>
        </div>
    );
};

export default InvoiceDetailsModal;
