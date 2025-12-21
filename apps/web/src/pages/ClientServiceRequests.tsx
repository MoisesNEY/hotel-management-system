import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Coffee, Search, Clock, Plus, X, Heart, AlertCircle, Info, ChevronDown, FileText } from 'lucide-react';
import { useAuth } from '../contexts/AuthProvider';
import { getAllHotelServices } from '../services/admin/hotelServiceService';
import { getMyBookings } from '../services/client/bookingService';
import { createServiceRequest, getMyServiceRequests } from '../services/client/serviceRequestService';
import type { HotelServiceDTO } from '../types/adminTypes';
import type { BookingResponse, ServiceRequestResponse } from '../types/clientTypes';

const ClientServiceRequests: React.FC = () => {
  const { isAuthenticated, roles } = useAuth();
  const navigate = useNavigate();
  const [services, setServices] = useState<HotelServiceDTO[]>([]);
  const [bookings, setBookings] = useState<BookingResponse[]>([]);
  const [myRequests, setMyRequests] = useState<ServiceRequestResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [selectedService, setSelectedService] = useState<HotelServiceDTO | null>(null);
  const [selectedBookingId, setSelectedBookingId] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  const [formData, setFormData] = useState({
    details: ''
  });

  useEffect(() => {
    if (!isAuthenticated || !roles.includes('ROLE_CLIENT')) {
      navigate('/');
      return;
    }

    const fetchData = async () => {
      try {
        const [servicesRes, bookingsRes, requestsRes] = await Promise.all([
          getAllHotelServices(0, 100),
          getMyBookings(),
          getMyServiceRequests()
        ]);

        setServices(servicesRes.data.filter(s => s.status === 'OPERATIONAL'));
        // Only allow service requests for CHECKED_IN bookings
        const checkedIn = bookingsRes.data.filter(b => b.status === 'CHECKED_IN');
        setBookings(checkedIn);
        setMyRequests(requestsRes.data);

        if (checkedIn.length > 0) {
          setSelectedBookingId(checkedIn[0].id.toString());
        }
      } catch (err) {
        console.error('Error fetching service request data', err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [isAuthenticated, roles, navigate]);

  const filteredServices = services.filter(s =>
    s.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    s.description?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleOpenModal = (service: HotelServiceDTO) => {
    setSelectedService(service);
    setShowModal(true);
    setFormData({ details: '' });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedBookingId || !selectedService || !selectedService.id) return;

    try {
      setIsSubmitting(true);
      await createServiceRequest({
        details: formData.details,
        serviceId: selectedService.id,
        bookingId: Number(selectedBookingId)
      });

      // Refresh requests
      const updatedRequests = await getMyServiceRequests();
      setMyRequests(updatedRequests.data);

      setShowModal(false);
      alert('Solicitud enviada con éxito');
    } catch (err) {
      alert('Error al enviar la solicitud');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) {
    return <div className="min-h-screen bg-white dark:bg-[#050505] flex items-center justify-center">
      <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-[#d4af37]"></div>
    </div>;
  }

  return (
    <div className="min-h-screen bg-white dark:bg-[#050505] text-gray-900 dark:text-white selection:bg-[#d4af37]/30">
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">

        <div className="flex flex-col md:flex-row md:items-center justify-between mb-12 gap-6">
          <div>
            <h1 className="text-4xl font-light mb-2 text-gray-900 dark:text-white">Solicitar <span className="text-[#d4af37] font-semibold">Servicios</span></h1>
            <p className="text-gray-500 dark:text-gray-400">Personaliza tu estancia con nuestros servicios exclusivos de Room Service y Amenities.</p>
          </div>
          <button
            onClick={() => navigate('/client/dashboard')}
            className="text-gray-500 dark:text-gray-400 hover:text-[#d4af37] transition-colors flex items-center gap-2 font-medium"
          >
            Volver al Dashboard
          </button>
        </div>

        {bookings.length === 0 ? (
          <div className="bg-gray-50 dark:bg-[#111111] border border-gray-200 dark:border-white/5 rounded-3xl p-12 text-center mb-12">
            <AlertCircle className="mx-auto text-yellow-500 mb-4" size={48} />
            <h3 className="text-2xl text-gray-900 dark:text-white font-light mb-2">Acceso Restringido</h3>
            <p className="text-gray-500 dark:text-gray-400 max-w-md mx-auto">
              Para solicitar servicios, debes tener una reserva con estado <strong>CHECKED_IN</strong> (Estar actualmente en el hotel).
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">

            {/* Services List */}
            <div className="lg:col-span-2 space-y-8">
              <div className="relative group">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 dark:text-gray-500 group-focus-within:text-[#d4af37] transition-colors" size={20} />
                <input
                  type="text"
                  placeholder="Buscar un servicio (Spa, Masajes, Comida...)"
                  className="w-full bg-gray-50 dark:bg-[#111111] border border-gray-200 dark:border-white/10 rounded-2xl py-4 pl-12 pr-4 text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:border-[#d4af37]/50 transition-all"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {filteredServices.map(service => (
                  <div key={service.id} className="bg-gray-50 dark:bg-[#111111] border border-gray-200 dark:border-white/5 rounded-3xl p-6 hover:border-[#d4af37]/30 transition-all group">
                    <div className="flex items-start justify-between mb-4">
                      <div className="w-12 h-12 bg-gray-200 dark:bg-white/5 rounded-2xl flex items-center justify-center text-[#d4af37] group-hover:scale-110 transition-transform overflow-hidden">
                        {service.imageUrl ? <img src={service.imageUrl} className="w-full h-full object-cover" /> : <Coffee size={24} />}
                      </div>
                      <div className="text-right">
                        <span className="text-[10px] text-gray-500 uppercase tracking-widest font-bold">Precio</span>
                        <p className="text-[#d4af37] text-lg font-bold">${service.cost}</p>
                      </div>
                    </div>
                    <h3 className="text-xl font-semibold mb-2 text-gray-900 dark:text-white">{service.name}</h3>
                    <p className="text-gray-500 dark:text-gray-400 text-sm mb-6 line-clamp-2">{service.description}</p>
                    <button
                      onClick={() => handleOpenModal(service)}
                      className="w-full py-3 bg-white dark:bg-white/5 border border-gray-200 dark:border-transparent hover:bg-[#d4af37] hover:text-black hover:border-[#d4af37] text-gray-700 dark:text-white transition-all rounded-xl font-bold flex items-center justify-center gap-2"
                    >
                      <Plus size={18} /> Solicitar
                    </button>
                  </div>
                ))}
              </div>
            </div>

            {/* Recent Requests Sidebar */}
            <div className="space-y-8">
              <div className="bg-gray-50 dark:bg-[#111111] border border-gray-200 dark:border-white/5 rounded-3xl p-8">
                <h2 className="text-xl font-semibold mb-6 flex items-center gap-2 text-gray-900 dark:text-white">
                  <Clock size={20} className="text-[#d4af37]" /> Solicitudes Recientes
                </h2>
                <div className="space-y-4">
                  {myRequests.length === 0 ? (
                    <p className="text-gray-500 text-center py-8 text-sm">No has realizado ninguna solicitud aún.</p>
                  ) : myRequests.slice(0, 5).map(req => (
                    <div key={req.id} className="p-4 bg-white dark:bg-white/5 rounded-2xl border border-gray-100 dark:border-white/5">
                      <div className="flex justify-between items-start mb-2">
                        <span className="text-sm font-semibold text-gray-900 dark:text-white">{req.serviceName}</span>
                        <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${req.status === 'COMPLETED' ? 'bg-green-500/20 text-green-600 dark:text-green-400 border border-green-500/30' :
                          req.status === 'REJECTED' ? 'bg-red-500/20 text-red-600 dark:text-red-400 border border-red-500/30' :
                            'bg-yellow-500/20 text-yellow-600 dark:text-yellow-400 border border-yellow-500/30'
                          }`}>
                          {req.status}
                        </span>
                      </div>
                      <p className="text-xs text-gray-500 dark:text-gray-400 line-clamp-2 mb-2">{req.details}</p>
                      <span className="text-[10px] text-gray-400 dark:text-gray-600 uppercase tracking-tighter font-medium">{new Date(req.requestDate).toLocaleString()}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

          </div>
        )}

        {/* Request Modal */}
        {showModal && selectedService && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-black/60 backdrop-blur-md" onClick={() => setShowModal(false)}></div>
            <div className="bg-white dark:bg-[#111111] border border-gray-200 dark:border-white/10 w-full max-w-xl rounded-3xl overflow-hidden relative z-10 animate-in zoom-in-95 duration-200 shadow-2xl">
              <div className="p-8 border-b border-gray-100 dark:border-white/5 flex justify-between items-center">
                <h3 className="text-2xl text-gray-900 dark:text-white font-light">Confirmar <span className="text-[#d4af37] font-semibold">Solicitud</span></h3>
                <button onClick={() => setShowModal(false)} className="text-gray-400 hover:text-gray-600 dark:hover:text-white transition-colors p-2 hover:bg-gray-100 dark:hover:bg-white/5 rounded-full"><X size={20} /></button>
              </div>
              <form onSubmit={handleSubmit} className="p-8 space-y-6">
                <div className="bg-gray-50 dark:bg-white/5 p-4 rounded-2xl flex items-center gap-4 border border-gray-100 dark:border-white/5">
                  <div className="w-12 h-12 bg-[#d4af37]/10 rounded-xl flex items-center justify-center text-[#d4af37]">
                    <Heart size={24} />
                  </div>
                  <div>
                    <p className="text-[10px] text-gray-500 font-bold tracking-widest uppercase">Servicio seleccionado</p>
                    <p className="text-lg font-bold text-gray-900 dark:text-white">{selectedService.name} - <span className="text-[#d4af37]">${selectedService.cost}</span></p>
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="space-y-2">
                    <label className="text-sm font-semibold text-gray-500 dark:text-gray-400 flex items-center gap-2">
                      <Plus size={14} className="text-[#d4af37]" /> Seleccionar estancia
                    </label>
                    <div className="relative">
                      <select
                        className="w-full bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-xl py-4 px-4 appearance-none focus:outline-none focus:border-[#d4af37]/50 text-gray-900 dark:text-white font-medium"
                        value={selectedBookingId}
                        onChange={(e) => setSelectedBookingId(e.target.value)}
                        required
                      >
                        {bookings.map(b => (
                          <option key={b.id} value={b.id} className="bg-white dark:bg-[#111111]">Reserva #{b.code} (Hab {b.items[0]?.assignedRoomNumber || 'N/A'})</option>
                        ))}
                      </select>
                      <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-semibold text-gray-500 dark:text-gray-400 flex items-center gap-2">
                      <FileText size={14} className="text-[#d4af37]" /> Instrucciones especiales
                    </label>
                    <textarea
                      placeholder="Ej: Toallas extras, sin cebolla, traer a las 8:00 PM..."
                      className="w-full bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-xl py-4 px-4 min-h-[120px] focus:outline-none focus:border-[#d4af37]/50 text-gray-900 dark:text-white placeholder-gray-400"
                      value={formData.details}
                      onChange={(e) => setFormData({ ...formData, details: e.target.value })}
                      required
                    ></textarea>
                  </div>
                </div>

                <div className="bg-blue-50 dark:bg-[#d4af37]/5 border border-blue-100 dark:border-[#d4af37]/10 p-4 rounded-2xl flex gap-3">
                  <Info size={18} className="text-blue-500 dark:text-[#d4af37] shrink-0" />
                  <p className="text-[11px] text-blue-700 dark:text-gray-400 leading-relaxed font-medium italic">
                    El costo de este servicio se cargará automáticamente a la cuenta de su habitación y podrá ser cancelado al momento del Check-out.
                  </p>
                </div>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full py-4 bg-[#d4af37] hover:bg-[#b8962d] text-black font-bold rounded-xl transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  {isSubmitting ? 'Procesando...' : 'Confirmar Solicitud'}
                </button>
              </form>
            </div>
          </div>
        )}

      </main>
    </div>
  );
};

export default ClientServiceRequests;
