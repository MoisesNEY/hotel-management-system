import { apiClient, extractPaginationInfo } from '../../services/api';
import api from '../api';


export interface DashboardStats {
    totalBookings: number;
    totalRevenue: number;
    occupancyRate: number;
    usersCount: number;
}

export interface ChartDataset {
    label: string;
    data: number[];
    borderColor: string;
    backgroundColor: string;
    tension?: number;
    fill?: boolean;
    pointBorderColor?: string;
    pointRadius?: number;
    pointHoverRadius?: number;
    borderWidth?: number;
}

export interface ChartData {
    labels: string[];
    datasets: ChartDataset[];
}

export const getStats = async (): Promise<DashboardStats> => {
    const stats: DashboardStats = {
        totalBookings: 0,
        totalRevenue: 0,
        occupancyRate: 0,
        usersCount: 0
    };

    try {
        // Ejecutamos todas las peticiones en paralelo
        const results = await Promise.allSettled([
            apiClient.get('/api/bookings?size=1000'),
            apiClient.get('/api/rooms?size=1000'),
            apiClient.get('/api/customer-details?size=1')
        ]);

        // 1. Reservas e Ingresos
        if (results[0].status === 'fulfilled') {
            const bookingsRes = results[0].value;
            const bookingsPagination = extractPaginationInfo(bookingsRes);
            stats.totalBookings = bookingsPagination?.totalElements || bookingsRes.data.length || 0;
            stats.totalRevenue = (bookingsRes.data as any[]).reduce((sum, b) => sum + (b.totalPrice || 0), 0);
        }

        // 2. Habitaciones y Ocupación
        if (results[1].status === 'fulfilled') {
            const roomsRes = results[1].value;
            const rooms = roomsRes.data as any[];
            const totalRooms = rooms.length;
            const occupiedRooms = rooms.filter(r => r.status === 'OCCUPIED').length;
            stats.occupancyRate = totalRooms > 0 ? Math.round((occupiedRooms / totalRooms) * 100) : 0;
        }

        // 3. Clientes (EL QUE NECESITAMOS)
        if (results[2].status === 'fulfilled') {
            const customersRes = results[2].value;
            const customersPagination = extractPaginationInfo(customersRes);
            stats.usersCount = customersPagination?.totalElements || 0;
        } else {
            console.error('[DashboardService] Error obteniendo total de clientes:', results[2].reason);
        }

    } catch (error) {
        console.error('Error general en getStats', error);
    }

    return stats;
};

export const getUsersChartData = async (): Promise<ChartData> => {
    const response = await api.get('/admin/users/chart'); // Endpoint que devuelve histórico de usuarios
    return response.data;
};


export const getRevenueChartData = async (): Promise<ChartData> => {
    try {
        const bookingsRes = await apiClient.get('/api/bookings?size=1000');
        const bookings = bookingsRes.data as any[];

        const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
        const monthlyRevenue = new Array(12).fill(0);

        bookings.forEach(booking => {
            if (booking.checkInDate) {
                const date = new Date(booking.checkInDate);
                const monthIndex = date.getMonth();
                monthlyRevenue[monthIndex] += (booking.totalPrice || 0);
            }
        });

        return {
            labels: months,
            datasets: [
                {
                    label: "Revenue",
                    data: monthlyRevenue,
                    borderColor: '#51cbce',
                    backgroundColor: 'transparent',
                }
            ]
        };
    } catch (error) {
        console.warn('Error calculating chart data', error);
        return {
            labels: ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"],
            datasets: [
                {
                    label: "Revenue",
                    data: new Array(12).fill(0),
                    borderColor: '#51cbce',
                    backgroundColor: 'transparent',
                }
            ]
        };
    }
};
