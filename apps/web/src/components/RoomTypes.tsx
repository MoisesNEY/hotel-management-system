// apps/web/src/components/RoomTypes.tsx
import React, { useState } from 'react';
import { Bed, Users, Maximize, Check, X, Calendar, User, CreditCard, FileText } from 'lucide-react';
import '../styles/room-pricing-minimal.css';
import { createBooking } from '../services/client/bookingService';

// Definición de tipos según las entidades
interface RoomType {
  id: number; 
  name: string;
  description: string;
  basePrice: number;
  maxCapacity: number;
  imageUrl: string;
  area: string;
  beds: number;
}

export const BookingStatus = {
  PENDING: 'PENDING',
  CONFIRMED: 'CONFIRMED',
  CANCELLED: 'CANCELLED',
  COMPLETED: 'COMPLETED'
} as const;

export type BookingStatus = typeof BookingStatus[keyof typeof BookingStatus];


const RoomTypes: React.FC = () => {
  const rooms: RoomType[] = [
    {
       id: 1,
      name: 'Habitación Estándar',
      description: 'Perfecta para viajeros individuales o parejas. Incluye todas las comodidades básicas para una estancia confortable.',
      basePrice: 120,
      maxCapacity: 2,
      imageUrl: 'https://images.unsplash.com/photo-1611892440504-42a792e24d32?w=600',
      area: '25',
      beds: 1
    },
    {
      id: 2,
      name: 'Suite Ejecutiva',
      description: 'Espacio amplio con área de trabajo separada. Ideal para viajes de negocios o estancias prolongadas.',
      basePrice: 220,
      maxCapacity: 3,
      imageUrl: 'https://images.unsplash.com/photo-1566665797739-1674de7a421a?w=600',
      area: '45',
      beds: 2
    },
    {
      id: 3, 
      name: 'Suite Presidencial',
      description: 'La máxima experiencia de lujo y confort. Incluye servicios exclusivos y amenities premium.',
      basePrice: 450,
      maxCapacity: 4,
      imageUrl: 'https://images.unsplash.com/photo-1590490360182-c33d57733427?w=600',
      area: '80',
      beds: 2
    }
  ];

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
  const handleReservation = (room: RoomType) => {
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
        checkInDate: new Date(formData.checkInDate).toISOString().split('T')[0],
        checkOutDate: new Date(formData.checkOutDate).toISOString().split('T')[0],
        guestCount: formData.guestCount,
        notes: formData.notes || undefined
      });

      alert(`¡Reserva enviada con éxito!
    
Detalles:
- Habitación: ${selectedRoom?.name}
- Fechas: ${formData.checkInDate} al ${formData.checkOutDate}
- Huéspedes: ${formData.guestCount}
- Noches: ${nights}
- Total: $${finalTotalPrice}
- Estado: ${formData.status}

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
          <div className="rooms-grid">
            {rooms.map((room, index) => (
              <div key={index} className="room-card">
                <div className="room-image">
                  <img src={room.imageUrl} alt={room.name} />
                  <div className="room-badge">Disponible</div>
                </div>
                <div className="room-content">
                  <h3 className="room-name">{room.name}</h3>
                  <p className="room-description">{room.description}</p>
                  
                  <div className="room-details">
                    <div className="detail">
                      <Maximize size={18} />
                      <span>{room.area} m²</span>
                    </div>
                    <div className="detail">
                      <Users size={18} />
                      <span>{room.maxCapacity} personas</span>
                    </div>
                    <div className="detail">
                      <Bed size={18} />
                      <span>{room.beds} {room.beds === 1 ? 'cama' : 'camas'}</span>
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
                    <div className="form-group">
                      <label htmlFor="status">Estado de reserva *</label>
                      <select
                        id="status"
                        name="status"
                        value={formData.status}
                        onChange={handleInputChange}
                        required
                      >
                        <option value={BookingStatus.PENDING}>Pendiente</option>
                        <option value={BookingStatus.CONFIRMED}>Confirmada</option>
                        <option value={BookingStatus.CANCELLED}>Cancelada</option>
                        <option value={BookingStatus.COMPLETED}>Completada</option>
                      </select>
                      <small className="form-hint">Selecciona el estado inicial</small>
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
                    className="btn-cancel" 
                    onClick={closeModal}
                    disabled={isSubmitting}
                  >
                    Cancelar
                  </button>
                  <button 
                    type="submit" 
                    className="btn-submit"
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