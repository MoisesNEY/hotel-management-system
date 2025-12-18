import { useState, useEffect } from 'react';
import { 
    Calendar, Users, FileText, 
    Save, User, Layout, 
    AlertCircle, Loader2, 
    CheckCircle2, Info
} from 'lucide-react';
import Button from '../../components/shared/Button';
import { createBooking, updateBooking } from '../../../services/admin/bookingService';
import { getAllRoomTypes } from '../../../services/admin/roomTypeService';
import { getAllCustomerDetails } from '../../../services/admin/customerDetailsService';
import { getAllUsers } from '../../../services/admin/userService';

import type { 
    BookingDTO, 
    RoomTypeDTO, 
    CustomerDetailsDTO as CustomerDTO,
    BookingStatus,
    AdminUserDTO
} from '../../../types/sharedTypes';

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
    const [status, setStatus] = useState<BookingStatus>('PENDING');
    const [notes, setNotes] = useState('');

    // Selection IDs and Data
    const [selectedRoomTypeId, setSelectedRoomTypeId] = useState<number | string>('');
    const [selectedCustomerId, setSelectedCustomerId] = useState<number | string>('');

    const [roomTypes, setRoomTypes] = useState<RoomTypeDTO[]>([]);
    const [customers, setCustomers] = useState<CustomerDTO[]>([]);
    const [usersMap, setUsersMap] = useState<Record<number, AdminUserDTO>>({});

    const [loading, setLoading] = useState(false);
    const [loadingData, setLoadingData] = useState(true);
    const [error, setError] = useState<string | null>(null);

    // Load list data
    useEffect(() => {
        const loadData = async () => {
            try {
                const [typesResponse, customersResponse, usersResponse] = await Promise.all([
                    getAllRoomTypes(0, 200),
                    getAllCustomerDetails(0, 200),
                    getAllUsers(0, 200)
                ]);
                setRoomTypes(typesResponse.data);
                setCustomers(customersResponse.data);

                const map: Record<number, AdminUserDTO> = {};
                usersResponse.data.forEach(u => map[u.id] = u);
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
            setStatus(initialData.status || 'PENDING');
            setNotes(initialData.notes || '');

            if (initialData.roomType) {
                setSelectedRoomTypeId(initialData.roomType.id);
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

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        if (!selectedRoomTypeId || !selectedCustomerId) {
            setError('La selección de cliente y categoría de habitación es obligatoria');
            setLoading(false);
            return;
        }

        try {
            const selectedCustomer = customers.find(c => c.id === Number(selectedCustomerId));
            const selectedRoomType = roomTypes.find(t => t.id === Number(selectedRoomTypeId));

            if (!selectedCustomer?.user || !selectedRoomType) {
                throw new Error("Datos de selección inválidos");
            }

            const payload = {
                ...(initialData?.id ? { id: initialData.id } : {}),
                checkInDate,
                checkOutDate,
                guestCount: Number(guestCount),
                status: status as BookingStatus,
                notes,
                roomType: selectedRoomType,
                customer: selectedCustomer.user
            };

            if (initialData?.id) {
                await updateBooking(initialData.id, payload as unknown as BookingDTO);
            } else {
                await createBooking(payload as unknown as BookingDTO);
            }
            onSuccess();
        } catch (err: any) {
            console.error(err);
            const serverMsg = err.response?.data?.detail || err.response?.data?.message || 'Error crítico al procesar la reserva. Contacte a soporte.';
            setError(serverMsg);
        } finally {
            setLoading(false);
        }
    };

    const statuses: BookingStatus[] = ['PENDING', 'CONFIRMED', 'CANCELLED', 'CHECKED_IN', 'CHECKED_OUT'];

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

                {/* Room Type Section */}
                <div className="space-y-2 group">
                    <label className={labelStyle}>Tipo de Unidad <span className="text-gold-default">*</span></label>
                    <div className="relative">
                        <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-gold-default transition-colors">
                            <Layout size={18} />
                        </div>
                        <select
                            value={selectedRoomTypeId}
                            onChange={(e) => setSelectedRoomTypeId(e.target.value)}
                            className={`${inputStyle} pl-12 pr-10`}
                            required
                        >
                            <option value="" className="dark:bg-[#111111]">Seleccionar Categoría</option>
                            {roomTypes.map(t => (
                                <option key={t.id} value={t.id} className="dark:bg-[#111111]">
                                    {t.name} (Máx: {t.maxCapacity} | ${t.basePrice})
                                </option>
                            ))}
                        </select>
                        <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-gray-400">
                            <ChevronDown size={14} className="group-focus-within:rotate-180 transition-transform" />
                        </div>
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
                <p className="text-[11px] text-gray-400 font-medium italic">
                    * Todos los cambios impactan la disponibilidad en tiempo real.
                </p>
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

        </form>
    );
};

const ChevronDown = ({ size, className }: { size: number, className?: string }) => (
    <svg 
        width={size} 
        height={size} 
        viewBox="0 0 24 24" 
        fill="none" 
        stroke="currentColor" 
        strokeWidth="2.5" 
        strokeLinecap="round" 
        strokeLinejoin="round" 
        className={className}
    >
        <path d="m6 9 6 6 6-6"/>
    </svg>
);

export default BookingForm;
