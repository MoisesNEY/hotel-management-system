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
            <div className="row" style={{ display: 'flex', flexWrap: 'wrap', margin: '0 -15px' }}>
                <div className="col-lg-3 col-md-6 col-sm-6" style={{ padding: '0 15px', position: 'relative', width: '100%', flex: '0 0 25%', maxWidth: '25%' }}>
                    <StatsCard
                        type="warning"
                        icon={CalendarCheck}
                        title="Reservas"
                        value={stats?.totalBookings || 0}
                        footerInitIcon={RefreshCw}
                        footerText="Actualizado ahora"
                    />
                </div>
                <div className="col-lg-3 col-md-6 col-sm-6" style={{ padding: '0 15px', position: 'relative', width: '100%', flex: '0 0 25%', maxWidth: '25%' }}>
                    <StatsCard
                        type="success"
                        icon={DollarSign}
                        title="Ingresos"
                        value={formatCurrency(stats?.totalRevenue || 0)}
                        footerInitIcon={Calendar}
                        footerText="Último mes"
                    />
                </div>
                <div className="col-lg-3 col-md-6 col-sm-6" style={{ padding: '0 15px', position: 'relative', width: '100%', flex: '0 0 25%', maxWidth: '25%' }}>
                    <StatsCard
                        type="danger"
                        icon={Users}
                        title="Errores"
                        value={23}
                        footerInitIcon={Clock}
                        footerText="En la última hora"
                    />
                </div>
                <div className="col-lg-3 col-md-6 col-sm-6" style={{ padding: '0 15px', position: 'relative', width: '100%', flex: '0 0 25%', maxWidth: '25%' }}>
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
            <div className="row" style={{ display: 'flex', flexWrap: 'wrap', margin: '0 -15px' }}>
                <div className="col-md-12" style={{ padding: '0 15px', position: 'relative', width: '100%', flex: '0 0 100%', maxWidth: '100%' }}>
                    <Card title="Comportamiento de Usuarios" subtitle="Rendimiento de 24 Horas">
                        {/* Chart Container */}
                        <div style={{ position: 'relative', height: '400px', width: '100%', marginTop: '10px' }}>
                            {chartData ? (
                                <Line data={revenueChartData} options={chartOptions} />
                            ) : (
                                <div className="flex items-center justify-center h-full text-gray-400">
                                    Cargando gráfico...
                                </div>
                            )}
                        </div>
                        {/* Footer (Legend within Footer or below chart) */}
                        <div className="card-footer" style={{ borderTop: '1px solid #ddd', marginTop: '15px', paddingTop: '15px' }}>
                            <div className="legend" style={{ display: 'none' }}> {/* Legend handled by ChartJS or custom HTML if needed */}
                                <i className="fa fa-circle text-primary"></i> Open
                                <i className="fa fa-circle text-warning"></i> Click
                                <i className="fa fa-circle text-danger"></i> Click Second Time
                            </div>
                            <div className="stats" style={{ color: '#a49e93', fontSize: '14px', display: 'flex', alignItems: 'center' }}>
                                <RefreshCw size={14} style={{ marginRight: '5px' }} /> Updated 3 minutes ago
                            </div>
                        </div>
                    </Card>
                </div>
            </div>

            {/* Bottom Row: Additional Charts or Tables could go here like in demo logic (Email Stats / NASDQ) */}
            <div className="row" style={{ display: 'flex', flexWrap: 'wrap', margin: '0 -15px' }}>
                <div className="col-md-4" style={{ padding: '0 15px', width: '33.3333%', flex: '0 0 33.3333%', maxWidth: '33.3333%' }}>
                    <Card title="Estadísticas Email" subtitle="Rendimiento de Campaña">
                        <div style={{ height: '245px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#ccc' }}>
                            {/* Placeholder Pie Chart */}
                            [ Pie Chart Placeholder ]
                        </div>
                        <div className="legend" style={{ padding: '10px 0', fontSize: '12px', color: '#9a9a9a' }}>
                            <div style={{ display: 'flex', gap: '10px', justifyContent: 'center' }}>
                                <span style={{ display: 'flex', alignItems: 'center' }}><Circle size={10} className="text-blue-400 fill-current mr-1" /> Abierto</span>
                                <span style={{ display: 'flex', alignItems: 'center' }}><Circle size={10} className="text-yellow-400 fill-current mr-1" /> Leído</span>
                                <span style={{ display: 'flex', alignItems: 'center' }}><Circle size={10} className="text-red-400 fill-current mr-1" /> Eliminado</span>
                            </div>
                        </div>
                        <div className="card-footer" style={{ borderTop: '0 none', paddingTop: '10px' }}>
                            <div className="stats" style={{ color: '#a49e93', fontSize: '14px', display: 'flex', alignItems: 'center' }}>
                                <Calendar size={14} style={{ marginRight: '5px' }} /> Número de emails enviados
                            </div>
                        </div>
                    </Card>
                </div>
                <div className="col-md-8" style={{ padding: '0 15px', width: '66.6666%', flex: '0 0 66.6666%', maxWidth: '66.6666%' }}>
                    <Card title="NASDAQ: APHA" subtitle="Histórico 2018">
                        <div style={{ height: '277px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#ccc' }}>
                            {/* Placeholder Line Chart with different config */}
                            [ Detailed Line Chart Placeholder ]
                        </div>
                        <div className="card-footer" style={{ borderTop: '0 none', paddingTop: '0' }}>
                            {/* Footer content */}
                            <div className="stats" style={{ color: '#a49e93', fontSize: '14px', display: 'flex', alignItems: 'center' }}>
                                <Activity size={14} style={{ marginRight: '5px' }} /> Datos certificados
                            </div>
                        </div>
                    </Card>
                </div>
            </div>
        </div>
    );
};

export default Dashboard;
