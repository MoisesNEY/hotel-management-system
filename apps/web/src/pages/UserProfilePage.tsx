import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  User, Mail, Phone, Calendar, Edit,
  Save, X, Lock, Shield, Bell,
  ArrowLeft, Key, Star, Bed, Coffee,
  IdCard, Globe, Home, AlertCircle, CreditCard, Package
} from 'lucide-react';
import keycloak from '../services/keycloak';
import type { CustomerDetailsUpdateRequest, Gender } from '../types/clientTypes';
import '../styles/user-profile.css';

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

interface Booking {
  id: string;
  roomType: string;
  checkIn: string;
  checkOut: string;
  guests: number;
  status: 'CONFIRMED' | 'PENDING' | 'CANCELLED' | 'COMPLETED';
  totalPrice: number;
  roomNumber?: string;
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
  const [isEditing, setIsEditing] = useState(false);
  const [hasCompletedExtraInfo, setHasCompletedExtraInfo] = useState(() => {
    return localStorage.getItem('hasCompletedExtraInfo') === 'true';
  });

  // Estados para los modales
  const [showBookingsModal, setShowBookingsModal] = useState(false);
  const [showServicesModal, setShowServicesModal] = useState(false);

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

  const [bookings, setBookings] = useState<Booking[]>([]);
  const [serviceRequests, setServiceRequests] = useState<ServiceRequest[]>([]);
  const [isLoadingBookings, setIsLoadingBookings] = useState(false);
  const [isLoadingServices, setIsLoadingServices] = useState(false);

