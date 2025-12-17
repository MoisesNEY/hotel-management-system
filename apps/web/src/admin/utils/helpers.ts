import { BOOKING_STATUS_COLORS, ROOM_STATUS_COLORS } from './constants';

export const formatCurrency = (amount: number): string => {
    return new Intl.NumberFormat('es-MX', {
        style: 'currency',
        currency: 'MXN'
    }).format(amount);
};

export const formatDate = (dateString: string): string => {
    if (!dateString) return '';
    return new Date(dateString).toLocaleDateString('es-MX', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    });
};

export const formatDateTime = (dateString: string): string => {
    if (!dateString) return '';
    return new Date(dateString).toLocaleDateString('es-MX', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    });
};

export const getStatusColor = (status: string, type: 'booking' | 'room' = 'booking'): string => {
    if (type === 'booking') {
        const color = BOOKING_STATUS_COLORS[status as keyof typeof BOOKING_STATUS_COLORS];
        return color || 'primary';
    }

    // Room status
    const color = ROOM_STATUS_COLORS[status as keyof typeof ROOM_STATUS_COLORS];
    return color || 'primary';
};

export const getRoomStatusConfig = (status: string) => {
    switch (status) {
        case 'AVAILABLE': return { label: 'Disponible', className: 'bg-green-100 text-green-800', style: {} };
        case 'OCCUPIED': return { label: 'Ocupada', className: 'bg-red-100 text-red-800', style: {} };
        case 'MAINTENANCE': return { label: 'Mantenimiento', className: 'bg-yellow-100 text-yellow-800', style: {} };
        case 'CLEANING': return { label: 'Limpieza', className: 'bg-blue-100 text-blue-800', style: {} };
        default: return { label: status, className: 'bg-gray-100 text-gray-800', style: {} };
    }
};

export const truncateText = (text: string, maxLength: number): string => {
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength) + '...';
};
