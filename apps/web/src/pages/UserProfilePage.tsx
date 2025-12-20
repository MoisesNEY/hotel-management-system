import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  User, Calendar, Shield,
  ArrowLeft, Key, Globe, CreditCard, Package,
  Bed, Coffee, ConciergeBell,
  X, Edit, Save, ChevronDown, Camera, Loader2, Trash2
} from 'lucide-react';
import keycloak from '../services/keycloak';
import { useAuth } from '../contexts/AuthProvider';
import type { CustomerDetailsUpdateRequest, Gender, BookingResponse } from '../types/clientTypes';
import { getMyBookings } from '../services/client/bookingService';
import ServiceRequestModal from '../components/ServiceRequestModal';
import ThemeToggle from '../components/ThemeToggle';
import * as accountService from '../services/accountService';

interface UserData {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  birthDate: string;
  address: string;
  city: string;
  country: string;
  gender: string;
  licenseId: string;
  imageUrl?: string;
  preferences: {
    notifications: boolean;
    newsletter: boolean;
    language: string;
    currency: string;
  };
}

interface ServiceRequest {
  id: string;
  serviceType: string;
  requestedDate: string;
  status: 'PENDING' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED';
  notes?: string;
  price?: number;
}

const UserProfilePage: React.FC = () => {
  const navigate = useNavigate();
  const { updateUserProfile, userProfile, reloadProfile } = useAuth();

  const [activeTab, setActiveTab] = useState<'profile' | 'bookings'>('profile');
  const [isEditing, setIsEditing] = useState(false);
  const [isUploading, setIsUploading] = useState(false);

  const [hasCompletedExtraInfo, setHasCompletedExtraInfo] = useState(() => {
    return localStorage.getItem('hasCompletedExtraInfo') === 'true';
  });

  const [showBookingsModal, setShowBookingsModal] = useState(false);
  const [showServicesModal, setShowServicesModal] = useState(false);

  const [userData, setUserData] = useState<UserData>({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    birthDate: '',
    address: '',
    city: '',
    country: '',
    gender: '',
    licenseId: '',
    imageUrl: '',
    preferences: {
      notifications: true,
      newsletter: false,
      language: 'es',
      currency: 'USD'
    }
  });

  const [bookings, setBookings] = useState<BookingResponse[]>([]);
  const [loadingBookings, setLoadingBookings] = useState(false);
  const [selectedBookingForService, setSelectedBookingForService] = useState<{ id: number, roomTypeName: string } | null>(null);

  const [serviceRequests, setServiceRequests] = useState<ServiceRequest[]>([]);
  const [isLoadingServices, setIsLoadingServices] = useState(false);

  const handleCloseBookingsModal = () => setShowBookingsModal(false);
  const handleCloseServicesModal = () => setShowServicesModal(false);

  useEffect(() => {
    if (!keycloak.authenticated) {
      navigate('/');
      return;
    }
    loadUserData();
    loadBookings();
  }, [navigate, userProfile]); // Added userProfile to dependencies to react to context changes

  const loadUserData = async () => {
    try {
      // Usar perfil del contexto o cargar última versión
      // userProfile is already updated by reloadProfile, so we can use it directly
      const profile = userProfile || await keycloak.loadUserProfile();

      const baseData = {
        firstName: profile.firstName || '',
        lastName: profile.lastName || '',
        email: profile.email || '',
        imageUrl: (profile.attributes as any)?.picture?.[0] || ''
      };

      setUserData(prev => ({ ...prev, ...baseData }));

      const { getMyProfile } = await import('../services/client/customerDetailsService');
      const profileResponse = await getMyProfile();

      setUserData(prev => ({
        ...prev,
        firstName: profile.firstName || prev.firstName,
        lastName: profile.lastName || prev.lastName,
        email: profile.email || prev.email,
        imageUrl: (profile.attributes as any)?.picture?.[0] || prev.imageUrl,
        phone: profileResponse.phone || '',
        address: profileResponse.addressLine1 || '',
        city: profileResponse.city || '',
        country: profileResponse.country || '',
        licenseId: profileResponse.licenseId || '',
        birthDate: profileResponse.birthDate || '',
        gender: profileResponse.gender
          ? profileResponse.gender.charAt(0) + profileResponse.gender.slice(1).toLowerCase()
          : '',
      }));

      setHasCompletedExtraInfo(true);
      localStorage.setItem('hasCompletedExtraInfo', 'true');

    } catch (error) {
      console.warn('[UserProfile] Failed to load profile from backend', error);
      setHasCompletedExtraInfo(false);
    }
  };

  const loadBookings = async () => {
    try {
      setLoadingBookings(true);
      const response = await getMyBookings({ page: 0, size: 50, sort: 'checkInDate,desc' });
      setBookings(response.data);
    } catch (error) {
      console.error('[UserProfile] Failed to load bookings', error);
    } finally {
      setLoadingBookings(false);
    }
  };

  const loadServiceRequests = async () => {
    try {
      setIsLoadingServices(true);
      const { getMyServiceRequests } = await import('../services/client/serviceRequestService');
      const response = await getMyServiceRequests();
      const requests = response.data.map((req: any) => ({
        id: req.id,
        serviceType: req.service?.name || 'Servicio',
        requestedDate: req.requestDate,
        status: req.status,
        notes: req.details,
        price: req.service?.cost
      }));
      setServiceRequests(requests);
    } catch (error) {
      console.error('[UserProfile] Failed to load service requests', error);
    } finally {
      setIsLoadingServices(false);
    }
  };

  useEffect(() => {
    loadServiceRequests();
  }, [showServicesModal]);

  const handleEditToggle = () => setIsEditing(!isEditing);

  const handleSave = async () => {
    try {
      const { updateProfile } = await import('../services/client/customerDetailsService');

      // 1. Actualizar Datos de Keycloak (Si cambiaron)
      await accountService.updateAccount({
        firstName: userData.firstName,
        lastName: userData.lastName,
        email: userData.email,
        imageUrl: userData.imageUrl
      } as any);

      // 2. Actualizar Datos de CustomerDetails (Backend)
      let apiGender: Gender = 'OTHER';
      const g = userData.gender.toUpperCase();
      if (g === 'MALE' || g === 'MASCULINO') apiGender = 'MALE';
      else if (g === 'FEMALE' || g === 'FEMENINO') apiGender = 'FEMALE';

      const updateRequest: CustomerDetailsUpdateRequest = {
        gender: apiGender,
        phone: userData.phone,
        addressLine1: userData.address,
        city: userData.city,
        country: userData.country
      };

      await updateProfile(updateRequest);

      // 3. Sincronizar UI Global (Refrescar token y perfil)
      await reloadProfile();

      setIsEditing(false);
      alert('¡Perfil actualizado exitosamente!');
    } catch (error) {
      console.error('[UserProfile] Failed to update profile', error);
      alert('Error al actualizar el perfil.');
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setIsUploading(true);
      const url = await accountService.uploadProfilePicture(file);
      setUserData(prev => ({ ...prev, imageUrl: url }));

      // Actualización reactiva instantánea y del contexto global
      await reloadProfile(); // Force update of token and claims
      alert('Foto de perfil actualizada');

    } catch (error) {
      console.error('[UserProfile] Upload failed', error);
      alert('Error al subir la imagen');
    } finally {
      setIsUploading(false);
    }
  };

  const handleDeletePhoto = async () => {
    if (!window.confirm('¿Eliminar foto de perfil?')) return;
    try {
      await accountService.deleteProfilePicture();
      setUserData(prev => ({ ...prev, imageUrl: '' }));
      await reloadProfile(); // Force update of token and claims
    } catch (error) {
      console.error('[UserProfile] Delete photo failed', error);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    if (name.includes('.')) {
      const [parent, child] = name.split('.');
      setUserData(prev => ({
        ...prev,
        [parent]: {
          ...(prev[parent as keyof typeof prev] as any),
          [child]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value
        }
      }));
    } else {
      setUserData(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleCancel = () => {
    loadUserData();
    setIsEditing(false);
  };

  const handleChangePassword = () => {
    if (keycloak.accountManagement) keycloak.accountManagement();
  };

  const handleCompleteInfo = () => navigate('/customer');

  const formatDate = (dateString: string) => {
    if (!dateString) return 'No especificada';
    const date = new Date(dateString);
    return date.toLocaleDateString('es-ES', {
      year: 'numeric', month: 'long', day: 'numeric'
    });
  };

  const getGenderText = (gender: string) => {
    switch (gender) {
      case 'Male': return 'Masculino';
      case 'Female': return 'Femenino';
      case 'Other': return 'Otro';
      default: return 'No especificado';
    }
  };

  const formatDateTime = (dateTimeString: string) => {
    if (!dateTimeString) return 'No especificada';
    const date = new Date(dateTimeString);
    return date.toLocaleDateString('es-ES', {
      year: 'numeric', month: 'long', day: 'numeric',
      hour: '2-digit', minute: '2-digit'
    });
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'CONFIRMED': return 'Confirmada';
      case 'PENDING': return 'Pendiente';
      case 'CANCELLED': return 'Cancelada';
      case 'COMPLETED': return 'Completada';
      case 'IN_PROGRESS': return 'En Progreso';
      case 'CHECKED_IN': return 'En el Hotel';
      case 'CHECKED_OUT': return 'Completada';
      default: return status;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'CONFIRMED': return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300 dark:border dark:border-green-800';
      case 'COMPLETED': return 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300 dark:border dark:border-blue-800';
      case 'PENDING': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300 dark:border dark:border-yellow-800';
      case 'CANCELLED': return 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300 dark:border dark:border-red-800';
      case 'IN_PROGRESS': return 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300 dark:border dark:border-purple-800';
      case 'CHECKED_IN': return 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-300 dark:border dark:border-emerald-800';
      case 'CHECKED_OUT': return 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300 dark:border dark:border-gray-700';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300 dark:border dark:border-gray-700';
    }
  };

  const activeBookings = bookings.filter(b => ['PENDING', 'CONFIRMED', 'CHECKED_IN'].includes(b.status));
  const pastBookings = bookings.filter(b => ['CHECKED_OUT', 'CANCELLED', 'COMPLETED'].includes(b.status));

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-navy-dark transition-all duration-300 pb-20">
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-gold-default/5 rounded-full blur-[120px]"></div>
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-navy-light/10 dark:bg-gold-default/5 rounded-full blur-[120px]"></div>
      </div>

      {showBookingsModal && (
        <div className="fixed inset-0 bg-black/70 dark:bg-black/80 flex justify-center items-center z-[9999] p-5">
          <div className="relative bg-white dark:bg-[#1e1e3e] rounded-xl w-full max-w-4xl max-h-[85vh] overflow-y-auto shadow-2xl">
            <div className="flex justify-between items-center pb-5 mb-5 border-b border-gray-200 dark:border-gray-700 p-8">
              <h2 className="flex items-center gap-3 m-0 text-gray-900 dark:text-white text-2xl font-semibold">
                <Bed size={24} />
                Mis Reservas
              </h2>
              <button className="bg-transparent border-none cursor-pointer p-2 rounded-full transition-colors duration-200 hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-600 dark:text-gray-400" onClick={handleCloseBookingsModal}>
                <X size={24} />
              </button>
            </div>
            <div className="px-8 pb-8">
              {loadingBookings ? (
                <div className="flex flex-col items-center justify-center py-20">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gold-default mb-4"></div>
                  <p>Cargando reservas...</p>
                </div>
              ) : bookings.length === 0 ? (
                <div className="text-center py-20">
                  <Bed size={48} className="mx-auto text-gray-400 dark:text-gray-600 mb-4" />
                  <h3>No has realizado ninguna reserva</h3>
                  <p>Cuando hagas una reserva en nuestro hotel, aparecerá aquí.</p>
                  <button className="px-6 py-3 rounded-xl border-none font-semibold text-sm cursor-pointer transition-all duration-300 bg-gold-default text-navy-default hover:shadow-lg" onClick={() => navigate('/')}>
                    Explorar Habitaciones
                  </button>
                </div>
              ) : (
                <div className="flex flex-col gap-4">
                  {bookings.map(booking => (
                    <div key={booking.id} className="bg-gray-50 dark:bg-gray-800/50 rounded-xl p-5 border border-gray-200 dark:border-gray-700 transition-all duration-300 hover:shadow-lg">
                      <div className="flex justify-between items-center mb-4">
                        <h3>{booking.roomTypeName}</h3>
                        <span className={`px-3 py-1 rounded-full text-xs font-bold ${getStatusColor(booking.status)}`}>
                          {getStatusText(booking.status)}
                        </span>
                      </div>
                      <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                        <div className="flex flex-col gap-1">
                          <span className="text-xs text-gray-500 dark:text-gray-400 font-medium">Check-in:</span>
                          <span className="text-sm text-gray-900 dark:text-white">{formatDate(booking.checkInDate)}</span>
                        </div>
                        <div className="flex flex-col gap-1">
                          <span className="text-xs text-gray-500 dark:text-gray-400 font-medium">Check-out:</span>
                          <span className="text-sm text-gray-900 dark:text-white">{formatDate(booking.checkOutDate)}</span>
                        </div>
                        <div className="flex flex-col gap-1">
                          <span className="text-xs text-gray-500 dark:text-gray-400 font-medium">Total:</span>
                          <span className="text-sm text-gray-900 dark:text-white font-bold">${booking.totalPrice}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
            <div className="flex justify-end gap-4 mt-6 pt-5 border-t border-gray-200 dark:border-gray-700 px-8 pb-8">
              <button className="px-6 py-3 rounded-xl border-none font-semibold text-sm cursor-pointer transition-all duration-300 bg-gray-500 text-white hover:bg-gray-600" onClick={handleCloseBookingsModal}>
                Cerrar
              </button>
            </div>
          </div>
        </div>
      )}

      {showServicesModal && (
        <div className="fixed inset-0 bg-black/70 dark:bg-black/80 flex justify-center items-center z-[9999] p-5">
          <div className="relative bg-white dark:bg-[#1e1e3e] rounded-xl w-full max-w-4xl max-h-[85vh] overflow-y-auto shadow-2xl">
            <div className="flex justify-between items-center pb-5 mb-5 border-b border-gray-200 dark:border-gray-700 p-8">
              <h2 className="flex items-center gap-3 m-0 text-gray-900 dark:text-white text-2xl font-semibold">
                <Coffee size={24} />
                Mis Servicios
              </h2>
              <button className="bg-transparent border-none cursor-pointer p-2 rounded-full transition-colors duration-200 hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-600 dark:text-gray-400" onClick={handleCloseServicesModal}>
                <X size={24} />
              </button>
            </div>
            <div className="px-8 pb-8">
              {isLoadingServices ? (
                <div className="flex flex-col items-center justify-center py-20">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gold-default mb-4"></div>
                  <p>Cargando servicios...</p>
                </div>
              ) : serviceRequests.length === 0 ? (
                <p>No tienes servicios solicitados.</p>
              ) : (
                <div className="flex flex-col gap-4">
                  {serviceRequests.map(service => (
                    <div key={service.id} className="bg-gray-50 dark:bg-gray-800/50 rounded-xl p-5 border border-gray-200 dark:border-gray-700">
                      <div className="flex justify-between items-center mb-4">
                        <h3>{service.serviceType}</h3>
                        <span className={`px-3 py-1 rounded-full text-xs font-bold ${getStatusColor(service.status)}`}>
                          {getStatusText(service.status)}
                        </span>
                      </div>
                      <p className="text-sm opacity-60">{formatDateTime(service.requestedDate)}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Main Content Area */}
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-24">
        <div className="bg-white/80 dark:bg-navy-default/80 backdrop-blur-xl border border-gray-100 dark:border-white/10 rounded-3xl p-8 mb-8 shadow-xl transition-all duration-300">
          <button
            className="group flex items-center gap-2 text-gray-500 dark:text-gray-400 text-sm font-medium transition-all duration-300 hover:text-gold-default mb-8"
            onClick={() => navigate('/')}
          >
            <div className="p-2 rounded-full bg-gray-100 dark:bg-white/5 group-hover:bg-gold-default/10 transition-colors">
              <ArrowLeft size={18} />
            </div>
            Volver al inicio
          </button>

          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mt-5">
            <div className="flex items-center gap-6">
              <div className="relative group">
                {userData.imageUrl ? (
                  <div className="w-24 h-24 rounded-3xl overflow-hidden shadow-lg transform -rotate-3 group-hover:rotate-0 transition-transform duration-300 ring-4 ring-gold-default/20">
                    <img src={userData.imageUrl} alt="Profile" className="w-full h-full object-cover" />
                  </div>
                ) : (
                  <div className="w-24 h-24 rounded-3xl bg-gradient-to-br from-gold-default to-gold-dark flex items-center justify-center text-navy-default shadow-lg transform -rotate-3 group-hover:rotate-0 transition-transform duration-300">
                    <span className="text-3xl font-bold">
                      {userData.firstName.charAt(0)}{userData.lastName.charAt(0)}
                    </span>
                  </div>
                )}

                {isEditing && (
                  <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/40 rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity">
                    <label className="cursor-pointer p-2 bg-white/20 hover:bg-white/40 rounded-full text-white transition-colors">
                      {isUploading ? <Loader2 size={24} className="animate-spin" /> : <Camera size={24} />}
                      <input type="file" className="hidden" onChange={handleFileUpload} accept="image/*" />
                    </label>
                    {userData.imageUrl && !isUploading && (
                      <button onClick={handleDeletePhoto} className="mt-2 text-white hover:text-red-400 transition-colors">
                        <Trash2 size={16} />
                      </button>
                    )}
                  </div>
                )}

                {!hasCompletedExtraInfo && (
                  <div className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 border-4 border-white dark:border-navy-default rounded-full animate-pulse shadow-lg z-10"></div>
                )}
              </div>

              <div className="flex flex-col">
                <h1 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-white mb-1">
                  {userData.firstName} {userData.lastName}
                </h1>
                <div className="flex items-center gap-3">
                  <span className="text-gray-500 dark:text-gray-400 text-sm flex items-center gap-1.5">
                    <Calendar size={14} className="text-gold-default" />
                    Miembro desde {formatDate(userData.birthDate).split(' ').slice(-1)}
                  </span>
                  <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider border ${hasCompletedExtraInfo ? 'bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 border-emerald-100' : 'bg-amber-50 dark:bg-amber-900/20 text-amber-600 border-amber-100'}`}>
                    {hasCompletedExtraInfo ? 'Verificado' : 'Pendiente'}
                  </span>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <ThemeToggle variant="button" />
              {activeTab === 'profile' && !isEditing && (
                <button className="px-6 py-3 rounded-xl border-none font-semibold text-sm cursor-pointer flex items-center gap-2 transition-all duration-300 bg-gradient-to-br from-blue-500 to-blue-700 text-white hover:shadow-lg" onClick={handleEditToggle}>
                  <Edit size={18} /> Editar Perfil
                </button>
              )}
              {activeTab === 'profile' && isEditing && (
                <div className="flex gap-3">
                  <button className="px-6 py-3 rounded-xl border-none font-semibold text-sm cursor-pointer flex items-center gap-2 transition-all duration-300 bg-emerald-500 text-white hover:shadow-lg" onClick={handleSave}>
                    <Save size={18} /> Guardar
                  </button>
                  <button className="px-6 py-3 rounded-xl border-none font-semibold text-sm cursor-pointer flex items-center gap-2 transition-all duration-300 bg-red-500 text-white hover:shadow-lg" onClick={handleCancel}>
                    <X size={18} /> Cancelar
                  </button>
                </div>
              )}
            </div>
          </div>

          <div className="flex gap-2 mt-10 p-1.5 bg-gray-100/50 dark:bg-white/5 backdrop-blur-md rounded-2xl w-fit">
            <button
              className={`px-8 py-3 rounded-xl text-sm font-semibold transition-all duration-300 ${activeTab === 'profile' ? 'bg-white dark:bg-navy-default text-gold-default shadow-md' : 'text-gray-500 hover:text-white'}`}
              onClick={() => setActiveTab('profile')}
            >
              <div className="flex items-center gap-2"><User size={16} />Mi Perfil</div>
            </button>
            <button
              className={`px-8 py-3 rounded-xl text-sm font-semibold transition-all duration-300 ${activeTab === 'bookings' ? 'bg-white dark:bg-navy-default text-gold-default shadow-md' : 'text-gray-500 hover:text-white'}`}
              onClick={() => setActiveTab('bookings')}
            >
              <div className="flex items-center gap-2"><Bed size={16} />Mis Reservas</div>
            </button>
          </div>
        </div>

        {activeTab === 'profile' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2">
              <div className="bg-white/80 dark:bg-navy-default/85 backdrop-blur-xl border border-gray-100 dark:border-white/10 rounded-[2.5rem] p-8 shadow-xl">
                <div className="flex items-center justify-between mb-8 pb-4 border-b dark:border-white/5">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-gold-default/10 text-gold-default"><User size={20} /></div>
                    <h2 className="text-xl font-bold dark:text-white">Información Personal</h2>
                  </div>
                  {!hasCompletedExtraInfo && (
                    <button onClick={handleCompleteInfo} className="px-3 py-1 rounded-full bg-amber-50 text-amber-600 text-[10px] font-bold uppercase tracking-wider border border-amber-200">
                      ⚠️ Requerido
                    </button>
                  )}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold uppercase tracking-wider text-gray-400 ml-1">Nombre</label>
                    {isEditing ? (
                      <input name="firstName" value={userData.firstName} onChange={handleInputChange} className="w-full p-4 rounded-xl bg-white dark:bg-white/10 border-2 border-gold-default/30 text-gray-900 dark:text-white" />
                    ) : (
                      <div className="p-4 rounded-xl bg-gray-50 dark:bg-white/5 text-gray-900 dark:text-white font-medium">
                        {userData.firstName || 'No especificado'}
                      </div>
                    )}
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold uppercase tracking-wider text-gray-400 ml-1">Apellido</label>
                    {isEditing ? (
                      <input name="lastName" value={userData.lastName} onChange={handleInputChange} className="w-full p-4 rounded-xl bg-white dark:bg-white/10 border-2 border-gold-default/30 text-gray-900 dark:text-white" />
                    ) : (
                      <div className="p-4 rounded-xl bg-gray-50 dark:bg-white/5 text-gray-900 dark:text-white font-medium">
                        {userData.lastName || 'No especificado'}
                      </div>
                    )}
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold uppercase tracking-wider text-gray-400 ml-1">Email</label>
                    <div className="p-4 rounded-xl bg-gray-50 dark:bg-white/5 flex items-center justify-between">
                      <span className="text-gray-900 dark:text-white font-medium">{userData.email}</span>
                      <div className="px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-500 text-[10px] font-bold flex items-center gap-1">
                        <Shield size={10} /> Verificado
                      </div>
                    </div>
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold uppercase tracking-wider text-gray-400 ml-1">Teléfono</label>
                    {isEditing ? (
                      <input name="phone" value={userData.phone} onChange={handleInputChange} className="w-full p-4 rounded-xl bg-white dark:bg-white/10 border-2 border-gold-default/30 text-gray-900 dark:text-white" />
                    ) : (
                      <div className={`p-4 rounded-xl font-medium ${!userData.phone ? 'bg-amber-50 text-amber-600 italic' : 'bg-gray-50 dark:bg-white/5 text-gray-900 dark:text-white'}`}>
                        {userData.phone || 'Pendiente por completar'}
                      </div>
                    )}
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold uppercase tracking-wider text-gray-400 ml-1">Género</label>
                    {isEditing ? (
                      <div className="relative group">
                        <select
                          name="gender"
                          value={userData.gender}
                          onChange={handleInputChange}
                          className="w-full p-4 rounded-xl bg-white dark:bg-[#1a1a2e] border-2 border-gold-default/30 text-gray-900 dark:text-white appearance-none outline-none focus:border-gold-default transition-all cursor-pointer"
                        >
                          <option value="Male" className="bg-white dark:bg-[#1a1a2e] text-gray-900 dark:text-white">Masculino</option>
                          <option value="Female" className="bg-white dark:bg-[#1a1a2e] text-gray-900 dark:text-white">Femenino</option>
                          <option value="Other" className="bg-white dark:bg-[#1a1a2e] text-gray-900 dark:text-white">Otro</option>
                        </select>
                        <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-gold-default group-hover:scale-110 transition-transform">
                          <ChevronDown size={18} />
                        </div>
                      </div>
                    ) : (
                      <div className="p-4 rounded-xl bg-gray-50 dark:bg-white/5 text-gray-900 dark:text-white font-medium">
                        {getGenderText(userData.gender)}
                      </div>
                    )}
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold uppercase tracking-wider text-gray-400 ml-1">Fecha de Nacimiento</label>
                    <div className="p-4 rounded-xl bg-gray-50 dark:bg-white/5 text-gray-900 dark:text-white font-medium opacity-60">
                      {formatDate(userData.birthDate)}
                    </div>
                  </div>

                  <div className="space-y-1.5 md:col-span-2">
                    <label className="text-xs font-bold uppercase tracking-wider text-gray-400 ml-1">Dirección</label>
                    {isEditing ? (
                      <input name="address" value={userData.address} onChange={handleInputChange} className="w-full p-4 rounded-xl bg-white dark:bg-white/10 border-2 border-gold-default/30 text-gray-900 dark:text-white focus:border-gold-default outline-none transition-all" placeholder="Ej: Calle Principal #123" />
                    ) : (
                      <div className={`p-4 rounded-xl font-medium ${!userData.address ? 'bg-amber-50 text-amber-600 italic' : 'bg-gray-50 dark:bg-white/5 text-gray-900 dark:text-white'}`}>
                        {userData.address || 'No especificada'}
                      </div>
                    )}
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-bold uppercase tracking-wider text-gray-400 ml-1">Ciudad</label>
                    {isEditing ? (
                      <input name="city" value={userData.city} onChange={handleInputChange} className="w-full p-4 rounded-xl bg-white dark:bg-white/10 border-2 border-gold-default/30 text-gray-900 dark:text-white focus:border-gold-default outline-none transition-all" />
                    ) : (
                      <div className={`p-4 rounded-xl font-medium ${!userData.city ? 'bg-amber-50 text-amber-600 italic' : 'bg-gray-50 dark:bg-white/5 text-gray-900 dark:text-white'}`}>
                        {userData.city || 'No especificada'}
                      </div>
                    )}
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-bold uppercase tracking-wider text-gray-400 ml-1">País</label>
                    {isEditing ? (
                      <input name="country" value={userData.country} onChange={handleInputChange} className="w-full p-4 rounded-xl bg-white dark:bg-white/10 border-2 border-gold-default/30 text-gray-900 dark:text-white focus:border-gold-default outline-none transition-all" />
                    ) : (
                      <div className={`p-4 rounded-xl font-medium ${!userData.country ? 'bg-amber-50 text-amber-600 italic' : 'bg-gray-50 dark:bg-white/5 text-gray-900 dark:text-white'}`}>
                        {userData.country || 'No especificada'}
                      </div>
                    )}
                  </div>

                  <div className="space-y-1.5 md:col-span-2">
                    <label className="text-xs font-bold uppercase tracking-wider text-gray-400 ml-1">DNI / Cédula / Pasaporte</label>
                    <div className="p-4 rounded-xl bg-gray-50 dark:bg-white/5 text-gray-900 dark:text-white font-medium opacity-60">
                      {userData.licenseId || 'No especificado'}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="space-y-8">
              <div className="bg-white/80 dark:bg-navy-default/85 backdrop-blur-xl border border-gray-100 dark:border-white/10 rounded-[2.5rem] p-8 shadow-xl">
                <div className="flex items-center gap-3 mb-8 pb-4 border-b dark:border-white/5">
                  <div className="p-2 rounded-lg bg-gold-default/10 text-gold-default"><Globe size={20} /></div>
                  <h2 className="text-xl font-bold dark:text-white">Preferencias</h2>
                </div>
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-4 rounded-2xl bg-gray-50 dark:bg-white/5">
                    <div className="flex items-center gap-3">
                      <div className="p-2 rounded-lg bg-gray-100 dark:bg-white/10 text-gray-400"><Package size={18} /></div>
                      <div>
                        <p className="text-sm font-bold dark:text-white">Idioma</p>
                        <p className="text-[10px] text-gray-500 uppercase">Español</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-white/80 dark:bg-navy-default/85 backdrop-blur-xl border border-gray-100 dark:border-white/10 rounded-[2.5rem] p-8 shadow-xl">
                <div className="flex items-center gap-3 mb-8 pb-4 border-b dark:border-white/5">
                  <div className="p-2 rounded-lg bg-red-500/10 text-red-500"><Shield size={20} /></div>
                  <h2 className="text-xl font-bold dark:text-white">Seguridad</h2>
                </div>
                <button onClick={handleChangePassword} className="w-full flex items-center justify-between p-4 rounded-2xl bg-gray-50 dark:bg-white/5 hover:bg-gold-default/5 transition-all text-left">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-white dark:bg-white/5 text-gray-400"><Key size={18} /></div>
                    <div>
                      <p className="text-sm font-bold dark:text-white">Contraseña</p>
                      <p className="text-[10px] text-gray-500">Cambiar clave actual</p>
                    </div>
                  </div>
                  <ArrowLeft size={16} className="rotate-180 text-gray-300" />
                </button>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'bookings' && (
          <div className="space-y-12 animate-[fadeIn_0.5s_ease-out]">
            {loadingBookings ? (
              <div className="flex flex-col items-center justify-center py-32 bg-white/50 dark:bg-navy-default/50 rounded-[2.5rem] border border-white/10">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gold-default mb-4"></div>
                <p>Sincronizando tus estancias...</p>
              </div>
            ) : bookings.length === 0 ? (
              <div className="text-center py-32 bg-white/50 dark:bg-navy-default/50 rounded-[2.5rem] border border-white/10">
                <Calendar className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                <h3 className="text-2xl font-bold dark:text-white">No tienes reservas aún</h3>
                <button onClick={() => navigate('/')} className="mt-6 px-10 py-4 bg-gold-default text-navy-default font-bold rounded-2xl shadow-lg hover:shadow-gold-default/20 transition-all">Explorar Habitaciones</button>
              </div>
            ) : (
              <div className="space-y-12">
                {activeBookings.length > 0 && (
                  <section>
                    <div className="flex items-center gap-3 mb-8 ml-4">
                      <div className="w-2 h-2 rounded-full bg-gold-default animate-pulse"></div>
                      <h3 className="text-xl font-bold dark:text-white">Reservas Activas</h3>
                      <span className="px-2 py-0.5 rounded-full bg-gold-default/10 text-gold-default text-[10px] font-black">{activeBookings.length}</span>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                      {activeBookings.map(booking => (
                        <div key={booking.id} className="relative bg-white/80 dark:bg-navy-default/80 backdrop-blur-xl rounded-[2rem] p-6 shadow-xl border border-white/10 overflow-hidden">
                          <div className="absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r from-gold-default to-gold-dark"></div>
                          <div className="flex justify-between items-start mb-6">
                            <h4 className="font-bold dark:text-white">{booking.roomTypeName}</h4>
                            <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${getStatusColor(booking.status)}`}>{getStatusText(booking.status)}</span>
                          </div>
                          <div className="space-y-4 mb-8 text-xs dark:text-gray-300">
                            <div className="flex items-center gap-2"><Calendar size={14} />{formatDate(booking.checkInDate)}</div>
                            <div className="flex items-center gap-2 text-lg font-bold text-gold-default"><CreditCard size={16} />${booking.totalPrice}</div>
                          </div>
                          <button onClick={() => setSelectedBookingForService({ id: booking.id, roomTypeName: booking.roomTypeName })} className="w-full py-3 bg-navy-default dark:bg-white text-white dark:text-navy-default rounded-xl font-bold text-xs uppercase hover:opacity-90 transition-all flex items-center justify-center gap-2">
                            <ConciergeBell size={14} /> Servicios
                          </button>
                        </div>
                      ))}
                    </div>
                  </section>
                )}
                {pastBookings.length > 0 && (
                  <section>
                    <div className="flex items-center gap-3 mb-8 ml-4 opacity-50">
                      <h3 className="text-xl font-bold dark:text-white">Historial de Estadías</h3>
                      <div className="h-px flex-1 bg-gradient-to-r from-gray-200 to-transparent"></div>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 opacity-80">
                      {pastBookings.map(booking => (
                        <div key={booking.id} className="bg-white/40 dark:bg-white/5 backdrop-blur-sm border border-white/5 rounded-3xl p-6">
                          <div className="flex justify-between items-center mb-4">
                            <h4 className="text-sm font-bold dark:text-gray-200">{booking.roomTypeName}</h4>
                            <span className="text-[10px] font-mono text-gray-400">#{booking.id}</span>
                          </div>
                          <div className="flex items-center gap-2 text-xs text-gray-500">
                            <Calendar size={14} />
                            <span>{formatDate(booking.checkInDate)}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </section>
                )}
              </div>
            )}
          </div>
        )}
      </div>

      {selectedBookingForService && (
        <ServiceRequestModal
          bookingId={selectedBookingForService.id}
          roomTypeName={selectedBookingForService.roomTypeName}
          onClose={() => setSelectedBookingForService(null)}
          onSuccess={() => alert('Solicitud enviada con éxito')}
        />
      )}
    </div>
  );
};

export default UserProfilePage;
