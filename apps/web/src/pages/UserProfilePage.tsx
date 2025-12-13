// apps/web/src/pages/UserProfilePage.tsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  User, Mail, Phone, Calendar, MapPin, Edit, 
  Save, X, Lock, Shield, CreditCard, Bell,
  ArrowLeft, Key, Package, History, Star
} from 'lucide-react';
import keycloak from '../services/keycloak';
import '../styles/user-profile.css';

const UserProfilePage: React.FC = () => {
  const navigate = useNavigate();
  const [isEditing, setIsEditing] = useState(false);
  const [userData, setUserData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    birthDate: '',
    address: '',
    city: '',
    country: '',
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

    // Cargar datos del usuario desde Keycloak
    if (keycloak.tokenParsed) {
      const token = keycloak.tokenParsed;
      setUserData({
        firstName: token.given_name || '',
        lastName: token.family_name || '',
        email: token.email || '',
        phone: token.phone || '',
        birthDate: token.birthdate || '',
        address: token.address?.street_address || '',
        city: token.address?.locality || '',
        country: token.address?.country || '',
        preferences: {
          notifications: true,
          newsletter: false,
          language: 'es',
          currency: 'USD'
        }
      });
    }

    // Aquí podrías cargar datos adicionales desde tu API
    // fetchUserData();
  }, [navigate]);

  const handleEditToggle = () => {
    setIsEditing(!isEditing);
  };

  const handleSave = () => {
    // Aquí iría la lógica para guardar los cambios en Keycloak o tu backend
    console.log('Guardando cambios:', userData);
    setIsEditing(false);
    
    // Actualizar en Keycloak (ejemplo)
    if (keycloak.accountManagement) {
      // Redirigir a la gestión de cuenta de Keycloak
      keycloak.accountManagement();
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
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
    if (keycloak.tokenParsed) {
      const token = keycloak.tokenParsed;
      setUserData({
        firstName: token.given_name || '',
        lastName: token.family_name || '',
        email: token.email || '',
        phone: token.phone || '',
        birthDate: token.birthdate || '',
        address: token.address?.street_address || '',
        city: token.address?.locality || '',
        country: token.address?.country || '',
        preferences: userData.preferences // Mantener preferencias
      });
    }
    setIsEditing(false);
  };

  const handleChangePassword = () => {
    // Redirigir a cambio de contraseña de Keycloak
    if (keycloak.accountManagement) {
      keycloak.accountManagement();
    }
  };
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('es-ES', {
      style: 'currency',
      currency: userData.preferences.currency
    }).format(amount);
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
            </div>
            <div className="avatar-info">
              <h1>{userData.firstName} {userData.lastName}</h1>
              <p className="member-since">Miembro desde Enero 2024</p>
            </div>
          </div>
          
          <div className="header-actions">
            {!isEditing ? (
              <button className="btn btn-edit" onClick={handleEditToggle}>
                <Edit size={18} />
                Editar Perfil
              </button>
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
                    />
                  ) : (
                    <p>{userData.firstName}</p>
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
                    />
                  ) : (
                    <p>{userData.lastName}</p>
                  )}
                </div>
                
                <div className="info-item">
                  <label><Mail size={16} /> Email</label>
                  {isEditing ? (
                    <input
                      type="email"
                      name="email"
                      value={userData.email}
                      onChange={handleInputChange}
                      className="edit-input"
                    />
                  ) : (
                    <p>{userData.email}</p>
                  )}
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
                    <p>{userData.birthDate || 'No especificada'}</p>
                  )}
                </div>
                
                <div className="info-item">
                  <label><MapPin size={16} /> Dirección</label>
                  {isEditing ? (
                    <input
                      type="text"
                      name="address"
                      value={userData.address}
                      onChange={handleInputChange}
                      className="edit-input"
                    />
                  ) : (
                    <p>{userData.address || 'No especificada'}</p>
                  )}
                </div>
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
        </div>
      </div>
    </div>
  );
};

export default UserProfilePage;