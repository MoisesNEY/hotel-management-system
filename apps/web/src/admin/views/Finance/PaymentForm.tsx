import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeftIcon, MagnifyingGlassIcon, XMarkIcon, DocumentTextIcon } from '@heroicons/react/24/outline';
import { createPayment, getPaymentById, updatePayment } from '../../../services/admin/paymentService';
import { getAllInvoices, getInvoiceById } from '../../../services/admin/invoiceService';
import type { PaymentDTO, PaymentMethod, InvoiceDTO } from '../../../types/adminTypes';

const PaymentForm: React.FC = () => {
    const navigate = useNavigate();
    const { id } = useParams();
    const isEditMode = !!id;
    const [loading, setLoading] = useState(false);
    
    // Invoice selector state
    const [invoices, setInvoices] = useState<InvoiceDTO[]>([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [showDropdown, setShowDropdown] = useState(false);
    const [selectedInvoice, setSelectedInvoice] = useState<InvoiceDTO | null>(null);
    const dropdownRef = useRef<HTMLDivElement>(null);
    
    const [formData, setFormData] = useState<Partial<PaymentDTO> & { invoiceId?: number }>({
        date: new Date().toISOString(),
        amount: 0,
        method: 'CASH',
        invoiceId: 0,
        referenceId: ''
    });

    useEffect(() => {
        // Fetch all invoices for selector (only ISSUED ones that can be paid)
        getAllInvoices(0, 500).then(res => {
            // Filter to only show ISSUED invoices (not PAID or CANCELLED)
            const payableInvoices = res.data.filter(inv => inv.status === 'ISSUED' || inv.status === 'PENDING');
            setInvoices(payableInvoices);
        }).catch(console.error);
        
        if (isEditMode) {
            setLoading(true);
            getPaymentById(Number(id))
                .then(data => {
                    const params: any = { ...data };
                    if (data.invoice) {
                        params.invoiceId = data.invoice.id;
                        // Load the associated invoice
                        getInvoiceById(data.invoice.id).then(setSelectedInvoice).catch(console.error);
                    }
                    setFormData(params);
                })
                .catch(err => console.error(err))
                .finally(() => setLoading(false));
        }
    }, [id, isEditMode]);

    // Click outside handler to close dropdown
    useEffect(() => {
        const handleClickOutside = (e: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
                setShowDropdown(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const handleSelectInvoice = (invoice: InvoiceDTO) => {
        setSelectedInvoice(invoice);
        setFormData(prev => ({ 
            ...prev, 
            invoiceId: invoice.id,
            amount: invoice.totalAmount // Auto-set amount from invoice
        }));
        setShowDropdown(false);
        setSearchQuery('');
    };

    const handleClearInvoice = () => {
        setSelectedInvoice(null);
        setFormData(prev => ({ ...prev, invoiceId: 0, amount: 0 }));
        setSearchQuery('');
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        
        if (!selectedInvoice) {
            alert('Debes seleccionar una factura');
            return;
        }
        
        setLoading(true);
        try {
            const payload = {
                ...formData,
                invoice: { id: formData.invoiceId }
            };
            delete (payload as any).invoiceId;

            if (isEditMode) {
                await updatePayment(Number(id), payload as unknown as PaymentDTO);
            } else {
                await createPayment(payload as unknown as PaymentDTO);
            }
            navigate('/admin/payments');
        } catch (error) {
            console.error("Error saving payment", error);
            alert("Error al guardar el pago");
        } finally {
            setLoading(false);
        }
    };

    // Filter invoices by code or booking customer name
    const filteredInvoices = invoices.filter(inv => {
        const code = inv.code?.toLowerCase() || '';
        const customerName = inv.booking 
            ? `${inv.booking.customer?.firstName} ${inv.booking.customer?.lastName}`.toLowerCase()
            : '';
        const query = searchQuery.toLowerCase();
        return code.includes(query) || customerName.includes(query);
    }).slice(0, 10);

    return (
        <div className="max-w-2xl mx-auto">
             <div className="flex items-center gap-4 mb-6">
                <button 
                    onClick={() => navigate('/admin/payments')}
                    className="p-2 hover:bg-gray-100 dark:hover:bg-white/5 rounded-full transition-colors"
                >
                    <ArrowLeftIcon className="w-5 h-5 text-gray-500" />
                </button>
                <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                    {isEditMode ? 'Editar Pago' : 'Registrar Pago'}
                </h1>
            </div>

            <form onSubmit={handleSubmit} className="bg-white dark:bg-[#111111] p-8 rounded-xl border border-gray-200 dark:border-white/5 shadow-sm space-y-6">
                
                {/* Invoice Selector */}
                <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Factura a Pagar</label>
                    
                    {selectedInvoice ? (
                        // Selected invoice display
                        <div className="flex items-center justify-between p-4 bg-gradient-to-r from-[#d4af37]/10 to-transparent border border-[#d4af37]/30 rounded-lg">
                            <div className="flex items-center gap-4">
                                <div className="w-12 h-12 bg-[#d4af37]/20 rounded-full flex items-center justify-center">
                                    <DocumentTextIcon className="w-6 h-6 text-[#d4af37]" />
                                </div>
                                <div>
                                    <p className="font-semibold text-gray-900 dark:text-white">
                                        Factura #{selectedInvoice.code}
                                    </p>
                                    <p className="text-sm text-gray-500 dark:text-gray-400">
                                        {selectedInvoice.booking?.customer 
                                            ? `${selectedInvoice.booking.customer.firstName} ${selectedInvoice.booking.customer.lastName}`
                                            : 'Sin cliente asociado'
                                        }
                                        {' '} • Total: <span className="font-mono font-medium text-green-600 dark:text-green-400">${selectedInvoice.totalAmount?.toFixed(2)}</span>
                                    </p>
                                </div>
                            </div>
                            {!isEditMode && (
                                <button
                                    type="button"
                                    onClick={handleClearInvoice}
                                    className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-full transition-colors"
                                >
                                    <XMarkIcon className="w-5 h-5" />
                                </button>
                            )}
                        </div>
                    ) : (
                        // Searchable dropdown
                        <div className="relative" ref={dropdownRef}>
                            <div className="relative">
                                <MagnifyingGlassIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                                <input
                                    type="text"
                                    placeholder="Buscar factura por código o cliente..."
                                    className="w-full pl-10 pr-4 py-3 rounded-lg border border-gray-300 dark:border-white/10 bg-white dark:bg-black/20 focus:ring-2 focus:ring-[#d4af37] focus:border-transparent outline-none transition-all"
                                    value={searchQuery}
                                    onChange={e => {
                                        setSearchQuery(e.target.value);
                                        setShowDropdown(true);
                                    }}
                                    onFocus={() => setShowDropdown(true)}
                                />
                            </div>
                            
                            {showDropdown && (
                                <div className="absolute z-50 w-full mt-2 bg-white dark:bg-[#1a1a1a] border border-gray-200 dark:border-white/10 rounded-lg shadow-xl max-h-64 overflow-y-auto">
                                    {filteredInvoices.length > 0 ? (
                                        filteredInvoices.map(invoice => (
                                            <button
                                                key={invoice.id}
                                                type="button"
                                                onClick={() => handleSelectInvoice(invoice)}
                                                className="w-full px-4 py-3 text-left hover:bg-gray-50 dark:hover:bg-white/5 border-b border-gray-100 dark:border-white/5 last:border-0 transition-colors"
                                            >
                                                <div className="flex justify-between items-center">
                                                    <div>
                                                        <p className="font-medium text-gray-900 dark:text-white">
                                                            #{invoice.code}
                                                        </p>
                                                        <p className="text-sm text-gray-500 dark:text-gray-400">
                                                            {invoice.booking?.customer 
                                                                ? `${invoice.booking.customer.firstName} ${invoice.booking.customer.lastName}`
                                                                : 'Sin cliente'
                                                            }
                                                        </p>
                                                    </div>
                                                    <div className="text-right">
                                                        <span className="font-mono font-semibold text-green-600 dark:text-green-400">
                                                            ${invoice.totalAmount?.toFixed(2)}
                                                        </span>
                                                        <span className={`block text-xs mt-1 px-2 py-0.5 rounded-full ${
                                                            invoice.status === 'ISSUED' 
                                                                ? 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400'
                                                                : 'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400'
                                                        }`}>
                                                            {invoice.status}
                                                        </span>
                                                    </div>
                                                </div>
                                            </button>
                                        ))
                                    ) : (
                                        <p className="px-4 py-3 text-gray-500 text-center">
                                            {invoices.length === 0 
                                                ? 'No hay facturas pendientes de pago'
                                                : 'No se encontraron facturas'
                                            }
                                        </p>
                                    )}
                                </div>
                            )}
                        </div>
                    )}
                </div>

                {/* Amount & Date */}
                <div className="grid grid-cols-2 gap-6">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Monto</label>
                        <div className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-white/10 bg-gray-100 dark:bg-white/5 text-gray-700 dark:text-gray-300 font-mono text-lg">
                            ${formData.amount?.toFixed(2) || '0.00'}
                        </div>
                        <p className="text-xs text-gray-500 mt-1">Monto total de la factura seleccionada</p>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Fecha</label>
                        <input 
                            type="datetime-local"
                            className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-white/10 bg-white dark:bg-black/20 focus:ring-2 focus:ring-[#d4af37] focus:border-transparent outline-none transition-all"
                            value={formData.date ? formData.date.substring(0, 16) : ''}
                            onChange={e => setFormData({...formData, date: new Date(e.target.value).toISOString()})}
                            required
                        />
                    </div>
                </div>

                {/* Method & Ref */}
                <div className="grid grid-cols-2 gap-6">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Método de Pago</label>
                        <select 
                            className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-white/10 bg-white dark:bg-[#1a1a1a] text-gray-900 dark:text-white focus:ring-2 focus:ring-[#d4af37] focus:border-transparent outline-none transition-all"
                            value={formData.method}
                            onChange={e => setFormData({...formData, method: e.target.value as PaymentMethod})}
                        >
                            <option value="CASH" className="bg-white dark:bg-[#1a1a1a] text-gray-900 dark:text-white">Efectivo</option>
                            <option value="CREDIT_CARD" className="bg-white dark:bg-[#1a1a1a] text-gray-900 dark:text-white">Tarjeta de Crédito</option>
                            <option value="TRANSFER" className="bg-white dark:bg-[#1a1a1a] text-gray-900 dark:text-white">Transferencia</option>
                            <option value="PAYPAL" className="bg-white dark:bg-[#1a1a1a] text-gray-900 dark:text-white">PayPal</option>
                        </select>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Referencia Externa</label>
                         <input 
                            type="text"
                            className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-white/10 bg-white dark:bg-black/20 focus:ring-2 focus:ring-[#d4af37] focus:border-transparent outline-none transition-all"
                            value={formData.referenceId || ''}
                            onChange={e => setFormData({...formData, referenceId: e.target.value})}
                            placeholder="Opcional (Ej: Ref. Banco)"
                        />
                    </div>
                </div>

                <div className="pt-6 flex justify-end gap-3 border-t border-gray-200 dark:border-white/5">
                    <button
                        type="button"
                        onClick={() => navigate('/admin/payments')}
                        className="px-6 py-2 border border-gray-300 dark:border-white/10 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-white/5 transition-colors"
                    >
                        Cancelar
                    </button>
                    <button
                        type="submit"
                        disabled={loading || !selectedInvoice}
                        className="px-6 py-2 bg-[#d4af37] text-white rounded-lg hover:bg-[#b8962d] transition-colors font-medium disabled:opacity-50"
                    >
                        {loading ? 'Guardando...' : 'Guardar Pago'}
                    </button>
                </div>
            </form>
        </div>
    );
};

export default PaymentForm;
