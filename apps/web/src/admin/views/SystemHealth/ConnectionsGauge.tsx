interface ConnectionsGaugeProps {
    active: number;
    max: number;
}

const ConnectionsGauge = ({ active, max }: ConnectionsGaugeProps) => {
    const percentage = max > 0 ? (active / max) * 100 : 0;

    // Color based on usage
    const getColor = () => {
        if (percentage >= 90) return { stroke: '#ef4444', bg: 'rgb(239 68 68 / 0.2)', text: 'text-red-500' };
        if (percentage >= 70) return { stroke: '#f97316', bg: 'rgb(249 115 22 / 0.2)', text: 'text-orange-500' };
        if (percentage >= 50) return { stroke: '#eab308', bg: 'rgb(234 179 8 / 0.2)', text: 'text-yellow-500' };
        return { stroke: '#22c55e', bg: 'rgb(34 197 94 / 0.2)', text: 'text-green-500' };
    };

    const colors = getColor();

    return (
        <div className="flex flex-col items-center justify-center space-y-4">
            {/* Gauge SVG */}
            <div className="relative w-48 h-36">
                <svg viewBox="0 0 200 120" className="w-full h-full -rotate-0">
                    {/* Background arc */}
                    <path
                        d="M 20 100 A 80 80 0 0 1 180 100"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="16"
                        strokeLinecap="round"
                        className="text-gray-200 dark:text-white/10"
                    />
                    {/* Foreground arc */}
                    <path
                        d="M 20 100 A 80 80 0 0 1 180 100"
                        fill="none"
                        stroke={colors.stroke}
                        strokeWidth="16"
                        strokeLinecap="round"
                        strokeDasharray={`${(percentage / 100) * 251.3} 251.3`}
                        style={{
                            transition: 'stroke-dasharray 0.5s ease-in-out',
                        }}
                    />
                </svg>

                {/* Center text */}
                <div className="absolute inset-0 flex flex-col items-center justify-end pb-2">
                    <span className={`text-4xl font-bold ${colors.text}`}>
                        {active}
                    </span>
                    <span className="text-sm text-gray-500 dark:text-gray-400">
                        de {max}
                    </span>
                </div>
            </div>

            {/* Labels */}
            <div className="w-full max-w-xs">
                {/* Progress bar alternative */}
                <div className="relative h-3 bg-gray-200 dark:bg-white/10 rounded-full overflow-hidden">
                    <div 
                        className="absolute h-full rounded-full transition-all duration-500"
                        style={{ 
                            width: `${percentage}%`,
                            backgroundColor: colors.stroke
                        }}
                    />
                </div>
                
                <div className="flex justify-between mt-2 text-xs text-gray-500 dark:text-gray-400">
                    <span>0</span>
                    <span className="font-medium">{percentage.toFixed(0)}% usado</span>
                    <span>{max}</span>
                </div>
            </div>

            {/* Warning message */}
            {percentage >= 70 && (
                <div className={`
                    px-4 py-2 rounded-lg text-sm font-medium
                    ${percentage >= 90 
                        ? 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400' 
                        : 'bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-400'
                    }
                `}>
                    {percentage >= 90 
                        ? '⚠️ ¡Pool de conexiones casi agotado!'
                        : '⚡ Uso elevado de conexiones'
                    }
                </div>
            )}

            {percentage < 50 && (
                <div className="flex items-center gap-2 text-sm text-green-600 dark:text-green-400">
                    <span className="relative flex h-2 w-2">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
                    </span>
                    Pool saludable
                </div>
            )}
        </div>
    );
};

export default ConnectionsGauge;
