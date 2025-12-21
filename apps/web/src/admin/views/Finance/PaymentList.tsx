import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { PlusIcon, PencilSquareIcon, TrashIcon } from '@heroicons/react/24/outline';
import { getAllPayments, deletePayment } from '../../../services/admin/paymentService';
import type { PaymentDTO } from '../../../types/adminTypes';
import type { PaginatedResponse } from '../../../types/clientTypes';
import ActionButton from '../../../admin/components/shared/ActionButton';

const PaymentList: React.FC = () => {
    const navigate = useNavigate();
    const [payments, setPayments] = useState<PaymentDTO[]>([]);
    const [loading, setLoading] = useState(true);
    const [page, setPage] = useState(0);
    const [totalPages, setTotalPages] = useState(0);

    const loadPayments = async () => {
        setLoading(true);
        try {
            const response: PaginatedResponse<PaymentDTO> = await getAllPayments(page, 10);
            setPayments(response.data);
            setTotalPages(response.totalPages);
        } catch (error) {
            console.error("Error loading payments", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadPayments();
    }, [page]);

    const handleDelete = async (id: number) => {
        if (window.confirm('¿Estás seguro de eliminar este pago?')) {
            try {
                await deletePayment(id);
                loadPayments();
            } catch (error) {
                console.error("Error deleting payment", error);
            }
        }
    };

    return (
        <div>
            <div className="flex justify-between items-center mb-6">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Pagos</h1>
                    <p className="text-gray-500 dark:text-gray-400">Registro de transacciones</p>
                </div>
                <button
                    onClick={() => navigate('/admin/payments/new')}
                    className="flex items-center gap-2 px-4 py-2 bg-[#d4af37] text-white rounded-lg hover:bg-[#b8962d] transition-colors"
                >
                    <PlusIcon className="w-5 h-5" /> Nuevo Pago
                </button>
            </div>

            <div className="bg-white dark:bg-[#111111] rounded-xl shadow-sm border border-gray-200 dark:border-white/5 overflow-hidden">
                <table className="w-full text-left">
                    <thead className="bg-gray-50 dark:bg-white/5 text-gray-500 dark:text-gray-400 text-xs uppercase font-medium">
                        <tr>
                            <th className="px-6 py-4">ID</th>
                            <th className="px-6 py-4">Fecha</th>
                            <th className="px-6 py-4">Ref. Factura</th>
                            <th className="px-6 py-4">Monto</th>
                            <th className="px-6 py-4">Método</th>
                            <th className="px-6 py-4 text-right">Acciones</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100 dark:divide-white/5 text-sm">
                        {loading ? (
                            <tr><td colSpan={6} className="py-8 text-center text-gray-500">Cargando...</td></tr>
                        ) : !payments || payments.length === 0 ? (
                            <tr><td colSpan={6} className="py-8 text-center text-gray-500">No hay pagos registrados</td></tr>
                        ) : (
                            payments.map((payment) => (
                                <tr key={payment.id} className="hover:bg-gray-50 dark:hover:bg-white/5 transition-colors">
                                    <td className="px-6 py-4 text-gray-500">#{payment.id}</td>
                                    <td className="px-6 py-4 text-gray-900 dark:text-gray-300">
                                        {new Date(payment.date).toLocaleDateString()}
                                    </td>
                                    <td className="px-6 py-4 font-mono text-[#d4af37]">
                                        {payment.invoice?.code || String(payment.invoice?.id || '')}
                                    </td>
                                    <td className="px-6 py-4 font-bold text-gray-900 dark:text-white">
                                        ${payment.amount}
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className="inline-flex px-2 py-1 rounded bg-gray-100 dark:bg-white/10 text-xs font-medium text-gray-600 dark:text-gray-300">
                                            {payment.method}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 text-right">
                                        <div className="flex justify-end gap-2">
                                            <ActionButton 
                                                onClick={() => navigate(`/admin/payments/edit/${payment.id}`)}
                                                icon={PencilSquareIcon}
                                                label="Editar"
                                                variant="ghost"
                                            />
                                            <ActionButton 
                                                onClick={() => handleDelete(payment.id)}
                                                icon={TrashIcon}
                                                label="Eliminar"
                                                variant="ghost"
                                                className="text-red-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-500/10"
                                            />
                                        </div>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
                 {/* Pagination (Simple) */}
                <div className="px-6 py-4 border-t border-gray-200 dark:border-white/5 flex justify-end gap-2">
                    <button 
                        disabled={page === 0}
                        onClick={() => setPage(p => Math.max(0, p - 1))}
                        className="px-3 py-1 text-sm border border-gray-200 dark:border-white/10 rounded disabled:opacity-50 text-gray-600 dark:text-gray-400"
                    >
                        Anterior
                    </button>
                    <span className="text-sm py-1 text-gray-600 dark:text-gray-400">Página {page + 1} de {totalPages || 1}</span>
                    <button 
                        disabled={page >= totalPages - 1}
                        onClick={() => setPage(p => p + 1)}
                        className="px-3 py-1 text-sm border border-gray-200 dark:border-white/10 rounded disabled:opacity-50 text-gray-600 dark:text-gray-400"
                    >
                        Siguiente
                    </button>
                </div>
            </div>
        </div>
    );
};

export default PaymentList;
