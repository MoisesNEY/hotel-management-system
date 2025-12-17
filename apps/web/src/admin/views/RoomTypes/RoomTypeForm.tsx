import { useState, useEffect } from 'react';
import { roomTypesService } from '../../services/api';
import type { RoomType } from '../../services/api';

interface RoomTypeFormProps {
    initialData?: RoomType | null;
    onSuccess: () => void;
    onCancel: () => void;
}

const RoomTypeForm = ({ initialData, onSuccess, onCancel }: RoomTypeFormProps) => {
    const [formData, setFormData] = useState<Partial<RoomType>>({
        name: '',
        description: '',
        basePrice: 0,
        maxCapacity: 1,
        imageUrl: '',
        area: 0,
        beds: 1
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (initialData) {
            setFormData(initialData);
        }
    }, [initialData]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: name === 'basePrice' || name === 'maxCapacity' || name === 'beds' || name === 'area'
                ? parseFloat(value) || 0
                : value
        }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        try {
            if (initialData?.id) {
                await roomTypesService.update(initialData.id, formData);
            } else {
                await roomTypesService.create(formData as RoomType);
            }
            onSuccess();
        } catch (err) {
            console.error(err);
            setError('Error al guardar el tipo de habitación');
        } finally {
            setLoading(false);
        }
    };

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
        gridTemplateColumns: '1fr',
        gap: '16px',
    };

    const grid2ColumnsStyle: React.CSSProperties = {
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
        gap: '16px',
    };

    return (
        <form onSubmit={handleSubmit}>
            <div style={{ padding: '24px 24px', ...gridStyle }}>
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

                <div>
                    <label style={labelStyle}>
                        Nombre del Tipo <span style={{ color: '#ef4444' }}>*</span>
                    </label>
                    <input
                        type="text"
                        name="name"
                        value={formData.name}
                        onChange={handleChange}
                        required
                        placeholder="Ej: Suite Junior, Doble Estándar"
                        style={inputStyle}
                        onFocus={(e) => e.target.style.borderColor = '#51cbce'}
                        onBlur={(e) => e.target.style.borderColor = '#d1d5db'}
                    />
                </div>

                <div>
                    <label style={labelStyle}>Descripción</label>
                    <textarea
                        name="description"
                        value={formData.description}
                        onChange={handleChange}
                        placeholder="Describe las características principales..."
                        style={{ ...inputStyle, minHeight: '100px', resize: 'vertical' }}
                        onFocus={(e) => e.target.style.borderColor = '#51cbce'}
                        onBlur={(e) => e.target.style.borderColor = '#d1d5db'}
                    />
                </div>

                <div style={grid2ColumnsStyle}>
                    <div>
                        <label style={labelStyle}>
                            Precio Base <span style={{ color: '#ef4444' }}>*</span>
                        </label>
                        <input
                            type="number"
                            name="basePrice"
                            value={formData.basePrice}
                            onChange={handleChange}
                            min="0"
                            step="0.01"
                            required
                            placeholder="0.00"
                            style={inputStyle}
                            onFocus={(e) => e.target.style.borderColor = '#51cbce'}
                            onBlur={(e) => e.target.style.borderColor = '#d1d5db'}
                        />
                    </div>

                    <div>
                        <label style={labelStyle}>
                            Capacidad Máxima <span style={{ color: '#ef4444' }}>*</span>
                        </label>
                        <input
                            type="number"
                            name="maxCapacity"
                            value={formData.maxCapacity}
                            onChange={handleChange}
                            min="1"
                            required
                            placeholder="1"
                            style={inputStyle}
                            onFocus={(e) => e.target.style.borderColor = '#51cbce'}
                            onBlur={(e) => e.target.style.borderColor = '#d1d5db'}
                        />
                    </div>
                </div>

                <div style={grid2ColumnsStyle}>
                    <div>
                        <label style={labelStyle}>Número de Camas</label>
                        <input
                            type="number"
                            name="beds"
                            value={formData.beds}
                            onChange={handleChange}
                            min="1"
                            placeholder="1"
                            style={inputStyle}
                            onFocus={(e) => e.target.style.borderColor = '#51cbce'}
                            onBlur={(e) => e.target.style.borderColor = '#d1d5db'}
                        />
                    </div>

                    <div>
                        <label style={labelStyle}>Área (m²)</label>
                        <input
                            type="number"
                            name="area"
                            value={formData.area}
                            onChange={handleChange}
                            min="0"
                            placeholder="0"
                            style={inputStyle}
                            onFocus={(e) => e.target.style.borderColor = '#51cbce'}
                            onBlur={(e) => e.target.style.borderColor = '#d1d5db'}
                        />
                    </div>
                </div>

                <div>
                    <label style={labelStyle}>URL de Imagen</label>
                    <input
                        type="text"
                        name="imageUrl"
                        value={formData.imageUrl}
                        onChange={handleChange}
                        placeholder="https://example.com/image.jpg"
                        style={inputStyle}
                        onFocus={(e) => e.target.style.borderColor = '#51cbce'}
                        onBlur={(e) => e.target.style.borderColor = '#d1d5db'}
                    />
                    <p style={{ fontSize: '12px', color: '#9ca3af', marginTop: '4px' }}>
                        URL de la imagen de referencia del tipo de habitación
                    </p>
                </div>
            </div>

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

export default RoomTypeForm;
