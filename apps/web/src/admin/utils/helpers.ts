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

export const truncateText = (text: string, maxLength: number): string => {
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength) + '...';
};
