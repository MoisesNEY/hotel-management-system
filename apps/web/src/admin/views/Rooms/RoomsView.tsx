import { useState, useEffect } from 'react';
import { Plus, Edit, Trash2 } from 'lucide-react';
import Table, { type Column } from '../../components/shared/Table';

import Button from '../../components/shared/Button';
import Card from '../../components/shared/Card';
import Modal from '../../components/shared/Modal';
import { getAllRooms, deleteRoom } from '../../../services/admin/roomService';
import { getAllRoomTypes } from '../../../services/admin/roomTypeService';
import type { RoomDTO, RoomTypeDTO } from '../../../types/adminTypes';
import { getRoomStatusConfig } from '../../utils/helpers';
import RoomForm from './RoomForm';

const RoomsView = () => {
    const [rooms, setRooms] = useState<RoomDTO[]>([]);
    const [roomTypes, setRoomTypes] = useState<RoomTypeDTO[]>([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [editingRoom, setEditingRoom] = useState<RoomDTO | null>(null);
    const [statusFilter, setStatusFilter] = useState('ALL');

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        try {
            setLoading(true);
            const [roomsResponse, typesResponse] = await Promise.all([
                getAllRooms(),
                getAllRoomTypes()
            ]);
            setRooms(roomsResponse.data);
            setRoomTypes(typesResponse.data);
        } catch (error) {
            console.error("Error loading rooms", error);
        } finally {
            setLoading(false);
        }
    };

    const handleEdit = (room: RoomDTO) => {
        setEditingRoom(room);
        setShowModal(true);
    };

    const handleDelete = async (id: number) => {
        if (window.confirm('¿Estás seguro de eliminar esta habitación?')) {
            try {
                await deleteRoom(id);
                setRooms(rooms.filter(r => r.id !== id));
            } catch (error) {
                console.error(error);
                alert('No se pudo eliminar la habitación.');
            }
        }
    };

    const handleSuccess = () => {
        setShowModal(false);
        setEditingRoom(null);
        loadData();
    };

    const handleCancel = () => {
        setShowModal(false);
        setEditingRoom(null);
    };

    const filteredRooms = statusFilter === 'ALL'
        ? rooms
        : rooms.filter(room => room.status === statusFilter);

    const columns: Column<RoomDTO>[] = [
        { header: 'ID', accessor: (row) => row.id },
        { 
            header: 'Número', 
            accessor: (row) => <span className="font-bold text-gray-900 dark:text-white">{row.roomNumber}</span>
        },
        { 
            header: 'Tipo', 
            accessor: (row) => (
                <span className="text-sm text-gray-700 dark:text-gray-300">
                    {row.roomType?.name || 'Sin asignar'}
                </span>
            )
        },
        { 
            header: 'Precio', 
            accessor: (row) => (
                <span className="font-semibold text-gray-700 dark:text-gray-300">
                    ${row.roomType?.basePrice || 0}
                </span>
            )
        },
        {
            header: 'Estado',
            accessor: (row) => {
                const config = getRoomStatusConfig(row.status);
                return (
                    <span 
                        className={`px-3 py-1 rounded-full text-xs font-semibold ${config.className}`}
                    >
                        {config.label}
                    </span>
                );
            }
        },
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
                    <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Habitaciones</h1>
                    <p className="text-gray-500 dark:text-gray-400 text-sm">Gestión del inventario de habitaciones</p>
                </div>
                <Button onClick={() => setShowModal(true)} leftIcon={<Plus size={16} />}>
                    Nueva Habitación
                </Button>
            </div>

            <Card>
                {/* Filters */}
                <div className="flex flex-wrap gap-2 mb-6">
                    {['ALL', 'AVAILABLE', 'OCCUPIED', 'MAINTENANCE', 'CLEANING'].map((status) => {
                        const isActive = statusFilter === status;
                        return (
                            <Button
                                key={status}
                                onClick={() => setStatusFilter(status)}
                                variant={isActive ? 'primary' : 'ghost'}
                                size="sm"
                                className={isActive
                                    ? 'shadow-md'
                                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200 border-none shadow-none hover:shadow-none'
                                }
                            >
                                {status === 'ALL' ? 'Todas' : status}
                            </Button>
                        );
                    })}
                </div>

                <Table
                    data={filteredRooms}
                    columns={columns}
                    isLoading={loading}
                    emptyMessage="No se encontraron habitaciones"
                    keyExtractor={(room: RoomDTO) => room.id}
                />
            </Card>

            <Modal
                isOpen={showModal}
                onClose={handleCancel}
                title={editingRoom ? "Editar Habitación" : "Nueva Habitación"}
                size="md"
            >
                <RoomForm
                    initialData={editingRoom}
                    roomTypes={roomTypes}
                    onSuccess={handleSuccess}
                    onCancel={handleCancel}
                />
            </Modal>
        </div>
    );
};

export default RoomsView;
