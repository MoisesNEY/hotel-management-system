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
    try {
        // Fetch bookings for count and revenue
        const bookingsRes = await apiClient.get('/api/bookings?size=1000');
        const bookingsPagination = extractPaginationInfo(bookingsRes);
        const totalBookings = bookingsPagination?.totalElements || bookingsRes.data.length || 0;
        
        const totalRevenue = (bookingsRes.data as any[]).reduce((sum, b) => sum + (b.totalPrice || 0), 0);

        // Fetch rooms for occupancy
        const roomsRes = await apiClient.get('/api/rooms?size=1000');
        const rooms = roomsRes.data as any[];
        const totalRooms = rooms.length;
        const occupiedRooms = rooms.filter(r => r.status === 'OCCUPIED').length;
        const occupancyRate = totalRooms > 0 ? Math.round((occupiedRooms / totalRooms) * 100) : 0;

        // Fetch customers for count
        const customersRes = await apiClient.get('/api/customer-details?size=1');
        const customersPagination = extractPaginationInfo(customersRes);
        const usersCount = customersPagination?.totalElements || 0;

        return {
            totalBookings,
            totalRevenue,
            occupancyRate,
            usersCount
        };
    } catch (error) {
        console.error('Error calculating dashboard stats', error);
        return {
            totalBookings: 0,
            totalRevenue: 0,
            occupancyRate: 0,
            usersCount: 0
        };
    }
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
