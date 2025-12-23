import { useState, useEffect } from 'react';
import { 
    Calendar, Users, FileText, 
    Save, User, 
    AlertCircle, Loader2, 
    CheckCircle2, Info, Plus, Trash2, ChevronDown
} from 'lucide-react';
import Badge from '../../components/shared/Badge';
import Modal from '../../components/shared/Modal';
import Button from '../../components/shared/Button';
import { createBooking, updateBooking, approveBooking } from '../../../services/admin/bookingService';
import { registerManualPayment } from '../../../services/admin/paymentService';
import { getAllRoomTypes } from '../../../services/admin/roomTypeService';
import { getAllRooms } from '../../../services/admin/roomService';
import { getAllCustomerDetails } from '../../../services/admin/customerDetailsService';
import { getAllUsers } from '../../../services/admin/userService';

import { extractErrorMessage } from '../../utils/errorHelper';
import type { 
    BookingDTO, 
    RoomTypeDTO, 
    RoomDTO,
    CustomerDetailsDTO as CustomerDTO,
    BookingStatus,
    AdminUserDTO
} from '../../../types/adminTypes';

interface BookingFormProps {
    initialData?: BookingDTO | null;
    onSuccess: () => void;
    onCancel: () => void;
}

const BookingForm = ({ initialData, onSuccess, onCancel }: BookingFormProps) => {
    // Basic fields
    const [checkInDate, setCheckInDate] = useState('');
    const [checkOutDate, setCheckOutDate] = useState('');
    const [guestCount, setGuestCount] = useState(1);
    const [status, setStatus] = useState<BookingStatus>('PENDING_APPROVAL');
    const [notes, setNotes] = useState('');

    // Selection IDs and Data
    const [selectedCustomerId, setSelectedCustomerId] = useState<number | string>('');
    
    // Items state
    const [bookingItems, setBookingItems] = useState<{ roomTypeId: number | string; occupantName: string; assignedRoomId?: number | string; id?: number }[]>([]);
    const [roomTypes, setRoomTypes] = useState<RoomTypeDTO[]>([]);
    const [customers, setCustomers] = useState<CustomerDTO[]>([]);
    const [rooms, setRooms] = useState<RoomDTO[]>([]);
    const [usersMap, setUsersMap] = useState<Record<string, AdminUserDTO>>({});

    // Local Assignment Modal in Form
    const [showAssignModal, setShowAssignModal] = useState(false);
    const [assigningItemIndex, setAssigningItemIndex] = useState<number | null>(null);

    const [loading, setLoading] = useState(false);
    const [loadingData, setLoadingData] = useState(true);
    const [error, setError] = useState<string | null>(null);

    // Load list data
    useEffect(() => {
        const loadData = async () => {
            try {
                const [typesResponse, customersResponse, usersResponse, roomsResponse] = await Promise.all([
                    getAllRoomTypes(0, 200),
                    getAllCustomerDetails(0, 200),
                    getAllUsers(0, 200),
                    getAllRooms(0, 1000)
                ]);
                setRoomTypes(typesResponse.data);
                setCustomers(customersResponse.data);
                setRooms(roomsResponse.data);

                const map: Record<string, AdminUserDTO> = {};
                usersResponse.data.forEach((u: AdminUserDTO) => map[u.id] = u);
                setUsersMap(map);
            } catch (e) {
                console.error("Error loading form data", e);
                setError("Error fatal al sincronizar con el servidor");
            } finally {
                setLoadingData(false);
            }
        };
        loadData();
    }, []);

    // Set initial data for Edit mode
    useEffect(() => {
        if (initialData) {
            setCheckInDate(initialData.checkInDate || '');
            setCheckOutDate(initialData.checkOutDate || '');
            setGuestCount(initialData.guestCount || 1);
            setStatus(initialData.status || 'PENDING_APPROVAL');
            setNotes(initialData.notes || '');

            if (initialData.items) {
                setBookingItems(initialData.items.map(item => ({
                    id: item.id,
                    roomTypeId: item.roomType.id,
                    occupantName: item.occupantName || '',
                    assignedRoomId: item.assignedRoom?.id || ''
                })));
            }
        }
    }, [initialData]);

    // Handle customer selection sync separately to ensure list is loaded
    useEffect(() => {
        if (initialData && initialData.customer && customers.length > 0) {
            const matchingCustomer = customers.find(c => c.user?.id === initialData.customer.id);
            if (matchingCustomer) {
                setSelectedCustomerId(matchingCustomer.id);
            }
        }
    }, [initialData, customers]);

    const addItem = () => {
        setBookingItems([...bookingItems, { roomTypeId: '', occupantName: '', assignedRoomId: '' }]);
    };

    const removeItem = (index: number) => {
        setBookingItems(bookingItems.filter((_, i) => i !== index));
    };

    const updateItem = (index: number, field: string, value: any) => {
        const newItems = [...bookingItems];
        newItems[index] = { ...newItems[index], [field]: value };
        setBookingItems(newItems);
    };

    const openAssignModal = (index: number) => {
        setAssigningItemIndex(index);
        setShowAssignModal(true);
    };

    const handleAssignRoomInForm = (roomId: number) => {
        if (assigningItemIndex === null) return;
        updateItem(assigningItemIndex, 'assignedRoomId', roomId);
        setShowAssignModal(false);
        setAssigningItemIndex(null);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        if (bookingItems.length === 0 || !selectedCustomerId) {
            setError('La selección de cliente y al menos una habitación es obligatoria');
            setLoading(false);
            return;
        }

        if (bookingItems.some(i => !i.roomTypeId)) {
            setError('Todas las habitaciones seleccionadas deben tener una categoría');
            setLoading(false);
            return;
        }


        try {
            const selectedCustomer = customers.find(c => c.id === Number(selectedCustomerId));
            
            if (!selectedCustomer?.user) {
                throw new Error("Datos de selección de cliente inválidos");
            }

            // ... payload construction ...
            const payload_items = bookingItems.map(item => {
                const rt = roomTypes.find(t => t.id === Number(item.roomTypeId));
                const assignedRoom = item.assignedRoomId ? rooms.find(r => r.id === Number(item.assignedRoomId)) : undefined;
                return {
                    ...(item.id ? { id: item.id } : {}),
                    roomType: rt,
                    occupantName: item.occupantName,
                    price: rt?.basePrice || 0,
                    assignedRoom: assignedRoom
                };
            });
            const payload = {
                ...(initialData?.id ? { id: initialData.id, code: initialData.code } : {}),
                checkInDate,
                checkOutDate,
                guestCount: Number(guestCount),
                status: status as BookingStatus,
                notes,
                customer: selectedCustomer.user,
                items: payload_items
            };

            if (initialData?.id) {
                await updateBooking(initialData.id, payload as unknown as BookingDTO);
            } else {
                await createBooking(payload as unknown as BookingDTO);
            }
            onSuccess();
        } catch (err: any) {
            console.error(err);
            setError(extractErrorMessage(err));
        } finally {
            setLoading(false);
        }
    };

    const statuses: BookingStatus[] = ['PENDING_APPROVAL', 'PENDING_PAYMENT', 'CONFIRMED', 'CANCELLED', 'CHECKED_IN', 'CHECKED_OUT'];

    const inputStyle = "w-full px-4 py-3 bg-white dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-2xl text-sm text-gray-900 dark:text-white focus:ring-2 focus:ring-gold-default/20 focus:border-gold-default outline-none transition-all placeholder:text-gray-400 disabled:opacity-50 appearance-none";
    const labelStyle = "block text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-widest mb-2 ml-1";

    if (loadingData) {
        return (
            <div className="flex flex-col items-center justify-center p-20 gap-4">
                <Loader2 className="w-10 h-10 text-gold-default animate-spin" />
                <p className="text-sm font-medium text-gray-400 animate-pulse">Analizando registros...</p>
            </div>
        );
    }

    return (
        <form onSubmit={handleSubmit} className="space-y-8 p-10 max-w-4xl mx-auto">
            {error && (
                <div className="flex items-start gap-4 p-5 bg-red-50 dark:bg-red-500/5 border border-red-100 dark:border-red-500/20 rounded-3xl animate-shake">
                    <div className="p-2 rounded-xl bg-red-100 dark:bg-red-500/20 text-red-600 dark:text-red-400">
                        <AlertCircle size={20} />
                    </div>
                    <div className="flex-1">
                        <p className="text-sm font-bold text-red-800 dark:text-red-300">Conflicto Identificado</p>
                        <p className="text-xs text-red-600 dark:text-red-400 leading-relaxed mt-1">{error}</p>
                    </div>
                </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* Customer Section */}
                <div className="space-y-2 group">
                    <label className={labelStyle}>Huésped / Cliente <span className="text-gold-default">*</span></label>
                    <div className="relative">
                        <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-gold-default transition-colors">
                            <User size={18} />
                        </div>
                        {initialData ? (
                            <input
                                type="text"
                                readOnly
                                value={
                                    initialData.customer?.firstName 
                                        ? `${initialData.customer.firstName} ${initialData.customer.lastName} (${initialData.customer.email})`
                                        : 'Cargando información del cliente...'
                                }
                                className={`${inputStyle} pl-12 bg-gray-50/50 dark:bg-white/5 cursor-not-allowed border-dashed text-gray-500 dark:text-gray-400`}
                            />
                        ) : (
                            <>
                                <select
                                    value={selectedCustomerId}
                                    onChange={(e) => setSelectedCustomerId(e.target.value)}
                                    className={`${inputStyle} pl-12 pr-10 truncate`}
                                    required
                                >
                                    <option value="" className="dark:bg-[#111111]">Seleccionar Cliente</option>
                                    {customers.map(c => {
                                        const userId = c.user?.id;
                                        const user = userId ? usersMap[userId] : undefined;
                                        const name = `${user?.firstName || c.user?.firstName || 'Invitado'} ${user?.lastName || c.user?.lastName || ''}`;
                                        return (
                                            <option key={c.id} value={c.id} className="dark:bg-[#111111]">
                                                {name} ({user?.email || c.user?.email || 'N/A'})
                                            </option>
                                        );
                                    })}
                                </select>
                                <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-gray-400">
                                    <ChevronDown size={14} className="group-focus-within:rotate-180 transition-transform" />
                                </div>
                            </>
                        )}
                    </div>
                </div>

                {/* Room Type Multi-Selection Section */}
                <div className="md:col-span-2 space-y-4">
                    <div className="flex justify-between items-center">
                        <label className={labelStyle}>Habitaciones / Unidades Reservadas <span className="text-gold-default">*</span></label>
                        <Button 
                            type="button" 
                            variant="outline" 
                            size="sm" 
                            onClick={addItem}
                            leftIcon={<Plus size={14} />}
                        >
                            Agregar Habitación
                        </Button>
                    </div>
                    
                    <div className="space-y-4">
                        {bookingItems.length === 0 && (
                            <div className="p-8 border border-dashed border-gray-200 dark:border-white/10 rounded-3xl text-center">
                                <p className="text-sm text-gray-500">No hay habitaciones seleccionadas. Agregue al menos una.</p>
                            </div>
                        )}
                        {bookingItems.map((item, index) => (
                            <div key={index} className="grid grid-cols-1 md:grid-cols-12 gap-4 items-end bg-gray-50/50 dark:bg-white/5 p-4 rounded-2xl border border-gray-100 dark:border-white/5">
                                <div className="md:col-span-1 flex items-center justify-center pb-3">
                                    <span className="text-xs font-bold text-gray-400">#{index + 1}</span>
                                </div>
                                <div className="md:col-span-4 space-y-2">
                                    <label className="text-[10px] uppercase font-bold text-gray-400 ml-1">Categoría</label>
                                    <div className="relative">
                                        <select
                                            value={item.roomTypeId}
                                            onChange={(e) => updateItem(index, 'roomTypeId', e.target.value)}
                                            className={`${inputStyle} pr-10`}
                                            required
                                        >
                                            <option value="" className="dark:bg-[#111111]">Seleccionar</option>
                                            {roomTypes.map(t => (
                                                <option key={t.id} value={t.id} className="dark:bg-[#111111]">
                                                    {t.name} (${t.basePrice})
                                                </option>
                                            ))}
                                        </select>
                                        <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-gray-400">
                                            <ChevronDown size={12} />
                                        </div>
                                    </div>
                                </div>
                                <div className="md:col-span-3 space-y-2">
                                    <label className="text-[10px] uppercase font-bold text-gray-400 ml-1">Ocupante (Opcional)</label>
                                    <input
                                        type="text"
                                        value={item.occupantName}
                                        onChange={(e) => updateItem(index, 'occupantName', e.target.value)}
                                        placeholder="Nombre del huésped"
                                        className={inputStyle}
                                    />
                                </div>
                                <div className="md:col-span-3 space-y-2">
                                    <label className="text-[10px] uppercase font-bold text-gray-400 ml-1">Habitación Asignada</label>
                                    <div className="flex items-center gap-2">
                                        {item.assignedRoomId ? (
                                            <Badge variant="success">
                                                {rooms.find(r => r.id === Number(item.assignedRoomId))?.roomNumber || 'Desconocida'}
                                            </Badge>
                                        ) : (
                                            <span className="text-[10px] text-gray-400 italic">Sin asignar</span>
                                        )}
                                        <Button 
                                            type="button"
                                            size="sm"
                                            variant="ghost"
                                            className="text-[10px] h-7 px-2"
                                            onClick={() => openAssignModal(index)}
                                            disabled={!item.roomTypeId}
                                        >
                                            {item.assignedRoomId ? 'Cambiar' : 'Asignar'}
                                        </Button>
                                    </div>
                                </div>
                                <div className="md:col-span-1 flex justify-center pb-2">
                                    <button 
                                        type="button"
                                        onClick={() => removeItem(index)}
                                        className="p-2 text-rose-500 hover:bg-rose-500/10 rounded-xl transition-colors"
                                    >
                                        <Trash2 size={18} />
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Dates Section */}
                <div className="space-y-2 group">
                    <label className={labelStyle}>Fecha de Check-In <span className="text-gold-default">*</span></label>
                    <div className="relative">
                        <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-gold-default transition-colors">
                            <Calendar size={18} />
                        </div>
                        <input
                            type="date"
                            value={checkInDate}
                            onChange={(e) => setCheckInDate(e.target.value)}
                            className={`${inputStyle} pl-12`}
                            required
                        />
                    </div>
                </div>

                <div className="space-y-2 group">
                    <label className={labelStyle}>Fecha de Check-Out <span className="text-gold-default">*</span></label>
                    <div className="relative">
                        <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-gold-default transition-colors">
                            <CheckCircle2 size={18} />
                        </div>
                        <input
                            type="date"
                            value={checkOutDate}
                            onChange={(e) => setCheckOutDate(e.target.value)}
                            className={`${inputStyle} pl-12`}
                            required
                        />
                    </div>
                </div>

                {/* Guests and Status */}
                <div className="space-y-2 group">
                    <label className={labelStyle}>Total de Huéspedes <span className="text-gold-default">*</span></label>
                    <div className="relative">
                        <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-gold-default transition-colors">
                            <Users size={18} />
                        </div>
                        <input
                            type="number"
                            min="1"
                            value={guestCount}
                            onChange={(e) => setGuestCount(Number(e.target.value))}
                            className={`${inputStyle} pl-12`}
                            required
                        />
                    </div>
                </div>

                <div className="space-y-2 group">
                    <label className={labelStyle}>Estado de la Reserva</label>
                    <div className="relative">
                        <select
                            value={status}
                            onChange={(e) => setStatus(e.target.value as BookingStatus)}
                            className={`${inputStyle} pr-10`}
                        >
                            {statuses.map(s => (
                                <option key={s} value={s} className="dark:bg-[#111111]">{s.replace('_', ' ')}</option>
                            ))}
                        </select>
                        <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-gray-400">
                             <ChevronDown size={14} className="group-focus-within:rotate-180 transition-transform" />
                        </div>
                    </div>
                </div>

                {/* Notes Section - Full Width */}
                <div className="space-y-2 group md:col-span-2">
                    <label className={labelStyle}>Notas y Requerimientos Especiales</label>
                    <div className="relative">
                         <div className="absolute left-4 top-6 text-gray-400 group-focus-within:text-gold-default transition-colors">
                            <FileText size={18} />
                        </div>
                        <textarea
                            value={notes}
                            onChange={(e) => setNotes(e.target.value)}
                            placeholder="Ej: Dieta especial, llegada tardía, decoración..."
                            className={`${inputStyle} pl-12 h-32 resize-none pt-4`}
                        />
                    </div>
                </div>
            </div>

            {/* Price Info Banner (Simulated) */}
            <div className="flex items-center gap-4 p-5 bg-gold-default/5 border border-gold-default/10 rounded-3xl">
                <div className="w-10 h-10 rounded-2xl bg-gold-default/10 flex items-center justify-center text-gold-default">
                    <Info size={20} />
                </div>
                <div className="flex-1">
                    <p className="text-xs font-bold text-gold-default uppercase tracking-widest">Aviso de Tarificación</p>
                    <p className="text-[11px] text-gray-500 dark:text-gray-400 mt-0.5 leading-relaxed">
                        El precio total se calculará dinámicamente al confirmar basándose en el precio base de la categoría y la duración de la estancia.
                    </p>
                </div>
            </div>

            <div className="flex items-center justify-between gap-4 pt-10 border-t border-gray-100 dark:border-white/5">
                <div className="flex gap-2">
                     {/* Acciones de Flujo de Reservas */}
                     {initialData && status === 'PENDING_APPROVAL' && (
                         <Button
                             type="button"
                             variant="success"
                             onClick={async () => {
                                 if (!window.confirm("¿Aprobar esta solicitud? Se verificará disponibilidad y se generará la factura.")) return;
                                 try {
                                     setLoading(true);
                                     await approveBooking(initialData.id);
                                     onSuccess();
                                 } catch (err: any) {
                                     setError(extractErrorMessage(err));
                                 } finally {
                                    setLoading(false);
                                 }
                             }}
                             disabled={loading}
                             leftIcon={<CheckCircle2 size={16} />}
                         >
                             Aprobar Solicitud
                         </Button>
                     )}

                     {initialData && status === 'PENDING_PAYMENT' && initialData.invoiceId && (
                         <Button
                            type="button"
                            variant="info"
                            onClick={async () => {
                                const amountStr = prompt(`Confirmar pago en efectivo para Factura #${initialData.invoiceId}.\nIngrese el monto recibido:`, initialData.totalPrice?.toString());
                                if (!amountStr) return;
                                const amount = parseFloat(amountStr);
                                if (isNaN(amount) || amount <= 0) {
                                    alert("Monto inválido");
                                    return;
                                }

                                try {
                                    setLoading(true);
                                    await registerManualPayment({ invoiceId: initialData.invoiceId!, amount });
                                    onSuccess();
                                } catch (err: any) {
                                    setError(extractErrorMessage(err));
                                } finally {
                                    setLoading(false);
                                }
                            }}
                            disabled={loading}
                             leftIcon={<Save size={16} />}
                         >
                             Registrar Pago Efectivo
                         </Button>
                     )}
                </div>
                
                <div className="flex gap-4">
                    <Button 
                        type="button" 
                        variant="ghost" 
                        onClick={onCancel}
                        disabled={loading}
                        className="px-8 rounded-xl"
                    >
                        Cancelar
                    </Button>
                    <Button 
                        type="submit" 
                        variant="primary"
                        disabled={loading}
                        className="px-12 min-w-[180px] rounded-xl"
                        leftIcon={loading ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
                    >
                        {loading ? 'Sincronizando...' : initialData ? 'Actualizar Reserva' : 'Crear Registro'}
                    </Button>
                </div>
            </div>

            {/* Assignment Modal for Form Items */}
            <Modal
                isOpen={showAssignModal}
                onClose={() => setShowAssignModal(false)}
                title="Asignar Habitación Física"
            >
                <div className="space-y-4">
                    <p className="text-sm text-gray-500">
                        Seleccione una habitación disponible del tipo reservado (
                        {assigningItemIndex !== null && roomTypes.find(t => t.id === Number(bookingItems[assigningItemIndex].roomTypeId))?.name}
                        )
                    </p>
                    <div className="grid grid-cols-4 gap-2">
                        {assigningItemIndex !== null && rooms
                            .filter(r => r.roomType.id === Number(bookingItems[assigningItemIndex].roomTypeId))
                            .map(r => (
                                <button
                                    key={r.id}
                                    type="button"
                                    onClick={() => handleAssignRoomInForm(r.id)}
                                    disabled={r.status !== 'AVAILABLE'}
                                    className={`p-3 rounded-xl border text-sm transition-all ${
                                        r.status === 'AVAILABLE'
                                            ? 'border-gray-100 dark:border-white/10 hover:border-gold-default dark:hover:border-gold-default hover:bg-gold-default/5'
                                            : 'opacity-50 cursor-not-allowed bg-gray-50 dark:bg-white/5 border-dashed'
                                    } ${
                                        Number(bookingItems[assigningItemIndex].assignedRoomId) === r.id
                                            ? 'border-gold-default bg-gold-default/10 text-gold-default'
                                            : ''
                                    }`}
                                >
                                    <div className="font-bold">{r.roomNumber}</div>
                                    <div className="text-[10px] mt-1">{r.status}</div>
                                </button>
                            ))}
                        {assigningItemIndex !== null && rooms.filter(r => r.roomType.id === Number(bookingItems[assigningItemIndex].roomTypeId)).length === 0 && (
                            <div className="col-span-4 p-4 text-center text-gray-400 text-xs italic">
                                No hay habitaciones físicas configuradas para esta categoría.
                            </div>
                        )}
                    </div>
                </div>
            </Modal>
        </form>
    );
};


export default BookingForm;
