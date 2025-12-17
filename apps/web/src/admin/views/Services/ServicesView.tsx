import { useEffect, useState } from 'react';
import { Check } from 'lucide-react';
import Table, { type Column } from '../../components/shared/Table';
import Button from '../../components/shared/Button';
import Badge from '../../components/shared/Badge';
import Card from '../../components/shared/Card';
import { servicesService } from '../../services/api';
import type { HotelService, ServiceRequest } from '../../types';
import { formatCurrency, formatDateTime, getStatusColor } from '../../utils/helpers';

const ServicesView = () => {
    const [services, setServices] = useState<HotelService[]>([]);
    const [requests, setRequests] = useState<ServiceRequest[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const loadData = async () => {
            try {
                setLoading(true);
                const [servicesData, requestsData] = await Promise.all([
                    servicesService.getAllServices(),
                    servicesService.getAllRequests()
                ]);
                setServices(servicesData);
                setRequests(requestsData);
            } catch (error) {
                console.error("Error loading services", error);
            } finally {
                setLoading(false);
            }
        };
        loadData();
    }, []);

    const requestColumns: Column<ServiceRequest>[] = [
        {
            header: 'ID',
            accessor: (row) => row.id
        },
        {
            header: 'Servicio',
            accessor: (row) => row.service.name
        },
        {
            header: 'Costo Servicio',
            accessor: (row) => formatCurrency(row.service.cost)
        },
        {
            header: 'Cliente',
            accessor: (row) => `${row.booking.customer.firstName} ${row.booking.customer.lastName}`
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
                <div className="text-xs text-gray-600 max-w-xs truncate">
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
                row.status === 'OPEN' ?
                    <Button size="sm" variant="success" leftIcon={<Check size={14} />}>Atender</Button>
                    : null
            )
        }
    ];

    const serviceColumns: Column<HotelService>[] = [
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
            accessor: () => (
                <Button size="sm" variant="outline">Editar</Button>
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
                <Button>Nuevo Servicio</Button>
            </div>

            <Card className="card-plain">
                <Table
                    data={requests}
                    columns={requestColumns}
                    isLoading={loading}
                    title="Solicitudes de Servicio"
                    emptyMessage="No hay solicitudes pendientes"
                    keyExtractor={(item) => item.id}
                />
            </Card>

            <Card className="card-plain">
                <Table
                    data={services}
                    columns={serviceColumns}
                    isLoading={loading}
                    title="Catálogo de Servicios"
                    emptyMessage="No hay servicios disponibles"
                    keyExtractor={(item) => item.id}
                />
            </Card>
        </div>
    );
};

export default ServicesView;
