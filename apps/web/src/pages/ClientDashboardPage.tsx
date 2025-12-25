import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Calendar, CreditCard, PieChart, Star, Coffee, ChevronRight, CheckCircle2, Clock, X, Bed, FileText, Eye } from 'lucide-react';
import { useAuth } from '../contexts/AuthProvider';
import { getMyBookings } from '../services/client/bookingService';
import { getMyInvoices, getInvoicesByBookingId, getMyInvoice } from '../services/client/invoiceService';
import type { BookingResponse } from '../types/clientTypes';
import type { InvoiceDTO } from '../types/adminTypes';
import RoomTypes from '../components/RoomTypes';
import { PayPalPaymentButton } from '../components/PayPalPaymentButton';
import InvoiceDetailsModal from '../components/modals/InvoiceDetailsModal';

const ClientDashboardPage: React.FC = () => {
  const { userProfile: user } = useAuth();
  const navigate = useNavigate();
  const [bookings, setBookings] = useState<BookingResponse[]>([]);
  const [invoices, setInvoices] = useState<InvoiceDTO[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'overview' | 'bookings' | 'history'>('overview');
  const [selectedBooking, setSelectedBooking] = useState<BookingResponse | null>(null);
  const [selectedInvoice, setSelectedInvoice] = useState<InvoiceDTO | null>(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [showInvoiceModal, setShowInvoiceModal] = useState(false);
  const [bookingInvoices, setBookingInvoices] = useState<InvoiceDTO[]>([]);
  const [loadingBookingInvoices, setLoadingBookingInvoices] = useState(false);

  const loadData = async () => {
    try {
      const [bookingsRes, invoicesRes] = await Promise.all([
        getMyBookings(),
        getMyInvoices()
      ]);
      setBookings(bookingsRes.data);
      setInvoices(invoicesRes.data);
    } catch (error) {
      console.error("Error fetching dashboard data", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const formatDate = (dateVal: string | number[] | null | undefined) => {
    if (!dateVal) return 'N/A';
    try {
      if (Array.isArray(dateVal)) {
        // [year, month, day] - month is 1-based in Java, 0-based in JS
        return new Date(dateVal[0], dateVal[1] - 1, dateVal[2]).toLocaleDateString('es-ES', {
            year: 'numeric', month: 'short', day: 'numeric'
        });
      }
      const date = new Date(dateVal as string);
      if (isNaN(date.getTime())) return 'N/A';
      return date.toLocaleDateString('es-ES', {
        year: 'numeric', month: 'short', day: 'numeric'
      });
    } catch (error) {
      return 'N/A';
    }
  };

  // Find current or next stay
  const currentStay = bookings.find(b => b.status === 'CHECKED_IN' || b.status === 'CONFIRMED');

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'CONFIRMED': return 'bg-green-500/20 text-green-400 border-green-500/50';
      case 'CHECKED_IN': return 'bg-blue-500/20 text-blue-400 border-blue-500/50';
      case 'PENDING_APPROVAL': return 'bg-orange-500/20 text-orange-400 border-orange-500/50';
      case 'PENDING_PAYMENT': return 'bg-purple-500/20 text-purple-400 border-purple-500/50';
      case 'CANCELLED': return 'bg-red-500/20 text-red-400 border-red-500/50';
      default: return 'bg-gray-500/20 text-gray-400 border-gray-500/50';
    }
  };

  const getStatusLabel = (status: string) => {
     switch (status) {
         case 'PENDING_APPROVAL': return 'Pendiente de Aprobación';
         case 'PENDING_PAYMENT': return 'Aprobada - Pendiente de Pago';
         case 'CONFIRMED': return 'Confirmada';
         case 'CHECKED_IN': return 'En Estancia';
         case 'CHECKED_OUT': return 'Finalizada';
         case 'CANCELLED': return 'Cancelada';
         default: return status;
     }
  };

  const handleOpenBookingDetails = async (booking: BookingResponse) => {
    setSelectedBooking(booking);
    setShowDetailsModal(true);
    setLoadingBookingInvoices(true);
    try {
      const invoicesData = await getInvoicesByBookingId(booking.id);
      setBookingInvoices(invoicesData);
    } catch (e) {
      console.error('Error loading invoices for booking', e);
      setBookingInvoices([]);
    } finally {
      setLoadingBookingInvoices(false);
    }
  };


  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#d4af37]"></div>
      </div>
    );
  }

  const handleScrollToRooms = (e: React.MouseEvent) => {
    e.preventDefault();
    if (activeTab !== 'overview') {
      setActiveTab('overview');
      // Give React a moment to render the section before scrolling
      setTimeout(() => {
        const element = document.getElementById('rooms-section');
        if (element) {
          element.scrollIntoView({ behavior: 'smooth' });
        }
      }, 100);
    } else {
      const element = document.getElementById('rooms-section');
      if (element) {
        element.scrollIntoView({ behavior: 'smooth' });
      }
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      
      {/* Welcome Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-12 gap-6">
        <div>
          <h1 className="text-4xl font-light mb-2 text-gray-900 dark:text-white">
            Bienvenido, <span className="font-semibold text-[#d4af37]">{user?.firstName || user?.username}</span>
          </h1>
          <p className="text-gray-500 dark:text-gray-400">Gestiona tu estancia y descubre servicios exclusivos.</p>
        </div>
        <div className="flex gap-4">
          <button
            onClick={handleScrollToRooms}
            className="px-6 py-3 bg-[#d4af37] text-black font-semibold rounded-full hover:bg-[#b8962d] transition-all duration-300 flex items-center gap-2"
          >
            <Calendar size={18} /> Ver Disponibilidad
          </button>
        </div>
      </div>

      {/* Dashboard Navigation */}
      <div className="flex border-b border-gray-200 dark:border-white/10 mb-8 overflow-x-auto whitespace-nowrap scrollbar-hide">
        <button 
          onClick={() => setActiveTab('overview')}
          className={`px-8 py-4 transition-all duration-300 font-medium relative ${activeTab === 'overview' ? 'text-[#d4af37]' : 'text-gray-500 hover:text-gray-900 dark:hover:text-white'}`}
        >
          Resumen
          {activeTab === 'overview' && <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#d4af37]"></div>}
        </button>
        <button 
          onClick={() => setActiveTab('bookings')}
          className={`px-8 py-4 transition-all duration-300 font-medium relative ${activeTab === 'bookings' ? 'text-[#d4af37]' : 'text-gray-500 hover:text-gray-900 dark:hover:text-white'}`}
        >
          Mis Reservas
          {activeTab === 'bookings' && <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#d4af37]"></div>}
        </button>
        <button 
          onClick={() => setActiveTab('history')}
          className={`px-8 py-4 transition-all duration-300 font-medium relative ${activeTab === 'history' ? 'text-[#d4af37]' : 'text-gray-500 hover:text-gray-900 dark:hover:text-white'}`}
        >
          Historial de Pagos
          {activeTab === 'history' && <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#d4af37]"></div>}
        </button>
      </div>

      {/* Tab Content */}
      <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
        
        {activeTab === 'overview' && (
          <>
            {/* Section A: Mi Estancia Actual / Próxima */}
            <section>
              <h2 className="text-xl font-medium mb-6 flex items-center gap-2 text-gray-900 dark:text-white">
                <Star className="text-[#d4af37]" /> Estancia Próxima
              </h2>
              
              {currentStay ? (
                <div className="relative overflow-hidden rounded-3xl group shadow-2xl">
                  <div className="absolute inset-0 bg-gradient-to-r from-black via-black/80 to-transparent z-10"></div>
                  <img 
                    src="https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?auto=format&fit=crop&q=80&w=2070" 
                    alt="Hotel" 
                    className="w-full h-[400px] object-cover group-hover:scale-110 transition-transform duration-1000"
                  />
                  <div className="absolute inset-0 z-20 p-8 md:p-12 flex flex-col justify-end">
                    <div className="max-w-xl">
                      <div className={`inline-flex items-center px-4 py-1.5 rounded-full border text-sm font-medium mb-4 ${getStatusColor(currentStay.status)}`}>
                        {currentStay.status === 'CHECKED_IN' ? 'Estancia en curso' : 'Confirmada'}
                      </div>
                      <h3 className="text-4xl md:text-5xl font-bold mb-4">Tu viaje a León</h3>
                      <div className="flex flex-wrap gap-6 mb-8">
                        <div className="flex items-center gap-3">
                          <Calendar className="text-[#d4af37]" />
                          <div>
                            <p className="text-xs text-gray-400 uppercase tracking-wider">Fechas</p>
                            <p className="font-medium text-white">{formatDate(currentStay.checkInDate)} — {formatDate(currentStay.checkOutDate)}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-3">
                          <Clock className="text-[#d4af37]" />
                          <div>
                            <p className="text-xs text-gray-400 uppercase tracking-wider">Código</p>
                            <p className="font-medium text-white">{currentStay.code}</p>
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex flex-wrap gap-4">
                        {currentStay.status === 'CHECKED_IN' && (
                          <button 
                            onClick={() => navigate('/client/services')}
                            className="px-8 py-3 bg-white text-black font-semibold rounded-full hover:bg-gray-200 transition-colors flex items-center gap-2"
                          >
                            <Coffee size={18} /> Solicitar Room Service
                          </button>
                        )}
                        <button 
                          onClick={() => handleOpenBookingDetails(currentStay)}
                          className="px-8 py-3 bg-white/10 backdrop-blur-md border border-white/20 text-white font-semibold rounded-full hover:bg-white/20 transition-colors"
                        >
                          Detalles de la Reserva
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="bg-white dark:bg-[#111111] border border-gray-200 dark:border-white/5 rounded-3xl p-12 text-center shadow-sm dark:shadow-none">
                  <div className="w-20 h-20 bg-gray-100 dark:bg-white/5 rounded-full flex items-center justify-center mx-auto mb-6">
                    <Calendar size={32} className="text-gray-400 dark:text-gray-600" />
                  </div>
                  <h3 className="text-2xl font-light mb-2 text-gray-900 dark:text-white">No tienes estancias activas</h3>
                  <p className="text-gray-500 mb-8 max-w-md mx-auto">Reserva tu próxima experiencia de lujo en Hotel León.</p>
                  <button
                    onClick={handleScrollToRooms}
                    className="px-8 py-3 border border-[#d4af37] text-[#d4af37] font-semibold rounded-full hover:bg-[#d4af37] hover:text-black transition-all duration-300"
                  >
                    Explorar Habitaciones
                  </button>
                </div>
              )}
            </section>

            {/* Summary Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-4">
              <div className="bg-white dark:bg-[#111111] border border-gray-200 dark:border-white/5 p-8 rounded-3xl hover:border-[#d4af37]/30 transition-colors md:col-span-1 shadow-sm dark:shadow-none">
                <div className="flex items-center gap-4 mb-4 text-gray-500 dark:text-gray-400">
                  <PieChart size={24} />
                  <span className="font-medium">Total de Estancias</span>
                </div>
                <div className="text-4xl font-semibold text-gray-900 dark:text-white">{bookings.length}</div>
              </div>
              <div className="md:col-span-2 invisible md:block"></div>
            </div>

            {/* Section C: Reservar Nueva Estancia */}
            <section id="rooms-section" className="pt-12">
               <div className="mb-8">
                  <h2 className="text-3xl font-light mb-2 text-gray-900 dark:text-white">Reserva tu <span className="text-[#d4af37] font-semibold">Próxima Diferencia</span></h2>
                  <p className="text-gray-500 dark:text-gray-400">Selecciona el tipo de habitación que mejor se adapte a tus necesidades.</p>
               </div>
               <div className="bg-white dark:bg-white/5 rounded-3xl overflow-hidden border border-gray-200 dark:border-white/5 shadow-sm dark:shadow-none">
                  <RoomTypes />
               </div>
            </section>
          </>
        )}

        {activeTab === 'bookings' && (
          <section className="bg-white dark:bg-[#111111] border border-gray-200 dark:border-white/5 rounded-3xl overflow-hidden shadow-sm dark:shadow-none">
            <div className="p-8 border-b border-gray-200 dark:border-white/5">
              <h2 className="text-xl font-medium text-gray-900 dark:text-white">Gestión de Reservas</h2>
              <p className="text-sm text-gray-500 dark:text-gray-400">Consulta el estado y gestiona los pagos de tus reservas.</p>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="bg-gray-50 dark:bg-white/5 text-gray-500 dark:text-gray-400 text-xs uppercase tracking-widest font-medium">
                    <th className="px-8 py-4">Código</th>
                    <th className="px-8 py-4">Fechas</th>
                    <th className="px-8 py-4">Huéspedes</th>
                    <th className="px-8 py-4">Estado</th>
                    <th className="px-8 py-4 text-right">Acciones</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {bookings.length > 0 ? bookings.map((booking: BookingResponse) => (
                    <tr key={booking.id} className="hover:bg-gray-50 dark:hover:bg-white/5 transition-colors group">
                      <td className="px-8 py-6 font-mono text-[#d4af37]">{booking.code}</td>
                      <td className="px-8 py-6">
                          <span className="block text-sm font-medium text-gray-900 dark:text-white">{formatDate(booking.checkInDate)}</span>
                          <span className="block text-xs text-gray-500">al {formatDate(booking.checkOutDate)}</span>
                      </td>
                      <td className="px-8 py-6">
                        <div className="flex items-center gap-2">
                           <span className="font-medium text-gray-900 dark:text-white">{booking.guestCount}</span>
                           <span className="text-xs text-gray-500">Personas</span>
                        </div>
                      </td>
                      <td className="px-8 py-6">
                        <span className={`px-3 py-1 rounded-full text-[10px] font-bold border ${getStatusColor(booking.status)}`}>
                          {getStatusLabel(booking.status)}
                        </span>
                      </td>
                      <td className="px-8 py-6 text-right">
                        <div className="flex justify-end gap-3">
                           {/* Botón de PayPal SOLO si está en PENDING_PAYMENT */}
                           {booking.status === 'PENDING_PAYMENT' && (
                            <button 
                                onClick={() => handleOpenBookingDetails(booking)}
                                className="flex items-center gap-2 px-4 py-2 bg-[#0070ba] text-white rounded-full hover:bg-[#005ea6] transition-colors text-xs font-bold"
                            >
                              <CreditCard size={14} /> Pagar Ahora
                            </button>
                           )}
                          <button 
                            onClick={() => handleOpenBookingDetails(booking)}
                            className="p-2 text-gray-400 hover:text-white transition-colors border border-white/10 rounded-full"
                          >
                             <ChevronRight size={18} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  )) : (
                    <tr>
                      <td colSpan={5} className="px-8 py-12 text-center text-gray-500">No se encontraron reservas.</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </section>
        )}

        {activeTab === 'history' && (
          <section className="bg-white dark:bg-[#111111] border border-gray-200 dark:border-white/5 rounded-3xl overflow-hidden shadow-sm dark:shadow-none">
             <div className="p-8 border-b border-gray-200 dark:border-white/5">
              <h2 className="text-xl font-medium text-gray-900 dark:text-white">Historial de Pagos</h2>
              <p className="text-sm text-gray-500 dark:text-gray-400">Consulta y descarga tus facturas de servicios pagados.</p>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="bg-gray-50 dark:bg-white/5 text-gray-500 dark:text-gray-400 text-xs uppercase tracking-widest font-medium">
                    <th className="px-8 py-4">Ref. Factura</th>
                    <th className="px-8 py-4">Fecha Emisión</th>
                    <th className="px-8 py-4">Monto Total</th>
                    <th className="px-8 py-4 text-right">Estado</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {invoices.length > 0 ? invoices.map((invoice: InvoiceDTO) => (
                    <tr key={invoice.id} className="hover:bg-gray-50 dark:hover:bg-white/5 transition-colors group">
                      <td className="px-8 py-6 font-mono text-[#d4af37]">{invoice.code}</td>
                      <td className="px-8 py-6 text-sm text-gray-600 dark:text-gray-300">{formatDate(invoice.issuedDate)}</td>
                      <td className="px-8 py-6 font-bold text-lg text-gray-900 dark:text-white">${invoice.totalAmount}</td>
                      <td className="px-8 py-6 text-right">
                        <div className="flex items-center justify-end gap-3">
                         {invoice.status === 'PAID' ? (
                           <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-green-500/10 text-green-600 dark:text-green-400 border border-green-500/20 rounded-full text-[10px] font-bold">
                              <CheckCircle2 size={12} /> PAGADO
                           </span>
                         ) : (
                           <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-yellow-500/10 text-yellow-600 dark:text-yellow-400 border border-yellow-500/20 rounded-full text-[10px] font-bold">
                              <Clock size={12} /> PENDIENTE
                           </span>
                         )}
                         <button
                            onClick={async () => {
                                try {
                                    const detailed = await getMyInvoice(invoice.id);
                                    setSelectedInvoice(detailed);
                                    setShowInvoiceModal(true);
                                } catch (e) {
                                    alert("No se pudo cargar el detalle de la factura.");
                                }
                            }}
                            className="p-2 hover:bg-gray-100 dark:hover:bg-white/5 rounded-lg border border-gray-200 dark:border-white/10 text-[#d4af37] transition-all"
                            title="Ver Factura Detallada"
                         >
                            <ChevronRight size={18} />
                         </button>
                        </div>
                      </td>
                    </tr>
                  )) : (
                    <tr>
                      <td colSpan={4} className="px-8 py-12 text-center text-gray-500">No hay facturas registradas.</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </section>
        )}

      </div>

      {/* Modal de Detalles de Reserva */}
      {showDetailsModal && selectedBooking && (
        <div 
          className="fixed inset-0 bg-black/80 backdrop-blur-md flex justify-center items-center z-[1000] p-4 animate-in fade-in duration-300"
          onClick={() => setShowDetailsModal(false)}
        >
          <div 
            className="bg-white dark:bg-[#0a0a0a] border border-gray-200 dark:border-white/10 rounded-[2rem] w-full max-w-2xl max-h-[90vh] overflow-hidden shadow-2xl relative animate-in zoom-in-95 slide-in-from-bottom-5 duration-500 flex flex-col"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header del Modal */}
            <div className="relative h-56">
              <img 
                src={selectedBooking.items[0]?.roomTypeImage || "https://images.unsplash.com/photo-1571011297249-c3b246c4f98a?auto=format&fit=crop&q=80&w=1500"} 
                alt="Habitación" 
                className="w-full h-full object-cover"
                onError={(e) => {
                  (e.target as HTMLImageElement).src = "https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?auto=format&fit=crop&q=80&w=2070";
                }}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#0a0a0a] to-transparent"></div>
              <button 
                onClick={() => setShowDetailsModal(false)}
                className="absolute top-6 right-6 w-10 h-10 bg-black/50 backdrop-blur-md rounded-full flex items-center justify-center text-white hover:bg-[#d4af37] hover:text-black transition-all"
              >
                <X size={20} />
              </button>
              <div className="absolute bottom-6 left-8">
                <div className={`inline-flex items-center px-3 py-1 rounded-full text-[10px] font-bold border mb-2 ${getStatusColor(selectedBooking.status)}`}>
                  {getStatusLabel(selectedBooking.status)}
                </div>
                <h3 className="text-2xl font-bold text-white">Reserva {selectedBooking.code}</h3>
              </div>
            </div>

            {/* Contenido */}
            <div className="p-8 space-y-8 overflow-y-auto flex-1">
              {/* Message Banner based on Status */}
              {selectedBooking.status === 'PENDING_APPROVAL' && (
                  <div className="bg-orange-500/10 border border-orange-500/20 text-orange-400 p-4 rounded-xl text-sm flex items-start gap-3">
                      <Clock className="min-w-5 h-5 mt-0.5" />
                      <div>
                          <p className="font-bold">Solicitud enviada</p>
                          <p className="opacity-80">El hotel está revisando tu solicitud. Recibirás un email cuando sea aprobada para proceder al pago.</p>
                      </div>
                  </div>
              )}
              {selectedBooking.status === 'PENDING_PAYMENT' && (
                   <div className="bg-purple-500/10 border border-purple-500/20 text-purple-400 p-4 rounded-xl text-sm flex items-start gap-3">
                      <CheckCircle2 className="min-w-5 h-5 mt-0.5" />
                      <div>
                          <p className="font-bold">¡Solicitud Aprobada!</p>
                          <p className="opacity-80">Tu reserva ha sido aprobada. Tienes 24h para completar el pago y confirmar tu estancia.</p>
                      </div>
                   </div>
              )}

              <div className="grid grid-cols-2 gap-8">
                <div className="space-y-1">
                  <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">Check-In</p>
                  <p className="text-lg font-medium text-gray-900 dark:text-white">{formatDate(selectedBooking.checkInDate)}</p>
                </div>
                <div className="space-y-1 text-right">
                  <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">Check-Out</p>
                  <p className="text-lg font-medium text-gray-900 dark:text-white">{formatDate(selectedBooking.checkOutDate)}</p>
                </div>
              </div>

              <div className="space-y-4">
                <h4 className="text-sm font-bold text-[#d4af37] uppercase tracking-widest flex items-center gap-2">
                  <Bed size={16} /> Habitaciones y Ocupantes
                </h4>
                <div className="space-y-3">
                  {selectedBooking.items.map((item, idx) => (
                    <div key={idx} className="flex justify-between items-center p-4 bg-gray-50 dark:bg-white/5 rounded-2xl border border-gray-200 dark:border-white/5">
                      <div>
                        <p className="font-semibold text-gray-900 dark:text-white">{item.roomTypeName}</p>
                        <p className="text-xs text-gray-500 dark:text-gray-400">{item.occupantName || 'Ocupante por asignar'}</p>
                      </div>
                      {item.assignedRoomNumber && (
                        <div className="px-3 py-1 bg-[#d4af37]/10 text-[#d4af37] rounded-lg text-xs font-bold border border-[#d4af37]/20">
                          HAB: {item.assignedRoomNumber}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* Invoices Section */}
              <div className="space-y-4">
                <h4 className="text-sm font-bold text-[#d4af37] uppercase tracking-widest flex items-center gap-2">
                  <FileText size={16} /> Facturas Asociadas
                </h4>
                {loadingBookingInvoices ? (
                  <div className="flex items-center justify-center py-6">
                    <div className="animate-spin rounded-full h-6 w-6 border-t-2 border-[#d4af37]"></div>
                  </div>
                ) : bookingInvoices.length === 0 ? (
                  <div className="p-4 bg-gray-50 dark:bg-white/5 rounded-2xl text-center text-gray-500 text-sm">
                    No hay facturas generadas para esta reserva.
                  </div>
                ) : (
                  <div className="space-y-3">
                    {bookingInvoices.map((invoice) => (
                      <div key={invoice.id} className="flex justify-between items-center p-4 bg-gray-50 dark:bg-white/5 rounded-2xl border border-gray-200 dark:border-white/5 hover:border-[#d4af37]/30 transition-all">
                        <div className="flex items-center gap-4">
                          <div className="w-10 h-10 bg-[#d4af37]/10 rounded-xl flex items-center justify-center">
                            <FileText size={18} className="text-[#d4af37]" />
                          </div>
                          <div>
                            <p className="font-semibold text-gray-900 dark:text-white text-sm">{invoice.code}</p>
                            <p className="text-xs text-gray-500">{formatDate(invoice.issuedDate)}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-4">
                          <div className="text-right">
                            <p className="font-bold text-[#d4af37]">${invoice.totalAmount}</p>
                            <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[9px] font-bold border ${
                              invoice.status === 'PAID' ? 'bg-green-500/10 text-green-500 border-green-500/20' :
                              invoice.status === 'CANCELLED' ? 'bg-red-500/10 text-red-500 border-red-500/20' :
                              'bg-yellow-500/10 text-yellow-500 border-yellow-500/20'
                            }`}>
                              {invoice.status === 'PAID' && <CheckCircle2 size={10} />}
                              {invoice.status}
                            </span>
                          </div>
                          <button
                            onClick={async () => {
                              try {
                                const detailed = await getMyInvoice(invoice.id);
                                setSelectedInvoice(detailed);
                                setShowInvoiceModal(true);
                              } catch (e) {
                                console.error('Error loading invoice details', e);
                              }
                            }}
                            className="p-2 hover:bg-[#d4af37]/10 rounded-lg text-[#d4af37] transition-all"
                            title="Ver Factura"
                          >
                            <Eye size={16} />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Only show Total/Payment section if approved or confirmed */}
              <div className="pt-6 border-t border-gray-100 dark:border-white/5 flex items-center justify-between">
                <div>
                  <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-1">Total</p>
                  <p className="text-3xl font-bold text-gray-900 dark:text-white">${selectedBooking.totalPrice}</p>
                </div>
                <div className="flex gap-3">
                   {/* Payment Button Logic */}
                   {selectedBooking.status === 'PENDING_PAYMENT' && selectedBooking.invoiceId && (
                     <div className="w-48">
                         <PayPalPaymentButton 
                            invoiceId={selectedBooking.invoiceId}
                            amount={selectedBooking.totalPrice}
                            onSuccess={() => {
                                alert("Pago confirmado exitosamente.");
                                setShowDetailsModal(false);
                                loadData(); // Refresh bookings
                            }}
                            onError={(msg: string) => alert(msg)}
                         />
                     </div>
                   )}
                   <button 
                    onClick={() => setShowDetailsModal(false)}
                    className="px-6 py-3 bg-gray-100 dark:bg-white/10 text-gray-900 dark:text-white font-bold rounded-full hover:bg-gray-200 dark:hover:bg-white/20 transition-all text-sm"
                   >
                     Cerrar
                   </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal de Detalles de Factura */}
      <InvoiceDetailsModal 
        isOpen={showInvoiceModal}
        onClose={() => setShowInvoiceModal(false)}
        invoice={selectedInvoice}
      />

    </div>
  );
};

export default ClientDashboardPage;
