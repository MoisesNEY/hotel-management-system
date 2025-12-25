import { useEffect, useState } from 'react';
import Table, { type Column } from '../../components/shared/Table';
import Button from '../../components/shared/Button';
import Badge from '../../components/shared/Badge';
import Card from '../../components/shared/Card';
import Modal from '../../components/shared/Modal';
import { getAllCustomers, deleteCustomer } from '../../../services/admin/customerService';
import type { CustomerDTO } from '../../../types/adminTypes';
import CustomerForm from './CustomerForm';
import { formatDate } from '../../utils/helpers';
import { Trash2, Plus, Search, X, ChevronLeft, ChevronRight } from 'lucide-react';
import { useAuth } from '../../../contexts/AuthProvider';

const CustomersView = () => {
    const { getHighestRole } = useAuth();
    const userRole = getHighestRole();
    const canDelete = userRole === 'ROLE_ADMIN';

    const [customers, setCustomers] = useState<CustomerDTO[]>([]);
    const [loading, setLoading] = useState(true);
    const [showForm, setShowForm] = useState(false);
    const [editingCustomer, setEditingCustomer] = useState<CustomerDTO | null>(null);
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [customerToDeleteId, setCustomerToDeleteId] = useState<number | null>(null);
    const [permissionError, setPermissionError] = useState(false);

    // Pagination state
    const [currentPage, setCurrentPage] = useState(0);
    const [pageSize, setPageSize] = useState(10);
    const [totalItems, setTotalItems] = useState(0);
    
    // Search state
    const [searchQuery, setSearchQuery] = useState('');
    const [debouncedSearch, setDebouncedSearch] = useState('');

    // Debounce search input
    useEffect(() => {
        const timer = setTimeout(() => {
            setDebouncedSearch(searchQuery);
        }, 300);
        return () => clearTimeout(timer);
    }, [searchQuery]);

    // Load data when pagination or search changes
    useEffect(() => {
        loadCustomers();
    }, [currentPage, pageSize, debouncedSearch]);

    const loadCustomers = async () => {
        try {
            setLoading(true);
            const response = await getAllCustomers(currentPage, pageSize, 'id,asc', debouncedSearch);
            setCustomers(response.data);
            setTotalItems(response.total);
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
            loadCustomers();
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

    const handlePageSizeChange = (newSize: number) => {
        setPageSize(newSize);
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
            header: 'DNI / Pasaporte',
            accessor: (row) => (
                <code className="text-[10px] font-mono bg-gray-100 dark:bg-white/5 px-2 py-1 rounded text-gray-600 dark:text-gray-400 border border-gray-200 dark:border-white/5">
                    {row.licenseId}
                </code>
            )
        },
        {
            header: 'Nacimiento',
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
                    {canDelete && (
                        <Button
                            size="sm"
                            variant="danger"
                            onClick={() => handleDelete(row.id)}
                            iconOnly
                        >
                            <Trash2 size={14} />
                        </Button>
                    )}
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
                    {/* Search Bar */}
                    <div className="mb-4">
                        <div className="relative max-w-md">
                            <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                            <input
                                type="text"
                                placeholder="Buscar por nombre..."
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

                    {/* Page Size Selector */}
                    <div className="flex justify-end mb-4">
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
                        data={customers}
                        columns={columns}
                        isLoading={loading}
                        emptyMessage="No hay clientes registrados"
                        keyExtractor={(item) => item.id}
                    />

                    {/* Pagination Controls */}
                    {totalPages > 0 && (
                        <div className="flex items-center justify-between mt-6 pt-4 border-t border-gray-200 dark:border-white/5">
                            <p className="text-sm text-gray-500 dark:text-gray-400">
                                {totalItems > 0 
                                    ? `Mostrando ${currentPage * pageSize + 1} - ${Math.min((currentPage + 1) * pageSize, totalItems)} de ${totalItems} clientes`
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
