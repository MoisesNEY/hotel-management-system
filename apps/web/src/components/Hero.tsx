import React from 'react';

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

          <p className="hero-phrase">
            “Más que una estadía, creamos recuerdos que querrás revivir.”
          </p>
        </div>
      </div>
    </section>
  );
};

export default Hero;
