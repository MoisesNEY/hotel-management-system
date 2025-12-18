import { useEffect, useState } from 'react';
import { Line, Doughnut } from 'react-chartjs-2';
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    Title,
    Tooltip,
    Legend,
    Filler,
    ArcElement
} from 'chart.js';
import {
    Users,
    BedDouble,
    CalendarCheck,
    DollarSign,
    RefreshCw,
    Calendar,
    Clock,
    Activity,
    Circle,
    Home
} from 'lucide-react';

import StatsCard from '../../components/shared/StatsCard';
import Card from '../../components/shared/Card';
import * as dashboardService from '../../../services/admin/dashboardService';
import { getRoomsChartData, type RoomsChartData } from '../../../services/admin/roomService';
import type { DashboardStats, ChartData } from '../../../services/admin/dashboardService';
import { formatCurrency } from '../../utils/helpers';
import Loader from '../../components/shared/Loader';
import { useTheme } from '../../../contexts/ThemeContext';

// Register ChartJS components
ChartJS.register(
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    Title,
    Tooltip,
    Legend,
    Filler,
    ArcElement
);

const Dashboard = () => {
    const { theme } = useTheme();
    const isDark = theme === 'dark';
    const [stats, setStats] = useState<DashboardStats | null>(null);
    const [loading, setLoading] = useState(true);
    const [chartData, setChartData] = useState<ChartData | null>(null);
    const [roomsChartData, setRoomsChartData] = useState<RoomsChartData | null>(null);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [dashboardData, revenueData, roomsData] = await Promise.all([
                    dashboardService.getStats(),
                    dashboardService.getRevenueChartData(),
                    getRoomsChartData()
                ]);
                setStats(dashboardData);
                setChartData(revenueData);
                setRoomsChartData(roomsData);
            } catch (error) {
                console.error("Error fetching dashboard data", error);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, []);

    const chartOptions: any = {
        maintainAspectRatio: false,
        responsive: true,
        plugins: {
            legend: { display: false },
            tooltip: { 
                mode: 'index' as const, 
                intersect: false,
                backgroundColor: isDark ? '#1c1c1c' : '#ffffff',
                titleColor: isDark ? '#ffffff' : '#111827',
                bodyColor: isDark ? '#94a3b8' : '#4b5563',
                borderColor: isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)',
                borderWidth: 1,
                padding: 12,
                cornerRadius: 8,
                titleFont: { size: 13, weight: '700' },
                bodyFont: { size: 12 }
            },
        },
        scales: {
            y: {
                ticks: { color: isDark ? "#64748b" : "#94a3b8", font: { size: 11, weight: '500' } },
                grid: { color: isDark ? "rgba(255,255,255,0.03)" : "rgba(0,0,0,0.03)", drawBorder: false }
            },
            x: {
                grid: { display: false, drawBorder: false },
                ticks: { color: isDark ? "#64748b" : "#94a3b8", font: { size: 11, weight: '500' } }
            }
        },
        layout: { padding: { top: 10, bottom: 0, left: 10, right: 10 } }
    };

    const revenueChartData = chartData ? {
        labels: chartData.labels,
        datasets: chartData.datasets.map(ds => ({
            ...ds,
            tension: 0.45,
            fill: true,
            borderColor: '#d4af37',
            backgroundColor: (context: any) => {
                const chart = context.chart;
                const { ctx, chartArea } = chart;
                
                if (!chartArea) {
                    return 'rgba(212, 175, 55, 0.1)';
                }
                
                const gradient = ctx.createLinearGradient(0, chartArea.top, 0, chartArea.bottom);
                gradient.addColorStop(0, 'rgba(212, 175, 55, 0.15)');
                gradient.addColorStop(1, 'rgba(212, 175, 55, 0)');
                return gradient;
            },
            pointBorderColor: '#d4af37',
            pointBackgroundColor: isDark ? '#1c1c1c' : '#ffffff',
            pointBorderWidth: 2,
            pointRadius: 4,
            pointHoverRadius: 6,
            pointHoverBorderWidth: 3,
            borderWidth: 3,
        }))
    } : { labels: [], datasets: [] };

    // Datos para el gráfico de pastel de clientes
    const clientsChartData = stats ? {
        labels: ['Clientes Activos', 'Clientes Inactivos'],
        datasets: [
            {
                label: 'Distribución de Clientes',
                data: [
                    Math.floor(stats.usersCount * 0.7), // 70% activos (ejemplo)
                    Math.floor(stats.usersCount * 0.3)  // 30% inactivos (ejemplo)
                ],
                backgroundColor: [
                    '#34d399', // Verde para activos
                    '#ef4444'  // Rojo para inactivos
                ],
                borderColor: isDark ? '#1c1c1c' : '#ffffff',
                borderWidth: 2,
                hoverBackgroundColor: [
                    '#10b981', // Verde más oscuro al hover
                    '#dc2626'  // Rojo más oscuro al hover
                ],
                hoverOffset: 4
            }
        ]
    } : { labels: [], datasets: [] };

    // Datos para el gráfico de habitaciones usando tu servicio
    const roomsPieChartData = roomsChartData ? {
        labels: roomsChartData.labels,
        datasets: roomsChartData.datasets.map(ds => ({
            ...ds,
            borderColor: isDark ? '#1c1c1c' : '#ffffff',
            borderWidth: 2,
            hoverOffset: 8,
            hoverBackgroundColor: ds.backgroundColor.map(color => 
                color === '#d4af37' ? '#b5942c' : 
                color === '#51cbce' ? '#45b4b6' : color
            )
        }))
    } : { labels: [], datasets: [] };

    const clientsChartOptions: any = {
        maintainAspectRatio: false,
        responsive: true,
        cutout: '65%',
        plugins: {
            legend: {
                position: 'bottom' as const,
                labels: {
                    color: isDark ? '#94a3b8' : '#4b5563',
                    font: {
                        size: 12,
                        weight: '500'
                    },
                    padding: 20,
                    usePointStyle: true,
                    pointStyle: 'circle'
                }
            },
            tooltip: {
                backgroundColor: isDark ? '#1c1c1c' : '#ffffff',
                titleColor: isDark ? '#ffffff' : '#111827',
                bodyColor: isDark ? '#94a3b8' : '#4b5563',
                borderColor: isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)',
                borderWidth: 1,
                padding: 12,
                cornerRadius: 8,
                titleFont: { size: 13, weight: '700' },
                bodyFont: { size: 12 },
                callbacks: {
                    label: function(context: any) {
                        const label = context.label || '';
                        const value = context.raw || 0;
                        const total = context.dataset.data.reduce((a: number, b: number) => a + b, 0);
                        const percentage = Math.round((value / total) * 100);
                        return `${label}: ${value} (${percentage}%)`;
                    }
                }
            }
        }
    };

    const roomsChartOptions: any = {
        maintainAspectRatio: false,
        responsive: true,
        cutout: '55%',
        plugins: {
            legend: {
                position: 'bottom' as const,
                labels: {
                    color: isDark ? '#94a3b8' : '#4b5563',
                    font: {
                        size: 12,
                        weight: '500'
                    },
                    padding: 20,
                    usePointStyle: true,
                    pointStyle: 'circle'
                }
            },
            tooltip: {
                backgroundColor: isDark ? '#1c1c1c' : '#ffffff',
                titleColor: isDark ? '#ffffff' : '#111827',
                bodyColor: isDark ? '#94a3b8' : '#4b5563',
                borderColor: isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)',
                borderWidth: 1,
                padding: 12,
                cornerRadius: 8,
                titleFont: { size: 13, weight: '700' },
                bodyFont: { size: 12 },
                callbacks: {
                    label: function(context: any) {
                        const label = context.label || '';
                        const value = context.raw || 0;
                        const total = context.dataset.data.reduce((a: number, b: number) => a + b, 0);
                        const percentage = Math.round((value / total) * 100);
                        return `${label}: ${value} (${percentage}%)`;
                    }
                }
            }
        }
    };

    if (loading) {
        return (
            <div className="flex justify-center items-center h-full min-h-[400px]">
                <Loader />
            </div>
        );
    }

    // Calcular el total de habitaciones
    const totalRooms = roomsChartData?.datasets[0]?.data?.reduce((a, b) => a + b, 0) || 0;
    const occupiedRooms = roomsChartData?.datasets[0]?.data[0] || 0;
    const availableRooms = roomsChartData?.datasets[0]?.data[1] || 0;

    return (
        <div className="content">
            {/* Stats Components Row - Añade estadística de habitaciones */}
            <div className="flex flex-wrap -mx-4 mb-8">
                <div className="w-full sm:w-1/2 md:w-1/2 lg:w-1/4 px-4 mb-4">
                    <StatsCard
                        type="warning"
                        icon={CalendarCheck}
                        title="Reservas"
                        value={stats?.totalBookings || 0}
                        footerInitIcon={RefreshCw}
                        footerText="Actualizado ahora"
                    />
                </div>
                <div className="w-full sm:w-1/2 md:w-1/2 lg:w-1/4 px-4 mb-4">
                    <StatsCard
                        type="success"
                        icon={DollarSign}
                        title="Ingresos"
                        value={formatCurrency(stats?.totalRevenue || 0)}
                        footerInitIcon={Calendar}
                        footerText="Último mes"
                    />
                </div>
                <div className="w-full sm:w-1/2 md:w-1/2 lg:w-1/4 px-4 mb-4">
                    <StatsCard
                        type="danger"
                        icon={Users}
                        title="Clientes"
                        value={stats?.usersCount || 0}
                        footerInitIcon={Clock}
                        footerText="Total registrados"
                    />
                </div>
                <div className="w-full sm:w-1/2 md:w-1/2 lg:w-1/4 px-4 mb-4">
                    <StatsCard
                        type="primary"
                        icon={BedDouble}
                        title="Habitaciones"
                        value={totalRooms}
                        footerInitIcon={Home}
                        footerText={`${occupiedRooms} ocupadas, ${availableRooms} disponibles`}
                    />
                </div>
            </div>

            {/* Charts Row - Ahora en 3 columnas */}
            <div className="flex flex-wrap -mx-4 mb-8">
                {/* Gráfico de Pastel de Clientes */}
                <div className="w-full lg:w-1/3 px-4 mb-6">
                    <Card title="Distribución de Clientes" subtitle="Activos vs Inactivos">
                        <div className="relative w-full h-[300px] mt-2 flex items-center justify-center">
                            {stats ? (
                                <Doughnut 
                                    data={clientsChartData} 
                                    options={clientsChartOptions} 
                                />
                            ) : (
                                <div className="flex items-center justify-center h-full text-gray-400 dark:text-gray-500">
                                    Cargando gráfico de clientes...
                                </div>
                            )}
                        </div>
                        <div className="mt-4 pt-4 border-t border-gray-100 dark:border-white/5">
                            <div className="text-center">
                                <div className="text-2xl font-bold text-gray-800 dark:text-white">
                                    {stats?.usersCount || 0}
                                </div>
                                <div className="text-sm text-gray-500 dark:text-gray-400">
                                    Total de clientes
                                </div>
                            </div>
                        </div>
                    </Card>
                </div>

                {/* Gráfico de Pastel de Habitaciones */}
                <div className="w-full lg:w-1/3 px-4 mb-6">
                    <Card title="Estado de Habitaciones" subtitle="Ocupadas vs Disponibles">
                        <div className="relative w-full h-[300px] mt-2 flex items-center justify-center">
                            {roomsChartData ? (
                                <Doughnut 
                                    data={roomsPieChartData} 
                                    options={roomsChartOptions} 
                                />
                            ) : (
                                <div className="flex items-center justify-center h-full text-gray-400 dark:text-gray-500">
                                    Cargando gráfico de habitaciones...
                                </div>
                            )}
                        </div>
                        <div className="mt-4 pt-4 border-t border-gray-100 dark:border-white/5">
                            <div className="grid grid-cols-2 gap-4 text-center">
                                <div>
                                    <div className="text-lg font-semibold text-amber-600 dark:text-amber-400">
                                        {occupiedRooms}
                                    </div>
                                    <div className="text-sm text-gray-500 dark:text-gray-400">
                                        Ocupadas
                                    </div>
                                </div>
                                <div>
                                    <div className="text-lg font-semibold text-cyan-600 dark:text-cyan-400">
                                        {availableRooms}
                                    </div>
                                    <div className="text-sm text-gray-500 dark:text-gray-400">
                                        Disponibles
                                    </div>
                                </div>
                            </div>
                        </div>
                    </Card>
                </div>

                {/* Gráfico de Línea de Ingresos */}
                <div className="w-full lg:w-1/3 px-4 mb-6">
                    <Card title="Ingresos" subtitle="Rendimiento en el tiempo">
                        <div className="relative w-full h-[300px] mt-2">
                            {chartData ? (
                                <Line 
                                    data={revenueChartData} 
                                    options={chartOptions} 
                                />
                            ) : (
                                <div className="flex items-center justify-center h-full text-gray-400 dark:text-gray-500">
                                    Cargando gráfico de ingresos...
                                </div>
                            )}
                        </div>
                        <div className="border-t border-gray-100 dark:border-white/5 mt-6 pt-4">
                            <div className="text-gray-400 dark:text-gray-500 text-xs flex items-center font-medium tracking-wide">
                                <RefreshCw size={12} className="mr-1.5" /> Actualizado hace 3 minutos
                            </div>
                        </div>
                    </Card>
                </div>
            </div>

            {/* Bottom Row */}
            <div className="flex flex-wrap -mx-4">
                <div className="w-full md:w-1/3 px-4 mb-4">
                    <Card title="Estadísticas Email" subtitle="Rendimiento de Campaña">
                        <div className="h-[245px] flex items-center justify-center text-gray-300 dark:text-gray-600">
                            {/* Placeholder Pie Chart */}
                            [ Pie Chart Placeholder ]
                        </div>
                        <div className="py-2 text-xs text-gray-500 dark:text-gray-400">
                            <div className="flex gap-4 justify-center">
                                <span className="flex items-center">
                                    <Circle size={10} className="text-blue-400 fill-current mr-1" /> Abierto
                                </span>
                                <span className="flex items-center">
                                    <Circle size={10} className="text-yellow-400 fill-current mr-1" /> Leído
                                </span>
                                <span className="flex items-center">
                                    <Circle size={10} className="text-red-400 fill-current mr-1" /> Eliminado
                                </span>
                            </div>
                        </div>
                        <div className="border-t border-gray-100 dark:border-white/5 pt-4 mt-2">
                            <div className="text-gray-400 dark:text-gray-500 text-xs flex items-center font-medium tracking-wide">
                                <Calendar size={12} className="mr-1.5" /> Número de emails enviados
                            </div>
                        </div>
                    </Card>
                </div>
                <div className="w-full md:w-2/3 px-4 mb-4">
                    <Card title="NASDAQ: APHA" subtitle="Histórico 2018">
                        <div className="h-[277px] flex items-center justify-center text-gray-300 dark:text-gray-600">
                            {/* Placeholder Line Chart with different config */}
                            [ Detailed Line Chart Placeholder ]
                        </div>
                        <div className="border-t border-gray-100 dark:border-white/5 pt-4 mt-2">
                            <div className="text-gray-400 dark:text-gray-500 text-xs flex items-center font-medium tracking-wide">
                                <Activity size={12} className="mr-1.5" /> Datos certificados de red
                            </div>
                        </div>
                    </Card>
                </div>
            </div>
        </div>
    );
};

export default Dashboard;