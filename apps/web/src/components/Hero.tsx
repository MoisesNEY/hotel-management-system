import React from 'react';
import { useSingleContent } from '../hooks/useContent'; // Asegura la ruta correcta

const Hero: React.FC = () => {
  // 1. Usamos el Hook mágico
  const { data } = useSingleContent('HOME_HERO');

  // Valores por defecto para que no se vea roto mientras carga (Skeleton visual básico)
  const bgImage = data?.imageUrl || 'https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?q=80&w=2070'; // Fallback elegante
  const title = data?.title || 'Cargando experiencia...';
  const subtitle = data?.subtitle || '';

  return (
    <section 
      className="relative min-h-screen flex items-center justify-center bg-cover bg-center"
      id="home" 
      style={{ 
        backgroundImage: `linear-gradient(rgba(0,0,0,0.4), rgba(0,0,0,0.4)), url(${bgImage})` 
      }}
    >
      <div className="max-w-7xl mx-auto px-5 text-center">
        <div className="text-white">
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6 leading-tight">
            {title}
          </h1>
          <p className="text-lg md:text-xl mb-8 max-w-2xl mx-auto">
            {subtitle}
          </p>

          {data?.actionUrl && (
             <p className="text-xl md:text-2xl italic text-[#D4AF37] font-medium">
               "{data.actionUrl}"
             </p>
          )}
        </div>
      </div>
    </section>
  );
};

export default Hero;