import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  User, Calendar, Phone, CreditCard, 
  MapPin, Globe, Save, ArrowRight, 
  AlertCircle, X, CheckCircle2 
} from 'lucide-react';
import { createProfile } from '../services/client/customerDetailsService';
import { type CustomerDetailsCreateRequest } from '../types/clientTypes';

const CustomerDetailsForm: React.FC = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState<CustomerDetailsCreateRequest>({
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
  const [feedback, setFeedback] = useState<{ show: boolean, type: 'success' | 'error', message: string }>({
    show: false,
    type: 'success',
    message: ''
  });

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
        setFeedback({ show: true, type: 'error', message: 'Por favor completa todos los campos obligatorios' });
        setIsSubmitting(false);
        return;
      }

      await createProfile(formData);

      localStorage.setItem('userData', JSON.stringify(formData));
      localStorage.setItem('hasCompletedExtraInfo', 'true');
      setFeedback({ show: true, type: 'success', message: 'Información guardada correctamente. Redirigiendo...' });

      setTimeout(() => {
        navigate('/profile', { state: { profileJustCreated: true } });
      }, 2000);

    } catch (error: any) {
      console.error('Error al guardar datos:', error);
      const msg = error.response?.data?.detail || 'Hubo un error al guardar la información.';
      setFeedback({ show: true, type: 'error', message: msg });
    } finally {
      setIsSubmitting(false);
    }
  };

  const loadSavedData = () => {
    const savedData = localStorage.getItem('userData');
    if (savedData) {
      try {
        const parsedData = JSON.parse(savedData);
        setFormData(prev => ({
          ...prev,
          gender: parsedData.gender || 'MALE',
          phone: parsedData.phone || '',
          addressLine1: parsedData.address || parsedData.addressLine1 || '',
          city: parsedData.city || '',
          country: parsedData.country || '',
          licenseId: parsedData.licenseId || '',
          birthDate: parsedData.birthDate || ''
        }));
      } catch (e) {
        console.error("Error parsing saved data", e);
      }
    }
  };

  useEffect(() => {
    loadSavedData();
  }, []);

  return (
    <div className="min-h-screen bg-navy-darker flex items-center justify-center p-6 relative overflow-hidden">
      {/* Background elements */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-gold-default/5 blur-[120px] rounded-full" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-blue-500/5 blur-[120px] rounded-full" />
      </div>

      <div className="w-full max-w-2xl bg-navy-default/40 backdrop-blur-xl border border-white/10 rounded-[2.5rem] p-8 md:p-12 shadow-2xl relative z-10 animate-in fade-in zoom-in duration-500">
        <div className="text-center mb-10">
          <div className="inline-flex items-center justify-center p-4 bg-gold-default/10 rounded-2xl mb-6">
            <User size={32} className="text-gold-default" />
          </div>
          <h2 className="text-3xl font-bold text-white mb-3">Tu Perfil Noir</h2>
          <p className="text-gray-400 text-sm max-w-md mx-auto">
            Completa tu información de perfil para disfrutar de una experiencia personalizada en Gran Hotel Antigravity.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Género */}
            <div className="space-y-2">
              <label className="text-xs font-bold uppercase tracking-widest text-gold-default/80 ml-1 flex items-center gap-2">
                <User size={14} /> Género
              </label>
              <div className="relative group">
                <select
                  name="gender"
                  value={formData.gender}
                  onChange={handleChange}
                  className="w-full h-12 px-4 bg-white/5 border border-white/10 rounded-xl text-white outline-none focus:border-gold-default/50 focus:ring-1 focus:ring-gold-default/20 transition-all appearance-none cursor-pointer"
                  required
                >
                  <option value="MALE" className="bg-navy-default text-white">Masculino</option>
                  <option value="FEMALE" className="bg-navy-default text-white">Femenino</option>
                  <option value="OTHER" className="bg-navy-default text-white">Otro</option>
                </select>
                <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-gray-500 group-hover:text-gold-default transition-colors">
                  <ArrowRight size={16} className="rotate-90" />
                </div>
              </div>
            </div>

            {/* Fecha Nacimiento */}
            <div className="space-y-2">
              <label className="text-xs font-bold uppercase tracking-widest text-gold-default/80 ml-1 flex items-center gap-2">
                <Calendar size={14} /> Fecha de Nacimiento
              </label>
              <input
                type="date"
                name="birthDate"
                value={formData.birthDate}
                onChange={handleChange}
                className="w-full h-12 px-4 bg-white/5 border border-white/10 rounded-xl text-white outline-none focus:border-gold-default/50 focus:ring-1 focus:ring-gold-default/20 transition-all [color-scheme:dark]"
                required
                max={new Date().toISOString().split('T')[0]}
              />
            </div>

            {/* Teléfono */}
            <div className="space-y-2">
              <label className="text-xs font-bold uppercase tracking-widest text-gold-default/80 ml-1 flex items-center gap-2">
                <Phone size={14} /> Teléfono
              </label>
              <input
                type="tel"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                className="w-full h-12 px-4 bg-white/5 border border-white/10 rounded-xl text-white outline-none focus:border-gold-default/50 focus:ring-1 focus:ring-gold-default/20 transition-all"
                placeholder="+505 0000 0000"
                required
              />
            </div>

            {/* DNI */}
            <div className="space-y-2">
              <label className="text-xs font-bold uppercase tracking-widest text-gold-default/80 ml-1 flex items-center gap-2">
                <CreditCard size={14} /> DNI / Cédula
              </label>
              <input
                type="text"
                name="licenseId"
                value={formData.licenseId}
                onChange={handleChange}
                className="w-full h-12 px-4 bg-white/5 border border-white/10 rounded-xl text-white outline-none focus:border-gold-default/50 focus:ring-1 focus:ring-gold-default/20 transition-all"
                placeholder="Número de documento"
                required
              />
            </div>

            {/* Dirección - Span Full */}
            <div className="space-y-2 md:col-span-2">
              <label className="text-xs font-bold uppercase tracking-widest text-gold-default/80 ml-1 flex items-center gap-2">
                <MapPin size={14} /> Dirección
              </label>
              <input
                type="text"
                name="addressLine1"
                value={formData.addressLine1}
                onChange={handleChange}
                className="w-full h-12 px-4 bg-white/5 border border-white/10 rounded-xl text-white outline-none focus:border-gold-default/50 focus:ring-1 focus:ring-gold-default/20 transition-all"
                placeholder="Calle, número, ciudad..."
                required
              />
            </div>

            {/* Ciudad */}
            <div className="space-y-2">
              <label className="text-xs font-bold uppercase tracking-widest text-gold-default/80 ml-1 flex items-center gap-2">
                <Globe size={14} /> Ciudad
              </label>
              <input
                type="text"
                name="city"
                value={formData.city}
                onChange={handleChange}
                className="w-full h-12 px-4 bg-white/5 border border-white/10 rounded-xl text-white outline-none focus:border-gold-default/50 focus:ring-1 focus:ring-gold-default/20 transition-all"
                placeholder="Ciudad"
                required
              />
            </div>

            {/* País */}
            <div className="space-y-2">
              <label className="text-xs font-bold uppercase tracking-widest text-gold-default/80 ml-1 flex items-center gap-2">
                <Globe size={14} /> País
              </label>
              <input
                type="text"
                name="country"
                value={formData.country}
                onChange={handleChange}
                className="w-full h-12 px-4 bg-white/5 border border-white/10 rounded-xl text-white outline-none focus:border-gold-default/50 focus:ring-1 focus:ring-gold-default/20 transition-all"
                placeholder="País"
                required
              />
            </div>
          </div>

          <div className="pt-6 flex flex-col gap-4">
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full h-14 bg-gradient-to-r from-gold-default to-gold-dark text-navy-default font-bold rounded-2xl flex items-center justify-center gap-3 hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-50 disabled:hover:scale-100 shadow-lg shadow-gold-default/20"
            >
              {isSubmitting ? (
                <div className="animate-spin rounded-full h-6 w-6 border-2 border-navy-default/20 border-t-navy-default" />
              ) : (
                <>
                  <Save size={20} /> Guardar Perfil
                </>
              )}
            </button>

            <button
              type="button"
              onClick={() => setShowSkipModal(true)}
              className="w-full h-12 bg-white/5 text-gray-400 font-medium rounded-xl hover:bg-white/10 transition-colors"
            >
              Completar luego
            </button>
          </div>
        </form>
      </div>

      {/* Skip Modal */}
      {showSkipModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 backdrop-blur-md bg-navy-darker/60">
          <div className="w-full max-w-md bg-navy-default border border-white/10 rounded-[2rem] p-8 shadow-2xl animate-in fade-in slide-in-from-bottom-5">
            <div className="flex flex-col items-center text-center space-y-6">
              <div className="w-16 h-16 bg-amber-500/10 rounded-full flex items-center justify-center text-amber-500">
                <AlertCircle size={32} />
              </div>
              <div className="space-y-2">
                <h3 className="text-xl font-bold text-white">¿Omitir ahora?</h3>
                <p className="text-gray-400 text-sm">
                  Necesitarás completar esta información para realizar reservas o solicitar servicios en el hotel.
                </p>
              </div>
              <div className="w-full flex flex-col gap-3 pt-4">
                <button
                  onClick={() => {
                    sessionStorage.setItem('skip_customer_details', 'true');
                    navigate('/');
                  }}
                  className="w-full h-12 bg-amber-500 text-white font-bold rounded-xl hover:bg-amber-600 transition-colors"
                >
                  Sí, omitir
                </button>
                <button
                  onClick={() => setShowSkipModal(false)}
                  className="w-full h-12 bg-white/5 text-white font-bold rounded-xl hover:bg-white/10 transition-colors"
                >
                  Continuar completando
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Feedback Toast */}
      {feedback.show && (
        <div className={`fixed bottom-8 left-1/2 -translate-x-1/2 z-[200] max-w-sm w-full animate-in slide-in-from-bottom-10 fade-in`}>
          <div className={`flex items-center gap-3 p-4 rounded-2xl shadow-2xl border ${
            feedback.type === 'success'
            ? 'bg-emerald-500/90 border-emerald-400/20 text-white'
            : 'bg-rose-500/90 border-rose-400/20 text-white'
          } backdrop-blur-md`}>
            {feedback.type === 'success' ? <CheckCircle2 size={20} /> : <AlertCircle size={20} />}
            <p className="text-sm font-medium flex-1">{feedback.message}</p>
            <button onClick={() => setFeedback({ ...feedback, show: false })} className="hover:opacity-70 transition-opacity">
              <X size={16} />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default CustomerDetailsForm;









