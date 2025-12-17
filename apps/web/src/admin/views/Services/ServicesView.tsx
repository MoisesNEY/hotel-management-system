import { useEffect, useState } from 'react';
import { Check } from 'lucide-react';
import Table, { type Column } from '../../components/shared/Table';
import Button from '../../components/shared/Button';
import Badge from '../../components/shared/Badge';
import Card from '../../components/shared/Card';
import { getAllHotelServices } from '../../../services/admin/hotelServiceService';
import { getAllServiceRequests, updateServiceRequest } from '../../../services/admin/serviceRequestService';
import type { HotelServiceDTO, ServiceRequestDTO } from '../../../types/sharedTypes';
import { formatCurrency, formatDateTime, getStatusColor } from '../../utils/helpers';
import ServiceForm from './ServiceForm';
import Modal from '../../components/shared/Modal';

const ServicesView = () => {
    const [services, setServices] = useState<HotelServiceDTO[]>([]);
    const [requests, setRequests] = useState<ServiceRequestDTO[]>([]);
    const [loading, setLoading] = useState(true);

    // Form State
    const [showForm, setShowForm] = useState(false);
    const [editingService, setEditingService] = useState<HotelServiceDTO | null>(null);

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

    const handleUpdateStatus = async (request: ServiceRequestDTO) => {
        if (!window.confirm('¿Marcar solicitud como completada?')) return;
        
        try {
            // Assuming we change status to COMPLETED directly for "Atender" which means "Attend/Solve"
            // Or maybe IN_PROGRESS if we want intermediate state. For now COMPLETED is safe simple action.
            await updateServiceRequest(request.id, { ...request, status: 'COMPLETED' });
            loadData();
        } catch (error) {
            console.error("Error updating request status", error);
            alert("No se pudo actualizar el estado de la solicitud.");
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
            accessor: (row) => `${row.booking.customer.firstName || 'Sin'} ${row.booking.customer.lastName || 'Nombre'}`
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
                <div className="text-xs text-gray-600 max-w-xs truncate" title={row.details}>
                    {row.details || '-'}
                </div>
            )
        },
        {
            header: 'Estado',
            accessor: (row) => <Badge variant={getStatusColor(row.status)}>{row.status}</Badge>
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
                <div className="text-sm text-gray-600 max-w-md truncate">
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
                <div className="text-xs text-gray-500 max-w-xs truncate">
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
                <Button size="sm" variant="outline" onClick={() => handleEditClick(row)}>
                    Editar
                </Button>
            )
        }
    ];

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-2xl font-bold text-gray-800">Servicios</h1>
                    <p className="text-gray-600">Gestión de servicios y solicitudes</p>
                </div>
                {!showForm && (
                    <Button onClick={handleCreateClick}>Nuevo Servicio</Button>
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
        </div>
    );
};

export default ServicesView;
