import React from 'react';
import { Calendar, MapPin, Users } from 'lucide-react';

const Hero: React.FC = () => {
  return (
    <section className="hero" id="home">
      <div className="container">
        <div className="hero-content">
          <h1 className="hero-title">
            Descubre el lujo y la comodidad en cada detalle
          </h1>
          <p className="hero-subtitle">
            Reserva tu estadía perfecta en nuestro hotel de 5 estrellas. 
            Experiencias únicas que comienzan con un clic.
          </p>
          
          <div className="booking-form">
            <div className="form-group">
              <div className="icon-container" style={{ color: '#FF6B35' }}>
                <MapPin size={22} />
              </div>
              <select className="form-control">
                <option>Seleccionar destino</option>
                <option>Hotel Principal - Centro</option>
                <option>Hotel Playa - Costa</option>
              </select>
            </div>
            <div className="form-group">
              <div className="icon-container" style={{ color: '#4361EE' }}>
                <Calendar size={22} />
              </div>
              <input type="date" className="form-control" />
            </div>
            <div className="form-group">
              <div className="icon-container" style={{ color: '#2A9D8F' }}>
                <Users size={22} />
              </div>
              <select className="form-control">
                <option>1 Huésped</option>
                <option>2 Huéspedes</option>
                <option>3 Huéspedes</option>
                <option>4+ Huéspedes</option>
              </select>
            </div>
            
            <button className="btn btn-accent btn-search">
              Buscar Disponibilidad
            </button>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;