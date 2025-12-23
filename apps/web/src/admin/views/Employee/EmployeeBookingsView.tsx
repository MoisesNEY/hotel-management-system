import { useEffect, useState, useCallback } from 'react';
import Table, { type Column } from '../../components/shared/Table';
import Button from '../../components/shared/Button';
import Badge from '../../components/shared/Badge';
import Card from '../../components/shared/Card';
import Modal from '../../components/shared/Modal';
import { getAllBookings, assignRoom, checkIn, checkOut } from '../../../services/employee/employeeService';
import { getAllRooms } from '../../../services/admin/roomService';
import type { BookingDTO, BookingItemDTO, RoomDTO, BookingStatus } from '../../../types/adminTypes';
import { formatDate, getBookingStatusConfig } from '../../utils/helpers';
import { CheckCircle2, XCircle, AlertTriangle, Home, UserCheck, UserX } from 'lucide-react';

const EmployeeBookingsView = () => {
    // Bookings State
    const [bookings, setBookings] = useState<BookingDTO[]>([]);
    const [bookingsLoading, setBookingsLoading] = useState(true);

    // Assign Room Modal State
    const [showAssignModal, setShowAssignModal] = useState(false);
    const [assigningBookingId, setAssigningBookingId] = useState<number | null>(null);
    const [assigningItemId, setAssigningItemId] = useState<number | null>(null);
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

    const showSuccess = useCallback((title: string, message: string) => {
        setFeedback({ show: true, title, message, type: 'success' });
        setTimeout(() => setFeedback({ ...feedback, show: false }), 3000);
    }, [feedback]);

    const showError = useCallback((title: string, message: string) => {
        setFeedback({ show: true, title, message, type: 'error' });
        setTimeout(() => setFeedback({ ...feedback, show: false }), 5000);
    }, [feedback]);

    // Load data
    useEffect(() => {
        const loadData = async () => {
            try {
                const bookingsData = await getAllBookings();
                setBookings(bookingsData.data);
            } catch (error) {
                console.error('Error loading bookings data:', error);
                showError('Error', 'No se pudieron cargar los datos de reservas');
            } finally {
                setBookingsLoading(false);
            }
        };
        loadData();
    }, [showError]);

    // Assign Room Handlers
    const openAssignModal = async (bookingId: number, itemId: number, roomTypeId: number) => {
        setAssigningBookingId(bookingId);
        setAssigningItemId(itemId);
        setSelectedRoomId('');
        setShowAssignModal(true);
        try {
            const rooms = await getAllRooms();
            setAvailableRooms(rooms.data.filter((room: RoomDTO) => 
                room.status === 'AVAILABLE' && room.roomType.id === roomTypeId
            ));
        } catch (error) {
            console.error('Error loading rooms:', error);
            showError('Error', 'No se pudieron cargar las habitaciones disponibles');
        }
    };

    const handleAssignRoom = async () => {
        if (!assigningBookingId || !assigningItemId || !selectedRoomId) return;

        setAssignLoading(true);
        try {
            await assignRoom(assigningBookingId, {
                bookingItemId: assigningItemId,
                roomId: Number(selectedRoomId)
            });
            showSuccess('Éxito', 'Habitación asignada correctamente');

            // Update local state
            setBookings(bookings.map(booking =>
                booking.id === assigningBookingId
                    ? {
                        ...booking,
                        items: booking.items.map(item =>
                            item.id === assigningItemId
                                ? { ...item, assignedRoom: availableRooms.find(room => room.id === Number(selectedRoomId)) }
                                : item
                        )
                    }
                    : booking
            ));

            setShowAssignModal(false);
        } catch (error) {
            console.error('Error assigning room:', error);
            showError('Error', 'No se pudo asignar la habitación');
        } finally {
            setAssignLoading(false);
        }
    };

    // Check-in Handler
    const handleCheckIn = async (bookingId: number) => {
        try {
            await checkIn(bookingId);
            showSuccess('Check-in', 'Check-in realizado correctamente');

            // Update local state
            setBookings(bookings.map(booking =>
                booking.id === bookingId
                    ? { ...booking, status: 'CHECKED_IN' as BookingStatus }
                    : booking
            ));
        } catch (error) {
            console.error('Error during check-in:', error);
            showError('Error', 'No se pudo realizar el check-in');
        }
    };

    // Check-out Handler
    const handleCheckOut = async (bookingId: number) => {
        try {
            await checkOut(bookingId);
            showSuccess('Check-out', 'Check-out realizado correctamente');

            // Update local state
            setBookings(bookings.map(booking =>
                booking.id === bookingId
                    ? { ...booking, status: 'CHECKED_OUT' as BookingStatus }
                    : booking
            ));
        } catch (error) {
            console.error('Error during check-out:', error);
            showError('Error', 'No se pudo realizar el check-out');
        }
    };

    // Extended Type for Table Rows to handle multi-item views
    interface BookingItemRow extends BookingItemDTO {
        bookingId: number;
        customer: any;
        bookingStatus: BookingStatus;
        checkInDate: string;
        checkOutDate: string;
    }

    const bookingItemRows: BookingItemRow[] = bookings.flatMap(booking =>
        booking.items.map(item => ({
            ...item,
            bookingId: booking.id,
            customer: booking.customer,
            bookingStatus: booking.status,
            checkInDate: booking.checkInDate,
            checkOutDate: booking.checkOutDate
        }))
    );

    // Table Columns for Booking Items (Refactored for individual room management)
    const bookingColumns: Column<BookingItemRow>[] = [
        {
            header: 'Reserva',
            accessor: (item) => (
                <div>
                    <span className="font-mono text-xs text-gray-400">#{item.bookingId}</span>
                    <div className="font-mono text-sm leading-none">{item.id}</div>
                </div>
            )
        },
        {
            header: 'Cliente / Ocupante',
            accessor: (item) => (
                <div>
                    <div className="font-medium">{item.occupantName || `${item.customer.firstName} ${item.customer.lastName}`}</div>
                    <div className="text-xs text-gray-500 dark:text-gray-400">Ref: {item.customer.email}</div>
                </div>
            )
        },
        {
            header: 'Tipo Habitación',
            accessor: (item) => (
                <div className="font-medium text-sm">
                    {item.roomType.name}
                </div>
            )
        },
        {
            header: 'Habitación Asignada',
            accessor: (item) => item.assignedRoom ? (
                <Badge variant="success">{item.assignedRoom.roomNumber}</Badge>
            ) : (
                <span className="text-gray-400 italic text-sm">Pendiente</span>
            )
        },
        {
            header: 'Fechas',
            accessor: (item) => (
                <div className="text-xs">
                    <div>{formatDate(item.checkInDate)}</div>
                    <div className="text-gray-400">al {formatDate(item.checkOutDate)}</div>
                </div>
            )
        },
        {
            header: 'Estado Reserva',
            accessor: (item) => {
                const config = getBookingStatusConfig(item.bookingStatus);
                return <Badge variant={config.variant}>{config.label}</Badge>;
            }
        },
        {
            header: 'Acciones',
            accessor: (item) => (
                <div className="flex gap-2">
                    {['PENDING', 'CONFIRMED'].includes(item.bookingStatus) && !item.assignedRoom && (
                        <Button
                            size="sm"
                            variant="outline"
                            onClick={() => openAssignModal(item.bookingId, item.id, item.roomType.id)}
                            className="text-xs"
                        >
                            <Home className="w-3 h-3 mr-1" />
                            Asignar
                        </Button>
                    )}
                    {['PENDING', 'CONFIRMED'].includes(item.bookingStatus) && item.assignedRoom && (
                        <Button
                            size="sm"
                            variant="success"
                            onClick={() => handleCheckIn(item.bookingId)}
                            className="text-xs"
                        >
                            <UserCheck className="w-3 h-3 mr-1" />
                            Check-in
                        </Button>
                    )}
                    {item.bookingStatus === 'CHECKED_IN' && (
                        <Button
                            size="sm"
                            variant="warning"
                            onClick={() => handleCheckOut(item.bookingId)}
                            className="text-xs"
                        >
                            <UserX className="w-3 h-3 mr-1" />
                            Check-out
                        </Button>
                    )}
                </div>
            )
        }
    ];

    return (
        <div className="content">
            {/* Feedback Modal */}
            <Modal
                isOpen={feedback.show}
                onClose={() => setFeedback({ ...feedback, show: false })}
                title={feedback.title}
                size="sm"
            >
                <div className={`p-4 rounded-lg ${feedback.type === 'success' ? 'bg-green-50 dark:bg-green-900/20 text-green-800 dark:text-green-200' :
                    feedback.type === 'error' ? 'bg-red-50 dark:bg-red-900/20 text-red-800 dark:text-red-200' :
                    'bg-yellow-50 dark:bg-yellow-900/20 text-yellow-800 dark:text-yellow-200'}`}>
                    <div className="flex items-center">
                        {feedback.type === 'success' && <CheckCircle2 className="w-5 h-5 mr-2" />}
                        {feedback.type === 'error' && <XCircle className="w-5 h-5 mr-2" />}
                        {feedback.type === 'warning' && <AlertTriangle className="w-5 h-5 mr-2" />}
                        <span>{feedback.message}</span>
                    </div>
                </div>
            </Modal>

            {/* Assign Room Modal */}
            <Modal
                isOpen={showAssignModal}
                onClose={() => setShowAssignModal(false)}
                title="Asignar Habitación"
            >
                <div className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium mb-2">Seleccionar Habitación Disponible</label>
                        <select
                            value={selectedRoomId}
                            onChange={(e) => setSelectedRoomId(e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                        >
                            <option value="">Seleccionar habitación...</option>
                            {availableRooms.map(room => (
                                <option key={room.id} value={room.id}>
                                    {room.roomNumber} - {room.roomType.name}
                                </option>
                            ))}
                        </select>
                    </div>
                    <div className="flex justify-end gap-2">
                        <Button variant="outline" onClick={() => setShowAssignModal(false)}>
                            Cancelar
                        </Button>
                        <Button
                            variant="primary"
                            onClick={handleAssignRoom}
                            disabled={!selectedRoomId || assignLoading}
                        >
                            {assignLoading ? 'Asignando...' : 'Asignar'}
                        </Button>
                    </div>
                </div>
            </Modal>

            {/* Bookings Section */}
            <div className="mb-8">
                <Card title="Gestión de Reservas" subtitle="Check-in, check-out y asignación de habitaciones por ítem">
                    <Table
                        columns={bookingColumns}
                        data={bookingItemRows}
                        isLoading={bookingsLoading}
                        emptyMessage="No hay habitaciones reservadas disponibles"
                        keyExtractor={(item) => `${item.bookingId}-${item.id}`}
                    />
                </Card>
            </div>
        </div>
    );
};

export default EmployeeBookingsView;