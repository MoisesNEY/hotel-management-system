import { useEffect, useState } from 'react';
import { Line } from 'react-chartjs-2';
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    Title,
    Tooltip,
    Legend,
    Filler
} from 'chart.js';
import {
    Users,
    BedDouble,
    CalendarCheck,
    DollarSign,
    RefreshCw,
    Calendar,
    Clock,
    Activity
} from 'lucide-react';

import StatsCard from '../../components/shared/StatsCard'; // New custom card
import Card from '../../components/shared/Card';
import { dashboardService } from '../../services/api';
import type { DashboardStats, ChartData } from '../../types';
import { formatCurrency } from '../../utils/helpers';
import Loader from '../../components/shared/Loader';

// Register ChartJS components
ChartJS.register(
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    Title,
    Tooltip,
    Legend,
    Filler
);

const Dashboard = () => {
    const [stats, setStats] = useState<DashboardStats | null>(null);
    const [loading, setLoading] = useState(true);
    const [chartData, setChartData] = useState<ChartData | null>(null);

    useEffect(() => {
        const fetchData = async () => {
            try {
                // In a real scenario, these would be separate parallel calls
                const dashboardData = await dashboardService.getStats();
                setStats(dashboardData);

                // Mock chart data fetch
                const revenueData = await dashboardService.getRevenueChartData();
                setChartData(revenueData);
            } catch (error) {
                console.error("Error fetching dashboard data", error);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, []);

    if (loading) {
        return <div className="flex justify-center items-center h-full min-h-[400px]"><Loader /></div>;
    }

    const chartOptions = {
        responsive: true,
        plugins: {
            legend: {
                position: 'top' as const,
            },
        },
        scales: {
            y: {
                beginAtZero: true,
                grid: {
                    color: '#f3f3f3',
                    drawBorder: false,
                },
                ticks: {
                    padding: 20,
                    color: "#9f9f9f"
                }
            },
            x: {
                grid: {
                    display: false,
                    drawBorder: false,
                },
                ticks: {
                    padding: 20,
                    color: "#9f9f9f"
                }
            }
        },
        layout: {
            padding: {
                left: 0,
                right: 0,
                top: 15,
                bottom: 15
            }
        }
    };

    const revenueChartData = chartData ? {
        ...chartData,
        datasets: chartData.datasets.map(ds => ({
            ...ds,
            tension: 0.4,
            fill: true,
            borderColor: '#51cbce', // Primary cyan
            backgroundColor: 'transparent',
            pointBorderColor: '#51cbce',
            pointRadius: 4,
            pointHoverRadius: 4,
            borderWidth: 3,
        }))
    } : { labels: [], datasets: [] };


    return (
        <div className="content">
            {/* Stats Row */}
            <div style={{ display: 'flex', flexWrap: 'wrap', margin: '0 -15px' }}>
                <div style={{ width: '25%', padding: '0 15px', flex: '0 0 25%', maxWidth: '25%', boxSizing: 'border-box' }} className="w-full md:w-1/2 lg:w-1/4 mb-4">
                    <StatsCard
                        type="warning"
                        icon={CalendarCheck}
                        title="Reservas"
                        value={stats?.totalBookings || 0}
                        footerInitIcon={RefreshCw}
                        footerText="Actualizado ahora"
                    />
                </div>
                <div style={{ width: '25%', padding: '0 15px', flex: '0 0 25%', maxWidth: '25%', boxSizing: 'border-box' }} className="w-full md:w-1/2 lg:w-1/4 mb-4">
                    <StatsCard
                        type="success"
                        icon={DollarSign}
                        title="Ingresos"
                        value={formatCurrency(stats?.totalRevenue || 0)}
                        footerInitIcon={Calendar}
                        footerText="Último mes"
                    />
                </div>
                <div style={{ width: '25%', padding: '0 15px', flex: '0 0 25%', maxWidth: '25%', boxSizing: 'border-box' }} className="w-full md:w-1/2 lg:w-1/4 mb-4">
                    <StatsCard
                        type="danger"
                        icon={Users}
                        title="Errores"
                        value={23}
                        footerInitIcon={Clock}
                        footerText="En la última hora"
                    />
                </div>
                <div style={{ width: '25%', padding: '0 15px', flex: '0 0 25%', maxWidth: '25%', boxSizing: 'border-box' }} className="w-full md:w-1/2 lg:w-1/4 mb-4">
                    <StatsCard
                        type="primary"
                        icon={BedDouble}
                        title="Ocupación"
                        value={`${stats?.occupancyRate || 0}%`}
                        footerInitIcon={Activity}
                        footerText="Actualizado ahora"
                    />
                </div>
            </div>

            {/* Charts Row */}
            <div style={{ display: 'flex', flexWrap: 'wrap', margin: '0 -15px' }}>
                <div style={{ padding: '0 15px', flex: '0 0 100%', maxWidth: '100%', boxSizing: 'border-box' }}>
                    <Card title="Comportamiento de Usuarios" subtitle="Rendimiento de 24 Horas">
                        <div style={{ height: '400px', width: '100%' }}>
                            {chartData ? (
                                <Line data={revenueChartData} options={chartOptions} />
                            ) : (
                                <div className="flex items-center justify-center h-full text-gray-400">
                                    Cargando gráfico...
                                </div>
                            )}
                        </div>
                        <div className="card-footer" style={{ borderTop: '1px solid #ddd', marginTop: '15px', paddingTop: '15px' }}>
                            <div className="stats" style={{ color: '#a49e93', fontSize: '14px', display: 'flex', alignItems: 'center' }}>
                                <RefreshCw size={14} style={{ marginRight: '5px' }} /> Updated 3 minutes ago
                            </div>
                        </div>
                    </Card>
                </div>
            </div>
        </div>
    );
};

export default Dashboard;
