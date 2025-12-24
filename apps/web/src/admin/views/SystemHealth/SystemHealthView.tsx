import { useState, useEffect, useCallback } from 'react';
import { 
    fetchAllSystemHealth
} from '../../../services/admin/systemHealthService';
import type { SystemHealthData } from '../../../services/admin/systemHealthService';



// Icons
import { 
    ServerIcon, 
    ArrowPathIcon,
    ExclamationTriangleIcon 
} from '@heroicons/react/24/outline';
import StatusCard from './StatusCard';
import MemoryChart from './MemoryChart';
import HttpTrafficChart from './HttpTrafficChart';
import CpuChart from './CpuChart';
import ConnectionsGauge from './ConnectionsGauge';

const REFRESH_INTERVAL = 30000; // 30 seconds

const SystemHealthView = () => {
    const [data, setData] = useState<SystemHealthData | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
    const [cpuHistory, setCpuHistory] = useState<{ time: string; value: number }[]>([]);

    const loadData = useCallback(async () => {
        try {
            setError(null);
            const result = await fetchAllSystemHealth();
            setData(result);
            setLastUpdated(new Date());
            
            // Update CPU history
            setCpuHistory(prev => {
                const newEntry = { 
                    time: new Date().toLocaleTimeString('es', { hour: '2-digit', minute: '2-digit', second: '2-digit' }), 
                    value: Math.round(result.cpuUsage * 100) 
                };
                const updated = [...prev, newEntry].slice(-10); // Keep last 10 readings
                return updated;
            });
        } catch (err) {
            setError('No se pudo conectar con el servidor. Verifica que el backend esté en ejecución.');
            console.error('System health fetch error:', err);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        loadData();
        const interval = setInterval(loadData, REFRESH_INTERVAL);
        return () => clearInterval(interval);
    }, [loadData]);

    const handleManualRefresh = () => {
        setLoading(true);
        loadData();
    };

    // Skeleton Loading State
    if (loading && !data) {
        return (
            <div className="p-6 space-y-6">
                <div className="flex items-center justify-between">
                    <div className="h-8 w-64 bg-gray-200 dark:bg-white/10 rounded animate-pulse" />
                    <div className="h-10 w-32 bg-gray-200 dark:bg-white/10 rounded animate-pulse" />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    {[...Array(4)].map((_, i) => (
                        <div key={i} className="h-32 bg-gray-200 dark:bg-white/10 rounded-xl animate-pulse" />
                    ))}
                </div>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {[...Array(4)].map((_, i) => (
                        <div key={i} className="h-72 bg-gray-200 dark:bg-white/10 rounded-xl animate-pulse" />
                    ))}
                </div>
            </div>
        );
    }

    // Error State
    if (error && !data) {
        return (
            <div className="p-6 flex items-center justify-center min-h-[60vh]">
                <div className="text-center max-w-md">
                    <div className="w-20 h-20 mx-auto mb-6 bg-red-100 dark:bg-red-900/20 rounded-full flex items-center justify-center">
                        <ExclamationTriangleIcon className="w-10 h-10 text-red-500" />
                    </div>
                    <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-3">
                        Error de Conexión
                    </h2>
                    <p className="text-gray-500 dark:text-gray-400 mb-6">{error}</p>
                    <button
                        onClick={handleManualRefresh}
                        className="inline-flex items-center gap-2 px-5 py-2.5 bg-[#d4af37] hover:bg-[#c9a431] text-black font-semibold rounded-lg transition-colors"
                    >
                        <ArrowPathIcon className="w-5 h-5" />
                        Reintentar
                    </button>
                </div>
            </div>
        );
    }

    const health = data?.health;

    return (
        <div className="p-6 space-y-6">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                    <div className="p-3 bg-gradient-to-br from-[#d4af37] to-[#b8972e] rounded-xl shadow-lg">
                        <ServerIcon className="w-7 h-7 text-black" />
                    </div>
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                            Estado del Sistema
                        </h1>
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                            Monitoreo en tiempo real del servidor
                        </p>
                    </div>
                </div>
                
                <div className="flex items-center gap-4">
                    {lastUpdated && (
                        <span className="text-xs text-gray-500 dark:text-gray-400">
                            Última actualización: {lastUpdated.toLocaleTimeString('es')}
                        </span>
                    )}
                    <button
                        onClick={handleManualRefresh}
                        disabled={loading}
                        className="inline-flex items-center gap-2 px-4 py-2 bg-white dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-lg hover:bg-gray-50 dark:hover:bg-white/10 transition-colors disabled:opacity-50"
                    >
                        <ArrowPathIcon className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
                        <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Actualizar</span>
                    </button>
                </div>
            </div>

            {/* Status Cards Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
                <StatusCard 
                    title="Sistema" 
                    status={health?.status || 'DOWN'} 
                    subtitle="Estado General"
                    icon="server"
                />
                <StatusCard 
                    title="Base de Datos" 
                    status={health?.components?.db?.status || 'DOWN'} 
                    subtitle={health?.components?.db?.details?.database || 'PostgreSQL'}
                    icon="database"
                />
                <StatusCard 
                    title="Espacio en Disco" 
                    status={health?.components?.diskSpace?.status || 'DOWN'} 
                    subtitle={health?.components?.diskSpace?.details 
                        ? `${Math.round((health.components.diskSpace.details.free || 0) / 1073741824)}GB libres`
                        : 'Verificando...'
                    }
                    icon="disk"
                />
                <StatusCard 
                    title="Servicio Email" 
                    status={health?.components?.mail?.status || 'DOWN'} 
                    subtitle="SMTP/Mailpit"
                    icon="mail"
                />
                <StatusCard 
                    title="Almacenamiento S3" 
                    status={health?.components?.s3?.status || 'DOWN'}
                    subtitle={health?.components?.s3?.details?.endpoint || 'MinIO'}
                    icon="storage"
                />
            </div>

            {/* Charts Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Memory Chart */}
                <div className="bg-white dark:bg-[#111111] rounded-xl border border-gray-200 dark:border-white/5 p-6 shadow-sm">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                        Memoria JVM
                    </h3>
                    <MemoryChart 
                        used={data?.jvmMemoryUsed || 0} 
                        max={data?.jvmMemoryMax || 1} 
                    />
                </div>

                {/* HTTP Traffic Chart */}
                <div className="bg-white dark:bg-[#111111] rounded-xl border border-gray-200 dark:border-white/5 p-6 shadow-sm">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                        Tráfico HTTP
                    </h3>
                    <HttpTrafficChart 
                        data={data?.httpRequests || { status2xx: 0, status4xx: 0, status5xx: 0 }} 
                    />
                </div>

                {/* CPU Chart */}
                <div className="bg-white dark:bg-[#111111] rounded-xl border border-gray-200 dark:border-white/5 p-6 shadow-sm">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                        Uso de CPU
                    </h3>
                    <CpuChart history={cpuHistory} />
                </div>

                {/* DB Connections Gauge */}
                <div className="bg-white dark:bg-[#111111] rounded-xl border border-gray-200 dark:border-white/5 p-6 shadow-sm">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                        Conexiones a Base de Datos
                    </h3>
                    <ConnectionsGauge 
                        active={data?.dbConnectionsActive || 0} 
                        max={data?.dbConnectionsMax || 10} 
                    />
                </div>
            </div>

            {/* Auto-refresh indicator */}
            <div className="text-center text-xs text-gray-400 dark:text-gray-500">
                Los datos se actualizan automáticamente cada 30 segundos
            </div>
        </div>
    );
};

export default SystemHealthView;
