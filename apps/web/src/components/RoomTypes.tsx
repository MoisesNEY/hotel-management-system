import React, { useState, useEffect } from 'react';
import { Bed, Users, Maximize, Check, X, Calendar, User, CreditCard, FileText, ChevronRight, ChevronLeft, Plus, Minus, Loader2 } from 'lucide-react';
import { useSingleContent } from '../hooks/useContent';
import { createBooking, getAvailability } from '../services/client/bookingService';
import { getAllRoomTypes } from '../services/admin/roomTypeService';
import type { RoomTypeAvailability, BookingItemRequest } from '../types/clientTypes';
import type { RoomTypeDTO } from '../types/adminTypes';

type RoomType = RoomTypeDTO;

export const BookingStatus = {
  PENDING: 'PENDING',
  CONFIRMED: 'CONFIRMED',
  CANCELLED: 'CANCELLED',
  COMPLETED: 'COMPLETED'
} as const;

export type BookingStatus = typeof BookingStatus[keyof typeof BookingStatus];

const RoomTypes: React.FC = () => {
  const [roomTypes, setRoomTypes] = useState<RoomTypeDTO[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);
  const [availability, setAvailability] = useState<RoomTypeAvailability[]>([]);
  const [loadingAvailability, setLoadingAvailability] = useState(false);
  
  const [formData, setFormData] = useState({
    checkInDate: '',
    checkOutDate: '',
    guestCount: 1,
    notes: ''
  });

  const [selectedItems, setSelectedItems] = useState<{roomTypeId: number, quantity: number}[]>([]);
  const [occupants, setOccupants] = useState<string[]>([]); // To match items index

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleOverlayClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      closeModal();
    }
  };

  const { data: header } = useSingleContent('HEADER_ROOMS');

  useEffect(() => {
    const fetchRoomTypes = async () => {
      try {
        setLoading(true);
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

  const handleReservation = async (room?: RoomType) => {
    const { default: keycloak } = await import('../services/keycloak');
    
    if (!keycloak.authenticated) {
        alert('Debes iniciar sesión para realizar una reserva.');
        keycloak.login();
        return;
    }

    console.log('Abriendo modal de reserva');
    setCurrentStep(1);
    setShowModal(true);
    
    setFormData({
      checkInDate: '',
      checkOutDate: '',
      guestCount: 1,
      notes: ''
    });
    setSelectedItems([]);
    setOccupants([]);
  };

  const closeModal = () => {
    setShowModal(false);
    setCurrentStep(1);
    setAvailability([]);
  };

  const nextStep = async () => {
    if (currentStep === 1) {
      if (!formData.checkInDate || !formData.checkOutDate) {
        alert('Por favor selecciona las fechas');
        return;
      }
      // Load availability
      await fetchAvailability();
    } else if (currentStep === 2) {
      if (selectedItems.reduce((acc, item) => acc + item.quantity, 0) === 0) {
        alert('Selecciona al menos una habitación');
        return;
      }
      // Prepare occupants array
      const count = selectedItems.reduce((acc, item) => acc + item.quantity, 0);
      setOccupants(new Array(count).fill(''));
    }
    setCurrentStep(prev => prev + 1);
  };

  const prevStep = () => {
    setCurrentStep(prev => prev - 1);
  };

  const fetchAvailability = async () => {
    try {
      setLoadingAvailability(true);
      const data = await getAvailability(formData.checkInDate, formData.checkOutDate);
      setAvailability(data);
    } catch (err) {
      console.error("Error fetching availability", err);
      alert("Error al consultar disponibilidad");
    } finally {
      setLoadingAvailability(false);
    }
  };

  const calculateNights = () => {
    if (!formData.checkInDate || !formData.checkOutDate) return 0;
    const checkIn = new Date(formData.checkInDate);
    const checkOut = new Date(formData.checkOutDate);
    const diffTime = checkOut.getTime() - checkIn.getTime();
    return Math.max(0, Math.ceil(diffTime / (1000 * 60 * 60 * 24)));
  };

  const calculateTotal = () => {
    const nights = calculateNights();
    return selectedItems.reduce((acc, item) => {
      const type = availability.find(a => a.id === item.roomTypeId);
      return acc + (type ? type.basePrice * nights * item.quantity : 0);
    }, 0);
  };

  const getMinCheckoutDate = () => {
    if (!formData.checkInDate) return '';
    const date = new Date(formData.checkInDate);
    date.setDate(date.getDate() + 1);
    return date.toISOString().split('T')[0];
  };

  const getTodayDate = () => {
    return new Date().toISOString().split('T')[0];
  };

  const handleItemQuantityChange = (typeId: number, delta: number) => {
    setSelectedItems(prev => {
      const existing = prev.find(i => i.roomTypeId === typeId);
      const avail = availability.find(a => a.id === typeId)?.availableQuantity || 0;
      
      if (existing) {
        const newQty = Math.max(0, Math.min(avail, existing.quantity + delta));
        if (newQty === 0) return prev.filter(i => i.roomTypeId !== typeId);
        return prev.map(i => i.roomTypeId === typeId ? { ...i, quantity: newQty } : i);
      } else if (delta > 0 && avail > 0) {
        return [...prev, { roomTypeId: typeId, quantity: 1 }];
      }
      return prev;
    });
  };

  const handleOccupantChange = (index: number, name: string) => {
    setOccupants(prev => {
      const next = [...prev];
      next[index] = name;
      return next;
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      setIsSubmitting(true);
      
      const items: BookingItemRequest[] = [];
      let occupantIdx = 0;
      
      selectedItems.forEach(item => {
        for (let i = 0; i < item.quantity; i++) {
          items.push({
            roomTypeId: item.roomTypeId,
            occupantName: occupants[occupantIdx++] || ''
          });
        }
      });

      const response = await createBooking({
        checkInDate: formData.checkInDate,
        checkOutDate: formData.checkOutDate,
        guestCount: formData.guestCount,
        notes: formData.notes,
        items
      });

      alert(`¡Reserva ${response.code} creada con éxito!`);
      closeModal();
      // Redirect to profile or show success UI would be better
    } catch (error: any) {
      console.error('Error al enviar la reserva:', error);
      const msg = error.response?.data?.detail || error.response?.data?.message || 'No se pudo completar la reserva.';
      alert(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <section className="bg-white dark:bg-[#1a1a2e] py-20" id="habitaciones">
        <div className="max-w-7xl mx-auto px-5">
          <div className="text-center mb-10">
            <h2 className="text-4xl text-gray-900 dark:text-white mb-4 relative pb-4 font-semibold after:content-[''] after:absolute after:bottom-0 after:left-1/2 after:-translate-x-1/2 after:w-20 after:h-0.5 after:bg-gradient-to-r after:from-[#d4af37] after:via-[#ffd95a] after:to-[#d4af37] after:rounded-sm">
              {header?.title || 'Tipos de Habitación'}
            </h2>
            {header?.subtitle && (
              <p className="text-gray-600 dark:text-gray-300 text-lg max-w-[600px] mx-auto leading-relaxed">
                {header.subtitle}
              </p>
            )}
          </div>
          
          {loading ? (
            <div className="flex justify-center py-20">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#d4af37]"></div>
            </div>
          ) : error ? (
             <div className="text-center py-10 text-red-500 bg-red-50 dark:bg-red-900/20 rounded-xl p-4">
               {error}
             </div>
          ) : roomTypes.length === 0 ? (
            <div className="text-center py-20 bg-gray-50 dark:bg-gray-800/50 rounded-xl">
               <Bed className="mx-auto h-12 w-12 text-gray-400 dark:text-gray-600 mb-4" />
               <h3 className="text-xl text-gray-600 dark:text-gray-400 font-medium">No hay tipos de habitación disponibles</h3>
               <p className="text-gray-500 dark:text-gray-500 mt-2">Por favor, vuelve a consultar más tarde.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mt-12">
              {roomTypes.map((room) => (
                <div key={room.id} className="group bg-white dark:bg-[#1e1e3e] rounded-xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-300 hover:-translate-y-2 border border-gray-100 dark:border-gray-700">
                  <div className="relative overflow-hidden h-64">
                    <img 
                      src={room.imageUrl || 'https://images.unsplash.com/photo-1611892440504-42a792e24d32?w=600'} 
                      alt={room.name}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                    />
                    <div className="absolute top-4 right-4 bg-green-500 text-white px-4 py-1.5 rounded text-sm font-semibold uppercase tracking-wide shadow-lg z-10">
                      Disponible
                    </div>
                  </div>
                  <div className="p-6">
                    <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-3">{room.name}</h3>
                    <p className="text-gray-600 dark:text-gray-400 mb-6 leading-relaxed">{room.description || 'Sin descripción disponible.'}</p>
                    
                    <div className="flex justify-around mb-6 pb-6 border-b border-gray-200 dark:border-gray-700">
                      <div className="flex flex-col items-center gap-2">
                        <Maximize size={18} className="text-[#2a9d8f]" />
                        <span className="text-sm text-gray-700 dark:text-gray-300 font-medium">{room.area || 0} m²</span>
                      </div>
                      <div className="flex flex-col items-center gap-2">
                        <Users size={18} className="text-[#2a9d8f]" />
                        <span className="text-sm text-gray-700 dark:text-gray-300 font-medium">{room.maxCapacity} personas</span>
                      </div>
                      <div className="flex flex-col items-center gap-2">
                        <Bed size={18} className="text-[#2a9d8f]" />
                        <span className="text-sm text-gray-700 dark:text-gray-300 font-medium">{room.beds || 1} {(!room.beds || room.beds === 1) ? 'cama' : 'camas'}</span>
                      </div>
                    </div>
                    
                    <div className="mt-6 pt-5 border-t border-gray-200 dark:border-gray-700">
                      <div className="text-center mb-5">
                        <div className="mb-2">
                          <span className="text-2xl font-bold text-gray-900 dark:text-white align-super">$</span>
                          <span className="text-4xl font-extrabold text-gray-900 dark:text-white tracking-tight">{room.basePrice}</span>
                          <span className="text-base text-gray-600 dark:text-gray-400 font-normal ml-2">/noche</span>
                        </div>
                        <div className="text-sm text-[#2a9d8f] font-medium">Impuestos incluidos</div>
                      </div>
                      
                      <button 
                        className="w-full bg-[#1a1a2e] dark:bg-gradient-to-r dark:from-[#1a1a2e] dark:to-[#2c3e50] text-white py-3.5 px-8 rounded-lg font-semibold text-base cursor-pointer transition-all duration-300 uppercase tracking-wide hover:bg-[#2c3e50] hover:-translate-y-0.5 hover:shadow-xl active:translate-y-0"
                        onClick={() => handleReservation(room)}
                        type="button"
                      >
                        RESERVAR AHORA
                      </button>
                      
                      <div className="flex justify-center gap-5 mt-4 mb-5">
                        <div className="text-center">
                          <div className="w-6 h-6 mx-auto mb-1 text-[#2a9d8f]">
                            <Check size={16} />
                          </div>
                          <div className="text-xs text-gray-600 dark:text-gray-400 font-medium">
                            Cancelación gratuita
                          </div>
                        </div>
                        <div className="text-center">
                          <div className="w-6 h-6 mx-auto mb-1 text-[#2a9d8f]">
                            <Check size={16} />
                          </div>
                          <div className="text-xs text-gray-600 dark:text-gray-400 font-medium">
                            Desayuno incluido
                          </div>
                        </div>
                      </div>
                      
                      <div className="inline-block bg-gray-100 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 px-3 py-1 rounded text-xs text-[#2a9d8f] dark:text-[#4cc9f0] font-semibold mt-2.5">
                        Calidad Garantizada
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Modal de Reserva Multi-paso */}
      {showModal && (
        <div 
          className="fixed inset-0 bg-black/80 backdrop-blur-sm flex justify-center items-center z-[9999] p-4 sm:p-6"
          onClick={handleOverlayClick}
        >
          <div 
            className="relative bg-white dark:bg-[#111111] rounded-3xl w-full max-w-4xl max-h-[90vh] overflow-hidden shadow-2xl animate-in fade-in zoom-in duration-300 flex flex-col border border-gray-100 dark:border-white/5"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="p-6 sm:p-8 flex justify-between items-center border-b border-gray-100 dark:border-white/5 bg-gray-50/50 dark:bg-white/5">
              <div>
                <h3 className="text-2xl font-bold text-gray-900 dark:text-white">Reserva tu Estancia</h3>
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Sigue los pasos para completar tu solicitud</p>
              </div>
              <button 
                className="p-2.5 rounded-2xl hover:bg-gray-200 dark:hover:bg-white/10 text-gray-400 hover:text-gray-900 dark:hover:text-white transition-all duration-200"
                onClick={closeModal}
              >
                <X size={24} />
              </button>
            </div>

            {/* Stepper */}
            <div className="px-8 pt-8 pb-4">
              <div className="flex items-center justify-between relative">
                {[1, 2, 3, 4].map((step) => (
                  <div key={step} className="flex flex-col items-center z-10 relative">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold transition-all duration-300 ${
                      currentStep === step 
                        ? 'bg-[#d4af37] text-white shadow-[0_0_15px_rgba(212,175,55,0.4)] scale-110' 
                        : currentStep > step 
                        ? 'bg-emerald-500 text-white' 
                        : 'bg-gray-100 dark:bg-white/5 text-gray-400'
                    }`}>
                      {currentStep > step ? <Check size={20} /> : step}
                    </div>
                    <span className={`text-[10px] font-bold uppercase tracking-widest mt-2 ${
                      currentStep === step ? 'text-[#d4af37]' : 'text-gray-400'
                    }`}>
                      {step === 1 ? 'Fechas' : step === 2 ? 'Habitaciones' : step === 3 ? 'Ocupantes' : 'Confirmar'}
                    </span>
                  </div>
                ))}
                {/* Progress Bar Background */}
                <div className="absolute top-5 left-0 w-full h-0.5 bg-gray-100 dark:bg-white/5 -z-0" />
                {/* Progress Bar Active */}
                <div 
                  className="absolute top-5 left-0 h-0.5 bg-[#d4af37] transition-all duration-500 -z-0" 
                  style={{ width: `${((currentStep - 1) / 3) * 100}%` }}
                />
              </div>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto p-8 custom-scrollbar">
              {currentStep === 1 && (
                <div className="space-y-8 animate-in slide-in-from-right-4 duration-300">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <label className="text-xs font-bold text-gray-400 uppercase tracking-widest ml-1">Fecha de Check-In</label>
                      <div className="relative group">
                        <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-hover:text-[#d4af37] transition-colors" size={18} />
                        <input
                          type="date"
                          name="checkInDate"
                          min={getTodayDate()}
                          value={formData.checkInDate}
                          onChange={handleInputChange}
                          className="w-full bg-white dark:bg-white/5 border border-gray-100 dark:border-white/10 rounded-2xl py-4 pl-12 pr-4 text-sm text-gray-900 dark:text-white focus:ring-2 focus:ring-[#d4af37]/20 focus:border-[#d4af37] transition-all outline-none"
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <label className="text-xs font-bold text-gray-400 uppercase tracking-widest ml-1">Fecha de Check-Out</label>
                      <div className="relative group">
                        <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-hover:text-[#d4af37] transition-colors" size={18} />
                        <input
                          type="date"
                          name="checkOutDate"
                          min={getMinCheckoutDate()}
                          disabled={!formData.checkInDate}
                          value={formData.checkOutDate}
                          onChange={handleInputChange}
                          className="w-full bg-white dark:bg-white/5 border border-gray-100 dark:border-white/10 rounded-2xl py-4 pl-12 pr-4 text-sm text-gray-900 dark:text-white focus:ring-2 focus:ring-[#d4af37]/20 focus:border-[#d4af37] transition-all outline-none disabled:opacity-50"
                        />
                      </div>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-gray-400 uppercase tracking-widest ml-1">Número de Huéspedes Totales</label>
                    <div className="relative group">
                      <Users className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-hover:text-[#d4af37] transition-colors" size={18} />
                      <input
                        type="number"
                        name="guestCount"
                        min="1"
                        value={formData.guestCount}
                        onChange={handleInputChange}
                        className="w-full bg-white dark:bg-white/5 border border-gray-100 dark:border-white/10 rounded-2xl py-4 pl-12 pr-4 text-sm text-gray-900 dark:text-white focus:ring-2 focus:ring-[#d4af37]/20 focus:border-[#d4af37] transition-all outline-none"
                      />
                    </div>
                  </div>
                </div>
              )}

              {currentStep === 2 && (
                <div className="space-y-6 animate-in slide-in-from-right-4 duration-300">
                  <h4 className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2">
                    <Bed size={20} className="text-[#d4af37]" /> Habitaciones Disponibles
                  </h4>
                  {loadingAvailability ? (
                    <div className="flex flex-col items-center justify-center py-12 gap-4">
                      <Loader2 className="animate-spin text-[#d4af37]" size={40} />
                      <p className="text-gray-400 font-medium">Consultando inventario en tiempo real...</p>
                    </div>
                  ) : availability.length === 0 ? (
                    <div className="p-8 bg-gray-50 dark:bg-white/5 rounded-3xl text-center border border-dashed border-gray-200 dark:border-white/10">
                       No hay habitaciones disponibles para estas fechas.
                    </div>
                  ) : (
                    <div className="grid gap-4">
                      {availability.map((type) => {
                        const selected = selectedItems.find(i => i.roomTypeId === type.id);
                        return (
                          <div key={type.id} className="p-5 bg-white dark:bg-white/5 border border-gray-100 dark:border-white/10 rounded-3xl flex items-center justify-between group hover:border-[#d4af37]/50 transition-all">
                            <div className="space-y-1">
                              <h5 className="font-bold text-gray-900 dark:text-white group-hover:text-[#d4af37] transition-colors">{type.name}</h5>
                              <div className="flex items-center gap-4 text-xs text-gray-500 dark:text-gray-400">
                                <span className="flex items-center gap-1"><Users size={12} /> Máx: {type.maxCapacity}</span>
                                <span className="font-bold text-[#d4af37]">${type.basePrice}/noche</span>
                                <span className={type.availableQuantity > 0 ? 'text-emerald-500' : 'text-rose-500'}>
                                  {type.availableQuantity > 0 ? `${type.availableQuantity} disponibles` : 'Sin cupo'}
                                </span>
                              </div>
                            </div>
                            <div className="flex items-center gap-4 bg-gray-50 dark:bg-white/10 p-2 rounded-2xl">
                              <button 
                                onClick={() => handleItemQuantityChange(type.id, -1)}
                                className="w-8 h-8 rounded-xl flex items-center justify-center hover:bg-white dark:hover:bg-white/10 transition-colors shadow-sm"
                              >
                                <Minus size={16} />
                              </button>
                              <span className="w-6 text-center font-bold text-gray-900 dark:text-white">
                                {selected?.quantity || 0}
                              </span>
                              <button 
                                onClick={() => handleItemQuantityChange(type.id, 1)}
                                disabled={type.availableQuantity <= (selected?.quantity || 0)}
                                className="w-8 h-8 rounded-xl flex items-center justify-center hover:bg-[#d4af37] hover:text-white transition-all shadow-sm disabled:opacity-30"
                              >
                                <Plus size={16} />
                              </button>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              )}

              {currentStep === 3 && (
                <div className="space-y-6 animate-in slide-in-from-right-4 duration-300">
                  <h4 className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2">
                    <User size={20} className="text-[#d4af37]" /> Detalles de Ocupantes
                  </h4>
                  <div className="space-y-4">
                    {occupants.map((_, idx) => (
                      <div key={idx} className="space-y-2">
                        <label className="text-xs font-bold text-gray-400 uppercase tracking-widest ml-1">Ocupante Habitación #{idx + 1}</label>
                        <input
                          type="text"
                          placeholder="Nombre completo"
                          value={occupants[idx]}
                          onChange={(e) => handleOccupantChange(idx, e.target.value)}
                          className="w-full bg-white dark:bg-white/5 border border-gray-100 dark:border-white/10 rounded-2xl py-4 px-6 text-sm text-gray-900 dark:text-white focus:ring-2 focus:ring-[#d4af37]/20 focus:border-[#d4af37] transition-all outline-none"
                        />
                      </div>
                    ))}
                  </div>
                  <div className="space-y-2 pt-4">
                    <label className="text-xs font-bold text-gray-400 uppercase tracking-widest ml-1">Notas y Solicitudes Especiales</label>
                    <textarea
                      name="notes"
                      value={formData.notes}
                      onChange={handleInputChange}
                      placeholder="Ej: Dieta especial, llegada tardía..."
                      className="w-full bg-white dark:bg-white/5 border border-gray-100 dark:border-white/10 rounded-3xl py-4 px-6 text-sm text-gray-900 dark:text-white h-32 focus:ring-2 focus:ring-[#d4af37]/20 focus:border-[#d4af37] transition-all outline-none resize-none"
                    />
                  </div>
                </div>
              )}

              {currentStep === 4 && (
                <div className="space-y-8 animate-in slide-in-from-right-4 duration-300">
                  <div className="bg-emerald-500/10 border border-emerald-500/20 p-6 rounded-3xl flex items-start gap-4">
                    <Check className="text-emerald-500 shrink-0" size={24} />
                    <div>
                      <h4 className="font-bold text-emerald-600">Revisa la información de tu reserva</h4>
                      <p className="text-sm text-emerald-600/80">Estás por finalizar tu solicitud de reserva en Gran Hotel.</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div className="space-y-6">
                      <div className="space-y-1">
                        <label className="text-xs font-bold text-gray-400 uppercase tracking-widest">Estadía</label>
                        <p className="text-gray-900 dark:text-white font-medium flex items-center gap-2">
                          {formData.checkInDate} <ChevronRight size={14} /> {formData.checkOutDate}
                        </p>
                        <p className="text-xs text-[#d4af37] font-bold">{calculateNights()} noches</p>
                      </div>
                      <div className="space-y-3">
                        <label className="text-xs font-bold text-gray-400 uppercase tracking-widest">Habitaciones Seleccionadas</label>
                        {selectedItems.map(item => {
                          const type = availability.find(a => a.id === item.roomTypeId);
                          return (
                            <div key={item.roomTypeId} className="flex justify-between items-center text-sm">
                              <span className="text-gray-600 dark:text-gray-300">{item.quantity}x {type?.name}</span>
                              <span className="font-bold text-gray-900 dark:text-white">${(type?.basePrice || 0) * calculateNights() * item.quantity}</span>
                            </div>
                          );
                        })}
                      </div>
                    </div>

                    <div className="bg-gray-50 dark:bg-white/5 p-6 rounded-3xl border border-gray-100 dark:border-white/10 h-fit">
                      <div className="space-y-2 mb-6">
                        <div className="flex justify-between text-sm text-gray-500">
                          <span>Subtotal</span>
                          <span>${calculateTotal()}</span>
                        </div>
                        <div className="flex justify-between text-sm text-gray-500">
                          <span>Impuestos (incluidos)</span>
                          <span>$0</span>
                        </div>
                      </div>
                      <div className="flex justify-between items-center pt-4 border-t border-gray-200 dark:border-white/10">
                         <span className="text-gray-900 dark:text-white font-bold">TOTAL ESTIMADO</span>
                         <span className="text-2xl font-black text-[#d4af37]">${calculateTotal()}</span>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="p-6 sm:p-8 border-t border-gray-100 dark:border-white/5 bg-gray-50/50 dark:bg-white/5 flex gap-4">
              {currentStep > 1 && (
                <button 
                  onClick={prevStep}
                  className="px-8 py-4 rounded-2xl font-bold flex items-center gap-2 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-white/10 transition-all"
                >
                  <ChevronLeft size={20} /> Atrás
                </button>
              )}
              <button 
                onClick={currentStep === 4 ? handleSubmit : nextStep}
                disabled={isSubmitting}
                className="flex-1 bg-[#111111] dark:bg-[#d4af37] text-white dark:text-[#111111] px-8 py-4 rounded-2xl font-black text-sm uppercase tracking-widest hover:scale-[1.02] active:scale-[0.98] transition-all shadow-xl shadow-[#d4af37]/10 disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 size={20} className="animate-spin" />
                    Confirmando...
                  </>
                ) : (
                  <>
                    {currentStep === 4 ? (
                      <>Confirmar Reserva <CreditCard size={20} /></>
                    ) : (
                      <>Continuar <ChevronRight size={20} /></>
                    )}
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      <style>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 8px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: transparent;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: rgba(212, 175, 55, 0.2);
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: rgba(212, 175, 55, 0.4);
        }
      `}</style>

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

export default RoomTypes;