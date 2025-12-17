import React, { useState } from 'react';
import Card from '../../components/shared/Card';
import Button from '../../components/shared/Button';
import { Info, CheckCircle, AlertCircle, XCircle, X } from 'lucide-react';

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

    // Paper Dashboard specific colors for alerts
    const getAlertStyle = (type: string) => {
        switch (type) {
            case 'info': return { backgroundColor: '#51bcda', color: '#fff' };
            case 'success': return { backgroundColor: '#6bd098', color: '#fff' };
            case 'warning': return { backgroundColor: '#fbc658', color: '#fff' };
            case 'error': return { backgroundColor: '#ef8157', color: '#fff' };
            default: return { backgroundColor: '#51bcda', color: '#fff' };
        }
    };

    const Alert: React.FC<{ type: 'info' | 'success' | 'warning' | 'error'; children: React.ReactNode }> = ({ type, children }) => {
        const style = getAlertStyle(type);
        return (
            <div className="alert fade show" role="alert" style={{
                ...style,
                borderRadius: '4px',
                border: '0',
                padding: '20px 15px',
                marginBottom: '20px',
                position: 'relative',
                display: 'flex',
                alignItems: 'center'
            }}>
                {children}
            </div>
        );
    };


    return (
        <div className="content">
            <Card title="Notifications" subtitle="Estilos de Notificaciones y Alertas">
                <div className="row">
                    <div className="col-md-6" style={{ padding: '0 15px' }}>
                        <h5 className="card-title text-uppercase text-muted mb-4 font-bold text-sm">NOTIFICACIONES STATIC</h5>

                        <Alert type="info">
                            <span style={{ display: 'flex', alignItems: 'center' }}>
                                <b style={{ marginRight: '5px' }}> Info - </b> Este es un mensaje de alerta informativo.
                            </span>
                        </Alert>
                        <Alert type="success">
                            <span style={{ display: 'flex', alignItems: 'center' }}>
                                <b style={{ marginRight: '5px' }}> Success - </b> Operación completada con éxito.
                            </span>
                        </Alert>
                        <Alert type="warning">
                            <span style={{ display: 'flex', alignItems: 'center' }}>
                                <b style={{ marginRight: '5px' }}> Warning - </b> Ten cuidado con esta acción.
                            </span>
                        </Alert>
                        <Alert type="error">
                            <span style={{ display: 'flex', alignItems: 'center' }}>
                                <b style={{ marginRight: '5px' }}> Error - </b> Algo salió mal, por favor intenta de nuevo.
                            </span>
                        </Alert>
                    </div>

                    <div className="col-md-6" style={{ padding: '0 15px' }}>
                        <h5 className="card-title text-uppercase text-muted mb-4 font-bold text-sm">NOTIFICACIONES INTERACTIVAS</h5>
                        <p className="text-gray-600 mb-4">Haz clic para probar las notificaciones flotantes</p>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <Button variant="info" block onClick={() => showNotification('info', "Bienvenido al Dashboard")}>
                                Info Notification
                            </Button>
                            <Button variant="success" block onClick={() => showNotification('success', "Datos guardados correctamente")}>
                                Success Notification
                            </Button>
                            <Button variant="warning" block onClick={() => showNotification('warning', "Faltan datos en el formulario")}>
                                Warning Notification
                            </Button>
                            <Button variant="danger" block onClick={() => showNotification('error', "Error de conexión con el servidor")}>
                                Error Notification
                            </Button>
                        </div>
                    </div>
                </div>
            </Card>

            {/* Toast Container (Fixed) */}
            <div className="fixed-plugin" style={{
                position: 'fixed',
                top: '20px',
                right: '20px',
                zIndex: 9999,
                width: '350px'
            }}>
                {toasts.map(toast => {
                    const style = getAlertStyle(toast.type);
                    return (
                        <div key={toast.id} className="alert alert-with-icon" style={{
                            ...style,
                            borderRadius: '4px',
                            border: '0',
                            padding: '15px',
                            marginBottom: '10px',
                            boxShadow: '0 4px 20px 0px rgba(0, 0, 0, 0.14), 0 7px 10px -5px rgba(156, 39, 176, 0.4)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                            animation: 'fadeIn 0.5s',
                            cursor: 'pointer'
                        }}
                            onClick={() => removeToast(toast.id)}
                        >
                            <div style={{ display: 'flex', alignItems: 'center' }}>
                                <div style={{ fontSize: '20px', marginRight: '10px' }}>
                                    {toast.type === 'info' && <Info />}
                                    {toast.type === 'success' && <CheckCircle />}
                                    {toast.type === 'warning' && <AlertCircle />}
                                    {toast.type === 'error' && <XCircle />}
                                </div>
                                <span data-notify="message">{toast.message}</span>
                            </div>
                            <button type="button" className="close" style={{ background: 'transparent', border: 'none', color: '#fff', fontSize: '18px', lineHeight: '1' }}>
                                <X size={16} />
                            </button>
                        </div>
                    );
                })}
            </div>
        </div>
    );
};

export default NotificationsView;
