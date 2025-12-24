import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';

interface HttpTrafficChartProps {
    data: {
        status2xx: number;
        status4xx: number;
        status5xx: number;
    };
}

const HttpTrafficChart = ({ data }: HttpTrafficChartProps) => {
    const chartData = [
        { name: '2xx Éxito', value: data.status2xx, color: '#22c55e' },
        { name: '4xx Cliente', value: data.status4xx, color: '#eab308' },
        { name: '5xx Servidor', value: data.status5xx, color: '#ef4444' },
    ];

    const CustomTooltip = ({ active, payload }: any) => {
        if (active && payload && payload.length) {
            return (
                <div className="bg-white dark:bg-[#1a1a1a] px-3 py-2 rounded-lg shadow-lg border border-gray-200 dark:border-white/10">
                    <p className="text-sm font-medium text-gray-900 dark:text-white">
                        {payload[0].payload.name}
                    </p>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                        {payload[0].value.toLocaleString()} solicitudes
                    </p>
                </div>
            );
        }
        return null;
    };

    const total = data.status2xx + data.status4xx + data.status5xx;

    return (
        <div className="space-y-4">
            <div className="h-52">
                <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={chartData} layout="vertical" margin={{ left: 20 }}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#374151" opacity={0.2} />
                        <XAxis 
                            type="number" 
                            tick={{ fill: '#9ca3af', fontSize: 12 }}
                            axisLine={{ stroke: '#374151' }}
                        />
                        <YAxis 
                            type="category" 
                            dataKey="name" 
                            tick={{ fill: '#9ca3af', fontSize: 12 }}
                            axisLine={{ stroke: '#374151' }}
                            width={90}
                        />
                        <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(255,255,255,0.05)' }} />
                        <Bar dataKey="value" radius={[0, 6, 6, 0]} maxBarSize={30}>
                            {chartData.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={entry.color} />
                            ))}
                        </Bar>
                    </BarChart>
                </ResponsiveContainer>
            </div>

            {/* Summary stats */}
            <div className="grid grid-cols-3 gap-3 pt-2 border-t border-gray-200 dark:border-white/10">
                <div className="text-center">
                    <div className="text-lg font-bold text-green-500">{data.status2xx.toLocaleString()}</div>
                    <div className="text-xs text-gray-500 dark:text-gray-400">Exitosas</div>
                </div>
                <div className="text-center">
                    <div className="text-lg font-bold text-yellow-500">{data.status4xx.toLocaleString()}</div>
                    <div className="text-xs text-gray-500 dark:text-gray-400">Errores Cliente</div>
                </div>
                <div className="text-center">
                    <div className="text-lg font-bold text-red-500">{data.status5xx.toLocaleString()}</div>
                    <div className="text-xs text-gray-500 dark:text-gray-400">Errores Servidor</div>
                </div>
            </div>

            {/* Success rate */}
            {total > 0 && (
                <div className="text-center text-sm text-gray-500 dark:text-gray-400">
                    Tasa de éxito: <span className="font-semibold text-green-500">
                        {((data.status2xx / total) * 100).toFixed(1)}%
                    </span>
                </div>
            )}
        </div>
    );
};

export default HttpTrafficChart;
