import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  User, Mail, Phone, Calendar, Edit,
  Save, X, Lock, Shield, Bell,
  ArrowLeft, Key, Star,
  IdCard, Globe, Home, AlertCircle, CreditCard, Package
} from 'lucide-react';
import keycloak from '../services/keycloak';
import type { CustomerDetailsUpdateRequest, Gender } from '../types/clientTypes';
import '../styles/user-profile.css';

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
  const [isEditing, setIsEditing] = useState(false);
  const [hasCompletedExtraInfo, setHasCompletedExtraInfo] = useState(() => {
    return localStorage.getItem('hasCompletedExtraInfo') === 'true';
  });

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
      // Import dinámico para evitar ciclos
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
        // Normalizar Gender de API (MALE) a UI (Male)
        gender: profileResponse.gender 
          ? profileResponse.gender.charAt(0) + profileResponse.gender.slice(1).toLowerCase() 
          : '',
      }));
      
      // Confirmar que tenemos info
      setHasCompletedExtraInfo(true);
      localStorage.setItem('hasCompletedExtraInfo', 'true');

    } catch (error) {
      console.warn('[UserProfile] Failed to load profile from backend (might be incomplete)', error);
      // Fallback: Si falla, asumimos que no tiene perfil completo
      setHasCompletedExtraInfo(false);
    }
  };

  const handleEditToggle = () => {
    setIsEditing(!isEditing);
  };

  const handleSave = async () => {
    try {
      const { updateProfile } = await import('../services/client/customerDetailsService');

      // Mapear género UI -> API
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

      // Guardar cambios en localStorage (cache optimista)
      localStorage.setItem('userData', JSON.stringify({
        gender: userData.gender,
        phone: userData.phone,
        address: userData.address,
        city: userData.city,
        country: userData.country,
        licenseId: userData.licenseId, // No se edita pero se guarda
        birthDate: userData.birthDate // No se edita pero se guarda
      }));

      // También guardar preferencias (esto es local por ahora si no hay endpoint)
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
    // Recargar datos originales
    loadUserData();
    setIsEditing(false);
  };

  const handleChangePassword = () => {
    // Redirigir a cambio de contraseña de Keycloak
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

  // Determinar si el usuario es nuevo (menos de 7 días)
  const isNewUser = () => {
    return !hasCompletedExtraInfo;
  };

  return (
    <div className="user-profile-container">
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
                  <span className="section-warning text-red-600 bg-red-50 px-2 py-1 rounded text-xs font-bold border border-red-200">
                    ⚠️ Obligatorio completar
                  </span>
                )}
              </div>

              <div className="info-grid">
                <div className="info-item">
                  <label className="text-gray-700 font-medium mb-1 block"><User size={16} className="inline mr-2" /> Nombre</label>
                  {isEditing ? (
                    <input
                      type="text"
                      value={userData.firstName}
                      disabled
                      className="edit-input bg-gray-100 text-gray-500 cursor-not-allowed opacity-70"
                    />
                  ) : (
                    <p className="py-2 text-gray-800">{userData.firstName || 'No especificado'}</p>
                  )}
                </div>

                <div className="info-item">
                  <label className="text-gray-700 font-medium mb-1 block"><User size={16} className="inline mr-2" /> Apellido</label>
                  {isEditing ? (
                    <input
                      type="text"
                      value={userData.lastName}
                      disabled
                      className="edit-input bg-gray-100 text-gray-500 cursor-not-allowed opacity-70"
                    />
                  ) : (
                    <p className="py-2 text-gray-800">{userData.lastName || 'No especificado'}</p>
                  )}
                </div>

                <div className="info-item">
                  <label className="text-gray-700 font-medium mb-1 block"><Mail size={16} className="inline mr-2" /> Email</label>
                  {isEditing ? (
                    <input
                      type="text"
                      value={userData.email}
                      disabled
                      className="edit-input bg-gray-100 text-gray-500 cursor-not-allowed opacity-70"
                    />
                  ) : (
                    <>
                      <p className="email-display py-2 text-gray-800">{userData.email || 'No especificado'}</p>
                      <small className="email-note text-green-600 flex items-center gap-1"><Shield size={12}/> Verificado</small>
                    </>
                  )}
                </div>

                <div className="info-item">
                  <label className="text-gray-700 font-medium mb-1 block"><Phone size={16} className="inline mr-2" /> Teléfono <span className="text-red-500">*</span></label>
                  {isEditing ? (
                    <input
                      type="tel"
                      name="phone"
                      value={userData.phone}
                      onChange={handleInputChange}
                      className="edit-input focus:!border-[#d4af37] focus:!ring-4 focus:!ring-[#d4af37]/10"
                      placeholder="+505 1234 5678"
                      required
                    />
                  ) : (
                    <p className={`py-2 ${!userData.phone ? 'text-red-500 font-medium' : 'text-gray-800'}`}>
                      {userData.phone || 'Requerido - No especificado'}
                    </p>
                  )}
                </div>

                <div className="info-item">
                  <label className="text-gray-700 font-medium mb-1 block"><Calendar size={16} className="inline mr-2" /> Fecha de Nacimiento</label>
                  {isEditing ? (
                    <input
                      type="date"
                      value={userData.birthDate}
                      disabled
                      className="edit-input bg-gray-100 text-gray-500 cursor-not-allowed opacity-70"
                    />
                  ) : (
                    <p className="py-2 text-gray-800">{formatDate(userData.birthDate)}</p>
                  )}
                </div>

                {hasCompletedExtraInfo && (
                  <>
                    <div className="info-item">
                      <label className="text-gray-700 font-medium mb-1 block"><User size={16} className="inline mr-2" /> Género</label>
                      {isEditing ? (
                        <select
                          name="gender"
                          value={userData.gender}
                          onChange={handleInputChange}
                          className="edit-input focus:!border-[#d4af37] focus:!ring-4 focus:!ring-[#d4af37]/10 bg-white"
                        >
                          <option value="">Seleccionar...</option>
                          <option value="Male">Masculino</option>
                          <option value="Female">Femenino</option>
                          <option value="Other">Otro</option>
                        </select>
                      ) : (
                        <p className="py-2 text-gray-800">{getGenderText(userData.gender)}</p>
                      )}
                    </div>

                    <div className="info-item">
                      <label className="text-gray-700 font-medium mb-1 block"><IdCard size={16} className="inline mr-2" /> DNI/Pasaporte</label>
                      {isEditing ? (
                        <input
                          type="text"
                          value={userData.licenseId}
                          disabled
                          className="edit-input bg-gray-100 text-gray-500 cursor-not-allowed opacity-70"
                        />
                      ) : (
                        <p className="py-2 text-gray-800">{userData.licenseId || 'No especificado'}</p>
                      )}
                    </div>

                    <div className="info-item full-width col-span-1 md:col-span-2">
                      <label className="text-gray-700 font-medium mb-1 block"><Home size={16} className="inline mr-2" /> Dirección <span className="text-red-500">*</span></label>
                      {isEditing ? (
                        <input
                          type="text"
                          name="address"
                          value={userData.address}
                          onChange={handleInputChange}
                          className="edit-input focus:!border-[#d4af37] focus:!ring-4 focus:!ring-[#d4af37]/10"
                          placeholder="Dirección completa"
                          required
                        />
                      ) : (
                        <p className={`py-2 ${!userData.address ? 'text-red-500 font-medium' : 'text-gray-800'}`}>
                          {userData.address || 'Requerido - No especificada'}
                        </p>
                      )}
                    </div>

                    <div className="info-item">
                      <label className="text-gray-700 font-medium mb-1 block"><Globe size={16} className="inline mr-2" /> Ciudad <span className="text-red-500">*</span></label>
                      {isEditing ? (
                        <input
                          type="text"
                          name="city"
                          value={userData.city}
                          onChange={handleInputChange}
                          className="edit-input focus:!border-[#d4af37] focus:!ring-4 focus:!ring-[#d4af37]/10"
                          placeholder="Ciudad"
                          required
                        />
                      ) : (
                        <p className={`py-2 ${!userData.city ? 'text-red-500 font-medium' : 'text-gray-800'}`}>
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
                          className="edit-input focus:!border-[#d4af37] focus:!ring-4 focus:!ring-[#d4af37]/10"
                          placeholder="País"
                          required
                        />
                      ) : (
                        <p className={`py-2 ${!userData.country ? 'text-red-500 font-medium' : 'text-gray-800'}`}>
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

          {/* Columna derecha - Preferencias */}
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