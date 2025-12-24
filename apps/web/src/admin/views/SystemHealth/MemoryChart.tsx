import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts';

interface MemoryChartProps {
    used: number;
    max: number;
}

const formatBytes = (bytes: number): string => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
};

const MemoryChart = ({ used, max }: MemoryChartProps) => {
    const free = max - used;
    const usedPercentage = max > 0 ? (used / max) * 100 : 0;
    
    // Determine color based on usage
    const usedColor = usedPercentage > 80 
        ? '#ef4444' // Red for critical
        : usedPercentage > 60 
            ? '#f97316' // Orange for warning
            : '#22c55e'; // Green for healthy

    const data = [
        { name: 'Usada', value: used, color: usedColor },
        { name: 'Libre', value: free, color: '#10b981' },
    ];

    const CustomTooltip = ({ active, payload }: any) => {
        if (active && payload && payload.length) {
            return (
                <div className="bg-white dark:bg-[#1a1a1a] px-3 py-2 rounded-lg shadow-lg border border-gray-200 dark:border-white/10">
                    <p className="text-sm font-medium text-gray-900 dark:text-white">
                        {payload[0].name}: {formatBytes(payload[0].value)}
                    </p>
                </div>
            );
        }
        return null;
    };

    return (
        <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                    <Pie
                        data={data}
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={90}
                        paddingAngle={2}
                        dataKey="value"
                        stroke="none"
                    >
                        {data.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                    </Pie>
                    <Tooltip content={<CustomTooltip />} />
                    <Legend 
                        formatter={(value) => (
                            <span className="text-sm text-gray-600 dark:text-gray-400">{value}</span>
                        )}
                    />
                </PieChart>
            </ResponsiveContainer>
            
            {/* Center text */}
            <div className="relative -mt-40 flex flex-col items-center justify-center pointer-events-none">
                <span className={`text-3xl font-bold ${
                    usedPercentage > 80 ? 'text-red-500' : usedPercentage > 60 ? 'text-orange-500' : 'text-green-500'
                }`}>
                    {usedPercentage.toFixed(0)}%
                </span>
                <span className="text-xs text-gray-500 dark:text-gray-400">
                    {formatBytes(used)} / {formatBytes(max)}
                </span>
            </div>
        </div>
    );
};

export default MemoryChart;
