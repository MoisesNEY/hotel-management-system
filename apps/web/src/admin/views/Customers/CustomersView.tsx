import { useEffect, useState } from 'react';
import Table, { type Column } from '../../components/shared/Table';
import Button from '../../components/shared/Button';
import Badge from '../../components/shared/Badge';
import Card from '../../components/shared/Card';
import Modal from '../../components/shared/Modal';
import { getAllCustomerDetails, deleteCustomerDetails } from '../../../services/admin/customerDetailsService';
import { getAllUsers } from '../../../services/admin/userService';
import type { CustomerDetailsDTO } from '../../../types/sharedTypes';
import type { AdminUserDTO } from '../../../types/adminTypes';
import CustomerForm from './CustomerForm';
import { formatDate } from '../../utils/helpers';
import { Trash2, Plus } from 'lucide-react';

const CustomersView = () => {
    const [customers, setCustomers] = useState<CustomerDetailsDTO[]>([]);
    const [usersMap, setUsersMap] = useState<Record<number, AdminUserDTO>>({});
    const [loading, setLoading] = useState(true);
    const [showForm, setShowForm] = useState(false);
    const [editingCustomer, setEditingCustomer] = useState<CustomerDetailsDTO | null>(null);

    useEffect(() => {
        loadCustomers();
    }, []);

    const loadCustomers = async () => {
        try {
            setLoading(true);
            const [customersParams, usersParams] = await Promise.all([
                getAllCustomerDetails(),
                getAllUsers(0, 100) // Fetch list of users to stitch key details
            ]);

            setCustomers(customersParams.data);

            // Create User Lookup
            const map: Record<number, AdminUserDTO> = {};
            usersParams.data.forEach(u => map[u.id] = u);
            setUsersMap(map);

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

    const handleDelete = async (id: number) => {
        if (window.confirm('¿Estás seguro de eliminar este cliente?')) {
            try {
                await deleteCustomerDetails(id);
                setCustomers(prev => prev.filter(c => c.id !== id));
            } catch (error) {
                console.error("Error deleting customer", error);
                alert('No se pudo eliminar el cliente');
            }
        }
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
            accessor: (row) => {
                const userId = row.user?.id;
                const user = userId ? usersMap[userId] : undefined;

                const firstName = user?.firstName || row.user?.firstName;
                const lastName = user?.lastName || row.user?.lastName;

                if (!firstName && !lastName) return <span className="text-gray-400 dark:text-gray-500 italic text-xs uppercase tracking-wider font-semibold">Sin Nombre</span>;
                return <span className="font-semibold text-gray-900 dark:text-white tracking-tight">{`${firstName || ''} ${lastName || ''}`}</span>;
            }
        },
        {
            header: 'Email',
            accessor: (row) => {
                const userId = row.user?.id;
                const user = userId ? usersMap[userId] : undefined;
                return user?.email || row.user?.email || <span className="text-gray-400 italic">Sin Email</span>;
            }
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
                <code className="text-[10px] font-mono bg-gray-100 dark:bg-white/5 px-2 py-1 rounded text-gray-600 dark:text-gray-400 border border-gray-200 dark:border-white/5">
                    {row.licenseId}
                </code>
            )
        },
        {
            header: 'Fecha de Nacimiento',
            accessor: (row) => formatDate(row.birthDate)
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
                    <Button
                        size="sm"
                        variant="danger"
                        onClick={() => handleDelete(row.id)}
                        iconOnly
                    >
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
                    <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Clientes</h1>
                    <p className="text-gray-500 dark:text-gray-400 text-sm">Gestión de base de datos de clientes</p>
                </div>
                <Button onClick={handleCreate} variant="primary" leftIcon={<Plus size={16} />}>
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
