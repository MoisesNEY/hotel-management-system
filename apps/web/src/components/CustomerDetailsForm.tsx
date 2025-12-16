// apps/web/src/components/CustomerDetailsForm.tsx
import React, { useState, useEffect } from 'react';
import '../styles/customer-details.css';
import { useNavigate } from 'react-router-dom';
import { apiPost } from '../services/api';

interface CustomerDetails {
  gender: 'MALE' | 'FEMALE' | 'OTHER';
  phone: string;
  addressLine1: string;
  city: string;
  country: string;
  licenseId: string;
  birthDate: string;
}

// Iconos SVG
const UserIcon = () => (
  <svg className="label-icon" viewBox="0 0 24 24" fill="currentColor">
    <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" />
  </svg>
);

const CalendarIcon = () => (
  <svg className="label-icon" viewBox="0 0 24 24" fill="currentColor">
    <path d="M19 4h-1V2h-2v2H8V2H6v2H5c-1.11 0-1.99.9-1.99 2L3 20c0 1.1.89 2 2 2h14c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 16H5V10h14v10zM9 14H7v-2h2v2zm4 0h-2v-2h2v2zm4 0h-2v-2h2v2zm-8 4H7v-2h2v2zm4 0h-2v-2h2v2zm4 0h-2v-2h2v2z" />
  </svg>
);

const PhoneIcon = () => (
  <svg className="label-icon" viewBox="0 0 24 24" fill="currentColor">
    <path d="M20 15.5c-1.25 0-2.45-.2-3.57-.57-.35-.11-.74-.03-1.02.24l-2.2 2.2c-2.83-1.44-5.15-3.75-6.59-6.59l2.2-2.21c.28-.26.36-.65.25-1C8.7 6.45 8.5 5.25 8.5 4c0-.55-.45-1-1-1H4c-.55 0-1 .45-1 1 0 9.39 7.61 17 17 17 .55 0 1-.45 1-1v-3.5c0-.55-.45-1-1-1z" />
  </svg>
);

const IdCardIcon = () => (
  <svg className="label-icon" viewBox="0 0 24 24" fill="currentColor">
    <path d="M20 2H4c-1.1 0-1.99.9-1.99 2L2 22l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zm0 14H5.17L4 17.17V4h16v12zm-6-5c1.65 0 3-1.35 3-3s-1.35-3-3-3-3 1.35-3 3 1.35 3 3 3zm0-4c.55 0 1 .45 1 1s-.45 1-1 1-1-.45-1-1 .45-1 1-1zm-6 8.58c0-1.66 2.69-2.58 5-2.58s5 .92 5 2.58V18H8v-2.42zM12 15c-1.54 0-3.43.34-4.42 1h8.84c-.99-.66-2.88-1-4.42-1z" />
  </svg>
);

const LocationIcon = () => (
  <svg className="label-icon" viewBox="0 0 24 24" fill="currentColor">
    <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z" />
  </svg>
);

const CityIcon = () => (
  <svg className="label-icon" viewBox="0 0 24 24" fill="currentColor">
    <path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-5 14H7v-2h7v2zm3-4H7v-2h10v2zm0-4H7V7h10v2z" />
  </svg>
);

const GlobeIcon = () => (
  <svg className="label-icon" viewBox="0 0 24 24" fill="currentColor">
    <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 17.93c-3.95-.49-7-3.85-7-7.93 0-.62.08-1.21.21-1.79L9 15v1c0 1.1.9 2 2 2v1.93zm6.9-2.54c-.26-.81-1-1.39-1.9-1.39h-1v-3c0-.55-.45-1-1-1H8v-2h2c.55 0 1-.45 1-1V7h2c1.1 0 2-.9 2-2v-.41c2.93 1.19 5 4.06 5 7.41 0 2.08-.8 3.97-2.1 5.39z" />
  </svg>
);

const SaveIcon = () => (
  <svg className="btn-icon" viewBox="0 0 24 24" fill="currentColor">
    <path d="M17 3H5c-1.11 0-2 .9-2 2v14c0 1.1.89 2 2 2h14c1.1 0 2-.9 2-2V7l-4-4zm-5 16c-1.66 0-3-1.34-3-3s1.34-3 3-3 3 1.34 3 3-1.34 3-3 3zm3-10H5V5h10v4z" />
  </svg>
);

