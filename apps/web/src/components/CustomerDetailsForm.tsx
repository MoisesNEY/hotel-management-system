// apps/web/src/components/CustomerDetailsForm.tsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { createProfile } from '../services/client/customerDetailsService';
import { type CustomerDetailsCreateRequest } from '../types/clientTypes';

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
  <svg className="w-[18px] h-[18px] fill-[#FFD700]" viewBox="0 0 24 24" fill="currentColor">
    <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" />
  </svg>
);

const CalendarIcon = () => (
  <svg className="w-[18px] h-[18px] fill-[#FFD700]" viewBox="0 0 24 24" fill="currentColor">
    <path d="M19 4h-1V2h-2v2H8V2H6v2H5c-1.11 0-1.99.9-1.99 2L3 20c0 1.1.89 2 2 2h14c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 16H5V10h14v10zM9 14H7v-2h2v2zm4 0h-2v-2h2v2zm4 0h-2v-2h2v2zm-8 4H7v-2h2v2zm4 0h-2v-2h2v2zm4 0h-2v-2h2v2z" />
  </svg>
);

const PhoneIcon = () => (
  <svg className="w-[18px] h-[18px] fill-[#FFD700]" viewBox="0 0 24 24" fill="currentColor">
    <path d="M20 15.5c-1.25 0-2.45-.2-3.57-.57-.35-.11-.74-.03-1.02.24l-2.2 2.2c-2.83-1.44-5.15-3.75-6.59-6.59l2.2-2.21c.28-.26.36-.65.25-1C8.7 6.45 8.5 5.25 8.5 4c0-.55-.45-1-1-1H4c-.55 0-1 .45-1 1 0 9.39 7.61 17 17 17 .55 0 1-.45 1-1v-3.5c0-.55-.45-1-1-1z" />
  </svg>
);

const IdCardIcon = () => (
  <svg className="w-[18px] h-[18px] fill-[#FFD700]" viewBox="0 0 24 24" fill="currentColor">
    <path d="M20 2H4c-1.1 0-1.99.9-1.99 2L2 22l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zm0 14H5.17L4 17.17V4h16v12zm-6-5c1.65 0 3-1.35 3-3s-1.35-3-3-3-3 1.35-3 3 1.35 3 3 3zm0-4c.55 0 1 .45 1 1s-.45 1-1 1-1-.45-1-1 .45-1 1-1zm-6 8.58c0-1.66 2.69-2.58 5-2.58s5 .92 5 2.58V18H8v-2.42zM12 15c-1.54 0-3.43.34-4.42 1h8.84c-.99-.66-2.88-1-4.42-1z" />
  </svg>
);

const LocationIcon = () => (
  <svg className="w-[18px] h-[18px] fill-[#FFD700]" viewBox="0 0 24 24" fill="currentColor">
    <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z" />
  </svg>
);

const CityIcon = () => (
  <svg className="w-[18px] h-[18px] fill-[#FFD700]" viewBox="0 0 24 24" fill="currentColor">
    <path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-5 14H7v-2h7v2zm3-4H7v-2h10v2zm0-4H7V7h10v2z" />
  </svg>
);

const GlobeIcon = () => (
  <svg className="w-[18px] h-[18px] fill-[#FFD700]" viewBox="0 0 24 24" fill="currentColor">
    <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 17.93c-3.95-.49-7-3.85-7-7.93 0-.62.08-1.21.21-1.79L9 15v1c0 1.1.9 2 2 2v1.93zm6.9-2.54c-.26-.81-1-1.39-1.9-1.39h-1v-3c0-.55-.45-1-1-1H8v-2h2c.55 0 1-.45 1-1V7h2c1.1 0 2-.9 2-2v-.41c2.93 1.19 5 4.06 5 7.41 0 2.08-.8 3.97-2.1 5.39z" />
  </svg>
);

const SaveIcon = () => (
  <svg className="w-5 h-5 fill-white" viewBox="0 0 24 24" fill="currentColor">
    <path d="M17 3H5c-1.11 0-2 .9-2 2v14c0 1.1.89 2 2 2h14c1.1 0 2-.9 2-2V7l-4-4zm-5 16c-1.66 0-3-1.34-3-3s1.34-3 3-3 3 1.34 3 3-1.34 3-3 3zm3-10H5V5h10v4z" />
  </svg>
);

const ArrowIcon = () => (
  <svg className="w-5 h-5 fill-white transition-transform duration-300" viewBox="0 0 24 24" fill="currentColor">
    <path d="M12 4l-1.41 1.41L16.17 11H4v2h12.17l-5.58 5.59L12 20l8-8z" />
  </svg>
);

