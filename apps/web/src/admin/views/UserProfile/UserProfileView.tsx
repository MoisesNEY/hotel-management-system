import React, { useState, useEffect } from 'react';
import { getAccount } from '../../../services/accountService';
import { updateUser } from '../../../services/admin/userService';
import type { AdminUserDTO } from '../../../types/adminTypes';
import { User, Mail, Globe, Shield, Save } from 'lucide-react';

const UserProfileView: React.FC = () => {
    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    const [formData, setFormData] = useState<Partial<AdminUserDTO>>({
        firstName: '',
        lastName: '',
        email: '',
        login: '',
        langKey: 'en',
        activated: false,
        authorities: []
    });

    useEffect(() => {
        const fetchProfile = async () => {
            try {
                const data = await getAccount();
                setFormData(data);
            } catch (error) {
                console.error("Failed to load profile", error);
            } finally {
                setIsLoading(false);
            }
        };
        fetchProfile();
    }, []);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSaving(true);
        try {
            if (formData.login) {
                await updateUser(formData as AdminUserDTO);
                alert('Perfil actualizado correctamente');
            }
        } catch (error) {
            console.error("Failed to update profile", error);
            alert('Error al actualizar el perfil');
        } finally {
            setIsSaving(false);
        }
    };

    if (isLoading) {
        return (
            <div className="flex justify-center items-center h-screen bg-gray-50">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            </div>
        );
    }

    const initials = `${formData.firstName?.[0] || ''}${formData.lastName?.[0] || ''}`.toUpperCase() || 'U';

    return (
        <div className="!min-h-screen !bg-slate-50/50 !p-6 md:!p-12 !font-sans">
            <div className="!max-w-6xl !mx-auto !space-y-8">
                
                {/* Header Section */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 !border-b !border-gray-200 !pb-6">
                    <div>
                        <h1 className="!text-3xl !font-bold !text-slate-800 !tracking-tight !font-sans">Mi Perfil</h1>
                        <p className="!text-slate-500 !mt-1 !font-sans">Gestiona tu información personal y preferencias del sistema.</p>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                    
                    {/* Left Column: Avatar & Quick Stats (4 cols) */}
                    <div className="lg:col-span-4 !space-y-6">
                        <div className="!bg-white !rounded-xl !shadow-sm !border !border-gray-100 !p-8 flex flex-col items-center text-center">
                            <div className="relative group !mb-6">
                                <div className="!h-32 !w-32 !rounded-full !bg-slate-100 !border-4 !border-white !shadow-md flex items-center justify-center !text-slate-400 !font-bold !text-4xl overflow-hidden">
                                    {initials}
                                </div>
                                {/* <div className="absolute bottom-0 right-0 p-2 bg-blue-600 rounded-full text-white shadow-lg cursor-pointer hover:bg-blue-700 transition-colors">
                                    <Camera size={16} />
                                </div> */}
                            </div>
                            
                            <h2 className="!text-xl !font-bold !text-slate-800 !font-sans">
                                {formData.firstName} {formData.lastName}
                            </h2>
                            <p className="!text-sm !font-medium !text-slate-500 !mb-4 !font-sans">@{formData.login}</p>
                            
                            <div className="flex flex-wrap justify-center gap-2 !mb-6">
                                {formData.authorities?.map((role) => (
                                    <span key={role} className="!px-3 !py-1 !bg-blue-50 !text-blue-700 !text-xs !font-bold uppercase !rounded-md !tracking-wide">
                                        {role.replace('ROLE_', '')}
                                    </span>
                                ))}
                            </div>

                            <div className="!w-full !pt-6 !border-t !border-gray-100 grid grid-cols-2 gap-4">
                                <div className="text-center !p-3 !rounded-lg !bg-gray-50">
                                    <p className="!text-xs !text-gray-500 uppercase !font-semibold !mb-1 !font-sans">Estado</p>
                                    <p className={`!font-bold ${formData.activated ? '!text-emerald-600' : '!text-red-500'} !font-sans`}>
                                        {formData.activated ? 'Activo' : 'Inactivo'}
                                    </p>
                                </div>
                                <div className="text-center !p-3 !rounded-lg !bg-gray-50">
                                    <p className="!text-xs !text-gray-500 uppercase !font-semibold !mb-1 !font-sans">Idioma</p>
                                    <p className="!font-bold !text-slate-700 uppercase !font-sans">{formData.langKey}</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Right Column: Edit Form (8 cols) */}
                    <div className="lg:col-span-8">
                        <div className="!bg-white !rounded-xl !shadow-sm !border !border-gray-100 overflow-hidden">
                            <div className="!px-8 !py-6 !border-b !border-gray-100 !bg-gray-50/30 flex items-center justify-between">
                                <h3 className="!text-lg !font-bold !text-slate-800 flex items-center gap-2 !font-sans">
                                    <User size={20} className="!text-blue-600" />
                                    Información General
                                </h3>
                                {/* <span className="text-xs font-medium text-blue-600 bg-blue-50 px-3 py-1 rounded-full">Editable</span> */}
                            </div>
                            
                            <div className="!p-8">
                                <form onSubmit={handleSubmit} className="!space-y-6">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <div className="!space-y-2">
                                            <label className="!text-sm !font-semibold !text-slate-700 !font-sans">Nombre</label>
                                            <div className="relative">
                                                <input
                                                    type="text"
                                                    name="firstName"
                                                    value={formData.firstName || ''}
                                                    onChange={handleChange}
                                                    className="!block !w-full !pl-4 !pr-4 !py-3 !bg-white !border !border-gray-200 !rounded-lg !text-sm focus:!border-blue-500 focus:!ring-1 focus:!ring-blue-500 !outline-none !transition-all placeholder:!text-gray-400 !font-sans !h-auto !min-h-[44px]"
                                                    placeholder="Ingresa tu nombre"
                                                />
                                            </div>
                                        </div>
                                        <div className="!space-y-2">
                                            <label className="!text-sm !font-semibold !text-slate-700 !font-sans">Apellido</label>
                                            <div className="relative">
                                                <input
                                                    type="text"
                                                    name="lastName"
                                                    value={formData.lastName || ''}
                                                    onChange={handleChange}
                                                    className="!block !w-full !pl-4 !pr-4 !py-3 !bg-white !border !border-gray-200 !rounded-lg !text-sm focus:!border-blue-500 focus:!ring-1 focus:!ring-blue-500 !outline-none !transition-all placeholder:!text-gray-400 !font-sans !h-auto !min-h-[44px]"
                                                    placeholder="Ingresa tu apellido"
                                                />
                                            </div>
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <div className="!space-y-2 opacity-75">
                                            <label className="!text-sm !font-semibold !text-slate-500 !font-sans">Usuario (Login)</label>
                                            <div className="relative">
                                                <Shield className="absolute left-3 top-3 !text-gray-400" size={18} />
                                                <input
                                                    type="text"
                                                    value={formData.login || ''}
                                                    disabled
                                                    className="!block !w-full !pl-10 !pr-4 !py-3 !bg-gray-50 !border !border-gray-200 !rounded-lg !text-sm !text-gray-500 cursor-not-allowed !font-sans !h-auto !min-h-[44px]"
                                                />
                                            </div>
                                        </div>
                                        <div className="!space-y-2">
                                            <label className="!text-sm !font-semibold !text-slate-700 !font-sans">Correo Electrónico</label>
                                            <div className="relative">
                                                <Mail className="absolute left-3 top-3 !text-gray-400" size={18} />
                                                <input
                                                    type="email"
                                                    name="email"
                                                    value={formData.email || ''}
                                                    onChange={handleChange}
                                                    className="!block !w-full !pl-10 !pr-4 !py-3 !bg-white !border !border-gray-200 !rounded-lg !text-sm focus:!border-blue-500 focus:!ring-1 focus:!ring-blue-500 !outline-none !transition-all placeholder:!text-gray-400 !font-sans !h-auto !min-h-[44px]"
                                                />
                                            </div>
                                        </div>
                                    </div>

                                    <div className="!space-y-2">
                                        <label className="!text-sm !font-semibold !text-slate-700 !font-sans">Idioma Preferido</label>
                                        <div className="relative max-w-md">
                                            <Globe className="absolute left-3 top-3 !text-gray-400" size={18} />
                                            <select
                                                name="langKey"
                                                value={formData.langKey || 'en'}
                                                onChange={handleChange}
                                                className="!block !w-full !pl-10 !pr-10 !py-3 !bg-white !border !border-gray-200 !rounded-lg !text-sm focus:!border-blue-500 focus:!ring-1 focus:!ring-blue-500 !outline-none !transition-all appearance-none cursor-pointer !font-sans !h-auto !min-h-[44px]"
                                            >
                                                <option value="en">English (Inglés)</option>
                                                <option value="es">Español (Spanish)</option>
                                                <option value="fr">Français (Francés)</option>
                                            </select>
                                            <div className="absolute right-3 top-3.5 pointer-events-none">
                                                <svg className="h-4 w-4 !text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                                </svg>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="!pt-6 !mt-6 flex justify-end !border-t !border-gray-100">
                                        <button
                                            type="submit"
                                            disabled={isSaving}
                                            className={`
                                                flex items-center gap-2 !px-6 !py-2.5 !rounded-lg !text-sm !font-semibold !text-white !shadow-sm !transition-all !font-sans
                                                ${isSaving 
                                                    ? '!bg-blue-400 cursor-not-allowed' 
                                                    : '!bg-blue-600 hover:!bg-blue-700 hover:!shadow-md active:transform active:!scale-95'}
                                            `}
                                        >
                                            {isSaving ? (
                                                <>
                                                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                                                    <span>Guardando...</span>
                                                </>
                                            ) : (
                                                <>
                                                    <Save size={18} />
                                                    <span>Guardar Cambios</span>
                                                </>
                                            )}
                                        </button>
                                    </div>
                                </form>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default UserProfileView;
