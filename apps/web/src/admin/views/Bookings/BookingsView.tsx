import { useEffect, useState } from 'react';
import Table, { type Column } from '../../components/shared/Table';
import Button from '../../components/shared/Button';
import Badge from '../../components/shared/Badge';
import Card from '../../components/shared/Card';
import { getAllBookings } from '../../../services/admin/bookingService';
import { checkIn, checkOut, assignRoom } from '../../../services/employee/employeeService';
import { getAllRooms } from '../../../services/admin/roomService';
import type { BookingDTO, RoomDTO } from '../../../types/sharedTypes';
import { formatCurrency, formatDate, getStatusColor } from '../../utils/helpers';
import BookingForm from './BookingForm';
import Modal from '../../components/shared/Modal';

const BookingsView = () => {
    const [bookings, setBookings] = useState<BookingDTO[]>([]);
    const [loading, setLoading] = useState(true);
    const [showForm, setShowForm] = useState(false);

    // Assign Room State
    const [showAssignModal, setShowAssignModal] = useState(false);
    const [assigningBookingId, setAssigningBookingId] = useState<number | null>(null);
    const [availableRooms, setAvailableRooms] = useState<RoomDTO[]>([]);
    const [selectedRoomId, setSelectedRoomId] = useState<number | string>('');
    const [assignLoading, setAssignLoading] = useState(false);

    useEffect(() => {
        loadBookings();
    }, []);

    const loadBookings = async () => {
        try {
            setLoading(true);
            const response = await getAllBookings(0, 50); // Fetching first 50 for now
            setBookings(response.data);
        } catch (error) {
            console.error("Error loading bookings", error);
        } finally {
            setLoading(false);
        }
    };

    const handleCheckIn = async (id: number) => {
        if (!confirm('¿Confirmar Check-In?')) return;
        try {
            await checkIn(id);
            loadBookings();
        } catch (e) {
            console.error("Check-in failed", e);
            alert("Error al realizar Check-in");
        }
    };

    const handleCheckOut = async (id: number) => {
        if (!confirm('¿Confirmar Check-Out?')) return;
        try {
            await checkOut(id);
            loadBookings();
        } catch (e) {
            console.error("Check-out failed", e);
            alert("Error al realizar Check-out");
        }
    };

    const openAssignModal = async (bookingId: number) => {
        setAssigningBookingId(bookingId);
        setAssignLoading(true);
        setShowAssignModal(true);
        try {
            const response = await getAllRooms(0, 100);
            // Filter only available rooms? For now showing all.
            setAvailableRooms(response.data.filter(r => r.status === 'AVAILABLE'));
        } catch (e) {
            console.error("Error loading rooms", e);
        } finally {
            setAssignLoading(false);
        }
    };

    const handleAssignRoom = async () => {
        if (!assigningBookingId || !selectedRoomId) return;
        try {
            setAssignLoading(true);
            await assignRoom(assigningBookingId, Number(selectedRoomId));
            setShowAssignModal(false);
            setAssigningBookingId(null);
            setSelectedRoomId('');
            loadBookings();
        } catch (e) {
            console.error("Assign room failed", e);
            alert("Error al asignar habitación");
        } finally {
            setAssignLoading(false);
        }
    };

    const columns: Column<BookingDTO>[] = [
        {
            header: 'ID',
            accessor: (row) => row.id
        },
        {
            header: 'Cliente',
            accessor: (row) => (
                <div>
                    <div className="font-medium text-gray-900">
                        {row.customer.firstName} {row.customer.lastName}
                    </div>
                </div>
            )
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
                onClose={() => setShowForm(false)}
                title="Gestión de Reserva"
                size="lg"
            >
                <BookingForm
                    onSuccess={() => {
                        setShowForm(false);
                        loadBookings();
                    }}
                    onCancel={() => setShowForm(false)}
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
