import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

interface CpuChartProps {
    history: { time: string; value: number }[];
}

const CpuChart = ({ history }: CpuChartProps) => {
    const latestValue = history.length > 0 ? history[history.length - 1].value : 0;
    
    // Determine gradient color based on CPU usage
    const gradientColor = latestValue > 80 
        ? { start: '#ef4444', end: '#fee2e2' }
        : latestValue > 50 
            ? { start: '#f97316', end: '#ffedd5' }
            : { start: '#22c55e', end: '#dcfce7' };

    const CustomTooltip = ({ active, payload, label }: any) => {
        if (active && payload && payload.length) {
            return (
                <div className="bg-white dark:bg-[#1a1a1a] px-3 py-2 rounded-lg shadow-lg border border-gray-200 dark:border-white/10">
                    <p className="text-xs text-gray-500 dark:text-gray-400">{label}</p>
                    <p className="text-sm font-bold text-gray-900 dark:text-white">
                        CPU: {payload[0].value}%
                    </p>
                </div>
            );
        }
        return null;
    };

    // Display placeholder if no data
    if (history.length === 0) {
        return (
            <div className="h-52 flex items-center justify-center text-gray-400 dark:text-gray-500">
                <div className="text-center">
                    <p className="text-sm">Recopilando datos de CPU...</p>
                    <p className="text-xs mt-1">Los valores aparecerán en breve</p>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-4">
            <div className="h-52">
                <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={history} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                        <defs>
                            <linearGradient id="cpuGradient" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor={gradientColor.start} stopOpacity={0.8}/>
                                <stop offset="95%" stopColor={gradientColor.end} stopOpacity={0.1}/>
                            </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" stroke="#374151" opacity={0.2} />
                        <XAxis 
                            dataKey="time" 
                            tick={{ fill: '#9ca3af', fontSize: 10 }}
                            axisLine={{ stroke: '#374151' }}
                        />
                        <YAxis 
                            domain={[0, 100]}
                            tick={{ fill: '#9ca3af', fontSize: 12 }}
                            axisLine={{ stroke: '#374151' }}
                            tickFormatter={(v) => `${v}%`}
                        />
                        <Tooltip content={<CustomTooltip />} />
                        <Area 
                            type="monotone" 
                            dataKey="value" 
                            stroke={gradientColor.start}
                            strokeWidth={2}
                            fill="url(#cpuGradient)" 
                        />
                    </AreaChart>
                </ResponsiveContainer>
            </div>

            {/* Current value display */}
            <div className="flex items-center justify-center gap-4 pt-2 border-t border-gray-200 dark:border-white/10">
                <div className="text-center">
                    <div className={`text-3xl font-bold ${
                        latestValue > 80 ? 'text-red-500' : latestValue > 50 ? 'text-orange-500' : 'text-green-500'
                    }`}>
                        {latestValue}%
                    </div>
                    <div className="text-xs text-gray-500 dark:text-gray-400">CPU Actual</div>
                </div>
                
                {/* Mini status indicator */}
                <div className={`px-3 py-1 rounded-full text-xs font-medium ${
                    latestValue > 80 
                        ? 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400' 
                        : latestValue > 50 
                            ? 'bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-400'
                            : 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400'
                }`}>
                    {latestValue > 80 ? 'Crítico' : latestValue > 50 ? 'Moderado' : 'Normal'}
                </div>
            </div>
        </div>
    );
};

export default CpuChart;
