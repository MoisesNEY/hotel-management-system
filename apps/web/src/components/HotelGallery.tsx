import React, { useState, useEffect } from 'react';
import { 
  ChevronLeft, 
  ChevronRight, 
  MapPin, 
  Star, 
  Phone, 
  Mail,
  Bed,
  Utensils,
  Heart,
  Briefcase,
  Umbrella,
  Car
} from 'lucide-react';
import '../styles/hotel-gallery.css';

const HotelGallery: React.FC = () => {
  const hotelImages = [
    {
      id: 1,
      url: 'https://img.freepik.com/foto-gratis/salon-recepcion-hotel-lujo-restaurante-salon-techos-altos_105762-1771.jpg?semt=ais_hybrid&w=740&q=80',
      title: 'Lobby Principal',
      description: 'Recepción de lujo con diseño contemporáneo'
    },
    {
      id: 2,
      url: 'https://www.swissotel.com/assets/0/92/2119/2178/2217/2219/6442451722/83eb355a-2f1c-49d8-ad51-1ccce3b52b33.jpg',
      title: 'Suite Presidencial',
      description: 'La máxima expresión de confort y elegancia'
    },
    {
      id: 3,
      url: 'https://img.freepik.com/fotos-premium/restaurante-hotel-alta-gama-platos-gourmet-ambiente-sofisticado_1310094-4278.jpg?semt=ais_hybrid&w=740&q=80',
      title: 'Restaurante Gourmet',
      description: 'Experiencia culinaria única con vista panorámica'
    },
    {
      id: 4,
      url: 'https://media.istockphoto.com/id/155161088/es/foto/moderna-villa.jpg?s=612x612&w=0&k=20&c=wE1I5W9qDJwRjrN-AihfPbEfaPRSPQTfNmNXo_moiPE=',
      title: 'Piscina Infinity',
      description: 'Piscina climatizada con vista al volcán'
    },
    {
      id: 5,
      url: 'https://static.vecteezy.com/system/resources/thumbnails/027/807/864/small/spa-accessory-composition-set-in-day-spa-hotel-beauty-wellness-centre-spa-product-are-placed-in-luxury-spa-resort-room-ready-for-massage-therapy-from-professional-service-photo.jpg',
      title: 'Spa & Wellness',
      description: 'Centro de bienestar y relajación total'
    },
    {
      id: 6,
      url: 'https://i.pinimg.com/736x/3c/62/14/3c6214d9b1be7787e40bbd1f55334032.jpg',
      title: 'Salón de Eventos',
      description: 'Espacios versátiles para todo tipo de ocasiones'
    }
  ];

  const hotelInfo = {
    name: 'Grand Hotel de Lujo Managua',
    address: 'Carretera a Masaya Km 6.5, Managua, Nicaragua',
    phone: '+505 2278 9000',
    email: 'reservas@luxurygranhotel.ni',
    coordinates: {
      lat: 12.136389,
      lng: -86.251389
    },
    features: [
      {
        icon: <Bed size={20} />,
        text: '120 habitaciones y suites',
        color: '#4361ee' 
      },
      {
        icon: <Utensils size={20} />,
        text: '3 restaurantes gourmet',
        color: '#e63946'
      },
      {
        icon: <Heart size={20} />,
        text: 'Spa de lujo completo',
        color: '#f72585' 
      },
      {
        icon: <Briefcase size={20} />,
        text: 'Centro de negocios 24/7',
        color: '#2a9d8f' 
      },
      {
        icon: <Umbrella size={20} />,
        text: 'Piscina infinita con vista',
        color: '#4cc9f0' 
      },
      {
        icon: <Car size={20} />,
        text: 'Estacionamiento vigilado',
        color: '#7209b7' 
      }
    ]
  };

  const [currentIndex, setCurrentIndex] = useState(0);
  const [autoplay, setAutoplay] = useState(true);

  // Navegación del slider
  const nextSlide = () => {
    setCurrentIndex((prevIndex) => 
      prevIndex === hotelImages.length - 1 ? 0 : prevIndex + 1
    );
  };

  const prevSlide = () => {
    setCurrentIndex((prevIndex) => 
      prevIndex === 0 ? hotelImages.length - 1 : prevIndex - 1
    );
  };

  const goToSlide = (index: number) => {
    setCurrentIndex(index);
  };

  // Autoplay del slider
  useEffect(() => {
    if (!autoplay) return;

    const interval = setInterval(() => {
      nextSlide();
    }, 5000);

    return () => clearInterval(interval);
  }, [autoplay]);

  // URL del mapa de Google Maps
  const mapUrl = `https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3900.598666972894!2d-86.25357772493292!3d12.136389688116957!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x8f73fe7867ce5fad%3A0xd32a8f1e3e0b924e!2sManagua%2C%20Nicaragua!5e0!3m2!1ses!2ses!4v1690000000000!5m2!1ses!2ses`;

  return (
    <section className="section hotel-gallery" id="galeria">
      <div className="container">
        {/* Título de la sección */}
        <div className="section-header">
          <h2 className="section-title">Nuestras Instalaciones</h2>
          <p className="section-subtitle">
            Descubre la excelencia y el confort de nuestras instalaciones de 5 estrellas
          </p>
        </div>

        {/* Slider de imágenes */}
        <div 
          className="gallery-slider"
          onMouseEnter={() => setAutoplay(false)}
          onMouseLeave={() => setAutoplay(true)}
        >
          <div className="slider-container">
            <button 
              className="slider-btn prev-btn" 
              onClick={prevSlide}
              aria-label="Imagen anterior"
            >
              <ChevronLeft size={24} />
            </button>
            <div className="main-slide">
              <img 
                src={hotelImages[currentIndex].url} 
                alt={hotelImages[currentIndex].title}
                className="slide-image"
              />
              <div className="slide-overlay">
                <div className="slide-content">
                  <h3 className="slide-title">{hotelImages[currentIndex].title}</h3>
                  <p className="slide-description">{hotelImages[currentIndex].description}</p>
                  <div className="slide-counter">
                    {currentIndex + 1} / {hotelImages.length}
                  </div>
                </div>
              </div>
            </div>

            <button 
              className="slider-btn next-btn" 
              onClick={nextSlide}
              aria-label="Siguiente imagen"
            >
              <ChevronRight size={24} />
            </button>
          </div>
          <div className="thumbnails">
            {hotelImages.map((image, index) => (
              <div 
                key={image.id}
                className={`thumbnail ${index === currentIndex ? 'active' : ''}`}
                onClick={() => goToSlide(index)}
              >
                <img 
                  src={image.url} 
                  alt={image.title}
                  className="thumbnail-image"
                />
                <div className="thumbnail-overlay">
                  <span className="thumbnail-title">{image.title}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
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
                  <span className="contact-text">{hotelInfo.phone}</span>
                </div>
                <div className="contact-item">
                  <Mail size={20} className="contact-icon" style={{ color: '#2a9d8f' }} />
                  <span className="contact-text">{hotelInfo.email}</span>
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
                <div className="rating-stars">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} size={20} fill="#FFD700" color="#FFD700" />
                  ))}
                </div>
                <div className="rating-text">
                  <strong>4.8/5</strong> en TripAdvisor
                </div>
              </div>
            </div>
          </div>

          <div className="location-map">
            <div className="map-container">
              <iframe
                src={mapUrl}
                width="100%"
                height="400"
                style={{ border: 0 }}
                allowFullScreen
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                title="Ubicación del Luxury Grand Hotel Managua"
              />
              <div className="map-overlay">
                <a 
                  href={`https://www.google.com/maps?q=${hotelInfo.coordinates.lat},${hotelInfo.coordinates.lng}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="map-link"
                >
                  Ver en Google Maps
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HotelGallery;