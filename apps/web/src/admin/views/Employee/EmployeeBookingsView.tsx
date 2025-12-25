import { useEffect, useState, useCallback } from 'react';
import Table, { type Column } from '../../components/shared/Table';
import Button from '../../components/shared/Button';
import Badge from '../../components/shared/Badge';
import Card from '../../components/shared/Card';
import Modal from '../../components/shared/Modal';
import { getAllBookings, assignRoom, checkIn, checkOut } from '../../../services/employee/employeeService';
import { getAllRooms } from '../../../services/admin/roomService';
import type { BookingDTO, BookingItemDTO, RoomDTO, BookingStatus } from '../../../types/adminTypes';
import { formatDate } from '../../utils/helpers';
import { CheckCircle2, XCircle, AlertTriangle, Home, UserCheck, UserX, ChevronLeft, ChevronRight, Search, X } from 'lucide-react';

// Only show bookings that are relevant for check-in/check-out flow
type ActionMode = 'CHECK_IN' | 'CHECK_OUT';

const EmployeeBookingsView = () => {
    // Bookings State
    const [bookings, setBookings] = useState<BookingDTO[]>([]);
    const [bookingsLoading, setBookingsLoading] = useState(true);

    // Pagination state
    const [currentPage, setCurrentPage] = useState(0);
    const [pageSize, setPageSize] = useState(10);
    const [totalItems, setTotalItems] = useState(0);
    
    // Search and Filter state
    const [searchQuery, setSearchQuery] = useState('');
    const [debouncedSearch, setDebouncedSearch] = useState('');
    const [actionMode, setActionMode] = useState<ActionMode>('CHECK_IN');

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
    }, []);

    const showError = useCallback((title: string, message: string) => {
        setFeedback({ show: true, title, message, type: 'error' });
    }, []);

    // Debounce search input
    useEffect(() => {
        const timer = setTimeout(() => {
            setDebouncedSearch(searchQuery);
        }, 300);
        return () => clearTimeout(timer);
    }, [searchQuery]);

    // Load data when pagination, filter or search changes
    useEffect(() => {
        loadData();
    }, [currentPage, pageSize, actionMode, debouncedSearch]);

    const loadData = async () => {
        try {
            setBookingsLoading(true);
            // Filter by status based on action mode
            const statusFilter = actionMode === 'CHECK_IN' ? 'CONFIRMED' : 'CHECKED_IN';
            const bookingsData = await getAllBookings(currentPage, pageSize, 'id,desc', statusFilter, debouncedSearch);
            setBookings(bookingsData.data);
            setTotalItems(bookingsData.totalElements);
        } catch (error) {
            console.error('Error loading bookings data:', error);
            showError('Error', 'No se pudieron cargar los datos de reservas');
        } finally {
            setBookingsLoading(false);
        }
    };

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
            loadData(); // Reload to remove from list
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
            loadData(); // Reload to remove from list
        } catch (error) {
            console.error('Error during check-out:', error);
            showError('Error', 'No se pudo realizar el check-out');
        }
    };

    const handlePageSizeChange = (newSize: number) => {
        setPageSize(newSize);
        setCurrentPage(0);
    };

    const handleModeChange = (mode: ActionMode) => {
        setActionMode(mode);
        setCurrentPage(0);
    };

    const handleSearchChange = (value: string) => {
        setSearchQuery(value);
        setCurrentPage(0);
    };

    const clearSearch = () => {
        setSearchQuery('');
        setCurrentPage(0);
    };

    const totalPages = Math.ceil(totalItems / pageSize);

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

    // Table Columns for Booking Items
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
                    <div className="font-medium">{item.occupantName || `${item.customer?.firstName} ${item.customer?.lastName}`}</div>
                    <div className="text-xs text-gray-500 dark:text-gray-400">{item.customer?.email}</div>
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
            header: 'Habitación',
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
            header: 'Acciones',
            accessor: (item) => (
                <div className="flex gap-2">
                    {actionMode === 'CHECK_IN' && !item.assignedRoom && (
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
                    {actionMode === 'CHECK_IN' && item.assignedRoom && (
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
                    {actionMode === 'CHECK_OUT' && (
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
        <div className="space-y-6">
            <div className="flex justify-between items-center bg-transparent">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Check-in / Check-out</h1>
                    <p className="text-gray-500 dark:text-gray-400 text-sm">Gestión de entradas y salidas de huéspedes</p>
                </div>
            </div>

            <Card className="card-plain">
                {/* Search Bar */}
                <div className="mb-4">
                    <div className="relative max-w-md">
                        <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                        <input
                            type="text"
                            placeholder="Buscar por nombre de cliente..."
                            value={searchQuery}
                            onChange={(e) => handleSearchChange(e.target.value)}
                            className="w-full pl-10 pr-10 py-2 rounded-lg border border-gray-300 dark:border-white/10 bg-white dark:bg-black/20 text-gray-900 dark:text-white placeholder-gray-400 focus:ring-2 focus:ring-[#d4af37] focus:border-transparent outline-none transition-all"
                        />
                        {searchQuery && (
                            <button
                                onClick={clearSearch}
                                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
                            >
                                <X size={16} />
                            </button>
                        )}
                    </div>
                </div>

                {/* Mode Tabs and Page Size */}
                <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
                    <div className="flex gap-2">
                        <Button
                            onClick={() => handleModeChange('CHECK_IN')}
                            variant={actionMode === 'CHECK_IN' ? 'primary' : 'ghost'}
                            size="sm"
                            className={actionMode === 'CHECK_IN'
                                ? 'shadow-md'
                                : 'bg-gray-100 dark:bg-white/5 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-white/10 border-none shadow-none'
                            }
                        >
                            <UserCheck className="w-4 h-4 mr-2" />
                            Check-in (Confirmadas)
                        </Button>
                        <Button
                            onClick={() => handleModeChange('CHECK_OUT')}
                            variant={actionMode === 'CHECK_OUT' ? 'primary' : 'ghost'}
                            size="sm"
                            className={actionMode === 'CHECK_OUT'
                                ? 'shadow-md'
                                : 'bg-gray-100 dark:bg-white/5 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-white/10 border-none shadow-none'
                            }
                        >
                            <UserX className="w-4 h-4 mr-2" />
                            Check-out (Hospedados)
                        </Button>
                    </div>
                    
                    {/* Page Size Selector */}
                    <div className="flex items-center gap-2">
                        <span className="text-sm text-gray-500 dark:text-gray-400">Mostrar:</span>
                        <select
                            value={pageSize}
                            onChange={(e) => handlePageSizeChange(Number(e.target.value))}
                            className="px-3 py-1.5 rounded-lg border border-gray-300 dark:border-white/10 bg-white dark:bg-[#1a1a1a] text-gray-900 dark:text-white text-sm focus:ring-2 focus:ring-[#d4af37] focus:border-transparent outline-none transition-all"
                        >
                            <option value={5} className="bg-white dark:bg-[#1a1a1a]">5</option>
                            <option value={10} className="bg-white dark:bg-[#1a1a1a]">10</option>
                            <option value={20} className="bg-white dark:bg-[#1a1a1a]">20</option>
                            <option value={50} className="bg-white dark:bg-[#1a1a1a]">50</option>
                        </select>
                        <span className="text-sm text-gray-500 dark:text-gray-400">por página</span>
                    </div>
                </div>

                <Table
                    columns={bookingColumns}
                    data={bookingItemRows}
                    isLoading={bookingsLoading}
                    emptyMessage={actionMode === 'CHECK_IN' 
                        ? "No hay reservas confirmadas pendientes de check-in" 
                        : "No hay huéspedes hospedados pendientes de check-out"
                    }
                    keyExtractor={(item) => `${item.bookingId}-${item.id}`}
                />

                {/* Pagination Controls */}
                {totalPages > 0 && (
                    <div className="flex items-center justify-between mt-6 pt-4 border-t border-gray-200 dark:border-white/5">
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                            {totalItems > 0 
                                ? `Mostrando ${currentPage * pageSize + 1} - ${Math.min((currentPage + 1) * pageSize, totalItems)} de ${totalItems} registros`
                                : 'Sin resultados'
                            }
                        </p>
                        
                        {totalPages > 1 && (
                            <div className="flex items-center gap-1">
                                <button
                                    onClick={() => setCurrentPage(p => Math.max(0, p - 1))}
                                    disabled={currentPage === 0}
                                    className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-white/5 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                                >
                                    <ChevronLeft size={18} className="text-gray-600 dark:text-gray-400" />
                                </button>
                                
                                {/* Page Numbers */}
                                {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                                    let pageNum;
                                    if (totalPages <= 5) {
                                        pageNum = i;
                                    } else if (currentPage < 3) {
                                        pageNum = i;
                                    } else if (currentPage > totalPages - 4) {
                                        pageNum = totalPages - 5 + i;
                                    } else {
                                        pageNum = currentPage - 2 + i;
                                    }
                                    
                                    return (
                                        <button
                                            key={pageNum}
                                            onClick={() => setCurrentPage(pageNum)}
                                            className={`w-8 h-8 rounded-lg text-sm font-medium transition-colors ${
                                                currentPage === pageNum
                                                    ? 'bg-[#d4af37] text-white'
                                                    : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-white/5'
                                            }`}
                                        >
                                            {pageNum + 1}
                                        </button>
                                    );
                                })}
                                
                                <button
                                    onClick={() => setCurrentPage(p => Math.min(totalPages - 1, p + 1))}
                                    disabled={currentPage >= totalPages - 1}
                                    className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-white/5 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                                >
                                    <ChevronRight size={18} className="text-gray-600 dark:text-gray-400" />
                                </button>
                            </div>
                        )}
                    </div>
                )}
            </Card>

            {/* Feedback Modal */}
            <Modal
                isOpen={feedback.show}
                onClose={() => setFeedback({ ...feedback, show: false })}
                size="sm"
            >
                <div className="p-10 flex flex-col items-center text-center space-y-6">
                    <div className={`w-20 h-20 rounded-full flex items-center justify-center ${feedback.type === 'success' ? 'bg-emerald-500/10 text-emerald-500' :
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

            {/* Assign Room Modal */}
            <Modal
                isOpen={showAssignModal}
                onClose={() => setShowAssignModal(false)}
                title="Asignar Habitación"
            >
                <div className="p-6 space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                            Seleccionar Habitación Disponible
                        </label>
                        <select
                            value={selectedRoomId}
                            onChange={(e) => setSelectedRoomId(e.target.value)}
                            className="w-full px-4 py-2.5 rounded-lg border border-gray-300 dark:border-white/10 bg-white dark:bg-[#1a1a1a] text-gray-900 dark:text-white focus:ring-2 focus:ring-[#d4af37] focus:border-transparent outline-none transition-all"
                        >
                            <option value="" className="bg-white dark:bg-[#1a1a1a]">Seleccionar habitación...</option>
                            {availableRooms.map(room => (
                                <option key={room.id} value={room.id} className="bg-white dark:bg-[#1a1a1a]">
                                    {room.roomNumber} - {room.roomType.name}
                                </option>
                            ))}
                        </select>
                    </div>
                    <div className="flex justify-end gap-3 pt-4 border-t border-gray-200 dark:border-white/5">
                        <Button variant="ghost" onClick={() => setShowAssignModal(false)}>
                            Cancelar
                        </Button>
                        <Button
                            onClick={handleAssignRoom}
                            disabled={!selectedRoomId || assignLoading}
                        >
                            {assignLoading ? 'Asignando...' : 'Asignar'}
                        </Button>
                    </div>
                </div>
            </Modal>
        </div>
    );
};

export default EmployeeBookingsView;