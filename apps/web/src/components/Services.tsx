import React from 'react';
import { Coffee, Dumbbell, Heart, Car, Umbrella, Wind } from 'lucide-react';
import '../styles/services.css';

const Services: React.FC = () => {
  const services = [
    {
      icon: <Coffee className="service-icon" />,
      name: 'Restaurante & Bar',
      description: 'Desayuno buffet premium y cenas gourmet con chefs internacionales'
    },
    {
      icon: <Dumbbell className="service-icon" />,
      name: 'Gimnasio Ejecutivo',
      description: 'Equipamiento moderno, entrenador personal y acceso 24 horas'
    },
    {
      icon: <Heart className="service-icon" />,
      name: 'Spa & Wellness',
      description: 'Masajes terapéuticos, tratamientos faciales y relajación total'
    },
    {
      icon: <Car className="service-icon" />,
      name: 'Transporte Ejecutivo',
      description: 'Shuttle al aeropuerto, servicio de limusina y valet parking VIP'
    },
    {
      icon: <Umbrella className="service-icon" />,
      name: 'Piscina Infinity',
      description: 'Piscina climatizada con vista panorámica y bar de piscina'
    },
    {
      icon: <Wind className="service-icon" />,
      name: 'Lavandería Express',
      description: 'Servicio de lavandería y planchado premium en menos de 2 horas'
    }
  ];

  return (
    <section className="section services" id="servicios">
      <div className="container">
        <div className="section-header">
          <h2 className="section-title">Servicios Premium</h2>
          <p className="section-subtitle">
            Experimenta el lujo de nuestros servicios exclusivos diseñados para tu máximo confort
          </p>
        </div>
        
        <div className="services-grid">
          {services.map((service, index) => (
            <div key={index} className="service-card">
              <div className="service-icon-container">
                {service.icon}
              </div>
              <h3 className="service-name">{service.name}</h3>
              <p className="service-description">{service.description}</p>
              <button className="service-btn">
                Solicitar Servicio
              </button>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Services;