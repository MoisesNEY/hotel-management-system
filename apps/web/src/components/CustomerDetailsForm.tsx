import React, { useState } from 'react';
import '../styles/customer-details.css';

interface CustomerDetails {
  gender: 'Male' | 'Female' | 'Other';
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
    <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/>
  </svg>
);

const CalendarIcon = () => (
  <svg className="label-icon" viewBox="0 0 24 24" fill="currentColor">
    <path d="M19 4h-1V2h-2v2H8V2H6v2H5c-1.11 0-1.99.9-1.99 2L3 20c0 1.1.89 2 2 2h14c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 16H5V10h14v10zM9 14H7v-2h2v2zm4 0h-2v-2h2v2zm4 0h-2v-2h2v2zm-8 4H7v-2h2v2zm4 0h-2v-2h2v2zm4 0h-2v-2h2v2z"/>
  </svg>
);

const PhoneIcon = () => (
  <svg className="label-icon" viewBox="0 0 24 24" fill="currentColor">
    <path d="M20 15.5c-1.25 0-2.45-.2-3.57-.57-.35-.11-.74-.03-1.02.24l-2.2 2.2c-2.83-1.44-5.15-3.75-6.59-6.59l2.2-2.21c.28-.26.36-.65.25-1C8.7 6.45 8.5 5.25 8.5 4c0-.55-.45-1-1-1H4c-.55 0-1 .45-1 1 0 9.39 7.61 17 17 17 .55 0 1-.45 1-1v-3.5c0-.55-.45-1-1-1z"/>
  </svg>
);

const IdCardIcon = () => (
  <svg className="label-icon" viewBox="0 0 24 24" fill="currentColor">
    <path d="M20 2H4c-1.1 0-1.99.9-1.99 2L2 22l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zm0 14H5.17L4 17.17V4h16v12zm-6-5c1.65 0 3-1.35 3-3s-1.35-3-3-3-3 1.35-3 3 1.35 3 3 3zm0-4c.55 0 1 .45 1 1s-.45 1-1 1-1-.45-1-1 .45-1 1-1zm-6 8.58c0-1.66 2.69-2.58 5-2.58s5 .92 5 2.58V18H8v-2.42zM12 15c-1.54 0-3.43.34-4.42 1h8.84c-.99-.66-2.88-1-4.42-1z"/>
  </svg>
);

const LocationIcon = () => (
  <svg className="label-icon" viewBox="0 0 24 24" fill="currentColor">
    <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/>
  </svg>
);

const CityIcon = () => (
  <svg className="label-icon" viewBox="0 0 24 24" fill="currentColor">
    <path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-5 14H7v-2h7v2zm3-4H7v-2h10v2zm0-4H7V7h10v2z"/>
  </svg>
);

const GlobeIcon = () => (
  <svg className="label-icon" viewBox="0 0 24 24" fill="currentColor">
    <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 17.93c-3.95-.49-7-3.85-7-7.93 0-.62.08-1.21.21-1.79L9 15v1c0 1.1.9 2 2 2v1.93zm6.9-2.54c-.26-.81-1-1.39-1.9-1.39h-1v-3c0-.55-.45-1-1-1H8v-2h2c.55 0 1-.45 1-1V7h2c1.1 0 2-.9 2-2v-.41c2.93 1.19 5 4.06 5 7.41 0 2.08-.8 3.97-2.1 5.39z"/>
  </svg>
);

const SaveIcon = () => (
  <svg className="btn-icon" viewBox="0 0 24 24" fill="currentColor">
    <path d="M17 3H5c-1.11 0-2 .9-2 2v14c0 1.1.89 2 2 2h14c1.1 0 2-.9 2-2V7l-4-4zm-5 16c-1.66 0-3-1.34-3-3s1.34-3 3-3 3 1.34 3 3-1.34 3-3 3zm3-10H5V5h10v4z"/>
  </svg>
);

