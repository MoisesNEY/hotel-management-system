import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { PlusIcon, PencilSquareIcon, TrashIcon, ExclamationTriangleIcon, MagnifyingGlassIcon, XMarkIcon } from '@heroicons/react/24/outline';
import { getAllInvoices, deleteInvoice, cancelInvoice } from '../../../services/admin/invoiceService';
import type { InvoiceDTO } from '../../../types/adminTypes';
import type { PaginatedResponse } from '../../../types/clientTypes';
import ActionButton from '../../../admin/components/shared/ActionButton';

const statusLabels: Record<string, string> = {
    'ALL': 'Todas',
    'DRAFT': 'Borrador',
    'ISSUED': 'Emitida',
    'PAID': 'Pagada',
    'CANCELLED': 'Cancelada',
};

const InvoiceList: React.FC = () => {
    const navigate = useNavigate();
    const [invoices, setInvoices] = useState<InvoiceDTO[]>([]);
    const [loading, setLoading] = useState(true);
    const [page, setPage] = useState(0);
    const [totalPages, setTotalPages] = useState(0);
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [showSuccessModal, setShowSuccessModal] = useState(false);
    const [invoiceToDelete, setInvoiceToDelete] = useState<number | null>(null);
    const [permissionError, setPermissionError] = useState(false);

    // Search and filter state
    const [searchQuery, setSearchQuery] = useState('');
    const [debouncedSearch, setDebouncedSearch] = useState('');
    const [statusFilter, setStatusFilter] = useState('ALL');

    // Debounce search input
    useEffect(() => {
        const timer = setTimeout(() => {
            setDebouncedSearch(searchQuery);
        }, 300);
        return () => clearTimeout(timer);
    }, [searchQuery]);

    // Load data when page, search or filter changes
    useEffect(() => {
        loadInvoices();
    }, [page, debouncedSearch, statusFilter]);

    const loadInvoices = async () => {
        setLoading(true);
        try {
            const response: PaginatedResponse<InvoiceDTO> = await getAllInvoices(
                page, 
                100, // Fetch more for client-side filtering
                'id,desc',
                statusFilter !== 'ALL' ? statusFilter : undefined
            );
            setInvoices(response.data);
            setTotalPages(response.totalPages);
        } catch (error: any) {
            console.error("Error loading invoices", error);
            if (error.response?.status === 403) {
                setPermissionError(true);
            }
        } finally {
            setLoading(false);
        }
    };

    const handleDeleteClick = (id: number) => {
        setInvoiceToDelete(id);
        setShowDeleteModal(true);
    };

    const confirmDelete = async () => {
        if (invoiceToDelete) {
            try {
                await deleteInvoice(invoiceToDelete);
                setShowDeleteModal(false);
                setShowSuccessModal(true);
                loadInvoices();
            } catch (error) {
                console.error("Error deleting invoice", error);
            }
        }
    };

    const handleCancelClick = async (id: number) => {
        if (window.confirm("¿Seguro que deseas cancelar esta factura emitida?")) {
            try {
                await cancelInvoice(id);
                loadInvoices();
            } catch (error) {
                 console.error("Error cancelling invoice", error);
                 alert("No se pudo cancelar la factura. Verifique reglas de negocio.");
            }
        }
    };

    const closeModals = () => {
        setShowDeleteModal(false);
        setShowSuccessModal(false);
        setInvoiceToDelete(null);
    };

    const handleSearchChange = (value: string) => {
        setSearchQuery(value);
        setPage(0);
    };

    const handleStatusFilterChange = (status: string) => {
        setStatusFilter(status);
        setPage(0);
    };

    // Filter invoices by search query (client-side)
    const filteredInvoices = debouncedSearch
        ? invoices.filter(inv => {
            const search = debouncedSearch.toLowerCase();
            const customer = inv.booking?.customer;
            if (!customer) return false;
            const fullName = `${customer.firstName || ''} ${customer.lastName || ''}`.toLowerCase();
            const email = (customer.email || '').toLowerCase();
            return fullName.includes(search) || email.includes(search);
        })
        : invoices;

    const clearSearch = () => {
        setSearchQuery('');
        setPage(0);
    };

    return (
        <div>
            <div className="flex justify-between items-center mb-6">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Facturas</h1>
                    <p className="text-gray-500 dark:text-gray-400">Gestión de facturación y cobros</p>
                </div>
                <button
                    onClick={() => navigate('/admin/invoices/new')}
                    className="flex items-center gap-2 px-4 py-2 bg-[#d4af37] text-white rounded-lg hover:bg-[#b8962d] transition-colors"
                >
                    <PlusIcon className="w-5 h-5" /> Nueva Factura
                </button>
            </div>

            {permissionError ? (
                <div className="bg-white dark:bg-[#111111] rounded-xl shadow-sm border border-red-200 dark:border-red-900/20 p-12 text-center flex flex-col items-center justify-center space-y-4">
                    <div className="w-16 h-16 bg-red-100 dark:bg-red-900/20 text-red-600 dark:text-red-400 rounded-full flex items-center justify-center">
                        <ExclamationTriangleIcon className="w-8 h-8" />
                    </div>
                    <h2 className="text-xl font-bold text-gray-900 dark:text-white">Acceso Denegado (403)</h2>
                    <p className="max-w-md text-gray-500 dark:text-gray-400">
                        El servidor ha rechazado el acceso a la lista de facturas para tu rol actual.
                    </p>
                    <button
                        onClick={loadInvoices}
                        className="px-4 py-2 bg-gray-100 dark:bg-white/5 hover:bg-gray-200 dark:hover:bg-white/10 text-gray-700 dark:text-gray-300 font-medium rounded-lg transition-colors"
                    >
                        Reintentar
                    </button>
                </div>
            ) : (
                <div className="bg-white dark:bg-[#111111] rounded-xl shadow-sm border border-gray-200 dark:border-white/5 overflow-hidden">
                    {/* Search and Filters */}
                    <div className="p-4 border-b border-gray-200 dark:border-white/5">
                        <div className="flex flex-col md:flex-row gap-4 items-start md:items-center justify-between">
                            {/* Search Bar */}
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

                            {/* Status Filters */}
                            <div className="flex flex-wrap gap-2">
                                {Object.entries(statusLabels).map(([status, label]) => {
                                    const isActive = statusFilter === status;
                                    return (
                                        <button
                                            key={status}
                                            onClick={() => handleStatusFilterChange(status)}
                                            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${isActive
                                                ? 'bg-[#d4af37] text-white shadow-md'
                                                : 'bg-gray-100 dark:bg-white/5 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-white/10'
                                            }`}
                                        >
                                            {label}
                                        </button>
                                    );
                                })}
                            </div>
                        </div>
                    </div>

                    <div className="overflow-x-auto">
                        <table className="w-full text-left">
                            <thead className="bg-gray-50 dark:bg-white/5 text-gray-500 dark:text-gray-400 text-xs uppercase font-medium">
                                <tr>
                                    <th className="px-6 py-4">Código</th>
                                    <th className="px-6 py-4">Cliente</th>
                                    <th className="px-6 py-4">Fecha Emisión</th>
                                    <th className="px-6 py-4">Monto Total</th>
                                    <th className="px-6 py-4">Estado</th>
                                    <th className="px-6 py-4 text-right">Acciones</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100 dark:divide-white/5 text-sm">
                                {loading ? (
                                    <tr>
                                        <td colSpan={6} className="py-8 text-center text-gray-500">Cargando...</td>
                                    </tr>
                                ) : !filteredInvoices || filteredInvoices.length === 0 ? (
                                    <tr>
                                        <td colSpan={6} className="py-8 text-center text-gray-500">No hay facturas registradas</td>
                                    </tr>
                                ) : (
                                    filteredInvoices.map((invoice) => (
                                        <tr key={invoice.id} className="hover:bg-gray-50 dark:hover:bg-white/5 transition-colors">
                                            <td className="px-6 py-4 font-mono text-[#d4af37]">{invoice.code}</td>
                                            <td className="px-6 py-4">
                                                {invoice.booking?.customer ? (
                                                    <div>
                                                        <div className="font-medium text-gray-900 dark:text-white">
                                                            {invoice.booking.customer.firstName} {invoice.booking.customer.lastName}
                                                        </div>
                                                        <div className="text-xs text-gray-500 dark:text-gray-400">
                                                            {invoice.booking.customer.email}
                                                        </div>
                                                    </div>
                                                ) : (
                                                    <span className="text-gray-400 italic text-xs">Sin cliente</span>
                                                )}
                                            </td>
                                            <td className="px-6 py-4 text-gray-900 dark:text-gray-300">
                                                {new Date(invoice.issuedDate).toLocaleDateString()}
                                            </td>
                                            <td className="px-6 py-4 font-bold text-gray-900 dark:text-white">
                                                ${invoice.totalAmount}
                                            </td>
                                            <td className="px-6 py-4">
                                                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${invoice.status === 'PAID'
                                                    ? 'bg-green-50 text-green-700 border-green-200 dark:bg-green-500/10 dark:text-green-400 dark:border-green-500/20'
                                                    : invoice.status === 'PENDING'
                                                        ? 'bg-yellow-50 text-yellow-700 border-yellow-200 dark:bg-yellow-500/10 dark:text-yellow-400 dark:border-yellow-500/20'
                                                        : invoice.status === 'DRAFT'
                                                            ? 'bg-gray-50 text-gray-700 border-gray-200 dark:bg-gray-500/10 dark:text-gray-400 dark:border-gray-500/20'
                                                            : invoice.status === 'ISSUED'
                                                                ? 'bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-500/10 dark:text-blue-400 dark:border-blue-500/20'
                                                                : 'bg-red-50 text-red-700 border-red-200 dark:bg-red-500/10 dark:text-red-400 dark:border-red-500/20'
                                            }`}>
                                                    {statusLabels[invoice.status] || invoice.status}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 text-right">
                                                <div className="flex justify-end gap-2">
                                                    <ActionButton 
                                                        onClick={() => navigate(`/admin/invoices/edit/${invoice.id}`)}
                                                        icon={PencilSquareIcon}
                                                        label="Editar"
                                                        variant="ghost"
                                                    />
                                                    {invoice.status === 'DRAFT' && (
                                                        <ActionButton 
                                                            onClick={() => handleDeleteClick(invoice.id)}
                                                            icon={TrashIcon}
                                                            label="Eliminar"
                                                            variant="ghost"
                                                            className="text-red-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-500/10"
                                                        />
                                                    )}
                                                    {invoice.status === 'ISSUED' && (
                                                        <ActionButton 
                                                            onClick={() => handleCancelClick(invoice.id)}
                                                            icon={ExclamationTriangleIcon}
                                                            label="Cancelar"
                                                            variant="ghost"
                                                            className="text-orange-500 hover:text-orange-600 hover:bg-orange-50 dark:hover:bg-orange-500/10"
                                                        />
                                                    )}
                                                </div>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>

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
            )}

            {/* Delete Confirmation Modal */}
            {showDeleteModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white dark:bg-[#111111] rounded-lg p-6 max-w-md w-full mx-4 shadow-lg border border-gray-200 dark:border-white/5">
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Confirmar Eliminación</h3>
                        <p className="text-gray-600 dark:text-gray-300 mb-6">¿Estás seguro de eliminar esta factura?</p>
                        <div className="flex justify-end gap-3">
                            <button
                                onClick={closeModals}
                                className="px-4 py-2 text-gray-600 dark:text-gray-400 border border-gray-300 dark:border-white/10 rounded-lg hover:bg-gray-50 dark:hover:bg-white/5 transition-colors"
                            >
                                Cancelar
                            </button>
                            <button
                                onClick={confirmDelete}
                                className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
                            >
                                Eliminar
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Success Modal */}
            {showSuccessModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white dark:bg-[#111111] rounded-lg p-6 max-w-md w-full mx-4 shadow-lg border border-gray-200 dark:border-white/5">
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Factura Eliminada</h3>
                        <p className="text-gray-600 dark:text-gray-300 mb-6">La factura ha sido eliminada correctamente.</p>
                        <div className="flex justify-end">
                            <button
                                onClick={closeModals}
                                className="px-4 py-2 bg-[#d4af37] text-white rounded-lg hover:bg-[#b8962d] transition-colors"
                            >
                                Aceptar
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default InvoiceList;
