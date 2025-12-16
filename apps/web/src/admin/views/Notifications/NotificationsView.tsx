import React, { useState } from 'react';
import Card from '../../components/shared/Card';
import { Info, AlertCircle, CheckCircle, XCircle, X } from 'lucide-react';

interface Toast {
    id: number;
    type: 'info' | 'success' | 'warning' | 'error';
    message: string;
}

const NotificationsView: React.FC = () => {
    const [toasts, setToasts] = useState<Toast[]>([]);

    const showNotification = (type: Toast['type'], message: string) => {
        const newToast: Toast = {
            id: Date.now(),
            type,
            message
        };

        setToasts(prev => [...prev, newToast]);

        // Auto remove after 5 seconds
        setTimeout(() => {
            setToasts(prev => prev.filter(t => t.id !== newToast.id));
        }, 5000);
    };

    const removeToast = (id: number) => {
        setToasts(prev => prev.filter(t => t.id !== id));
    };

    const getToastStyles = (type: Toast['type']) => {
        const styles = {
            info: {
                bg: 'bg-blue-50 border-blue-200',
                text: 'text-blue-800',
                icon: Info,
                iconColor: 'text-blue-600'
            },
            success: {
                bg: 'bg-green-50 border-green-200',
                text: 'text-green-800',
                icon: CheckCircle,
                iconColor: 'text-green-600'
            },
            warning: {
                bg: 'bg-orange-50 border-orange-200',
                text: 'text-orange-800',
                icon: AlertCircle,
                iconColor: 'text-orange-600'
            },
            error: {
                bg: 'bg-red-50 border-red-200',
                text: 'text-red-800',
                icon: XCircle,
                iconColor: 'text-red-600'
            }
        };

        return styles[type];
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <div>
                <h1 className="text-3xl font-bold text-gray-800 mb-2">Notificaciones</h1>
                <p className="text-gray-600">
                    Sistema de notificaciones y alertas
                </p>
            </div>

            {/* Demo Buttons */}
            <Card title="Tipos de Notificaciones" className="shadow-md border-none">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <button
                        onClick={() => showNotification('info', 'Esta es una notificación informativa')}
                        className="px-4 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors font-medium"
                    >
                        Info
                    </button>
                    <button
                        onClick={() => showNotification('success', '¡Operación completada exitosamente!')}
                        className="px-4 py-3 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors font-medium"
                    >
                        Success
                    </button>
                    <button
                        onClick={() => showNotification('warning', 'Advertencia: Verifica los datos ingresados')}
                        className="px-4 py-3 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors font-medium"
                    >
                        Warning
                    </button>
                    <button
                        onClick={() => showNotification('error', 'Error: No se pudo completar la operación')}
                        className="px-4 py-3 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors font-medium"
                    >
                        Error
                    </button>
                </div>
            </Card>

            {/* Static Alerts */}
            <Card title="Alertas Estáticas" className="shadow-md border-none">
                <div className="space-y-4">
                    {/* Info Alert */}
                    <div className="flex items-start space-x-3 p-4 bg-blue-50 rounded-lg border border-blue-200">
                        <Info className="w-5 h-5 text-blue-600 mt-0.5" />
                        <div className="flex-1">
                            <h4 className="font-semibold text-blue-900">Información</h4>
                            <p className="text-sm text-blue-700 mt-1">
                                Este es un mensaje informativo para el usuario
                            </p>
                        </div>
                    </div>

                    {/* Success Alert */}
                    <div className="flex items-start space-x-3 p-4 bg-green-50 rounded-lg border border-green-200">
                        <CheckCircle className="w-5 h-5 text-green-600 mt-0.5" />
                        <div className="flex-1">
                            <h4 className="font-semibold text-green-900">Éxito</h4>
                            <p className="text-sm text-green-700 mt-1">
                                La operación se completó correctamente
                            </p>
                        </div>
                    </div>

                    {/* Warning Alert */}
                    <div className="flex items-start space-x-3 p-4 bg-orange-50 rounded-lg border border-orange-200">
                        <AlertCircle className="w-5 h-5 text-orange-600 mt-0.5" />
                        <div className="flex-1">
                            <h4 className="font-semibold text-orange-900">Advertencia</h4>
                            <p className="text-sm text-orange-700 mt-1">
                                Por favor revisa los datos antes de continuar
                            </p>
                        </div>
                    </div>

                    {/* Error Alert */}
                    <div className="flex items-start space-x-3 p-4 bg-red-50 rounded-lg border border-red-200">
                        <XCircle className="w-5 h-5 text-red-600 mt-0.5" />
                        <div className="flex-1">
                            <h4 className="font-semibold text-red-900">Error</h4>
                            <p className="text-sm text-red-700 mt-1">
                                Ocurrió un error al procesar la solicitud
                            </p>
                        </div>
                    </div>
                </div>
            </Card>

            {/* Toast Container */}
            <div className="fixed top-4 right-4 z-50 space-y-2" style={{ maxWidth: '400px' }}>
                {toasts.map(toast => {
                    const styles = getToastStyles(toast.type);
                    const Icon = styles.icon;

                    return (
                        <div
                            key={toast.id}
                            className={`
                                flex items-start space-x-3 p-4 rounded-lg border shadow-lg
                                ${styles.bg} ${styles.text}
                                animate-slide-in-right
                            `}
                        >
                            <Icon className={`w-5 h-5 ${styles.iconColor} mt-0.5`} />
                            <p className="flex-1 text-sm">{toast.message}</p>
                            <button
                                onClick={() => removeToast(toast.id)}
                                className="hover:opacity-70 transition-opacity"
                            >
                                <X className="w-4 h-4" />
                            </button>
                        </div>
                    );
                })}
            </div>
        </div>
    );
};

export default NotificationsView;
