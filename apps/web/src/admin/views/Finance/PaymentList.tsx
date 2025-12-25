import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { PlusIcon, TrashIcon, XMarkIcon, MagnifyingGlassIcon } from '@heroicons/react/24/outline';
import { getAllPayments, deletePayment } from '../../../services/admin/paymentService';
import type { PaymentDTO } from '../../../types/adminTypes';
import type { PaginatedResponse } from '../../../types/clientTypes';
import ActionButton from '../../../admin/components/shared/ActionButton';
import { useAuth } from '../../../contexts/AuthProvider';

const methodLabels: Record<string, string> = {
    'CASH': 'Efectivo',
    'CREDIT_CARD': 'Tarjeta',
    'PAYPAL': 'PayPal',
    'TRANSFER': 'Transferencia',
};

const PaymentList: React.FC = () => {
    const navigate = useNavigate();
    const { hasRole } = useAuth();
    const [payments, setPayments] = useState<PaymentDTO[]>([]);
    const [loading, setLoading] = useState(true);
    const [page, setPage] = useState(0);
    const [totalPages, setTotalPages] = useState(0);
    
    // Search state
    const [searchQuery, setSearchQuery] = useState('');
    const [debouncedSearch, setDebouncedSearch] = useState('');
    
    // Modal state
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [selectedPayment, setSelectedPayment] = useState<PaymentDTO | null>(null);
    const [deleting, setDeleting] = useState(false);

    // Debounce search input
    useEffect(() => {
        const timer = setTimeout(() => {
            setDebouncedSearch(searchQuery);
        }, 300);
        return () => clearTimeout(timer);
    }, [searchQuery]);

    // Load data when page or search changes
    useEffect(() => {
        loadPayments();
    }, [page, debouncedSearch]);

    const loadPayments = async () => {
        setLoading(true);
        try {
            const response: PaginatedResponse<PaymentDTO> = await getAllPayments(
                page, 
                100, // Fetch more for client-side filtering
                'id,desc'
            );
            setPayments(response.data);
            setTotalPages(response.totalPages);
        } catch (error) {
            console.error("Error loading payments", error);
        } finally {
            setLoading(false);
        }
    };

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

    const handleSearchChange = (value: string) => {
        setSearchQuery(value);
        setPage(0);
    };

    const clearSearch = () => {
        setSearchQuery('');
        setPage(0);
    };

    // Filter payments by search query (client-side)
    const filteredPayments = debouncedSearch
        ? payments.filter(p => {
            const search = debouncedSearch.toLowerCase();
            const customer = p.invoice?.booking?.customer;
            if (!customer) return false;
            const fullName = `${customer.firstName || ''} ${customer.lastName || ''}`.toLowerCase();
            const email = (customer.email || '').toLowerCase();
            return fullName.includes(search) || email.includes(search);
        })
        : payments;

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
                {/* Search Bar */}
                <div className="p-4 border-b border-gray-200 dark:border-white/5">
                    <div className="relative w-full md:w-80">
                        <MagnifyingGlassIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                        <input
                            type="text"
                            placeholder="Buscar por nombre o email del cliente..."
                            value={searchQuery}
                            onChange={(e) => handleSearchChange(e.target.value)}
                            className="w-full pl-10 pr-10 py-2 rounded-lg border border-gray-300 dark:border-white/10 bg-white dark:bg-black/20 text-gray-900 dark:text-white placeholder-gray-400 focus:ring-2 focus:ring-[#d4af37] focus:border-transparent outline-none transition-all"
                        />
                        {searchQuery && (
                            <button
                                onClick={clearSearch}
                                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
                            >
                                <XMarkIcon className="w-4 h-4" />
                            </button>
                        )}
                    </div>
                </div>

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
                        ) : !filteredPayments || filteredPayments.length === 0 ? (
                            <tr><td colSpan={7} className="py-8 text-center text-gray-500">No hay pagos registrados</td></tr>
                        ) : (
                            filteredPayments.map((payment) => (
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
                                        <span className={`inline-flex px-2 py-1 rounded text-xs font-medium ${
                                            payment.method === 'CREDIT_CARD' 
                                                ? 'bg-blue-100 dark:bg-blue-500/10 text-blue-700 dark:text-blue-400'
                                                : payment.method === 'PAYPAL'
                                                    ? 'bg-indigo-100 dark:bg-indigo-500/10 text-indigo-700 dark:text-indigo-400'
                                                    : payment.method === 'TRANSFER'
                                                        ? 'bg-purple-100 dark:bg-purple-500/10 text-purple-700 dark:text-purple-400'
                                                        : 'bg-green-100 dark:bg-green-500/10 text-green-700 dark:text-green-400'
                                        }`}>
                                            {methodLabels[payment.method] || payment.method}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 text-right">
                                        <div className="flex justify-end gap-2">
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

                {/* Pagination */}
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
                                                    <span className="ml-2 text-gray-900 dark:text-white">{methodLabels[selectedPayment.method] || selectedPayment.method}</span>
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