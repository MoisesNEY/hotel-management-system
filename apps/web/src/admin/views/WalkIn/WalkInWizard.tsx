import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    UserIcon,
    CalendarDaysIcon,
    CheckCircleIcon,
    MagnifyingGlassIcon,
    ArrowRightIcon,
    XMarkIcon
} from '@heroicons/react/24/outline';
import { toast } from 'react-hot-toast';
import { searchByLicenseId, createWalkInCustomer } from '../../../services/admin/customerService';
import { checkAvailability, createWalkInBooking } from '../../../services/admin/bookingService';
import type { CustomerDTO, RoomTypeAvailabilityDTO } from '../../../types/adminTypes';

const WalkInWizard = () => {
    const navigate = useNavigate();
    const [step, setStep] = useState(1);
    const [loading, setLoading] = useState(false);

    // Step 1: Customer
    const [licenseSearch, setLicenseSearch] = useState('');
    const [selectedCustomer, setSelectedCustomer] = useState<CustomerDTO | null>(null);
    const [customerForm, setCustomerForm] = useState({
        firstName: '',
        lastName: '',
        licenseId: '',
        birthDate: '',
        phone: '',
        country: '',
        city: '',
        addressLine1: '',
        gender: 'OTHER',
        email: '',
        identificationType: 'PASSPORT'
    });
    const [isCreatingCustomer, setIsCreatingCustomer] = useState(false);

    // Step 2: Stay
    const [dates, setDates] = useState({ checkIn: '', checkOut: '' });
    const [guestCount, setGuestCount] = useState(1);
    const [availability, setAvailability] = useState<RoomTypeAvailabilityDTO[]>([]);
    const [selectedRoomType, setSelectedRoomType] = useState<RoomTypeAvailabilityDTO | null>(null);
    const [roomCount, setRoomCount] = useState(1);
    const [bookingItems, setBookingItems] = useState<{ roomType: RoomTypeAvailabilityDTO, occupantName: string, assignedRoomId?: number }[]>([]);

    // Step 1 Handlers (existing...)
    const handleSearchCustomer = async () => {
        if (!licenseSearch) return;
        setLoading(true);
        try {
            const results = await searchByLicenseId(licenseSearch);
            if (results && results.length > 0) {
                // Find exact match or first
                const match = results.find(c => c.licenseId === licenseSearch) || results[0];
                setSelectedCustomer(match);
                setIsCreatingCustomer(false);
                toast.success('Cliente encontrado');
            } else {
                setSelectedCustomer(null);
                setIsCreatingCustomer(true);
                setCustomerForm(prev => ({ ...prev, licenseId: licenseSearch }));
                toast('Cliente no encontrado. Por favor registrelo.', { icon: '📝' });
            }
        } catch (error) {
            console.error(error);
            toast.error('Error buscando cliente');
        } finally {
            setLoading(false);
        }
    };

    const handleCreateCustomer = async () => {
        setLoading(true);
        try {
            // Filter out empty optional fields to avoid backend validation errors
            const payload = { ...customerForm };
            if (!payload.phone) delete (payload as any).phone;
            if (!payload.email) delete (payload as any).email;

            // @ts-ignore
            const newCustomer = await createWalkInCustomer(payload);
            setSelectedCustomer(newCustomer);
            setIsCreatingCustomer(false);
            toast.success('Cliente creado correctamente');
        } catch (error) {
            console.error(error);
            toast.error('Error creando cliente');
        } finally {
            setLoading(false);
        }
    };

    // Step 2 Handlers
    const handleCheckAvailability = async () => {
        if (!dates.checkIn || !dates.checkOut) {
            toast.error('Seleccione fechas');
            return;
        }

        const start = new Date(dates.checkIn);
        const end = new Date(dates.checkOut);

        if (end <= start) {
            toast.error('La fecha de salida debe ser posterior a la de entrada');
            return;
        }

        setLoading(true);
        try {
            const results = await checkAvailability(dates.checkIn, dates.checkOut);
            setAvailability(results);
            if (results.length === 0) toast.error('No hay disponibilidad');
        } catch (error: any) {
            console.error(error);
            const msg = error.response?.data?.detail || error.response?.data?.title || 'Error verificando disponibilidad';
            toast.error(msg);
        } finally {
            setLoading(false);
        }
    };

    const handleRoomTypeSelect = (type: RoomTypeAvailabilityDTO) => {
        setSelectedRoomType(type);
        const newItems = Array(roomCount).fill(null).map((_, idx) => ({
            roomType: type,
            occupantName: idx === 0 && selectedCustomer ? `${selectedCustomer.firstName} ${selectedCustomer.lastName}` : '',
            assignedRoomId: undefined
        }));
        setBookingItems(newItems);
    };

    const updateRoomCount = (count: number) => {
        if (count < 1) return;
        setRoomCount(count);
        if (selectedRoomType) {
            const newItems = Array(count).fill(null).map((_, idx) => {
                if (idx < bookingItems.length) return bookingItems[idx];
                return {
                    roomType: selectedRoomType,
                    occupantName: idx === 0 && selectedCustomer ? `${selectedCustomer.firstName} ${selectedCustomer.lastName}` : '',
                    assignedRoomId: undefined
                };
            });
            setBookingItems(newItems);
        }
    };

    const updateItemOccupant = (index: number, name: string) => {
        const newItems = [...bookingItems];
        newItems[index] = { ...newItems[index], occupantName: name };
        setBookingItems(newItems);
    };

    // Helper for Total Price Calculation
    const getNights = () => {
        if (!dates.checkIn || !dates.checkOut) return 1;
        const s = new Date(dates.checkIn);
        const e = new Date(dates.checkOut);
        const diff = e.getTime() - s.getTime();
        return Math.max(1, Math.ceil(diff / (1000 * 3600 * 24)));
    }

    // Step 3 Confirmation
    const handleConfirmBooking = async () => {
        if (!selectedCustomer || bookingItems.length === 0 || !dates.checkIn || !dates.checkOut) return;

        setLoading(true);
        const nights = getNights();

        const itemsPayload = bookingItems.map(item => ({
            roomType: { id: item.roomType.id, name: item.roomType.name },
            price: item.roomType.basePrice * nights,
            assignedRoom: item.assignedRoomId ? { id: item.assignedRoomId } : undefined,
            occupantName: item.occupantName || undefined
        }));

        const bookingDTO: any = { // BookingDTO
            customer: selectedCustomer,
            checkInDate: dates.checkIn,
            checkOutDate: dates.checkOut,
            guestCount: guestCount,
            status: 'PENDING_PAYMENT',
            items: itemsPayload
        };

        try {
            const created = await createWalkInBooking(bookingDTO);
            toast.success('Reserva Walk-In creada!');
            navigate(`/admin/bookings/${created.id}`);
        } catch (error: any) {
            console.error(error);
            const msg = error.response?.data?.detail || error.response?.data?.title || 'Error al confirmar reserva';
            toast.error(msg);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="p-6 max-w-5xl mx-auto">
            <h1 className="text-3xl font-bold mb-8 text-gold-default font-display">Walk-In (Recepción)</h1>

            {/* Stepper */}
            <div className="flex items-center mb-10 overflow-x-auto pb-4">
                {[1, 2, 3].map((s) => (
                    <div key={s} className="flex items-center">
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold transition-all duration-300 shadow-sm ${step === s ? 'bg-gold-default text-white ring-4 ring-gold-default/20 scale-110' :
                                step > s ? 'bg-green-500 text-white shadow-md shadow-green-500/10' :
                                    'bg-white dark:bg-gray-800 text-gray-400 dark:text-gray-500 border border-gray-200 dark:border-gray-700'
                            }`}>
                            {step > s ? <CheckCircleIcon className="w-6 h-6" /> : s}
                        </div>
                        {s < 3 && <div className={`w-16 md:w-24 h-1 mx-3 rounded-full transition-colors duration-500 ${step > s ? 'bg-green-500' : 'bg-gray-200 dark:bg-gray-800'}`} />}
                    </div>
                ))}
            </div>

            <div className="bg-white dark:bg-[#1c1c1c] p-8 rounded-xl shadow-lg border border-gray-100 dark:border-[#333] transition-colors">

                {/* STEP 1: CUSTOMER */}
                {step === 1 && (
                    <div className="animate-fadeIn">
                        {/* ... (Step 1 content unchanged) ... */}
                        <h2 className="text-xl font-bold mb-6 flex items-center text-gray-800 dark:text-white">
                            <UserIcon className="w-6 h-6 mr-3 text-gold-default" />
                            Identificación del Cliente
                        </h2>

                        {!selectedCustomer && !isCreatingCustomer && (
                            <div className="flex flex-col sm:flex-row gap-4 mb-8">
                                <div className="relative flex-1">
                                    <input
                                        type="text"
                                        placeholder="Buscar por DNI / Pasaporte..."
                                        className="w-full p-4 pl-12 border border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-gold-default/50 focus:border-gold-default outline-none text-gray-900 dark:text-gray-100 bg-gray-50 dark:bg-gray-800 transition-all placeholder-gray-400"
                                        value={licenseSearch}
                                        onChange={(e) => setLicenseSearch(e.target.value)}
                                        onKeyDown={(e) => e.key === 'Enter' && handleSearchCustomer()}
                                    />
                                    <MagnifyingGlassIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                                </div>
                                <button
                                    onClick={handleSearchCustomer}
                                    className="bg-gold-default hover:bg-gold-dark text-white px-8 py-4 rounded-xl font-bold shadow-lg shadow-gold-default/20 hover:shadow-gold-default/40 transition-all transform active:scale-95 flex items-center justify-center min-w-[140px]"
                                    disabled={loading}
                                >
                                    {loading ? (
                                        <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                    ) : (
                                        <>
                                            <MagnifyingGlassIcon className="w-5 h-5 mr-2 stroke-2" />
                                            Buscar
                                        </>
                                    )}
                                </button>
                            </div>
                        )}

                        {selectedCustomer && (
                            <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 p-6 rounded-lg mb-6 flex justify-between items-center text-gray-900 dark:text-gray-100">
                                <div>
                                    <h3 className="text-xl font-bold text-green-800 dark:text-green-400">{selectedCustomer.firstName} {selectedCustomer.lastName}</h3>
                                    <p className="text-green-700 dark:text-green-300">DNI: {selectedCustomer.licenseId}</p>
                                    <p className="text-sm text-green-600 dark:text-green-400 mt-1">Email: {selectedCustomer.email || 'No registrado'}</p>
                                </div>
                                <button onClick={() => setSelectedCustomer(null)} className="text-gray-500 dark:text-gray-400 hover:text-red-500 text-sm underline">
                                    Cambiar Cliente
                                </button>
                            </div>
                        )}

                        {isCreatingCustomer && (
                            <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-fadeIn">
                                <div className="bg-white dark:bg-[#1c1c1c] rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] flex flex-col overflow-hidden border border-gray-200 dark:border-[#333] transform transition-all scale-100">

                                    {/* Header */}
                                    <div className="bg-gray-50 dark:bg-[#252525] p-5 border-b border-gray-100 dark:border-[#333] flex justify-between items-center">
                                        <h3 className="font-bold text-xl text-gray-800 dark:text-white flex items-center font-display">
                                            <UserIcon className="w-5 h-5 mr-2 text-gold-default" />
                                            Registrar Nuevo Cliente
                                        </h3>
                                        <button
                                            onClick={() => setIsCreatingCustomer(false)}
                                            className="text-gray-400 hover:text-red-500 transition-colors p-1 hover:bg-gray-100 dark:hover:bg-[#333] rounded-full"
                                        >
                                            <XMarkIcon className="w-6 h-6" />
                                        </button>
                                    </div>

                                    <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-5 bg-white dark:bg-[#1c1c1c] overflow-y-auto flex-1">
                                        <div className="space-y-1">
                                            <label className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wide">Nombre <span className="text-red-500">*</span></label>
                                            <input
                                                placeholder="Ej. Juan"
                                                className="w-full p-3 border border-gray-200 dark:border-gray-700 rounded-lg text-gray-900 dark:text-white bg-gray-50 dark:bg-gray-800 focus:ring-2 focus:ring-gold-default outline-none transition-all"
                                                value={customerForm.firstName}
                                                onChange={e => setCustomerForm({ ...customerForm, firstName: e.target.value })}
                                            />
                                        </div>
                                        <div className="space-y-1">
                                            <label className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wide">Apellido <span className="text-red-500">*</span></label>
                                            <input
                                                placeholder="Ej. Pérez"
                                                className="w-full p-3 border border-gray-200 dark:border-gray-700 rounded-lg text-gray-900 dark:text-white bg-gray-50 dark:bg-gray-800 focus:ring-2 focus:ring-gold-default outline-none transition-all"
                                                value={customerForm.lastName}
                                                onChange={e => setCustomerForm({ ...customerForm, lastName: e.target.value })}
                                            />
                                        </div>

                                        <div className="space-y-1">
                                            <label className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wide">Género</label>
                                            <select
                                                className="w-full p-3 border border-gray-200 dark:border-gray-700 rounded-lg text-gray-900 dark:text-white bg-gray-50 dark:bg-gray-800 focus:ring-2 focus:ring-gold-default outline-none transition-all"
                                                value={customerForm.gender}
                                                onChange={e => setCustomerForm({ ...customerForm, gender: e.target.value })}
                                            >
                                                <option value="MALE">Masculino</option>
                                                <option value="FEMALE">Femenino</option>
                                                <option value="OTHER">Otro</option>
                                            </select>
                                        </div>
                                        <div className="space-y-1">
                                            <label className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wide">Fecha de Nacimiento <span className="text-red-500">*</span></label>
                                            <input
                                                type="date"
                                                className="w-full p-3 border border-gray-200 dark:border-gray-700 rounded-lg text-gray-900 dark:text-white bg-gray-50 dark:bg-gray-800 focus:ring-2 focus:ring-gold-default outline-none transition-all"
                                                value={customerForm.birthDate}
                                                onChange={e => setCustomerForm({ ...customerForm, birthDate: e.target.value })}
                                            />
                                        </div>

                                        <div className="space-y-1">
                                            <label className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wide">Tipo Doc. <span className="text-red-500">*</span></label>
                                            <select
                                                className="w-full p-3 border border-gray-200 dark:border-gray-700 rounded-lg text-gray-900 dark:text-white bg-gray-50 dark:bg-gray-800 focus:ring-2 focus:ring-gold-default outline-none transition-all"
                                                // @ts-ignore
                                                value={customerForm.identificationType || 'PASSPORT'}
                                                onChange={e => setCustomerForm({ ...customerForm, identificationType: e.target.value })}
                                            >
                                                <option value="PASSPORT">Pasaporte</option>
                                                <option value="NATIONAL_ID">DNI / Cédula</option>
                                                <option value="DRIVER_LICENSE">Licencia</option>
                                            </select>
                                        </div>
                                        <div className="space-y-1">
                                            <label className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wide">Número Doc. <span className="text-red-500">*</span></label>
                                            <input
                                                placeholder="A0000000"
                                                className="w-full p-3 border border-gray-200 dark:border-gray-700 rounded-lg text-gray-900 dark:text-white bg-gray-50 dark:bg-gray-800 focus:ring-2 focus:ring-gold-default outline-none transition-all"
                                                value={customerForm.licenseId}
                                                onChange={e => setCustomerForm({ ...customerForm, licenseId: e.target.value })}
                                            />
                                        </div>

                                        <div className="space-y-1">
                                            <label className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wide">Teléfono</label>
                                            <input
                                                placeholder="+1 234 567 890"
                                                className="w-full p-3 border border-gray-200 dark:border-gray-700 rounded-lg text-gray-900 dark:text-white bg-gray-50 dark:bg-gray-800 focus:ring-2 focus:ring-gold-default outline-none transition-all"
                                                value={customerForm.phone}
                                                onChange={e => setCustomerForm({ ...customerForm, phone: e.target.value })}
                                            />
                                        </div>
                                        <div className="space-y-1">
                                            <label className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wide">Email</label>
                                            <input
                                                placeholder="juan@ejemplo.com"
                                                className="w-full p-3 border border-gray-200 dark:border-gray-700 rounded-lg text-gray-900 dark:text-white bg-gray-50 dark:bg-gray-800 focus:ring-2 focus:ring-gold-default outline-none transition-all"
                                                value={customerForm.email}
                                                onChange={e => setCustomerForm({ ...customerForm, email: e.target.value })}
                                            />
                                        </div>

                                        <div className="col-span-1 md:col-span-2 space-y-1">
                                            <label className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wide">Dirección</label>
                                            <input
                                                placeholder="Calle Principal 123"
                                                className="w-full p-3 border border-gray-200 dark:border-gray-700 rounded-lg text-gray-900 dark:text-white bg-gray-50 dark:bg-gray-800 focus:ring-2 focus:ring-gold-default outline-none transition-all"
                                                value={customerForm.addressLine1}
                                                onChange={e => setCustomerForm({ ...customerForm, addressLine1: e.target.value })}
                                            />
                                        </div>
                                        <div className="space-y-1">
                                            <label className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wide">Ciudad</label>
                                            <input
                                                placeholder="Ciudad"
                                                className="w-full p-3 border border-gray-200 dark:border-gray-700 rounded-lg text-gray-900 dark:text-white bg-gray-50 dark:bg-gray-800 focus:ring-2 focus:ring-gold-default outline-none transition-all"
                                                value={customerForm.city}
                                                onChange={e => setCustomerForm({ ...customerForm, city: e.target.value })}
                                            />
                                        </div>
                                        <div className="space-y-1">
                                            <label className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wide">País</label>
                                            <input
                                                placeholder="País"
                                                className="w-full p-3 border border-gray-200 dark:border-gray-700 rounded-lg text-gray-900 dark:text-white bg-gray-50 dark:bg-gray-800 focus:ring-2 focus:ring-gold-default outline-none transition-all"
                                                value={customerForm.country}
                                                onChange={e => setCustomerForm({ ...customerForm, country: e.target.value })}
                                            />
                                        </div>
                                    </div>

                                    {/* Footer */}
                                    <div className="p-5 border-t border-gray-100 dark:border-[#333] bg-gray-50 dark:bg-[#252525] flex justify-end gap-3">
                                        <button
                                            onClick={() => setIsCreatingCustomer(false)}
                                            className="px-6 py-2 rounded-lg font-bold text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white transition-colors"
                                        >
                                            Cancelar
                                        </button>
                                        <button 
                                            onClick={handleCreateCustomer}
                                            disabled={loading}
                                            className="bg-gold-default text-white px-8 py-2 rounded-lg font-bold hover:bg-gold-dark shadow-lg hover:shadow-gold-default/20 transition-all transform active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
                                        >
                                            {loading ? 'Guardando...' : 'Guardar Cliente'}
                                        </button>
                                    </div>
                                </div>
                            </div>
                        )}

                        <div className="flex justify-end mt-8">
                            <button
                                disabled={!selectedCustomer}
                                onClick={() => setStep(2)}
                                className="bg-gray-900 dark:bg-gold-default dark:text-black text-white px-8 py-3 rounded-xl font-bold flex items-center hover:bg-gray-800 dark:hover:bg-gold-light transition-all shadow-lg active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                Continuar
                                <ArrowRightIcon className="w-5 h-5 ml-2" />
                            </button>
                        </div>
                    </div>
                )}

                {/* STEP 2: STAY */}
                {step === 2 && (
                    <div className="animate-fadeIn">
                         <h2 className="text-xl font-bold mb-4 flex items-center text-gray-800 dark:text-white">
                            <CalendarDaysIcon className="w-6 h-6 mr-2 text-gold-default"/>
                            Estancia y Habitación
                        </h2>

                        <div className="flex gap-4 items-end mb-6 bg-gray-50 dark:bg-[#252525] p-4 rounded-lg">
                            <div>
                                <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-1">Check-In</label>
                                <input
                                    type="date"
                                    className="p-2 border border-gray-300 dark:border-[#444] rounded w-40 text-gray-900 dark:text-white bg-white dark:bg-[#2a2a2a]"
                                    value={dates.checkIn}
                                    min={new Date().toISOString().split('T')[0]}
                                    onChange={e => setDates({ ...dates, checkIn: e.target.value })}
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-1">Check-Out</label>
                                <input
                                    type="date"
                                    className="p-2 border border-gray-300 dark:border-[#444] rounded w-40 text-gray-900 dark:text-white bg-white dark:bg-[#2a2a2a]"
                                    value={dates.checkOut}
                                    min={dates.checkIn ? new Date(new Date(dates.checkIn).getTime() + 86400000).toISOString().split('T')[0] : undefined}
                                    onChange={e => setDates({ ...dates, checkOut: e.target.value })}
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-1">Guests</label>
                                <input type="number" min="1" className="p-2 border border-gray-300 dark:border-[#444] rounded w-20 text-gray-900 dark:text-white bg-white dark:bg-[#2a2a2a]" value={guestCount} onChange={e => setGuestCount(parseInt(e.target.value))} />
                            </div>
                            <div>
                                <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-1">Habs.</label>
                                <input
                                    type="number"
                                    min="1"
                                    max="10"
                                    className="p-2 border border-gray-300 dark:border-[#444] rounded w-20 text-gray-900 dark:text-white bg-white dark:bg-[#2a2a2a]"
                                    value={roomCount}
                                    onChange={e => updateRoomCount(parseInt(e.target.value))}
                                />
                            </div>
                             <button 
                                onClick={handleCheckAvailability}
                                className="bg-gold-default text-white px-4 py-2 rounded font-bold hover:bg-gold-dark h-11 transition-all"
                                disabled={loading}
                            >
                                Verificar Disponibilidad
                            </button>
                        </div>

                        {availability.length > 0 && (
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
                                {availability.map((item, idx) => (
                                    <div
                                        key={idx}
                                        onClick={() => item.availableQuantity >= roomCount && handleRoomTypeSelect(item)}
                                         className={`border-2 p-4 rounded-xl transition ${selectedRoomType?.id === item.id
                                                ? 'border-gold-default bg-gold-default/5 dark:bg-gold-default/10'
                                                : item.availableQuantity < roomCount
                                                    ? 'border-gray-200 dark:border-gray-800 opacity-50 cursor-not-allowed'
                                                    : 'border-gray-100 hover:border-gold-default dark:border-gray-800 dark:hover:border-gold-default cursor-pointer'
                                            }`}
                                    >
                                        <h4 className="font-bold text-lg text-gray-900 dark:text-white">{item.name}</h4>
                                        <p className="text-sm text-gray-600 dark:text-gray-400">Capacidad: {item.maxCapacity} pers.</p>
                                        <div className="mt-4 flex justify-between items-center">
                                            <span className="text-2xl font-bold text-gray-900 dark:text-gray-100">${item.basePrice} <span className="text-xs text-gray-500">/noche</span></span>
                                            <span className={`px-2 py-1 rounded text-xs font-bold ${item.availableQuantity >= roomCount ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                                                {item.availableQuantity >= roomCount ? `${item.availableQuantity} Disp.` : 'AGOTADO'}
                                            </span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}

                        <div className="flex justify-between mt-8">
                            <button onClick={() => setStep(1)} className="text-gray-500 font-bold hover:text-gray-800">Atrás</button>
                            <button
                                disabled={!selectedRoomType}
                                onClick={() => setStep(3)}
                                className="bg-gray-900 text-white px-8 py-3 rounded-lg font-bold flex items-center hover:bg-gray-800 disabled:opacity-50"
                            >
                                Continuar
                                <ArrowRightIcon className="w-5 h-5 ml-2" />
                            </button>
                        </div>
                    </div>
                )}

                {/* STEP 3: CONFIRM */}
                {step === 3 && (
                    <div className="animate-fadeIn">
                         <h2 className="text-xl font-bold mb-4 flex items-center text-gray-800 dark:text-white">
                            <CheckCircleIcon className="w-6 h-6 mr-2 text-gold-default"/>
                            Confirmar Reserva Walk-In
                        </h2>

                        <div className="bg-gray-50 dark:bg-[#252525] p-6 rounded-xl border border-gray-200 dark:border-[#333] mb-8 space-y-4 text-gray-900 dark:text-white">
                            <div className="flex justify-between border-b dark:border-[#444] pb-2">
                                <span className="text-gray-600 dark:text-gray-300">Cliente Principal</span>
                                <span className="font-bold">{selectedCustomer?.firstName} {selectedCustomer?.lastName}</span>
                            </div>
                            <div className="flex justify-between border-b dark:border-[#444] pb-2">
                                <span className="text-gray-600 dark:text-gray-300">Fechas</span>
                                <span className="font-bold">{dates.checkIn} a {dates.checkOut} ({getNights()} noches)</span>
                            </div>

                            <div className="py-4">
                                <h3 className="font-bold mb-3 text-gold-default">Habitaciones y Ocupantes</h3>
                                <div className="space-y-3">
                                    {bookingItems.map((item, idx) => (
                                        <div key={idx} className="bg-white dark:bg-[#1c1c1c] p-3 rounded border border-gray-200 dark:border-[#444]">
                                            <div className="flex justify-between items-center mb-2">
                                                <span className="font-bold text-sm">Habitación {idx + 1}: {item.roomType.name}</span>
                                                <span className="text-sm font-bold">${item.roomType.basePrice * getNights()}</span>
                                            </div>
                                            <div>
                                                <label className="block text-xs font-bold text-gray-500 mb-1">Nombre del Ocupante</label>
                                                <input
                                                    type="text"
                                                    className="w-full p-2 border border-gray-200 dark:border-gray-700 rounded text-sm bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white"
                                                    placeholder="Nombre Completo"
                                                    value={item.occupantName}
                                                    onChange={(e) => updateItemOccupant(idx, e.target.value)}
                                                />
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            <div className="flex justify-between pt-4 border-t border-gray-200 dark:border-[#444]">
                                <span className="text-lg text-gray-800 dark:text-gray-100 font-bold">Total General</span>
                                <span className="text-2xl font-bold text-gold-default">
                                    ${bookingItems.reduce((acc, item) => acc + (item.roomType.basePrice * getNights()), 0)}
                                </span>
                            </div>
                        </div>

                        <div className="flex justify-between mt-8">
                            <button onClick={() => setStep(2)} className="text-gray-500 font-bold hover:text-gray-800 dark:hover:text-white transition-colors">Atrás</button>
                            <button
                                onClick={handleConfirmBooking}
                                className="bg-gold-default hover:bg-gold-dark text-white px-10 py-4 rounded-xl font-bold flex items-center shadow-xl shadow-gold-default/20 transform hover:scale-105 transition-all active:scale-95"
                                disabled={loading}
                            >
                                <CheckCircleIcon className="w-6 h-6 mr-2" />
                                CONFIRMAR Y CREAR
                            </button>
                        </div>
                    </div>
                )}

            </div>
        </div>
    );
};

export default WalkInWizard;
