import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  User, Mail, Phone, Calendar, Edit,
  Save, X, Lock, Shield,
  ArrowLeft, Key,  Info,
  IdCard, Globe, Home, AlertCircle, CreditCard, Package,
  Clock, CheckCircle, XCircle
} from 'lucide-react';
import keycloak from '../services/keycloak';
import type { CustomerDetailsUpdateRequest, Gender, BookingResponse } from '../types/clientTypes';
import '../styles/user-profile.css';
import { getMyBookings } from '../services/client/bookingService';
import ServiceRequestModal from '../components/ServiceRequestModal';
import { ConciergeBell } from 'lucide-react';

// Interfaces para los datos
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
  preferences: {
    notifications: boolean;
    newsletter: boolean;
    language: string;
    currency: string;
  };
}

const UserProfilePage: React.FC = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<'profile' | 'bookings'>('profile');
  const [isEditing, setIsEditing] = useState(false);
  const [hasCompletedExtraInfo, setHasCompletedExtraInfo] = useState(() => {
    return localStorage.getItem('hasCompletedExtraInfo') === 'true';
  });
  // Estados para los datos
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

  useEffect(() => {
    // Verificar autenticación
    if (!keycloak.authenticated) {
      navigate('/');
      return;
    }

    // Cargar datos del usuario
    loadUserData();

    // Cargar reservas
    loadBookings();
  }, [navigate]);

  const loadUserData = async () => {
    try {
      if (!keycloak.tokenParsed) return;

      // 1. Datos base del token
      const token = keycloak.tokenParsed;
      const baseData = {
        firstName: token.given_name || '',
        lastName: token.family_name || '',
        email: token.email || ''
      };

      setUserData(prev => ({ ...prev, ...baseData }));

      // 2. Intentar cargar perfil completo del backend
      const { getMyProfile } = await import('../services/client/customerDetailsService');
      const profileResponse = await getMyProfile();

      console.log('[UserProfile] Profile loaded:', profileResponse);

      // Actualizar estado con datos del backend
      setUserData(prev => ({
        ...prev,
        ...baseData,
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

      // Confirmar que tenemos info
      setHasCompletedExtraInfo(true);
      localStorage.setItem('hasCompletedExtraInfo', 'true');

    } catch (error) {
      console.warn('[UserProfile] Failed to load profile from backend (might be incomplete)', error);
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

  const handleEditToggle = () => {
    setIsEditing(!isEditing);
  };

  const handleSave = async () => {
    try {
      const { updateProfile } = await import('../services/client/customerDetailsService');

      let apiGender: Gender = 'OTHER';
      if (userData.gender === 'Male' || userData.gender === 'Masculino') apiGender = 'MALE';
      else if (userData.gender === 'Female' || userData.gender === 'Femenino') apiGender = 'FEMALE';

      const updateRequest: CustomerDetailsUpdateRequest = {
        gender: apiGender,
        phone: userData.phone,
        addressLine1: userData.address,
        city: userData.city,
        country: userData.country
      };

      console.log('[UserProfile] Updating profile:', updateRequest);
      await updateProfile(updateRequest);

      localStorage.setItem('userData', JSON.stringify({
        gender: userData.gender,
        phone: userData.phone,
        address: userData.address,
        city: userData.city,
        country: userData.country,
        licenseId: userData.licenseId,
        birthDate: userData.birthDate
      }));

      localStorage.setItem('userPreferences', JSON.stringify(userData.preferences));

      setIsEditing(false);
      alert('¡Perfil actualizado exitosamente!');
    } catch (error) {
      console.error('[UserProfile] Failed to update profile', error);
      alert('Error al actualizar el perfil. Por favor verifica los datos.');
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
      setUserData(prev => ({
        ...prev,
        [name]: value
      }));
    }
  };

  const handleCancel = () => {
    loadUserData();
    setIsEditing(false);
  };

  const handleChangePassword = () => {
    if (keycloak.accountManagement) {
      keycloak.accountManagement();
    }
  };

  const handleCompleteInfo = () => {
    navigate('/customer');
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return 'No especificada';
    const date = new Date(dateString);
    return date.toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
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
  const isNewUser = () => {
    return !hasCompletedExtraInfo;
  };

  const renderBookingStatus = (status: string) => {
    switch (status) {
      case 'CONFIRMED': return <span className="bg-green-100 text-green-800 px-2 py-1 rounded text-xs font-bold flex items-center gap-1"><CheckCircle size={12} /> Confirmada</span>;
      case 'PENDING': return <span className="bg-yellow-100 text-yellow-800 px-2 py-1 rounded text-xs font-bold flex items-center gap-1"><Clock size={12} /> Pendiente</span>;
      case 'CANCELLED': return <span className="bg-red-100 text-red-800 px-2 py-1 rounded text-xs font-bold flex items-center gap-1"><XCircle size={12} /> Cancelada</span>;
      case 'COMPLETED': return <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded text-xs font-bold flex items-center gap-1"><CheckCircle size={12} /> Completada</span>;
      default: return <span className="bg-gray-100 text-gray-800 px-2 py-1 rounded text-xs font-bold">{status}</span>;
    }
  };

  const activeBookings = bookings.filter(b => ['PENDING', 'CONFIRMED', 'CHECKED_IN'].includes(b.status));
  const pastBookings = bookings.filter(b => ['CHECKED_OUT', 'CANCELLED', 'COMPLETED'].includes(b.status));

  return (
    <div className="user-profile-container">
      {/* Contenido principal */}
      <div className="profile-header">
        <button className="back-button" onClick={() => navigate('/')}>
          <ArrowLeft size={24} />
          Volver al inicio
        </button>

        <div className="header-content">
          <div className="profile-avatar">
            <div className="profile-card">
              <div className="profile-card-container">
                <div className="profile-card-avatar">
                  <span className="profile-card-initials">
                    {userData.firstName.charAt(0)}
                    {userData.lastName.charAt(0)}
                  </span>

                  {!hasCompletedExtraInfo && <span className="profile-card-pulse"></span>}

                  {isNewUser() && (
                    <div className="profile-card-badge">Nuevo</div>
                  )}
                </div>

                <div className="profile-card-info">
                  <h1>{userData.firstName} {userData.lastName}</h1>
                  <p className="profile-card-member">
                    Miembro desde Diciembre 2025
                  </p>

                  {!hasCompletedExtraInfo && (
                    <div className="profile-card-alert">
                      <AlertCircle size={16} />
                      <span>
                        <strong>¡Atención!</strong> Debes completar tu información de perfil.
                      </span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>


          <div className="header-actions">
            {activeTab === 'profile' && (
              !isEditing ? (
                <>
                  <button className="btn btn-edit" onClick={handleEditToggle}>
                    <Edit size={18} />
                    Editar Perfil
                  </button>
                  {!hasCompletedExtraInfo && (
                    <button
                      className="btn btn-warning"
                      onClick={handleCompleteInfo}
                    >
                      <AlertCircle size={18} />
                      Completar Información
                    </button>
                  )}
                </>
              ) : (
                <div className="edit-actions">
                  <button className="btn btn-save" onClick={handleSave}>
                    <Save size={18} />
                    Guardar
                  </button>
                  <button className="btn btn-cancel" onClick={handleCancel}>
                    <X size={18} />
                    Cancelar
                  </button>
                </div>
              )
            )}
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="profile-tabs">
          <button
            className={`tab-btn ${activeTab === 'profile' ? 'active' : ''}`}
            onClick={() => setActiveTab('profile')}
          >
            Mi Perfil
          </button>
          <button
            className={`tab-btn ${activeTab === 'bookings' ? 'active' : ''}`}
            onClick={() => setActiveTab('bookings')}
          >
            Mis Reservas
          </button>
        </div>
      </div>

      <div className="profile-content">
        {activeTab === 'profile' && (
          <div className="content-grid">
            {/* Columna izquierda - Información personal */}
            <div className="personal-info">
              <div className="section-card">
                <div className="section-header">
                  <User size={20} />
                  <h2>Información Personal</h2>
                  {!hasCompletedExtraInfo && (
                    <span className="section-warning">
                      ⚠️ Obligatorio completar
                    </span>
                  )}
                </div>

                <div className="info-grid">
                  <div className="info-item">
                    <label><User size={16} /> Nombre</label>
                    {isEditing ? (
                      <input
                        type="text"
                        value={userData.firstName}
                        disabled
                        className="edit-input"
                      />
                    ) : (
                      <p>{userData.firstName || 'No especificado'}</p>
                    )}
                  </div>

                  <div className="info-item">
                    <label><User size={16} /> Apellido</label>
                    {isEditing ? (
                      <input
                        type="text"
                        value={userData.lastName}
                        disabled
                        className="edit-input"
                      />
                    ) : (
                      <p>{userData.lastName || 'No especificado'}</p>
                    )}
                  </div>

                  <div className="info-item">
                    <label><Mail size={16} /> Email</label>
                    {isEditing ? (
                      <input
                        type="text"
                        value={userData.email}
                        disabled
                        className="edit-input"
                      />
                    ) : (
                      <>
                        <p>{userData.email || 'No especificado'}</p>
                        <small className="email-note"><Shield size={12} /> Verificado</small>
                      </>
                    )}
                  </div>

                  <div className="info-item">
                    <label><Phone size={16} /> Teléfono <span className="required">*</span></label>
                    {isEditing ? (
                      <input
                        type="tel"
                        name="phone"
                        value={userData.phone}
                        onChange={handleInputChange}
                        className="edit-input"
                        placeholder="+505 1234 5678"
                        required
                      />
                    ) : (
                      <p className={!userData.phone ? 'required-field' : ''}>
                        {userData.phone || 'Requerido - No especificado'}
                      </p>
                    )}
                  </div>

                  <div className="info-item">
                    <label><Calendar size={16} /> Fecha de Nacimiento</label>
                    {isEditing ? (
                      <input
                        type="date"
                        value={userData.birthDate}
                        disabled
                        className="edit-input"
                      />
                    ) : (
                      <p>{formatDate(userData.birthDate)}</p>
                    )}
                  </div>

                  {hasCompletedExtraInfo && (
                    <>
                      <div className="info-item">
                        <label><User size={16} /> Género</label>
                        {isEditing ? (
                          <select
                            name="gender"
                            value={userData.gender}
                            onChange={handleInputChange}
                            className="edit-input"
                          >
                            <option value="">Seleccionar...</option>
                            <option value="Male">Masculino</option>
                            <option value="Female">Femenino</option>
                            <option value="Other">Otro</option>
                          </select>
                        ) : (
                          <p>{getGenderText(userData.gender)}</p>
                        )}
                      </div>

                      <div className="info-item">
                        <label><IdCard size={16} /> DNI/Pasaporte</label>
                        {isEditing ? (
                          <input
                            type="text"
                            value={userData.licenseId}
                            disabled
                            className="edit-input"
                          />
                        ) : (
                          <p>{userData.licenseId || 'No especificado'}</p>
                        )}
                      </div>

                      <div className="info-item full-width">
                        <label><Home size={16} /> Dirección <span className="required">*</span></label>
                        {isEditing ? (
                          <input
                            type="text"
                            name="address"
                            value={userData.address}
                            onChange={handleInputChange}
                            className="edit-input"
                            placeholder="Dirección completa"
                            required
                          />
                        ) : (
                          <p className={!userData.address ? 'required-field' : ''}>
                            {userData.address || 'Requerido - No especificada'}
                          </p>
                        )}
                      </div>

                      <div className="info-item">
                        <label><Globe size={16} /> Ciudad <span className="required">*</span></label>
                        {isEditing ? (
                          <input
                            type="text"
                            name="city"
                            value={userData.city}
                            onChange={handleInputChange}
                            className="edit-input"
                            placeholder="Ciudad"
                            required
                          />
                        ) : (
                          <p className={!userData.city ? 'required-field' : ''}>
                            {userData.city || 'Requerido - No especificada'}
                          </p>
                        )}
                      </div>

                      <div className="info-item">
                        <label className="text-gray-700 font-medium mb-1 block"><Globe size={16} className="inline mr-2" /> País <span className="text-red-500">*</span></label>
                        {isEditing ? (
                          <input
                            type="text"
                            name="country"
                            value={userData.country}
                            onChange={handleInputChange}
                            className="edit-input"
                            placeholder="País"
                            required
                          />
                        ) : (
                          <p className={!userData.country ? 'required-field' : ''}>
                            {userData.country || 'Requerido - No especificado'}
                          </p>
                        )}
                      </div>
                    </>
                  )}
                </div>
              </div>

              {/* Sección de seguridad */}
              <div className="section-card">
                <div className="section-header">
                  <Shield size={20} />
                  <h2>Seguridad</h2>
                </div>

                <div className="security-actions">
                  <button className="security-btn" onClick={handleChangePassword}>
                    <Key size={18} />
                    <div>
                      <h4>Cambiar Contraseña</h4>
                      <p>Actualiza tu contraseña regularmente</p>
                    </div>
                  </button>

                  <button className="security-btn">
                    <Lock size={18} />
                    <div>
                      <h4>Autenticación de Dos Factores</h4>
                      <p>Activar para mayor seguridad</p>
                    </div>
                  </button>
                </div>
              </div>
            </div>

            {/* Columna derecha */}
            <div className="right-column">
              <div className="section-card">
                <div className="section-header">
                  <Info size={20} />
                  <h2>Informacion</h2>
                </div>

                <div className="preferences-grid">
                  <div className="preference-item">
                    <div className="preference-info">
                      <Package size={18} />
                      <div>
                        <h4>Idioma</h4>
                        <p>Idioma preferido</p>
                      </div>
                    </div>

                    <span className="preference-value">
                      Español
                    </span>
                  </div>
                  <div className="preference-item">
                    <div className="preference-info">
                      <CreditCard size={18} />
                      <div>
                        <h4>Moneda</h4>
                        <p>Moneda preferida</p>
                      </div>
                    </div>
                    <span className="preference-value">
                      USD ($)
                    </span>
                  </div>
                </div>
              </div>

              {/* Información del sistema */}
              <div className="section-card">
                <div className="section-header">
                  <Shield size={20} />
                  <h2>Información del Sistema</h2>
                </div>

                <div className="system-info">
                  <div className="system-item">
                    <span className="system-label">Estado de la cuenta:</span>
                    <span className={`system-value ${hasCompletedExtraInfo ? 'active' : 'incomplete'}`}>
                      {hasCompletedExtraInfo ? 'Completa' : 'Incompleta'}
                    </span>
                  </div>

                  <div className="system-item">
                    <span className="system-label">Autenticación:</span>
                    <span className="system-value active">Keycloak</span>
                  </div>

                  <div className="system-item">
                    <span className="system-label">Última actualización:</span>
                    <span className="system-value">
                      {new Date().toLocaleDateString('es-ES')}
                    </span>
                  </div>

                  {!hasCompletedExtraInfo && (
                    <button
                      className="btn-complete-info"
                      onClick={handleCompleteInfo}
                    >
                      <AlertCircle size={16} />
                      Completar información ahora
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'bookings' && (
          <div className="bookings-container">
            {loadingBookings ? (
              <div className="flex justify-center py-20">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#d4af37]"></div>
              </div>
            ) : bookings.length === 0 ? (
              <div className="empty-bookings">
                <Calendar className="mx-auto h-20 w-20 text-gray-300 mb-6" />
                <h3>No tienes reservas activas</h3>
                <p>Parece que aún no has reservado tu estadía perfecta con nosotros.</p>
                <button onClick={() => navigate('/')} className="btn btn-warning" style={{ margin: '0 auto', display: 'inline-flex' }}>
                  Explorar Habitaciones
                </button>
              </div>
            ) : (
              <div className="space-y-8">
                {activeBookings.length > 0 && (
                  <section>
                    <div className="bookings-section-title">
                      <Clock className="text-[#d4af37]" /> Reservas Activas
                    </div>
                    <div className="bookings-grid">
                      {activeBookings.map(booking => (
                        <div key={booking.id} className="booking-card">
                          <div className="booking-header">
                            <div className="booking-title">
                              <h4>{booking.roomTypeName}</h4>
                              <span className="booking-id">Reserva #{booking.id}</span>
                            </div>
                            {renderBookingStatus(booking.status)}
                          </div>
                          <div className="space-y-3 mb-6">
                            <div className="flex items-center gap-3 text-gray-700">
                              <Calendar size={18} className="text-[#d4af37]" />
                              <span>{formatDate(booking.checkInDate)} - {formatDate(booking.checkOutDate)}</span>
                            </div>
                            <div className="flex items-center gap-3 text-gray-700">
                              <CreditCard size={18} className="text-[#d4af37]" />
                              <span className="font-bold">${booking.totalPrice}</span>
                            </div>
                            <div className="flex items-center gap-3 text-gray-700">
                              <User size={18} className="text-[#d4af37]" />
                              <span>{booking.guestCount} {booking.guestCount === 1 ? 'huésped' : 'huéspedes'}</span>
                            </div>
                          </div>

                          <div className="space-y-2">
                            <button
                              onClick={() => setSelectedBookingForService({ id: booking.id, roomTypeName: booking.roomTypeName })}
                              className="w-full py-2 bg-[#d4af37]/10 text-[#d4af37] border border-[#d4af37]/20 rounded-lg hover:bg-[#d4af37]/20 transition-colors text-sm font-bold flex items-center justify-center gap-2"
                            >
                              <ConciergeBell size={16} />
                              Solicitar Servicio
                            </button>
                            <button className="w-full py-2 border border-gray-300 rounded-lg text-gray-600 hover:bg-gray-50 transition-colors text-sm font-medium">
                              Ver Detalles
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </section>
                )}

                {pastBookings.length > 0 && (
                  <section>
                    <div className="bookings-section-title">
                      <CheckCircle className="text-gray-400" /> Historial
                    </div>
                    <div className="bookings-grid">
                      {pastBookings.map(booking => (
                        <div key={booking.id} className="booking-card past">
                          <div className="booking-header">
                            <div className="booking-title">
                              <h4>{booking.roomTypeName}</h4>
                              <span className="booking-id">#{booking.id}</span>
                            </div>
                            {renderBookingStatus(booking.status)}
                          </div>
                          <div className="booking-detail-row">
                            <Calendar size={16} />
                            <span className="text-sm">{formatDate(booking.checkInDate)}</span>
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
          onSuccess={() => {
            // Optional: Show success message or toast
            // Maybe refresh bookings or fetch service requests history
            alert('Solicitud enviada con éxito');
          }}
        />
      )}
    </div>
  );
};

export default UserProfilePage;