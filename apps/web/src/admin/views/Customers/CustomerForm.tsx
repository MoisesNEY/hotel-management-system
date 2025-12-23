import { useState, useEffect } from 'react';
import { createCustomerDetails, updateCustomerDetails } from '../../../services/admin/customerDetailsService';
import type { CustomerDetailsDTO, Gender } from '../../../types/adminTypes';

interface CustomerFormProps {
    initialData?: CustomerDetailsDTO | null;
    onSuccess: () => void;
    onCancel: () => void;
}

const CustomerForm = ({ initialData, onSuccess, onCancel }: CustomerFormProps) => {
    // User fields
    const [firstName, setFirstName] = useState('');
    const [lastName, setLastName] = useState('');
    const [email, setEmail] = useState('');

    // Customer Detail fields
    const [gender, setGender] = useState<Gender>('OTHER');
    const [phone, setPhone] = useState('');
    const [birthDate, setBirthDate] = useState('');
    const [licenseId, setLicenseId] = useState('');
    const [addressLine1, setAddressLine1] = useState('');
    const [addressLine2, setAddressLine2] = useState('');
    const [city, setCity] = useState('');
    const [country, setCountry] = useState('');

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (initialData) {
            if (initialData.user) {
                setFirstName(initialData.user.firstName || '');
                setLastName(initialData.user.lastName || '');
                setEmail(initialData.user.email || '');
            }
            setGender(initialData.gender);
            setPhone(initialData.phone);
            setBirthDate(initialData.birthDate);
            setLicenseId(initialData.licenseId);
            setAddressLine1(initialData.addressLine1);
            setAddressLine2(initialData.addressLine2 || '');
            setCity(initialData.city);
            setCountry(initialData.country);
        }
    }, [initialData]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        try {
            const payload: CustomerDetailsDTO = {
                id: initialData?.id || 0,
                gender,
                phone,
                addressLine1,
                addressLine2: addressLine2 || undefined,
                city,
                country,
                licenseId,
                birthDate,
                user: {
                    id: initialData?.user?.id || '',
                    firstName,
                    lastName,
                    email,
                    login: email // Assuming login is email for simplicity/default
                }
            };

            if (initialData?.id) {
                await updateCustomerDetails(initialData.id, payload);
            } else {
                await createCustomerDetails(payload);
            }
            onSuccess();
        } catch (err) {
            console.error(err);
            setError('Error al guardar el cliente');
        } finally {
            setLoading(false);
        }
    };

    // Clases de Tailwind para diseño consistente y modo oscuro
    const inputClass = "w-full px-4 py-2.5 bg-white dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-xl text-sm text-gray-900 dark:text-white focus:ring-2 focus:ring-cyan-500/20 focus:border-cyan-500 outline-none transition-all placeholder:text-gray-400 disabled:opacity-50";
    const labelClass = "block text-[10px] font-bold text-gray-500 dark:text-gray-400 uppercase tracking-widest mb-1.5 ml-1";
    const sectionTitleClass = "text-xs font-bold text-cyan-600 dark:text-cyan-400 uppercase tracking-widest border-b border-gray-100 dark:border-white/5 pb-2 mb-4 mt-2";

    return (
        <form onSubmit={handleSubmit} className="divide-y divide-gray-100 dark:divide-white/5">
            <div className="p-8 space-y-8">
                {error && (
                    <div className="p-4 bg-red-50 dark:bg-red-500/10 border border-red-100 dark:border-red-500/20 rounded-2xl text-red-600 dark:text-red-400 text-sm flex items-center gap-3">
                        <div className="w-2 h-2 rounded-full bg-red-500" />
                        {error}
                    </div>
                )}

                {/* Información Personal */}
                <section>
                    <h3 className={sectionTitleClass}>Información Personal</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-1.5">
                            <label className={labelClass}>Nombre <span className="text-red-500">*</span></label>
                            <input
                                type="text"
                                value={firstName}
                                onChange={(e) => setFirstName(e.target.value)}
                                required
                                className={inputClass}
                                placeholder="Ej: Juan"
                            />
                        </div>
                        <div className="space-y-1.5">
                            <label className={labelClass}>Apellidos <span className="text-red-500">*</span></label>
                            <input
                                type="text"
                                value={lastName}
                                onChange={(e) => setLastName(e.target.value)}
                                required
                                className={inputClass}
                                placeholder="Ej: Pérez"
                            />
                        </div>
                        <div className="md:col-span-2 space-y-1.5">
                            <label className={labelClass}>Email <span className="text-red-500">*</span></label>
                            <input
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                required
                                className={inputClass}
                                placeholder="juan.perez@ejemplo.com"
                            />
                        </div>
                        <div className="space-y-1.5">
                            <label className={labelClass}>Género</label>
                            <select
                                value={gender}
                                onChange={(e) => setGender(e.target.value as Gender)}
                                className={inputClass}
                            >
                                <option value="MALE" className="dark:bg-[#1a1c20]">Masculino</option>
                                <option value="FEMALE" className="dark:bg-[#1a1c20]">Femenino</option>
                                <option value="OTHER" className="dark:bg-[#1a1c20]">Otro</option>
                            </select>
                        </div>
                        <div className="space-y-1.5">
                            <label className={labelClass}>Fecha de Nacimiento <span className="text-red-500">*</span></label>
                            <input
                                type="date"
                                value={birthDate}
                                onChange={(e) => setBirthDate(e.target.value)}
                                required
                                className={inputClass}
                            />
                        </div>
                    </div>
                </section>

                {/* Dirección y Contacto */}
                <section>
                    <h3 className={sectionTitleClass}>Dirección y Contacto</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-1.5">
                            <label className={labelClass}>Teléfono <span className="text-red-500">*</span></label>
                            <input
                                type="tel"
                                value={phone}
                                onChange={(e) => setPhone(e.target.value)}
                                required
                                className={inputClass}
                                placeholder="+1 234 567 890"
                            />
                        </div>
                        <div className="space-y-1.5">
                            <label className={labelClass}>DNI / Pasaporte <span className="text-red-500">*</span></label>
                            <input
                                type="text"
                                value={licenseId}
                                onChange={(e) => setLicenseId(e.target.value)}
                                required
                                className={inputClass}
                                placeholder="ID o Pasaporte"
                            />
                        </div>
                        <div className="md:col-span-2 space-y-1.5">
                            <label className={labelClass}>Dirección Principal <span className="text-red-500">*</span></label>
                            <input
                                type="text"
                                value={addressLine1}
                                onChange={(e) => setAddressLine1(e.target.value)}
                                required
                                className={inputClass}
                                placeholder="Calle, Número, Depto"
                            />
                        </div>
                        <div className="md:col-span-2 space-y-1.5">
                            <label className={labelClass}>Dirección Secundaria (Opcional)</label>
                            <input
                                type="text"
                                value={addressLine2}
                                onChange={(e) => setAddressLine2(e.target.value)}
                                className={inputClass}
                                placeholder="Edificio, Piso, Referencias"
                            />
                        </div>
                        <div className="space-y-1.5">
                            <label className={labelClass}>Ciudad <span className="text-red-500">*</span></label>
                            <input
                                type="text"
                                value={city}
                                onChange={(e) => setCity(e.target.value)}
                                required
                                className={inputClass}
                                placeholder="Ej: Madrid"
                            />
                        </div>
                        <div className="space-y-1.5">
                            <label className={labelClass}>País <span className="text-red-500">*</span></label>
                            <input
                                type="text"
                                value={country}
                                onChange={(e) => setCountry(e.target.value)}
                                required
                                className={inputClass}
                                placeholder="Ej: España"
                            />
                        </div>
                    </div>
                </section>
            </div>

            {/* Acciones */}
            <div className="flex justify-end gap-3 p-6 bg-gray-50/50 dark:bg-white/5">
                <button
                    type="button"
                    onClick={onCancel}
                    disabled={loading}
                    className="px-6 py-2 text-xs font-bold uppercase tracking-widest text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 transition-colors disabled:opacity-50"
                >
                    Cancelar
                </button>
                <button
                    type="submit"
                    disabled={loading}
                    className="px-8 py-2 bg-cyan-500 hover:bg-cyan-600 text-white text-xs font-bold uppercase tracking-widest rounded-xl shadow-lg shadow-cyan-500/20 transition-all active:scale-95 disabled:opacity-50 disabled:pointer-events-none"
                >
                    {loading ? 'Sincronizando...' : initialData ? 'Actualizar Cliente' : 'Guardar Cliente'}
                </button>
            </div>
        </form>
    );
};

export default CustomerForm;
