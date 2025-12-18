import { useState, useEffect } from 'react';
import { 
    Save, Type, FileText, 
    DollarSign, Users, Bed, 
    Maximize, Image as ImageIcon, 
    Loader2, AlertCircle, 
    ChevronRight
} from 'lucide-react';
import Button from '../../components/shared/Button';
import { createRoomType, updateRoomType } from '../../../services/admin/roomTypeService';
import type { RoomTypeDTO } from '../../../types/adminTypes';

interface RoomTypeFormProps {
    initialData?: RoomTypeDTO | null;
    onSuccess: () => void;
    onCancel: () => void;
}

const RoomTypeForm = ({ initialData, onSuccess, onCancel }: RoomTypeFormProps) => {
    const [formData, setFormData] = useState<Partial<RoomTypeDTO>>({
        name: '',
        description: '',
        basePrice: 0,
        maxCapacity: 1,
        beds: 1,
        area: 0,
        imageUrl: ''
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
            if (initialData && initialData.id) {
                await updateRoomType(initialData.id, formData as RoomTypeDTO);
            } else {
                await createRoomType(formData as RoomTypeDTO);
            }
            onSuccess();
        } catch (err: any) {
            console.error(err);
            if (err.response?.status === 409) {
                setError(err.response.data?.detail || 'Ya existe un tipo de habitación con este nombre');
            } else {
                setError('Error al guardar el tipo de habitación. Por favor, intente de nuevo.');
            }
        } finally {
            setLoading(false);
        }
    };

    const inputStyle = "w-full px-4 py-3 bg-white dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-2xl text-sm text-gray-900 dark:text-white focus:ring-2 focus:ring-gold-default/20 focus:border-gold-default outline-none transition-all placeholder:text-gray-400 disabled:opacity-50 disabled:cursor-not-allowed";
    const labelStyle = "block text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-widest mb-2 ml-1";

    return (
        <form onSubmit={handleSubmit} className="space-y-8 p-10">
            {error && (
                <div className="flex items-start gap-4 p-5 bg-red-50 dark:bg-red-500/5 border border-red-100 dark:border-red-500/20 rounded-3xl animate-shake">
                    <div className="p-2 rounded-xl bg-red-100 dark:bg-red-500/20 text-red-600 dark:text-red-400">
                        <AlertCircle size={20} />
                    </div>
                    <div className="flex-1">
                        <p className="text-sm font-bold text-red-800 dark:text-red-300">Resuelva lo siguiente</p>
                        <p className="text-xs text-red-600 dark:text-red-400 leading-relaxed mt-1 opacity-90">{error}</p>
                    </div>
                </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* Name */}
                <div className="space-y-2 group md:col-span-2">
                    <label className={labelStyle}>
                        Nombre de la Categoría <span className="text-gold-default">*</span>
                    </label>
                    <div className="relative">
                        <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-gold-default transition-colors">
                            <Type size={18} />
                        </div>
                        <input
                            type="text"
                            name="name"
                            value={formData.name}
                            onChange={handleChange}
                            required
                            minLength={3}
                            placeholder="Ej: Suite Junior, Doble Estándar"
                            className={`${inputStyle} pl-12`}
                        />
                    </div>
                </div>

                {/* Description */}
                <div className="space-y-2 group md:col-span-2">
                    <label className={labelStyle}>Descripción Detallada</label>
                    <div className="relative">
                        <div className="absolute left-4 top-6 text-gray-400 group-focus-within:text-gold-default transition-colors">
                            <FileText size={18} />
                        </div>
                        <textarea
                            name="description"
                            value={formData.description || ''}
                            onChange={handleChange}
                            placeholder="Describe las amenidades y características únicas..."
                            className={`${inputStyle} pl-12 h-32 resize-none pt-4`}
                        />
                    </div>
                </div>

                {/* Price */}
                <div className="space-y-2 group">
                    <label className={labelStyle}>
                        Precio Base <span className="text-gold-default">*</span>
                    </label>
                    <div className="relative">
                        <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-gold-default transition-colors">
                            <DollarSign size={18} />
                        </div>
                        <input
                            type="number"
                            name="basePrice"
                            value={formData.basePrice}
                            onChange={handleChange}
                            min="0"
                            step="0.01"
                            required
                            className={`${inputStyle} pl-12`}
                        />
                    </div>
                </div>

                {/* Capacity */}
                <div className="space-y-2 group">
                    <label className={labelStyle}>
                        Capacidad <span className="text-gold-default">*</span>
                    </label>
                    <div className="relative">
                        <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-gold-default transition-colors">
                            <Users size={18} />
                        </div>
                        <input
                            type="number"
                            name="maxCapacity"
                            value={formData.maxCapacity}
                            onChange={handleChange}
                            min="1"
                            required
                            className={`${inputStyle} pl-12`}
                        />
                    </div>
                </div>

                {/* Beds */}
                <div className="space-y-2 group">
                    <label className={labelStyle}>Número de Camas</label>
                    <div className="relative">
                        <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-gold-default transition-colors">
                            <Bed size={18} />
                        </div>
                        <input
                            type="number"
                            name="beds"
                            value={formData.beds}
                            onChange={handleChange}
                            min="1"
                            className={`${inputStyle} pl-12`}
                        />
                    </div>
                </div>

                {/* Area */}
                <div className="space-y-2 group">
                    <label className={labelStyle}>Área (m²)</label>
                    <div className="relative">
                        <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-gold-default transition-colors">
                            <Maximize size={18} />
                        </div>
                        <input
                            type="number"
                            name="area"
                            value={formData.area}
                            onChange={handleChange}
                            min="0"
                            className={`${inputStyle} pl-12`}
                        />
                    </div>
                </div>

                {/* Image URL */}
                <div className="space-y-2 group md:col-span-2">
                    <label className={labelStyle}>Enlace de la Imagen</label>
                    <div className="relative">
                        <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-gold-default transition-colors">
                            <ImageIcon size={18} />
                        </div>
                        <input
                            type="text"
                            name="imageUrl"
                            value={formData.imageUrl || ''}
                            onChange={handleChange}
                            placeholder="https://cdn.example.com/suites/junior-suite.jpg"
                            className={`${inputStyle} pl-12`}
                        />
                    </div>
                    {formData.imageUrl && (
                        <div className="mt-4 rounded-3xl overflow-hidden aspect-video bg-gray-100 dark:bg-white/5 border border-gray-200 dark:border-white/10 relative group">
                            <img 
                                src={formData.imageUrl} 
                                alt="Previsualización" 
                                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                                onError={(e) => (e.currentTarget.src = 'https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&q=80&w=800')}
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-6">
                                <p className="text-white text-xs font-bold tracking-widest uppercase">Vista Previa de Categoría</p>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            <div className="flex items-center justify-between gap-4 pt-10 border-t border-gray-100 dark:border-white/5">
                <p className="text-[11px] text-gray-400 font-medium flex items-center gap-2">
                    <ChevronRight size={12} className="text-gold-default" />
                    Campos marcados con asterisco son requeridos
                </p>
                <div className="flex gap-4">
                    <Button 
                        type="button" 
                        variant="ghost" 
                        onClick={onCancel}
                        disabled={loading}
                        className="px-8 rounded-xl"
                    >
                        Cancelar
                    </Button>
                    <Button 
                        type="submit" 
                        variant="primary"
                        disabled={loading}
                        className="px-10 min-w-[160px] rounded-xl"
                        leftIcon={loading ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
                    >
                        {loading ? 'Procesando...' : initialData ? 'Guardar Cambios' : 'Crear Categoría'}
                    </Button>
                </div>
            </div>

        </form>
    );
};

export default RoomTypeForm;
