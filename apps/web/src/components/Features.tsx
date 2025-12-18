import React from 'react';
import { Shield, Clock, Wifi, Utensils, Car, ConciergeBell, Star } from 'lucide-react';
import '../styles/features.css';
import { useListContent } from '../hooks/useContent';

const Features: React.FC = () => {
    // 1. Traemos la lista desde DB
    const { data: features, loading } = useListContent('HOME_FEATURES');

    // 2. Mapeo inteligente: Título DB -> Componente React
    // Si el titulo de la DB contiene la palabra clave, mostramos el icono correspondiente
    const getIcon = (title: string) => {
        const t = title.toLowerCase();
        if (t.includes('seguridad')) return <Shield size={32} />;
        if (t.includes('tiempo')) return <Clock size={32} />;
        if (t.includes('wifi') || t.includes('conexión')) return <Wifi size={32} />;
        if (t.includes('restaurante') || t.includes('gourmet')) return <Utensils size={32} />;
        if (t.includes('estacionamiento') || t.includes('parking')) return <Car size={32} />;
        if (t.includes('servicio') || t.includes('24/7')) return <ConciergeBell size={32} />;
        return <Star size={32} />; // Icono por defecto
    };

    if (loading) return null; // O un spinner pequeño

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
                        <div key={feature.id || index} className="feature-card">
                            <div className="feature-icon">
                                {getIcon(feature.title || '')}
                            </div>
                            <h3 className="feature-title">{feature.title}</h3>
                            <p className="feature-description">{feature.subtitle}</p>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
};

export default Features;