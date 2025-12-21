import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeftIcon } from '@heroicons/react/24/outline';
import { createPayment, getPaymentById, updatePayment } from '../../../services/admin/paymentService';
import type { PaymentDTO, PaymentMethod } from '../../../types/adminTypes';

const PaymentForm: React.FC = () => {
    const navigate = useNavigate();
    const { id } = useParams();
    const isEditMode = !!id;
    const [loading, setLoading] = useState(false);
    
    const [formData, setFormData] = useState<Partial<PaymentDTO> & { invoiceId?: number }>({
        date: new Date().toISOString(),
        amount: 0,
        method: 'CASH',
        invoiceId: 0,
        referenceId: ''
    });

    useEffect(() => {
        if (isEditMode) {
            setLoading(true);
            getPaymentById(Number(id))
                .then(data => {
                    const params: any = { ...data };
                    // Flatten for form
                    if (data.invoice) {
                        params.invoiceId = data.invoice.id;
                    }
                    setFormData(params);
                })
                .catch(err => console.error(err))
                .finally(() => setLoading(false));
        }
    }, [id, isEditMode]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        try {
            // Re-construct DTO for backend
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
                
                {/* Invoice Reference */}
                <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">ID Factura</label>
                    <input 
                        type="number"
                        className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-white/10 bg-white dark:bg-black/20 focus:ring-2 focus:ring-[#d4af37] focus:border-transparent outline-none transition-all"
                        value={formData.invoiceId || ''}
                        onChange={e => setFormData({...formData, invoiceId: Number(e.target.value)})}
                        required
                        placeholder="Ej: 15"
                    />
                    <p className="text-xs text-gray-500 mt-1">Ingresa el ID numérico de la factura a pagar.</p>
                </div>

                {/* Amount & Date */}
                <div className="grid grid-cols-2 gap-6">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Monto</label>
                        <input 
                            type="number"
                            step="0.01"
                            className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-white/10 bg-white dark:bg-black/20 focus:ring-2 focus:ring-[#d4af37] focus:border-transparent outline-none transition-all"
                            value={formData.amount}
                            onChange={e => setFormData({...formData, amount: Number(e.target.value)})}
                            required
                        />
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
                            className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-white/10 bg-white dark:bg-black/20 focus:ring-2 focus:ring-[#d4af37] focus:border-transparent outline-none transition-all"
                            value={formData.method}
                            onChange={e => setFormData({...formData, method: e.target.value as PaymentMethod})}
                        >
                            <option value="CASH">Efectivo</option>
                            <option value="CREDIT_CARD">Tarjeta de Crédito</option>
                            <option value="TRANSFER">Transferencia</option>
                            <option value="PAYPAL">PayPal</option>
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
                        disabled={loading}
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
