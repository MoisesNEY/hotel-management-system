import React, { useState, useEffect } from 'react';
import Card from '../../components/shared/Card';
import Button from '../../components/shared/Button';
import { getAccount } from '../../../services/accountService';
import type { AdminUserDTO } from '../../../types/adminTypes';
// import { User, Mail, MapPin, Briefcase } from 'lucide-react'; // Unused icons removed

const FormInput = ({ label, name, value, onChange, type = "text", placeholder = "", disabled = false }: any) => (
    <div className="form-group mb-4">
        <label className="block text-xs uppercase text-gray-500 font-bold mb-2 tracking-wide">
            {label}
        </label>
        <input
            type={type}
            name={name}
            value={value || ''}
            onChange={onChange}
            disabled={disabled}
            placeholder={placeholder}
            className={`
                w-full px-3 py-2 
                bg-white border text-gray-700 text-sm
                ${disabled ? 'border-transparent bg-transparent text-gray-500 cursor-not-allowed' : 'border-gray-200 focus:border-cyan-400'}
                rounded transition-colors duration-200 outline-none
                placeholder-gray-300
            `}
        />
    </div>
);

const UserProfileView: React.FC = () => {
    const [isLoading, setIsLoading] = useState(true);
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

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        alert('Perfil actualizado correctamente (Mock update)');
    };

    if (isLoading) {
        return <div className="p-8 text-center text-gray-500">Cargando perfil...</div>;
    }

    return (
        <div className="content">
            <div className="row" style={{ display: 'flex', flexWrap: 'wrap', margin: '0 -15px' }}>

                {/* Profile Card (Left) */}
                <div className="col-md-4" style={{ width: '33.33333%', padding: '0 15px', flex: '0 0 33.33333%', maxWidth: '33.33333%' }}>
                    <div className="card card-user" style={{
                        borderRadius: '12px',
                        boxShadow: '0 6px 10px -4px rgba(0,0,0,0.15)',
                        backgroundColor: '#fff',
                        marginBottom: '20px',
                        overflow: 'hidden',
                        border: '0 none'
                    }}>
                        <div className="image" style={{ height: '110px', overflow: 'hidden', position: 'relative', backgroundColor: '#2d2d2d' }}>
                           {/* Generic background or image */}
                        </div>
                        <div className="card-body" style={{ minHeight: '240px', padding: '15px 15px 10px 15px', textAlign: 'center' }}>
                            <div className="author" style={{ marginTop: '-65px', textAlign: 'center' }}>
                                <a href="#pablo" onClick={e => e.preventDefault()} style={{ textDecoration: 'none' }}>
                                    <div style={{
                                        width: '124px',
                                        height: '124px',
                                        border: '5px solid #fff',
                                        borderRadius: '50%',
                                        margin: '0 auto',
                                        overflow: 'hidden',
                                        position: 'relative',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        backgroundColor: '#f8f9fa',
                                        fontSize: '2.5rem',
                                        color: '#ccc'
                                    }}>
                                        {/* Avatar Initials if no image */}
                                        {formData.firstName?.[0]}{formData.lastName?.[0]}
                                    </div>
                                    <h5 className="title" style={{ color: '#403D39', fontSize: '1.57em', fontWeight: 600, lineHeight: '1.4em', marginBottom: '0', marginTop: '10px' }}>
                                        {formData.firstName} {formData.lastName}
                                    </h5>
                                </a>
                                <p className="description" style={{ color: '#9A9A9A', fontWeight: 400, fontSize: '14px' }}>
                                    @{formData.login}
                                </p>
                            </div>
                            <div className="mt-4">
                                <span className="inline-block px-3 py-1 text-xs font-semibold text-gray-700 bg-gray-100 rounded-full">
                                    {formData.authorities?.join(', ')}
                                </span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Edit Profile Form (Right) */}
                <div className="col-md-8" style={{ width: '66.66667%', padding: '0 15px', flex: '0 0 66.66667%', maxWidth: '66.66667%' }}>
                    <Card title="Mi Perfil" className="card-user">
                        <form onSubmit={handleSubmit}>
                            {/* Row 1 */}
                            <div className="row" style={{ display: 'flex', flexWrap: 'wrap', margin: '0 -15px' }}>
                                <div className="col-6 pr-1" style={{ width: '50%', padding: '0 15px' }}>
                                    <FormInput
                                        label="Usuario (Login)"
                                        name="login"
                                        value={formData.login}
                                        disabled={true}
                                    />
                                </div>
                                <div className="col-6 pl-1" style={{ width: '50%', padding: '0 15px' }}>
                                    <FormInput
                                        label="Email"
                                        name="email"
                                        type="email"
                                        value={formData.email}
                                        disabled={true}
                                    />
                                </div>
                            </div>

                            {/* Row 2 */}
                            <div className="row" style={{ display: 'flex', flexWrap: 'wrap', margin: '0 -15px' }}>
                                <div className="col-6 pr-1" style={{ width: '50%', padding: '0 15px' }}>
                                    <FormInput
                                        label="Nombre"
                                        name="firstName"
                                        value={formData.firstName}
                                        onChange={handleChange}
                                    />
                                </div>
                                <div className="col-6 pl-1" style={{ width: '50%', padding: '0 15px' }}>
                                    <FormInput
                                        label="Apellido"
                                        name="lastName"
                                        value={formData.lastName}
                                        onChange={handleChange}
                                    />
                                </div>
                            </div>
                            
                            {/* System Info */}
                            <div className="row" style={{ display: 'flex', flexWrap: 'wrap', margin: '0 -15px' }}>
                                 <div className="col-4 pr-1" style={{ width: '33.33333%', padding: '0 15px' }}>
                                    <FormInput
                                        label="Idioma"
                                        name="langKey"
                                        value={formData.langKey}
                                        disabled={true}
                                    />
                                </div>
                                <div className="col-4 px-1" style={{ width: '33.33333%', padding: '0 15px' }}>
                                    <FormInput
                                        label="Estado"
                                        name="activated"
                                        value={formData.activated ? 'Activo' : 'Inactivo'}
                                        disabled={true}
                                    />
                                </div>
                            </div>

                            {/* Row Button - Disabled for now as backend sync handles updates mostly */}
                            <div className="row" style={{ display: 'flex', flexWrap: 'wrap', margin: '0 -15px' }}>
                                <div className="update ml-auto mr-auto" style={{ margin: '0 auto', marginTop: '15px' }}>
                                    <Button disabled>
                                        Actualizar (Gestionado por Keycloak)
                                    </Button>
                                </div>
                            </div>
                        </form>
                    </Card>
                </div>
            </div>
        </div>
    );
};

export default UserProfileView;
