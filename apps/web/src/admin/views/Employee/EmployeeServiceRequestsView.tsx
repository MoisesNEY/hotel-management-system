import { useEffect, useState, useCallback } from 'react';
import Table, { type Column } from '../../components/shared/Table';
import Button from '../../components/shared/Button';
import Badge from '../../components/shared/Badge';
import Card from '../../components/shared/Card';
import Modal from '../../components/shared/Modal';
import ServiceRequestForm from './ServiceRequestForm';
import { getAllServiceRequests } from '../../../services/admin/serviceRequestService';
import { updateServiceRequestStatus } from '../../../services/employee/employeeService';
import type { ServiceRequestDTO, RequestStatus } from '../../../types/adminTypes';
import { formatDate, getRequestStatusConfig } from '../../utils/helpers';
import { CheckCircle2, XCircle, AlertTriangle, Wrench, ChevronLeft, ChevronRight, Search, X, RefreshCw, Plus } from 'lucide-react';

const statusLabels: Record<string, string> = {
    'ALL': 'Todas',
    'OPEN': 'Abiertas',
    'IN_PROGRESS': 'En Progreso',
    'COMPLETED': 'Completadas',
    'REJECTED': 'Rechazadas',
};

const EmployeeServiceRequestsView = () => {
    // Service Requests State
    const [serviceRequests, setServiceRequests] = useState<ServiceRequestDTO[]>([]);
    const [loading, setLoading] = useState(true);

    // Pagination state
    const [currentPage, setCurrentPage] = useState(0);
    const [pageSize, setPageSize] = useState(10);
    const [totalItems, setTotalItems] = useState(0);
    
    // Search and Filter state
    const [searchQuery, setSearchQuery] = useState('');
    const [debouncedSearch, setDebouncedSearch] = useState('');
    const [statusFilter, setStatusFilter] = useState('ALL');

    // Form Modal State
    const [showForm, setShowForm] = useState(false);

    // Update Service Request Status Modal State
    const [showStatusModal, setShowStatusModal] = useState(false);
    const [updatingRequestId, setUpdatingRequestId] = useState<number | null>(null);
    const [selectedStatus, setSelectedStatus] = useState<RequestStatus | ''>('');
    const [statusUpdateLoading, setStatusUpdateLoading] = useState(false);

    // Feedback State
    const [feedback, setFeedback] = useState<{
        show: boolean;
        title: string;
        message: string;
        type: 'success' | 'error' | 'warning';
    }>({ show: false, title: '', message: '', type: 'success' });

    const showSuccess = useCallback((title: string, message: string) => {
        setFeedback({ show: true, title, message, type: 'success' });
    }, []);

    const showError = useCallback((title: string, message: string) => {
        setFeedback({ show: true, title, message, type: 'error' });
    }, []);

    // Debounce search input
    useEffect(() => {
        const timer = setTimeout(() => {
            setDebouncedSearch(searchQuery);
        }, 300);
        return () => clearTimeout(timer);
    }, [searchQuery]);

    // Load data when pagination, filter or search changes
    useEffect(() => {
        loadData();
    }, [currentPage, pageSize, statusFilter, debouncedSearch]);

    const loadData = async () => {
        try {
            setLoading(true);
            const response = await getAllServiceRequests(currentPage, pageSize, 'id,desc', statusFilter, debouncedSearch);
            setServiceRequests(response.data);
            setTotalItems(response.total);
        } catch (error) {
            console.error('Error loading service requests data:', error);
            showError('Error', 'No se pudieron cargar las solicitudes de servicio');
        } finally {
            setLoading(false);
        }
    };

    // Service Request Status Update Handlers
    const openStatusModal = (requestId: number) => {
        setUpdatingRequestId(requestId);
        setSelectedStatus('');
        setShowStatusModal(true);
    };

    const handleUpdateStatus = async () => {
        if (!updatingRequestId || !selectedStatus) return;

        setStatusUpdateLoading(true);
        try {
            await updateServiceRequestStatus(updatingRequestId, selectedStatus);
            showSuccess('Estado Actualizado', 'Estado del servicio actualizado correctamente');
            loadData(); // Reload to reflect changes
            setShowStatusModal(false);
        } catch (error) {
            console.error('Error updating service request status:', error);
            showError('Error', 'No se pudo actualizar el estado del servicio');
        } finally {
            setStatusUpdateLoading(false);
        }
    };

    // Quick status cycle
    const handleQuickStatusChange = async (request: ServiceRequestDTO) => {
        const statusOrder: RequestStatus[] = ['OPEN', 'IN_PROGRESS', 'COMPLETED', 'REJECTED'];
        const currentIndex = statusOrder.indexOf(request.status);
        const nextIndex = (currentIndex + 1) % statusOrder.length;
        const newStatus = statusOrder[nextIndex];

        try {
            await updateServiceRequestStatus(request.id, newStatus);
            showSuccess('Estado Actualizado', `Solicitud ahora está: ${statusLabels[newStatus]}`);
            setServiceRequests(prev => prev.map(r => 
                r.id === request.id ? { ...r, status: newStatus } : r
            ));
        } catch (error) {
            console.error('Error updating status:', error);
            showError('Error', 'No se pudo actualizar el estado');
        }
    };

    const handlePageSizeChange = (newSize: number) => {
        setPageSize(newSize);
        setCurrentPage(0);
    };

    const handleStatusFilterChange = (status: string) => {
        setStatusFilter(status);
        setCurrentPage(0);
    };

    const handleSearchChange = (value: string) => {
        setSearchQuery(value);
        setCurrentPage(0);
    };

    const clearSearch = () => {
        setSearchQuery('');
        setCurrentPage(0);
    };

    const totalPages = Math.ceil(totalItems / pageSize);

    // Table Columns for Service Requests
    const serviceRequestColumns: Column<ServiceRequestDTO>[] = [
        {
            header: 'ID',
            accessor: (request) => (
                <span className="font-mono text-sm">{request.id}</span>
            )
        },
        {
            header: 'Servicio',
            accessor: (request) => (
                <div className="font-medium text-gray-900 dark:text-white">
                    {request.service.name}
                </div>
            )
        },
        {
            header: 'Cliente',
            accessor: (request) => (
                <div>
                    <div className="font-medium">
                        {request.booking?.customer ? `${request.booking.customer.firstName} ${request.booking.customer.lastName}` : 'Cliente desconocido'}
                    </div>
                    <div className="text-xs text-gray-500 dark:text-gray-400">
                        Reserva #{request.booking?.id}
                    </div>
                </div>
            )
        },
        {
            header: 'Fecha',
            accessor: (request) => (
                <span className="text-sm text-gray-600 dark:text-gray-300">
                    {formatDate(request.requestDate)}
                </span>
            )
        },
        {
            header: 'Detalles',
            accessor: (request) => (
                <div className="text-xs text-gray-500 dark:text-gray-400 max-w-xs truncate">
                    {request.details || 'Sin detalles'}
                </div>
            )
        },
        {
            header: 'Estado',
            accessor: (request) => {
                const config = getRequestStatusConfig(request.status);
                return (
                    <button
                        onClick={() => handleQuickStatusChange(request)}
                        className="group flex items-center gap-2"
                        title="Clic para cambiar estado"
                    >
                        <Badge variant={config.variant}>{config.label}</Badge>
                        <RefreshCw size={14} className="text-gray-400 opacity-0 group-hover:opacity-100 transition-opacity" />
                    </button>
                );
            }
        },
        {
            header: 'Acciones',
            accessor: (request) => (
                <Button
                    size="sm"
                    variant="info"
                    onClick={() => openStatusModal(request.id)}
                    iconOnly
                    title="Cambiar estado"
                >
                    <Wrench size={14} />
                </Button>
            )
        }
    ];

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center bg-transparent">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Solicitudes de Servicio</h1>
                    <p className="text-gray-500 dark:text-gray-400 text-sm">Gestión de servicios solicitados por huéspedes</p>
                </div>
                <Button onClick={() => setShowForm(true)} leftIcon={<Plus size={16} />}>
                    Nueva Solicitud
                </Button>
            </div>

            <Card className="card-plain">
                {/* Search Bar */}
                <div className="mb-4">
                    <div className="relative max-w-md">
                        <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                        <input
                            type="text"
                            placeholder="Buscar por nombre de servicio..."
                            value={searchQuery}
                            onChange={(e) => handleSearchChange(e.target.value)}
                            className="w-full pl-10 pr-10 py-2 rounded-lg border border-gray-300 dark:border-white/10 bg-white dark:bg-black/20 text-gray-900 dark:text-white placeholder-gray-400 focus:ring-2 focus:ring-[#d4af37] focus:border-transparent outline-none transition-all"
                        />
                        {searchQuery && (
                            <button
                                onClick={clearSearch}
                                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
                            >
                                <X size={16} />
                            </button>
                        )}
                    </div>
                </div>

                {/* Status Filters and Page Size */}
                <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
                    <div className="flex flex-wrap gap-2">
                        {Object.entries(statusLabels).map(([status, label]) => {
                            const isActive = statusFilter === status;
                            return (
                                <Button
                                    key={status}
                                    onClick={() => handleStatusFilterChange(status)}
                                    variant={isActive ? 'primary' : 'ghost'}
                                    size="sm"
                                    className={isActive
                                        ? 'shadow-md'
                                        : 'bg-gray-100 dark:bg-white/5 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-white/10 border-none shadow-none hover:shadow-none'
                                    }
                                >
                                    {label}
                                </Button>
                            );
                        })}
                    </div>
                    
                    {/* Page Size Selector */}
                    <div className="flex items-center gap-2">
                        <span className="text-sm text-gray-500 dark:text-gray-400">Mostrar:</span>
                        <select
                            value={pageSize}
                            onChange={(e) => handlePageSizeChange(Number(e.target.value))}
                            className="px-3 py-1.5 rounded-lg border border-gray-300 dark:border-white/10 bg-white dark:bg-[#1a1a1a] text-gray-900 dark:text-white text-sm focus:ring-2 focus:ring-[#d4af37] focus:border-transparent outline-none transition-all"
                        >
                            <option value={5} className="bg-white dark:bg-[#1a1a1a]">5</option>
                            <option value={10} className="bg-white dark:bg-[#1a1a1a]">10</option>
                            <option value={20} className="bg-white dark:bg-[#1a1a1a]">20</option>
                            <option value={50} className="bg-white dark:bg-[#1a1a1a]">50</option>
                        </select>
                        <span className="text-sm text-gray-500 dark:text-gray-400">por página</span>
                    </div>
                </div>

                <Table
                    columns={serviceRequestColumns}
                    data={serviceRequests}
                    isLoading={loading}
                    emptyMessage="No hay solicitudes de servicio"
                    keyExtractor={(item) => item.id}
                />

                {/* Pagination Controls */}
                {totalPages > 0 && (
                    <div className="flex items-center justify-between mt-6 pt-4 border-t border-gray-200 dark:border-white/5">
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                            {totalItems > 0 
                                ? `Mostrando ${currentPage * pageSize + 1} - ${Math.min((currentPage + 1) * pageSize, totalItems)} de ${totalItems} solicitudes`
                                : 'Sin resultados'
                            }
                        </p>
                        
                        {totalPages > 1 && (
                            <div className="flex items-center gap-1">
                                <button
                                    onClick={() => setCurrentPage(p => Math.max(0, p - 1))}
                                    disabled={currentPage === 0}
                                    className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-white/5 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                                >
                                    <ChevronLeft size={18} className="text-gray-600 dark:text-gray-400" />
                                </button>
                                
                                {/* Page Numbers */}
                                {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                                    let pageNum;
                                    if (totalPages <= 5) {
                                        pageNum = i;
                                    } else if (currentPage < 3) {
                                        pageNum = i;
                                    } else if (currentPage > totalPages - 4) {
                                        pageNum = totalPages - 5 + i;
                                    } else {
                                        pageNum = currentPage - 2 + i;
                                    }
                                    
                                    return (
                                        <button
                                            key={pageNum}
                                            onClick={() => setCurrentPage(pageNum)}
                                            className={`w-8 h-8 rounded-lg text-sm font-medium transition-colors ${
                                                currentPage === pageNum
                                                    ? 'bg-[#d4af37] text-white'
                                                    : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-white/5'
                                            }`}
                                        >
                                            {pageNum + 1}
                                        </button>
                                    );
                                })}
                                
                                <button
                                    onClick={() => setCurrentPage(p => Math.min(totalPages - 1, p + 1))}
                                    disabled={currentPage >= totalPages - 1}
                                    className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-white/5 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                                >
                                    <ChevronRight size={18} className="text-gray-600 dark:text-gray-400" />
                                </button>
                            </div>
                        )}
                    </div>
                )}
            </Card>

            {/* Feedback Modal */}
            <Modal
                isOpen={feedback.show}
                onClose={() => setFeedback({ ...feedback, show: false })}
                size="sm"
            >
                <div className="p-10 flex flex-col items-center text-center space-y-6">
                    <div className={`w-20 h-20 rounded-full flex items-center justify-center ${feedback.type === 'success' ? 'bg-emerald-500/10 text-emerald-500' :
                        feedback.type === 'error' ? 'bg-rose-500/10 text-rose-500' :
                            'bg-amber-500/10 text-amber-500'
                        }`}>
                        {feedback.type === 'success' && <CheckCircle2 size={40} />}
                        {feedback.type === 'error' && <XCircle size={40} />}
                        {feedback.type === 'warning' && <AlertTriangle size={40} />}
                    </div>
                    <div>
                        <h3 className="text-xl font-bold text-gray-900 dark:text-white">{feedback.title}</h3>
                        <p className="text-sm text-gray-500 dark:text-gray-400 mt-2 leading-relaxed">
                            {feedback.message}
                        </p>
                    </div>
                    <Button
                        variant={feedback.type === 'success' ? 'primary' : 'danger'}
                        className="w-full rounded-2xl py-4"
                        onClick={() => setFeedback({ ...feedback, show: false })}
                    >
                        Entendido
                    </Button>
                </div>
            </Modal>

            {/* Update Status Modal */}
            <Modal
                isOpen={showStatusModal}
                onClose={() => setShowStatusModal(false)}
                title="Actualizar Estado de Solicitud"
            >
                <div className="p-6 space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                            Nuevo Estado
                        </label>
                        <select
                            value={selectedStatus}
                            onChange={(e) => setSelectedStatus(e.target.value as RequestStatus)}
                            className="w-full px-4 py-2.5 rounded-lg border border-gray-300 dark:border-white/10 bg-white dark:bg-[#1a1a1a] text-gray-900 dark:text-white focus:ring-2 focus:ring-[#d4af37] focus:border-transparent outline-none transition-all"
                        >
                            <option value="" className="bg-white dark:bg-[#1a1a1a]">Seleccionar estado...</option>
                            <option value="OPEN" className="bg-white dark:bg-[#1a1a1a]">Abierta</option>
                            <option value="IN_PROGRESS" className="bg-white dark:bg-[#1a1a1a]">En Progreso</option>
                            <option value="COMPLETED" className="bg-white dark:bg-[#1a1a1a]">Completada</option>
                            <option value="REJECTED" className="bg-white dark:bg-[#1a1a1a]">Rechazada</option>
                        </select>
                    </div>
                    <div className="flex justify-end gap-3 pt-4 border-t border-gray-200 dark:border-white/5">
                        <Button variant="ghost" onClick={() => setShowStatusModal(false)}>
                            Cancelar
                        </Button>
                        <Button
                            onClick={handleUpdateStatus}
                            disabled={!selectedStatus || statusUpdateLoading}
                        >
                            {statusUpdateLoading ? 'Actualizando...' : 'Actualizar'}
                        </Button>
                    </div>
                </div>
            </Modal>

            {/* New Service Request Modal */}
            <Modal
                isOpen={showForm}
                onClose={() => setShowForm(false)}
                title="Nueva Solicitud de Servicio"
            >
                <ServiceRequestForm
                    onSuccess={() => {
                        setShowForm(false);
                        loadData();
                        showSuccess('Solicitud Creada', 'La solicitud de servicio ha sido registrada correctamente.');
                    }}
                    onCancel={() => setShowForm(false)}
                />
            </Modal>
        </div>
    );
};

export default EmployeeServiceRequestsView;