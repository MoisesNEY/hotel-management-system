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
import { Plus, UserCheck, UserX, Shield, Pencil, Trash2 } from 'lucide-react';

const UsersView = () => {
    const [users, setUsers] = useState<AdminUserDTO[]>([]);
    const [loading, setLoading] = useState(true);
    const [showForm, setShowForm] = useState(false);
    const [editingUser, setEditingUser] = useState<AdminUserDTO | null>(null);
    const [permissionError, setPermissionError] = useState(false);
    const [deleteConfirm, setDeleteConfirm] = useState<AdminUserDTO | null>(null);
    const [deleting, setDeleting] = useState(false);

    useEffect(() => {
        loadUsers();
    }, []);

    const loadUsers = async () => {
        try {
            setLoading(true);
            const response = await getAllUsers(0, 100, 'login,asc');
            // Filter only employees
            const employees = response.data.filter(u => u.authorities?.includes('ROLE_EMPLOYEE'));
            setUsers(employees);
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
                    <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Gestión de Empleados</h1>
                    <p className="text-gray-500 dark:text-gray-400 text-sm">Crear, editar y eliminar cuentas de empleados</p>
                </div>
                <Button onClick={handleCreate} variant="primary" leftIcon={<Plus size={16} />}>
                    Nuevo Empleado
                </Button>
            </div>

            {permissionError ? (
                <Card className="p-12 text-center flex flex-col items-center justify-center space-y-4">
                    <div className="w-16 h-16 bg-red-100 dark:bg-red-900/20 text-red-600 dark:text-red-400 rounded-full flex items-center justify-center">
                        <Shield size={32} />
                    </div>
                    <h2 className="text-xl font-bold text-gray-900 dark:text-white">Acceso Denegado (403)</h2>
                    <p className="max-w-md text-gray-500 dark:text-gray-400">
                        No tienes permisos para ver la lista de empleados. Esta sección solo está disponible para administradores.
                    </p>
                    <Button variant="secondary" onClick={loadUsers}>
                        Reintentar
                    </Button>
                </Card>
            ) : (
                <Card className="card-plain">
                    <Table
                        data={users}
                        columns={columns}
                        isLoading={loading}
                        title="Empleados del Sistema"
                        emptyMessage="No hay empleados registrados"
                        keyExtractor={(item) => item.id}
                    />
                </Card>
            )}

            {/* Modal de Creación/Edición */}
            <Modal
                isOpen={showForm}
                onClose={() => { setShowForm(false); setEditingUser(null); }}
                title={editingUser ? "Editar Empleado" : "Nuevo Empleado"}
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
