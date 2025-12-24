import { useEffect, useState } from 'react';
import Table, { type Column } from '../../components/shared/Table';
import Button from '../../components/shared/Button';
import Badge from '../../components/shared/Badge';
import Card from '../../components/shared/Card';
import Modal from '../../components/shared/Modal';
import { getAllCustomers, deleteCustomer } from '../../../services/admin/customerService';
import type { CustomerDTO, AdminUserDTO } from '../../../types/adminTypes';
import CustomerForm from './CustomerForm';
import { formatDate } from '../../utils/helpers';
import { Trash2, Plus } from 'lucide-react';

const CustomersView = () => {
    const [customers, setCustomers] = useState<CustomerDTO[]>([]);
    const [loading, setLoading] = useState(true);
    const [showForm, setShowForm] = useState(false);
    const [editingCustomer, setEditingCustomer] = useState<CustomerDTO | null>(null);
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [customerToDeleteId, setCustomerToDeleteId] = useState<number | null>(null);
    const [permissionError, setPermissionError] = useState(false);

    useEffect(() => {
        loadCustomers();
    }, []);

    const loadCustomers = async () => {
        try {
            setLoading(true);
            // No need to fetch users separately anymore, CustomerDTO has the data
            const response = await getAllCustomers();
            setCustomers(response.data);
        } catch (error: any) {
            console.error("Error loading customers", error);
            if (error.response?.status === 403) {
                setPermissionError(true);
            }
        } finally {
            setLoading(false);
        }
    };

    const handleCreate = () => {
        setEditingCustomer(null);
        setShowForm(true);
    };

    const handleEdit = (customer: CustomerDTO) => {
        setEditingCustomer(customer);
        setShowForm(true);
    };

    const handleDelete = (id: number) => {
        setCustomerToDeleteId(id);
        setShowDeleteModal(true);
    };

    const confirmDelete = async () => {
        if (!customerToDeleteId) return;

        try {
            await deleteCustomer(customerToDeleteId);
            setCustomers(prev => prev.filter(c => c.id !== customerToDeleteId));
            setShowDeleteModal(false);
            setCustomerToDeleteId(null);
        } catch (error) {
            console.error("Error deleting customer", error);
            alert('No se pudo eliminar el cliente');
        }
    };

    const handleFormSuccess = () => {
        setShowForm(false);
        loadCustomers();
    };

    const columns: Column<CustomerDTO>[] = [
        {
            header: 'ID',
            accessor: (row) => row.id
        },
        {
            header: 'Nombre',
            accessor: (row) => {
                const firstName = row.firstName;
                const lastName = row.lastName;

                if (!firstName && !lastName) {
                    const login = row.user?.login;
                    return login ? (
                        <span className="text-gray-600 dark:text-gray-400 font-medium">
                            {login}
                        </span>
                    ) : (
                        <span className="text-gray-400 dark:text-gray-500 italic text-xs uppercase tracking-wider font-semibold">Sin Nombre</span>
                    );
                }
                return <span className="font-semibold text-gray-900 dark:text-white tracking-tight">{`${firstName || ''} ${lastName || ''}`}</span>;
            }
        },
        {
            header: 'Email',
            accessor: (row) => row.email || <span className="text-gray-400 italic">Sin Email</span>
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

            {permissionError ? (
                <Card className="p-12 text-center flex flex-col items-center justify-center space-y-4">
                    <div className="w-16 h-16 bg-red-100 dark:bg-red-900/20 text-red-600 dark:text-red-400 rounded-full flex items-center justify-center">
                        <Trash2 size={32} />
                    </div>
                    <h2 className="text-xl font-bold text-gray-900 dark:text-white">Acceso Denegado (403 )</h2>
                    <p className="max-w-md text-gray-500 dark:text-gray-400">
                        El servidor ha rechazado el acceso a la lista de clientes para tu rol actual.
                        Por favor, contacta al administrador para que habilite los permisos de <code className="bg-gray-100 dark:bg-white/5 px-1 rounded text-red-500 font-bold">ROL_EMPLEADO</code> en el backend.
                    </p>
                    <Button variant="secondary" onClick={loadCustomers}>
                        Reintentar
                    </Button>
                </Card>
            ) : (
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
            )}

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

            {/* Modal de Confirmación de Eliminación */}
            <Modal
                isOpen={showDeleteModal}
                onClose={() => setShowDeleteModal(false)}
                title="Confirmar Eliminación"
                size="md"
            >
                <div className="flex flex-col items-center justify-center p-6 text-center">
                    <div className="flex items-center justify-center w-12 h-12 mb-4 bg-red-100 rounded-full dark:bg-red-900/30">
                        <Trash2 className="w-6 h-6 text-red-600 dark:text-red-400" />
                    </div>

                    <h3 className="mb-2 text-lg font-medium text-gray-900 dark:text-white">
                        ¿Eliminar cliente?
                    </h3>
                    <p className="mb-6 text-sm text-gray-500 dark:text-gray-400">
                        ¿Estás seguro de que deseas eliminar este cliente? Esta acción no se puede deshacer.
                    </p>

                    <div className="flex w-full space-x-3">
                        <Button
                            variant="secondary"
                            onClick={() => setShowDeleteModal(false)}
                            className="w-full justify-center"
                        >
                            Cancelar
                        </Button>
                        <Button
                            variant="danger"
                            onClick={confirmDelete}
                            className="w-full justify-center"
                        >
                            Eliminar
                        </Button>
                    </div>
                </div>
            </Modal>
        </div>
    );
};

export default CustomersView;
