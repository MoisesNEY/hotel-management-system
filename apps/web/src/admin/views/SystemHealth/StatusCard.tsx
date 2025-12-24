import { 
    ServerIcon, 
    CircleStackIcon, 
    FolderIcon, 
    EnvelopeIcon,
    CheckCircleIcon,
    XCircleIcon,
    CloudArrowUpIcon
} from '@heroicons/react/24/outline';

interface StatusCardProps {
    title: string;
    status: 'UP' | 'DOWN';
    subtitle?: string;
    icon: 'server' | 'database' | 'disk' | 'mail' | 'storage';
}

const iconMap = {
    server: ServerIcon,
    database: CircleStackIcon,
    disk: FolderIcon,
    mail: EnvelopeIcon,
    storage: CloudArrowUpIcon,
};

const StatusCard = ({ title, status, subtitle, icon }: StatusCardProps) => {
    const isUp = status === 'UP';
    const IconComponent = iconMap[icon];

    return (
        <div className={`
            relative overflow-hidden rounded-xl p-5 border transition-all duration-300
            ${isUp 
                ? 'bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/10 border-green-200 dark:border-green-800/30' 
                : 'bg-gradient-to-br from-red-50 to-rose-50 dark:from-red-900/20 dark:to-rose-900/10 border-red-200 dark:border-red-800/30'
            }
        `}>
            {/* Background pattern */}
            <div className="absolute top-0 right-0 w-24 h-24 opacity-10">
                <IconComponent className="w-full h-full" />
            </div>

            {/* Content */}
            <div className="relative z-10 flex items-start justify-between">
                <div className="flex items-center gap-3">
                    <div className={`
                        p-2.5 rounded-lg
                        ${isUp 
                            ? 'bg-green-100 dark:bg-green-900/40 text-green-600 dark:text-green-400' 
                            : 'bg-red-100 dark:bg-red-900/40 text-red-600 dark:text-red-400'
                        }
                    `}>
                        <IconComponent className="w-5 h-5" />
                    </div>
                    <div>
                        <h4 className="font-semibold text-gray-900 dark:text-white text-sm">
                            {title}
                        </h4>
                        {subtitle && (
                            <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                                {subtitle}
                            </p>
                        )}
                    </div>
                </div>

                {/* Status indicator */}
                <div className={`
                    flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold
                    ${isUp 
                        ? 'bg-green-500/20 text-green-700 dark:text-green-400' 
                        : 'bg-red-500/20 text-red-700 dark:text-red-400'
                    }
                `}>
                    {isUp ? (
                        <CheckCircleIcon className="w-4 h-4" />
                    ) : (
                        <XCircleIcon className="w-4 h-4" />
                    )}
                    {status}
                </div>
            </div>

            {/* Animated pulse for UP status */}
            {isUp && (
                <div className="absolute bottom-2 right-2">
                    <span className="relative flex h-3 w-3">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-3 w-3 bg-green-500"></span>
                    </span>
                </div>
            )}
        </div>
    );
};

export default StatusCard;
