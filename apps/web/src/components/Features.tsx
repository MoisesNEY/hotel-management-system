import React from 'react';
import { Shield, Clock, Wifi, Utensils, Car, ConciergeBell } from 'lucide-react';
import '../styles/features.css';

const Features: React.FC = () => {
    const features = [
        {
            icon: <Shield size={32} />,
            title: 'Seguridad Garantizada',
            description: 'Protección de datos y privacidad mediante controles de acceso y procesos seguros.'
        },

        {
            icon: <Clock size={32} />,
            title: 'Gestión en Tiempo Real',
            description: 'Reservas y estado de habitaciones actualizado al instante'
        },
        {
            icon: <Wifi size={32} />,
            title: 'WiFi de Alta Velocidad',
            description: 'Conexión gratuita premium en todas las áreas del hotel'
        },
        {
            icon: <Utensils size={32} />,
            title: 'Restaurante Gourmet',
            description: 'Experiencias culinarias con chefs internacionales 5 estrellas'
        },
        {
            icon: <Car size={32} />,
            title: 'Estacionamiento VIP',
            description: 'Estacionamiento privado, vigilado y con valet parking'
        },
        {
            icon: <ConciergeBell size={32} />,
            title: 'Servicio 24/7',
            description: 'Concierge, recepción y servicio al cuarto premium 24 horas'
        }
    ];

    return (
        <section className="section features" id="caracteristicas">
            <div className="container">
                <div className="section-header">
                    <h2 className="section-title">Características Exclusivas</h2>
                    <p className="section-subtitle">
                        Descubre lo que hace de nuestra experiencia hotelera algo único y memorable
                    </p>
                </div>
                <div className="features-grid">
                    {features.map((feature, index) => (
                        <div key={index} className="feature-card">
                            <div className="feature-icon">
                                {feature.icon}
                            </div>
                            <h3 className="feature-title">{feature.title}</h3>
                            <p className="feature-description">{feature.description}</p>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
};

export default Features;