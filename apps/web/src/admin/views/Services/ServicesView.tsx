import { useEffect, useState } from 'react';
import { formatCurrency, formatDateTime, getRequestStatusConfig } from '../../utils/helpers';
import ServiceForm from './ServiceForm';
import Modal from '../../components/shared/Modal';
import { Check, Trash2, Plus, CheckCircle2, XCircle, AlertTriangle } from 'lucide-react';
import Table, { type Column } from '../../components/shared/Table';
import Button from '../../components/shared/Button';
import Badge from '../../components/shared/Badge';
import Card from '../../components/shared/Card';
import { getAllHotelServices, deleteHotelService } from '../../../services/admin/hotelServiceService';
import { getAllServiceRequests, updateServiceRequest } from '../../../services/admin/serviceRequestService';
import type { HotelServiceDTO, ServiceRequestDTO } from '../../../types/adminTypes';

const ServicesView = () => {
    const [services, setServices] = useState<HotelServiceDTO[]>([]);
    const [requests, setRequests] = useState<ServiceRequestDTO[]>([]);
    const [loading, setLoading] = useState(true);

    // Form State
    const [showForm, setShowForm] = useState(false);
    const [editingService, setEditingService] = useState<HotelServiceDTO | null>(null);

    // Feedback State
    const [feedback, setFeedback] = useState<{
        show: boolean;
        title: string;
        message: string;
        type: 'success' | 'error' | 'warning';
    }>({ show: false, title: '', message: '', type: 'success' });

    const showSuccess = (title: string, message: string) => {
        setFeedback({ show: true, title, message, type: 'success' });
    };

    const showError = (title: string, message: string) => {
        setFeedback({ show: true, title, message, type: 'error' });
    };

    const loadData = async () => {
        try {
            setLoading(true);
            const [servicesResponse, requestsResponse] = await Promise.all([
                getAllHotelServices(0, 50),
                getAllServiceRequests(0, 50)
            ]);
            setServices(servicesResponse.data);
            setRequests(requestsResponse.data);
        } catch (error) {
            console.error("Error loading services", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadData();
    }, []);


    // Handlers
    const handleCreateClick = () => {
        setEditingService(null);
        setShowForm(true);
    };

    const handleEditClick = (service: HotelServiceDTO) => {
        setEditingService(service);
        setShowForm(true);
    };

    const handleDeleteClick = async (id: number) => {
        try {
            await deleteHotelService(id);
            setServices(prev => prev.filter(s => s.id !== id));
            showSuccess('Servicio Removido', 'El servicio ha sido eliminado permanentemente del catálogo.');
        } catch (error: any) {
            console.error("Error deleting service", error);
            const serverMsg = error.response?.data?.detail || error.response?.data?.message || 'No se pudo eliminar el servicio seleccionado.';
            showError('Error al Eliminar', serverMsg);
        }
    };

    const handleUpdateStatus = async (request: ServiceRequestDTO) => {
        try {
            await updateServiceRequest(request.id, { ...request, status: 'COMPLETED' });
            loadData();
            showSuccess('Solicitud Completada', 'La solicitud de servicio ha sido marcada como resuelta.');
        } catch (error: any) {
            console.error("Error updating request status", error);
            const serverMsg = error.response?.data?.detail || error.response?.data?.message || 'No se pudo actualizar el estado de la solicitud.';
            showError('Error en Actualización', serverMsg);
        }
    };

    const requestColumns: Column<ServiceRequestDTO>[] = [
        {
            header: 'ID',
            accessor: (row) => row.id
        },
        {
            header: 'Servicio',
            accessor: (row) => row.service.name
        },
        {
            header: 'Cliente',
            accessor: (row) => {
                const customer = row.booking?.customer;
                if (!customer) return <span className="text-gray-400 italic text-xs">Sin asignar</span>;
                return (
                    <div className="font-bold text-gray-900 dark:text-white">
                        {customer.firstName} {customer.lastName}
                    </div>
                );
            }
        },
        {
            header: 'Reserva ID',
            accessor: (row) => row.booking.id
        },
        {
            header: 'Fecha Solicitud',
            accessor: (row) => formatDateTime(row.requestDate)
        },
        {
            header: 'Detalles',
            accessor: (row) => (
                <div className="text-xs text-gray-500 dark:text-gray-400 max-w-xs truncate font-medium" title={row.details}>
                    {row.details || '-'}
                </div>
            )
        },
        {
            header: 'Estado',
            accessor: (row) => {
                const config = getRequestStatusConfig(row.status);
                return (
                    <Badge variant={config.variant} className="px-4 py-1">
                        {config.label}
                    </Badge>
                );
            }
        },
        {
            header: 'Acciones',
            accessor: (row) => (
                row.status === 'OPEN' || row.status === 'IN_PROGRESS' ?
                    <Button
                        size="sm"
                        variant="success"
                        onClick={() => handleUpdateStatus(row)}
                        leftIcon={<Check size={14} />}
                    >
                        Completar
                    </Button>
                    : null
            )
        }
    ];

    const serviceColumns: Column<HotelServiceDTO>[] = [
        {
            header: 'ID',
            accessor: (row) => row.id
        },
        {
            header: 'Nombre',
            accessor: (row) => row.name
        },
        {
            header: 'Descripción',
            accessor: (row) => (
                <div className="text-sm text-gray-600 dark:text-gray-300 max-w-md truncate font-medium">
                    {row.description || '-'}
                </div>
            )
        },
        {
            header: 'Costo',
            accessor: (row) => formatCurrency(row.cost)
        },
        {
            header: 'Imagen URL',
            accessor: (row) => (
                <div className="text-[10px] text-gray-400 dark:text-gray-500 max-w-xs truncate font-mono">
                    {row.imageUrl || '-'}
                </div>
            )
        },
        {
            header: 'Disponible',
            accessor: (row) => (
                <Badge variant={row.isAvailable ? 'success' : 'warning'}>
                    {row.isAvailable ? 'Sí' : 'No'}
                </Badge>
            )
        },
        {
            header: 'Acciones',
            accessor: (row) => (
                <div className="flex gap-2">
                    <Button size="sm" variant="outline" onClick={() => handleEditClick(row)}>
                        Editar
                    </Button>
                    <Button size="sm" variant="danger" onClick={() => handleDeleteClick(row.id)} iconOnly>
                        <Trash2 size={14} />
                    </Button>
                </div>
            )
        }
    ];

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center bg-transparent">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Servicios</h1>
                    <p className="text-gray-500 dark:text-gray-400 text-sm">Gestión de servicios y solicitudes</p>
                </div>
                {!showForm && (
                    <Button onClick={handleCreateClick} leftIcon={<Plus size={16} />}>Nuevo Servicio</Button>
                )}
            </div>

            <Card className="card-plain">
                <Table
                    data={requests}
                    columns={requestColumns}
                    isLoading={loading}
                    title="Solicitudes de Servicio"
                    emptyMessage="No hay solicitudes pendientes"
                    keyExtractor={(item: ServiceRequestDTO) => item.id}
                />
            </Card>

            <Card className="card-plain">
                <Table
                    data={services}
                    columns={serviceColumns}
                    isLoading={loading}
                    title="Catálogo de Servicios"
                    emptyMessage="No hay servicios disponibles"
                    keyExtractor={(item: HotelServiceDTO) => item.id}
                />
            </Card>

            <Modal
                isOpen={showForm}
                onClose={() => setShowForm(false)}
                title={editingService ? 'Editar Servicio' : 'Nuevo Servicio'}
            >
                <ServiceForm
                    initialData={editingService || undefined}
                    onSuccess={() => {
                        setShowForm(false);
                        loadData();
                    }}
                    onCancel={() => setShowForm(false)}
                />
            </Modal>

            {/* Modal de Feedback (Standard UI) */}
            <Modal
                isOpen={feedback.show}
                onClose={() => setFeedback({ ...feedback, show: false })}
                size="sm"
            >
                <div className="p-10 flex flex-col items-center text-center space-y-6">
                    <div className={`w-20 h-20 rounded-full flex items-center justify-center ${
                        feedback.type === 'success' ? 'bg-emerald-500/10 text-emerald-500' :
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
        </div>
    );
};

export default ServicesView;
