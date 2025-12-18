import { BOOKING_STATUS_COLORS, ROOM_STATUS_COLORS } from './constants';
import type { AdminUserDTO } from '../../types/adminTypes';

export const getUserDisplayInfo = (userObj: any, usersMap: Record<string | number, AdminUserDTO>) => {
    const userId = userObj?.id;
    const stitchedUser = userId ? usersMap[userId] : undefined;

    const firstName = stitchedUser?.firstName || userObj?.firstName || '';
    const lastName = stitchedUser?.lastName || userObj?.lastName || '';
    const email = stitchedUser?.email || userObj?.email || 'N/A';

    return {
        fullName: `${firstName} ${lastName}`.trim() || 'Sin Nombre',
        email
    };
};

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
        case 'AVAILABLE': return { label: 'Disponible', className: 'bg-green-100/10 text-green-600 border border-green-200/20' };
        case 'OCCUPIED': return { label: 'Ocupada', className: 'bg-red-100/10 text-red-600 border border-red-200/20' };
        case 'MAINTENANCE': return { label: 'Mantenimiento', className: 'bg-yellow-100/10 text-yellow-600 border border-yellow-200/20' };
        case 'CLEANING': return { label: 'Limpieza', className: 'bg-blue-100/10 text-blue-600 border border-blue-200/20' };
        default: return { label: status, className: 'bg-gray-100/10 text-gray-600 border border-gray-200/20' };
    }
};

export const getBookingStatusConfig = (status: string) => {
    switch (status) {
        case 'CONFIRMED': return { label: 'Confirmada', variant: 'success' };
        case 'PENDING': return { label: 'Pendiente', variant: 'warning' };
        case 'CANCELLED': return { label: 'Cancelada', variant: 'danger' };
        case 'CHECKED_IN': return { label: 'En Casa', variant: 'info' };
        case 'CHECKED_OUT': return { label: 'Finalizada', variant: 'secondary' };
        default: return { label: status, variant: 'primary' };
    }
};

export const getRequestStatusConfig = (status: string) => {
    switch (status) {
        case 'OPEN': return { label: 'Abierta', variant: 'warning' };
        case 'IN_PROGRESS': return { label: 'Procesando', variant: 'info' };
        case 'COMPLETED': return { label: 'Completada', variant: 'success' };
        case 'REJECTED': return { label: 'Rechazada', variant: 'danger' };
        default: return { label: status, variant: 'primary' };
    }
};

export const truncateText = (text: string, maxLength: number): string => {
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength) + '...';
};
