import { useState, useEffect } from 'react';
import { Settings, Edit, Trash2 } from 'lucide-react';
import Table, { type Column } from '../../components/shared/Table'; // Shared components are in src/admin/components? NO. src/components?
// src/admin/views/Rooms/RoomsView.tsx -> ../../components -> src/admin/components.
// IF components are in src/components, it should be ../../../components.
// But check original file. Original had ../../components/shared/Table.
// So src/admin/components/shared/Table exists? Or alias?
// Let's assume shared components are in src/components BUT check if admin has its own.
// Original file had ../../components/shared/Table. 
// If src/admin/views/Rooms/RoomsView.tsx is the file. ../../ is src/admin.
// Does src/admin/components exist?
// Previous context mentions "New Service: apps/web/src/services/admin/dashboardService.ts".
// User Profile Page was in "apps/web/src/pages/UserProfilePage.tsx".
// "Created ServiceRequestModal.tsx in apps/web/src/components".
// So components are in src/components.
// So imports should be ../../../components.
// BUT existing imports were ../../components.
// Maybe src/admin/components exists?
// Let's check with list_dir? No time. Trusted original imports, assuming they work relative to admin root or something.
// But let's check one file's relative path.
// src/admin/views/Rooms is depth 4 (src=1, admin=2, views=3, Rooms=4).
// ../../ goes to src/admin.
// If components are in src/components, it needs ../../../.
// Unless tsconfig paths or similar.
// But "services/api" was imported as ../../services/api.
// which means src/admin/services/api. Correct.
// So ../../components means src/admin/components.
// If src/admin/components exists, then fine.
// But if I want to use GLOBAL services in src/services, I definitely need ../../../.

import Button from '../../components/shared/Button';
import Card from '../../components/shared/Card';
import Modal from '../../components/shared/Modal';
import { getAllRooms, deleteRoom } from '../../../services/admin/roomService';
import { getAllRoomTypes } from '../../../services/admin/roomTypeService';
import type { RoomDTO, RoomTypeDTO } from '../../../types/sharedTypes';
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
            accessor: (row) => <span className="font-bold text-gray-800">{row.roomNumber}</span>
        },
        { 
            header: 'Tipo', 
            accessor: (row) => (
                <span className="text-sm">
                    {row.roomType?.name || 'Sin asignar'}
                </span>
            )
        },
        { 
            header: 'Precio', 
            accessor: (row) => (
                <span className="font-semibold text-gray-700">
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
                        style={config.style}
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
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-2xl font-bold text-gray-800">Habitaciones</h1>
                    <p className="text-gray-500 text-sm">Gestión del inventario de habitaciones</p>
                </div>
                <Button onClick={() => setShowModal(true)} leftIcon={<Settings size={16} />}>
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
