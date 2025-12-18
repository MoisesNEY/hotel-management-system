import React, { useState, useEffect } from 'react';
import { Bed, Users, Maximize, Check, X, Calendar, User, CreditCard, FileText } from 'lucide-react';
import '../styles/room-pricing-minimal.css';
import { createBooking } from '../services/client/bookingService';

import { getAllRoomTypes } from '../services/admin/roomTypeService';
import type { RoomTypeDTO } from '../types/sharedTypes';

// Usaremos RoomTypeDTO directamente, pero mantenemos el alias por compatibilidad interna si es necesario
type RoomType = RoomTypeDTO;

export const BookingStatus = {
  PENDING: 'PENDING',
  CONFIRMED: 'CONFIRMED',
  CANCELLED: 'CANCELLED',
  COMPLETED: 'COMPLETED'
} as const;

export type BookingStatus = typeof BookingStatus[keyof typeof BookingStatus];


const RoomTypes: React.FC = () => {
  // Estado para los datos de la API
  const [roomTypes, setRoomTypes] = useState<RoomTypeDTO[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Cargar datos al montar
  useEffect(() => {
    const fetchRoomTypes = async () => {
      try {
        setLoading(true);
        // Traemos más resultados para mostrar todos (size: 100)
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

  // Estado para el modal
  const [showModal, setShowModal] = useState(false);
  const [selectedRoom, setSelectedRoom] = useState<RoomType | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Estado para los datos del formulario según la entidad Booking
  const [formData, setFormData] = useState({
    checkInDate: '',
    checkOutDate: '',
    guestCount: 1,
    status: BookingStatus.PENDING, // Estado inicial por defecto
    totalPrice: 0,
    notes: ''
  });

  // Abrir modal de reserva


  // Importar hook de auth para validación
  // NOTA: Para este componente funcional, necesitamos mover el hook al inicio
  // Pero como ya existe el componente, lo usaremos a través de una verificación simple o props si fuera necesario.
  // Mejor opción: Importar keycloak directamente para check rápido si no queremos cambiar todo el componente a usar useAuth
  // o refactorizar para usar useAuth al principio.
  
  // Asumiendo que podemos usar keycloak service directamente
  const handleReservation = async (room: RoomType) => {
    // Verificar auth dinámicamente
    const { default: keycloak } = await import('../services/keycloak');
    
    if (!keycloak.authenticated) {
        // Redirigir a login o mostrar mensaje
        alert('Debes iniciar sesión para realizar una reserva.');
        keycloak.login();
        return;
    }

    console.log('Abriendo modal para:', room.name);
    setSelectedRoom(room);
    setShowModal(true);
    
    // Calcular precio inicial
    const initialTotalPrice = calculateTotalPrice(room.basePrice, 1, 1);
    
    // Limpiar y establecer formulario con valores iniciales
    setFormData({
      checkInDate: '',
      checkOutDate: '',
      guestCount: 1,
      status: BookingStatus.PENDING,
      totalPrice: initialTotalPrice,
      notes: ''
    });
  };

  // Cerrar modal
  const closeModal = () => {
    console.log('Cerrando modal');
    setShowModal(false);
    setSelectedRoom(null);
  };

  // Manejar clic en el overlay para cerrar modal
  const handleOverlayClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      closeModal();
    }
  };

  // Manejar cambios en el formulario
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    
    let updatedData: any = {
      ...formData,
      [name]: value
    };

    // Si cambia guestCount, calcular precio
    if (name === 'guestCount') {
      const guestCount = parseInt(value);
      updatedData.guestCount = guestCount;
      
      if (selectedRoom) {
        const nights = calculateNights();
        updatedData.totalPrice = calculateTotalPrice(selectedRoom.basePrice, guestCount, nights);
      }
    }

    // Si cambian las fechas, calcular precio
    if (name === 'checkInDate' || name === 'checkOutDate') {
      if (selectedRoom && formData.checkInDate && formData.checkOutDate) {
        const nights = calculateNights();
        updatedData.totalPrice = calculateTotalPrice(selectedRoom.basePrice, formData.guestCount, nights);
      }
    }

    setFormData(updatedData);
  };

  // Calcular número de noches
  const calculateNights = () => {
    if (!formData.checkInDate || !formData.checkOutDate) return 1;
    
    const checkIn = new Date(formData.checkInDate);
    const checkOut = new Date(formData.checkOutDate);
    const diffTime = Math.abs(checkOut.getTime() - checkIn.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays > 0 ? diffDays : 1;
  };

  // Calcular precio total según la lógica de negocio
  const calculateTotalPrice = (basePrice: number, guestCount: number, nights: number) => {
    let total = basePrice * nights;
    
    // Recargo por huéspedes extra (el primero incluido)
    const extraGuests = Math.max(0, guestCount - 1);
    total += extraGuests * 30 * nights; // $30 por huésped extra por noche
    
    return total;
  };

  // Obtener fecha mínima para check-out (día siguiente al check-in)
  const getMinCheckoutDate = () => {
    if (!formData.checkInDate) return '';
    const checkInDate = new Date(formData.checkInDate);
    checkInDate.setDate(checkInDate.getDate() + 1);
    return checkInDate.toISOString().split('T')[0];
  };

  // Obtener fecha de hoy para limitar fechas pasadas
  const getTodayDate = () => {
    return new Date().toISOString().split('T')[0];
  };

  // Enviar formulario
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
        checkInDate: formData.checkInDate, // Ya es YYYY-MM-DD del input type="date"
        checkOutDate: formData.checkOutDate, // Ya es YYYY-MM-DD del input type="date"
        guestCount: formData.guestCount,
        notes: formData.notes
      });

      alert(`¡Reserva enviada con éxito!
    
Detalles:
- Habitación: ${selectedRoom?.name}
- Fechas: ${formData.checkInDate} al ${formData.checkOutDate}
- Huéspedes: ${formData.guestCount}
- Noches: ${nights}
- Total: $${finalTotalPrice}
- Total: $${finalTotalPrice}

Te contactaremos para confirmar.`);
      closeModal();
    } catch (error) {
      console.error('Error al enviar la reserva:', error);
      alert('No se pudo registrar la reserva. Inténtalo nuevamente.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <section className="section rooms" id="habitaciones">
        <div className="container">
          <h2 className="section-title">Tipos de Habitación</h2>
          
          {loading ? (
            <div className="flex justify-center py-20">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#d4af37]"></div>
            </div>
          ) : error ? (
             <div className="text-center py-10 text-red-500 bg-red-50 rounded-xl p-4">
               {error}
             </div>
          ) : roomTypes.length === 0 ? (
            <div className="text-center py-20 bg-gray-50 rounded-xl">
               <Bed className="mx-auto h-12 w-12 text-gray-400 mb-4" />
               <h3 className="text-xl text-gray-600 font-medium">No hay tipos de habitación disponibles</h3>
               <p className="text-gray-500 mt-2">Por favor, vuelve a consultar más tarde.</p>
            </div>
          ) : (
            <div className="rooms-grid">
              {roomTypes.map((room) => (
                <div key={room.id} className="room-card">
                  <div className="room-image">
                    <img 
                      src={room.imageUrl || 'https://images.unsplash.com/photo-1611892440504-42a792e24d32?w=600'} 
                      alt={room.name} 
                    />
                    <div className="room-badge">Disponible</div>
                  </div>
                  <div className="room-content">
                    <h3 className="room-name">{room.name}</h3>
                    <p className="room-description">{room.description || 'Sin descripción disponible.'}</p>
                    
                    <div className="room-details">
                      <div className="detail">
                        <Maximize size={18} />
                        <span>{room.area || 0} m²</span>
                      </div>
                      <div className="detail">
                        <Users size={18} />
                        <span>{room.maxCapacity} personas</span>
                      </div>
                      <div className="detail">
                        <Bed size={18} />
                        <span>{room.beds || 1} {(!room.beds || room.beds === 1) ? 'cama' : 'camas'}</span>
                      </div>
                    </div>
                    
                    <div className="room-pricing-section">
                      <div className="pricing-container">
                        <div className="price-display">
                          <div className="price-main">
                            <span className="price-currency">$</span>
                            <span className="price-amount">{room.basePrice}</span>
                            <span className="price-period">/noche</span>
                          </div>
                          <div className="price-note">Impuestos incluidos</div>
                        </div>
                        
                        <button 
                          className="book-btn"
                          onClick={() => handleReservation(room)}
                          type="button"
                        >
                          RESERVAR AHORA
                        </button>
                        
                        <div className="price-features">
                          <div className="price-feature">
                            <div className="feature-icon">
                              <Check size={16} />
                            </div>
                            <div className="feature-text">
                              Cancelación gratuita
                            </div>
                          </div>
                          <div className="price-feature">
                            <div className="feature-icon">
                              <Check size={16} />
                            </div>
                            <div className="feature-text">
                              Desayuno incluido
                            </div>
                          </div>
                        </div>
                        
                        <div className="quality-badge">
                          Calidad Garantizada
                        </div>
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
          className="reservation-modal-overlay" 
          onClick={handleOverlayClick}
        >
          <div 
            className="reservation-modal"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="modal-header">
              <h3>Reservar: {selectedRoom.name}</h3>
              <button 
                className="close-modal" 
                onClick={closeModal}
                type="button"
                aria-label="Cerrar modal"
              >
                <X size={24} />
              </button>
            </div>
            
            <div className="modal-body">
              <div className="reservation-summary">
                <div className="room-summary">
                  <img src={selectedRoom.imageUrl} alt={selectedRoom.name} />
                  <div className="room-info">
                    <h4>{selectedRoom.name}</h4>
                    <p>{selectedRoom.description}</p>
                    <div className="room-specs">
                      <span><Maximize size={14} /> {selectedRoom.area} m²</span>
                      <span><Users size={14} /> Máx: {selectedRoom.maxCapacity} personas</span>
                      <span><Bed size={14} /> {selectedRoom.beds} {selectedRoom.beds === 1 ? 'cama' : 'camas'}</span>
                    </div>
                  </div>
                </div>
                
                <div className="price-summary">
                  <div className="price-item">
                    <span>Precio base/noche:</span>
                    <span>${selectedRoom.basePrice}</span>
                  </div>
                  <div className="price-item">
                    <span>Noches:</span>
                    <span>{calculateNights()}</span>
                  </div>
                  <div className="price-item">
                    <span>Huéspedes extra:</span>
                    <span>${Math.max(0, formData.guestCount - 1) * 30}/noche c/u</span>
                  </div>
                  <div className="price-total">
                    <span>Total estimado:</span>
                    <span className="total-amount">${formData.totalPrice}</span>
                  </div>
                </div>
              </div>
              
              <form onSubmit={handleSubmit} className="reservation-form">
                {/* Sección 1: Fechas según entity Booking */}
                <div className="form-section">
                  <h4><Calendar size={18} /> Fechas de Estadía</h4>
                  <p className="form-help-text">Los campos marcados con * son obligatorios</p>
                  <div className="form-row">
                    <div className="form-group">
                      <label htmlFor="checkInDate">Check-in *</label>
                      <input
                        type="date"
                        id="checkInDate"
                        name="checkInDate"
                        value={formData.checkInDate}
                        onChange={handleInputChange}
                        min={getTodayDate()}
                        required
                      />
                      <small className="form-hint">Fecha de entrada</small>
                    </div>
                    <div className="form-group">
                      <label htmlFor="checkOutDate">Check-out *</label>
                      <input
                        type="date"
                        id="checkOutDate"
                        name="checkOutDate"
                        value={formData.checkOutDate}
                        onChange={handleInputChange}
                        min={getMinCheckoutDate()}
                        disabled={!formData.checkInDate}
                        required
                      />
                      <small className="form-hint">Fecha de salida</small>
                    </div>
                  </div>
                </div>
                
                {/* Sección 2: Huéspedes según entity Booking */}
                <div className="form-section">
                  <h4><User size={18} /> Información de Huéspedes</h4>
                  <div className="form-row">
                    <div className="form-group">
                      <label htmlFor="guestCount">Número de huéspedes *</label>
                      <select
                        id="guestCount"
                        name="guestCount"
                        value={formData.guestCount}
                        onChange={handleInputChange}
                        required
                      >
                        {[...Array(selectedRoom.maxCapacity)].map((_, i) => (
                          <option key={i} value={i + 1}>
                            {i + 1} {i === 0 ? 'persona' : 'personas'}
                          </option>
                        ))}
                      </select>
                      <small className="form-hint">Máximo: {selectedRoom.maxCapacity} personas</small>
                    </div>
                  </div>
                </div>
                
                {/* Sección 3: Notas (opcional) según entity Booking */}
                <div className="form-section">
                  <h4><FileText size={18} /> Notas Adicionales</h4>
                  <div className="form-group">
                    <label htmlFor="notes">
                      Notas (opcional)
                      <span className="optional-label">Opcional</span>
                    </label>
                    <textarea
                      id="notes"
                      name="notes"
                      value={formData.notes}
                      onChange={handleInputChange}
                      rows={4}
                      placeholder="Especificaciones especiales, preferencias, solicitudes adicionales..."
                    />
                    <small className="form-hint">
                      Aquí puedes agregar cualquier información adicional que consideres importante
                    </small>
                  </div>
                </div>
                
                {/* Sección 4: Precio (calculado automáticamente) */}
                <div className="form-section">
                  <h4><CreditCard size={18} /> Resumen de Pago</h4>
                  <div className="payment-summary">
                    <div className="payment-row">
                      <span>Subtotal:</span>
                      <span>${selectedRoom.basePrice * calculateNights()}</span>
                    </div>
                    {formData.guestCount > 1 && (
                      <div className="payment-row">
                      <span>Recargo por huéspedes extra ({formData.guestCount - 1} × $30/noche):</span>
                        <span>${Math.max(0, formData.guestCount - 1) * 30 * calculateNights()}</span>
                      </div>
                    )}
                    <div className="payment-total">
                      <span>Total a pagar:</span>
                      <span className="payment-total-amount">${formData.totalPrice}</span>
                    </div>
                  </div>
                </div>
                
                {/* Botones de acción */}
                <div className="form-actions">
                  <button 
                    type="button" 
                    className="btn-roomtypes-cancel" 
                    onClick={closeModal}
                    disabled={isSubmitting}
                  >
                    Cancelar
                  </button>
                  <button 
                    type="submit" 
                    className="btn-roomtypes-confirm"
                    disabled={isSubmitting}
                  >
                    <CreditCard size={18} />
                    {isSubmitting ? 'Enviando...' : 'Confirmar Reserva'}
                  </button>
                </div>
                
                {/* Información legal */}
                <div className="legal-notice">
                  <p>
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
    </>
  );
};

export default RoomTypes;