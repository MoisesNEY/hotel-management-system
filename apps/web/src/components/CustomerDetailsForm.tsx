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
    <div className="min-h-screen bg-[#050a1f] flex items-center justify-center p-6 relative overflow-hidden font-sans">
      {/* Background elements - Midnight aesthetic */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
        <div className="absolute top-[-20%] right-[-10%] w-[60%] h-[60%] bg-blue-900/20 blur-[150px] rounded-full" />
        <div className="absolute bottom-[-20%] left-[-10%] w-[60%] h-[60%] bg-navy-light/10 blur-[150px] rounded-full" />
        <div className="absolute top-1/4 left-1/4 w-px h-px bg-white/20 shadow-[0_0_100px_40px_rgba(255,255,255,0.05)]" />
      </div>

      <div className="w-full max-w-2xl bg-[#0a143c]/40 backdrop-blur-2xl border border-white/10 rounded-[2.5rem] p-8 md:p-12 shadow-[0_20px_50px_rgba(0,0,0,0.5)] relative z-10 animate-in fade-in zoom-in duration-700">
        <div className="text-center mb-10">
          <div className="inline-flex items-center justify-center p-4 bg-gold-default/10 rounded-2xl mb-6 ring-1 ring-gold-default/20">
            <User size={32} className="text-gold-default" />
          </div>
          <h2 className="text-4xl font-serif font-bold text-white mb-3 tracking-tight">Tu Perfil Noir</h2>
          <p className="text-blue-200/60 text-sm max-w-md mx-auto leading-relaxed">
            Completa tu información de perfil para disfrutar de una experiencia personalizada en Gran Hotel Antigravity.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-7">
            {/* Género */}
            <div className="space-y-2.5">
              <label className="text-[10px] font-bold uppercase tracking-[0.2em] text-gold-default/90 ml-1 flex items-center gap-2">
                <User size={12} className="opacity-70" /> Género
              </label>
              <div className="relative group">
                <select
                  name="gender"
                  value={formData.gender}
                  onChange={handleChange}
                  className="w-full h-13 px-5 bg-white/5 border border-white/10 rounded-2xl text-white outline-none focus:border-gold-default focus:ring-4 focus:ring-gold-default/10 transition-all appearance-none cursor-pointer"
                  required
                >
                  <option value="MALE" className="bg-[#0a143c] text-white">Masculino</option>
                  <option value="FEMALE" className="bg-[#0a143c] text-white">Femenino</option>
                  <option value="OTHER" className="bg-[#0a143c] text-white">Otro</option>
                </select>
                <div className="absolute right-5 top-1/2 -translate-y-1/2 pointer-events-none text-gray-500 group-hover:text-gold-default transition-colors">
                  <ArrowRight size={16} className="rotate-90 opacity-60" />
                </div>
              </div>
            </div>

            {/* Fecha Nacimiento */}
            <div className="space-y-2.5">
              <label className="text-[10px] font-bold uppercase tracking-[0.2em] text-gold-default/90 ml-1 flex items-center gap-2">
                <Calendar size={12} className="opacity-70" /> Fecha de Nacimiento
              </label>
              <input
                type="date"
                name="birthDate"
                value={formData.birthDate}
                onChange={handleChange}
                className="w-full h-13 px-5 bg-white/5 border border-white/10 rounded-2xl text-white outline-none focus:border-gold-default focus:ring-4 focus:ring-gold-default/10 transition-all [color-scheme:dark]"
                required
                max={new Date().toISOString().split('T')[0]}
              />
            </div>

            {/* Teléfono */}
            <div className="space-y-2.5">
              <label className="text-[10px] font-bold uppercase tracking-[0.2em] text-gold-default/90 ml-1 flex items-center gap-2">
                <Phone size={12} className="opacity-70" /> Teléfono
              </label>
              <input
                type="tel"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                className="w-full h-13 px-5 bg-white/5 border border-white/10 rounded-2xl text-white placeholder:text-white/20 outline-none focus:border-gold-default focus:ring-4 focus:ring-gold-default/10 transition-all"
                placeholder="+505 0000 0000"
                required
              />
            </div>

            {/* DNI */}
            <div className="space-y-2.5">
              <label className="text-[10px] font-bold uppercase tracking-[0.2em] text-gold-default/90 ml-1 flex items-center gap-2">
                <CreditCard size={12} className="opacity-70" /> DNI / Cédula
              </label>
              <input
                type="text"
                name="licenseId"
                value={formData.licenseId}
                onChange={handleChange}
                className="w-full h-13 px-5 bg-white/5 border border-white/10 rounded-2xl text-white placeholder:text-white/20 outline-none focus:border-gold-default focus:ring-4 focus:ring-gold-default/10 transition-all"
                placeholder="Número de documento"
                required
              />
            </div>

            {/* Dirección - Span Full */}
            <div className="space-y-2.5 md:col-span-2">
              <label className="text-[10px] font-bold uppercase tracking-[0.2em] text-gold-default/90 ml-1 flex items-center gap-2">
                <MapPin size={12} className="opacity-70" /> Dirección de Residencia
              </label>
              <input
                type="text"
                name="addressLine1"
                value={formData.addressLine1}
                onChange={handleChange}
                className="w-full h-13 px-5 bg-white/5 border border-white/10 rounded-2xl text-white placeholder:text-white/20 outline-none focus:border-gold-default focus:ring-4 focus:ring-gold-default/10 transition-all"
                placeholder="Calle, número, colonia..."
                required
              />
            </div>

            {/* Ciudad */}
            <div className="space-y-2.5">
              <label className="text-[10px] font-bold uppercase tracking-[0.2em] text-gold-default/90 ml-1 flex items-center gap-2">
                <Globe size={12} className="opacity-70" /> Ciudad
              </label>
              <input
                type="text"
                name="city"
                value={formData.city}
                onChange={handleChange}
                className="w-full h-13 px-5 bg-white/5 border border-white/10 rounded-2xl text-white placeholder:text-white/20 outline-none focus:border-gold-default focus:ring-4 focus:ring-gold-default/10 transition-all"
                placeholder="Ej. Managua"
                required
              />
            </div>

            {/* País */}
            <div className="space-y-2.5">
              <label className="text-[10px] font-bold uppercase tracking-[0.2em] text-gold-default/90 ml-1 flex items-center gap-2">
                <Globe size={12} className="opacity-70" /> País
              </label>
              <input
                type="text"
                name="country"
                value={formData.country}
                onChange={handleChange}
                className="w-full h-13 px-5 bg-white/5 border border-white/10 rounded-2xl text-white placeholder:text-white/20 outline-none focus:border-gold-default focus:ring-4 focus:ring-gold-default/10 transition-all"
                placeholder="Ej. Nicaragua"
                required
              />
            </div>
          </div>

          <div className="pt-4 flex flex-col gap-5">
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full h-14 bg-gradient-to-r from-[#d4af37] via-[#e5c158] to-[#b39226] text-[#050a1f] font-black uppercase tracking-widest rounded-2xl flex items-center justify-center gap-3 hover:shadow-[0_0_30px_rgba(212,175,55,0.3)] hover:scale-[1.01] active:scale-[0.99] transition-all disabled:opacity-50 disabled:hover:scale-100 shadow-xl"
            >
              {isSubmitting ? (
                <div className="animate-spin rounded-full h-6 w-6 border-2 border-[#050a1f]/20 border-t-[#050a1f]" />
              ) : (
                <>
                  <Save size={18} /> Guardar Perfil
                </>
              )}
            </button>

            <button
              type="button"
              onClick={() => setShowSkipModal(true)}
              className="w-full py-2 text-blue-200/40 text-xs font-bold uppercase tracking-widest hover:text-white transition-colors flex items-center justify-center gap-2 group"
            >
              Completar luego <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
            </button>
          </div>
        </form>
      </div>

      {/* Skip Modal */}
      {showSkipModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 backdrop-blur-xl bg-[#050a1f]/80">
          <div className="w-full max-w-md bg-[#0a143c] border border-white/10 rounded-[2.5rem] p-10 shadow-3xl animate-in fade-in slide-in-from-bottom-8 duration-500">
            <div className="flex flex-col items-center text-center space-y-7">
              <div className="w-20 h-20 bg-amber-500/10 rounded-full flex items-center justify-center text-amber-500 ring-1 ring-amber-500/20 shadow-[0_0_40px_rgba(245,158,11,0.1)]">
                <AlertCircle size={40} />
              </div>
              <div className="space-y-3">
                <h3 className="text-2xl font-serif font-bold text-white">¿Deseas omitir este paso?</h3>
                <p className="text-blue-200/60 text-sm leading-relaxed">
                  Para poder realizar reservas o solicitar servicios Premium en el Gran Hotel Antigravity, es necesario completar tu perfil.
                </p>
              </div>
              <div className="w-full flex flex-col gap-3.5 pt-4">
                <button
                  onClick={() => {
                    sessionStorage.setItem('skip_customer_details', 'true');
                    navigate('/');
                  }}
                  className="w-full h-13 bg-amber-500 text-[#050a1f] font-black uppercase tracking-widest rounded-xl hover:bg-amber-400 transition-all shadow-lg shadow-amber-500/20"
                >
                  Sí, omitir ahora
                </button>
                <button
                  onClick={() => setShowSkipModal(false)}
                  className="w-full h-13 bg-white/5 text-white font-bold rounded-xl hover:bg-white/10 transition-all border border-white/5"
                >
                  Prefiero completarlo
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Feedback Toast */}
      {feedback.show && (
        <div className="fixed bottom-10 left-1/2 -translate-x-1/2 z-[200] max-w-sm w-full px-4 animate-in slide-in-from-bottom-12 fade-in duration-500">
          <div className={`flex items-center gap-4 p-5 rounded-[1.25rem] shadow-[0_20px_40px_rgba(0,0,0,0.4)] border ${feedback.type === 'success'
              ? 'bg-emerald-600/90 border-emerald-400/30 text-white'
              : 'bg-rose-600/90 border-rose-400/30 text-white'
            } backdrop-blur-xl ring-1 ring-white/10`}>
            <div className={`p-2 rounded-full ${feedback.type === 'success' ? 'bg-white/20' : 'bg-white/20'}`}>
              {feedback.type === 'success' ? <CheckCircle2 size={20} /> : <AlertCircle size={20} />}
            </div>
            <p className="text-sm font-bold flex-1 tracking-wide">{feedback.message}</p>
            <button
              onClick={() => setFeedback({ ...feedback, show: false })}
              className="p-1 hover:bg-black/10 rounded-full transition-colors"
            >
              <X size={18} />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default CustomerDetailsForm;









