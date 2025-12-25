import { useState, useEffect, useRef } from 'react';
import { createServiceRequest } from '../../../services/admin/serviceRequestService';
import { getAllBookings } from '../../../services/admin/bookingService';
import { getAllHotelServices } from '../../../services/admin/hotelServiceService';
import type { BookingDTO, HotelServiceDTO } from '../../../types/adminTypes';
import { Loader2, Search, X, User, Calendar, Hotel } from 'lucide-react';

interface ServiceRequestFormProps {
    onSuccess: () => void;
    onCancel: () => void;
}

const ServiceRequestForm = ({ onSuccess, onCancel }: ServiceRequestFormProps) => {
    // Booking search state
    const [bookings, setBookings] = useState<BookingDTO[]>([]);
    const [bookingSearch, setBookingSearch] = useState('');
    const [showBookingDropdown, setShowBookingDropdown] = useState(false);
    const [selectedBooking, setSelectedBooking] = useState<BookingDTO | null>(null);
    const bookingDropdownRef = useRef<HTMLDivElement>(null);

    // Services state
    const [services, setServices] = useState<HotelServiceDTO[]>([]);
    const [selectedServiceId, setSelectedServiceId] = useState<number | ''>('');

    // Form state
    const [details, setDetails] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // Load data
    useEffect(() => {
        const loadData = async () => {
            try {
                const [bookingsRes, servicesRes] = await Promise.all([
                    getAllBookings(0, 500, 'id,desc'),
                    getAllHotelServices(0, 100, 'name,asc', 'OPERATIONAL')
                ]);
                // Filter bookings that are active (CONFIRMED or CHECKED_IN)
                setBookings(bookingsRes.data.filter(b => 
                    ['CONFIRMED', 'CHECKED_IN'].includes(b.status)
                ));
                setServices(servicesRes.data);
            } catch (err) {
                console.error('Error loading data:', err);
            }
        };
        loadData();
    }, []);

    // Click outside handler for booking dropdown
    useEffect(() => {
        const handleClickOutside = (e: MouseEvent) => {
            if (bookingDropdownRef.current && !bookingDropdownRef.current.contains(e.target as Node)) {
                setShowBookingDropdown(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    // Filtered bookings based on search
    const filteredBookings = bookings.filter(booking => {
        if (!bookingSearch.trim()) return true;
        const query = bookingSearch.toLowerCase();
        const customerName = `${booking.customer?.firstName} ${booking.customer?.lastName}`.toLowerCase();
        const email = booking.customer?.email?.toLowerCase() || '';
        return customerName.includes(query) || email.includes(query) || booking.id.toString().includes(query);
    });

    const handleSelectBooking = (booking: BookingDTO) => {
        setSelectedBooking(booking);
        setShowBookingDropdown(false);
        setBookingSearch('');
    };

    const clearSelectedBooking = () => {
        setSelectedBooking(null);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);

        if (!selectedBooking) {
            setError('Debe seleccionar una reserva');
            return;
        }

        if (!selectedServiceId) {
            setError('Debe seleccionar un servicio');
            return;
        }

        const selectedService = services.find(s => s.id === selectedServiceId);
        if (!selectedService) {
            setError('Servicio no encontrado');
            return;
        }

        const payload = {
            id: 0,
            requestDate: new Date().toISOString(),
            details: details.trim() || undefined,
            status: 'OPEN' as const,
            service: selectedService,
            booking: selectedBooking
        };

        setLoading(true);
        try {
            await createServiceRequest(payload);
            onSuccess();
        } catch (err: any) {
            console.error('Error creating service request:', err);
            const serverMsg = err.response?.data?.detail || err.response?.data?.message || 'Error al crear la solicitud';
            setError(serverMsg);
        } finally {
            setLoading(false);
        }
    };

    const inputClass = "w-full px-4 py-2.5 rounded-lg border border-gray-300 dark:border-white/10 bg-white dark:bg-black/20 text-gray-900 dark:text-white focus:ring-2 focus:ring-[#d4af37] focus:border-transparent outline-none transition-all";
    const labelClass = "block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5";
    const selectClass = "w-full px-4 py-2.5 rounded-lg border border-gray-300 dark:border-white/10 bg-white dark:bg-[#1a1a1a] text-gray-900 dark:text-white focus:ring-2 focus:ring-[#d4af37] focus:border-transparent outline-none transition-all";

    return (
        <form onSubmit={handleSubmit}>
            <div className="p-6 space-y-5">
                {error && (
                    <div className="p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg text-red-700 dark:text-red-400 text-sm">
                        {error}
                    </div>
                )}

                {/* Booking Selector */}
                <div>
                    <label className={labelClass}>
                        Reserva <span className="text-red-500">*</span>
                    </label>
                    
                    {selectedBooking ? (
                        <div className="flex items-center justify-between p-4 bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800 rounded-lg">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-full bg-emerald-500/20 flex items-center justify-center">
                                    <User size={20} className="text-emerald-600 dark:text-emerald-400" />
                                </div>
                                <div>
                                    <div className="font-medium text-gray-900 dark:text-white">
                                        {selectedBooking.customer?.firstName} {selectedBooking.customer?.lastName}
                                    </div>
                                    <div className="text-xs text-gray-500 dark:text-gray-400">
                                        Reserva #{selectedBooking.id} • {selectedBooking.customer?.email}
                                    </div>
                                </div>
                            </div>
                            <button
                                type="button"
                                onClick={clearSelectedBooking}
                                className="p-1 rounded-full hover:bg-emerald-100 dark:hover:bg-emerald-900/40 transition-colors"
                            >
                                <X size={18} className="text-gray-500" />
                            </button>
                        </div>
                    ) : (
                        <div className="relative" ref={bookingDropdownRef}>
                            <div className="relative">
                                <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                                <input
                                    type="text"
                                    value={bookingSearch}
                                    onChange={(e) => setBookingSearch(e.target.value)}
                                    onFocus={() => setShowBookingDropdown(true)}
                                    placeholder="Buscar por cliente o ID de reserva..."
                                    className={`${inputClass} pl-10`}
                                />
                            </div>
                            
                            {showBookingDropdown && (
                                <div className="absolute z-10 w-full mt-1 bg-white dark:bg-[#1a1a1a] border border-gray-300 dark:border-white/10 rounded-lg shadow-xl max-h-60 overflow-y-auto">
                                    {filteredBookings.length === 0 ? (
                                        <div className="p-4 text-sm text-gray-500 dark:text-gray-400 text-center">
                                            No hay reservas activas disponibles
                                        </div>
                                    ) : (
                                        filteredBookings.slice(0, 10).map(booking => (
                                            <button
                                                key={booking.id}
                                                type="button"
                                                onClick={() => handleSelectBooking(booking)}
                                                className="w-full px-4 py-3 text-left hover:bg-gray-100 dark:hover:bg-white/5 transition-colors flex items-center gap-3 border-b border-gray-100 dark:border-white/5 last:border-0"
                                            >
                                                <div className="w-8 h-8 rounded-full bg-[#d4af37]/20 flex items-center justify-center flex-shrink-0">
                                                    <Hotel size={16} className="text-[#d4af37]" />
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <div className="font-medium text-gray-900 dark:text-white truncate">
                                                        {booking.customer?.firstName} {booking.customer?.lastName}
                                                    </div>
                                                    <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400">
                                                        <span>#{booking.id}</span>
                                                        <span>•</span>
                                                        <Calendar size={12} />
                                                        <span>{new Date(booking.checkInDate).toLocaleDateString()}</span>
                                                    </div>
                                                </div>
                                            </button>
                                        ))
                                    )}
                                </div>
                            )}
                        </div>
                    )}
                </div>

                {/* Service Selector */}
                <div>
                    <label className={labelClass}>
                        Servicio <span className="text-red-500">*</span>
                    </label>
                    <select
                        value={selectedServiceId}
                        onChange={(e) => setSelectedServiceId(Number(e.target.value) || '')}
                        className={selectClass}
                        required
                    >
                        <option value="" className="bg-white dark:bg-[#1a1a1a]">Seleccionar servicio...</option>
                        {services.map(service => (
                            <option key={service.id} value={service.id} className="bg-white dark:bg-[#1a1a1a]">
                                {service.name} - ${service.cost?.toFixed(2)}
                            </option>
                        ))}
                    </select>
                </div>

                {/* Details */}
                <div>
                    <label className={labelClass}>Detalles o instrucciones especiales</label>
                    <textarea
                        rows={3}
                        value={details}
                        onChange={(e) => setDetails(e.target.value)}
                        placeholder="Ej: Entregar a la habitación 205 a las 8:00 AM..."
                        className={`${inputClass} resize-none`}
                    />
                </div>
            </div>

            {/* Footer Buttons */}
            <div className="flex justify-end gap-3 px-6 py-4 border-t border-gray-200 dark:border-white/5 bg-gray-50/50 dark:bg-black/10">
                <button
                    type="button"
                    onClick={onCancel}
                    disabled={loading}
                    className="px-5 py-2.5 rounded-lg border border-gray-300 dark:border-white/10 bg-white dark:bg-transparent text-gray-700 dark:text-gray-300 font-medium text-sm hover:bg-gray-50 dark:hover:bg-white/5 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                >
                    Cancelar
                </button>
                <button
                    type="submit"
                    disabled={loading || !selectedBooking || !selectedServiceId}
                    className="px-6 py-2.5 bg-[#d4af37] hover:bg-[#c9a432] disabled:bg-[#d4af37]/50 text-white font-medium text-sm rounded-lg shadow-lg shadow-[#d4af37]/20 disabled:shadow-none disabled:cursor-not-allowed transition-all flex items-center gap-2"
                >
                    {loading && <Loader2 size={16} className="animate-spin" />}
                    {loading ? 'Creando...' : 'Crear Solicitud'}
                </button>
            </div>
        </form>
    );
};

export default ServiceRequestForm;
