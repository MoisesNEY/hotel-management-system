// apps/web/src/pages/UserProfilePage.tsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  User, Mail, Phone, Calendar, MapPin, Edit, 
  Save, X, Lock, Shield, CreditCard, Bell,
  ArrowLeft, Key, Package, History, Star,
  IdCard, Globe, Home, AlertCircle
} from 'lucide-react';
import keycloak from '../services/keycloak';
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

    // Verificar si tiene información extra completada
    const hasInfo = localStorage.getItem('hasCompletedExtraInfo') === 'true';
    setHasCompletedExtraInfo(hasInfo);

    // Si no tiene información completada, redirigir
    if (!hasInfo) {
      const confirmComplete = window.confirm(
        '¡Atención! Necesitas completar tu información personal para acceder al perfil completo.\n\n¿Deseas completarla ahora?'
      );
      if (confirmComplete) {
        navigate('/customer');
      } else {
        navigate('/');
      }
      return;
    }

    // Cargar datos del usuario
    loadUserData();
  }, [navigate]);

  const loadUserData = () => {
    // Cargar datos desde Keycloak
    if (keycloak.tokenParsed) {
      const token = keycloak.tokenParsed;
      const firstName = token.given_name || '';
      const lastName = token.family_name || '';
      const email = token.email || '';
      
      // Cargar datos extras desde localStorage
      const savedData = localStorage.getItem('userData');
      let extraData = {};
      if (savedData) {
        extraData = JSON.parse(savedData);
      }

      setUserData(prev => ({
        ...prev,
        firstName,
        lastName,
        email,
        ...extraData
      }));
    }
  };

  const handleEditToggle = () => {
    setIsEditing(!isEditing);
  };

  const handleSave = () => {
    // Guardar cambios en localStorage
    localStorage.setItem('userData', JSON.stringify({
      gender: userData.gender,
      phone: userData.phone,
      address: userData.address,
      city: userData.city,
      country: userData.country,
      licenseId: userData.licenseId,
      birthDate: userData.birthDate
    }));
    
    // También guardar preferencias
    localStorage.setItem('userPreferences', JSON.stringify(userData.preferences));
    
    setIsEditing(false);
    alert('¡Cambios guardados exitosamente!');
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
    switch(gender) {
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
                  <span>Información incompleta. Completa tus datos para una mejor experiencia.</span>
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
                  <span className="section-warning">⚠️ Incompleta</span>
                )}
              </div>
              
              <div className="info-grid">
                <div className="info-item">
                  <label><User size={16} /> Nombre</label>
                  {isEditing ? (
                    <input
                      type="text"
                      name="firstName"
                      value={userData.firstName}
                      onChange={handleInputChange}
                      className="edit-input"
                      placeholder="Nombre"
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
                      name="lastName"
                      value={userData.lastName}
                      onChange={handleInputChange}
                      className="edit-input"
                      placeholder="Apellido"
                    />
                  ) : (
                    <p>{userData.lastName || 'No especificado'}</p>
                  )}
                </div>
                
                <div className="info-item">
                  <label><Mail size={16} /> Email</label>
                  <p className="email-display">{userData.email || 'No especificado'}</p>
                  <small className="email-note">Email verificado con Keycloak</small>
                </div>
                
                <div className="info-item">
                  <label><Phone size={16} /> Teléfono</label>
                  {isEditing ? (
                    <input
                      type="tel"
                      name="phone"
                      value={userData.phone}
                      onChange={handleInputChange}
                      className="edit-input"
                      placeholder="+505 1234 5678"
                    />
                  ) : (
                    <p>{userData.phone || 'No especificado'}</p>
                  )}
                </div>
                
                <div className="info-item">
                  <label><Calendar size={16} /> Fecha de Nacimiento</label>
                  {isEditing ? (
                    <input
                      type="date"
                      name="birthDate"
                      value={userData.birthDate}
                      onChange={handleInputChange}
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
                          name="licenseId"
                          value={userData.licenseId}
                          onChange={handleInputChange}
                          className="edit-input"
                          placeholder="Número de documento"
                        />
                      ) : (
                        <p>{userData.licenseId || 'No especificado'}</p>
                      )}
                    </div>
                    
                    <div className="info-item full-width">
                      <label><Home size={16} /> Dirección</label>
                      {isEditing ? (
                        <input
                          type="text"
                          name="address"
                          value={userData.address}
                          onChange={handleInputChange}
                          className="edit-input"
                          placeholder="Dirección completa"
                        />
                      ) : (
                        <p>{userData.address || 'No especificada'}</p>
                      )}
                    </div>
                    
                    <div className="info-item">
                      <label><Globe size={16} /> Ciudad</label>
                      {isEditing ? (
                        <input
                          type="text"
                          name="city"
                          value={userData.city}
                          onChange={handleInputChange}
                          className="edit-input"
                          placeholder="Ciudad"
                        />
                      ) : (
                        <p>{userData.city || 'No especificada'}</p>
                      )}
                    </div>
                    
                    <div className="info-item">
                      <label><Globe size={16} /> País</label>
                      {isEditing ? (
                        <input
                          type="text"
                          name="country"
                          value={userData.country}
                          onChange={handleInputChange}
                          className="edit-input"
                          placeholder="País"
                        />
                      ) : (
                        <p>{userData.country || 'No especificado'}</p>
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