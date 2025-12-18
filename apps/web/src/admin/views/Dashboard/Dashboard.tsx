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
    Activity,
    Circle
} from 'lucide-react';

import StatsCard from '../../components/shared/StatsCard';
import Card from '../../components/shared/Card';
import * as dashboardService from '../../../services/admin/dashboardService';
import type { DashboardStats, ChartData } from '../../../services/admin/dashboardService';
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
                const dashboardData = await dashboardService.getStats();
                setStats(dashboardData);
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
        maintainAspectRatio: false,
        responsive: true,
        plugins: {
            legend: { display: false }, // Custom legend layout in Paper Dashboard
            tooltip: { mode: 'index' as const, intersect: false },
        },
        scales: {
            y: {
                ticks: { color: "#9f9f9f", font: { size: 10 } },
                grid: { color: "#f3f3f3", drawBorder: false }
            },
            x: {
                grid: { display: false, drawBorder: false },
                ticks: { color: "#9f9f9f", font: { size: 10 } }
            }
        },
        layout: { padding: 0 }
    };

    const revenueChartData = chartData ? {
        ...chartData,
        datasets: chartData.datasets.map(ds => ({
            ...ds,
            tension: 0.4,
            fill: true,
            borderColor: '#51cbce',
            backgroundColor: 'transparent',
            pointBorderColor: '#51cbce',
            pointRadius: 4,
            pointHoverRadius: 4,
            borderWidth: 3,
        }))
    } : { labels: [], datasets: [] };

    return (
        <div className="content">
            {/* Stats Components Row */}
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
                        title="Errores"
                        value={23}
                        footerInitIcon={Clock}
                        footerText="En la última hora"
                    />
                </div>
                <div className="w-full sm:w-1/2 md:w-1/2 lg:w-1/4 px-4 mb-4">
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
            <div className="flex flex-wrap -mx-4 mb-8">
                <div className="w-full px-4">
                    <Card title="Comportamiento de Usuarios" subtitle="Rendimiento de 24 Horas">
                        {/* Chart Container */}
                        <div className="relative w-full h-[400px] mt-2">
                            {chartData ? (
                                <Line data={revenueChartData} options={chartOptions} />
                            ) : (
                                <div className="flex items-center justify-center h-full text-gray-400">
                                    Cargando gráfico...
                                </div>
                            )}
                        </div>
                        {/* Footer (Legend within Footer or below chart) */}
                        <div className="border-t border-[#ddd] mt-4 pt-4">
                            <div className="text-[#a49e93] text-sm flex items-center">
                                <RefreshCw size={14} className="mr-1" /> Updated 3 minutes ago
                            </div>
                        </div>
                    </Card>
                </div>
            </div>

            {/* Bottom Row: Additional Charts or Tables could go here like in demo logic (Email Stats / NASDQ) */}
            <div className="flex flex-wrap -mx-4">
                <div className="w-full md:w-1/3 px-4 mb-4">
                    <Card title="Estadísticas Email" subtitle="Rendimiento de Campaña">
                        <div className="h-[245px] flex items-center justify-center text-gray-300">
                            {/* Placeholder Pie Chart */}
                            [ Pie Chart Placeholder ]
                        </div>
                        <div className="py-2 text-xs text-[#9a9a9a]">
                            <div className="flex gap-2 justify-center">
                                <span className="flex items-center"><Circle size={10} className="text-blue-400 fill-current mr-1" /> Abierto</span>
                                <span className="flex items-center"><Circle size={10} className="text-yellow-400 fill-current mr-1" /> Leído</span>
                                <span className="flex items-center"><Circle size={10} className="text-red-400 fill-current mr-1" /> Eliminado</span>
                            </div>
                        </div>
                        <div className="border-t-0 pt-2">
                            <div className="text-[#a49e93] text-sm flex items-center">
                                <Calendar size={14} className="mr-1" /> Número de emails enviados
                            </div>
                        </div>
                    </Card>
                </div>
                <div className="w-full md:w-2/3 px-4 mb-4">
                    <Card title="NASDAQ: APHA" subtitle="Histórico 2018">
                        <div className="h-[277px] flex items-center justify-center text-gray-300">
                            {/* Placeholder Line Chart with different config */}
                            [ Detailed Line Chart Placeholder ]
                        </div>
                        <div className="border-0 pt-0">
                            {/* Footer content */}
                            <div className="text-[#a49e93] text-sm flex items-center">
                                <Activity size={14} className="mr-1" /> Datos certificados
                            </div>
                        </div>
                    </Card>
                </div>
            </div>
        </div>
    );
};

export default Dashboard;
