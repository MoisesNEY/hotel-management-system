import { apiClient } from '../../services/api';

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

// Mock API endpoints or real ones if available
const DASHBOARD_URL = '/api/admin/dashboard'; 

export const getStats = async (): Promise<DashboardStats> => {
    // If backend doesn't have this, we might need to calculate or mock
    // For now, attempting to fetch from potential backend endpoint, or falling back to mock
    try {
        const response = await apiClient.get<DashboardStats>(`${DASHBOARD_URL}/stats`);
        return response.data;
    } catch (error) {
        console.warn('Dashboard stats endpoint not found, using mock data');
        return {
            totalBookings: 150,
            totalRevenue: 45000,
            occupancyRate: 75,
            usersCount: 320
        };
    }
};

export const getRevenueChartData = async (): Promise<ChartData> => {
     try {
        const response = await apiClient.get<ChartData>(`${DASHBOARD_URL}/revenue-chart`);
        return response.data;
    } catch (error) {
         console.warn('Dashboard chart endpoint not found, using mock data');
        return {
            labels: ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"],
            datasets: [
                {
                    label: "Revenue",
                    data: [3000, 3500, 4000, 4500, 5000, 4800, 5500, 6000, 6500, 7000, 7500, 8000],
                    borderColor: '#51cbce',
                    backgroundColor: 'transparent',
                }
            ]
        };
    }
};
