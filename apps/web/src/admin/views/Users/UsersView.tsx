import { useEffect, useState } from 'react';
import Table, { type Column } from '../../components/shared/Table';
import Button from '../../components/shared/Button';
import Badge from '../../components/shared/Badge';
import Card from '../../components/shared/Card';
import Modal from '../../components/shared/Modal';
import { getAllUsers, deleteUser } from '../../../services/admin/userService';
import type { AdminUserDTO } from '../../../types/adminTypes';
import UserForm from './UserForm';
import { formatDate } from '../../utils/helpers';
import { Plus, UserCheck, UserX, Shield, Pencil, Trash2, Search, X, ChevronLeft, ChevronRight } from 'lucide-react';

const roleLabels: Record<string, string> = {
    'ALL': 'Todos',
    'ROLE_ADMIN': 'Administradores',
    'ROLE_EMPLOYEE': 'Empleados',
    'ROLE_CLIENT': 'Clientes',
};

const UsersView = () => {
    const [users, setUsers] = useState<AdminUserDTO[]>([]);
    const [loading, setLoading] = useState(true);
    const [showForm, setShowForm] = useState(false);
    const [editingUser, setEditingUser] = useState<AdminUserDTO | null>(null);
    const [permissionError, setPermissionError] = useState(false);
    const [deleteConfirm, setDeleteConfirm] = useState<AdminUserDTO | null>(null);
    const [deleting, setDeleting] = useState(false);

    // Pagination state
    const [currentPage, setCurrentPage] = useState(0);
    const [pageSize, setPageSize] = useState(10);
    const [totalItems, setTotalItems] = useState(0);
    
    // Search and Filter state
    const [searchQuery, setSearchQuery] = useState('');
    const [debouncedSearch, setDebouncedSearch] = useState('');
    const [roleFilter, setRoleFilter] = useState('ALL');

    // Debounce search input
    useEffect(() => {
        const timer = setTimeout(() => {
            setDebouncedSearch(searchQuery);
        }, 300);
        return () => clearTimeout(timer);
    }, [searchQuery]);

    // Load data when pagination, filter or search changes
    useEffect(() => {
        loadUsers();
    }, [currentPage, pageSize, roleFilter, debouncedSearch]);

    const loadUsers = async () => {
        try {
            setLoading(true);
            const response = await getAllUsers(currentPage, pageSize, 'login,asc');
            
            // Filter by role client-side since JHipster admin API doesn't have role filter
            let filteredUsers = response.data;
            
            if (roleFilter !== 'ALL') {
                filteredUsers = filteredUsers.filter(u => u.authorities?.includes(roleFilter));
            }
            
            // Filter by search (login, name or email)
            if (debouncedSearch.trim()) {
                const query = debouncedSearch.toLowerCase();
                filteredUsers = filteredUsers.filter(u => 
                    u.login?.toLowerCase().includes(query) ||
                    u.firstName?.toLowerCase().includes(query) ||
                    u.lastName?.toLowerCase().includes(query) ||
                    u.email?.toLowerCase().includes(query)
                );
            }
            
            setUsers(filteredUsers);
            setTotalItems(roleFilter === 'ALL' && !debouncedSearch.trim() ? response.total : filteredUsers.length);
        } catch (error: any) {
            console.error("Error loading users", error);
            if (error.response?.status === 403) {
                setPermissionError(true);
            }
        } finally {
            setLoading(false);
        }
    };

    const handleCreate = () => {
        setEditingUser(null);
        setShowForm(true);
    };

    const handleEdit = (user: AdminUserDTO) => {
        setEditingUser(user);
        setShowForm(true);
    };

    const handleFormSuccess = () => {
        setShowForm(false);
        setEditingUser(null);
        loadUsers();
    };

    const handleDeleteClick = (user: AdminUserDTO) => {
        setDeleteConfirm(user);
    };

    const handleDeleteConfirm = async () => {
        if (!deleteConfirm?.login) return;

        setDeleting(true);
        try {
            await deleteUser(deleteConfirm.login);
            setDeleteConfirm(null);
            loadUsers();
        } catch (error) {
            console.error("Error deleting user", error);
            alert('Error al eliminar el usuario');
        } finally {
            setDeleting(false);
        }
    };

    const handlePageSizeChange = (newSize: number) => {
        setPageSize(newSize);
        setCurrentPage(0);
    };

    const handleRoleFilterChange = (role: string) => {
        setRoleFilter(role);
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

    const getRoleVariant = (role: string) => {
        switch (role) {
            case 'ROLE_ADMIN':
                return 'danger';
            case 'ROLE_EMPLOYEE':
                return 'warning';
            case 'ROLE_CLIENT':
                return 'info';
            default:
                return 'default';
        }
    };

    const getRoleLabel = (role: string) => {
        switch (role) {
            case 'ROLE_ADMIN':
                return 'Admin';
            case 'ROLE_EMPLOYEE':
                return 'Empleado';
            case 'ROLE_CLIENT':
                return 'Cliente';
            case 'ROLE_USER':
                return 'Usuario';
            default:
                return role;
        }
    };

    const columns: Column<AdminUserDTO>[] = [
        {
            header: 'Usuario',
            accessor: (row) => (
                <div className="flex items-center gap-2">
                    {row.imageUrl ? (
                        <img src={row.imageUrl} alt={row.login} className="w-8 h-8 rounded-full object-cover" />
                    ) : (
                        <div className="w-8 h-8 rounded-full bg-[#d4af37]/20 flex items-center justify-center text-[#d4af37] font-bold text-xs">
                            {row.login?.charAt(0).toUpperCase()}
                        </div>
                    )}
                    <span className="font-semibold text-gray-900 dark:text-white">{row.login}</span>
                </div>
            )
        },
        {
            header: 'Nombre',
            accessor: (row) => {
                const fullName = [row.firstName, row.lastName].filter(Boolean).join(' ');
                return fullName || <span className="text-gray-400 italic text-xs">Sin nombre</span>;
            }
        },
        {
            header: 'Email',
            accessor: (row) => row.email || <span className="text-gray-400 italic">-</span>
        },
        {
            header: 'Roles',
            accessor: (row) => (
                <div className="flex flex-wrap gap-1">
                    {row.authorities?.map((role) => (
                        <Badge key={role} variant={getRoleVariant(role)} className="text-[10px]">
                            {getRoleLabel(role)}
                        </Badge>
                    ))}
                </div>
            )
        },
        {
            header: 'Estado',
            accessor: (row) => (
                <div className="flex items-center gap-1.5">
                    {row.activated ? (
                        <>
                            <UserCheck size={14} className="text-green-500" />
                            <span className="text-green-600 dark:text-green-400 text-xs font-medium">Activo</span>
                        </>
                    ) : (
                        <>
                            <UserX size={14} className="text-red-500" />
                            <span className="text-red-600 dark:text-red-400 text-xs font-medium">Inactivo</span>
                        </>
                    )}
                </div>
            )
        },
        {
            header: 'Creado',
            accessor: (row) => (
                <span className="text-xs text-gray-500 dark:text-gray-400">
                    {row.createdDate ? formatDate(row.createdDate) : '-'}
                </span>
            )
        },
        {
            header: 'Acciones',
            accessor: (row) => (
                <div className="flex items-center gap-2">
                    <button
                        onClick={() => handleEdit(row)}
                        className="p-1.5 text-gray-500 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-colors"
                        title="Editar"
                    >
                        <Pencil size={16} />
                    </button>
                    <button
                        onClick={() => handleDeleteClick(row)}
                        className="p-1.5 text-gray-500 hover:text-red-600 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                        title="Eliminar"
                    >
                        <Trash2 size={16} />
                    </button>
                </div>
            )
        }
    ];

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center bg-transparent">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Usuarios del Sistema</h1>
                    <p className="text-gray-500 dark:text-gray-400 text-sm">Gestión de cuentas de Keycloak (Admins, Empleados, Clientes)</p>
                </div>
                <Button onClick={handleCreate} variant="primary" leftIcon={<Plus size={16} />}>
                    Nuevo Usuario
                </Button>
            </div>

            {permissionError ? (
                <Card className="p-12 text-center flex flex-col items-center justify-center space-y-4">
                    <div className="w-16 h-16 bg-red-100 dark:bg-red-900/20 text-red-600 dark:text-red-400 rounded-full flex items-center justify-center">
                        <Shield size={32} />
                    </div>
                    <h2 className="text-xl font-bold text-gray-900 dark:text-white">Acceso Denegado (403)</h2>
                    <p className="max-w-md text-gray-500 dark:text-gray-400">
                        No tienes permisos para ver la lista de usuarios. Esta sección solo está disponible para administradores.
                    </p>
                    <Button variant="secondary" onClick={loadUsers}>
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
                                placeholder="Buscar por usuario, nombre o email..."
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

                    {/* Role Filters and Page Size */}
                    <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
                        <div className="flex flex-wrap gap-2">
                            {Object.entries(roleLabels).map(([role, label]) => {
                                const isActive = roleFilter === role;
                                return (
                                    <Button
                                        key={role}
                                        onClick={() => handleRoleFilterChange(role)}
                                        variant={isActive ? 'primary' : 'ghost'}
                                        size="sm"
                                        className={isActive
                                            ? 'shadow-md'
                                            : 'bg-gray-100 dark:bg-white/5 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-white/10 border-none shadow-none hover:shadow-none'
                                        }
                                    >
                                        {label}
                                    </Button>
                                );
                            })}
                        </div>
                        
                        {/* Page Size Selector */}
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
                        data={users}
                        columns={columns}
                        isLoading={loading}
                        emptyMessage="No hay usuarios registrados"
                        keyExtractor={(item) => item.id}
                    />

                    {/* Pagination Controls */}
                    {totalPages > 0 && (
                        <div className="flex items-center justify-between mt-6 pt-4 border-t border-gray-200 dark:border-white/5">
                            <p className="text-sm text-gray-500 dark:text-gray-400">
                                {totalItems > 0 
                                    ? `Mostrando ${currentPage * pageSize + 1} - ${Math.min((currentPage + 1) * pageSize, totalItems)} de ${totalItems} usuarios`
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

            {/* Modal de Creación/Edición */}
            <Modal
                isOpen={showForm}
                onClose={() => { setShowForm(false); setEditingUser(null); }}
                title={editingUser ? "Editar Usuario" : "Nuevo Usuario"}
                size="lg"
            >
                <UserForm
                    initialData={editingUser}
                    onSuccess={handleFormSuccess}
                    onCancel={() => { setShowForm(false); setEditingUser(null); }}
                />
            </Modal>

            {/* Modal de Confirmación de Eliminación */}
            <Modal
                isOpen={!!deleteConfirm}
                onClose={() => setDeleteConfirm(null)}
                title="Confirmar Eliminación"
                size="sm"
            >
                <div className="p-6 space-y-4">
                    <p className="text-gray-700 dark:text-gray-300">
                        ¿Estás seguro de que deseas eliminar al usuario <strong>{deleteConfirm?.login}</strong>?
                    </p>
                    <p className="text-sm text-red-600 dark:text-red-400">
                        Esta acción no se puede deshacer.
                    </p>
                    <div className="flex justify-end gap-3 pt-4 border-t border-gray-200 dark:border-gray-700">
                        <button
                            onClick={() => setDeleteConfirm(null)}
                            disabled={deleting}
                            className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-sm font-bold text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 transition-colors bg-transparent"
                        >
                            Cancelar
                        </button>
                        <button
                            onClick={handleDeleteConfirm}
                            disabled={deleting}
                            className="px-6 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg text-sm font-bold shadow-lg transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {deleting ? 'Eliminando...' : 'Eliminar'}
                        </button>
                    </div>
                </div>
            </Modal>
        </div>
    );
};

export default UsersView;
