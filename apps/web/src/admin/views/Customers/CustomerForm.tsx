import { useState, useEffect } from 'react';
import { createWalkInCustomer, updateCustomer } from '../../../services/admin/customerService';
import type { CustomerDTO, Gender } from '../../../types/adminTypes';

interface CustomerFormProps {
    initialData?: CustomerDTO | null;
    onSuccess: () => void;
    onCancel: () => void;
}

const CustomerForm = ({ initialData, onSuccess, onCancel }: CustomerFormProps) => {
    // Flattened fields
    const [firstName, setFirstName] = useState('');
    const [lastName, setLastName] = useState('');
    const [email, setEmail] = useState('');
    
    // Customer Detail fields
    const [gender, setGender] = useState<Gender>('OTHER');
    const [phone, setPhone] = useState('');
    const [birthDate, setBirthDate] = useState('');
    const [licenseId, setLicenseId] = useState('');
    const [addressLine1, setAddressLine1] = useState('');

    const [city, setCity] = useState('');
    const [country, setCountry] = useState('');

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (initialData) {
            setFirstName(initialData.firstName || '');
            setLastName(initialData.lastName || '');
            setEmail(initialData.email || '');
            
            setGender(initialData.gender);
            setPhone(initialData.phone);
            setBirthDate(initialData.birthDate);
            setLicenseId(initialData.licenseId);
            setAddressLine1(initialData.addressLine1);
            setCity(initialData.city);
            setCountry(initialData.country);
        }
    }, [initialData]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        try {
            const payload: CustomerDTO = {
                id: initialData?.id || 0,
                firstName,
                lastName,
                email,
                gender,
                phone,
                addressLine1,
                city,
                country,
                licenseId,
                birthDate,
                user: initialData?.user // Preserve link if editing an existing online customer
            };

            if (initialData?.id) {
                await updateCustomer(initialData.id, payload);
            } else {
                // FORCE WALK-IN CREATION for new customers in Admin Panel
                await createWalkInCustomer(payload);
            }
            onSuccess();
        } catch (err) {
            console.error(err);
            setError('Error al guardar el cliente');
        } finally {
            setLoading(false);
        }
    };



    return (
        <form onSubmit={handleSubmit} className="p-6 grid gap-4 bg-white dark:bg-[#1c1c1c] text-gray-900 dark:text-gray-100">
            {error && (
                <div className="p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg text-red-700 dark:text-red-400 text-sm">
                    {error}
                </div>
            )}

            {/* Datos de Usuario */}
            <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-200 border-b border-gray-200 dark:border-gray-700 pb-2">
                Información Personal
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                    <label className="block text-xs font-bold text-gray-500 dark:text-gray-400 uppercase mb-1">Nombre <span className="text-red-500">*</span></label>
                    <input
                        type="text"
                        value={firstName}
                        onChange={(e) => setFirstName(e.target.value)}
                        required
                        className="w-full p-2.5 bg-white dark:bg-[#2a2a2a] border border-gray-300 dark:border-[#444] rounded-lg text-sm text-gray-900 dark:text-white focus:ring-2 focus:ring-gold-500 focus:border-transparent outline-none transition-all placeholder-gray-400 dark:placeholder-gray-500"
                    />
                </div>
                <div>
                    <label className="block text-xs font-bold text-gray-500 dark:text-gray-400 uppercase mb-1">Apellidos <span className="text-red-500">*</span></label>
                    <input
                        type="text"
                        value={lastName}
                        onChange={(e) => setLastName(e.target.value)}
                        required
                        className="w-full p-2.5 bg-white dark:bg-[#2a2a2a] border border-gray-300 dark:border-[#444] rounded-lg text-sm text-gray-900 dark:text-white focus:ring-2 focus:ring-gold-500 focus:border-transparent outline-none transition-all placeholder-gray-400 dark:placeholder-gray-500"
                    />
                </div>
            </div>

            <div>
                <label className="block text-xs font-bold text-gray-500 dark:text-gray-400 uppercase mb-1">Email</label>
                <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full p-2.5 bg-white dark:bg-[#2a2a2a] border border-gray-300 dark:border-[#444] rounded-lg text-sm text-gray-900 dark:text-white focus:ring-2 focus:ring-gold-500 focus:border-transparent outline-none transition-all placeholder-gray-400 dark:placeholder-gray-500"
                />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                    <label className="block text-xs font-bold text-gray-500 dark:text-gray-400 uppercase mb-1">Género</label>
                    <select
                        value={gender}
                        onChange={(e) => setGender(e.target.value as Gender)}
                        className="w-full p-2.5 bg-white dark:bg-[#2a2a2a] border border-gray-300 dark:border-[#444] rounded-lg text-sm text-gray-900 dark:text-white focus:ring-2 focus:ring-gold-500 focus:border-transparent outline-none transition-all"
                    >
                        <option value="MALE">Masculino</option>
                        <option value="FEMALE">Femenino</option>
                        <option value="OTHER">Otro</option>
                    </select>
                </div>
                <div>
                    <label className="block text-xs font-bold text-gray-500 dark:text-gray-400 uppercase mb-1">Fecha de Nacimiento <span className="text-red-500">*</span></label>
                    <input
                        type="date"
                        value={birthDate}
                        onChange={(e) => setBirthDate(e.target.value)}
                        required
                        className="w-full p-2.5 bg-white dark:bg-[#2a2a2a] border border-gray-300 dark:border-[#444] rounded-lg text-sm text-gray-900 dark:text-white focus:ring-2 focus:ring-gold-500 focus:border-transparent outline-none transition-all placeholder-gray-400 dark:placeholder-gray-500"
                    />
                </div>
            </div>

            {/* Datos de Contacto */}
            <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-200 border-b border-gray-200 dark:border-gray-700 pb-2 mt-2">
                Dirección y Contacto
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                    <label className="block text-xs font-bold text-gray-500 dark:text-gray-400 uppercase mb-1">Teléfono</label>
                    <input
                        type="tel"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        className="w-full p-2.5 bg-white dark:bg-[#2a2a2a] border border-gray-300 dark:border-[#444] rounded-lg text-sm text-gray-900 dark:text-white focus:ring-2 focus:ring-gold-500 focus:border-transparent outline-none transition-all placeholder-gray-400 dark:placeholder-gray-500"
                    />
                </div>
                <div>
                    <label className="block text-xs font-bold text-gray-500 dark:text-gray-400 uppercase mb-1">DNI / Pasaporte <span className="text-red-500">*</span></label>
                    <input
                        type="text"
                        value={licenseId}
                        onChange={(e) => setLicenseId(e.target.value)}
                        required
                        className="w-full p-2.5 bg-white dark:bg-[#2a2a2a] border border-gray-300 dark:border-[#444] rounded-lg text-sm text-gray-900 dark:text-white focus:ring-2 focus:ring-gold-500 focus:border-transparent outline-none transition-all placeholder-gray-400 dark:placeholder-gray-500"
                    />
                </div>
            </div>

            <div>
                <label className="block text-xs font-bold text-gray-500 dark:text-gray-400 uppercase mb-1">Dirección 1</label>
                <input
                    type="text"
                    value={addressLine1}
                    onChange={(e) => setAddressLine1(e.target.value)}
                    className="w-full p-2.5 bg-white dark:bg-[#2a2a2a] border border-gray-300 dark:border-[#444] rounded-lg text-sm text-gray-900 dark:text-white focus:ring-2 focus:ring-gold-500 focus:border-transparent outline-none transition-all placeholder-gray-400 dark:placeholder-gray-500"
                />
            </div>



            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                    <label className="block text-xs font-bold text-gray-500 dark:text-gray-400 uppercase mb-1">Ciudad</label>
                    <input
                        type="text"
                        value={city}
                        onChange={(e) => setCity(e.target.value)}
                        className="w-full p-2.5 bg-white dark:bg-[#2a2a2a] border border-gray-300 dark:border-[#444] rounded-lg text-sm text-gray-900 dark:text-white focus:ring-2 focus:ring-gold-500 focus:border-transparent outline-none transition-all placeholder-gray-400 dark:placeholder-gray-500"
                    />
                </div>
                <div>
                    <label className="block text-xs font-bold text-gray-500 dark:text-gray-400 uppercase mb-1">País</label>
                    <input
                        type="text"
                        value={country}
                        onChange={(e) => setCountry(e.target.value)}
                        className="w-full p-2.5 bg-white dark:bg-[#2a2a2a] border border-gray-300 dark:border-[#444] rounded-lg text-sm text-gray-900 dark:text-white focus:ring-2 focus:ring-gold-500 focus:border-transparent outline-none transition-all placeholder-gray-400 dark:placeholder-gray-500"
                    />
                </div>
            </div>

            {/* Footer con botones */}
            <div className="flex justify-end gap-3 pt-4 border-t border-gray-200 dark:border-gray-700 mt-4">
                <button
                    type="button"
                    onClick={onCancel}
                    disabled={loading}
                    className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-sm font-bold text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 transition-colors"
                >
                    Cancelar
                </button>
                <button
                    type="submit"
                    disabled={loading}
                    className="px-6 py-2 bg-gold-500 text-white rounded-lg text-sm font-bold shadow-lg hover:bg-gold-600 transition-transform active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    {loading ? 'Sincronizando...' : initialData ? 'Actualizar Cliente' : 'Guardar Cliente'}
                </button>
            </div>
        </form>
    );
};

export default CustomerForm;
