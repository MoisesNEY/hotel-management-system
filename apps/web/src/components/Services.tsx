import React, { useState } from 'react';
import { Coffee, Dumbbell, Heart, Car, Umbrella, Wind, X, Clock, FileText, AlertCircle } from 'lucide-react';
import '../styles/services.css';

// Enum para RequestStatus
export const RequestStatus = {
  PENDING: 'PENDING',
  IN_PROGRESS: 'IN_PROGRESS',
  COMPLETED: 'COMPLETED',
  CANCELLED: 'CANCELLED'
} as const;

export type RequestStatus = typeof RequestStatus[keyof typeof RequestStatus];


// Tipo para los servicios
interface Service {
  icon: React.ReactNode;
  name: string;
  description: string;
  category: string;
}


const Services: React.FC = () => {
  const services: Service[] = [
    {
      icon: <Coffee className="service-icon" />,
      name: 'Restaurante & Bar',
      description: 'Desayuno buffet premium y cenas gourmet con chefs internacionales',
      category: 'GASTRONOMIA'
    },
    {
      icon: <Dumbbell className="service-icon" />,
      name: 'Gimnasio Ejecutivo',
      description: 'Equipamiento moderno, entrenador personal y acceso 24 horas',
      category: 'BIENESTAR'
    },
    {
      icon: <Heart className="service-icon" />,
      name: 'Spa & Wellness',
      description: 'Masajes terapéuticos, tratamientos faciales y relajación total',
      category: 'BIENESTAR'
    },
    {
      icon: <Car className="service-icon" />,
      name: 'Transporte Ejecutivo',
      description: 'Shuttle al aeropuerto, servicio de limusina y valet parking VIP',
      category: 'TRANSPORTE'
    },
    {
      icon: <Umbrella className="service-icon" />,
      name: 'Piscina Infinity',
      description: 'Piscina climatizada con vista panorámica y bar de piscina',
      category: 'RECREACION'
    },
    {
      icon: <Wind className="service-icon" />,
      name: 'Lavandería Express',
      description: 'Servicio de lavandería y planchado premium en menos de 2 horas',
      category: 'HOSPEDAJE'
    }
  ];

  // Estado para el modal
  const [showModal, setShowModal] = useState(false);
  const [selectedService, setSelectedService] = useState<Service | null>(null);
  
  // Estado para los datos del formulario según entity ServiceRequest
  const [formData, setFormData] = useState({
    requestDate: '', // Se convertirá a Instant en el backend
    details: '',
    status: RequestStatus.PENDING
  });

  // Abrir modal de solicitud de servicio
  const handleServiceRequest = (service: Service) => {
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
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validaciones básicas
    if (!formData.requestDate) {
      alert('Por favor, selecciona una fecha y hora para la solicitud');
      return;
    }
    
    if (!formData.details.trim()) {
      alert('Por favor, proporciona detalles sobre tu solicitud');
      return;
    }
    
    // Validar que la fecha no sea en el pasado
    const selectedDate = new Date(formData.requestDate);
    const now = new Date();
    if (selectedDate < now) {
      alert('La fecha y hora de solicitud no pueden ser en el pasado');
      return;
    }
    
    // Crear objeto de solicitud según entity ServiceRequest
    const serviceRequestData = {
      requestDate: formData.requestDate + ':00Z', // Convertir a formato ISO 8601 con zona horaria
      details: formData.details.trim(),
      status: formData.status,
      serviceName: selectedService?.name,
      serviceCategory: selectedService?.category
    };
    
    // Aquí iría la lógica para enviar la solicitud al backend
    console.log('Solicitud de servicio enviada:', serviceRequestData);
    
    alert(`¡Solicitud de servicio enviada con éxito!

Servicio: ${selectedService?.name}
Fecha solicitada: ${formatDateForDisplay(formData.requestDate)}
Estado: ${formData.status === RequestStatus.PENDING ? 'Pendiente' : 
          formData.status === RequestStatus.IN_PROGRESS ? 'En progreso' :
          formData.status === RequestStatus.COMPLETED ? 'Completada' : 'Cancelada'}

Recibirás una confirmación por correo electrónico.`);
    
    closeModal();
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
            {services.map((service, index) => (
              <div key={index} className="service-card">
                <div className="service-icon-container">
                  {service.icon}
                </div>
                <h3 className="service-name">{service.name}</h3>
                <p className="service-description">{service.description}</p>
                <div className="service-category">
                  {service.category}
                </div>
                <button 
                  className="service-btn"
                  onClick={() => handleServiceRequest(service)}
                  type="button"
                >
                  Solicitar Servicio
                </button>
              </div>
            ))}
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
                  {selectedService.icon}
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
                      <span className="info-value">{selectedService.category}</span>
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
                  >
                    Cancelar
                  </button>
                  <button 
                    type="submit" 
                    className="btn-submit"
                  >
                    Enviar Solicitud
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