const ArrowIcon = () => (
  <svg className="btn-arrow" viewBox="0 0 24 24" fill="currentColor">
    <path d="M12 4l-1.41 1.41L16.17 11H4v2h12.17l-5.58 5.59L12 20l8-8z" />
  </svg>
);

const StarIcon = () => (
  <svg className="decoration-star" viewBox="0 0 24 24" fill="currentColor">
    <path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z" />
  </svg>
);

const WarningIcon = () => (
  <svg className="warning-icon-svg" viewBox="0 0 24 24" fill="currentColor">
    <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z" />
  </svg>
);

const CustomerDetailsForm: React.FC = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState<CustomerDetails>({
    gender: 'MALE',
    phone: '',
    addressLine1: '',
    city: '',
    country: '',
    licenseId: '',
    birthDate: '',
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSkipModal, setShowSkipModal] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      if (!formData.phone || !formData.addressLine1 || !formData.city ||
        !formData.country || !formData.licenseId || !formData.birthDate) {
        alert('Por favor completa todos los campos obligatorios');
        setIsSubmitting(false);
        return;
      }

      const customerDetailsPayload = {
        gender: formData.gender,
        phone: formData.phone,
        addressLine1: formData.addressLine1,
        city: formData.city,
        country: formData.country,
        licenseId: formData.licenseId,
        birthDate: formData.birthDate
      };

      await apiPost('/api/client/customer-details', customerDetailsPayload);

      localStorage.setItem('userData', JSON.stringify(customerDetailsPayload));
      localStorage.setItem('hasCompletedExtraInfo', 'true');

      setTimeout(() => {
        navigate('/profile');
      }, 0);

    } catch (error) {
      console.error('Error al guardar datos:', error);
      alert('Hubo un error al guardar la información. Por favor intenta nuevamente.');
    } finally {
      
    }
  };

  // Función para obtener datos guardados si existen
  const loadSavedData = () => {
    const savedData = localStorage.getItem('userData');
    if (savedData) {
      const parsedData = JSON.parse(savedData);
      setFormData({
        gender: parsedData.gender || 'Male',
        phone: parsedData.phone || '',
        addressLine1: parsedData.address || '',
        city: parsedData.city || '',
        country: parsedData.country || '',
        licenseId: parsedData.licenseId || '',
        birthDate: parsedData.birthDate || ''
      });
    }
  };

  // Cargar datos guardados al montar el componente
  useEffect(() => {
    loadSavedData();
  }, []);

  const handleSkipClick = () => {
    setShowSkipModal(true);
  };

  const handleSkipConfirm = () => {
    setShowSkipModal(false);
    navigate('/');
  };

  const handleSkipCancel = () => {
    setShowSkipModal(false);
  };

  return (
    <div className="customer-bg">
      {/* Modal para omitir información */}
      {showSkipModal && (
        <div className="skip-modal-overlay">
          <div className="skip-modal">
            <div className="skip-modal-header">
              <div className="skip-modal-icon">
                <WarningIcon />
              </div>
              <h3 className="skip-modal-title">¡Advertencia Importante!</h3>
            </div>

            <div className="skip-modal-body">
              <p className="skip-modal-message">
                Si omites esta información, <strong>no podrás acceder a todas las funciones</strong> del sistema.
              </p>

              <div className="skip-modal-question">
                <p>¿Estás seguro de que deseas continuar sin completar tu información?</p>
              </div>
            </div>

            <div className="skip-modal-footer">
              <button
                className="skip-modal-btn skip-modal-btn-cancel"
                onClick={handleSkipCancel}
                disabled={isSubmitting}
              >
                <span>Cancelar y Completar</span>
              </button>
              <button
                className="skip-modal-btn skip-modal-btn-confirm"
                onClick={handleSkipConfirm}
                disabled={isSubmitting}
              >
                <span>Sí, Omitir por Ahora</span>
              </button>
            </div>

            <button
              className="skip-modal-close"
              onClick={handleSkipCancel}
              aria-label="Cerrar"
            >
              ×
            </button>
          </div>
        </div>
      )}

      <div className="hotel-form-wrapper">
        <div className="hotel-form-container">
          <div className="form-header">
            <h2 className="hotel-form-title">¡Información Requerida!</h2>
            <p className="hotel-form-subtitle">
              Completa tus datos personales para acceder a todas las funciones del sistema
            </p>
            <div className="form-importance">
              <div className="importance-badge">
                ⚠️ Obligatorio para nuevos usuarios
              </div>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="hotel-form">
            <div className="hotel-form-grid">
              <div className="hotel-form-group">
                <label className="hotel-label">
                  <UserIcon /> Género *
                </label>
                <div className="hotel-select-wrapper">
                  <select
                    name="gender"
                    value={formData.gender}
                    onChange={handleChange}
                    className="hotel-select"
                    required
                    disabled={isSubmitting}
                  >
                    <option value="MALE">Masculino</option>
                    <option value="FEMALE">Femenino</option>
                    <option value="OTHER">Otro</option>
                  </select>
                  <div className="select-arrow">▼</div>
                </div>
              </div>

              <div className="hotel-form-group">
                <label className="hotel-label">
                  <CalendarIcon /> Fecha de Nacimiento *
                </label>
                <input
                  type="date"
                  name="birthDate"
                  value={formData.birthDate}
                  onChange={handleChange}
                  className="hotel-input"
                  required
                  disabled={isSubmitting}
                  max={new Date().toISOString().split('T')[0]}
                />
              </div>

              <div className="hotel-form-group">
                <label className="hotel-label">
                  <PhoneIcon /> Teléfono *
                </label>
                <input
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  className="hotel-input"
                  placeholder="+505 1234 5678"
                  pattern="[\+]?[0-9\s\-]{6,20}"
                  required
                  disabled={isSubmitting}
                />
                <small className="input-hint">Ejemplo: +505 8765 4321</small>



              </div>

              <div className="hotel-form-group">
                <label className="hotel-label">
                  <IdCardIcon /> DNI / Pasaporte *
                </label>
                <input
                  type="text"
                  name="licenseId"
                  value={formData.licenseId}
                  onChange={handleChange}
                  className="hotel-input"
                  placeholder="Número de documento"
                  required
                  disabled={isSubmitting}
                />
              </div>

              <div className="hotel-form-group full-width">
                <label className="hotel-label">
                  <LocationIcon /> Dirección *
                </label>
                <input
                  type="text"
                  name="addressLine1"
                  value={formData.addressLine1}
                  onChange={handleChange}
                  className="hotel-input"
                  placeholder="Calle, número, colonia..."
                  required
                  disabled={isSubmitting}
                />
              </div>

              <div className="hotel-form-group">
                <label className="hotel-label">
                  <CityIcon /> Ciudad *
                </label>
                <input
                  type="text"
                  name="city"
                  value={formData.city}
                  onChange={handleChange}
                  className="hotel-input"
                  placeholder="Ciudad"
                  required
                  disabled={isSubmitting}
                />
              </div>

              <div className="hotel-form-group">
                <label className="hotel-label">
                  <GlobeIcon /> País *
                </label>
                <input
                  type="text"
                  name="country"
                  value={formData.country}
                  onChange={handleChange}
                  className="hotel-input"
                  placeholder="País"
                  required
                  disabled={isSubmitting}
                />
              </div>
            </div>

            <div className="hotel-form-footer">
              <button
                type="submit"
                className="hotel-submit-btn"
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <>
                    <div className="spinner"></div>
                    Guardando...
                  </>
                ) : (
                  <>
                    <SaveIcon /> Guardar Información <ArrowIcon />
                  </>
                )}
              </button>
              <p className="form-disclaimer">
                * Campos obligatorios. Tus datos están protegidos bajo nuestra política de privacidad
              </p>
              <button
                type="button"
                className="skip-btn"
                onClick={handleSkipClick}
                disabled={isSubmitting}
              >
                Completar después
              </button>
            </div>
          </form>

          <div className="hotel-decoration">
            <StarIcon />
            <StarIcon />
            <StarIcon />
          </div>
        </div>
      </div>
    </div>
  );
};

export default CustomerDetailsForm;