import React, { useState, useEffect } from 'react';
import { Bed, Users, Maximize, Check, X, Calendar, User, CreditCard, FileText } from 'lucide-react';
import { createBooking } from '../services/client/bookingService';
import { getAllRoomTypes } from '../services/admin/roomTypeService';
import type { RoomTypeDTO } from '../types/adminTypes';

type RoomType = RoomTypeDTO;

export const BookingStatus = {
  PENDING: 'PENDING',
  CONFIRMED: 'CONFIRMED',
  CANCELLED: 'CANCELLED',
  COMPLETED: 'COMPLETED'
} as const;

export type BookingStatus = typeof BookingStatus[keyof typeof BookingStatus];

const RoomTypes: React.FC = () => {
  const [roomTypes, setRoomTypes] = useState<RoomTypeDTO[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [selectedRoom, setSelectedRoom] = useState<RoomType | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [successBookingDetails, setSuccessBookingDetails] = useState<{
    roomName: string;
    checkInDate: string;
    checkOutDate: string;
    guestCount: number;
    nights: number;
    totalPrice: number;
  } | null>(null);
  const [showErrorModal, setShowErrorModal] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string>('');
  
  const [formData, setFormData] = useState({
    checkInDate: '',
    checkOutDate: '',
    guestCount: 1,
    status: BookingStatus.PENDING,
    totalPrice: 0,
    notes: ''
  });

  useEffect(() => {
    const fetchRoomTypes = async () => {
      try {
        setLoading(true);
        const response = await getAllRoomTypes(0, 100);
        console.log('[RoomTypes] Loaded:', response);
        setRoomTypes(response.data);
      } catch (err) {
        console.error('[RoomTypes] Error fetching room types:', err);
        setError('No se pudieron cargar los tipos de habitación.');
      } finally {
        setLoading(false);
      }
    };

    fetchRoomTypes();
  }, []);

  const handleReservation = async (room: RoomType) => {
    const { default: keycloak } = await import('../services/keycloak');
    
    if (!keycloak.authenticated) {
        alert('Debes iniciar sesión para realizar una reserva.');
        keycloak.login();
        return;
    }

    console.log('Abriendo modal para:', room.name);
    setSelectedRoom(room);
    setShowModal(true);
    
    const initialTotalPrice = calculateTotalPrice(room.basePrice, 1, 1);
    
    setFormData({
      checkInDate: '',
      checkOutDate: '',
      guestCount: 1,
      status: BookingStatus.PENDING,
      totalPrice: initialTotalPrice,
      notes: ''
    });
  };

  const closeModal = () => {
    console.log('Cerrando modal');
    setShowModal(false);
    setSelectedRoom(null);
  };

  const handleOverlayClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      closeModal();
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    
    let updatedData: any = {
      ...formData,
      [name]: value
    };

    if (name === 'guestCount') {
      const guestCount = parseInt(value);
      updatedData.guestCount = guestCount;
      
      if (selectedRoom) {
        const nights = calculateNights();
        updatedData.totalPrice = calculateTotalPrice(selectedRoom.basePrice, guestCount, nights);
      }
    }

    if (name === 'checkInDate' || name === 'checkOutDate') {
      if (selectedRoom && formData.checkInDate && formData.checkOutDate) {
        const nights = calculateNights();
        updatedData.totalPrice = calculateTotalPrice(selectedRoom.basePrice, formData.guestCount, nights);
      }
    }

    setFormData(updatedData);
  };

  const calculateNights = () => {
    if (!formData.checkInDate || !formData.checkOutDate) return 1;
    
    const checkIn = new Date(formData.checkInDate);
    const checkOut = new Date(formData.checkOutDate);
    const diffTime = Math.abs(checkOut.getTime() - checkIn.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays > 0 ? diffDays : 1;
  };

  const calculateTotalPrice = (basePrice: number, guestCount: number, nights: number) => {
    let total = basePrice * nights;
    const extraGuests = Math.max(0, guestCount - 1);
    total += extraGuests * 30 * nights;
    return total;
  };

  const getMinCheckoutDate = () => {
    if (!formData.checkInDate) return '';
    const checkInDate = new Date(formData.checkInDate);
    checkInDate.setDate(checkInDate.getDate() + 1);
    return checkInDate.toISOString().split('T')[0];
  };

  const getTodayDate = () => {
    return new Date().toISOString().split('T')[0];
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.checkInDate || !formData.checkOutDate) {
      alert('Por favor, selecciona las fechas de check-in y check-out');
      return;
    }
    
    if (formData.guestCount < 1) {
      alert('El número de huéspedes debe ser al menos 1');
      return;
    }
    
    if (selectedRoom && formData.guestCount > selectedRoom.maxCapacity) {
      alert(`El número máximo de huéspedes para esta habitación es ${selectedRoom.maxCapacity}`);
      return;
    }
    
    const checkIn = new Date(formData.checkInDate);
    const checkOut = new Date(formData.checkOutDate);
    if (checkOut <= checkIn) {
      alert('La fecha de check-out debe ser posterior a la fecha de check-in');
      return;
    }
    
    const nights = calculateNights();
    const finalTotalPrice = selectedRoom ? 
      calculateTotalPrice(selectedRoom.basePrice, formData.guestCount, nights) : 0;

    try {
      setIsSubmitting(true);
      
      await createBooking({
        roomTypeId: selectedRoom!.id,
        checkInDate: formData.checkInDate,
        checkOutDate: formData.checkOutDate,
        guestCount: formData.guestCount,
        notes: formData.notes
      });

      setSuccessBookingDetails({
        roomName: selectedRoom!.name,
        checkInDate: formData.checkInDate,
        checkOutDate: formData.checkOutDate,
        guestCount: formData.guestCount,
        nights,
        totalPrice: finalTotalPrice
      });
      setShowSuccessModal(true);
      closeModal();
    } catch (error) {
      console.error('Error al enviar la reserva:', error);
      setErrorMessage('No se pudo registrar la reserva. Inténtalo nuevamente.');
      setShowErrorModal(true);
      closeModal();
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <section className="bg-white dark:bg-[#1a1a2e] py-20" id="habitaciones">
        <div className="max-w-7xl mx-auto px-5">
          <h2 className="text-center text-4xl text-gray-900 dark:text-white mb-4 relative pb-4 font-semibold after:content-[''] after:absolute after:bottom-0 after:left-1/2 after:-translate-x-1/2 after:w-20 after:h-0.5 after:bg-gradient-to-r after:from-[#d4af37] after:via-[#ffd95a] after:to-[#d4af37] after:rounded-sm">
            Tipos de Habitación
          </h2>
          
          {loading ? (
            <div className="flex justify-center py-20">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#d4af37]"></div>
            </div>
          ) : error ? (
             <div className="text-center py-10 text-red-500 bg-red-50 dark:bg-red-900/20 rounded-xl p-4">
               {error}
             </div>
          ) : roomTypes.length === 0 ? (
            <div className="text-center py-20 bg-gray-50 dark:bg-gray-800/50 rounded-xl">
               <Bed className="mx-auto h-12 w-12 text-gray-400 dark:text-gray-600 mb-4" />
               <h3 className="text-xl text-gray-600 dark:text-gray-400 font-medium">No hay tipos de habitación disponibles</h3>
               <p className="text-gray-500 dark:text-gray-500 mt-2">Por favor, vuelve a consultar más tarde.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mt-12">
              {roomTypes.map((room) => (
                <div key={room.id} className="group bg-white dark:bg-[#1e1e3e] rounded-xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-300 hover:-translate-y-2 border border-gray-100 dark:border-gray-700">
                  <div className="relative overflow-hidden h-64">
                    <img 
                      src={room.imageUrl || 'https://images.unsplash.com/photo-1611892440504-42a792e24d32?w=600'} 
                      alt={room.name}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                    />
                    <div className="absolute top-4 right-4 bg-green-500 text-white px-4 py-1.5 rounded text-sm font-semibold uppercase tracking-wide shadow-lg z-10">
                      Disponible
                    </div>
                  </div>
                  <div className="p-6">
                    <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-3">{room.name}</h3>
                    <p className="text-gray-600 dark:text-gray-400 mb-6 leading-relaxed">{room.description || 'Sin descripción disponible.'}</p>
                    
                    <div className="flex justify-around mb-6 pb-6 border-b border-gray-200 dark:border-gray-700">
                      <div className="flex flex-col items-center gap-2">
                        <Maximize size={18} className="text-[#2a9d8f]" />
                        <span className="text-sm text-gray-700 dark:text-gray-300 font-medium">{room.area || 0} m²</span>
                      </div>
                      <div className="flex flex-col items-center gap-2">
                        <Users size={18} className="text-[#2a9d8f]" />
                        <span className="text-sm text-gray-700 dark:text-gray-300 font-medium">{room.maxCapacity} personas</span>
                      </div>
                      <div className="flex flex-col items-center gap-2">
                        <Bed size={18} className="text-[#2a9d8f]" />
                        <span className="text-sm text-gray-700 dark:text-gray-300 font-medium">{room.beds || 1} {(!room.beds || room.beds === 1) ? 'cama' : 'camas'}</span>
                      </div>
                    </div>
                    
                    <div className="mt-6 pt-5 border-t border-gray-200 dark:border-gray-700">
                      <div className="text-center mb-5">
                        <div className="mb-2">
                          <span className="text-2xl font-bold text-gray-900 dark:text-white align-super">$</span>
                          <span className="text-4xl font-extrabold text-gray-900 dark:text-white tracking-tight">{room.basePrice}</span>
                          <span className="text-base text-gray-600 dark:text-gray-400 font-normal ml-2">/noche</span>
                        </div>
                        <div className="text-sm text-[#2a9d8f] font-medium">Impuestos incluidos</div>
                      </div>
                      
                      <button 
                        className="w-full bg-[#1a1a2e] dark:bg-gradient-to-r dark:from-[#1a1a2e] dark:to-[#2c3e50] text-white py-3.5 px-8 rounded-lg font-semibold text-base cursor-pointer transition-all duration-300 uppercase tracking-wide hover:bg-[#2c3e50] hover:-translate-y-0.5 hover:shadow-xl active:translate-y-0"
                        onClick={() => handleReservation(room)}
                        type="button"
                      >
                        RESERVAR AHORA
                      </button>
                      
                      <div className="flex justify-center gap-5 mt-4 mb-5">
                        <div className="text-center">
                          <div className="w-6 h-6 mx-auto mb-1 text-[#2a9d8f]">
                            <Check size={16} />
                          </div>
                          <div className="text-xs text-gray-600 dark:text-gray-400 font-medium">
                            Cancelación gratuita
                          </div>
                        </div>
                        <div className="text-center">
                          <div className="w-6 h-6 mx-auto mb-1 text-[#2a9d8f]">
                            <Check size={16} />
                          </div>
                          <div className="text-xs text-gray-600 dark:text-gray-400 font-medium">
                            Desayuno incluido
                          </div>
                        </div>
                      </div>
                      
                      <div className="inline-block bg-gray-100 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 px-3 py-1 rounded text-xs text-[#2a9d8f] dark:text-[#4cc9f0] font-semibold mt-2.5">
                        Calidad Garantizada
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Modal de Reserva */}
      {showModal && selectedRoom && (
        <div 
          className="fixed inset-0 bg-black/70 dark:bg-black/80 flex justify-center items-center z-[9999] p-5"
          onClick={handleOverlayClick}
        >
          <div 
            className="relative bg-white dark:bg-[#1e1e3e] rounded-xl w-full max-w-[900px] max-h-[85vh] overflow-y-auto shadow-[0_10px_30px_rgba(0,0,0,0.3)] animate-[modalSlideIn_0.3s_ease-out]"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="pb-5 mb-5 border-b border-gray-200 dark:border-gray-700 p-8">
              <h3 className="m-0 text-gray-900 dark:text-white text-2xl font-semibold">Reservar: {selectedRoom.name}</h3>
              <button 
                className="absolute top-4 right-4 bg-transparent border-none cursor-pointer p-2 rounded-full transition-colors duration-200 hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-600 dark:text-gray-400"
                onClick={closeModal}
                type="button"
                aria-label="Cerrar modal"
              >
                <X size={24} />
              </button>
            </div>
            
            <div className="px-8 pb-8">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8 pb-5 border-b border-gray-200 dark:border-gray-700">
                <div className="flex gap-5 items-start">
                  <img src={selectedRoom.imageUrl} alt={selectedRoom.name} className="w-[150px] h-[150px] rounded-lg object-cover" />
                  <div>
                    <h4 className="m-0 mb-2.5 text-gray-900 dark:text-white font-semibold">{selectedRoom.name}</h4>
                    <p className="m-0 mb-2.5 text-gray-600 dark:text-gray-400 text-sm leading-snug">{selectedRoom.description}</p>
                    <div className="flex flex-wrap gap-2.5 mt-2.5">
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-gray-100 dark:bg-gray-700 rounded text-xs text-gray-700 dark:text-gray-300">
                        <Maximize size={14} /> {selectedRoom.area} m²
                      </span>
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-gray-100 dark:bg-gray-700 rounded text-xs text-gray-700 dark:text-gray-300">
                        <Users size={14} /> Máx: {selectedRoom.maxCapacity} personas
                      </span>
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-gray-100 dark:bg-gray-700 rounded text-xs text-gray-700 dark:text-gray-300">
                        <Bed size={14} /> {selectedRoom.beds} {selectedRoom.beds === 1 ? 'cama' : 'camas'}
                      </span>
                    </div>
                  </div>
                </div>
                
                <div className="bg-gray-50 dark:bg-gray-800/50 p-5 rounded-lg border border-gray-200 dark:border-gray-700">
                  <div className="flex justify-between py-2.5 border-b border-dashed border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300">
                    <span>Precio base/noche:</span>
                    <span className="font-semibold">${selectedRoom.basePrice}</span>
                  </div>
                  <div className="flex justify-between py-2.5 border-b border-dashed border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300">
                    <span>Noches:</span>
                    <span className="font-semibold">{calculateNights()}</span>
                  </div>
                  <div className="flex justify-between py-2.5 text-gray-700 dark:text-gray-300">
                    <span>Huéspedes extra:</span>
                    <span className="font-semibold">${Math.max(0, formData.guestCount - 1) * 30}/noche c/u</span>
                  </div>
                  <div className="flex justify-between pt-4 mt-4 border-t-2 border-gray-900 dark:border-gray-400 font-bold text-gray-900 dark:text-white text-lg">
                    <span>Total estimado:</span>
                    <span className="text-[#2a9d8f] text-xl">${formData.totalPrice}</span>
                  </div>
                </div>
              </div>
              
              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Fechas */}
                <div className="bg-gray-50 dark:bg-gray-800/50 p-5 rounded-lg border border-gray-200 dark:border-gray-700">
                  <h4 className="flex items-center gap-2 mb-4 text-gray-900 dark:text-white font-semibold">
                    <Calendar size={18} /> Fechas de Estadía
                  </h4>
                  <p className="text-gray-600 dark:text-gray-400 text-sm mb-4 italic">Los campos marcados con * son obligatorios</p>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    <div className="flex flex-col">
                      <label htmlFor="checkInDate" className="mb-2 font-medium text-gray-700 dark:text-gray-300 text-sm">Check-in *</label>
                      <input
                        type="date"
                        id="checkInDate"
                        name="checkInDate"
                        value={formData.checkInDate}
                        onChange={handleInputChange}
                        min={getTodayDate()}
                        className="p-3 border border-gray-300 dark:border-gray-600 rounded-md text-base bg-white dark:bg-gray-700 text-gray-900 dark:text-white transition-all duration-200 focus:outline-none focus:border-gray-900 dark:focus:border-gray-400 focus:shadow-[0_0_0_3px_rgba(26,26,46,0.1)]"
                        required
                      />
                      <small className="text-gray-500 dark:text-gray-400 text-xs mt-1">Fecha de entrada</small>
                    </div>
                    <div className="flex flex-col">
                      <label htmlFor="checkOutDate" className="mb-2 font-medium text-gray-700 dark:text-gray-300 text-sm">Check-out *</label>
                      <input
                        type="date"
                        id="checkOutDate"
                        name="checkOutDate"
                        value={formData.checkOutDate}
                        onChange={handleInputChange}
                        min={getMinCheckoutDate()}
                        disabled={!formData.checkInDate}
                        className="p-3 border border-gray-300 dark:border-gray-600 rounded-md text-base bg-white dark:bg-gray-700 text-gray-900 dark:text-white transition-all duration-200 focus:outline-none focus:border-gray-900 dark:focus:border-gray-400 focus:shadow-[0_0_0_3px_rgba(26,26,46,0.1)] disabled:opacity-50 disabled:cursor-not-allowed"
                        required
                      />
                      <small className="text-gray-500 dark:text-gray-400 text-xs mt-1">Fecha de salida</small>
                    </div>
                  </div>
                </div>
                
                {/* Huéspedes */}
                <div className="bg-gray-50 dark:bg-gray-800/50 p-5 rounded-lg border border-gray-200 dark:border-gray-700">
                  <h4 className="flex items-center gap-2 mb-4 text-gray-900 dark:text-white font-semibold">
                    <User size={18} /> Información de Huéspedes
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    <div className="flex flex-col">
                      <label htmlFor="guestCount" className="mb-2 font-medium text-gray-700 dark:text-gray-300 text-sm">Número de huéspedes *</label>
                      <select
                        id="guestCount"
                        name="guestCount"
                        value={formData.guestCount}
                        onChange={handleInputChange}
                        className="p-3 border border-gray-300 dark:border-gray-600 rounded-md text-base bg-white dark:bg-gray-700 text-gray-900 dark:text-white transition-all duration-200 focus:outline-none focus:border-gray-900 dark:focus:border-gray-400 focus:shadow-[0_0_0_3px_rgba(26,26,46,0.1)]"
                        required
                      >
                        {[...Array(selectedRoom.maxCapacity)].map((_, i) => (
                          <option key={i} value={i + 1}>
                            {i + 1} {i === 0 ? 'persona' : 'personas'}
                          </option>
                        ))}
                      </select>
                      <small className="text-gray-500 dark:text-gray-400 text-xs mt-1">Máximo: {selectedRoom.maxCapacity} personas</small>
                    </div>
                  </div>
                </div>
                
                {/* Notas */}
                <div className="bg-gray-50 dark:bg-gray-800/50 p-5 rounded-lg border border-gray-200 dark:border-gray-700">
                  <h4 className="flex items-center gap-2 mb-4 text-gray-900 dark:text-white font-semibold">
                    <FileText size={18} /> Notas Adicionales
                  </h4>
                  <div className="flex flex-col">
                    <label htmlFor="notes" className="mb-2 font-medium text-gray-700 dark:text-gray-300 text-sm">
                      Notas (opcional)
                      <span className="bg-gray-200 dark:bg-gray-600 text-gray-600 dark:text-gray-300 text-[0.7rem] px-1.5 py-0.5 rounded ml-2 font-normal">Opcional</span>
                    </label>
                    <textarea
                      id="notes"
                      name="notes"
                      value={formData.notes}
                      onChange={handleInputChange}
                      rows={4}
                      placeholder="Especificaciones especiales, preferencias, solicitudes adicionales..."
                      className="p-3 border border-gray-300 dark:border-gray-600 rounded-md text-base bg-white dark:bg-gray-700 text-gray-900 dark:text-white min-h-[100px] resize-y leading-snug transition-all duration-200 focus:outline-none focus:border-gray-900 dark:focus:border-gray-400 focus:shadow-[0_0_0_3px_rgba(26,26,46,0.1)]"
                    />
                    <small className="text-gray-500 dark:text-gray-400 text-xs mt-1">
                      Aquí puedes agregar cualquier información adicional que consideres importante
                    </small>
                  </div>
                </div>
                
                {/* Resumen de Pago */}
                <div className="bg-gray-50 dark:bg-gray-800/50 p-5 rounded-lg border border-gray-200 dark:border-gray-700">
                  <h4 className="flex items-center gap-2 mb-4 text-gray-900 dark:text-white font-semibold">
                    <CreditCard size={18} /> Resumen de Pago
                  </h4>
                  <div className="bg-gray-100 dark:bg-gray-700/50 p-5 rounded-lg border border-gray-200 dark:border-gray-600">
                    <div className="flex justify-between py-2.5 border-b border-dashed border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300">
                      <span>Subtotal:</span>
                      <span className="font-semibold">${selectedRoom.basePrice * calculateNights()}</span>
                    </div>
                    {formData.guestCount > 1 && (
                      <div className="flex justify-between py-2.5 border-b border-dashed border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300">
                      <span>Recargo por huéspedes extra ({formData.guestCount - 1} × $30/noche):</span>
                        <span className="font-semibold">${Math.max(0, formData.guestCount - 1) * 30 * calculateNights()}</span>
                      </div>
                    )}
                    <div className="flex justify-between pt-4 mt-4 border-t-2 border-gray-900 dark:border-gray-400 font-bold text-gray-900 dark:text-white text-lg">
                      <span>Total a pagar:</span>
                      <span className="text-[#2a9d8f] text-xl">${formData.totalPrice}</span>
                    </div>
                  </div>
                </div>
                
                {/* Botones */}
                <div className="flex justify-between gap-5 mt-8 pt-5 border-t border-gray-200 dark:border-gray-700">
                  <button 
                    type="button" 
                    className="flex-1 px-7 py-3.5 bg-red-600 text-white rounded-md font-semibold cursor-pointer transition-all duration-300 hover:bg-red-700 hover:-translate-y-0.5 hover:shadow-lg disabled:opacity-60 disabled:cursor-not-allowed disabled:transform-none"
                    onClick={closeModal}
                    disabled={isSubmitting}
                  >
                    Cancelar
                  </button>
                  <button 
                    type="submit" 
                    className="flex-1 px-7 py-3.5 bg-green-600 text-white rounded-md font-semibold cursor-pointer transition-all duration-300 flex items-center justify-center gap-2 hover:bg-green-700 hover:-translate-y-0.5 hover:shadow-lg disabled:opacity-60 disabled:cursor-not-allowed disabled:transform-none"
                    disabled={isSubmitting}
                  >
                    <CreditCard size={18} />
                    {isSubmitting ? 'Enviando...' : 'Confirmar Reserva'}
                  </button>
                </div>
                
                {/* Legal */}
                <div className="mt-5 p-4 bg-gray-100 dark:bg-gray-800 rounded-md border-l-4 border-[#2a9d8f]">
                  <p className="m-0 text-gray-600 dark:text-gray-400 text-sm leading-snug">
                    <small>
                      Al confirmar esta reserva, aceptas nuestros términos y condiciones. 
                      La reserva quedará pendiente de confirmación por parte del hotel.
                    </small>
                  </p>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Modal de Éxito */}
      {showSuccessModal && successBookingDetails && (
        <div 
          className="fixed inset-0 bg-black/70 dark:bg-black/80 flex justify-center items-center z-[9999] p-5"
          onClick={() => { setShowSuccessModal(false); setSuccessBookingDetails(null); }}
        >
          <div 
            className="relative bg-white dark:bg-[#1e1e3e] rounded-xl w-full max-w-[500px] max-h-[85vh] overflow-y-auto shadow-[0_10px_30px_rgba(0,0,0,0.3)] animate-[modalSlideIn_0.3s_ease-out]"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="pb-5 mb-5 border-b border-gray-200 dark:border-gray-700 p-8">
              <h3 className="m-0 text-gray-900 dark:text-white text-2xl font-semibold text-center">¡Reserva Exitosa!</h3>
              <button 
                className="absolute top-4 right-4 bg-transparent border-none cursor-pointer p-2 rounded-full transition-colors duration-200 hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-600 dark:text-gray-400"
                onClick={() => { setShowSuccessModal(false); setSuccessBookingDetails(null); }}
                type="button"
                aria-label="Cerrar modal"
              >
                <X size={24} />
              </button>
            </div>
            
            <div className="px-8 pb-8 text-center">
              <div className="mb-6">
                <div className="w-16 h-16 mx-auto mb-4 bg-green-100 dark:bg-green-900/20 rounded-full flex items-center justify-center">
                  <Check size={32} className="text-green-600 dark:text-green-400" />
                </div>
                <p className="text-gray-600 dark:text-gray-400 text-base leading-relaxed">
                  Tu reserva ha sido enviada con éxito. Te contactaremos pronto para confirmar los detalles.
                </p>
              </div>
              
              <div className="bg-gray-50 dark:bg-gray-800/50 p-5 rounded-lg border border-gray-200 dark:border-gray-700 mb-6">
                <h4 className="text-gray-900 dark:text-white font-semibold mb-4">Detalles de la Reserva</h4>
                <div className="space-y-2 text-sm text-gray-700 dark:text-gray-300">
                  <div className="flex justify-between">
                    <span>Habitación:</span>
                    <span className="font-medium">{successBookingDetails.roomName}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Fechas:</span>
                    <span className="font-medium">{successBookingDetails.checkInDate} al {successBookingDetails.checkOutDate}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Huéspedes:</span>
                    <span className="font-medium">{successBookingDetails.guestCount}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Noches:</span>
                    <span className="font-medium">{successBookingDetails.nights}</span>
                  </div>
                  <div className="flex justify-between border-t border-gray-300 dark:border-gray-600 pt-2 mt-2">
                    <span className="font-semibold">Total:</span>
                    <span className="font-semibold text-[#2a9d8f]">${successBookingDetails.totalPrice}</span>
                  </div>
                </div>
              </div>
              
              <button 
                className="w-full bg-[#1a1a2e] dark:bg-gradient-to-r dark:from-[#1a1a2e] dark:to-[#2c3e50] text-white py-3.5 px-8 rounded-lg font-semibold text-base cursor-pointer transition-all duration-300 uppercase tracking-wide hover:bg-[#2c3e50] hover:-translate-y-0.5 hover:shadow-xl active:translate-y-0"
                onClick={() => { setShowSuccessModal(false); setSuccessBookingDetails(null); }}
                type="button"
              >
                Aceptar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal de Error */}
      {showErrorModal && (
        <div 
          className="fixed inset-0 bg-black/70 dark:bg-black/80 flex justify-center items-center z-[9999] p-5"
          onClick={() => { setShowErrorModal(false); setErrorMessage(''); }}
        >
          <div 
            className="relative bg-white dark:bg-[#1e1e3e] rounded-xl w-full max-w-[500px] max-h-[85vh] overflow-y-auto shadow-[0_10px_30px_rgba(0,0,0,0.3)] animate-[modalSlideIn_0.3s_ease-out]"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="pb-5 mb-5 border-b border-gray-200 dark:border-gray-700 p-8">
              <h3 className="m-0 text-gray-900 dark:text-white text-2xl font-semibold text-center">Error en la Reserva</h3>
              <button 
                className="absolute top-4 right-4 bg-transparent border-none cursor-pointer p-2 rounded-full transition-colors duration-200 hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-600 dark:text-gray-400"
                onClick={() => { setShowErrorModal(false); setErrorMessage(''); }}
                type="button"
                aria-label="Cerrar modal"
              >
                <X size={24} />
              </button>
            </div>
            
            <div className="px-8 pb-8 text-center">
              <div className="mb-6">
                <div className="w-16 h-16 mx-auto mb-4 bg-red-100 dark:bg-red-900/20 rounded-full flex items-center justify-center">
                  <X size={32} className="text-red-600 dark:text-red-400" />
                </div>
                <p className="text-gray-600 dark:text-gray-400 text-base leading-relaxed">
                  {errorMessage}
                </p>
              </div>
              
              <button 
                className="w-full bg-red-600 text-white py-3.5 px-8 rounded-lg font-semibold text-base cursor-pointer transition-all duration-300 uppercase tracking-wide hover:bg-red-700 hover:-translate-y-0.5 hover:shadow-xl active:translate-y-0"
                onClick={() => { setShowErrorModal(false); setErrorMessage(''); }}
                type="button"
              >
                Cerrar
              </button>
            </div>
          </div>
        </div>
      )}

      <style>{`
        @keyframes modalSlideIn {
          from {
            opacity: 0;
            transform: translateY(-30px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>
    </>
  );
};

export default RoomTypes;