import { useEffect, useState } from 'react';
import { formatCurrency } from '../../utils/helpers';
import ServiceForm from './ServiceForm';
import Modal from '../../components/shared/Modal';
import { Trash2, Plus, Edit, CheckCircle2, XCircle, AlertTriangle, RefreshCw } from 'lucide-react';
import Table, { type Column } from '../../components/shared/Table';
import Button from '../../components/shared/Button';
import Badge from '../../components/shared/Badge';
import Card from '../../components/shared/Card';
import { getAllHotelServices, deleteHotelService, updateHotelService } from '../../../services/admin/hotelServiceService';
import type { HotelServiceDTO } from '../../../types/adminTypes';

// Service Status configuration matching backend enum
const SERVICE_STATUS_CONFIG: Record<string, { label: string; variant: 'success' | 'warning' | 'danger' | 'info' }> = {
    'OPERATIONAL': { label: 'Operativo', variant: 'success' },
    'CLOSED': { label: 'Cerrado', variant: 'danger' },
    'FULL_CAPACITY': { label: 'Capacidad Llena', variant: 'warning' },
    'DOWN': { label: 'Fuera de Servicio', variant: 'info' },
};

const STATUS_ORDER = ['OPERATIONAL', 'CLOSED', 'FULL_CAPACITY', 'DOWN'];

