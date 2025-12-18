import { useEffect, useState } from 'react';
import Table, { type Column } from '../../components/shared/Table';
import Button from '../../components/shared/Button';
import Badge from '../../components/shared/Badge';
import Card from '../../components/shared/Card';
import { getAllBookings, deleteBooking } from '../../../services/admin/bookingService';
import { checkIn, checkOut, assignRoom } from '../../../services/employee/employeeService';
import { getAllRooms } from '../../../services/admin/roomService';
import type { BookingDTO, RoomDTO } from '../../../types/adminTypes';
import { formatCurrency, formatDate, getBookingStatusConfig } from '../../utils/helpers';
import BookingForm from './BookingForm';
import Modal from '../../components/shared/Modal';
import { Edit, Trash2, Plus, CheckCircle2, XCircle, AlertTriangle } from 'lucide-react';

const BookingsView = () => {
    const [bookings, setBookings] = useState<BookingDTO[]>([]);
    const [loading, setLoading] = useState(true);
    const [showForm, setShowForm] = useState(false);
    const [editingBooking, setEditingBooking] = useState<BookingDTO | null>(null);

    // Assign Room State
    const [showAssignModal, setShowAssignModal] = useState(false);
    const [assigningBookingId, setAssigningBookingId] = useState<number | null>(null);
    const [availableRooms, setAvailableRooms] = useState<RoomDTO[]>([]);
    const [selectedRoomId, setSelectedRoomId] = useState<number | string>('');
    const [assignLoading, setAssignLoading] = useState(false);

    // Feedback State
    const [feedback, setFeedback] = useState<{
        show: boolean;
        title: string;
        message: string;
        type: 'success' | 'error' | 'warning';
    }>({ show: false, title: '', message: '', type: 'success' });

    const showSuccess = (title: string, message: string) => {
        setFeedback({ show: true, title, message, type: 'success' });
    };

    const showError = (title: string, message: string) => {
        setFeedback({ show: true, title, message, type: 'error' });
    };

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
            showSuccess('Habitación Asignada', 'La habitación se ha vinculado correctamente a la reserva.');
        } catch (error: any) {
            console.error("Error assigning room", error);
            const serverMsg = error.response?.data?.detail || error.response?.data?.message || 'No se pudo asignar la habitación seleccionada.';
            showError('Error de Asignación', serverMsg);
        } finally {
            setAssignLoading(false);
        }
    };

    const handleCheckIn = async (bookingId: number) => {
        try {
            await checkIn(bookingId);
            loadBookings();
            showSuccess('Check-In Exitoso', 'El huésped ha sido registrado en el hotel.');
        } catch (error: any) {
            console.error("Error during check-in", error);
            const serverMsg = error.response?.data?.detail || error.response?.data?.message || 'Hubo un problema al procesar la entrada del huésped.';
            showError('Error al Realizar Check-In', serverMsg);
        }
    };

    const handleCheckOut = async (bookingId: number) => {
        try {
            await checkOut(bookingId);
            loadBookings();
            showSuccess('Check-Out Completado', 'La estancia ha finalizado correctamente.');
        } catch (error: any) {
            console.error("Error during check-out", error);
            const serverMsg = error.response?.data?.detail || error.response?.data?.message || 'Hubo un problema al procesar la salida del huésped.';
            showError('Error al Realizar Check-Out', serverMsg);
        }
    };

    const handleEdit = (booking: BookingDTO) => {
        setEditingBooking(booking);
        setShowForm(true);
    };

    const handleDelete = async (id: number) => {
        try {
            await deleteBooking(id);
            setBookings(prev => prev.filter(b => b.id !== id));
            showSuccess('Reserva Eliminada', 'El registro ha sido removido del sistema permanentemente.');
        } catch (error: any) {
            console.error("Error deleting booking", error);
            const serverMsg = error.response?.data?.detail || error.response?.data?.message || 'No se pudo completar la eliminación del registro.';
            showError('Error al Eliminar', serverMsg);
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
            const response = await getAllBookings();
            setBookings(response.data);
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
                const firstName = row.customer?.firstName || 'Sin Nombre';
                const lastName = row.customer?.lastName || '';
                const email = row.customer?.email || 'Sin Email';

                return (
                    <div>
                        <div className="font-bold text-gray-900 dark:text-white tracking-tight">
                            {firstName} {lastName}
                        </div>
                        <div className="text-xs text-gray-500 dark:text-gray-400 font-medium">
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
            accessor: (row) => {
                const config = getBookingStatusConfig(row.status);
                return (
                    <Badge variant={config.variant} className="whitespace-nowrap px-4 py-1">
                        {config.label}
                    </Badge>
                );
            }
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
                        <Button size="sm" variant="warning" onClick={() => handleCheckIn(row.id)}>
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
            <div className="flex justify-between items-center bg-transparent">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Reservas</h1>
                    <p className="text-gray-500 dark:text-gray-400 text-sm">Gestión de reservaciones del hotel</p>
                </div>
                {!showForm && (
                    <Button onClick={() => setShowForm(true)} leftIcon={<Plus size={16} />}>
                        Crear Reserva
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
                <div className="space-y-4 p-8">
                    <div>
                        <label className="block text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-widest mb-2 ml-1">
                            Seleccione una habitación disponible
                        </label>
                        <select
                            className="w-full px-4 py-3 bg-white dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-xl text-sm text-gray-900 dark:text-white focus:ring-1 focus:ring-gold-default focus:border-gold-default outline-none transition-all"
                            value={selectedRoomId}
                            onChange={(e) => setSelectedRoomId(e.target.value)}
                        >
                            <option value="" className="dark:bg-[#1c1c1c]">Seleccionar habitación</option>
                            {availableRooms.map(room => (
                                <option key={room.id} value={room.id} className="dark:bg-[#1c1c1c]">
                                    {room.roomNumber} - {room.roomType.name}
                                </option>
                            ))}
                        </select>
                    </div>
                    <div className="flex justify-end gap-3 pt-6 mt-2 border-t border-gray-100 dark:border-white/5">
                        <Button variant="ghost" onClick={() => setShowAssignModal(false)}>
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

            {/* Modal de Feedback Vistoso (Toast alternative) */}
            <Modal
                isOpen={feedback.show}
                onClose={() => setFeedback({ ...feedback, show: false })}
                size="sm"
            >
                <div className="p-10 flex flex-col items-center text-center space-y-6">
                    <div className={`w-20 h-20 rounded-full flex items-center justify-center ${
                        feedback.type === 'success' ? 'bg-emerald-500/10 text-emerald-500' :
                        feedback.type === 'error' ? 'bg-rose-500/10 text-rose-500' :
                        'bg-amber-500/10 text-amber-500'
                    }`}>
                        {feedback.type === 'success' && <CheckCircle2 size={40} />}
                        {feedback.type === 'error' && <XCircle size={40} />}
                        {feedback.type === 'warning' && <AlertTriangle size={40} />}
                    </div>
                    <div>
                        <h3 className="text-xl font-bold text-gray-900 dark:text-white">{feedback.title}</h3>
                        <p className="text-sm text-gray-500 dark:text-gray-400 mt-2 leading-relaxed">
                            {feedback.message}
                        </p>
                    </div>
                    <Button 
                        variant={feedback.type === 'success' ? 'primary' : 'danger'} 
                        className="w-full rounded-2xl py-4"
                        onClick={() => setFeedback({ ...feedback, show: false })}
                    >
                        Entendido
                    </Button>
                </div>
            </Modal>
        </div>
    );
};

export default BookingsView;
