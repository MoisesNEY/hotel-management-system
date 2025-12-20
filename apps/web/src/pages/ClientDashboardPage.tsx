import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Calendar, CreditCard, PieChart, Star, Coffee, ChevronRight, CheckCircle2, Clock, X, Bed } from 'lucide-react';
import { useAuth } from '../contexts/AuthProvider';
import { getMyBookings } from '../services/client/bookingService';
import { getMyInvoices } from '../services/client/invoiceService';
import { initPayment } from '../services/client/paymentService';
import type { BookingResponse, BookingItemResponse } from '../types/clientTypes';
import type { InvoiceDTO } from '../types/adminTypes';
import RoomTypes from '../components/RoomTypes';
import { Loader2 } from 'lucide-react';

const ClientDashboardPage: React.FC = () => {
  const { userProfile: user } = useAuth();
  const navigate = useNavigate();
  const [bookings, setBookings] = useState<BookingResponse[]>([]);
  const [invoices, setInvoices] = useState<InvoiceDTO[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'overview' | 'bookings' | 'history'>('overview');
  const [selectedBooking, setSelectedBooking] = useState<BookingResponse | null>(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [isProcessingPayment, setIsProcessingPayment] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
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
    fetchData();
  }, []);

  // Find current or next stay
  const currentStay = bookings.find(b => b.status === 'CHECKED_IN' || b.status === 'CONFIRMED');

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'CONFIRMED': return 'bg-green-500/20 text-green-400 border-green-500/50';
      case 'CHECKED_IN': return 'bg-blue-500/20 text-blue-400 border-blue-500/50';
      case 'PENDING': return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/50';
      case 'CANCELLED': return 'bg-red-500/20 text-red-400 border-red-500/50';
      default: return 'bg-gray-500/20 text-gray-400 border-gray-500/50';
    }
  };

  const handlePayment = async (invoiceId: number) => {
    try {
      setIsProcessingPayment(true);
      const payment = await initPayment({ invoiceId });
      
      if (payment.paypalOrderId) {
        // Redirigir a PayPal usando el approval link o una redirección configurada
        // Para este MVP, si hay un link de aprobación en el objeto (que suele venir de PayPal), lo usamos
        // Si no, mostramos un mensaje de éxito simulando que se abrió.
        window.open(`https://www.sandbox.paypal.com/checkoutnow?token=${payment.paypalOrderId}`, '_blank');
      } else {
        alert('Pago iniciado correctamente. Redirigiendo...');
      }
    } catch (error) {
      console.error('Error initiating payment:', error);
      alert('Hubo un error al procesar el pago. Por favor intentalo de nuevo.');
    } finally {
      setIsProcessingPayment(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#d4af37]"></div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      
      {/* Welcome Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-12 gap-6">
        <div>
          <h1 className="text-4xl font-light mb-2">
            Bienvenido, <span className="font-semibold text-[#d4af37]">{user?.firstName || user?.username}</span>
          </h1>
          <p className="text-gray-400">Gestiona tu estancia y descubre servicios exclusivos.</p>
        </div>
        <div className="flex gap-4">
          <a
            href="#rooms-section"
            className="px-6 py-3 bg-[#d4af37] text-black font-semibold rounded-full hover:bg-[#b8962d] transition-all duration-300 flex items-center gap-2"
          >
            <Calendar size={18} /> Ver Disponibilidad
          </a>
        </div>
      </div>

      {/* Dashboard Navigation */}
      <div className="flex border-b border-white/10 mb-8 overflow-x-auto whitespace-nowrap scrollbar-hide">
        <button 
          onClick={() => setActiveTab('overview')}
          className={`px-8 py-4 transition-all duration-300 font-medium relative ${activeTab === 'overview' ? 'text-[#d4af37]' : 'text-gray-500 hover:text-white'}`}
        >
          Resumen
          {activeTab === 'overview' && <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#d4af37]"></div>}
        </button>
        <button 
          onClick={() => setActiveTab('bookings')}
          className={`px-8 py-4 transition-all duration-300 font-medium relative ${activeTab === 'bookings' ? 'text-[#d4af37]' : 'text-gray-500 hover:text-white'}`}
        >
          Mis Reservas
          {activeTab === 'bookings' && <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#d4af37]"></div>}
        </button>
        <button 
          onClick={() => setActiveTab('history')}
          className={`px-8 py-4 transition-all duration-300 font-medium relative ${activeTab === 'history' ? 'text-[#d4af37]' : 'text-gray-500 hover:text-white'}`}
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
              <h2 className="text-xl font-medium mb-6 flex items-center gap-2">
                <Star className="text-[#d4af37]" /> Estancia Próxima
              </h2>
              
              {currentStay ? (
                <div className="relative overflow-hidden rounded-3xl group">
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
                            <p className="font-medium">{currentStay.checkInDate} — {currentStay.checkOutDate}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-3">
                          <Clock className="text-[#d4af37]" />
                          <div>
                            <p className="text-xs text-gray-400 uppercase tracking-wider">Código</p>
                            <p className="font-medium">{currentStay.code}</p>
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
                          onClick={() => { setSelectedBooking(currentStay); setShowDetailsModal(true); }}
                          className="px-8 py-3 bg-white/10 backdrop-blur-md border border-white/20 text-white font-semibold rounded-full hover:bg-white/20 transition-colors"
                        >
                          Detalles de la Reserva
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="bg-[#111111] border border-white/5 rounded-3xl p-12 text-center">
                  <div className="w-20 h-20 bg-white/5 rounded-full flex items-center justify-center mx-auto mb-6">
                    <Calendar size={32} className="text-gray-600" />
                  </div>
                  <h3 className="text-2xl font-light mb-2">No tienes estancias activas</h3>
                  <p className="text-gray-500 mb-8 max-w-md mx-auto">Reserva tu próxima experiencia de lujo en Gran Hotel León.</p>
                  <a
                    href="#rooms-section"
                    className="px-8 py-3 border border-[#d4af37] text-[#d4af37] font-semibold rounded-full hover:bg-[#d4af37] hover:text-black transition-all duration-300"
                  >
                    Explorar Habitaciones
                  </a>
                </div>
              )}
            </section>

            {/* Summary Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-4">
              <div className="bg-[#111111] border border-white/5 p-8 rounded-3xl hover:border-[#d4af37]/30 transition-colors md:col-span-1">
                <div className="flex items-center gap-4 mb-4 text-gray-400">
                  <PieChart size={24} />
                  <span className="font-medium">Total de Estancias</span>
                </div>
                <div className="text-4xl font-semibold">{bookings.length}</div>
              </div>
              <div className="md:col-span-2 invisible md:block"></div>
            </div>

            {/* Section C: Reservar Nueva Estancia */}
            <section id="rooms-section" className="pt-12">
               <div className="mb-8">
                  <h2 className="text-3xl font-light mb-2">Reserva tu <span className="text-[#d4af37] font-semibold">Próxima Diferencia</span></h2>
                  <p className="text-gray-400">Selecciona el tipo de habitación que mejor se adapte a tus necesidades.</p>
               </div>
               <div className="bg-white/5 rounded-3xl overflow-hidden border border-white/5">
                  <RoomTypes />
               </div>
            </section>
          </>
        )}

        {activeTab === 'bookings' && (
          <section className="bg-[#111111] border border-white/5 rounded-3xl overflow-hidden">
            <div className="p-8 border-b border-white/5">
              <h2 className="text-xl font-medium">Gestión de Reservas</h2>
              <p className="text-sm text-gray-400">Consulta el estado y gestiona los pagos de tus reservas.</p>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="bg-white/5 text-gray-400 text-xs uppercase tracking-widest font-medium">
                    <th className="px-8 py-4">Código</th>
                    <th className="px-8 py-4">Fechas</th>
                    <th className="px-8 py-4">Categorías</th>
                    <th className="px-8 py-4">Estado</th>
                    <th className="px-8 py-4 text-right">Acciones</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {bookings.length > 0 ? bookings.map((booking: BookingResponse) => (
                    <tr key={booking.id} className="hover:bg-white/5 transition-colors group">
                      <td className="px-8 py-6 font-mono text-[#d4af37]">{booking.code}</td>
                      <td className="px-8 py-6">
                          <span className="block text-sm font-medium">{booking.checkInDate}</span>
                          <span className="block text-xs text-gray-500">al {booking.checkOutDate}</span>
                      </td>
                      <td className="px-8 py-6">
                        <div className="flex flex-wrap gap-1">
                          {booking.items.map((item: BookingItemResponse, idx: number) => (
                            <span key={idx} className="px-2 py-0.5 bg-white/5 rounded text-[10px] text-gray-300">
                              {item.roomTypeName}
                            </span>
                          ))}
                        </div>
                      </td>
                      <td className="px-8 py-6">
                        <span className={`px-3 py-1 rounded-full text-[10px] font-bold border ${getStatusColor(booking.status)}`}>
                          {booking.status}
                        </span>
                      </td>
                      <td className="px-8 py-6 text-right">
                        <div className="flex justify-end gap-3">
                           {/* Botón de PayPal si hay saldo pendiente */}
                           {booking.status === 'PENDING' && (
                            <button className="flex items-center gap-2 px-4 py-2 bg-[#0070ba] text-white rounded-full hover:bg-[#005ea6] transition-colors text-xs font-bold">
                              <CreditCard size={14} /> Pagar con PayPal
                            </button>
                           )}
                          <button 
                            onClick={() => { setSelectedBooking(booking); setShowDetailsModal(true); }}
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
          <section className="bg-[#111111] border border-white/5 rounded-3xl overflow-hidden">
             <div className="p-8 border-b border-white/5">
              <h2 className="text-xl font-medium">Historial de Pagos</h2>
              <p className="text-sm text-gray-400">Consulta y descarga tus facturas de servicios pagados.</p>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="bg-white/5 text-gray-400 text-xs uppercase tracking-widest font-medium">
                    <th className="px-8 py-4">Ref. Factura</th>
                    <th className="px-8 py-4">Fecha Emisión</th>
                    <th className="px-8 py-4">Monto Total</th>
                    <th className="px-8 py-4 text-right">Estado</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {invoices.length > 0 ? invoices.map((invoice: InvoiceDTO) => (
                    <tr key={invoice.id} className="hover:bg-white/5 transition-colors group">
                      <td className="px-8 py-6 font-mono text-[#d4af37]">{invoice.code}</td>
                      <td className="px-8 py-6 text-sm text-gray-300">{new Date(invoice.issueDate).toLocaleDateString()}</td>
                      <td className="px-8 py-6 font-bold text-lg">${invoice.totalAmount}</td>
                      <td className="px-8 py-6 text-right">
                         {invoice.status === 'PAID' ? (
                           <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-green-500/10 text-green-400 border border-green-500/20 rounded-full text-[10px] font-bold">
                              <CheckCircle2 size={12} /> PAGADO
                           </span>
                         ) : (
                          <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-yellow-500/10 text-yellow-400 border border-yellow-500/20 rounded-full text-[10px] font-bold">
                              <Clock size={12} /> PENDIENTE
                           </span>
                         )}
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
            className="bg-[#0a0a0a] border border-white/10 rounded-[2rem] w-full max-w-2xl overflow-hidden shadow-2xl relative animate-in zoom-in-95 slide-in-from-bottom-5 duration-500"
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
                  {selectedBooking.status}
                </div>
                <h3 className="text-2xl font-bold text-white">Reserva {selectedBooking.code}</h3>
              </div>
            </div>

            {/* Contenido */}
            <div className="p-8 space-y-8">
              <div className="grid grid-cols-2 gap-8">
                <div className="space-y-1">
                  <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">Check-In</p>
                  <p className="text-lg font-medium text-white">{selectedBooking.checkInDate}</p>
                </div>
                <div className="space-y-1 text-right">
                  <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">Check-Out</p>
                  <p className="text-lg font-medium text-white">{selectedBooking.checkOutDate}</p>
                </div>
              </div>

              <div className="space-y-4">
                <h4 className="text-sm font-bold text-[#d4af37] uppercase tracking-widest flex items-center gap-2">
                  <Bed size={16} /> Habitaciones y Ocupantes
                </h4>
                <div className="space-y-3">
                  {selectedBooking.items.map((item, idx) => (
                    <div key={idx} className="flex justify-between items-center p-4 bg-white/5 rounded-2xl border border-white/5">
                      <div>
                        <p className="font-semibold text-white">{item.roomTypeName}</p>
                        <p className="text-xs text-gray-400">{item.occupantName || 'Ocupante por asignar'}</p>
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

              <div className="pt-6 border-t border-white/5 flex items-center justify-between">
                <div>
                  <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-1">Total Pagado / Pendiente</p>
                  <p className="text-3xl font-bold text-white">${selectedBooking.totalPrice}</p>
                </div>
                <div className="flex gap-3">
                   {(selectedBooking.status === 'PENDING' || selectedBooking.status === 'CONFIRMED') && selectedBooking.invoiceId && (selectedBooking.invoiceStatus === 'PENDING' || selectedBooking.invoiceStatus === 'ISSUED') && (
                     <button 
                      onClick={() => handlePayment(selectedBooking.invoiceId!)}
                      disabled={isProcessingPayment}
                      className="px-6 py-3 bg-[#0070ba] text-white font-bold rounded-full hover:bg-[#005ea6] transition-all flex items-center gap-2 text-sm disabled:opacity-50"
                     >
                       {isProcessingPayment ? <Loader2 size={18} className="animate-spin" /> : <CreditCard size={18} />}
                       {isProcessingPayment ? 'Procesando...' : 'Pagar ahora'}
                     </button>
                   )}
                   <button 
                    onClick={() => setShowDetailsModal(false)}
                    className="px-6 py-3 bg-white/10 text-white font-bold rounded-full hover:bg-white/20 transition-all text-sm"
                   >
                     Cerrar
                   </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

export default ClientDashboardPage;