const ServicesView = () => {
    const [services, setServices] = useState<HotelServiceDTO[]>([]);
    const [loading, setLoading] = useState(true);

    // Form State
    const [showForm, setShowForm] = useState(false);
    const [editingService, setEditingService] = useState<HotelServiceDTO | null>(null);

    // Feedback State
    const [feedback, setFeedback] = useState<{
        show: boolean;
        title: string;
        message: string;
        type: 'success' | 'error' | 'warning';
    }>({ show: false, title: '', message: '', type: 'success' });

    const showSuccess = (title: string, message: string) => {
        setFeedback({ show: true, title, message, type: 'success' });
    };

    const showError = (title: string, message: string) => {
        setFeedback({ show: true, title, message, type: 'error' });
    };

    const loadData = async () => {
        try {
            setLoading(true);
            const servicesResponse = await getAllHotelServices(0, 100);
            setServices(servicesResponse.data);
        } catch (error) {
            console.error("Error loading services", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadData();
    }, []);

    // Handlers
    const handleCreateClick = () => {
        setEditingService(null);
        setShowForm(true);
    };

    const handleEditClick = (service: HotelServiceDTO) => {
        setEditingService(service);
        setShowForm(true);
    };

    const handleDeleteClick = async (id: number) => {
        try {
            await deleteHotelService(id);
            setServices(prev => prev.filter(s => s.id !== id));
            showSuccess('Servicio Eliminado', 'El servicio ha sido eliminado del catálogo.');
        } catch (error: any) {
            console.error("Error deleting service", error);
            const serverMsg = error.response?.data?.detail || error.response?.data?.message || 'No se pudo eliminar el servicio.';
            showError('Error al Eliminar', serverMsg);
        }
    };

    // Quick status change - cycles through statuses
    const handleQuickStatusChange = async (service: HotelServiceDTO) => {
        const currentIndex = STATUS_ORDER.indexOf(service.status || 'OPERATIONAL');
        const nextIndex = (currentIndex + 1) % STATUS_ORDER.length;
        const newStatus = STATUS_ORDER[nextIndex];

        try {
            const updatedService = { ...service, status: newStatus };
            await updateHotelService(service.id!, updatedService);
            setServices(prev => prev.map(s => s.id === service.id ? { ...s, status: newStatus } : s));
            showSuccess('Estado Actualizado', `El servicio ahora está: ${SERVICE_STATUS_CONFIG[newStatus].label}`);
        } catch (error: any) {
            console.error("Error updating status", error);
            showError('Error', 'No se pudo actualizar el estado.');
        }
    };

    const serviceColumns: Column<HotelServiceDTO>[] = [
        {
            header: 'ID',
            accessor: (row) => row.id
        },
        {
            header: 'Imagen',
            accessor: (row) => (
                row.imageUrl ? (
                    <img 
                        src={row.imageUrl} 
                        alt={row.name}
                        className="w-12 h-12 rounded-lg object-cover border border-gray-200 dark:border-white/10"
                        onError={(e) => (e.currentTarget.src = 'https://images.unsplash.com/photo-1551882547-ff43c619c721?auto=format&fit=crop&q=80&w=100')}
                    />
                ) : (
                    <div className="w-12 h-12 rounded-lg bg-gray-100 dark:bg-white/5 flex items-center justify-center text-gray-400 text-xs">
                        N/A
                    </div>
                )
            )
        },
        {
            header: 'Nombre',
            accessor: (row) => (
                <div>
                    <div className="font-bold text-gray-900 dark:text-white">{row.name}</div>
                    <div className="text-xs text-gray-500 dark:text-gray-400 max-w-xs truncate">
                        {row.description || '-'}
                    </div>
                </div>
            )
        },
        {
            header: 'Precio',
            accessor: (row) => (
                <span className="font-semibold text-[#d4af37]">{formatCurrency(row.cost)}</span>
            )
        },
        {
            header: 'Horario',
            accessor: (row) => (
                <span className="text-sm text-gray-600 dark:text-gray-300">
                    {row.startHour || '08:00'} - {row.endHour || '22:00'}
                </span>
            )
        },
        {
            header: 'Estado',
            accessor: (row) => {
                const config = SERVICE_STATUS_CONFIG[row.status || 'OPERATIONAL'] || SERVICE_STATUS_CONFIG['OPERATIONAL'];
                return (
                    <button
                        onClick={() => handleQuickStatusChange(row)}
                        className="group flex items-center gap-2"
                        title="Clic para cambiar estado"
                    >
                        <Badge variant={config.variant}>
                            {config.label}
                        </Badge>
                        <RefreshCw size={14} className="text-gray-400 opacity-0 group-hover:opacity-100 transition-opacity" />
                    </button>
                );
            }
        },
        {
            header: 'Acciones',
            accessor: (row) => (
                <div className="flex gap-2">
                    <Button size="sm" variant="info" onClick={() => handleEditClick(row)} iconOnly>
                        <Edit size={14} />
                    </Button>
                    <Button size="sm" variant="danger" onClick={() => row.id && handleDeleteClick(row.id)} iconOnly>
                        <Trash2 size={14} />
                    </Button>
                </div>
            )
        }
    ];

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center bg-transparent">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Servicios del Hotel</h1>
                    <p className="text-gray-500 dark:text-gray-400 text-sm">Catálogo de servicios disponibles para huéspedes</p>
                </div>
                {!showForm && (
                    <Button onClick={handleCreateClick} leftIcon={<Plus size={16} />}>Nuevo Servicio</Button>
                )}
            </div>

            <Card className="card-plain">
                <Table
                    data={services}
                    columns={serviceColumns}
                    isLoading={loading}
                    emptyMessage="No hay servicios registrados"
                    keyExtractor={(item: HotelServiceDTO) => item.id!}
                />
            </Card>

            <Modal
                isOpen={showForm}
                onClose={() => setShowForm(false)}
                title={editingService ? 'Editar Servicio' : 'Nuevo Servicio'}
            >
                <ServiceForm
                    initialData={editingService || undefined}
                    onSuccess={() => {
                        setShowForm(false);
                        loadData();
                    }}
                    onCancel={() => setShowForm(false)}
                />
            </Modal>

            {/* Feedback Modal */}
            <Modal
                isOpen={feedback.show}
                onClose={() => setFeedback({ ...feedback, show: false })}
                size="sm"
            >
                <div className="p-10 flex flex-col items-center text-center space-y-6">
                    <div className={`w-20 h-20 rounded-full flex items-center justify-center ${feedback.type === 'success' ? 'bg-emerald-500/10 text-emerald-500' :
                        feedback.type === 'error' ? 'bg-rose-500/10 text-rose-500' :
                            'bg-amber-500/10 text-amber-500'
                        }`}>
                        {feedback.type === 'success' && <CheckCircle2 size={40} />}
                        {feedback.type === 'error' && <XCircle size={40} />}
                        {feedback.type === 'warning' && <AlertTriangle size={40} />}
                    </div>
                    <div>
                        <h3 className="text-xl font-bold text-gray-900 dark:text-white">{feedback.title}</h3>
                        <p className="text-sm text-gray-500 dark:text-gray-400 mt-2 leading-relaxed">
                            {feedback.message}
                        </p>
                    </div>
                    <Button
                        variant={feedback.type === 'success' ? 'primary' : 'danger'}
                        className="w-full rounded-2xl py-4"
                        onClick={() => setFeedback({ ...feedback, show: false })}
                    >
                        Entendido
                    </Button>
                </div>
            </Modal>
        </div>
    );
};

export default ServicesView;
