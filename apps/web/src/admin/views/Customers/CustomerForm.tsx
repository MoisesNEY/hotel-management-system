import { useState, useEffect } from 'react';
import { createCustomer, updateCustomer } from '../../../services/admin/customerService';
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
    const [addressLine2, setAddressLine2] = useState('');
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
            const payload: CustomerDTO = {
                id: initialData?.id || 0,
                firstName,
                lastName,
                email,
                gender,
                phone,
                addressLine1,
                addressLine2: addressLine2 || undefined,
                city,
                country,
                licenseId,
                birthDate,
                user: initialData?.user // Preserve link if editing an existing online customer
            };

            if (initialData?.id) {
                await updateCustomer(initialData.id, payload);
            } else {
                await createCustomer(payload);
            }
            onSuccess();
        } catch (err) {
            console.error(err);
            setError('Error al guardar el cliente');
        } finally {
            setLoading(false);
        }
    };

    // Estilos reutilizados
    const inputStyle: React.CSSProperties = {
        width: '100%',
        padding: '10px 12px',
        border: '1px solid #d1d5db',
        borderRadius: '8px',
        fontSize: '14px',
        backgroundColor: '#ffffff',
        outline: 'none',
        transition: 'all 0.2s',
    };

    const labelStyle: React.CSSProperties = {
        display: 'block',
        fontSize: '11px',
        fontWeight: 600,
        textTransform: 'uppercase',
        letterSpacing: '0.5px',
        color: '#6b7280',
        marginBottom: '6px',
    };

    const gridStyle: React.CSSProperties = {
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
        gap: '16px',
    };

    return (
        <form onSubmit={handleSubmit}>
            <div style={{ padding: '24px 24px', display: 'grid', gap: '16px' }}>
                {error && (
                    <div style={{
                        padding: '12px',
                        backgroundColor: '#fef2f2',
                        border: '1px solid #fecaca',
                        borderRadius: '8px',
                        color: '#991b1b',
                        fontSize: '14px'
                    }}>
                        {error}
                    </div>
                )}

                {/* Datos de Usuario */}
                <h3 style={{ fontSize: '14px', fontWeight: 600, color: '#374151', borderBottom: '1px solid #e5e7eb', paddingBottom: '8px' }}>
                    Información Personal
                </h3>
                <div style={gridStyle}>
                    <div>
                        <label style={labelStyle}>Nombre <span style={{ color: '#ef4444' }}>*</span></label>
                        <input
                            type="text"
                            value={firstName}
                            onChange={(e) => setFirstName(e.target.value)}
                            required
                            style={inputStyle}
                            onFocus={(e) => e.target.style.borderColor = '#51cbce'}
                            onBlur={(e) => e.target.style.borderColor = '#d1d5db'}
                        />
                    </div>
                    <div>
                        <label style={labelStyle}>Apellidos <span style={{ color: '#ef4444' }}>*</span></label>
                        <input
                            type="text"
                            value={lastName}
                            onChange={(e) => setLastName(e.target.value)}
                            required
                            style={inputStyle}
                            onFocus={(e) => e.target.style.borderColor = '#51cbce'}
                            onBlur={(e) => e.target.style.borderColor = '#d1d5db'}
                        />
                    </div>
                </div>

                <div>
                    <label style={labelStyle}>Email <span style={{ color: '#ef4444' }}>*</span></label>
                    <input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                        style={inputStyle}
                        onFocus={(e) => e.target.style.borderColor = '#51cbce'}
                        onBlur={(e) => e.target.style.borderColor = '#d1d5db'}
                    />
                </div>

                <div style={gridStyle}>
                    <div>
                        <label style={labelStyle}>Género</label>
                        <select
                            value={gender}
                            onChange={(e) => setGender(e.target.value as Gender)}
                            style={inputStyle}
                            onFocus={(e) => e.target.style.borderColor = '#51cbce'}
                            onBlur={(e) => e.target.style.borderColor = '#d1d5db'}
                        >
                            <option value="MALE">Masculino</option>
                            <option value="FEMALE">Femenino</option>
                            <option value="OTHER">Otro</option>
                        </select>
                    </div>
                    <div>
                        <label style={labelStyle}>Fecha de Nacimiento <span style={{ color: '#ef4444' }}>*</span></label>
                        <input
                            type="date"
                            value={birthDate}
                            onChange={(e) => setBirthDate(e.target.value)}
                            required
                            style={inputStyle}
                            onFocus={(e) => e.target.style.borderColor = '#51cbce'}
                            onBlur={(e) => e.target.style.borderColor = '#d1d5db'}
                        />
                    </div>
                </div>

                {/* Datos de Contacto */}
                <h3 style={{ fontSize: '14px', fontWeight: 600, color: '#374151', borderBottom: '1px solid #e5e7eb', paddingBottom: '8px', marginTop: '8px' }}>
                    Dirección y Contacto
                </h3>

                <div style={gridStyle}>
                    <div>
                        <label style={labelStyle}>Teléfono <span style={{ color: '#ef4444' }}>*</span></label>
                        <input
                            type="tel"
                            value={phone}
                            onChange={(e) => setPhone(e.target.value)}
                            required
                            style={inputStyle}
                            onFocus={(e) => e.target.style.borderColor = '#51cbce'}
                            onBlur={(e) => e.target.style.borderColor = '#d1d5db'}
                        />
                    </div>
                    <div>
                        <label style={labelStyle}>DNI / Pasaporte <span style={{ color: '#ef4444' }}>*</span></label>
                        <input
                            type="text"
                            value={licenseId}
                            onChange={(e) => setLicenseId(e.target.value)}
                            required
                            style={inputStyle}
                            onFocus={(e) => e.target.style.borderColor = '#51cbce'}
                            onBlur={(e) => e.target.style.borderColor = '#d1d5db'}
                        />
                    </div>
                </div>

                <div>
                    <label style={labelStyle}>Dirección 1 <span style={{ color: '#ef4444' }}>*</span></label>
                    <input
                        type="text"
                        value={addressLine1}
                        onChange={(e) => setAddressLine1(e.target.value)}
                        required
                        style={inputStyle}
                        onFocus={(e) => e.target.style.borderColor = '#51cbce'}
                        onBlur={(e) => e.target.style.borderColor = '#d1d5db'}
                    />
                </div>

                <div>
                    <label style={labelStyle}>Dirección 2</label>
                    <input
                        type="text"
                        value={addressLine2}
                        onChange={(e) => setAddressLine2(e.target.value)}
                        style={inputStyle}
                        onFocus={(e) => e.target.style.borderColor = '#51cbce'}
                        onBlur={(e) => e.target.style.borderColor = '#d1d5db'}
                    />
                </div>

                <div style={gridStyle}>
                    <div>
                        <label style={labelStyle}>Ciudad <span style={{ color: '#ef4444' }}>*</span></label>
                        <input
                            type="text"
                            value={city}
                            onChange={(e) => setCity(e.target.value)}
                            required
                            style={inputStyle}
                            onFocus={(e) => e.target.style.borderColor = '#51cbce'}
                            onBlur={(e) => e.target.style.borderColor = '#d1d5db'}
                        />
                    </div>
                    <div>
                        <label style={labelStyle}>País <span style={{ color: '#ef4444' }}>*</span></label>
                        <input
                            type="text"
                            value={country}
                            onChange={(e) => setCountry(e.target.value)}
                            required
                            style={inputStyle}
                            onFocus={(e) => e.target.style.borderColor = '#51cbce'}
                            onBlur={(e) => e.target.style.borderColor = '#d1d5db'}
                        />
                    </div>
                </div>

            </div>

            {/* Footer con botones */}
            <div style={{
                display: 'flex',
                justifyContent: 'flex-end',
                gap: '12px',
                padding: '16px 24px',
                borderTop: '1px solid #e5e7eb'
            }}>
                <button
                    type="button"
                    onClick={onCancel}
                    disabled={loading}
                    style={{
                        padding: '8px 16px',
                        border: '1px solid #d1d5db',
                        borderRadius: '20px',
                        backgroundColor: '#ffffff',
                        color: '#6b7280',
                        fontSize: '12px',
                        fontWeight: 600,
                        textTransform: 'uppercase',
                        cursor: loading ? 'not-allowed' : 'pointer',
                        opacity: loading ? 0.5 : 1,
                        transition: 'all 0.2s',
                    }}
                    onMouseEnter={(e) => !loading && (e.currentTarget.style.backgroundColor = '#f9fafb')}
                    onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#ffffff'}
                >
                    Cancelar
                </button>
                <button
                    type="submit"
                    disabled={loading}
                    style={{
                        padding: '8px 24px',
                        border: 'none',
                        borderRadius: '20px',
                        backgroundColor: '#51cbce',
                        color: '#ffffff',
                        fontSize: '12px',
                        fontWeight: 600,
                        textTransform: 'uppercase',
                        cursor: loading ? 'not-allowed' : 'pointer',
                        opacity: loading ? 0.5 : 1,
                        boxShadow: '0 4px 6px rgba(81, 203, 206, 0.3)',
                        transition: 'all 0.2s',
                    }}
                    onMouseEnter={(e) => !loading && (e.currentTarget.style.backgroundColor = '#4bc2c5')}
                    onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#51cbce'}
                >
                    {loading ? 'Guardando...' : 'Guardar'}
                </button>
            </div>
        </form>
    );
};

export default CustomerForm;
