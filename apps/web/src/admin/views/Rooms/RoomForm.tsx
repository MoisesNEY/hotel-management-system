import { useState, useEffect } from 'react';
import { Save } from 'lucide-react';
import Button from '../../components/shared/Button';
import { createRoom, updateRoom } from '../../../services/admin/roomService';
import { getAllRoomTypes } from '../../../services/admin/roomTypeService';
import type { RoomDTO, RoomTypeDTO, RoomStatus } from '../../../types/sharedTypes';

interface RoomFormProps {
    initialData?: RoomDTO | null;
    roomTypes: RoomTypeDTO[];
    onSuccess: () => void;
    onCancel: () => void;
}

const RoomForm = ({ initialData, roomTypes, onSuccess, onCancel }: RoomFormProps) => {
    const [formData, setFormData] = useState<Partial<RoomDTO>>({
        roomNumber: '',
        roomType: roomTypes.length > 0 ? roomTypes[0] : undefined,
        status: 'AVAILABLE' as RoomStatus
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (initialData) {
            setFormData(initialData);
        } else if (roomTypes.length > 0 && !formData.roomType) {
            setFormData(prev => ({ ...prev, roomType: roomTypes[0] }));
        }
    }, [initialData, roomTypes]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        
        if (name === 'roomTypeId') {
            const selectedType = roomTypes.find(rt => rt.id === Number(value));
            setFormData(prev => ({
                ...prev,
                roomType: selectedType
            }));
        } else {
             setFormData(prev => ({
                ...prev,
                [name]: value
            }));
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        try {
            if (initialData && initialData.id) {
                await updateRoom(initialData.id, formData as RoomDTO);
            } else {
                await createRoom(formData as RoomDTO);
            }
            onSuccess();
        } catch (err) {
            console.error(err);
            setError('Error al guardar la habitación. Verifique que el número no esté duplicado.');
        } finally {
            setLoading(false);
        }
    };

    const inputStyle = "w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#51cbce] focus:border-transparent outline-none transition-all";
    const labelStyle = "block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1";

    return (
        <form onSubmit={handleSubmit} className="space-y-6 p-6">
            {error && (
                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
                    {error}
                </div>
            )}

            <div>
                <label className={labelStyle}>
                    Número de Habitación <span className="text-red-500">*</span>
                </label>
                <input
                    type="text"
                    name="roomNumber"
                    value={formData.roomNumber}
                    onChange={handleChange}
                    required
                    placeholder="Ej: 101, 205B"
                    className={inputStyle}
                />
            </div>

            <div>
                <label className={labelStyle}>
                    Tipo de Habitación <span className="text-red-500">*</span>
                </label>
                <select
                    name="roomTypeId"
                    value={formData.roomType?.id || ''}
                    onChange={handleChange}
                    required
                    className={inputStyle}
                >
                    <option value="">Seleccionar tipo...</option>
                    {roomTypes.map(type => (
                        <option key={type.id} value={type.id}>
                            {type.name} - ${type.basePrice}
                        </option>
                    ))}
                </select>
            </div>

            <div>
                <label className={labelStyle}>
                    Estado <span className="text-red-500">*</span>
                </label>
                <select
                    name="status"
                    value={formData.status}
                    onChange={handleChange}
                    required
                    className={inputStyle}
                >
                    <option value="AVAILABLE">Disponible</option>
                    <option value="OCCUPIED">Ocupada</option>
                    <option value="MAINTENANCE">Mantenimiento</option>
                    <option value="CLEANING">Limpieza</option>
                </select>
            </div>

            <div className="flex justify-end gap-3 pt-4 border-t border-gray-100">
                <Button 
                    type="button" 
                    variant="ghost" 
                    onClick={onCancel}
                    disabled={loading}
                >
                    Cancelar
                </Button>
                <Button 
                    type="submit" 
                    variant="primary"
                    disabled={loading || !formData.roomType}
                    leftIcon={<Save size={16} />}
                >
                    {loading ? 'Guardando...' : 'Guardar'}
                </Button>
            </div>
        </form>
    );
};

export default RoomForm;
