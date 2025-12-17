import { useEffect, useState } from 'react';
import Table, { type Column } from '../../components/shared/Table';
import Button from '../../components/shared/Button';
import Badge from '../../components/shared/Badge';
import Card from '../../components/shared/Card';
import { customersService } from '../../services/api';
import type { Customer } from '../../types';

const CustomersView = () => {
    const [customers, setCustomers] = useState<Customer[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadCustomers();
    }, []);

    const loadCustomers = async () => {
        try {
            setLoading(true);
            const data = await customersService.getAll();
            setCustomers(data);
        } catch (error) {
            console.error("Error loading customers", error);
        } finally {
            setLoading(false);
        }
    };

    const columns: Column<Customer>[] = [
        {
            header: 'ID',
            accessor: (row) => row.id
        },
        {
            header: 'Nombre',
            accessor: (row) => `${row.user?.firstName || ''} ${row.user?.lastName || ''}`
        },
        {
            header: 'Email',
            accessor: (row) => row.user?.email || '-'
        },
        {
            header: 'Género',
            accessor: (row) => (
                <Badge variant={row.gender === 'MALE' ? 'info' : row.gender === 'FEMALE' ? 'danger' : 'default'}>
                    {row.gender}
                </Badge>
            )
        },
        {
            header: 'Teléfono',
            accessor: (row) => row.phone
        },
        {
            header: 'Dirección Línea 1',
            accessor: (row) => row.addressLine1
        },
        {
            header: 'Dirección Línea 2',
            accessor: (row) => (
                <div className="text-sm text-gray-600">
                    {row.addressLine2 || '-'}
                </div>
            )
        },
        {
            header: 'Ciudad',
            accessor: (row) => row.city
        },
        {
            header: 'País',
            accessor: (row) => row.country
        },
        {
            header: 'Licencia ID',
            accessor: (row) => (
                <code className="text-xs bg-gray-100 px-2 py-1 rounded">
                    {row.licenseId}
                </code>
            )
        },
        {
            header: 'Fecha de Nacimiento',
            accessor: (row) => row.birthDate
        },
        {
            header: 'Acciones',
            accessor: () => (
                <div className="flex space-x-2">
                    <Button size="sm" variant="info">Ver Detalles</Button>
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
            </div>

            <Card className="card-plain">
                <Table
                    data={customers}
                    columns={columns}
                    isLoading={loading}
                    title="Listado de Clientes"
                    emptyMessage="No hay clientes registrados"
                    keyExtractor={(item) => item.id}
                />
            </Card>
        </div>
    );
};

export default CustomersView;
