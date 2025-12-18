import React from 'react';
import { useSingleContent } from '../hooks/useContent'; // Asegura la ruta correcta

const Hero: React.FC = () => {
  // 1. Usamos el Hook mágico
  const { data, loading } = useSingleContent('HOME_HERO');

  // Valores por defecto para que no se vea roto mientras carga (Skeleton visual básico)
  const bgImage = data?.imageUrl || 'https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?q=80&w=2070'; // Fallback elegante
  const title = data?.title || 'Cargando experiencia...';
  const subtitle = data?.subtitle || '';

  return (
    <section className="hero" id="home" style={{ backgroundImage: `linear-gradient(rgba(0,0,0,0.4), rgba(0,0,0,0.4)), url(${bgImage})`, backgroundSize: 'cover', backgroundPosition: 'center' }}>
      <div className="container">
        <div className="hero-content">
          <h1 className="hero-title">
            {title}
          </h1>
          <p className="hero-subtitle">
            {subtitle}
          </p>

          {/* Si usaste actionUrl para la frase extra, la ponemos aquí */}
          {data?.actionUrl && (
             <p className="hero-phrase">
               “{data.actionUrl}”
             </p>
          )}
        </div>
      </div>
    </section>
  );
};

export default Hero;