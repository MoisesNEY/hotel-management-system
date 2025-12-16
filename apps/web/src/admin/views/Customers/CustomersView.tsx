import { useEffect, useState } from 'react';
import { User, Mail, Phone, MapPin } from 'lucide-react';
import Table, { type Column } from '../../components/shared/Table';
import Button from '../../components/shared/Button';
import Card from '../../components/shared/Card';
import { roomsService } from '../../services/api';
import type { Customer } from '../../types'

const CustomersView = () => {
    const [customers, setCustomers] = useState<Customer[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // Mock loading or fetch
        const loadCustomers = async () => {
            try {
                setLoading(true);
                // const data = await customersService.getAll(); 
                // Using mock data for now if service isn't ready or to guarantee render
                const mockData: any[] = [
                    { id: '1', firstName: 'John', lastName: 'Doe', email: 'john@example.com', phoneNumber: '1234567890', address: '123 Main St' },
                    { id: '2', firstName: 'Jane', lastName: 'Smith', email: 'jane@example.com', phoneNumber: '0987654321', address: '456 Oak Ave' },
                ];
                setCustomers(mockData);
            } catch (error) {
                console.error(error);
            } finally {
                setLoading(false);
            }
        };
        loadCustomers();
    }, []);

    const columns: Column<Customer>[] = [
        {
            header: 'Cliente',
            accessor: (row: any) => (
                <div className="flex items-center">
                    <div className="p-2 rounded-full bg-blue-50 text-blue-500 mr-3">
                        <User size={16} />
                    </div>
                    <div>
                        <div className="font-bold text-gray-800">{row.firstName} {row.lastName}</div>
                        <div className="text-xs text-gray-500">ID: {row.id}</div>
                    </div>
                </div>
            )
        },
        {
            header: 'Contacto',
            accessor: (row: any) => (
                <div className="text-sm">
                    <div className="flex items-center text-gray-600 mb-1">
                        <Mail size={14} className="mr-2" /> {row.email}
                    </div>
                    <div className="flex items-center text-gray-600">
                        <Phone size={14} className="mr-2" /> {row.phoneNumber}
                    </div>
                </div>
            )
        },
        {
            header: 'Dirección',
            accessor: (row: any) => (
                <div className="flex items-center text-sm text-gray-600">
                    <MapPin size={14} className="mr-2" /> {row.address || 'N/A'}
                </div>
            )
        },
        {
            header: 'Acciones',
            accessor: () => (
                <div className="flex space-x-2">
                    <Button size="sm" variant="info">Editar</Button>
                    <Button size="sm" variant="danger">Eliminar</Button>
                </div>
            )
        }
    ];

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-2xl font-bold text-gray-800">Clientes</h1>
                    <p className="text-gray-600">Gestión de base de datos de clientes</p>
                </div>
                <Button>Nuevo Cliente</Button>
            </div>

            <Card className="card-plain">
                <Table
                    data={customers}
                    columns={columns}
                    isLoading={loading}
                    title="Listado de Clientes"
                    emptyMessage="No hay clientes registrados"
                    keyExtractor={(item: any) => item.id}
                />
            </Card>
        </div>
    );
};

export default CustomersView;
