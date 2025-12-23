import React, { useState, useEffect } from 'react';
import { Heart, X, Clock, FileText, AlertCircle, Info, ChevronDown } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { createServiceRequest } from '../services/client/serviceRequestService';
import { getAllHotelServices } from '../services/admin/hotelServiceService';
import { getMyBookings } from '../services/client/bookingService';
import { useAuth } from '../contexts/AuthProvider';
import { useSingleContent } from '../hooks/useContent';
import type { HotelServiceDTO } from '../types/adminTypes';
import type { BookingResponse } from '../types/clientTypes';

// Enum para RequestStatus
export const RequestStatus = {
  PENDING: 'PENDING',
  IN_PROGRESS: 'IN_PROGRESS',
  COMPLETED: 'COMPLETED',
  CANCELLED: 'CANCELLED'
} as const;

export type RequestStatus = typeof RequestStatus[keyof typeof RequestStatus];

const Services: React.FC = () => {
  const navigate = useNavigate();
  const [services, setServices] = useState<HotelServiceDTO[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [selectedService, setSelectedService] = useState<HotelServiceDTO | null>(null);
  const { isAuthenticated } = useAuth();
  const [userBookings, setUserBookings] = useState<BookingResponse[]>([]);
  const [selectedBookingId, setSelectedBookingId] = useState<string>('');
  const [loadingBookings, setLoadingBookings] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [formData, setFormData] = useState({
    requestDate: '',
    details: '',
    status: RequestStatus.PENDING
  });

  const { data: header } = useSingleContent('HEADER_SERVICES');

  // Service card colors
  const serviceColors = [
    { border: 'from-[#E63946] to-[#F1A7B5]', icon: '#E63946', iconBg: 'bg-gradient-to-br from-[rgba(230,57,70,0.05)] to-[rgba(230,57,70,0.02)]', borderColor: 'border-[rgba(230,57,70,0.3)]', hoverText: 'hover:text-[#E63946]', hoverBg: 'hover:bg-[#E63946]' },
    { border: 'from-[#457B9D] to-[#A8DADC]', icon: '#457B9D', iconBg: 'bg-gradient-to-br from-[rgba(69,123,157,0.05)] to-[rgba(69,123,157,0.02)]', borderColor: 'border-[rgba(69,123,157,0.3)]', hoverText: 'hover:text-[#457B9D]', hoverBg: 'hover:bg-[#457B9D]' },
    { border: 'from-[#2A9D8F] to-[#A2D6C4]', icon: '#2A9D8F', iconBg: 'bg-gradient-to-br from-[rgba(42,157,143,0.05)] to-[rgba(42,157,143,0.02)]', borderColor: 'border-[rgba(42,157,143,0.3)]', hoverText: 'hover:text-[#2A9D8F]', hoverBg: 'hover:bg-[#2A9D8F]' },
    { border: 'from-[#E9C46A] to-[#F4D06F]', icon: '#E9C46A', iconBg: 'bg-gradient-to-br from-[rgba(233,196,106,0.05)] to-[rgba(233,196,106,0.02)]', borderColor: 'border-[rgba(233,196,106,0.3)]', hoverText: 'hover:text-[#E9C46A]', hoverBg: 'hover:bg-[#E9C46A]' },
    { border: 'from-[#264653] to-[#4A9B9D]', icon: '#264653', iconBg: 'bg-gradient-to-br from-[rgba(38,70,83,0.05)] to-[rgba(38,70,83,0.02)]', borderColor: 'border-[rgba(38,70,83,0.3)]', hoverText: 'hover:text-[#264653]', hoverBg: 'hover:bg-[#264653]' },
    { border: 'from-[#9B5DE5] to-[#C7B9FF]', icon: '#9B5DE5', iconBg: 'bg-gradient-to-br from-[rgba(155,93,229,0.05)] to-[rgba(155,93,229,0.02)]', borderColor: 'border-[rgba(155,93,229,0.3)]', hoverText: 'hover:text-[#9B5DE5]', hoverBg: 'hover:bg-[#9B5DE5]' },
  ];

  useEffect(() => {
    const fetchServices = async () => {
      try {
        setLoading(true);
        const response = await getAllHotelServices(0, 100);
        const premiumServices = response.data.filter(s => s.status === 'OPERATIONAL' && s.cost > 0);
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

  useEffect(() => {
    if (isAuthenticated) {
      loadUserBookings();
    }
  }, [isAuthenticated]);

  const loadUserBookings = async () => {
    try {
      setLoadingBookings(true);
      const response = await getMyBookings();
      // Only active bookings
      const active = response.data.filter(b => b.status === 'CONFIRMED' || b.status === 'CHECKED_IN');
      setUserBookings(active);

      if (active.length > 0) {
        setSelectedBookingId(active[0].id.toString());
      }
    } catch (err) {
      console.error('[Services] Error fetching bookings:', err);
    } finally {
      setLoadingBookings(false);
    }
  };

  // const handleServiceRequest = (service: HotelServiceDTO) => { ... }

  const closeModal = () => {
    setShowModal(false);
    setSelectedService(null);
  };

  const handleOverlayClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      closeModal();
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

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

    if (!selectedBookingId) {
      alert('Debes seleccionar una reserva activa para solicitar este servicio');
      return;
    }

    try {
      setIsSubmitting(true);
      await createServiceRequest({
        details: `${formData.details.trim()} [Fecha: ${formData.requestDate}] [Servicio: ${selectedService?.name}]`,
        serviceId: selectedService?.id || 1,
        bookingId: Number(selectedBookingId)
      });

      alert(`¡Solicitud de servicio enviada con éxito!\n\nServicio: ${selectedService?.name}\nFecha solicitada: ${formatDateForDisplay(formData.requestDate)}\n\nRecibirás una confirmación por correo electrónico.`);
      closeModal();
    } catch (error) {
      console.error('Error al enviar la solicitud de servicio:', error);
      alert('No se pudo enviar la solicitud. Intenta nuevamente.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading || services.length === 0) return null;

  return (
    <>
      <section className="bg-white dark:bg-[#1a1a2e] py-[100px] relative" id="servicios">
        <div className="max-w-7xl mx-auto px-5">
          <div className="text-center mb-[60px]">
            <h2 className="text-4xl text-gray-900 dark:text-white mb-4 relative pb-4 font-semibold after:content-[''] after:absolute after:bottom-0 after:left-1/2 after:-translate-x-1/2 after:w-20 after:h-0.5 after:bg-gradient-to-r after:from-[#d4af37] after:via-[#ffd95a] after:to-[#d4af37] after:rounded-sm">
              {header?.title || 'Servicios Premium'}
            </h2>
            <p className="text-gray-600 dark:text-gray-300 text-lg max-w-[600px] mx-auto leading-relaxed">
              {header?.subtitle || 'Experimenta el lujo de nuestros servicios exclusivos diseñados para tu máximo confort'}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-[30px]">
            {loading ? (
              <div className="flex justify-center items-center py-20 col-span-full">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#d4af37]"></div>
              </div>
            ) : error ? (
              <div className="col-span-full text-center py-10 text-red-500 bg-red-50 dark:bg-red-900/20 rounded-xl p-4">
                {error}
              </div>
            ) : services.length === 0 ? (
              <div className="col-span-full text-center py-20">
                <AlertCircle className="mx-auto h-12 w-12 text-gray-400 dark:text-gray-600 mb-4" />
                <h3 className="text-xl font-semibold text-gray-700 dark:text-gray-300">No hay servicios premium disponibles</h3>
              </div>
            ) : (
              services.map((service, index) => {
                const colors = serviceColors[index % serviceColors.length];
                return (
                  <div
                    key={service.id}
                    className="group bg-white dark:bg-[#1e1e3e] p-10 px-8 rounded-xl text-center shadow-[0_5px_20px_rgba(0,0,0,0.05)] dark:shadow-[0_5px_20px_rgba(0,0,0,0.3)] transition-all duration-300 relative overflow-hidden border border-gray-200 dark:border-gray-700 hover:-translate-y-2 hover:shadow-[0_15px_30px_rgba(0,0,0,0.1)] dark:hover:shadow-[0_15px_30px_rgba(0,0,0,0.5)] hover:border-[rgba(212,175,55,0.2)] before:content-[''] before:absolute before:top-0 before:left-0 before:right-0 before:h-1 before:bg-gradient-to-r before:${colors.border} before:scale-x-0 before:transition-transform before:duration-300 before:origin-left hover:before:scale-x-100"
                  >
                    <div className={`w-20 h-20 mx-auto mb-6 rounded-full flex items-center justify-center ${colors.iconBg} border-2 ${colors.borderColor} transition-all duration-300 group-hover:scale-105 group-hover:bg-white dark:group-hover:bg-white`}>
                      {service.imageUrl ? (
                        <img src={service.imageUrl} alt={service.name} className="w-12 h-12 object-cover rounded-full" />
                      ) : (
                        <Heart style={{ color: colors.icon }} size={32} />
                      )}
                    </div>
                    <h3 className={`text-xl mb-4 text-gray-900 dark:text-white font-semibold transition-colors duration-300 ${colors.hoverText}`}>
                      {service.name}
                    </h3>
                    <p className="text-gray-600 dark:text-gray-400 leading-relaxed text-sm mb-6">
                      {service.description || 'Sin descripción.'}
                    </p>
                    <div className="inline-block bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 px-3 py-1 rounded text-xs font-semibold mb-2 uppercase tracking-wide">
                      Premium
                    </div>
                    <div className="text-center mt-2 font-bold text-[#d4af37] text-lg">
                      ${service.cost}
                    </div>
                    <button
                      className={`mt-6 bg-transparent text-gray-900 dark:text-white border-2 border-gray-200 dark:border-gray-600 px-6 py-2.5 rounded-md font-semibold cursor-pointer transition-all duration-300 text-sm uppercase tracking-wide hover:bg-[#d4af37] hover:border-transparent hover:text-white flex items-center justify-center gap-2 mx-auto`}
                      onClick={() => navigate(isAuthenticated ? '/client/services' : '/client/dashboard')}
                      type="button"
                    >
                      <Info size={16} /> Ver Detalles
                    </button>
                  </div>
                );
              })
            )}
          </div>

          <div className="mt-12 p-6 bg-white/50 dark:bg-white/5 backdrop-blur-md rounded-2xl border border-gray-100 dark:border-white/10 shadow-sm flex items-center gap-4 animate-[fadeIn_0.6s_ease_forwards]">
            <div className="w-10 h-10 rounded-full bg-gold-default/10 flex items-center justify-center text-gold-default flex-shrink-0">
              <Info size={20} />
            </div>
            <p className="m-0 text-gray-700 dark:text-gray-300 text-sm leading-relaxed">
              <strong className="text-gray-900 dark:text-white font-bold">Nota importante:</strong> Todos nuestros servicios exclusivos están disponibles
              únicamente para huéspedes registrados. Puede solicitar cualquier servicio directamente
              a través de este panel durante su estadía en el hotel.
            </p>
          </div>
        </div>
      </section>

      {/* Modal de Solicitud de Servicio */}
      {showModal && selectedService && (
        <div
          className="fixed inset-0 bg-black/70 flex justify-center items-center z-[9999] p-5"
          onClick={handleOverlayClick}
        >
          <div
            className="bg-white dark:bg-[#1e1e3e] rounded-2xl w-full max-w-[800px] max-h-[90vh] overflow-y-auto shadow-[0_20px_40px_rgba(0,0,0,0.2)] animate-[modalSlideIn_0.3s_ease-out]"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex justify-between items-start p-6 px-8 border-b border-gray-200 dark:border-gray-700 bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-900 rounded-t-2xl">
              <div className="flex items-center gap-5 flex-1">
                <div className="w-[60px] h-[60px] bg-white dark:bg-gray-700 rounded-xl flex items-center justify-center shadow-[0_4px_12px_rgba(0,0,0,0.1)]">
                  {selectedService.imageUrl ? (
                    <img src={selectedService.imageUrl} alt={selectedService.name} className="w-10 h-10 object-cover rounded-full" />
                  ) : (
                    <Heart className="text-[#d4af37]" size={32} />
                  )}
                </div>
                <div>
                  <h3 className="m-0 mb-2 text-2xl text-gray-900 dark:text-white">Solicitar: {selectedService.name}</h3>
                  <p className="m-0 text-gray-600 dark:text-gray-400 text-sm">{selectedService.description}</p>
                </div>
              </div>
              <button
                className="bg-transparent border-none cursor-pointer text-gray-600 dark:text-gray-400 p-2 rounded-full transition-all duration-200 hover:bg-gray-200 dark:hover:bg-gray-700 hover:text-gray-900 dark:hover:text-white"
                onClick={closeModal}
                type="button"
                aria-label="Cerrar modal"
              >
                <X size={24} />
              </button>
            </div>

            <div className="p-8">
              <form onSubmit={handleSubmit} className="flex flex-col gap-6">
                {/* Información del servicio */}
                <div className="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20 p-6 rounded-xl border border-blue-200 dark:border-blue-700">
                  <h4 className="flex items-center gap-2.5 m-0 mb-4 text-gray-900 dark:text-white text-xl">
                    <AlertCircle size={18} />
                    Información del Servicio
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="flex flex-col gap-1">
                      <span className="text-xs text-gray-600 dark:text-gray-400 font-medium">Servicio:</span>
                      <span className="text-base text-gray-900 dark:text-white font-semibold">{selectedService.name}</span>
                    </div>
                    <div className="flex flex-col gap-1">
                      <span className="text-xs text-gray-600 dark:text-gray-400 font-medium">Categoría:</span>
                      <span className="text-base text-gray-900 dark:text-white font-semibold">Premium</span>
                    </div>
                    <div className="flex flex-col gap-1">
                      <span className="text-xs text-gray-600 dark:text-gray-400 font-medium">Disponibilidad:</span>
                      <span className="text-base text-[#2a9d8f] font-semibold">Disponible 24/7</span>
                    </div>
                  </div>
                </div>

                {/* Selección de Reserva */}
                <div className="bg-gray-50 dark:bg-gray-800/50 p-6 rounded-xl border border-gray-200 dark:border-gray-700">
                  <h4 className="flex items-center gap-2.5 m-0 mb-4 text-gray-900 dark:text-white text-xl">
                    <Info size={18} />
                    Seleccionar Reserva Asociada *
                  </h4>
                  {loadingBookings ? (
                    <div className="flex items-center gap-3 py-4 text-gray-500">
                      <div className="animate-spin h-4 w-4 border-2 border-[#d4af37] border-t-transparent rounded-full"></div>
                      <span className="text-sm">Buscando tus reservas...</span>
                    </div>
                  ) : userBookings.length === 0 ? (
                    <div className="p-4 bg-amber-50 dark:bg-amber-900/20 rounded-lg border border-amber-200 dark:border-amber-800 flex items-start gap-3">
                      <AlertCircle className="text-amber-600 flex-shrink-0" size={18} />
                      <p className="text-sm text-amber-800 dark:text-amber-300 m-0 leading-snug">
                        No hemos encontrado reservas activas. Para solicitar servicios premium, debes tener una reserva confirmada o estar hospedado actualmente.
                      </p>
                    </div>
                  ) : (
                    <div className="flex flex-col gap-2">
                      <label htmlFor="bookingId" className="font-semibold text-gray-700 dark:text-gray-300 text-sm">Reserva</label>
                      <div className="relative group">
                        <select
                          id="bookingId"
                          name="bookingId"
                          value={selectedBookingId}
                          onChange={(e) => setSelectedBookingId(e.target.value)}
                          className="w-full p-3.5 pr-10 border-2 border-gray-300 dark:border-gray-600 rounded-lg text-base bg-white dark:bg-gray-700 text-gray-900 dark:text-white appearance-none focus:outline-none focus:border-gray-900 dark:focus:border-gray-400 focus:shadow-[0_0_0_3px_rgba(26,26,46,0.1)] transition-all duration-200"
                          required
                        >
                          {userBookings.map(b => (
                            <option key={b.id} value={b.id}>
                              #{b.code} ({b.checkInDate} a {b.checkOutDate})
                            </option>
                          ))}
                        </select>
                        <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-gray-400 group-focus-within:rotate-180 transition-transform duration-200">
                          <ChevronDown size={14} />
                        </div>
                      </div>
                      <small className="text-gray-500 dark:text-gray-400 text-xs italic">
                        El servicio se asociará a esta estadía.
                      </small>
                    </div>
                  )}
                </div>

                {/* Fecha y hora */}
                <div className="bg-gray-50 dark:bg-gray-800/50 p-6 rounded-xl border border-gray-200 dark:border-gray-700">
                  <h4 className="flex items-center gap-2.5 m-0 mb-4 text-gray-900 dark:text-white text-xl">
                    <Clock size={18} />
                    Fecha y Hora de Solicitud *
                  </h4>
                  <p className="text-gray-600 dark:text-gray-400 text-sm mb-5 leading-snug">
                    Selecciona cuándo deseas recibir el servicio. La fecha y hora no pueden ser en el pasado.
                  </p>
                  <div className="flex flex-col gap-2">
                    <label htmlFor="requestDate" className="font-semibold text-gray-700 dark:text-gray-300 text-sm">Fecha y Hora</label>
                    <input
                      type="datetime-local"
                      id="requestDate"
                      name="requestDate"
                      value={formData.requestDate}
                      onChange={handleInputChange}
                      min={new Date().toISOString().slice(0, 16)}
                      className="p-3.5 border-2 border-gray-300 dark:border-gray-600 rounded-lg text-base bg-white dark:bg-gray-700 text-gray-900 dark:text-white transition-all duration-200 focus:outline-none focus:border-gray-900 dark:focus:border-gray-400 focus:shadow-[0_0_0_3px_rgba(26,26,46,0.1)]"
                      required
                    />
                    <small className="text-gray-500 dark:text-gray-400 text-xs italic">
                      Fecha solicitada: {formatDateForDisplay(formData.requestDate)}
                    </small>
                  </div>
                </div>

                {/* Detalles */}
                <div className="bg-gray-50 dark:bg-gray-800/50 p-6 rounded-xl border border-gray-200 dark:border-gray-700">
                  <h4 className="flex items-center gap-2.5 m-0 mb-4 text-gray-900 dark:text-white text-xl">
                    <FileText size={18} />
                    Detalles de la Solicitud *
                  </h4>
                  <p className="text-gray-600 dark:text-gray-400 text-sm mb-5 leading-snug">
                    Por favor, proporciona detalles específicos sobre tu solicitud.
                  </p>
                  <div className="flex flex-col gap-2">
                    <label htmlFor="details" className="font-semibold text-gray-700 dark:text-gray-300 text-sm">Detalles</label>
                    <textarea
                      id="details"
                      name="details"
                      value={formData.details}
                      onChange={handleInputChange}
                      rows={5}
                      placeholder={`Describe tu solicitud para ${selectedService.name}...`}
                      className="p-3.5 border-2 border-gray-300 dark:border-gray-600 rounded-lg text-base bg-white dark:bg-gray-700 text-gray-900 dark:text-white min-h-[120px] resize-y leading-snug transition-all duration-200 focus:outline-none focus:border-gray-900 dark:focus:border-gray-400 focus:shadow-[0_0_0_3px_rgba(26,26,46,0.1)]"
                      required
                    />
                    <small className="text-gray-500 dark:text-gray-400 text-xs italic">
                      Sé lo más específico posible para brindarte un mejor servicio
                    </small>
                  </div>
                </div>

                {/* Resumen */}
                <div className="bg-gradient-to-br from-green-50 to-green-100 dark:from-green-900/20 dark:to-green-800/20 p-6 rounded-xl border border-green-200 dark:border-green-700">
                  <h4 className="m-0 mb-4 text-gray-900 dark:text-white text-xl">Resumen de la Solicitud</h4>
                  <div className="flex flex-col gap-3">
                    <div className="flex justify-between items-start pb-3 border-b border-dashed border-gray-300 dark:border-gray-600">
                      <span className="text-gray-600 dark:text-gray-400 font-medium min-w-[150px]">Servicio solicitado:</span>
                      <strong className="text-gray-900 dark:text-white">{selectedService.name}</strong>
                    </div>
                    <div className="flex justify-between items-start pb-3 border-b border-dashed border-gray-300 dark:border-gray-600">
                      <span className="text-gray-600 dark:text-gray-400 font-medium min-w-[150px]">Fecha y hora:</span>
                      <strong className="text-gray-900 dark:text-white">{formatDateForDisplay(formData.requestDate)}</strong>
                    </div>
                    <div className="flex justify-between items-start">
                      <span className="text-gray-600 dark:text-gray-400 font-medium min-w-[150px]">Detalles:</span>
                      <div className="max-w-[400px] bg-white dark:bg-gray-700 p-3 rounded-md border border-gray-300 dark:border-gray-600 text-sm leading-snug text-gray-700 dark:text-gray-300">
                        {formData.details || <em>No se proporcionaron detalles</em>}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Botones */}
                <div className="flex justify-end gap-4 mt-5 pt-6 border-t border-gray-200 dark:border-gray-700">
                  <button
                    type="button"
                    className="px-7 py-3.5 bg-gray-100 dark:bg-gray-700 border-2 border-gray-300 dark:border-gray-600 rounded-lg font-semibold cursor-pointer transition-all duration-200 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600 hover:border-gray-400 dark:hover:border-gray-500 hover:text-gray-900 dark:hover:text-white"
                    onClick={closeModal}
                    disabled={isSubmitting}
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    className="px-8 py-3.5 bg-gradient-to-br from-[#1a1a2e] to-[#2c3e50] text-white rounded-lg font-semibold cursor-pointer transition-all duration-300 shadow-[0_4px_12px_rgba(26,26,46,0.2)] hover:from-[#2c3e50] hover:to-[#1a1a2e] hover:-translate-y-0.5 hover:shadow-[0_6px_16px_rgba(26,26,46,0.3)] active:translate-y-0 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:translate-y-0"
                    disabled={isSubmitting || userBookings.length === 0}
                  >
                    {isSubmitting ? 'Enviando...' : 'Enviar Solicitud'}
                  </button>
                </div>

                {/* Información legal */}
                <div className="mt-5 p-4 bg-gray-100 dark:bg-gray-800 rounded-lg border-l-4 border-[#2a9d8f]">
                  <p className="m-0 text-gray-600 dark:text-gray-400 text-sm leading-snug">
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

export default Services;