  useEffect(() => {
    // Verificar autenticación
    if (!keycloak.authenticated) {
      navigate('/');
      return;
    }

    // Cargar datos del usuario
    loadUserData();
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

  // Función para cargar reservas
  const loadBookings = async () => {
    setIsLoadingBookings(true);
    try {
      // Aquí deberías llamar a tu servicio de reservas
      // Ejemplo: const response = await getMyBookings();

      // Datos de ejemplo (simulación)
      const mockBookings: Booking[] = [
        {
          id: '1',
          roomType: 'Suite Presidencial',
          checkIn: '2024-01-15',
          checkOut: '2024-01-20',
          guests: 2,
          status: 'COMPLETED',
          totalPrice: 1200,
          roomNumber: '301'
        },
        {
          id: '2',
          roomType: 'Habitación Deluxe',
          checkIn: '2024-02-10',
          checkOut: '2024-02-15',
          guests: 2,
          status: 'CONFIRMED',
          totalPrice: 800
        }
      ];

      // Simular delay de API
      await new Promise(resolve => setTimeout(resolve, 500));
      setBookings(mockBookings);
    } catch (error) {
      console.error('Error cargando reservas:', error);
      setBookings([]);
    } finally {
      setIsLoadingBookings(false);
    }
  };

  // Función para cargar servicios solicitados
  const loadServiceRequests = async () => {
    setIsLoadingServices(true);
    try {
      // Aquí deberías llamar a tu servicio de solicitudes de servicio
      // Ejemplo: const response = await getMyServiceRequests();

      // Datos de ejemplo (simulación)
      const mockServices: ServiceRequest[] = [
        {
          id: '1',
          serviceType: 'Spa - Masaje Relajante',
          requestedDate: '2024-01-16 15:00',
          status: 'COMPLETED',
          notes: 'Masaje de 60 minutos',
          price: 80
        },
        {
          id: '2',
          serviceType: 'Room Service - Cena',
          requestedDate: '2024-01-17 20:00',
          status: 'COMPLETED',
          notes: 'Filete con vino tinto',
          price: 45
        }
      ];

      // Simular delay de API
      await new Promise(resolve => setTimeout(resolve, 500));
      setServiceRequests(mockServices);
    } catch (error) {
      console.error('Error cargando servicios:', error);
      setServiceRequests([]);
    } finally {
      setIsLoadingServices(false);
    }
  };

  // Abrir modal de reservas
  const handleOpenBookingsModal = () => {
    setShowBookingsModal(true);
    loadBookings();
  };

  // Abrir modal de servicios
  const handleOpenServicesModal = () => {
    setShowServicesModal(true);
    loadServiceRequests();
  };

  // Cerrar modales
  const handleCloseBookingsModal = () => setShowBookingsModal(false);
  const handleCloseServicesModal = () => setShowServicesModal(false);

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

  const formatDateTime = (dateTimeString: string) => {
    if (!dateTimeString) return 'No especificada';
    const date = new Date(dateTimeString);
    return date.toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
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

  const getStatusText = (status: string) => {
    switch (status) {
      case 'CONFIRMED': return 'Confirmada';
      case 'PENDING': return 'Pendiente';
      case 'CANCELLED': return 'Cancelada';
      case 'COMPLETED': return 'Completada';
      case 'IN_PROGRESS': return 'En Progreso';
      default: return status;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'CONFIRMED': return 'bg-green-100 text-green-800';
      case 'COMPLETED': return 'bg-blue-100 text-blue-800';
      case 'PENDING': return 'bg-yellow-100 text-yellow-800';
      case 'CANCELLED': return 'bg-red-100 text-red-800';
      case 'IN_PROGRESS': return 'bg-purple-100 text-purple-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const isNewUser = () => {
    return !hasCompletedExtraInfo;
  };

  return (
    <div className="user-profile-container">
      {/* Modales */}
      {showBookingsModal && (
        <div className="modal-overlay">
          <div className="modal-container">
            <div className="modal-header">
              <h2 className="modal-title">
                <Bed size={24} />
                Mis Reservas
              </h2>
              <button className="modal-close" onClick={handleCloseBookingsModal}>
                <X size={24} />
              </button>
            </div>
            <div className="modal-content">
              {isLoadingBookings ? (
                <div className="loading-state">
                  <div className="loading-spinner"></div>
                  <p>Cargando reservas...</p>
                </div>
              ) : bookings.length === 0 ? (
                <div className="empty-state">
                  <Bed size={48} className="empty-icon" />
                  <h3>No has realizado ninguna reserva</h3>
                  <p>Cuando hagas una reserva en nuestro hotel, aparecerá aquí.</p>
                  <button className="btn btn-primary" onClick={() => navigate('/')}>
                    Explorar Habitaciones
                  </button>
                </div>
              ) : (
                <div className="bookings-list">
                  {bookings.map(booking => (
                    <div key={booking.id} className="booking-card">
                      <div className="booking-header">
                        <h3>{booking.roomType}</h3>
                        <span className={`status-badge ${getStatusColor(booking.status)}`}>
                          {getStatusText(booking.status)}
                        </span>
                      </div>
                      <div className="booking-details">
                        <div className="detail">
                          <span className="detail-label">Check-in:</span>
                          <span className="detail-value">{formatDate(booking.checkIn)}</span>
                        </div>
                        <div className="detail">
                          <span className="detail-label">Check-out:</span>
                          <span className="detail-value">{formatDate(booking.checkOut)}</span>
                        </div>
                        <div className="detail">
                          <span className="detail-label">Huéspedes:</span>
                          <span className="detail-value">{booking.guests}</span>
                        </div>
                        {booking.roomNumber && (
                          <div className="detail">
                            <span className="detail-label">Habitación:</span>
                            <span className="detail-value">{booking.roomNumber}</span>
                          </div>
                        )}
                        <div className="detail">
                          <span className="detail-label">Total:</span>
                          <span className="detail-value font-bold">${booking.totalPrice}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
            <div className="modal-footer">
              <button className="btn btn-secondary" onClick={handleCloseBookingsModal}>
                Cerrar
              </button>
            </div>
          </div>
        </div>
      )}

      {showServicesModal && (
        <div className="modal-overlay">
          <div className="modal-container">
            <div className="modal-header">
              <h2 className="modal-title">
                <Coffee size={24} />
                Mis Servicios Solicitados
              </h2>
              <button className="modal-close" onClick={handleCloseServicesModal}>
                <X size={24} />
              </button>
            </div>
            <div className="modal-content">
              {isLoadingServices ? (
                <div className="loading-state">
                  <div className="loading-spinner"></div>
                  <p>Cargando servicios...</p>
                </div>
              ) : serviceRequests.length === 0 ? (
                <div className="empty-state">
                  <Coffee size={48} className="empty-icon" />
                  <h3>No has solicitado ningún servicio</h3>
                  <p>Cuando solicites un servicio durante tu estancia, aparecerá aquí.</p>
                </div>
              ) : (
                <div className="services-list">
                  {serviceRequests.map(service => (
                    <div key={service.id} className="service-card">
                      <div className="service-header">
                        <h3>{service.serviceType}</h3>
                        <span className={`status-badge ${getStatusColor(service.status)}`}>
                          {getStatusText(service.status)}
                        </span>
                      </div>
                      <div className="service-details">
                        <div className="detail">
                          <span className="detail-label">Solicitado:</span>
                          <span className="detail-value">{formatDateTime(service.requestedDate)}</span>
                        </div>
                        {service.notes && (
                          <div className="detail">
                            <span className="detail-label">Notas:</span>
                            <span className="detail-value">{service.notes}</span>
                          </div>
                        )}
                        {service.price && (
                          <div className="detail">
                            <span className="detail-label">Precio:</span>
                            <span className="detail-value">${service.price}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
            <div className="modal-footer">
              <button className="btn btn-secondary" onClick={handleCloseServicesModal}>
                Cerrar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Contenido principal */}
      <div className="profile-header">
        <button className="back-button" onClick={() => navigate('/')}>
          <ArrowLeft size={24} />
          Volver al inicio
        </button>

        <div className="header-content">
          <div className="profile-avatar">
            <div className="avatar-circle">
              <User size={48} />
              {isNewUser() && (
                <div className="new-user-badge">Nuevo</div>
              )}
            </div>
            <div className="avatar-info">
              <h1>{userData.firstName} {userData.lastName}</h1>
              <p className="member-since">Miembro desde Enero 2024</p>
              {!hasCompletedExtraInfo && (
                <div className="incomplete-info-alert">
                  <AlertCircle size={16} />
                  <span><strong>¡Atención!</strong> Debes completar tu información de perfil. Los campos marcados son obligatorios.</span>
                </div>
              )}
            </div>
          </div>

          <div className="header-actions">
            {!isEditing ? (
              <>
                <button className="btn btn-edit" onClick={handleEditToggle}>
                  <Edit size={18} />
                  Editar Perfil
                </button>
                <button className="btn btn-reservations" onClick={handleOpenBookingsModal}>
                  <Bed size={18} />
                  Mis Reservas
                </button>
                <button className="btn btn-services" onClick={handleOpenServicesModal}>
                  <Coffee size={18} />
                  Mis Servicios
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
            )}
          </div>
        </div>
      </div>

      <div className="profile-content">
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
                      <label><Globe size={16} /> País <span className="required">*</span></label>
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
            {/* Preferencias */}
            <div className="section-card">
              <div className="section-header">
                <Star size={20} />
                <h2>Preferencias</h2>
              </div>

              <div className="preferences-grid">
                <div className="preference-item">
                  <div className="preference-info">
                    <Bell size={18} />
                    <div>
                      <h4>Notificaciones</h4>
                      <p>Recibir notificaciones por email</p>
                    </div>
                  </div>
                  <label className="toggle-switch">
                    <input
                      type="checkbox"
                      name="preferences.notifications"
                      checked={userData.preferences.notifications}
                      onChange={handleInputChange}
                      disabled={!isEditing}
                    />
                    <span className="toggle-slider"></span>
                  </label>
                </div>

                <div className="preference-item">
                  <div className="preference-info">
                    <Mail size={18} />
                    <div>
                      <h4>Newsletter</h4>
                      <p>Recibir ofertas y novedades</p>
                    </div>
                  </div>
                  <label className="toggle-switch">
                    <input
                      type="checkbox"
                      name="preferences.newsletter"
                      checked={userData.preferences.newsletter}
                      onChange={handleInputChange}
                      disabled={!isEditing}
                    />
                    <span className="toggle-slider"></span>
                  </label>
                </div>

                <div className="preference-item">
                  <div className="preference-info">
                    <Package size={18} />
                    <div>
                      <h4>Idioma</h4>
                      <p>Idioma preferido</p>
                    </div>
                  </div>
                  {isEditing ? (
                    <select
                      name="preferences.language"
                      value={userData.preferences.language}
                      onChange={handleInputChange}
                      className="preference-select"
                    >
                      <option value="es">Español</option>
                      <option value="en">English</option>
                      <option value="fr">Français</option>
                    </select>
                  ) : (
                    <span className="preference-value">
                      {userData.preferences.language === 'es' ? 'Español' :
                        userData.preferences.language === 'en' ? 'English' : 'Français'}
                    </span>
                  )}
                </div>

                <div className="preference-item">
                  <div className="preference-info">
                    <CreditCard size={18} />
                    <div>
                      <h4>Moneda</h4>
                      <p>Moneda preferida</p>
                    </div>
                  </div>
                  {isEditing ? (
                    <select
                      name="preferences.currency"
                      value={userData.preferences.currency}
                      onChange={handleInputChange}
                      className="preference-select"
                    >
                      <option value="USD">USD ($)</option>
                      <option value="EUR">EUR (€)</option>
                      <option value="GBP">GBP (£)</option>
                    </select>
                  ) : (
                    <span className="preference-value">
                      {userData.preferences.currency}
                    </span>
                  )}
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
      </div>
    </div>
  );
};

export default UserProfilePage;