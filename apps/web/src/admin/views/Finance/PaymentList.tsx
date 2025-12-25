import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { PlusIcon, TrashIcon, XMarkIcon } from '@heroicons/react/24/outline';
import { getAllPayments, deletePayment } from '../../../services/admin/paymentService';
import type { PaymentDTO } from '../../../types/adminTypes';
import type { PaginatedResponse } from '../../../types/clientTypes';
import ActionButton from '../../../admin/components/shared/ActionButton';
import { useAuth } from '../../../contexts/AuthProvider';

const PaymentList: React.FC = () => {
    const navigate = useNavigate();
    const { hasRole } = useAuth();
    const [payments, setPayments] = useState<PaymentDTO[]>([]);

    const [loading, setLoading] = useState(true);
    const [page, setPage] = useState(0);
    const [totalPages, setTotalPages] = useState(0);
    
    // Modal state
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [selectedPayment, setSelectedPayment] = useState<PaymentDTO | null>(null);
    const [deleting, setDeleting] = useState(false);

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

    const handleDelete = (payment: PaymentDTO) => {
        setSelectedPayment(payment);
        setShowDeleteModal(true);
    };

    const confirmDelete = async () => {
        if (!selectedPayment) return;
        
        setDeleting(true);
        try {
            await deletePayment(selectedPayment.id);
            loadPayments();
            setShowDeleteModal(false);
            setSelectedPayment(null);
        } catch (error) {
            console.error("Error deleting payment", error);
        } finally {
            setDeleting(false);
        }
    };

    const cancelDelete = () => {
        setShowDeleteModal(false);
        setSelectedPayment(null);
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
                            <th className="px-6 py-4">Cliente</th>
                            <th className="px-6 py-4">Fecha</th>
                            <th className="px-6 py-4">Ref. Factura</th>
                            <th className="px-6 py-4">Monto</th>
                            <th className="px-6 py-4">Método</th>
                            <th className="px-6 py-4 text-right">Acciones</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100 dark:divide-white/5 text-sm">
                        {loading ? (
                            <tr><td colSpan={7} className="py-8 text-center text-gray-500">Cargando...</td></tr>
                        ) : !payments || payments.length === 0 ? (
                            <tr><td colSpan={7} className="py-8 text-center text-gray-500">No hay pagos registrados</td></tr>
                        ) : (
                            payments.map((payment) => (
                                <tr key={payment.id} className="hover:bg-gray-50 dark:hover:bg-white/5 transition-colors">
                                    <td className="px-6 py-4 text-gray-500">#{payment.id}</td>
                                    <td className="px-6 py-4">
                                        {payment.invoice?.booking?.customer ? (
                                            <div>
                                                <div className="font-medium text-gray-900 dark:text-white">
                                                    {payment.invoice.booking.customer.firstName} {payment.invoice.booking.customer.lastName}
                                                </div>
                                                <div className="text-xs text-gray-500 dark:text-gray-400">
                                                    {payment.invoice.booking.customer.email}
                                                </div>
                                            </div>
                                        ) : (
                                            <span className="text-gray-400 italic text-xs">Sin cliente</span>
                                        )}
                                    </td>
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
                                            {/* Edit Button Removed: Payments are immutable ledger records */}
                                            
                                            {/* Delete allowed for ADMIN only */}
                                            {hasRole('ROLE_ADMIN') && (
                                                <ActionButton 
                                                    onClick={() => handleDelete(payment)}
                                                    icon={TrashIcon}
                                                    label="Eliminar"
                                                    variant="ghost"
                                                    className="text-red-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-500/10"
                                                />
                                            )}
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

            {/* Delete Confirmation Modal */}
            {showDeleteModal && (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-xl max-w-md w-full border border-gray-200 dark:border-gray-700">
                        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
                            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                                Confirmar eliminación
                            </h3>
                            <button
                                onClick={cancelDelete}
                                className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
                            >
                                <XMarkIcon className="w-6 h-6" />
                            </button>
                        </div>
                        
                        <div className="p-6">
                            <div className="flex items-start gap-4">
                                <div className="flex-shrink-0 w-12 h-12 bg-red-100 dark:bg-red-900/20 rounded-full flex items-center justify-center">
                                    <TrashIcon className="w-6 h-6 text-red-600 dark:text-red-400" />
                                </div>
                                <div className="flex-1">
                                    <p className="text-gray-900 dark:text-white font-medium mb-2">
                                        ¿Estás seguro de eliminar este pago?
                                    </p>
                                    {selectedPayment && (
                                        <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-3 text-sm">
                                            <div className="grid grid-cols-2 gap-2">
                                                <div>
                                                    <span className="text-gray-500 dark:text-gray-400">ID:</span>
                                                    <span className="ml-2 text-gray-900 dark:text-white font-mono">#{selectedPayment.id}</span>
                                                </div>
                                                <div>
                                                    <span className="text-gray-500 dark:text-gray-400">Monto:</span>
                                                    <span className="ml-2 text-gray-900 dark:text-white font-bold">${selectedPayment.amount}</span>
                                                </div>
                                                <div>
                                                    <span className="text-gray-500 dark:text-gray-400">Fecha:</span>
                                                    <span className="ml-2 text-gray-900 dark:text-white">
                                                        {new Date(selectedPayment.date).toLocaleDateString()}
                                                    </span>
                                                </div>
                                                <div>
                                                    <span className="text-gray-500 dark:text-gray-400">Método:</span>
                                                    <span className="ml-2 text-gray-900 dark:text-white">{selectedPayment.method}</span>
                                                </div>
                                            </div>
                                        </div>
                                    )}
                                    <p className="text-gray-500 dark:text-gray-400 text-sm mt-3">
                                        Esta acción no se puede deshacer.
                                    </p>
                                </div>
                            </div>
                        </div>
                        
                        <div className="flex justify-end gap-3 px-6 py-4 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-700/50">
                            <button
                                onClick={cancelDelete}
                                disabled={deleting}
                                className="px-4 py-2 text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50 transition-colors"
                            >
                                Cancelar
                            </button>
                            <button
                                onClick={confirmDelete}
                                disabled={deleting}
                                className="px-4 py-2 bg-red-600 hover:bg-red-700 disabled:bg-red-400 text-white rounded-lg disabled:opacity-50 transition-colors flex items-center gap-2"
                            >
                                {deleting && (
                                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                )}
                                {deleting ? 'Eliminando...' : 'Eliminar'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default PaymentList;