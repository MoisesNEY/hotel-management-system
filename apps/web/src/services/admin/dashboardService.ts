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

    // Fetch bookings for count and revenue
    try {
        const bookingsRes = await apiClient.get('/api/bookings?size=1000');
        const bookingsPagination = extractPaginationInfo(bookingsRes);
        stats.totalBookings = bookingsPagination?.totalElements || bookingsRes.data.length || 0;
        stats.totalRevenue = (bookingsRes.data as any[]).reduce((sum, b) => sum + (b.totalPrice || 0), 0);
    } catch (error) {
        console.warn('Could not fetch bookings stats', error);
    }

    // Fetch rooms for occupancy
    try {
        const roomsRes = await apiClient.get('/api/rooms?size=1000');
        const rooms = roomsRes.data as any[];
        const totalRooms = rooms.length;
        const occupiedRooms = rooms.filter(r => r.status === 'OCCUPIED').length;
        stats.occupancyRate = totalRooms > 0 ? Math.round((occupiedRooms / totalRooms) * 100) : 0;
    } catch (error) {
        console.warn('Could not fetch rooms stats', error);
    }

    // Fetch customers for count
    try {
        const customersRes = await apiClient.get('/api/customers?size=1');
        const pagination = extractPaginationInfo(customersRes);

        if (pagination) {
            stats.usersCount = pagination.totalElements;
        } else {
            // Fallback for missing or non-standard headers
            const totalHeader = customersRes.headers['x-total-count'] ||
                customersRes.headers['X-Total-Count'] ||
                customersRes.headers['total-count'];

            if (totalHeader) {
                stats.usersCount = parseInt(String(totalHeader), 10);
            } else if (Array.isArray(customersRes.data)) {
                // If it's just an array without headers, it might be the whole list (unlikely with size=1 but safe fallback)
                stats.usersCount = customersRes.data.length;
            } else if (customersRes.data && typeof customersRes.data.totalElements === 'number') {
                // Some backends return a wrapper object
                stats.usersCount = customersRes.data.totalElements;
            }
        }
    } catch (error) {
        console.warn('Could not fetch customers stats', error);
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