const ArrowIcon = () => (
  <svg className="btn-arrow" viewBox="0 0 24 24" fill="currentColor">
    <path d="M12 4l-1.41 1.41L16.17 11H4v2h12.17l-5.58 5.59L12 20l8-8z"/>
  </svg>
);

const StarIcon = () => (
  <svg className="decoration-star" viewBox="0 0 24 24" fill="currentColor">
    <path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z"/>
  </svg>
);

const CustomerDetailsForm: React.FC = () => {
  const [formData, setFormData] = useState<CustomerDetails>({
    gender: 'Male',
    phone: '',
    addressLine1: '',
    city: '',
    country: '',
    licenseId: '',
    birthDate: '',
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Datos del cliente:', formData);
    alert('Formulario enviado!');
  };

  return (
    <div className="customer-bg">
      <div className="hotel-form-wrapper">
        <div className="hotel-form-container">
          <h2 className="hotel-form-title">Detalles</h2>
          <p className="hotel-form-subtitle">
            Complete sus datos para una experiencia personalizada
          </p>

          <form onSubmit={handleSubmit} className="hotel-form">
            <div className="hotel-form-grid">
              <div className="hotel-form-group">
                <label className="hotel-label">
                  <UserIcon /> Género
                </label>
                <div className="hotel-select-wrapper">
                  <select
                    name="gender"
                    value={formData.gender}
                    onChange={handleChange}
                    className="hotel-select"
                    required
                  >
                    <option value="Male">Masculino</option>
                    <option value="Female">Femenino</option>
                    <option value="Other">Otro</option>
                  </select>
                  <div className="select-arrow">▼</div>
                </div>
              </div>

              <div className="hotel-form-group">
                <label className="hotel-label">
                  <CalendarIcon /> Fecha de Nacimiento
                </label>
                <input
                  type="date"
                  name="birthDate"
                  value={formData.birthDate}
                  onChange={handleChange}
                  className="hotel-input"
                  required
                />
              </div>

              <div className="hotel-form-group">
                <label className="hotel-label">
                  <PhoneIcon /> Teléfono
                </label>
                <input
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  className="hotel-input"
                  placeholder="+505 1234 5678"
                  pattern="^\+?[0-9]{7,15}$"
                  required
                />
              </div>

              <div className="hotel-form-group">
                <label className="hotel-label">
                  <IdCardIcon /> DNI / Pasaporte
                </label>
                <input
                  type="text"
                  name="licenseId"
                  value={formData.licenseId}
                  onChange={handleChange}
                  className="hotel-input"
                  placeholder="Número de documento"
                  required
                />
              </div>

              <div className="hotel-form-group full-width">
                <label className="hotel-label">
                  <LocationIcon /> Dirección
                </label>
                <input
                  type="text"
                  name="addressLine1"
                  value={formData.addressLine1}
                  onChange={handleChange}
                  className="hotel-input"
                  placeholder="Calle, número, colonia..."
                  required
                />
              </div>

              <div className="hotel-form-group">
                <label className="hotel-label">
                  <CityIcon /> Ciudad
                </label>
                <input
                  type="text"
                  name="city"
                  value={formData.city}
                  onChange={handleChange}
                  className="hotel-input"
                  placeholder="Ciudad"
                  required
                />
              </div>

              <div className="hotel-form-group">
                <label className="hotel-label">
                  <GlobeIcon /> País
                </label>
                <input
                  type="text"
                  name="country"
                  value={formData.country}
                  onChange={handleChange}
                  className="hotel-input"
                  placeholder="País"
                  required
                />
              </div>
            </div>

            <div className="hotel-form-footer">
              <button type="submit" className="hotel-submit-btn">
                <SaveIcon /> Guardar Información <ArrowIcon />
              </button>
              <p className="form-disclaimer">
                Sus datos están protegidos bajo nuestra política de privacidad
              </p>
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
