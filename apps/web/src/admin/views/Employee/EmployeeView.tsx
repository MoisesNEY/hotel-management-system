import { useEffect, useState, useCallback } from 'react';
import Table, { type Column } from '../../components/shared/Table';
import Button from '../../components/shared/Button';
import Badge from '../../components/shared/Badge';
import Card from '../../components/shared/Card';
import Modal from '../../components/shared/Modal';
import { getAllBookings, getAllServiceRequests, assignRoom, checkIn, checkOut, updateServiceRequestStatus } from '../../../services/employee/employeeService';
import { getAllRooms } from '../../../services/admin/roomService';
import type { BookingDTO, ServiceRequestDTO, RoomDTO, BookingStatus, RequestStatus } from '../../../types/adminTypes';
import { formatDate, getBookingStatusConfig, getRequestStatusConfig } from '../../utils/helpers';
import { CheckCircle2, XCircle, AlertTriangle, Home, Wrench, UserCheck, UserX } from 'lucide-react';

const EmployeeView = () => {

    // Bookings State
    const [bookings, setBookings] = useState<BookingDTO[]>([]);
    const [bookingsLoading, setBookingsLoading] = useState(true);

    // Service Requests State
    const [serviceRequests, setServiceRequests] = useState<ServiceRequestDTO[]>([]);
    const [serviceRequestsLoading, setServiceRequestsLoading] = useState(true);

    // Assign Room Modal State
    const [showAssignModal, setShowAssignModal] = useState(false);
    const [assigningBookingId, setAssigningBookingId] = useState<number | null>(null);
    const [availableRooms, setAvailableRooms] = useState<RoomDTO[]>([]);
    const [selectedRoomId, setSelectedRoomId] = useState<number | string>('');
    const [assignLoading, setAssignLoading] = useState(false);

    // Update Service Request Status Modal State
    const [showStatusModal, setShowStatusModal] = useState(false);
    const [updatingRequestId, setUpdatingRequestId] = useState<number | null>(null);
    const [selectedStatus, setSelectedStatus] = useState<RequestStatus | ''>('');
    const [statusUpdateLoading, setStatusUpdateLoading] = useState(false);

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
                const [bookingsData, serviceRequestsData] = await Promise.all([
                    getAllBookings(),
                    getAllServiceRequests()
                ]);
                setBookings(bookingsData.data);
                setServiceRequests(serviceRequestsData.data);
            } catch (error) {
                console.error('Error loading employee data:', error);
                showError('Error', 'No se pudieron cargar los datos');
            } finally {
                setBookingsLoading(false);
                setServiceRequestsLoading(false);
            }
        };
        loadData();
    }, [showError]);

    // Assign Room Handlers
    const openAssignModal = async (bookingId: number) => {
        setAssigningBookingId(bookingId);
        setSelectedRoomId('');
        setShowAssignModal(true);
        try {
            const rooms = await getAllRooms();
            setAvailableRooms(rooms.data.filter((room: RoomDTO) => room.status === 'AVAILABLE'));
        } catch (error) {
            console.error('Error loading rooms:', error);
            showError('Error', 'No se pudieron cargar las habitaciones disponibles');
        }
    };

    const handleAssignRoom = async () => {
        if (!assigningBookingId || !selectedRoomId) return;

        setAssignLoading(true);
        try {
            await assignRoom(assigningBookingId, Number(selectedRoomId));
            showSuccess('Éxito', 'Habitación asignada correctamente');

            // Update local state
            setBookings(bookings.map(booking =>
                booking.id === assigningBookingId
                    ? { ...booking, assignedRoom: availableRooms.find(room => room.id === Number(selectedRoomId)) }
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

    // Service Request Status Update Handlers
    const openStatusModal = (requestId: number) => {
        setUpdatingRequestId(requestId);
        setSelectedStatus('');
        setShowStatusModal(true);
    };

    const handleUpdateStatus = async () => {
        if (!updatingRequestId || !selectedStatus) return;

        setStatusUpdateLoading(true);
        try {
            await updateServiceRequestStatus(updatingRequestId, selectedStatus);
            showSuccess('Estado Actualizado', 'Estado del servicio actualizado correctamente');

            // Update local state
            setServiceRequests(serviceRequests.map(request =>
                request.id === updatingRequestId
                    ? { ...request, status: selectedStatus }
                    : request
            ));

            setShowStatusModal(false);
        } catch (error) {
            console.error('Error updating service request status:', error);
            showError('Error', 'No se pudo actualizar el estado del servicio');
        } finally {
            setStatusUpdateLoading(false);
        }
    };

    // Table Columns for Bookings
    const bookingColumns: Column<BookingDTO>[] = [
        {
            header: 'ID',
            accessor: (booking) => (
                <span className="font-mono text-sm">{booking.id}</span>
            )
        },
        {
            header: 'Cliente',
            accessor: (booking) => (
                <div>
                    <div className="font-medium">{booking.customer.firstName} {booking.customer.lastName}</div>
                    <div className="text-sm text-gray-500 dark:text-gray-400">{booking.customer.email}</div>
                </div>
            )
        },
        {
            header: 'Tipo Habitación',
            accessor: (booking) => booking.roomType.name
        },
        {
            header: 'Habitación',
            accessor: (booking) => booking.assignedRoom ? booking.assignedRoom.roomNumber : 'No asignada'
        },
        {
            header: 'Fechas',
            accessor: (booking) => (
                <div className="text-sm">
                    <div>Check-in: {formatDate(booking.checkInDate)}</div>
                    <div>Check-out: {formatDate(booking.checkOutDate)}</div>
                </div>
            )
        },
        {
            header: 'Estado',
            accessor: (booking) => {
                const config = getBookingStatusConfig(booking.status);
                return <Badge variant={config.variant}>{config.label}</Badge>;
            }
        },
        {
            header: 'Acciones',
            accessor: (booking) => (
                <div className="flex gap-2">
                    {booking.status === 'CONFIRMED' && !booking.assignedRoom && (
                        <Button
                            size="sm"
                            variant="outline"
                            onClick={() => openAssignModal(booking.id)}
                            className="text-xs"
                        >
                            <Home className="w-3 h-3 mr-1" />
                            Asignar
                        </Button>
                    )}
                    {booking.status === 'CONFIRMED' && booking.assignedRoom && (
                        <Button
                            size="sm"
                            variant="success"
                            onClick={() => handleCheckIn(booking.id)}
                            className="text-xs"
                        >
                            <UserCheck className="w-3 h-3 mr-1" />
                            Check-in
                        </Button>
                    )}
                    {booking.status === 'CHECKED_IN' && (
                        <Button
                            size="sm"
                            variant="warning"
                            onClick={() => handleCheckOut(booking.id)}
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

    // Table Columns for Service Requests
    const serviceRequestColumns: Column<ServiceRequestDTO>[] = [
        {
            header: 'ID',
            accessor: (request) => (
                <span className="font-mono text-sm">{request.id}</span>
            )
        },
        {
            header: 'Servicio',
            accessor: (request) => request.service.name
        },
        {
            header: 'Reserva',
            accessor: (request) => (
                <div>
                    <div className="font-medium">#{request.booking.id}</div>
                    <div className="text-sm text-gray-500 dark:text-gray-400">
                        {request.booking.customer.firstName} {request.booking.customer.lastName}
                    </div>
                </div>
            )
        },
        {
            header: 'Fecha Solicitud',
            accessor: (request) => formatDate(request.requestDate)
        },
        {
            header: 'Detalles',
            accessor: (request) => request.details || 'Sin detalles'
        },
        {
            header: 'Estado',
            accessor: (request) => {
                const config = getRequestStatusConfig(request.status);
                return <Badge variant={config.variant}>{config.label}</Badge>;
            }
        },
        {
            header: 'Acciones',
            accessor: (request) => (
                <Button
                    size="sm"
                    variant="outline"
                    onClick={() => openStatusModal(request.id)}
                    className="text-xs"
                >
                    <Wrench className="w-3 h-3 mr-1" />
                    Actualizar Estado
                </Button>
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

            {/* Update Status Modal */}
            <Modal
                isOpen={showStatusModal}
                onClose={() => setShowStatusModal(false)}
                title="Actualizar Estado del Servicio"
            >
                <div className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium mb-2">Nuevo Estado</label>
                        <select
                            value={selectedStatus}
                            onChange={(e) => setSelectedStatus(e.target.value as RequestStatus)}
                            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                        >
                            <option value="">Seleccionar estado...</option>
                            <option value="OPEN">Abierto</option>
                            <option value="IN_PROGRESS">En Progreso</option>
                            <option value="COMPLETED">Completado</option>
                            <option value="REJECTED">Rechazado</option>
                        </select>
                    </div>
                    <div className="flex justify-end gap-2">
                        <Button variant="outline" onClick={() => setShowStatusModal(false)}>
                            Cancelar
                        </Button>
                        <Button
                            variant="primary"
                            onClick={handleUpdateStatus}
                            disabled={!selectedStatus || statusUpdateLoading}
                        >
                            {statusUpdateLoading ? 'Actualizando...' : 'Actualizar'}
                        </Button>
                    </div>
                </div>
            </Modal>

            {/* Bookings Section */}
            <div className="mb-8">
                <Card title="Gestión de Reservas" subtitle="Check-in, check-out y asignación de habitaciones">
                    <Table
                        columns={bookingColumns}
                        data={bookings}
                        isLoading={bookingsLoading}
                        emptyMessage="No hay reservas disponibles"
                        keyExtractor={(item) => item.id}
                    />
                </Card>
            </div>

            {/* Service Requests Section */}
            <div className="mb-8">
                <Card title="Solicitudes de Servicio" subtitle="Actualizar estado de servicios solicitados">
                    <Table
                        columns={serviceRequestColumns}
                        data={serviceRequests}
                        isLoading={serviceRequestsLoading}
                        emptyMessage="No hay solicitudes de servicio"
                        keyExtractor={(item) => item.id}
                    />
                </Card>
            </div>
        </div>
    );
};

export default EmployeeView;