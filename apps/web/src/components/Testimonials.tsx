// src/components/Testimonials.tsx
import React from 'react';
import { Star, Quote } from 'lucide-react';

const Testimonials: React.FC = () => {
  const testimonials = [
    {
      name: 'María González',
      role: 'Viajera de Negocios',
      rating: 5,
      comment: 'El sistema de reservas online es increíblemente fácil de usar. Pude gestionar toda mi estadía desde mi teléfono.',
      avatar: 'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=100',
      stay: 'Estadía: 3 noches, Suite Ejecutiva'
    },
    {
      name: 'Carlos Rodríguez',
      role: 'Turista Familiar',
      rating: 5,
      comment: 'La atención personalizada y la facilidad para solicitar servicios adicionales hicieron nuestra estadía perfecta.',
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100',
      stay: 'Estadía: 5 noches, 2 habitaciones'
    },
    {
      name: 'Ana Martínez',
      role: 'Celebración Especial',
      rating: 4,
      comment: 'Reservar para nuestro aniversario fue sencillo y el check-in express nos ahorró mucho tiempo. ¡Altamente recomendado!',
      avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100',
      stay: 'Estadía: 2 noches, Suite Presidencial'
    },
    {
      name: 'Roberto Sánchez',
      role: 'Evento Corporativo',
      rating: 5,
      comment: 'El portal de gestión me permitió coordinar múltiples reservas para mi equipo sin complicaciones. Excelente servicio.',
      avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100',
      stay: 'Estadía: 10 habitaciones, 2 noches'
    }
  ];

  return (
    <section className="section testimonials">
      <div className="container">
        <div className="testimonials-header">
          <h2 className="section-title">Opiniones de Nuestros Huéspedes</h2>
          <p className="section-subtitle">
            Descubre lo que dicen nuestros clientes sobre su experiencia
            y nuestro sistema de gestión
          </p>
        </div>

        <div className="testimonials-grid">
          {testimonials.map((testimonial, index) => (
            <div key={index} className="testimonial-card">
              <div className="testimonial-header">
                <div className="user-info">
                  <img 
                    src={testimonial.avatar} 
                    alt={testimonial.name}
                    className="user-avatar"
                  />
                  <div className="user-details">
                    <h4 className="user-name">{testimonial.name}</h4>
                    <p className="user-role">{testimonial.role}</p>
                  </div>
                </div>
                <Quote className="quote-icon" size={24} color="#3498db" />
              </div>

              <div className="testimonial-rating">
                {[...Array(testimonial.rating)].map((_, i) => (
                  <Star key={i} size={16} fill="#FFD700" color="#FFD700" />
                ))}
                {[...Array(5 - testimonial.rating)].map((_, i) => (
                  <Star key={i + testimonial.rating} size={16} color="#e0e0e0" />
                ))}
              </div>

              <p className="testimonial-comment">{testimonial.comment}</p>
              
              <div className="testimonial-footer">
                <span className="stay-info">{testimonial.stay}</span>
                <span className="verified-badge">
                  ✓ Verificado
                </span>
              </div>
            </div>
          ))}
        </div>

        <div className="stats-container">
          <div className="stat-item">
            <div className="stat-number">4.8/5</div>
            <div className="stat-label">Calificación Promedio</div>
            <div className="stat-stars">
              {[...Array(5)].map((_, i) => (
                <Star key={i} size={20} fill="#FFD700" color="#FFD700" />
              ))}
            </div>
          </div>
          
          <div className="stat-item">
            <div className="stat-number">2,500+</div>
            <div className="stat-label">Reservas Online</div>
            <div className="stat-desc">Procesadas este año</div>
          </div>
          
          <div className="stat-item">
            <div className="stat-number">98%</div>
            <div className="stat-label">Satisfacción</div>
            <div className="stat-desc">Clientes satisfechos</div>
          </div>
          
          <div className="stat-item">
            <div className="stat-number">24/7</div>
            <div className="stat-label">Soporte</div>
            <div className="stat-desc">Asistencia disponible</div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Testimonials;