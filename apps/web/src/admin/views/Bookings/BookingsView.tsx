import { useEffect, useState } from 'react';
import Table, { type Column } from '../../components/shared/Table';
import Button from '../../components/shared/Button';
import Badge from '../../components/shared/Badge';
import Card from '../../components/shared/Card';
import { getAllBookings, deleteBooking } from '../../../services/admin/bookingService';
import { checkIn, checkOut, assignRoom } from '../../../services/employee/employeeService';
import { getAllRooms } from '../../../services/admin/roomService';
import { getAllUsers } from '../../../services/admin/userService';
import type { BookingDTO, RoomDTO } from '../../../types/sharedTypes';
import type { AdminUserDTO } from '../../../types/adminTypes';
import { formatCurrency, formatDate, getStatusColor } from '../../utils/helpers';
import BookingForm from './BookingForm';
import Modal from '../../components/shared/Modal';
import { Edit, Trash2 } from 'lucide-react';

const BookingsView = () => {
    const [bookings, setBookings] = useState<BookingDTO[]>([]);
    const [usersMap, setUsersMap] = useState<Record<number, AdminUserDTO>>({});
    const [loading, setLoading] = useState(true);
    const [showForm, setShowForm] = useState(false);
    const [editingBooking, setEditingBooking] = useState<BookingDTO | null>(null);

    // Assign Room State
    const [showAssignModal, setShowAssignModal] = useState(false);
    const [assigningBookingId, setAssigningBookingId] = useState<number | null>(null);
    const [availableRooms, setAvailableRooms] = useState<RoomDTO[]>([]);
    const [selectedRoomId, setSelectedRoomId] = useState<number | string>('');
    const [assignLoading, setAssignLoading] = useState(false);

    // Handlers
    const openAssignModal = async (bookingId: number) => {
        setAssigningBookingId(bookingId);
        setSelectedRoomId('');
        setShowAssignModal(true);
        // Load available rooms
        try {
            const response = await getAllRooms();
            // Filter rooms: must be AVAILABLE and match the booking's room type
            const booking = bookings.find(b => b.id === bookingId);
            if (booking) {
                setAvailableRooms(response.data.filter(r =>
                    r.status === 'AVAILABLE' &&
                    r.roomType.id === booking.roomType.id
                ));
            } else {
                // Fallback if booking not found (shouldn't happen)
                setAvailableRooms(response.data.filter(r => r.status === 'AVAILABLE'));
            }
        } catch (error) {
            console.error("Error loading rooms", error);
        }
    };

    const handleAssignRoom = async () => {
        if (!assigningBookingId || !selectedRoomId) return;
        setAssignLoading(true);
        try {
            await assignRoom(assigningBookingId, Number(selectedRoomId));
            setShowAssignModal(false);
            loadBookings();
            alert('Habitación asignada correctamente');
        } catch (error) {
            console.error("Error assigning room", error);
            alert('Error al asignar habitación');
        } finally {
            setAssignLoading(false);
        }
    };

    const handleCheckIn = async (bookingId: number) => {
        if (!confirm('¿Confirmar Check-In?')) return;
        try {
            await checkIn(bookingId);
            loadBookings();
        } catch (error) {
            console.error("Error during check-in", error);
            alert('Error al realizar Check-In');
        }
    };

    const handleCheckOut = async (bookingId: number) => {
        if (!confirm('¿Confirmar Check-Out?')) return;
        try {
            await checkOut(bookingId);
            loadBookings();
        } catch (error) {
            console.error("Error during check-out", error);
            alert('Error al realizar Check-Out');
        }
    };

    const handleEdit = (booking: BookingDTO) => {
        setEditingBooking(booking);
        setShowForm(true);
    };

    const handleDelete = async (id: number) => {
        if (window.confirm('¿Estás seguro de eliminar esta reserva?')) {
            try {
                await deleteBooking(id);
                setBookings(prev => prev.filter(b => b.id !== id));
            } catch (error) {
                console.error("Error deleting booking", error);
                alert('No se pudo eliminar la reserva');
            }
        }
    };

    const handleFormSuccess = () => {
        setShowForm(false);
        setEditingBooking(null);
        loadBookings();
    };

    const handleFormCancel = () => {
        setShowForm(false);
        setEditingBooking(null);
    };

    useEffect(() => {
        loadBookings();
    }, []);

    const loadBookings = async () => {
        try {
            setLoading(true);
            const [bookingsParams, usersParams] = await Promise.all([
                getAllBookings(),
                getAllUsers(0, 100) // Fetch top 100 users for lookup
            ]);

            setBookings(bookingsParams.data);

            // Create User Map
            const map: Record<number, AdminUserDTO> = {};
            usersParams.data.forEach(u => map[u.id] = u);
            setUsersMap(map);

        } catch (error) {
            console.error("Error loading data", error);
        } finally {
            setLoading(false);
        }
    };

    const columns: Column<BookingDTO>[] = [
        {
            header: 'ID',
            accessor: (row) => row.id
        },
        {
            header: 'Cliente',
            accessor: (row) => {
                // Stitch user data
                const user = usersMap[row.customer.id];
                const firstName = user?.firstName || row.customer?.firstName || 'Sin Nombre';
                const lastName = user?.lastName || row.customer?.lastName || '';
                const email = user?.email || row.customer?.email || 'Sin Email';

                return (
                    <div>
                        <div className="font-medium text-gray-900">
                            {firstName} {lastName}
                        </div>
                        <div className="text-xs text-gray-500">
                            {email}
                        </div>
                    </div>
                );
            }
        },
        {
            header: 'Check-In',
            accessor: (row) => formatDate(row.checkInDate)
        },
        {
            header: 'Check-Out',
            accessor: (row) => formatDate(row.checkOutDate)
        },
        {
            header: 'Hab.',
            accessor: (row) => row.assignedRoom ? (
                <Badge variant="success">#{row.assignedRoom.roomNumber}</Badge>
            ) : (
                <span className="text-gray-400 text-xs">Sin asignar</span>
            )
        },
        {
            header: 'Estado',
            accessor: (row) => <Badge variant={getStatusColor(row.status)}>{row.status}</Badge>
        },
        {
            header: 'Total',
            accessor: (row) => (
                <span className="font-semibold text-green-600">
                    {row.totalPrice ? formatCurrency(row.totalPrice) : 'N/A'}
                </span>
            )
        },
        {
            header: 'Acciones',
            accessor: (row) => (
                <div className="flex gap-2">
                    {!row.assignedRoom && row.status !== 'CANCELLED' && row.status !== 'CHECKED_OUT' && (
                        <Button size="sm" variant="outline" onClick={() => openAssignModal(row.id)}>
                            Asignar
                        </Button>
                    )}
                    {row.status === 'CONFIRMED' && row.assignedRoom && (
                        <Button size="sm" variant="primary" onClick={() => handleCheckIn(row.id)}>
                            Check-In
                        </Button>
                    )}
                    {row.status === 'CHECKED_IN' && (
                        <Button size="sm" variant="warning" onClick={() => handleCheckOut(row.id)}>
                            Check-Out
                        </Button>
                    )}
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
                    <h1 className="text-2xl font-bold text-gray-800">Reservas</h1>
                    <p className="text-gray-600">Gestión de reservaciones del hotel</p>
                </div>
                {!showForm && (
                    <Button onClick={() => setShowForm(true)}>
                        + Crear Reserva
                    </Button>
                )}
            </div>

            <Card className="card-plain">
                <Table
                    data={bookings}
                    columns={columns}
                    isLoading={loading}
                    title="Listado de Reservas"
                    emptyMessage="No hay reservas registradas"
                    keyExtractor={(item) => item.id}
                />
            </Card>

            {/* Modal de Creación/Edición */}
            <Modal
                isOpen={showForm}
                onClose={handleFormCancel}
                title={editingBooking ? "Editar Reserva" : "Nueva Reserva"}
                size="lg"
            >
                <BookingForm
                    initialData={editingBooking}
                    onSuccess={handleFormSuccess}
                    onCancel={handleFormCancel}
                />
            </Modal>
            {/* Modal de Asignación de Habitación */}
            <Modal
                isOpen={showAssignModal}
                onClose={() => setShowAssignModal(false)}
                title="Asignar Habitación"
            >
                <div className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Seleccione una habitación disponible
                        </label>
                        <select
                            className="w-full border-gray-300 rounded-md shadow-sm p-2 border"
                            value={selectedRoomId}
                            onChange={(e) => setSelectedRoomId(e.target.value)}
                        >
                            <option value="">-- Seleccionar --</option>
                            {availableRooms.map(room => (
                                <option key={room.id} value={room.id}>
                                    {room.roomNumber} - {room.roomType.name}
                                </option>
                            ))}
                        </select>
                    </div>
                    <div className="flex justify-end gap-2 pt-4">
                        <Button variant="outline" onClick={() => setShowAssignModal(false)}>
                            Cancelar
                        </Button>
                        <Button
                            disabled={!selectedRoomId || assignLoading}
                            onClick={handleAssignRoom}
                        >
                            {assignLoading ? 'Asignando...' : 'Guardar'}
                        </Button>
                    </div>
                </div>
            </Modal>
        </div>
    );
};

export default BookingsView;
