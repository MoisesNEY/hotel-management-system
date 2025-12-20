import { useState, useEffect } from 'react';
import { createHotelService, updateHotelService } from '../../../services/admin/hotelServiceService';
import fileService from '../../../services/admin/fileService';
import type { HotelServiceDTO } from '../../../types/adminTypes';
import { Upload, X, Link, Loader2 } from 'lucide-react';


interface ServiceFormProps {
    initialData?: HotelServiceDTO | null;
    onSuccess: () => void;
    onCancel: () => void;
}

const ServiceForm = ({ initialData, onSuccess, onCancel }: ServiceFormProps) => {
    const [name, setName] = useState('');
    const [description, setDescription] = useState('');
    const [cost, setCost] = useState('');
    const [imageUrl, setImageUrl] = useState('');
    const [isAvailable, setIsAvailable] = useState(true);

    const [loading, setLoading] = useState(false);
    const [isUploading, setIsUploading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [isMinioImage, setIsMinioImage] = useState(false);

    useEffect(() => {
        if (initialData) {
            setName(initialData.name);
            setDescription(initialData.description || '');
            setCost(initialData.cost.toString());
            setImageUrl(initialData.imageUrl || '');
            setIsAvailable(initialData.isAvailable);

            // Si la URL contiene el bucketName o endpoint de minio, lo marcamos como minio (opcional)
            if (initialData.imageUrl?.includes('/api/files') || initialData.imageUrl?.includes('9000')) {
                setIsMinioImage(true);
            }
        }
    }, [initialData]);

    const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        setIsUploading(true);
        setError(null);
        try {
            const url = await fileService.uploadFile(file, 'services');
            setImageUrl(url);
            setIsMinioImage(true);
        } catch (err) {
            console.error("Error uploading file", err);
            setError("Error al subir la imagen");
        } finally {
            setIsUploading(false);
        }
    };

    const handleRemoveImage = () => {
        setImageUrl('');
        setIsMinioImage(false);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);

        if (!name || !cost) {
            setError("Nombre y costo son obligatorios");
            return;
        }

        const payload: HotelServiceDTO = {
            id: initialData?.id || 0, // ID is ignored on create usually, strictly typed
            name,
            description,
            cost: Number(cost),
            imageUrl,
            isAvailable
        };

        setLoading(true);
        try {
            if (initialData?.id) {
                await updateHotelService(initialData.id, payload);
            } else {
                // api expects Omit<HotelServiceDTO, 'id'> mostly, but let's check strict type
                // Usually we cast or object literal without ID for create
                const { id, ...createPayload } = payload;
                await createHotelService(createPayload as HotelServiceDTO);
            }
            onSuccess();
        } catch (err: any) {
            console.error("Error saving service", err);
            const serverMsg = err.response?.data?.detail || err.response?.data?.message || 'Error al guardar el servicio';
            setError(serverMsg);
        } finally {
            setLoading(false);
        }
    };

    // Estilos reutilizados de RoomForm
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

                {/* Name */}
                <div>
                    <label style={labelStyle}>
                        Nombre del Servicio <span style={{ color: '#ef4444' }}>*</span>
                    </label>
                    <input
                        type="text"
                        required
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        style={inputStyle}
                        onFocus={(e) => e.target.style.borderColor = '#51cbce'}
                        onBlur={(e) => e.target.style.borderColor = '#d1d5db'}
                    />
                </div>

                {/* Description */}
                <div>
                    <label style={labelStyle}>Descripción</label>
                    <textarea
                        rows={3}
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        style={{ ...inputStyle, minHeight: '80px', resize: 'vertical' }}
                        onFocus={(e) => e.target.style.borderColor = '#51cbce'}
                        onBlur={(e) => e.target.style.borderColor = '#d1d5db'}
                    />
                </div>

                {/* Cost */}
                <div>
                    <label style={labelStyle}>
                        Costo <span style={{ color: '#ef4444' }}>*</span>
                    </label>
                    <input
                        type="number"
                        min="0"
                        step="0.01"
                        required
                        value={cost}
                        onChange={(e) => setCost(e.target.value)}
                        style={inputStyle}
                        onFocus={(e) => e.target.style.borderColor = '#51cbce'}
                        onBlur={(e) => e.target.style.borderColor = '#d1d5db'}
                    />
                </div>

                {/* Image URL & File Upload */}
                <div>
                    <label style={labelStyle}>Imagen del Servicio</label>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                        <div style={{ display: 'flex', gap: '8px' }}>
                            <div style={{ position: 'relative', flex: 1 }}>
                                <div style={{
                                    position: 'absolute',
                                    left: '12px',
                                    top: '50%',
                                    transform: 'translateY(-50%)',
                                    color: '#9ca3af',
                                    display: 'flex',
                                    alignItems: 'center'
                                }}>
                                    <Link size={16} />
                                </div>
                                <input
                                    type="text"
                                    value={imageUrl}
                                    onChange={(e) => setImageUrl(e.target.value)}
                                    placeholder="https://example.com/image.jpg"
                                    disabled={isMinioImage || isUploading}
                                    style={{
                                        ...inputStyle,
                                        paddingLeft: '36px',
                                        backgroundColor: (isMinioImage || isUploading) ? '#f3f4f6' : '#ffffff',
                                        cursor: (isMinioImage || isUploading) ? 'not-allowed' : 'text'
                                    }}
                                    onFocus={(e) => e.target.style.borderColor = '#51cbce'}
                                    onBlur={(e) => e.target.style.borderColor = '#d1d5db'}
                                />
                            </div>

                            {!isMinioImage ? (
                                <div style={{ position: 'relative' }}>
                                    <input
                                        type="file"
                                        id="service-image-upload"
                                        style={{ display: 'none' }}
                                        accept="image/*"
                                        onChange={handleFileUpload}
                                        disabled={isUploading}
                                    />
                                    <label
                                        htmlFor="service-image-upload"
                                        style={{
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            width: '42px',
                                            height: '42px',
                                            backgroundColor: '#ffffff',
                                            border: '1px solid #d1d5db',
                                            borderRadius: '8px',
                                            cursor: isUploading ? 'not-allowed' : 'pointer',
                                            color: '#6b7280',
                                            transition: 'all 0.2s'
                                        }}
                                        title="Subir archivo"
                                    >
                                        {isUploading ? <Loader2 size={18} className="animate-spin" /> : <Upload size={18} />}
                                    </label>
                                </div>
                            ) : (
                                <button
                                    type="button"
                                    onClick={handleRemoveImage}
                                    style={{
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        width: '42px',
                                        height: '42px',
                                        backgroundColor: '#fee2e2',
                                        border: '1px solid #fecaca',
                                        borderRadius: '8px',
                                        cursor: 'pointer',
                                        color: '#ef4444',
                                        transition: 'all 0.2s'
                                    }}
                                    title="Quitar imagen"
                                >
                                    <X size={18} />
                                </button>
                            )}
                        </div>

                        {imageUrl && (
                            <div style={{
                                width: '100%',
                                height: '120px',
                                border: '1px solid #e5e7eb',
                                borderRadius: '12px',
                                overflow: 'hidden',
                                backgroundColor: '#f9fafb',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center'
                            }}>
                                <img
                                    src={imageUrl}
                                    alt="Preview"
                                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                                    onError={(e) => (e.currentTarget.src = 'https://images.unsplash.com/photo-1551882547-ff43c619c721?auto=format&fit=crop&q=80&w=400')}
                                />
                            </div>
                        )}

                        <p style={{ fontSize: '10px', color: '#9ca3af', margin: 0 }}>
                            {isMinioImage
                                ? "Imagen subida a almacenamiento interno. Desbloquea para usar una URL externa."
                                : "Puedes ingresar una URL directa o subir un archivo comprimido/imagen."}
                        </p>
                    </div>
                </div>

                {/* Availability */}
                <div style={{ display: 'flex', alignItems: 'center' }}>
                    <input
                        id="isAvailable"
                        type="checkbox"
                        checked={isAvailable}
                        onChange={(e) => setIsAvailable(e.target.checked)}
                        style={{
                            width: '16px',
                            height: '16px',
                            marginRight: '8px',
                            cursor: 'pointer'
                        }}
                    />
                    <label htmlFor="isAvailable" style={{ fontSize: '14px', color: '#374151', cursor: 'pointer' }}>
                        Disponible para solicitar
                    </label>
                </div>
            </div>

            {/* Footer Buttons */}
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
                    {loading ? 'Guardando...' : (initialData ? 'Actualizar' : 'Crear')}
                </button>
            </div>
        </form>
    );
};

export default ServiceForm;
