// src/components/RoomTypes.tsx
import React from 'react';
import { Bed, Users, Maximize } from 'lucide-react';

const RoomTypes: React.FC = () => {
  const rooms = [
    {
      name: 'Habitación Estándar',
      description: 'Perfecta para viajeros individuales o parejas',
      size: '25 m²',
      capacity: '2 personas',
      price: '$120/noche',
      amenities: ['TV Smart', 'WiFi', 'Baño privado', 'Vista ciudad'],
      image: 'https://images.unsplash.com/photo-1611892440504-42a792e24d32?w=600'
    },
    {
      name: 'Suite Ejecutiva',
      description: 'Espacio amplio con área de trabajo separada',
      size: '45 m²',
      capacity: '3 personas',
      price: '$220/noche',
      amenities: ['Sala de estar', 'Escritorio', 'Minibar', 'Vista panorámica'],
      image: 'https://images.unsplash.com/photo-1566665797739-1674de7a421a?w-600'
    },
    {
      name: 'Suite Presidencial',
      description: 'La máxima experiencia de lujo y confort',
      size: '80 m²',
      capacity: '4 personas',
      price: '$450/noche',
      amenities: ['Jacuzzi', 'Cocina', '2 dormitorios', 'Servicio VIP'],
      image: 'https://images.unsplash.com/photo-1590490360182-c33d57733427?w=600'
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
                
                <div className="room-footer">
                  <div className="room-price">{room.price}</div>
                  <button className="btn btn-primary">Reservar Ahora</button>
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