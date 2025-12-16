import { useEffect, useState } from 'react';
import { Plus, Check } from 'lucide-react';
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
                console.error(error);
            } finally {
                setLoading(false);
            }
        };
        loadData();
    }, []);

    const requestColumns: Column<ServiceRequest>[] = [
        { header: 'Servicio', accessor: (row: ServiceRequest) => row.service.name },
        { header: 'Habitación', accessor: (row: ServiceRequest) => `Hab.?? (ID: ${row.bookingId.slice(0, 4)})` },
        {
            header: 'Estado',
            accessor: (row: ServiceRequest) => <Badge variant={getStatusColor(row.status)}>{row.status}</Badge>
        },
        { header: 'Solicitado', accessor: (row: ServiceRequest) => formatDateTime(row.requestTime) },
        { header: 'Total', accessor: (row: ServiceRequest) => formatCurrency(row.totalPrice) },
        {
            header: 'Acciones',
            accessor: (row: ServiceRequest) => (
                row.status === 'PENDING' ? <Button size="sm" variant="success" leftIcon={<Check size={14} />}>Atender</Button> : null
            )
        }
    ];

    return (
        <div className="space-y-6">
            <h1 className="text-2xl font-bold text-gray-800">Servicios de Hotel</h1>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2">
                    <Table
                        title="Solicitudes Recientes"
                        data={requests}
                        columns={requestColumns}
                        isLoading={loading}
                        emptyMessage="No hay solicitudes pendientes"
                        keyExtractor={(item: ServiceRequest) => item.id}
                    />
                </div>

                <div>
                    <Card title="Catálogo de Servicios">
                        <div className="space-y-3 max-h-[500px] overflow-y-auto pr-2">
                            {services.map(service => (
                                <div key={service.id} className="p-3 border border-gray-100 rounded-lg hover:bg-gray-50 flex justify-between items-center group">
                                    <div>
                                        <h4 className="font-semibold text-gray-800">{service.name}</h4>
                                        <p className="text-xs text-gray-500">{service.category}</p>
                                    </div>
                                    <span className="font-bold text-blue-600">{formatCurrency(service.price)}</span>
                                </div>
                            ))}
                            <Button block className="mt-4">
                                Agregar Servicio
                            </Button>
                        </div>
                    </Card>
                </div>
            </div>
        </div>
    );
};

export default ServicesView;
