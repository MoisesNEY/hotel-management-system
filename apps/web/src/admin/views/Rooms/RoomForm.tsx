import { useState, useEffect } from 'react';
import { roomsService, roomTypesService } from '../../services/api';
import type { Room, RoomType } from '../../services/api';
import type { RoomStatus } from '../../../types/sharedTypes';

interface RoomFormProps {
    initialData?: Room | null;
    onSuccess: () => void;
    onCancel: () => void;
}

const RoomForm = ({ initialData, onSuccess, onCancel }: RoomFormProps) => {
    const [formData, setFormData] = useState<Partial<Room>>({
        roomNumber: '',
        status: 'AVAILABLE',
        roomType: undefined
    });

    const [selectedTypeId, setSelectedTypeId] = useState<number | string>('');
    const [roomTypes, setRoomTypes] = useState<RoomType[]>([]);

    const [loading, setLoading] = useState(false);
    const [loadingTypes, setLoadingTypes] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const loadTypes = async () => {
            try {
                const types = await roomTypesService.getAll();
                setRoomTypes(types);
            } catch (e) {
                console.error("Error loading types", e);
            } finally {
                setLoadingTypes(false);
            }
        };
        loadTypes();
    }, []);

    useEffect(() => {
        if (initialData) {
            setFormData(initialData);
            if (initialData.roomType) {
                setSelectedTypeId(initialData.roomType.id);
            }
        }
    }, [initialData]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleTypeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const typeId = parseInt(e.target.value);
        setSelectedTypeId(typeId);
        const selectedType = roomTypes.find(t => t.id === typeId);
        setFormData(prev => ({ ...prev, roomType: selectedType }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        if (!formData.roomType && !selectedTypeId) {
            setError('Debe seleccionar un tipo de habitación');
            setLoading(false);
            return;
        }

        try {
            const payload = {
                ...formData,
                roomType: roomTypes.find(t => t.id === Number(selectedTypeId))
            };

            if (initialData?.id) {
                await roomsService.update(initialData.id, payload);
            } else {
                await roomsService.create(payload as Room);
            }
            onSuccess();
        } catch (err) {
            console.error(err);
            setError('Error al guardar la habitación');
        } finally {
            setLoading(false);
        }
    };

    const statuses: RoomStatus[] = ['AVAILABLE', 'OCCUPIED', 'MAINTENANCE', 'CLEANING'];

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

                <div>
                    <label style={labelStyle}>
                        Número de Habitación <span style={{ color: '#ef4444' }}>*</span>
                    </label>
                    <input
                        type="text"
                        name="roomNumber"
                        value={formData.roomNumber}
                        onChange={handleChange}
                        required
                        placeholder="Ej: 101"
                        style={inputStyle}
                        onFocus={(e) => e.target.style.borderColor = '#51cbce'}
                        onBlur={(e) => e.target.style.borderColor = '#d1d5db'}
                    />
                </div>

                <div style={gridStyle}>
                    <div>
                        <label style={labelStyle}>
                            Tipo de Habitación <span style={{ color: '#ef4444' }}>*</span>
                        </label>
                        <select
                            name="roomType"
                            value={selectedTypeId}
                            onChange={handleTypeChange}
                            required
                            style={inputStyle}
                            onFocus={(e) => e.target.style.borderColor = '#51cbce'}
                            onBlur={(e) => e.target.style.borderColor = '#d1d5db'}
                        >
                            <option value="">-- Seleccionar Tipo --</option>
                            {roomTypes.map(type => (
                                <option key={type.id} value={type.id}>
                                    {type.name} (Cap: {type.maxCapacity})
                                </option>
                            ))}
                        </select>
                        {loadingTypes && <span style={{ fontSize: '12px', color: '#9ca3af' }}>Cargando tipos...</span>}
                    </div>

                    <div>
                        <label style={labelStyle}>Estado</label>
                        <select
                            name="status"
                            value={formData.status}
                            onChange={handleChange}
                            style={inputStyle}
                            onFocus={(e) => e.target.style.borderColor = '#51cbce'}
                            onBlur={(e) => e.target.style.borderColor = '#d1d5db'}
                        >
                            {statuses.map(status => (
                                <option key={status} value={status}>{status}</option>
                            ))}
                        </select>
                    </div>
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

export default RoomForm;
