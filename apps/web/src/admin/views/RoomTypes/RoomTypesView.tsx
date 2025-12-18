import { useState, useEffect } from 'react';
import { Plus, Edit, Trash2 } from 'lucide-react';
import Table, { type Column } from '../../components/shared/Table';
import Button from '../../components/shared/Button';
import Card from '../../components/shared/Card';
import Modal from '../../components/shared/Modal';
import { getAllRoomTypes, deleteRoomType } from '../../../services/admin/roomTypeService';
import type { RoomTypeDTO } from '../../../types/adminTypes';
import { formatCurrency } from '../../utils/helpers';
import RoomTypeForm from './RoomTypeForm';

const RoomTypesView = () => {
    const [roomTypes, setRoomTypes] = useState<RoomTypeDTO[]>([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [editingType, setEditingType] = useState<RoomTypeDTO | null>(null);

    useEffect(() => {
        loadTypes();
    }, []);

    const loadTypes = async () => {
        try {
            const result = await getAllRoomTypes();
            setRoomTypes(result.data);
        } catch (error) {
            console.error("Error loading room types", error);
        } finally {
            setLoading(false);
        }
    };

    const handleEdit = (type: RoomTypeDTO) => {
        setEditingType(type);
        setShowModal(true);
    };

    const handleDelete = async (id: number) => {
        if (window.confirm('¿Estás seguro de eliminar este tipo de habitación?')) {
            try {
                await deleteRoomType(id);
                setRoomTypes(roomTypes.filter(rt => rt.id !== id));
            } catch (error) {
                console.error(error);
                alert('No se pudo eliminar, verifique si hay habitaciones asociadas.');
            }
        }
    };

    const handleSuccess = () => {
        setShowModal(false);
        setEditingType(null);
        loadTypes();
    };

    const handleCancel = () => {
        setShowModal(false);
        setEditingType(null);
    };

    const columns: Column<RoomTypeDTO>[] = [
        { header: 'ID', accessor: (row) => row.id },
        {
            header: 'Nombre',
            accessor: (row) => (
                <div>
                    <div className="font-bold text-gray-900 dark:text-white tracking-tight">{row.name}</div>
                    <div className="text-xs text-gray-500 dark:text-gray-400 font-medium line-clamp-1">
                        {row.description?.substring(0, 50)}{row.description && row.description.length > 50 ? '...' : ''}
                    </div>
                </div>
            )
        },
        {
            header: 'Precio Base',
            accessor: (row) => (
                <span className="font-semibold text-green-600">{formatCurrency(row.basePrice)}</span>
            )
        },
        { header: 'Capacidad', accessor: (row) => `${row.maxCapacity} personas` },
        { header: 'Camas', accessor: (row) => row.beds || '-' },
        { header: 'Área', accessor: (row) => row.area ? `${row.area} m²` : '-' },
        {
            header: 'Acciones',
            accessor: (row) => (
                <div className="flex space-x-2">
                    <Button size="sm" variant="info" onClick={() => handleEdit(row)} iconOnly>
                        <Edit size={14} />
                    </Button>
                    <Button size="sm" variant="danger" onClick={() => handleDelete(row.id)} iconOnly>
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
                    <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Tipos de Habitación</h1>
                    <p className="text-gray-500 dark:text-gray-400 text-sm">Configuración de categorías y precios</p>
                </div>
                <Button onClick={() => setShowModal(true)} leftIcon={<Plus size={16} />}>
                    Nuevo Tipo
                </Button>
            </div>

            <Card>
                <Table
                    data={roomTypes}
                    columns={columns}
                    isLoading={loading}
                    title="Catálogo"
                    emptyMessage="No hay tipos de habitación registrados"
                    keyExtractor={(item) => item.id}
                />
            </Card>

            {/* Modal */}
            <Modal
                isOpen={showModal}
                onClose={handleCancel}
                title={editingType ? "Editar Tipo de Habitación" : "Nuevo Tipo de Habitación"}
                size="lg"
            >
                <RoomTypeForm
                    initialData={editingType}
                    onSuccess={handleSuccess}
                    onCancel={handleCancel}
                />
            </Modal>
        </div>
    );
};

export default RoomTypesView;
