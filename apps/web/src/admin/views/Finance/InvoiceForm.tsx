import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeftIcon, PlusIcon, TrashIcon } from '@heroicons/react/24/outline';
import { createInvoice, getInvoiceById, updateInvoice } from '../../../services/admin/invoiceService';
import type { InvoiceDTO, InvoiceItemDTO } from '../../../types/adminTypes';

const InvoiceForm: React.FC = () => {
    const navigate = useNavigate();
    const { id } = useParams();
    const isEditMode = !!id;

    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState<Partial<InvoiceDTO>>({
        code: '',
        issuedDate: new Date().toISOString(),
        dueDate: '',
        status: 'PENDING',
        items: [],
        totalAmount: 0 // Will generally be calculated
    });

    useEffect(() => {
        if (isEditMode) {
            setLoading(true);
            getInvoiceById(Number(id))
                .then(data => setFormData(data))
                .catch(err => console.error(err))
                .finally(() => setLoading(false));
        }
    }, [id, isEditMode]);

    // Recalculate total when items change
    useEffect(() => {
        const total = formData.items?.reduce((sum, item) => sum + item.totalPrice, 0) || 0;
        setFormData(prev => ({ ...prev, totalAmount: total }));
    }, [formData.items]);

    const handleItemChange = (index: number, field: keyof InvoiceItemDTO, value: any) => {
        const newItems = [...(formData.items || [])];
        newItems[index] = { ...newItems[index], [field]: value };
        
        // Auto-calc item total if price/qty changes
        if (field === 'quantity' || field === 'unitPrice') {
            const qty = Number(newItems[index].quantity) || 0;
            const price = Number(newItems[index].unitPrice) || 0;
            newItems[index].totalPrice = qty * price;
        }

        setFormData({ ...formData, items: newItems });
    };

    const addItem = () => {
        setFormData({
            ...formData,
            items: [...(formData.items || []), { id: 0, description: '', quantity: 1, unitPrice: 0, totalPrice: 0 } as InvoiceItemDTO]
        });
    };

    const removeItem = (index: number) => {
        const newItems = [...(formData.items || [])];
        newItems.splice(index, 1);
        setFormData({ ...formData, items: newItems });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        try {
            if (isEditMode) {
                await updateInvoice(Number(id), formData);
            } else {
                await createInvoice(formData);
            }
            navigate('/admin/invoices');
        } catch (error) {
            console.error("Error saving invoice", error);
            alert("Error al guardar la factura");
        } finally {
            setLoading(false);
        }
    };

    if (loading && isEditMode && !formData.id) return <div>Cargando...</div>;

    return (
        <div className="max-w-4xl mx-auto">
            <div className="flex items-center gap-4 mb-6">
                <button 
                    onClick={() => navigate('/admin/invoices')}
                    className="p-2 hover:bg-gray-100 dark:hover:bg-white/5 rounded-full transition-colors"
                >
                    <ArrowLeftIcon className="w-5 h-5 text-gray-500" />
                </button>
                <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                    {isEditMode ? 'Editar Factura' : 'Nueva Factura'}
                </h1>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
                {/* Header Info */}
                <div className="bg-white dark:bg-[#111111] p-6 rounded-xl border border-gray-200 dark:border-white/5 shadow-sm space-y-4">
                    <h2 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Información General</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Código</label>
                            <input 
                                type="text"
                                className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-white/10 bg-white dark:bg-black/20 focus:ring-2 focus:ring-[#d4af37] focus:border-transparent outline-none transition-all"
                                value={formData.code || ''}
                                onChange={e => setFormData({...formData, code: e.target.value})}
                                required
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Estado</label>
                            <select 
                                className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-white/10 bg-white dark:bg-black/20 focus:ring-2 focus:ring-[#d4af37] focus:border-transparent outline-none transition-all"
                                value={formData.status}
                                onChange={e => setFormData({...formData, status: e.target.value as any})}
                            >
                                <option value="PENDING">Pendiente</option>
                                <option value="ISSUED">Emitida</option>
                                <option value="PAID">Pagada</option>
                                <option value="CANCELLED">Cancelada</option>
                            </select>
                        </div>
                         <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Fecha Emisión</label>
                            <input 
                                type="datetime-local"
                                className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-white/10 bg-white dark:bg-black/20 focus:ring-2 focus:ring-[#d4af37] focus:border-transparent outline-none transition-all"
                                value={formData.issuedDate ? formData.issuedDate.substring(0, 16) : ''}
                                onChange={e => setFormData({...formData, issuedDate: new Date(e.target.value).toISOString()})}
                                required
                            />
                        </div>
                         <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Fecha Vencimiento</label>
                            <input 
                                type="datetime-local"
                                className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-white/10 bg-white dark:bg-black/20 focus:ring-2 focus:ring-[#d4af37] focus:border-transparent outline-none transition-all"
                                value={formData.dueDate ? formData.dueDate.substring(0, 16) : ''}
                                onChange={e => setFormData({...formData, dueDate: new Date(e.target.value).toISOString()})}
                            />
                        </div>
                    </div>
                </div>

                {/* Items */}
                <div className="bg-white dark:bg-[#111111] p-6 rounded-xl border border-gray-200 dark:border-white/5 shadow-sm">
                    <div className="flex justify-between items-center mb-4">
                        <h2 className="text-lg font-medium text-gray-900 dark:text-white">Items de Factura</h2>
                        <button 
                            type="button"
                            onClick={addItem}
                            className="text-sm flex items-center gap-1 text-[#d4af37] hover:text-[#b8962d] font-medium"
                        >
                            <PlusIcon className="w-4 h-4" /> Agregar Item
                        </button>
                    </div>

                    <div className="space-y-4">
                        {formData.items && formData.items.length > 0 ? (
                            formData.items.map((item, idx) => (
                                <div key={idx} className="flex gap-4 items-end bg-gray-50 dark:bg-white/5 p-4 rounded-lg animate-in fade-in slide-in-from-top-2">
                                    <div className="flex-grow">
                                        <label className="block text-xs font-medium text-gray-500 mb-1">Descripción</label>
                                        <input 
                                            type="text"
                                            className="w-full px-3 py-1.5 rounded border border-gray-300 dark:border-white/10 bg-white dark:bg-black/20 outline-none focus:border-[#d4af37]"
                                            value={item.description}
                                            onChange={e => handleItemChange(idx, 'description', e.target.value)}
                                            placeholder="Descripción del servicio"
                                        />
                                    </div>
                                    <div className="w-24">
                                        <label className="block text-xs font-medium text-gray-500 mb-1">Cant.</label>
                                        <input 
                                            type="number"
                                            min="1"
                                            className="w-full px-3 py-1.5 rounded border border-gray-300 dark:border-white/10 bg-white dark:bg-black/20 outline-none focus:border-[#d4af37]"
                                            value={item.quantity}
                                            onChange={e => handleItemChange(idx, 'quantity', e.target.value)}
                                        />
                                    </div>
                                    <div className="w-32">
                                        <label className="block text-xs font-medium text-gray-500 mb-1">Precio Unit.</label>
                                        <input 
                                            type="number"
                                            min="0"
                                            step="0.01"
                                            className="w-full px-3 py-1.5 rounded border border-gray-300 dark:border-white/10 bg-white dark:bg-black/20 outline-none focus:border-[#d4af37]"
                                            value={item.unitPrice}
                                            onChange={e => handleItemChange(idx, 'unitPrice', e.target.value)}
                                        />
                                    </div>
                                    <div className="w-32">
                                        <label className="block text-xs font-medium text-gray-500 mb-1">Total</label>
                                        <div className="px-3 py-1.5 bg-gray-100 dark:bg-white/10 rounded border border-transparent text-gray-700 dark:text-gray-300 font-mono text-right">
                                            ${item.totalPrice.toFixed(2)}
                                        </div>
                                    </div>
                                    <button 
                                        type="button"
                                        onClick={() => removeItem(idx)}
                                        className="p-2 text-red-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 rounded transition-colors"
                                    >
                                        <TrashIcon className="w-5 h-5" />
                                    </button>
                                </div>
                            ))
                        ) : (
                            <p className="text-center text-gray-500 py-4 italic">No hay items agregados.</p>
                        )}
                    </div>

                    <div className="mt-6 flex justify-end items-center gap-4 pt-4 border-t border-gray-200 dark:border-white/5">
                        <span className="text-gray-500 font-medium">Total Factura:</span>
                        <span className="text-3xl font-bold text-gray-900 dark:text-white">${formData.totalAmount?.toFixed(2)}</span>
                    </div>
                </div>

                <div className="flex justify-end gap-3 pt-4">
                    <button
                        type="button"
                        onClick={() => navigate('/admin/invoices')}
                        className="px-6 py-2 border border-gray-300 dark:border-white/10 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-white/5 transition-colors"
                    >
                        Cancelar
                    </button>
                    <button
                        type="submit"
                        disabled={loading}
                        className="px-6 py-2 bg-[#d4af37] text-white rounded-lg hover:bg-[#b8962d] transition-colors font-medium disabled:opacity-50"
                    >
                        {loading ? 'Guardando...' : 'Guardar Factura'}
                    </button>
                </div>
            </form>
        </div>
    );
};

export default InvoiceForm;
