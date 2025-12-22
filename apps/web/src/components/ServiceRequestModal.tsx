import React, { useState, useEffect } from 'react';
import { X, Check, AlertCircle, Loader, Hotel, Bed } from 'lucide-react';
import { getAllHotelServices } from '../services/admin/hotelServiceService';
import { createServiceRequest } from '../services/client/serviceRequestService';
import type { HotelServiceDTO } from '../types/adminTypes';

interface ServiceRequestModalProps {
  bookingId: number;
  roomTypeName: string;
  onClose: () => void;
  onSuccess: () => void;
}

const ServiceRequestModal: React.FC<ServiceRequestModalProps> = ({
  bookingId,
  roomTypeName,
  onClose,
  onSuccess
}) => {
  const [services, setServices] = useState<HotelServiceDTO[]>([]);
  const [loadingServices, setLoadingServices] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [selectedServiceId, setSelectedServiceId] = useState<number | ''>('');
  const [details, setDetails] = useState('');

  useEffect(() => {
    fetchServices();
    // Add overflow hidden to body when modal is open
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, []);

  const fetchServices = async () => {
    try {
      setLoadingServices(true);
      // Fetch all services, we can optimize pagination later if needed
      const response = await getAllHotelServices(0, 100);
      // Filter only available services
      const availableServices = response.data.filter(s => s.status === 'OPERATIONAL');
      setServices(availableServices);
    } catch (err) {
      console.error('Error fetching services:', err);
      setError('No se pudieron cargar los servicios disponibles.');
    } finally {
      setLoadingServices(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedServiceId) return;

    try {
      setSubmitting(true);
      setError(null);

      await createServiceRequest({
        bookingId,
        serviceId: Number(selectedServiceId),
        details: details.trim()
      });

      onSuccess();
      onClose();
    } catch (err) {
      console.error('Error creating service request:', err);
      setError('Hubo un error al crear la solicitud. Intenta nuevamente.');
    } finally {
      setSubmitting(false);
    }
  };

  const selectedService = services.find(s => s.id === Number(selectedServiceId));

  return (
    <div className="fixed inset-0 z-60 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fadeIn">
      {/* Click outside to close can be added here if needed */}
      <div
        className="bg-white dark:bg-gray-800 rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden animate-slideUp border border-gray-100 dark:border-gray-700 flex flex-col max-h-[90vh]"
        role="dialog"
        aria-modal="true"
      >
        {/* Header */}
        <div className="bg-[#d4af37] p-5 flex justify-between items-center text-white shrink-0 shadow-sm relative z-10">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-white/20 rounded-lg backdrop-blur-sm">
              <Hotel size={24} className="text-white" />
            </div>
            <div>
              <h2 className="text-xl font-bold font-serif leading-tight">Solicitar Servicio</h2>
              <p className="text-xs text-white/90 font-medium">Conserjería Digital</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-white/20 rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-white/50"
            aria-label="Cerrar modal"
          >
            <X size={24} />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto custom-scrollbar dark:text-gray-100">

          {/* Reservation Info Card */}
          <div className="mb-6 bg-gray-50 dark:bg-gray-700/50 p-4 rounded-xl border border-gray-100 dark:border-gray-600 flex items-start sm:items-center gap-4 transition-colors">
            <div className="p-3 bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-lg shrink-0">
              <Bed size={24} />
            </div>
            <div className="flex-1">
              <p className="text-sm text-gray-500 dark:text-gray-400 font-medium mb-1">Solicitud para habitación:</p>
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <p className="font-bold text-gray-800 dark:text-white text-lg">
                  {roomTypeName}
                </p>
                <span className="text-xs font-bold bg-[#d4af37]/10 text-[#d4af37] dark:bg-[#d4af37]/20 dark:text-[#f0cb5e] px-3 py-1.5 rounded-full inline-flex items-center gap-1 self-start sm:self-auto border border-[#d4af37]/20">
                  <span>#</span>{bookingId}
                </span>
              </div>
            </div>
          </div>

          {loadingServices ? (
            <div className="flex flex-col items-center justify-center py-12 text-gray-400 dark:text-gray-500">
              <Loader className="animate-spin mb-3 text-[#d4af37]" size={40} />
              <p className="font-medium animate-pulse">Cargando catálogo de servicios...</p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-6">
              {error && (
                <div className="bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 p-4 rounded-xl text-sm flex items-start gap-3 border border-red-100 dark:border-red-800/50 animate-fadeIn">
                  <AlertCircle size={20} className="mt-0.5 shrink-0" />
                  <span className="font-medium">{error}</span>
                </div>
              )}

              {/* Service Selection */}
              <div className="space-y-2">
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 ml-1">
                  Selecciona un servicio
                </label>
                <div className="relative">
                  <select
                    className="w-full px-4 py-3.5 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-[#d4af37] focus:border-[#d4af37] outline-none transition-all appearance-none shadow-sm text-gray-700 dark:text-white"
                    value={selectedServiceId}
                    onChange={(e) => setSelectedServiceId(Number(e.target.value))}
                    required
                  >
                    <option value="">-- Seleccionar servicio --</option>
                    {services.map(service => (
                      <option key={service.id} value={service.id}>
                        {service.name}
                      </option>
                    ))}
                  </select>
                  <div className="absolute inset-y-0 right-0 flex items-center pr-4 pointer-events-none text-gray-500 dark:text-gray-400">
                    <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                    </svg>
                  </div>
                </div>
              </div>

              {/* Selected Service Details Card */}
              {selectedService && (
                <div className="bg-[#FFFDF5] dark:bg-yellow-900/10 p-4 rounded-xl border border-[#d4af37]/20 border-l-4 border-l-[#d4af37] shadow-sm animate-fadeIn">
                  <div className="flex justify-between items-start gap-3">
                    <div>
                      <p className="font-bold text-gray-900 dark:text-white text-lg">{selectedService.name}</p>
                      <p className="opacity-80 mt-1 text-sm text-gray-600 dark:text-gray-300 leading-relaxed">
                        {selectedService.description}
                      </p>
                    </div>
                    <div className="flex flex-col items-end shrink-0">
                      <span className="text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wider font-semibold">Precio</span>
                      <p className="font-bold text-xl text-[#d4af37] dark:text-[#f0cb5e]">${selectedService.cost}</p>
                    </div>
                  </div>
                </div>
              )}

              {/* Notes */}
              <div className="space-y-2">
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 ml-1">
                  Detalles adicionales <span className="text-gray-400 font-normal">(Opcional)</span>
                </label>
                <textarea
                  className="w-full px-4 py-3 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-[#d4af37] focus:border-[#d4af37] outline-none transition-all resize-none shadow-sm text-gray-700 dark:text-white placeholder-gray-400 dark:placeholder-gray-500"
                  rows={3}
                  placeholder="Ej: Necesito toallas extra, almohadas hipoalergénicas..."
                  value={details}
                  onChange={(e) => setDetails(e.target.value)}
                />
              </div>

              {/* Actions */}
              <div className="pt-4 flex gap-4">
                <button
                  type="button"
                  onClick={onClose}
                  className="flex-1 px-4 py-3.5 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-700 font-semibold transition-all focus:ring-2 focus:ring-gray-200 dark:focus:ring-gray-600 outline-none"
                  disabled={submitting}
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-3.5 bg-linear-to-r from-[#d4af37] to-[#b5952f] text-white rounded-xl hover:shadow-lg hover:to-[#9e8229] font-bold shadow-md transform hover:-translate-y-0.5 transition-all disabled:opacity-70 disabled:cursor-not-allowed disabled:transform-none flex justify-center items-center gap-2 focus:ring-4 focus:ring-[#d4af37]/30 outline-none"
                  disabled={submitting || !selectedServiceId}
                >
                  {submitting ? (
                    <>
                      <Loader className="animate-spin" size={20} />
                      Enviando...
                    </>
                  ) : (
                    <>
                      Solicitar Servicio
                      <Check size={20} className="stroke-[3px]" />
                    </>
                  )}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};

export default ServiceRequestModal;