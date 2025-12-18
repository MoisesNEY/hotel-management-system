import React, { useState, useEffect } from 'react';
import { 
  ChevronLeft, ChevronRight, MapPin, Star, Phone, Mail,
  Bed, Utensils, Heart, Briefcase, Umbrella, Car
} from 'lucide-react';
import '../styles/hotel-gallery.css';
import { useListContent, useSingleContent } from '../hooks/useContent';

const HotelGallery: React.FC = () => {
  // --- CONSUMO DE DATOS DINÁMICOS ---
  const { data: galleryItems } = useListContent('HOME_GALLERY');
  const { data: contactItems } = useListContent('CONTACT_INFO');
  const { data: mapItem } = useSingleContent('MAIN_LOCATION');

  // Helpers para encontrar datos específicos de contacto
  const getContactVal = (key: string) => contactItems.find(c => c.title?.toLowerCase().includes(key.toLowerCase()));
  
  const addressItem = getContactVal('address') || getContactVal('dirección');
  const phoneItem = getContactVal('phone') || getContactVal('teléfono');
  const emailItem = getContactVal('email') || getContactVal('correo');

  // Datos combinados (Defaults + Dinámicos)
  const hotelInfo = {
    name: 'Grand Hotel de Lujo Managua',
    address: addressItem?.subtitle || 'Cargando dirección...',
    phone: phoneItem?.subtitle || '...',
    email: emailItem?.subtitle || '...',
    phoneLink: phoneItem?.actionUrl,
    emailLink: emailItem?.actionUrl,
    mapSrc: mapItem?.actionUrl || '', // URL del Iframe
    features: [
      // Estos features "pequeños" al lado del mapa podrían ser estáticos o venir de otra lista.
      // Por simplicidad, los dejo estáticos o podrías crear otro código 'MAP_FEATURES'
      { icon: <Bed size={20} />, text: '120 habitaciones y suites', color: '#4361ee' },
      { icon: <Utensils size={20} />, text: '3 restaurantes gourmet', color: '#e63946' },
      { icon: <Heart size={20} />, text: 'Spa de lujo completo', color: '#f72585' },
      { icon: <Briefcase size={20} />, text: 'Centro de negocios 24/7', color: '#2a9d8f' },
      { icon: <Umbrella size={20} />, text: 'Piscina infinita con vista', color: '#4cc9f0' },
      { icon: <Car size={20} />, text: 'Estacionamiento vigilado', color: '#7209b7' }
    ]
  };

  // --- LÓGICA DEL SLIDER (Igual que antes, pero usando galleryItems) ---
  const [currentIndex, setCurrentIndex] = useState(0);
  const [autoplay, setAutoplay] = useState(true);

  // Fallback si no hay imágenes aún
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
    <section className="section hotel-gallery" id="galeria">
      <div className="container">
        <div className="section-header">
          <h2 className="section-title">Nuestras Instalaciones</h2>
          <p className="section-subtitle">
            Descubre la excelencia y el confort de nuestras instalaciones de 5 estrellas
          </p>
        </div>

        {/* Slider de imágenes Dinámico */}
        <div 
          className="gallery-slider"
          onMouseEnter={() => setAutoplay(false)}
          onMouseLeave={() => setAutoplay(true)}
        >
          {galleryItems.length > 0 ? (
            <>
              <div className="slider-container">
                <button className="slider-btn prev-btn" onClick={prevSlide} aria-label="Anterior"><ChevronLeft size={24} /></button>
                
                <div className="main-slide">
                  <img 
                    src={imagesToShow[currentIndex].imageUrl} 
                    alt={imagesToShow[currentIndex].title}
                    className="slide-image"
                  />
                  <div className="slide-overlay">
                    <div className="slide-content">
                      <h3 className="slide-title">{imagesToShow[currentIndex].title}</h3>
                      <p className="slide-description">{imagesToShow[currentIndex].subtitle}</p>
                      <div className="slide-counter">
                        {currentIndex + 1} / {imagesToShow.length}
                      </div>
                    </div>
                  </div>
                </div>

                <button className="slider-btn next-btn" onClick={nextSlide} aria-label="Siguiente"><ChevronRight size={24} /></button>
              </div>

              {/* Thumbnails */}
              <div className="thumbnails">
                {imagesToShow.map((image, index) => (
                  <div 
                    key={image.id || index}
                    className={`thumbnail ${index === currentIndex ? 'active' : ''}`}
                    onClick={() => goToSlide(index)}
                  >
                    <img src={image.imageUrl} alt={image.title} className="thumbnail-image" />
                    <div className="thumbnail-overlay">
                      {/* Mostrar titulo corto en thumbnail */}
                      <span className="thumbnail-title">{image.title?.split(' ')[0]}</span> 
                    </div>
                  </div>
                ))}
              </div>
            </>
          ) : (
            <div className="text-center p-5">Cargando galería...</div>
          )}
        </div>

        {/* Información de Ubicación y Contacto Dinámica */}
        <div className="hotel-location">
          <div className="location-info">
            <h3 className="location-title">
              <MapPin className="location-icon" size={24} />
              Nuestra Ubicación
            </h3>
            
            <div className="hotel-details">
              <h4 className="hotel-name">{hotelInfo.name}</h4>
              
              <div className="contact-info">
                <div className="contact-item">
                  <MapPin size={20} className="contact-icon" style={{ color: '#e63946' }} />
                  <span className="contact-text">{hotelInfo.address}</span>
                </div>
                <div className="contact-item">
                  <Phone size={20} className="contact-icon" style={{ color: '#4361ee' }} />
                  {/* Usamos el actionUrl para el href (tel:...) */}
                  <a href={hotelInfo.phoneLink} className="contact-text">{hotelInfo.phone}</a>
                </div>
                <div className="contact-item">
                  <Mail size={20} className="contact-icon" style={{ color: '#2a9d8f' }} />
                  <a href={hotelInfo.emailLink} className="contact-text">{hotelInfo.email}</a>
                </div>
              </div>

              <div className="hotel-features">
                <h5 className="features-title">Características del Hotel:</h5>
                <div className="features-grid">
                  {hotelInfo.features.map((feature, index) => (
                    <div key={index} className="feature">
                      <div className="feature-icon-wrapper" style={{ color: feature.color }}>
                        {feature.icon}
                      </div>
                      <span className="feature-text">{feature.text}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="rating-badge">
                 {/* ... (Rating estático o dinámico si quisieras) ... */}
                 <div className="rating-stars">
                    {[...Array(5)].map((_, i) => <Star key={i} size={20} fill="#FFD700" color="#FFD700" />)}
                 </div>
                 <div className="rating-text"><strong>4.8/5</strong> en TripAdvisor</div>
              </div>
            </div>
          </div>

          {/* MAPA DINÁMICO (Iframe) */}
          <div className="location-map">
            <div className="map-container">
               {hotelInfo.mapSrc ? (
                  <iframe
                    src={hotelInfo.mapSrc}
                    width="100%"
                    height="400"
                    style={{ border: 0 }}
                    allowFullScreen
                    loading="lazy"
                    title="Ubicación"
                  />
               ) : (
                 <div className="map-placeholder">Cargando Mapa...</div>
               )}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HotelGallery;