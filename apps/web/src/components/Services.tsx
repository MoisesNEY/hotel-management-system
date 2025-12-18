import React, { useState, useEffect } from 'react';
import { Heart, X, Clock, FileText, AlertCircle } from 'lucide-react';
import '../styles/services.css';
import { createServiceRequest } from '../services/client/serviceRequestService';

// Enum para RequestStatus
export const RequestStatus = {
  PENDING: 'PENDING',
  IN_PROGRESS: 'IN_PROGRESS',
  COMPLETED: 'COMPLETED',
  CANCELLED: 'CANCELLED'
} as const;

export type RequestStatus = typeof RequestStatus[keyof typeof RequestStatus];



import { getAllHotelServices } from '../services/admin/hotelServiceService';
import type { HotelServiceDTO } from '../types/sharedTypes';

const Services: React.FC = () => {
  // Estado para los servicios
  const [services, setServices] = useState<HotelServiceDTO[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchServices = async () => {
      try {
        setLoading(true);
        // Traer todos los servicios
        const response = await getAllHotelServices(0, 100);
        // Filtrar: solo disponibles y con precio > 0
        const premiumServices = response.data.filter(s => s.isAvailable && s.cost > 0);
        setServices(premiumServices);
      } catch (err) {
        console.error('[Services] Error fetching services:', err);
        setError('No se pudieron cargar los servicios.');
      } finally {
        setLoading(false);
      }
    };

    fetchServices();
  }, []);

  // Estado para el modal
  const [showModal, setShowModal] = useState(false);
  const [selectedService, setSelectedService] = useState<HotelServiceDTO | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Estado para los datos del formulario según entity ServiceRequest
  const [formData, setFormData] = useState({
    requestDate: '', // Se convertirá a Instant en el backend
    details: '',
    status: RequestStatus.PENDING
  });

  // Abrir modal de solicitud de servicio
  const handleServiceRequest = (service: HotelServiceDTO) => {
    console.log('Solicitando servicio:', service.name);
    setSelectedService(service);
    setShowModal(true);
    
    // Fecha y hora actual por defecto
    const now = new Date();
    const localDateTime = now.toISOString().slice(0, 16); // Formato YYYY-MM-DDTHH:MM
    
    setFormData({
      requestDate: localDateTime,
      details: '',
      status: RequestStatus.PENDING
    });
  };

  // Cerrar modal
  const closeModal = () => {
    setShowModal(false);
    setSelectedService(null);
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
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Formatear fecha para mostrar
  const formatDateForDisplay = (dateTimeString: string) => {
    if (!dateTimeString) return '';
    const date = new Date(dateTimeString);
    return date.toLocaleString('es-ES', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Enviar formulario
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.requestDate) {
      alert('Por favor, selecciona una fecha y hora para la solicitud');
      return;
    }
    
    if (!formData.details.trim()) {
      alert('Por favor, proporciona detalles sobre tu solicitud');
      return;
    }
    
    const selectedDate = new Date(formData.requestDate);
    const now = new Date();
    if (selectedDate < now) {
      alert('La fecha y hora de solicitud no pueden ser en el pasado');
      return;
    }
    
    try {
      setIsSubmitting(true);
      await createServiceRequest({
        details: `${formData.details.trim()} [Fecha: ${formData.requestDate}] [Servicio: ${selectedService?.name}]`,
        serviceId: selectedService?.id || 1,
        bookingId: 1 // Placeholder Mock ID
      });

      alert(`¡Solicitud de servicio enviada con éxito!

Servicio: ${selectedService?.name}
Fecha solicitada: ${formatDateForDisplay(formData.requestDate)}
Estado: ${formData.status === RequestStatus.PENDING ? 'Pendiente' : 
          formData.status === RequestStatus.IN_PROGRESS ? 'En progreso' :
          formData.status === RequestStatus.COMPLETED ? 'Completada' : 'Cancelada'}

Recibirás una confirmación por correo electrónico.`);
      closeModal();
    } catch (error) {
      console.error('Error al enviar la solicitud de servicio:', error);
      alert('No se pudo enviar la solicitud. Intenta nuevamente.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Opciones de estado para el select
  const statusOptions = [
    { value: RequestStatus.PENDING, label: 'Pendiente' },
    { value: RequestStatus.IN_PROGRESS, label: 'En progreso' },
    { value: RequestStatus.COMPLETED, label: 'Completada' },
    { value: RequestStatus.CANCELLED, label: 'Cancelada' }
  ];

  return (
    <>
      <section className="section services" id="servicios">
        <div className="container">
          <div className="section-header">
            <h2 className="section-title">Servicios Premium</h2>
            <p className="section-subtitle">
              Experimenta el lujo de nuestros servicios exclusivos diseñados para tu máximo confort
            </p>
          </div>
          
          <div className="services-grid">
            {loading ? (
               <div className="flex justify-center items-center py-20 col-span-full">
                 <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#d4af37]"></div>
               </div>
            ) : error ? (
               <div className="col-span-full text-center py-10 text-red-500 bg-red-50 rounded-xl p-4">
                 {error}
               </div>
            ) : services.length === 0 ? (
               <div className="col-span-full text-center py-20 no-services-card">
                  <AlertCircle className="mx-auto h-12 w-12 no-services-icon mb-4" />
                  <h3 className="no-services-title">No hay servicios premium disponibles</h3>
               </div>
            ) : (
              services.map((service) => (
                <div key={service.id} className="service-card">
                  <div className="service-icon-container">
                    {service.imageUrl ? (
                      <img src={service.imageUrl} alt={service.name} className="w-12 h-12 object-cover rounded-full" />
                    ) : (
                      <Heart className="service-icon" /> 
                    )}
                  </div>
                  <h3 className="service-name">{service.name}</h3>
                  <p className="service-description">{service.description || 'Sin descripción.'}</p>
                  <div className="service-category">
                    Premium
                  </div>
                  <div className="text-center mt-2 font-bold text-[#d4af37]">
                    ${service.cost}
                  </div>
                  <button 
                    className="service-btn"
                    onClick={() => handleServiceRequest(service)}
                    type="button"
                  >
                    Solicitar Servicio
                  </button>
                </div>
              ))
            )}
          </div>
          
          <div className="services-notice">
            <p>
              💡 <strong>Nota:</strong> Todos nuestros servicios están disponibles 
              para huéspedes registrados. Puedes solicitar cualquier servicio 
              durante tu estadía.
            </p>
          </div>
        </div>
      </section>

      {/* Modal de Solicitud de Servicio */}
      {showModal && selectedService && (
        <div 
          className="service-modal-overlay" 
          onClick={handleOverlayClick}
        >
          <div 
            className="service-modal"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="service-modal-header">
              <div className="service-modal-title">
                <div className="selected-service-icon">
                  {selectedService.imageUrl ? (
                      <img src={selectedService.imageUrl} alt={selectedService.name} className="w-10 h-10 object-cover rounded-full" />
                    ) : (
                      <Heart className="text-[#d4af37]" size={32} />
                    )}
                </div>
                <div>
                  <h3>Solicitar: {selectedService.name}</h3>
                  <p className="service-modal-subtitle">{selectedService.description}</p>
                </div>
              </div>
              <button 
                className="close-modal" 
                onClick={closeModal}
                type="button"
                aria-label="Cerrar modal"
              >
                <X size={24} />
              </button>
            </div>
            
            <div className="service-modal-body">
              <form onSubmit={handleSubmit} className="service-request-form">
                {/* Sección 1: Información del servicio */}
                <div className="form-section service-info-section">
                  <h4>
                    <AlertCircle size={18} />
                    Información del Servicio
                  </h4>
                  <div className="service-info-grid">
                    <div className="info-item">
                      <span className="info-label">Servicio:</span>
                      <span className="info-value">{selectedService.name}</span>
                    </div>
                    <div className="info-item">
                      <span className="info-label">Categoría:</span>
                      <span className="info-value">Premium</span>
                    </div>
                    <div className="info-item">
                      <span className="info-label">Disponibilidad:</span>
                      <span className="info-value available">Disponible 24/7</span>
                    </div>
                  </div>
                </div>
                
                {/* Sección 2: Fecha y hora según entity ServiceRequest */}
                <div className="form-section">
                  <h4>
                    <Clock size={18} />
                    Fecha y Hora de Solicitud *
                  </h4>
                  <p className="form-help-text">
                    Selecciona cuándo deseas recibir el servicio. La fecha y hora no pueden ser en el pasado.
                  </p>
                  <div className="form-group">
                    <label htmlFor="requestDate">Fecha y Hora</label>
                    <input
                      type="datetime-local"
                      id="requestDate"
                      name="requestDate"
                      value={formData.requestDate}
                      onChange={handleInputChange}
                      min={new Date().toISOString().slice(0, 16)}
                      required
                    />
                    <small className="form-hint">
                      Fecha solicitada: {formatDateForDisplay(formData.requestDate)}
                    </small>
                  </div>
                </div>
                
                {/* Sección 3: Detalles según entity ServiceRequest */}
                <div className="form-section">
                  <h4>
                    <FileText size={18} />
                    Detalles de la Solicitud *
                  </h4>
                  <p className="form-help-text">
                    Por favor, proporciona detalles específicos sobre tu solicitud.
                  </p>
                  <div className="form-group">
                    <label htmlFor="details">Detalles</label>
                    <textarea
                      id="details"
                      name="details"
                      value={formData.details}
                      onChange={handleInputChange}
                      rows={5}
                      placeholder={`Describe tu solicitud para ${selectedService.name}...
Ejemplo para ${selectedService.name.includes('Restaurante') ? 'Restaurante: "Reserva para 2 personas a las 20:00, preferencia mesa cerca de la ventana"' :
                         selectedService.name.includes('Spa') ? 'Spa: "Masaje relajante de 60 minutos, preferencia terapeuta femenina"' :
                         selectedService.name.includes('Transporte') ? 'Transporte: "Recogida en aeropuerto a las 15:00, vuelo AA123"' :
                         selectedService.name.includes('Lavandería') ? 'Lavandería: "3 camisas, 2 pantalones, planchado express"' :
                         'Especificaciones especiales'}`}
                      required
                    />
                    <small className="form-hint">
                      Sé lo más específico posible para brindarte un mejor servicio
                    </small>
                  </div>
                </div>
                
                {/* Sección 4: Estado según entity ServiceRequest */}
                <div className="form-section">
                  <h4>Estado de la Solicitud *</h4>
                  <p className="form-help-text">
                    Selecciona el estado inicial de tu solicitud.
                  </p>
                  <div className="form-group">
                    <label htmlFor="status">Estado</label>
                    <select
                      id="status"
                      name="status"
                      value={formData.status}
                      onChange={handleInputChange}
                      required
                    >
                      {statusOptions.map((option) => (
                        <option key={option.value} value={option.value}>
                          {option.label}
                        </option>
                      ))}
                    </select>
                    <small className="form-hint">
                      Las solicitudes nuevas normalmente se crean como "Pendiente"
                    </small>
                  </div>
                </div>
                
                {/* Sección 5: Resumen */}
                <div className="form-section summary-section">
                  <h4>Resumen de la Solicitud</h4>
                  <div className="request-summary">
                    <div className="summary-item">
                      <span>Servicio solicitado:</span>
                      <strong>{selectedService.name}</strong>
                    </div>
                    <div className="summary-item">
                      <span>Fecha y hora:</span>
                      <strong>{formatDateForDisplay(formData.requestDate)}</strong>
                    </div>
                    <div className="summary-item">
                      <span>Estado:</span>
                      <span className={`status-badge status-${formData.status.toLowerCase()}`}>
                        {formData.status === RequestStatus.PENDING ? 'Pendiente' :
                         formData.status === RequestStatus.IN_PROGRESS ? 'En progreso' :
                         formData.status === RequestStatus.COMPLETED ? 'Completada' : 'Cancelada'}
                      </span>
                    </div>
                    <div className="summary-item">
                      <span>Detalles:</span>
                      <div className="details-preview">
                        {formData.details || <em>No se proporcionaron detalles</em>}
                      </div>
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
                    {isSubmitting ? 'Enviando...' : 'Enviar Solicitud'}
                  </button>
                </div>
                
                {/* Información legal */}
                <div className="legal-notice">
                  <p>
                    <small>
                      Al enviar esta solicitud, aceptas nuestros términos de servicio. 
                      Nos contactaremos contigo para confirmar la disponibilidad.
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

export default Services;