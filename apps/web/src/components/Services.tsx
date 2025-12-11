// src/components/Services.tsx
import React from 'react';
import { Coffee, Dumbbell, Heart, Car, Umbrella, Wind } from 'lucide-react';

const Services: React.FC = () => {
  const services = [
    {
      icon: <Coffee size={32} />,
      name: 'Restaurante & Bar',
      description: 'Desayuno buffet y cenas gourmet'
    },
    {
      icon: <Dumbbell size={32} />,
      name: 'Gimnasio',
      description: 'Equipamiento moderno 24 horas'
    },
    {
      icon: <Heart size={32} />,
      name: 'Spa & Wellness',
      description: 'Masajes y tratamientos relajantes'
    },
    {
      icon: <Car size={32} />,
      name: 'Transporte',
      description: 'Servicio de shuttle al aeropuerto'
    },
    {
      icon: <Umbrella size={32} />,
      name: 'Piscina',
      description: 'Piscina climatizada y zona de sol'
    },
    {
      icon: <Wind size={32} />,
      name: 'Lavandería',
      description: 'Servicio express de lavandería'
    }
  ];

  return (
    <section className="section services" id="servicios">
      <div className="container">
        <h2 className="section-title">Servicios del Hotel</h2>
        <div className="services-grid">
          {services.map((service, index) => (
            <div key={index} className="service-card">
              <div className="service-icon">
                {service.icon}
              </div>
              <h3 className="service-name">{service.name}</h3>
              <p className="service-description">{service.description}</p>
              <button className="btn btn-secondary btn-sm">Solicitar</button>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Services;