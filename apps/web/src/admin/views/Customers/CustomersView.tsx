import { useEffect, useState } from 'react';
import Table, { type Column } from '../../components/shared/Table';
import Button from '../../components/shared/Button';
import Badge from '../../components/shared/Badge';
import Card from '../../components/shared/Card';
import Modal from '../../components/shared/Modal';
import { getAllCustomerDetails } from '../../../services/admin/customerDetailsService';
import type { CustomerDetailsDTO } from '../../../types/sharedTypes';
import CustomerForm from './CustomerForm';

const CustomersView = () => {
    const [customers, setCustomers] = useState<CustomerDetailsDTO[]>([]);
    const [loading, setLoading] = useState(true);
    const [showForm, setShowForm] = useState(false);
    const [editingCustomer, setEditingCustomer] = useState<CustomerDetailsDTO | null>(null);

    useEffect(() => {
        loadCustomers();
    }, []);

    const loadCustomers = async () => {
        try {
            setLoading(true);
            const response = await getAllCustomerDetails(0, 100);
            setCustomers(response.data);
        } catch (error) {
            console.error("Error loading customers", error);
        } finally {
            setLoading(false);
        }
    };

    const handleCreate = () => {
        setEditingCustomer(null);
        setShowForm(true);
    };

    const handleEdit = (customer: CustomerDetailsDTO) => {
        setEditingCustomer(customer);
        setShowForm(true);
    };

    const handleFormSuccess = () => {
        setShowForm(false);
        loadCustomers();
    };

    const columns: Column<CustomerDetailsDTO>[] = [
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
            header: 'Ciudad',
            accessor: (row) => row.city
        },
        {
            header: 'País',
            accessor: (row) => row.country
        },
        {
            header: 'DNI / Pasaporte',
            accessor: (row) => (
                <code className="text-xs bg-gray-100 px-2 py-1 rounded">
                    {row.licenseId}
                </code>
            )
        },
        {
            header: 'Fecha Nacimiento',
            accessor: (row) => row.birthDate
        },
        {
            header: 'Acciones',
            accessor: (row) => (
                <div className="flex space-x-2">
                    <Button
                        size="sm"
                        variant="warning"
                        onClick={() => handleEdit(row)}
                    >
                        Editar
                    </Button>
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
                <Button onClick={handleCreate} variant="primary">
                    Nuevo Cliente
                </Button>
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

            {/* Modal de Cliente */}
            <Modal
                isOpen={showForm}
                onClose={() => setShowForm(false)}
                title={editingCustomer ? 'Editar Cliente' : 'Nuevo Cliente'}
                size="lg"
            >
                <CustomerForm
                    initialData={editingCustomer}
                    onSuccess={handleFormSuccess}
                    onCancel={() => setShowForm(false)}
                />
            </Modal>
        </div>
    );
};

export default CustomersView;
