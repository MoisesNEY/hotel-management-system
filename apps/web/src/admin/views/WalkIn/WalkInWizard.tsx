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
import { getAllRooms } from '../../../services/admin/roomService';
import type { CustomerDTO, RoomTypeAvailabilityDTO, RoomDTO } from '../../../types/adminTypes';

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
    const [availableRooms, setAvailableRooms] = useState<RoomDTO[]>([]); // For specific room assignment
    const [assignedRoom, setAssignedRoom] = useState<RoomDTO | null>(null);

    // Step 1 Handlers
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
            // @ts-ignore
            const newCustomer = await createWalkInCustomer(customerForm);
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
        setLoading(true);
        try {
            const results = await checkAvailability(dates.checkIn, dates.checkOut);
            setAvailability(results);
            if (results.length === 0) toast.error('No hay disponibilidad');
        } catch (error) {
            console.error(error);
            toast.error('Error verificando disponibilidad');
        } finally {
            setLoading(false);
        }
    };

    const handleRoomTypeSelect = async (type: RoomTypeAvailabilityDTO) => {
        setSelectedRoomType(type);
        setAssignedRoom(null); // Reset room
        // Fetch specific rooms for this type that are available (Optional polish)
        // For now, allow selecting from all rooms of this type? 
        // Logic to get ONLY available rooms is complex without a dedicated endpoint.
        // We will skip specific room assignment for the wizard or fetch all and filter client side?
        // Let's implement partial logic: fetch all rooms of type.
        try {
            const allRoomsRes = await getAllRooms(0, 100, 'roomNumber,asc');
            // Check if getAllRooms supports filtering by roomType? Assuming it returns data.
            // Client side filter:
            if (allRoomsRes.data) {
                const filtered = allRoomsRes.data.filter(r => r.roomType.id === type.roomType.id && r.status === 'AVAILABLE');
                setAvailableRooms(filtered);
            }
        } catch(e) { console.error(e) }
    };

    // Step 3 Confirmation
    const handleConfirmBooking = async () => {
        if (!selectedCustomer || !selectedRoomType || !dates.checkIn || !dates.checkOut) return;

        setLoading(true);
        const bookingDTO: any = { // BookingDTO
            customer: selectedCustomer,
            checkInDate: dates.checkIn,
            checkOutDate: dates.checkOut,
            guestCount: guestCount,
            status: 'PENDING_PAYMENT',
            items: [
                {
                    roomType: selectedRoomType.roomType,
                    price: selectedRoomType.totalPrice, // Or unit price? AvailabilityDTO total is usually total period
                    assignedRoom: assignedRoom || undefined
                }
            ]
        };

        try {
            const created = await createWalkInBooking(bookingDTO);
            toast.success('Reserva Walk-In creada!');
            navigate(`/admin/bookings/${created.id}`);
        } catch (error) {
            console.error(error);
            toast.error('Error al confirmar reserva');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="p-6 max-w-5xl mx-auto">
            <h1 className="text-3xl font-bold mb-8 text-gold-500 font-display">Walk-In (Recepción)</h1>
            
            {/* Stepper */}
            <div className="flex items-center mb-8">
                {[1, 2, 3].map((s) => (
                    <div key={s} className="flex items-center">
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold ${
                            step === s ? 'bg-gold-500 text-white' : 
                            step > s ? 'bg-green-500 text-white' : 'bg-gray-200 text-gray-500'
                        }`}>
                            {step > s ? <CheckCircleIcon className="w-5 h-5"/> : s}
                        </div>
                        {s < 3 && <div className={`w-20 h-1 mx-2 ${step > s ? 'bg-green-500' : 'bg-gray-200'}`} />}
                    </div>
                ))}
            </div>

            <div className="bg-white dark:bg-[#1c1c1c] p-8 rounded-xl shadow-lg border border-gray-100 dark:border-[#333] transition-colors">
                
                {/* STEP 1: CUSTOMER */}
                {step === 1 && (
                    <div className="animate-fadeIn">
                        <h2 className="text-xl font-bold mb-4 flex items-center text-gray-800 dark:text-white">
                            <UserIcon className="w-6 h-6 mr-2 text-gold-500"/>
                             Identificación del Cliente
                        </h2>
                        
                        {!selectedCustomer && !isCreatingCustomer && (
                            <div className="flex gap-4 mb-6">
                                <input 
                                    type="text" 
                                    placeholder="Buscar por DNI / Pasaporte..." 
                                    className="flex-1 p-3 border border-gray-300 dark:border-[#444] rounded-lg focus:ring-2 focus:ring-gold-500 outline-none text-gray-900 dark:text-gray-100 bg-gray-50 dark:bg-[#2a2a2a] placeholder-gray-500 dark:placeholder-gray-400"
                                    value={licenseSearch}
                                    onChange={(e) => setLicenseSearch(e.target.value)}
                                    onKeyDown={(e) => e.key === 'Enter' && handleSearchCustomer()}
                                />
                                <button 
                                    onClick={handleSearchCustomer}
                                    className="bg-gold-500 text-white px-6 py-3 rounded-lg font-bold hover:bg-gold-600 transition flex items-center"
                                    disabled={loading}
                                >
                                    <MagnifyingGlassIcon className="w-5 h-5 mr-2"/>
                                    Buscar
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
                                            <UserIcon className="w-5 h-5 mr-2 text-gold-500" />
                                            Registrar Nuevo Cliente
                                        </h3>
                                        <button 
                                            onClick={() => setIsCreatingCustomer(false)} 
                                            className="text-gray-400 hover:text-red-500 transition-colors p-1 hover:bg-gray-100 dark:hover:bg-[#333] rounded-full"
                                        >
                                            <XMarkIcon className="w-6 h-6" />
                                        </button>
                                    </div>
                                    
                                    <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-5 bg-white dark:bg-[#1c1c1c]">
                                        <div className="space-y-1">
                                            <label className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wide">Nombre <span className="text-red-500">*</span></label>
                                            <input 
                                                placeholder="Ej. Juan" 
                                                className="w-full p-3 border border-gray-300 dark:border-[#444] rounded-lg text-gray-900 dark:text-white bg-gray-50 dark:bg-[#2a2a2a] focus:ring-2 focus:ring-gold-500 outline-none transition-all" 
                                                value={customerForm.firstName} 
                                                onChange={e => setCustomerForm({...customerForm, firstName: e.target.value})} 
                                            />
                                        </div>
                                        <div className="space-y-1">
                                            <label className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wide">Apellido <span className="text-red-500">*</span></label>
                                            <input 
                                                placeholder="Ej. Pérez" 
                                                className="w-full p-3 border border-gray-300 dark:border-[#444] rounded-lg text-gray-900 dark:text-white bg-gray-50 dark:bg-[#2a2a2a] focus:ring-2 focus:ring-gold-500 outline-none transition-all" 
                                                value={customerForm.lastName} 
                                                onChange={e => setCustomerForm({...customerForm, lastName: e.target.value})} 
                                            />
                                        </div>

                                        <div className="space-y-1">
                                            <label className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wide">Género</label>
                                            <select 
                                                className="w-full p-3 border border-gray-300 dark:border-[#444] rounded-lg text-gray-900 dark:text-white bg-gray-50 dark:bg-[#2a2a2a] focus:ring-2 focus:ring-gold-500 outline-none transition-all"
                                                value={customerForm.gender}
                                                onChange={e => setCustomerForm({...customerForm, gender: e.target.value})}
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
                                                className="w-full p-3 border border-gray-300 dark:border-[#444] rounded-lg text-gray-900 dark:text-white bg-gray-50 dark:bg-[#2a2a2a] focus:ring-2 focus:ring-gold-500 outline-none transition-all" 
                                                value={customerForm.birthDate} 
                                                onChange={e => setCustomerForm({...customerForm, birthDate: e.target.value})} 
                                            />
                                        </div>

                                        <div className="space-y-1">
                                            <label className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wide">Tipo Doc. <span className="text-red-500">*</span></label>
                                            <select 
                                                 className="w-full p-3 border border-gray-300 dark:border-[#444] rounded-lg text-gray-900 dark:text-white bg-gray-50 dark:bg-[#2a2a2a] focus:ring-2 focus:ring-gold-500 outline-none transition-all"
                                                 // @ts-ignore
                                                 value={customerForm.identificationType || 'PASSPORT'}
                                                 onChange={e => setCustomerForm({...customerForm, identificationType: e.target.value})}
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
                                                className="w-full p-3 border border-gray-300 dark:border-[#444] rounded-lg text-gray-900 dark:text-white bg-gray-50 dark:bg-[#2a2a2a] focus:ring-2 focus:ring-gold-500 outline-none transition-all" 
                                                value={customerForm.licenseId} 
                                                onChange={e => setCustomerForm({...customerForm, licenseId: e.target.value})} 
                                            />
                                        </div>

                                        <div className="space-y-1">
                                            <label className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wide">Teléfono</label>
                                            <input 
                                                placeholder="+1 234 567 890" 
                                                className="w-full p-3 border border-gray-300 dark:border-[#444] rounded-lg text-gray-900 dark:text-white bg-gray-50 dark:bg-[#2a2a2a] focus:ring-2 focus:ring-gold-500 outline-none transition-all" 
                                                value={customerForm.phone} 
                                                onChange={e => setCustomerForm({...customerForm, phone: e.target.value})} 
                                            />
                                        </div>
                                        <div className="space-y-1">
                                            <label className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wide">Email</label>
                                            <input 
                                                placeholder="juan@ejemplo.com" 
                                                className="w-full p-3 border border-gray-300 dark:border-[#444] rounded-lg text-gray-900 dark:text-white bg-gray-50 dark:bg-[#2a2a2a] focus:ring-2 focus:ring-gold-500 outline-none transition-all" 
                                                value={customerForm.email} 
                                                onChange={e => setCustomerForm({...customerForm, email: e.target.value})} 
                                            />
                                        </div>

                                        <div className="col-span-1 md:col-span-2 space-y-1">
                                            <label className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wide">Dirección</label>
                                            <input 
                                                placeholder="Calle Principal 123" 
                                                className="w-full p-3 border border-gray-300 dark:border-[#444] rounded-lg text-gray-900 dark:text-white bg-gray-50 dark:bg-[#2a2a2a] focus:ring-2 focus:ring-gold-500 outline-none transition-all" 
                                                value={customerForm.addressLine1} 
                                                onChange={e => setCustomerForm({...customerForm, addressLine1: e.target.value})} 
                                            />
                                        </div>
                                        <div className="space-y-1">
                                            <label className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wide">Ciudad</label>
                                            <input 
                                                placeholder="Ciudad" 
                                                className="w-full p-3 border border-gray-300 dark:border-[#444] rounded-lg text-gray-900 dark:text-white bg-gray-50 dark:bg-[#2a2a2a] focus:ring-2 focus:ring-gold-500 outline-none transition-all" 
                                                value={customerForm.city} 
                                                onChange={e => setCustomerForm({...customerForm, city: e.target.value})} 
                                            />
                                        </div>
                                        <div className="space-y-1">
                                            <label className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wide">País</label>
                                            <input 
                                                placeholder="País" 
                                                className="w-full p-3 border border-gray-300 dark:border-[#444] rounded-lg text-gray-900 dark:text-white bg-gray-50 dark:bg-[#2a2a2a] focus:ring-2 focus:ring-gold-500 outline-none transition-all" 
                                                value={customerForm.country} 
                                                onChange={e => setCustomerForm({...customerForm, country: e.target.value})} 
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
                                            className="bg-gold-500 text-white px-8 py-2 rounded-lg font-bold hover:bg-gold-600 shadow-lg hover:shadow-gold-500/20 transition-all transform active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
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
                                className="bg-gray-900 text-white px-8 py-3 rounded-lg font-bold flex items-center hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed"
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
                            <CalendarDaysIcon className="w-6 h-6 mr-2 text-gold-500"/>
                            Estancia y Habitación
                        </h2>

                        <div className="flex gap-4 items-end mb-6 bg-gray-50 dark:bg-[#252525] p-4 rounded-lg">
                            <div>
                                <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-1">Check-In</label>
                                <input type="date" className="p-2 border border-gray-300 dark:border-[#444] rounded w-40 text-gray-900 dark:text-white bg-white dark:bg-[#2a2a2a]" value={dates.checkIn} onChange={e => setDates({...dates, checkIn: e.target.value})} />
                            </div>
                            <div>
                                <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-1">Check-Out</label>
                                <input type="date" className="p-2 border border-gray-300 dark:border-[#444] rounded w-40 text-gray-900 dark:text-white bg-white dark:bg-[#2a2a2a]" value={dates.checkOut} onChange={e => setDates({...dates, checkOut: e.target.value})} />
                            </div>
                            <div>
                                <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-1">Guests</label>
                                <input type="number" min="1" className="p-2 border border-gray-300 dark:border-[#444] rounded w-20 text-gray-900 dark:text-white bg-white dark:bg-[#2a2a2a]" value={guestCount} onChange={e => setGuestCount(parseInt(e.target.value))} />
                            </div>
                            <button 
                                onClick={handleCheckAvailability}
                                className="bg-gold-500 text-white px-4 py-2 rounded font-bold hover:bg-gold-600 h-10"
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
                                        onClick={() => handleRoomTypeSelect(item)}
                                        className={`cursor-pointer border-2 p-4 rounded-xl transition ${
                                            selectedRoomType?.roomType.id === item.roomType.id 
                                            ? 'border-gold-500 bg-gold-50 dark:bg-opacity-10' 
                                            : 'border-gray-100 hover:border-gold-300 dark:border-[#333] dark:hover:border-gold-500'
                                        }`}
                                    >
                                        <h4 className="font-bold text-lg text-gray-900 dark:text-white">{item.roomType.name}</h4>
                                        <p className="text-sm text-gray-600 dark:text-gray-400">{item.roomType.description}</p>
                                        <div className="mt-4 flex justify-between items-center">
                                            <span className="text-2xl font-bold text-gray-900 dark:text-gray-100">${item.totalPrice}</span>
                                            <span className="bg-green-100 text-green-700 px-2 py-1 rounded text-xs font-bold">
                                                {item.availableCount} Disp.
                                            </span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                        
                        {selectedRoomType && (
                            <div className="mb-6 p-4 border border-blue-200 dark:border-blue-900 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                                <label className="block text-sm font-bold text-blue-800 dark:text-blue-300 mb-2">Asignar Habitación Específica (Opcional)</label>
                                <select 
                                    className="w-full p-2 border border-gray-300 dark:border-gray-500 rounded text-gray-900 dark:text-white bg-white dark:bg-gray-800"
                                    onChange={(e) => {
                                        const r = availableRooms.find(room => room.id === parseInt(e.target.value));
                                        setAssignedRoom(r || null);
                                    }}
                                    value={assignedRoom?.id || ''}
                                >
                                    <option value="">Automático (Cualquier disponible)</option>
                                    {availableRooms.map(r => (
                                        <option key={r.id} value={r.id}>Habitación {r.roomNumber}</option>
                                    ))}
                                </select>
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
                            <CheckCircleIcon className="w-6 h-6 mr-2 text-gold-500"/>
                            Confirmar Reserva Walk-In
                        </h2>

                        <div className="bg-gray-50 dark:bg-[#252525] p-6 rounded-xl border border-gray-200 dark:border-[#333] mb-8 space-y-4 text-gray-900 dark:text-white">
                            <div className="flex justify-between border-b dark:border-[#444] pb-2">
                                <span className="text-gray-600 dark:text-gray-300">Cliente</span>
                                <span className="font-bold">{selectedCustomer?.firstName} {selectedCustomer?.lastName}</span>
                            </div>
                            <div className="flex justify-between border-b dark:border-[#444] pb-2">
                                <span className="text-gray-600 dark:text-gray-300">DNI</span>
                                <span className="font-bold">{selectedCustomer?.licenseId}</span>
                            </div>
                            <div className="flex justify-between border-b dark:border-[#444] pb-2">
                                <span className="text-gray-600 dark:text-gray-300">Fechas</span>
                                <span className="font-bold">{dates.checkIn} a {dates.checkOut}</span>
                            </div>
                            <div className="flex justify-between border-b dark:border-[#444] pb-2">
                                <span className="text-gray-600 dark:text-gray-300">Habitación</span>
                                <span className="font-bold">
                                    {selectedRoomType?.roomType.name} 
                                    {assignedRoom ? ` - #${assignedRoom.roomNumber}` : ' (Asignación Automática)'}
                                </span>
                            </div>
                            <div className="flex justify-between pt-2">
                                <span className="text-lg text-gray-800 dark:text-gray-100">Total a Pagar</span>
                                <span className="text-2xl font-bold text-gold-600">${selectedRoomType?.totalPrice}</span>
                            </div>
                        </div>

                        <div className="flex justify-between mt-8">
                             <button onClick={() => setStep(2)} className="text-gray-500 font-bold hover:text-gray-800">Atrás</button>
                             <button
                                onClick={handleConfirmBooking}
                                className="bg-gold-500 text-white px-8 py-3 rounded-lg font-bold flex items-center hover:bg-gold-600 shadow-lg transform hover:scale-105 transition"
                                disabled={loading}
                             >
                                <CheckCircleIcon className="w-5 h-5 mr-2" />
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
