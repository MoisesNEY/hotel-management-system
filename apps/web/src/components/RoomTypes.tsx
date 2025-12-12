import React from 'react';
import { Bed, Users, Maximize, Check } from 'lucide-react';
import '../styles/room-pricing-minimal.css';

const RoomTypes: React.FC = () => {
  const rooms = [
    {
      name: 'Habitación Estándar',
      description: 'Perfecta para viajeros individuales o parejas',
      size: '25 m²',
      capacity: '2 personas',
      price: 120,
      amenities: ['TV Smart', 'WiFi', 'Baño privado', 'Vista ciudad'],
      image: 'https://images.unsplash.com/photo-1611892440504-42a792e24d32?w=600',
      features: [
        { icon: <Check size={16} />, text: 'Cancelación gratuita' },
        { icon: <Check size={16} />, text: 'Desayuno incluido' }
      ]
    },
    {
      name: 'Suite Ejecutiva',
      description: 'Espacio amplio con área de trabajo separada',
      size: '45 m²',
      capacity: '3 personas',
      price: 220,
      amenities: ['Sala de estar', 'Escritorio', 'Minibar', 'Vista panorámica'],
      image: 'https://images.unsplash.com/photo-1566665797739-1674de7a421a?w=600',
      features: [
        { icon: <Check size={16} />, text: 'Acceso ejecutivo' },
        { icon: <Check size={16} />, text: 'Late check-out' }
      ]
    },
    {
      name: 'Suite Presidencial',
      description: 'La máxima experiencia de lujo y confort',
      size: '80 m²',
      capacity: '4 personas',
      price: 450,
      amenities: ['Jacuzzi', 'Cocina', '2 dormitorios', 'Servicio VIP'],
      image: 'https://images.unsplash.com/photo-1590490360182-c33d57733427?w=600',
      features: [
        { icon: <Check size={16} />, text: 'Servicio personal' },
        { icon: <Check size={16} />, text: 'Todos los beneficios' }
      ]
    }
  ];

  return (
    <section className="section rooms" id="habitaciones">
      <div className="container">
        <h2 className="section-title">Tipos de Habitación</h2>
        <div className="rooms-grid">
          {rooms.map((room, index) => (
            <div key={index} className="room-card">
              <div className="room-image">
                <img src={room.image} alt={room.name} />
                <div className="room-badge">Disponible</div>
              </div>
              <div className="room-content">
                <h3 className="room-name">{room.name}</h3>
                <p className="room-description">{room.description}</p>
                
                <div className="room-details">
                  <div className="detail">
                    <Maximize size={18} />
                    <span>{room.size}</span>
                  </div>
                  <div className="detail">
                    <Users size={18} />
                    <span>{room.capacity}</span>
                  </div>
                  <div className="detail">
                    <Bed size={18} />
                    <span>{room.capacity.includes('2') ? '1 cama' : '2 camas'}</span>
                  </div>
                </div>
                
                <div className="room-amenities">
                  {room.amenities.map((amenity, idx) => (
                    <span key={idx} className="amenity">{amenity}</span>
                  ))}
                </div>
                <div className="room-pricing-section">
                  <div className="pricing-container">
                    <div className="price-display">
                      <div className="price-main">
                        <span className="price-currency">$</span>
                        <span className="price-amount">{room.price}</span>
                        <span className="price-period">/noche</span>
                      </div>
                      <div className="price-note">Impuestos incluidos</div>
                    </div>
                    
                    <button className="book-btn">
                      RESERVAR AHORA
                    </button>
                    
                    <div className="price-features">
                      {room.features.map((feature, idx) => (
                        <div key={idx} className="price-feature">
                          <div className="feature-icon">
                            {feature.icon}
                          </div>
                          <div className="feature-text">
                            {feature.text}
                          </div>
                        </div>
                      ))}
                    </div>
                    
                    <div className="quality-badge">
                      Calidad Garantizada
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default RoomTypes;