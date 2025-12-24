import { useEffect, useState } from 'react';
import Table, { type Column } from '../../components/shared/Table';
import Button from '../../components/shared/Button';
import Badge from '../../components/shared/Badge';
import Card from '../../components/shared/Card';
import Modal from '../../components/shared/Modal';
import { getAllUsers } from '../../../services/admin/userService';
import type { AdminUserDTO } from '../../../types/adminTypes';
import UserForm from './UserForm';
import { formatDate } from '../../utils/helpers';
import { Plus, UserCheck, UserX, Shield, Users } from 'lucide-react';

const UsersView = () => {
    const [users, setUsers] = useState<AdminUserDTO[]>([]);
    const [loading, setLoading] = useState(true);
    const [showForm, setShowForm] = useState(false);
    const [permissionError, setPermissionError] = useState(false);
    const [filter, setFilter] = useState<'all' | 'employees'>('employees');

    useEffect(() => {
        loadUsers();
    }, []);

    const loadUsers = async () => {
        try {
            setLoading(true);
            const response = await getAllUsers(0, 100, 'login,asc');
            setUsers(response.data);
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
        setShowForm(true);
    };

    const handleFormSuccess = () => {
        setShowForm(false);
        loadUsers();
    };

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

    // Filter users based on selection
    const filteredUsers = filter === 'employees'
        ? users.filter(u => u.authorities?.includes('ROLE_EMPLOYEE'))
        : users;

    const columns: Column<AdminUserDTO>[] = [
        {
            header: 'Usuario',
            accessor: (row) => (
                <div className="flex items-center gap-2">
                    {row.imageUrl ? (
                        <img src={row.imageUrl} alt={row.login} className="w-8 h-8 rounded-full object-cover" />
                    ) : (
                        <div className="w-8 h-8 rounded-full bg-gold-500/20 flex items-center justify-center text-gold-500 font-bold text-xs">
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
        }
    ];

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center bg-transparent">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Gestión de Empleados</h1>
                    <p className="text-gray-500 dark:text-gray-400 text-sm">Crear y administrar cuentas de empleados</p>
                </div>
                <Button onClick={handleCreate} variant="primary" leftIcon={<Plus size={16} />}>
                    Nuevo Empleado
                </Button>
            </div>

            {/* Filter tabs */}
            <div className="flex gap-2">
                <button
                    onClick={() => setFilter('employees')}
                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-all flex items-center gap-2 ${filter === 'employees'
                            ? 'bg-gold-500/20 text-gold-600 dark:text-gold-400 border border-gold-500/30'
                            : 'bg-gray-100 dark:bg-white/5 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-white/10'
                        }`}
                >
                    <Shield size={14} />
                    Solo Empleados
                </button>
                <button
                    onClick={() => setFilter('all')}
                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-all flex items-center gap-2 ${filter === 'all'
                            ? 'bg-gold-500/20 text-gold-600 dark:text-gold-400 border border-gold-500/30'
                            : 'bg-gray-100 dark:bg-white/5 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-white/10'
                        }`}
                >
                    <Users size={14} />
                    Todos los Usuarios
                </button>
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
                    <Table
                        data={filteredUsers}
                        columns={columns}
                        isLoading={loading}
                        title={filter === 'employees' ? 'Empleados del Sistema' : 'Todos los Usuarios'}
                        emptyMessage="No hay usuarios registrados"
                        keyExtractor={(item) => item.id}
                    />
                </Card>
            )}

            {/* Modal de Creación */}
            <Modal
                isOpen={showForm}
                onClose={() => setShowForm(false)}
                title="Nuevo Empleado"
                size="lg"
            >
                <UserForm
                    onSuccess={handleFormSuccess}
                    onCancel={() => setShowForm(false)}
                />
            </Modal>
        </div>
    );
};

export default UsersView;