const StarIcon = () => (
  <svg className="w-5 h-5 fill-[rgba(100,150,255,0.3)] animate-[float_3s_infinite_ease-in-out]" viewBox="0 0 24 24" fill="currentColor">
    <path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z" />
  </svg>
);

const WarningIcon = () => (
  <svg className="w-9 h-9 text-white" viewBox="0 0 24 24" fill="currentColor">
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

      const customerDetailsPayload: CustomerDetailsCreateRequest = {
        gender: formData.gender,
        phone: formData.phone,
        addressLine1: formData.addressLine1,
        city: formData.city,
        country: formData.country,
        licenseId: formData.licenseId,
        birthDate: formData.birthDate
      };

      await createProfile(customerDetailsPayload);

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
    sessionStorage.setItem('skip_customer_details', 'true');
    navigate('/');
  };

  const handleSkipCancel = () => {
    setShowSkipModal(false);
  };

  return (
    <div className="min-h-screen font-sans relative overflow-x-hidden" style={{ background: `radial-gradient(ellipse at 20% 20%, rgba(10, 20, 60, 0.3) 0%, transparent 70%), radial-gradient(ellipse at 80% 80%, rgba(20, 40, 100, 0.3) 0%, transparent 70%), linear-gradient(135deg, #0a143c 0%, #1a2b5c 50%, #0f1a40 100%)` }}>
      {/* Modal para omitir información */}
      {showSkipModal && (
        <div className="fixed inset-0 w-full h-full bg-black/70 backdrop-blur-sm flex justify-center items-center z-[10000] animate-[fadeInOverlay_0.3s_ease]">
          <div className="bg-gradient-to-br from-[#fff9ed] to-[#fff1e6] rounded-2xl p-9 w-[90%] max-w-[520px] shadow-[0_25px_50px_-12px_rgba(0,0,0,0.35)] relative border-[3px] border-[#ffb347] animate-[slideInModal_0.4s_cubic-bezier(0.175,0.885,0.32,1.275)]">
            <div className="text-center mb-6 pb-5 border-b-2 border-[#ffe4cc]">
              <div className="w-[70px] h-[70px] mx-auto mb-4 bg-gradient-to-br from-[#ff8a00] to-[#ff5e00] rounded-full flex items-center justify-center shadow-[0_8px_25px_rgba(255,94,0,0.3)] animate-[pulseIcon_2s_infinite]">
                <WarningIcon />
              </div>
              <h3 className="text-[#d44000] text-2xl font-extrabold m-0 uppercase tracking-wide text-shadow-[0_2px_4px_rgba(0,0,0,0.1)]">¡Advertencia Importante!</h3>
            </div>

            <div className="mb-8">
              <p className="text-base leading-relaxed text-[#5a3c1c] mb-6 text-center p-4 bg-white/70 rounded-xl border-l-4 border-[#ff5e00]">
                Si omites esta información, <strong>no podrás acceder a todas las funciones</strong> del sistema.
              </p>

              <div className="text-center p-4 bg-gradient-to-br from-[#fff4e6] to-[#ffe8d1] rounded-xl border-2 border-[#ffb347]">
                <p>¿Estás seguro de que deseas continuar sin completar tu información?</p>
              </div>
            </div>

            <div className="flex gap-5 justify-center mt-2.5">
              <button
                className="px-8 py-4 border-none rounded-xl text-base font-bold cursor-pointer transition-all duration-300 min-w-[200px] flex items-center justify-center uppercase tracking-wide relative overflow-hidden bg-gradient-to-br from-[#2ecc71] to-[#27ae60] text-white shadow-[0_6px_20px_rgba(46,204,113,0.3)] hover:-translate-y-1 hover:shadow-[0_10px_30px_rgba(46,204,113,0.4)] disabled:opacity-60 disabled:cursor-not-allowed"
                onClick={handleSkipCancel}
                disabled={isSubmitting}
              >
                <span>Cancelar y Completar</span>
              </button>
              <button
                className="px-8 py-4 border-none rounded-xl text-base font-bold cursor-pointer transition-all duration-300 min-w-[200px] flex items-center justify-center uppercase tracking-wide relative overflow-hidden bg-gradient-to-br from-[#e74c3c] to-[#c0392b] text-white shadow-[0_6px_20px_rgba(231,76,60,0.3)] hover:-translate-y-1 hover:shadow-[0_10px_30px_rgba(231,76,60,0.4)] disabled:opacity-60 disabled:cursor-not-allowed"
                onClick={handleSkipConfirm}
                disabled={isSubmitting}
              >
                <span>Sí, Omitir por Ahora</span>
              </button>
            </div>

            <button
              className="absolute top-5 right-5 bg-white/90 border-2 border-[#ffcc99] w-10 h-10 rounded-full text-2xl text-[#ff5e00] cursor-pointer flex items-center justify-center transition-all duration-300 z-10 hover:bg-[#ff5e00] hover:text-white hover:border-[#ff5e00] hover:rotate-90"
              onClick={handleSkipCancel}
              aria-label="Cerrar"
            >
              ×
            </button>
          </div>
        </div>
      )}

      <div className="relative z-10 min-h-screen flex items-center justify-center p-5">
        <div className="w-full max-w-[800px] bg-white dark:bg-navy-default/90 backdrop-blur-[10px] rounded-3xl p-10 border border-[rgba(100,150,255,0.1)] shadow-[0_20px_40px_rgba(0,10,30,0.4)] relative overflow-hidden">
          <div className="text-center mb-10">
            <h2 className="text-white text-3xl font-light tracking-wide mb-2.5 flex items-center justify-center gap-4">¡Información Requerida!</h2>
            <p className="text-[rgba(200,220,255,0.7)] text-base font-light tracking-wide text-center mx-auto max-w-[500px]">
              Completa tus datos personales para acceder a todas las funciones del sistema
            </p>
            <div className="mt-4">
              <div className="inline-block bg-yellow-500/20 border border-yellow-500/40 text-yellow-300 px-4 py-2 rounded-lg text-sm font-semibold">
                ⚠️ Obligatorio para nuevos usuarios
              </div>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-10">
              <div className="flex flex-col gap-3 relative">
                <label className="text-[rgba(220,230,255,0.9)] text-sm font-medium tracking-wider uppercase flex items-center gap-2.5">
                  <UserIcon /> Género *
                </label>
                <div className="relative">
                  <select
                    name="gender"
                    value={formData.gender}
                    onChange={handleChange}
                    className="px-4 py-4 pl-12 bg-[rgba(10,20,45,0.6)] border border-[rgba(100,150,255,0.2)] rounded-xl text-white text-base w-full cursor-pointer transition-all duration-300 outline-none appearance-none focus:border-[rgba(100,150,255,0.6)] focus:shadow-[0_0_0_3px_rgba(100,150,255,0.1)] focus:bg-[rgba(10,20,45,0.8)]"
                    required
                    disabled={isSubmitting}
                  >
                    <option value="MALE">Masculino</option>
                    <option value="FEMALE">Femenino</option>
                    <option value="OTHER">Otro</option>
                  </select>
                  <div className="absolute right-5 top-1/2 -translate-y-1/2 text-[rgba(200,220,255,0.6)] pointer-events-none text-xs">▼</div>
                </div>
              </div>

              <div className="flex flex-col gap-3 relative">
                <label className="text-[rgba(220,230,255,0.9)] text-sm font-medium tracking-wider uppercase flex items-center gap-2.5">
                  <CalendarIcon /> Fecha de Nacimiento *
                </label>
                <input
                  type="date"
                  name="birthDate"
                  value={formData.birthDate}
                  onChange={handleChange}
                  className="px-4 py-4 pl-12 bg-[rgba(10,20,45,0.6)] border border-[rgba(100,150,255,0.2)] rounded-xl text-white text-base transition-all duration-300 outline-none focus:border-[#FFD700] focus:shadow-[0_0_0_3px_rgba(100,150,255,0.1)] focus:bg-[rgba(10,20,45,0.8)] placeholder:text-[rgba(200,220,255,0.4)]"
                  required
                  disabled={isSubmitting}
                  max={new Date().toISOString().split('T')[0]}
                />
              </div>

              <div className="flex flex-col gap-3 relative">
                <label className="text-[rgba(220,230,255,0.9)] text-sm font-medium tracking-wider uppercase flex items-center gap-2.5">
                  <PhoneIcon /> Teléfono *
                </label>
                <input
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  className="px-4 py-4 pl-12 bg-[rgba(10,20,45,0.6)] border border-[rgba(100,150,255,0.2)] rounded-xl text-white text-base transition-all duration-300 outline-none focus:border-[#FFD700] focus:shadow-[0_0_0_3px_rgba(100,150,255,0.1)] focus:bg-[rgba(10,20,45,0.8)] placeholder:text-[rgba(200,220,255,0.4)]"
                  placeholder="+505 1234 5678"
                  pattern="[\+]?[0-9\s\-]{6,20}"
                  required
                  disabled={isSubmitting}
                />
                <small className="text-[rgba(200,220,255,0.5)] text-xs mt-1">Ejemplo: +505 8765 4321</small>



              </div>

              <div className="flex flex-col gap-3 relative">
                <label className="text-[rgba(220,230,255,0.9)] text-sm font-medium tracking-wider uppercase flex items-center gap-2.5">
                  <IdCardIcon /> DNI / Pasaporte *
                </label>
                <input
                  type="text"
                  name="licenseId"
                  value={formData.licenseId}
                  onChange={handleChange}
                  className="px-4 py-4 pl-12 bg-[rgba(10,20,45,0.6)] border border-[rgba(100,150,255,0.2)] rounded-xl text-white text-base transition-all duration-300 outline-none focus:border-[#FFD700] focus:shadow-[0_0_0_3px_rgba(100,150,255,0.1)] focus:bg-[rgba(10,20,45,0.8)] placeholder:text-[rgba(200,220,255,0.4)]"
                  placeholder="Número de documento"
                  required
                  disabled={isSubmitting}
                />
              </div>

              <div className="flex flex-col gap-3 relative col-span-full">
                <label className="text-[rgba(220,230,255,0.9)] text-sm font-medium tracking-wider uppercase flex items-center gap-2.5">
                  <LocationIcon /> Dirección *
                </label>
                <input
                  type="text"
                  name="addressLine1"
                  value={formData.addressLine1}
                  onChange={handleChange}
                  className="px-4 py-4 pl-12 bg-[rgba(10,20,45,0.6)] border border-[rgba(100,150,255,0.2)] rounded-xl text-white text-base transition-all duration-300 outline-none focus:border-[#FFD700] focus:shadow-[0_0_0_3px_rgba(100,150,255,0.1)] focus:bg-[rgba(10,20,45,0.8)] placeholder:text-[rgba(200,220,255,0.4)]"
                  placeholder="Calle, número, colonia..."
                  required
                  disabled={isSubmitting}
                />
              </div>

              <div className="flex flex-col gap-3 relative">
                <label className="text-[rgba(220,230,255,0.9)] text-sm font-medium tracking-wider uppercase flex items-center gap-2.5">
                  <CityIcon /> Ciudad *
                </label>
                <input
                  type="text"
                  name="city"
                  value={formData.city}
                  onChange={handleChange}
                  className="px-4 py-4 pl-12 bg-[rgba(10,20,45,0.6)] border border-[rgba(100,150,255,0.2)] rounded-xl text-white text-base transition-all duration-300 outline-none focus:border-[#FFD700] focus:shadow-[0_0_0_3px_rgba(100,150,255,0.1)] focus:bg-[rgba(10,20,45,0.8)] placeholder:text-[rgba(200,220,255,0.4)]"
                  placeholder="Ciudad"
                  required
                  disabled={isSubmitting}
                />
              </div>

              <div className="flex flex-col gap-3 relative">
                <label className="text-[rgba(220,230,255,0.9)] text-sm font-medium tracking-wider uppercase flex items-center gap-2.5">
                  <GlobeIcon /> País *
                </label>
                <input
                  type="text"
                  name="country"
                  value={formData.country}
                  onChange={handleChange}
                  className="px-4 py-4 pl-12 bg-[rgba(10,20,45,0.6)] border border-[rgba(100,150,255,0.2)] rounded-xl text-white text-base transition-all duration-300 outline-none focus:border-[#FFD700] focus:shadow-[0_0_0_3px_rgba(100,150,255,0.1)] focus:bg-[rgba(10,20,45,0.8)] placeholder:text-[rgba(200,220,255,0.4)]"
                  placeholder="País"
                  required
                  disabled={isSubmitting}
                />
              </div>
            </div>

            <div className="text-center">
              <button
                type="submit"
                className="px-10 py-4 bg-[#FFD700] border-none rounded-xl text-white text-base font-medium tracking-wide cursor-pointer transition-all duration-300 inline-flex items-center gap-3 relative overflow-hidden mb-5 hover:bg-[#FFC700] hover:-translate-y-0.5 hover:shadow-[0_6px_20px_rgba(255,215,0,0.4)]"
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <>
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                    Guardando...
                  </>
                ) : (
                  <>
                    <SaveIcon /> Guardar Información <ArrowIcon />
                  </>
                )}
              </button>
              <p className="text-[rgba(200,220,255,0.5)] text-sm font-light tracking-wide">
                * Campos obligatorios. Tus datos están protegidos bajo nuestra política de privacidad
              </p>
              <button
                type="button"
                className="mt-5 px-7 py-3.5 bg-gradient-to-br from-[#95a5a6] to-[#7f8c8d] text-white border-none rounded-xl text-base font-semibold cursor-pointer transition-all duration-300 w-full max-w-[300px] mx-auto block relative overflow-hidden uppercase tracking-wide hover:bg-gradient-to-br hover:from-[#7f8c8d] hover:to-[#6c7b7d] hover:-translate-y-0.5 hover:shadow-[0_8px_25px_rgba(149,165,166,0.4)] disabled:opacity-60 disabled:cursor-not-allowed"
                onClick={handleSkipClick}
                disabled={isSubmitting}
              >
                Completar después
              </button>
            </div>
          </form>

          <div className="absolute top-5 right-5 flex gap-2.5">
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









