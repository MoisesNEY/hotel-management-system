import React, { useState, useEffect } from 'react';
import { 
  ChevronLeft, ChevronRight, MapPin, Star, Phone, Mail,
  Bed, Utensils, Heart, Briefcase, Umbrella, Car
} from 'lucide-react';
import { useListContent, useSingleContent } from '../hooks/useContent';

const HotelGallery: React.FC = () => {
  const { data: galleryItems } = useListContent('HOME_GALLERY');
  const { data: facilities } = useListContent('HOTEL_FACILITIES');
  const { data: contactItems } = useListContent('CONTACT_INFO');
  const { data: mapItem } = useSingleContent('MAIN_LOCATION');
  const { data: galleryHeader } = useSingleContent('HEADER_GALLERY');

  const getContactVal = (key: string) => contactItems.find(c => c.title?.toLowerCase().includes(key.toLowerCase()));
  
  const addressItem = getContactVal('address') || getContactVal('dirección');
  const phoneItem = getContactVal('phone') || getContactVal('teléfono');
  const emailItem = getContactVal('email') || getContactVal('correo');

  const iconColors = ['#4361ee', '#e63946', '#f72585', '#2a9d8f', '#4cc9f0', '#7209b7'];
  
  const getFacilityIcon = (text: string) => {
    const t = text.toLowerCase();
    if (t.includes('hab') || t.includes('cuarto')) return <Bed size={20} />;
    if (t.includes('restaurante') || t.includes('comida')) return <Utensils size={20} />;
    if (t.includes('spa') || t.includes('relax')) return <Heart size={20} />;
    if (t.includes('negocios') || t.includes('business')) return <Briefcase size={20} />;
    if (t.includes('piscina') || t.includes('pool')) return <Umbrella size={20} />;
    if (t.includes('car') || t.includes('estacionamiento') || t.includes('parking')) return <Car size={20} />;
    return <Star size={20} />;
  };

  const hotelInfo = {
    name: 'Hotel de Lujo Managua',
    address: addressItem?.subtitle || 'Cargando dirección...',
    phone: phoneItem?.subtitle || '...',
    email: emailItem?.subtitle || '...',
    phoneLink: phoneItem?.actionUrl,
    emailLink: emailItem?.actionUrl,
    mapSrc: mapItem?.actionUrl || '',
    features: facilities.length > 0 ? facilities.map((f, i) => ({
        icon: getFacilityIcon(f.title || ''),
        text: f.title || '',
        color: iconColors[i % iconColors.length]
    })) : [
      { icon: <Bed size={20} />, text: '120 habitaciones y suites', color: '#4361ee' },
      { icon: <Utensils size={20} />, text: '3 restaurantes gourmet', color: '#e63946' },
      { icon: <Heart size={20} />, text: 'Spa de lujo completo', color: '#f72585' },
      { icon: <Briefcase size={20} />, text: 'Centro de negocios 24/7', color: '#2a9d8f' },
      { icon: <Umbrella size={20} />, text: 'Piscina infinita con vista', color: '#4cc9f0' },
      { icon: <Car size={20} />, text: 'Estacionamiento vigilado', color: '#7209b7' }
    ]
  };

  const [currentIndex, setCurrentIndex] = useState(0);
  const [autoplay, setAutoplay] = useState(true);

  const imagesToShow = galleryItems.length > 0 ? galleryItems : [{ id: 0, imageUrl: '', title: 'Cargando...', subtitle: '' }];

  const nextSlide = () => {
    setCurrentIndex((prevIndex) => prevIndex === imagesToShow.length - 1 ? 0 : prevIndex + 1);
  };

  const prevSlide = () => {
    setCurrentIndex((prevIndex) => prevIndex === 0 ? imagesToShow.length - 1 : prevIndex - 1);
  };

  const goToSlide = (index: number) => setCurrentIndex(index);

  useEffect(() => {
    if (!autoplay || imagesToShow.length <= 1) return;
    const interval = setInterval(nextSlide, 5000);
    return () => clearInterval(interval);
  }, [autoplay, imagesToShow.length]);


  return (
    <section className="bg-white dark:bg-[#0f1115] py-[100px] relative overflow-hidden" id="galeria">
      <div className="max-w-7xl mx-auto px-5">
        <div className="text-center mb-[60px]">
          <h2 className="text-4xl text-gray-900 dark:text-white mb-4 relative pb-4 font-semibold after:content-[''] after:absolute after:bottom-0 after:left-1/2 after:-translate-x-1/2 after:w-20 after:h-0.5 after:bg-gradient-to-r after:from-[#d4af37] after:via-[#ffd95a] after:to-[#d4af37] after:rounded-sm">
            {galleryHeader?.title || 'Nuestras Instalaciones'}
          </h2>
          <p className="text-gray-600 dark:text-gray-300 text-lg max-w-[600px] mx-auto leading-relaxed">
            {galleryHeader?.subtitle || 'Descubre la excelencia y el confort de nuestras instalaciones de 5 estrellas'}
          </p>
        </div>

        {/* Slider */}
        <div 
          className="mb-20"
          onMouseEnter={() => setAutoplay(false)}
          onMouseLeave={() => setAutoplay(true)}
        >
          {galleryItems.length > 0 ? (
            <>
              <div className="relative mb-8 rounded-2xl overflow-hidden shadow-[0_10px_40px_rgba(0,0,0,0.1)] dark:shadow-[0_10px_40px_rgba(0,0,0,0.5)]">
                <button className="absolute top-1/2 -translate-y-1/2 left-5 bg-white/90 dark:bg-gray-800/90 border-none w-[50px] h-[50px] rounded-full flex items-center justify-center cursor-pointer transition-all duration-300 text-gray-900 dark:text-white z-10 hover:bg-white dark:hover:bg-gray-700 hover:scale-110 hover:shadow-lg" onClick={prevSlide} aria-label="Anterior">
                  <ChevronLeft size={24} />
                </button>
                
                <div className="relative h-[500px] overflow-hidden">
                  <img 
                    src={imagesToShow[currentIndex].imageUrl} 
                    alt={imagesToShow[currentIndex].title}
                    className="w-full h-full object-cover transition-transform duration-500 hover:scale-105"
                  />
                  <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-10 text-white">
                    <div className="max-w-[600px]">
                      <h3 className="text-3xl mb-2.5 text-white font-bold">{imagesToShow[currentIndex].title}</h3>
                      <p className="text-lg opacity-90 mb-4">{imagesToShow[currentIndex].subtitle}</p>
                      <div className="inline-block bg-[rgba(212,175,55,0.9)] text-white px-4 py-1 rounded-full text-sm font-semibold">
                        {currentIndex + 1} / {imagesToShow.length}
                      </div>
                    </div>
                  </div>
                </div>

                <button className="absolute top-1/2 -translate-y-1/2 right-5 bg-white/90 dark:bg-gray-800/90 border-none w-[50px] h-[50px] rounded-full flex items-center justify-center cursor-pointer transition-all duration-300 text-gray-900 dark:text-white z-10 hover:bg-white dark:hover:bg-gray-700 hover:scale-110 hover:shadow-lg" onClick={nextSlide} aria-label="Siguiente">
                  <ChevronRight size={24} />
                </button>
              </div>

              {/* Thumbnails */}
              <div className="grid grid-cols-6 gap-4">
                {imagesToShow.map((image, index) => (
                  <div 
                    key={image.id || index}
                    className={`relative h-[120px] rounded-lg overflow-hidden cursor-pointer transition-all duration-300 border-[3px] ${index === currentIndex ? 'border-[#d4af37] -translate-y-1' : 'border-transparent hover:-translate-y-1'}`}
                    onClick={() => goToSlide(index)}
                  >
                    <img src={image.imageUrl} alt={image.title} className="w-full h-full object-cover" />
                    <div className={`absolute bottom-0 left-0 right-0 bg-black/70 p-2.5 transition-transform duration-300 ${index === currentIndex ? 'translate-y-0' : 'translate-y-full hover:translate-y-0'}`}>
                      <span className="text-white text-xs whitespace-nowrap overflow-hidden text-ellipsis block">{image.title?.split(' ')[0]}</span>
                    </div>
                  </div>
                ))}
              </div>
            </>
          ) : (
            <div className="text-center p-5 text-gray-600 dark:text-gray-400">Cargando galería...</div>
          )}
        </div>

        {/* Location & Contact */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 mt-12">
          <div className="bg-white dark:bg-[#1c1c1c] p-10 rounded-2xl shadow-lg dark:shadow-[0_5px_30px_rgba(0,0,0,0.3)] animate-[fadeIn_0.6s_ease_forwards]">
            <h3 className="flex items-center gap-2.5 text-gray-900 dark:text-white mb-8 text-3xl font-semibold">
              <MapPin className="text-[#d4af37]" size={24} />
              Nuestra Ubicación
            </h3>
            
            <div className="flex flex-col gap-6">
              <h4 className="text-gray-900 dark:text-white text-2xl mb-2.5 font-semibold">{hotelInfo.name}</h4>
              
              <div className="flex flex-col gap-4">
                <div className="flex items-center gap-4 text-gray-700 dark:text-gray-300 text-base bg-white/50 dark:bg-white/5 p-4 rounded-xl border border-gray-100 dark:border-white/10 border-l-4 border-l-[#e63946] transition-all duration-300 hover:bg-white dark:hover:bg-white/10 hover:shadow-lg hover:translate-x-1">
                  <div className="p-2 rounded-lg bg-[#e63946]/10 text-[#e63946]">
                    <MapPin size={20} className="flex-shrink-0" />
                  </div>
                  <span className="text-gray-900 dark:text-gray-100 font-semibold">{hotelInfo.address}</span>
                </div>
                <div className="flex items-center gap-4 text-gray-700 dark:text-gray-300 text-base bg-white/50 dark:bg-white/5 p-4 rounded-xl border border-gray-100 dark:border-white/10 border-l-4 border-l-[#4361ee] transition-all duration-300 hover:bg-white dark:hover:bg-white/10 hover:shadow-lg hover:translate-x-1">
                  <div className="p-2 rounded-lg bg-[#4361ee]/10 text-[#4361ee]">
                    <Phone size={20} className="flex-shrink-0" />
                  </div>
                  <a href={hotelInfo.phoneLink} className="text-gray-900 dark:text-gray-100 font-semibold hover:text-[#4361ee]">{hotelInfo.phone}</a>
                </div>
                <div className="flex items-center gap-4 text-gray-700 dark:text-gray-300 text-base bg-white/50 dark:bg-white/5 p-4 rounded-xl border border-gray-100 dark:border-white/10 border-l-4 border-l-[#2a9d8f] transition-all duration-300 hover:bg-white dark:hover:bg-white/10 hover:shadow-lg hover:translate-x-1">
                  <div className="p-2 rounded-lg bg-[#2a9d8f]/10 text-[#2a9d8f]">
                    <Mail size={20} className="flex-shrink-0" />
                  </div>
                  <a href={hotelInfo.emailLink} className="text-gray-900 dark:text-gray-100 font-semibold hover:text-[#2a9d8f]">{hotelInfo.email}</a>
                </div>
              </div>

              <div className="mt-4">
                <h5 className="text-gray-900 dark:text-white mb-5 text-xl font-semibold">Características del Hotel:</h5>
                <div className="grid grid-cols-2 gap-4">
                  {hotelInfo.features.map((feature, index) => (
                    <div key={index} className="flex items-center gap-3 p-4 bg-white/50 dark:bg-white/5 rounded-xl border border-gray-100 dark:border-white/10 border-b-2 transition-all duration-300 hover:border-current hover:-translate-y-1 hover:shadow-lg" style={{ borderColor: feature.color }}>
                      <div className="w-10 h-10 flex items-center justify-center rounded-lg bg-black/5 dark:bg-white/5 transition-all duration-300 group-hover:bg-black/10 dark:group-hover:bg-white/10 group-hover:scale-110" style={{ color: feature.color }}>
                        {feature.icon}
                      </div>
                      <span className="text-gray-900 dark:text-gray-200 text-sm font-semibold flex-1">{feature.text}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="bg-gradient-to-br from-[rgba(212,175,55,0.1)] to-[rgba(212,175,55,0.05)] dark:from-[rgba(212,175,55,0.15)] dark:to-[rgba(212,175,55,0.08)] border-2 border-[rgba(212,175,55,0.3)] p-6 rounded-xl flex items-center gap-5 mt-5">
                 <div className="flex gap-1">
                    {[...Array(5)].map((_, i) => <Star key={i} size={20} fill="#FFD700" color="#FFD700" />)}
                 </div>
                 <div className="text-gray-900 dark:text-gray-100 text-lg font-semibold">
                   <strong className="text-gray-900 dark:text-white text-xl">4.8/5</strong> en TripAdvisor
                 </div>
              </div>
            </div>
          </div>

          {/* Map */}
          <div className="bg-white dark:bg-[#1c1c1c] p-3 rounded-2xl shadow-lg dark:shadow-[0_5px_30px_rgba(0,0,0,0.3)] animate-[fadeIn_0.6s_ease_forwards] self-start border border-gray-100 dark:border-white/10">
            <div className="relative rounded-xl overflow-hidden h-[450px]">
               {hotelInfo.mapSrc ? (
                  <iframe
                    src={hotelInfo.mapSrc}
                    width="100%"
                    height="450"
                    style={{ border: 0 }}
                    allowFullScreen
                    loading="lazy"
                    title="Ubicación"
                    className="grayscale-[0.2] dark:grayscale-[0.5] invert-[0] dark:invert-[0.1] contrast-[1.1]"
                  />
               ) : (
                 <div className="flex items-center justify-center h-full bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400">Cargando Mapa...</div>
               )}
            </div>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>
    </section>
  );
};

export default HotelGallery;