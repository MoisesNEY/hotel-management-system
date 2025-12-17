import { useState, useEffect } from 'react';
import Table, { type Column } from '../../components/shared/Table';
import Button from '../../components/shared/Button';
import Badge from '../../components/shared/Badge';
import Card from '../../components/shared/Card';
import Modal from '../../components/shared/Modal';
import { roomsService } from '../../services/api';
import type { Room } from '../../services/api';
import { getStatusColor } from '../../utils/helpers';
import RoomForm from './RoomForm';

const RoomsView = () => {
    const [rooms, setRooms] = useState<Room[]>([]);
    const [loading, setLoading] = useState(true);
    const [statusFilter, setStatusFilter] = useState('ALL');
    const [showModal, setShowModal] = useState(false);
    const [editingRoom, setEditingRoom] = useState<Room | null>(null);

    useEffect(() => {
        loadRooms();
    }, []);

    const loadRooms = async () => {
        try {
            setLoading(true);
            const data = await roomsService.getAll();
            setRooms(data);
        } catch (error) {
            console.error("Error loading rooms", error);
        } finally {
            setLoading(false);
        }
    };

    const handleSuccess = () => {
        setShowModal(false);
        setEditingRoom(null);
        loadRooms();
    };

    const handleCancel = () => {
        setShowModal(false);
        setEditingRoom(null);
    };

    const filteredRooms = statusFilter === 'ALL'
        ? rooms
        : rooms.filter(room => room.status === statusFilter);

    const columns: Column<Room>[] = [
        {
            header: 'ID',
            accessor: (row) => row.id
        },
        {
            header: 'Número',
            accessor: (row) => <span className="font-bold text-gray-800">#{row.roomNumber}</span>
        },
        {
            header: 'Tipo',
            accessor: (row) => row.roomType.name
        },
        {
            header: 'Estado',
            accessor: (row) => (
                <Badge variant={getStatusColor(row.status)}>
                    {row.status}
                </Badge>
            )
        },
        {
            header: 'Acciones',
            accessor: (_row: Room) => (
                <Button size="sm" variant="outline">Detalles</Button>
            )
        }
    ];

    const stats = [
        { label: 'Total Habitaciones', value: rooms.length, color: 'text-blue-600' },
        { label: 'Disponibles', value: rooms.filter(r => r.status === 'AVAILABLE').length, color: 'text-green-600' },
        { label: 'Ocupadas', value: rooms.filter(r => r.status === 'OCCUPIED').length, color: 'text-red-600' },
        { label: 'Mantenimiento', value: rooms.filter(r => r.status === 'MAINTENANCE').length, color: 'text-orange-600' },
    ];

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-gray-800">Gestión de Habitaciones</h1>
                    <p className="text-gray-500 text-sm mt-1">Control de inventario y estados</p>
                </div>
                <Button onClick={() => setShowModal(true)}>Nueva Habitación</Button>
            </div>

            {/* Quick Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {stats.map((stat, i) => (
                    <Card key={i} className="py-3 px-4 border shadow-sm">
                        <p className="text-xs text-gray-500 uppercase font-semibold">{stat.label}</p>
                        <p className={`text-2xl font-bold mt-1 ${stat.color}`}>{stat.value}</p>
                    </Card>
                ))}
            </div>

            <Card className="border shadow-none">
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
                    keyExtractor={(room: Room) => room.id}
                />
            </Card>

            {/* Modal */}
            <Modal
                isOpen={showModal}
                onClose={handleCancel}
                title={editingRoom ? "Editar Habitación" : "Nueva Habitación"}
                size="lg"
            >
                <RoomForm
                    initialData={editingRoom}
                    onSuccess={handleSuccess}
                    onCancel={handleCancel}
                />
            </Modal>
        </div>
    );
};

export default RoomsView;
