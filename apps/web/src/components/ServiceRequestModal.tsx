import React, { useState, useEffect } from 'react';
import { X, Check, AlertCircle, Loader } from 'lucide-react';
import { getAllHotelServices } from '../services/admin/hotelServiceService';
import { createServiceRequest } from '../services/client/serviceRequestService';
import type { HotelServiceDTO } from '../types/sharedTypes';

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
  }, []);

  const fetchServices = async () => {
    try {
      setLoadingServices(true);
      // Fetch all services, we can optimize pagination later if needed
      const response = await getAllHotelServices(0, 100);
      // Filter only available services
      const availableServices = response.data.filter(s => s.isAvailable);
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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fadeIn">
      <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl overflow-hidden animate-slideUp">
        <div className="bg-[#d4af37] p-4 flex justify-between items-center text-white">
          <h2 className="text-xl font-bold font-serif">Solicitar Servicio</h2>
          <button 
            onClick={onClose}
            className="p-1 hover:bg-white/20 rounded-full transition-colors"
          >
            <X size={24} />
          </button>
        </div>

        <div className="p-6">
          <div className="mb-6 bg-gray-50 p-3 rounded-lg border border-gray-200">
            <p className="text-sm text-gray-500 mb-1">Para la reserva:</p>
            <p className="font-semibold text-gray-800 flex justify-between">
              {roomTypeName}
              <span className="text-xs bg-[#d4af37]/10 text-[#d4af37] px-2 py-1 rounded">#{bookingId}</span>
            </p>
          </div>

          {loadingServices ? (
            <div className="flex flex-col items-center justify-center py-8 text-gray-400">
              <Loader className="animate-spin mb-2" size={32} />
              <p>Cargando servicios...</p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              {error && (
                <div className="bg-red-50 text-red-600 p-3 rounded-lg text-sm flex items-start gap-2">
                  <AlertCircle size={16} className="mt-0.5 shrink-0" />
                  <span>{error}</span>
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Selecciona un servicio
                </label>
                <select
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#d4af37] focus:border-transparent outline-none transition-all"
                  value={selectedServiceId}
                  onChange={(e) => setSelectedServiceId(Number(e.target.value))}
                  required
                >
                  <option value="">-- Seleccionar --</option>
                  {services.map(service => (
                    <option key={service.id} value={service.id}>
                      {service.name} - ${service.cost}
                    </option>
                  ))}
                </select>
              </div>

              {selectedService && (
                <div className="bg-yellow-50 p-3 rounded-lg border border-yellow-100 text-sm text-yellow-800">
                  <p className="font-medium">{selectedService.name}</p>
                  <p className="opacity-90 mt-1">{selectedService.description}</p>
                  <p className="font-bold mt-2 text-[#d4af37] text-lg">${selectedService.cost}</p>
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Detalles o instrucciones adicionales
                </label>
                <textarea
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#d4af37] focus:border-transparent outline-none transition-all resize-none"
                  rows={3}
                  placeholder="Ej: Por favor traer toallas extra..."
                  value={details}
                  onChange={(e) => setDetails(e.target.value)}
                  required
                />
              </div>

              <div className="pt-2 flex gap-3">
                <button
                  type="button"
                  onClick={onClose}
                  className="flex-1 px-4 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 font-medium transition-colors"
                  disabled={submitting}
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-3 bg-[#d4af37] text-white rounded-lg hover:bg-[#b5952f] font-bold shadow-md hover:shadow-lg transition-all disabled:opacity-70 disabled:cursor-not-allowed flex justify-center items-center gap-2"
                  disabled={submitting || !selectedServiceId}
                >
                  {submitting ? (
                    <>
                      <Loader className="animate-spin" size={18} />
                      Enviando...
                    </>
                  ) : (
                    <>
                      <Check size={18} />
                      Solicitar
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
