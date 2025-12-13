import React, { useState } from 'react';
import { Calendar, MapPin, Users, Bed } from 'lucide-react';

const Hero: React.FC = () => {
  // Estados para el formulario
  const [selectedDestination, setSelectedDestination] = useState('');
  const [selectedDate, setSelectedDate] = useState('');
  const [selectedGuests, setSelectedGuests] = useState('1');
  const [selectedRoom, setSelectedRoom] = useState('');
  const [showMessage, setShowMessage] = useState(false);

  // Tipos de habitaciones
  const roomTypes = [
    { id: 'standard', name: 'Habitación Estándar', description: 'Cama doble, baño privado' },
    { id: 'deluxe', name: 'Habitación Deluxe', description: 'Vista a la ciudad, mini bar' },
    { id: 'suite', name: 'Suite Ejecutiva', description: 'Sala separada, jacuzzi' },
    { id: 'presidencial', name: 'Suite Presidencial', description: 'Terraza privada, servicio de mayordomo' },
    { id: 'familiar', name: 'Suite Familiar', description: 'Dos habitaciones, capacidad para 5 personas' }
  ];

  // Manejar la búsqueda de disponibilidad
  const handleSearchAvailability = () => {
    // Validar que todos los campos estén completos
    if (!selectedDestination || !selectedDate || !selectedGuests || !selectedRoom) {
      alert('Por favor, complete todos los campos del formulario.');
      return;
    }

    // Mostrar mensaje de "No disponible" temporalmente
    setShowMessage(true);
    
    // Ocultar el mensaje después de 3 segundos
    setTimeout(() => {
      setShowMessage(false);
    }, 3000);
  };

  // Obtener la fecha mínima para el input de fecha (hoy)
  const getTodayDate = () => {
    const today = new Date();
    return today.toISOString().split('T')[0];
  };

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
            {/* Destino */}
            <div className="form-group">
              <div className="icon-container" style={{ color: '#FF6B35' }}>
                <MapPin size={22} />
              </div>
              <select 
                className="form-control" 
                value={selectedDestination}
                onChange={(e) => setSelectedDestination(e.target.value)}
              >
                <option value="">Seleccionar destino</option>
                <option value="hotel-centro">Gran Hotel</option>
              </select>
            </div>

            {/* Fecha */}
            <div className="form-group">
              <div className="icon-container" style={{ color: '#4361EE' }}>
                <Calendar size={22} />
              </div>
              <input 
                type="date" 
                className="form-control" 
                value={selectedDate}
                min={getTodayDate()}
                onChange={(e) => setSelectedDate(e.target.value)}
              />
            </div>

            {/* Huéspedes */}
            <div className="form-group">
              <div className="icon-container" style={{ color: '#2A9D8F' }}>
                <Users size={22} />
              </div>
              <select 
                className="form-control" 
                value={selectedGuests}
                onChange={(e) => setSelectedGuests(e.target.value)}
              >
                <option value="1">1 Huésped</option>
                <option value="2">2 Huéspedes</option>
                <option value="3">3 Huéspedes</option>
                <option value="4">4 Huéspedes</option>
                <option value="5">5 Huéspedes</option>
                <option value="6">6+ Huéspedes</option>
              </select>
            </div>

            {/* Tipo de habitación */}
            <div className="form-group">
              <div className="icon-container" style={{ color: '#9D4EDD' }}>
                <Bed size={22} />
              </div>
              <select 
                className="form-control" 
                value={selectedRoom}
                onChange={(e) => setSelectedRoom(e.target.value)}
              >
                <option value="">Seleccionar habitación</option>
                {roomTypes.map((room) => (
                  <option key={room.id} value={room.id}>
                    {room.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Botón de búsqueda */}
            <button 
              className="btn btn-accent btn-search"
              onClick={handleSearchAvailability}
            >
              Buscar Disponibilidad
            </button>

            {/* Mensaje de disponibilidad */}
            {showMessage && (
              <div className="availability-message">
                <div className="message-content">
                  <p className="message-text">
                    ⚠️ Lo sentimos, por el momento no hay disponibilidad para las fechas y tipo de habitación seleccionados.
                  </p>
                  <p className="message-subtext">
                    Por favor, intente con otras fechas o comuníquese con nuestro servicio al cliente.
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* Mostrar detalles de la habitación seleccionada */}
          {selectedRoom && (
            <div className="room-details">
              <h3>Detalles de la habitación seleccionada:</h3>
              {roomTypes
                .filter(room => room.id === selectedRoom)
                .map(room => (
                  <div key={room.id} className="room-info">
                    <h4>{room.name}</h4>
                    <p>{room.description}</p>
                  </div>
                ))
              }
            </div>
          )}
        </div>
      </div>

      {/* Estilos adicionales */}
      <style>{`
        .hero {
          position: relative;
          width: 100%;
          overflow: hidden;
        }

        .hero::before,
        .hero::after {
          content: '';
          position: absolute;
          pointer-events: none;
        }

        .booking-form {
          display: flex;
          flex-direction: column;
          gap: 1rem;
          max-width: 800px;
          margin: 0 auto;
          background: rgba(255, 255, 255, 0.95);
          padding: 1.5rem;
          border-radius: 12px;
          box-shadow: 0 10px 30px rgba(0, 0, 0, 0.1);
        }
        
        .form-group {
          display: flex;
          align-items: center;
          background: white;
          border-radius: 8px;
          padding: 0;
          box-shadow: 0 2px 5px rgba(0,0,0,0.05);
          border: 1px solid #e2e8f0;
          transition: border-color 0.3s ease;
        }

        .form-group:hover {
          border-color: #cbd5e0;
        }

        .form-group:focus-within {
          border-color: #4299e1;
          box-shadow: 0 0 0 3px rgba(66, 153, 225, 0.1);
        }
        
        .icon-container {
          padding: 0 1rem;
          display: flex;
          align-items: center;
          height: 100%;
        }
        
        .form-control {
          flex: 1;
          border: none;
          padding: 0.75rem;
          font-size: 1rem;
          outline: none;
          background: transparent;
          color: #2d3748;
          font-family: inherit;
          height: 100%;
          min-height: 50px;
        }
        
        select.form-control {
          cursor: pointer;
          appearance: none;
          background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='16' height='16' viewBox='0 0 24 24' fill='none' stroke='%234a5568' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpolyline points='6 9 12 15 18 9'%3E%3C/polyline%3E%3C/svg%3E");
          background-repeat: no-repeat;
          background-position: right 1rem center;
          padding-right: 2.5rem;
        }
        
        input[type="date"].form-control {
          cursor: pointer;
          color: #2d3748;
        }
        
        input[type="date"].form-control::-webkit-calendar-picker-indicator {
          cursor: pointer;
          opacity: 0.6;
          transition: opacity 0.3s;
        }
        
        input[type="date"].form-control::-webkit-calendar-picker-indicator:hover {
          opacity: 1;
        }
        
        .btn-search {
          background: linear-gradient(135deg, #FF6B35, #FF8E53);
          color: white;
          border: none;
          padding: 1rem 2rem;
          border-radius: 8px;
          font-size: 1.1rem;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.3s ease;
          margin-top: 0.5rem;
          height: 50px;
          display: flex;
          align-items: center;
          justify-content: center;
        }
        
        .btn-search:hover {
          transform: translateY(-2px);
          box-shadow: 0 5px 15px rgba(255, 107, 53, 0.4);
          background: linear-gradient(135deg, #FF8E53, #FF6B35);
        }
        
        .btn-search:active {
          transform: translateY(0);
        }
        
        .availability-message {
          background: #FFF3CD;
          border: 1px solid #FFEAA7;
          border-radius: 8px;
          padding: 1rem;
          margin-top: 1rem;
          animation: fadeIn 0.5s ease;
        }
        
        .message-text {
          color: #856404;
          font-weight: 600;
          margin-bottom: 0.5rem;
        }
        
        .message-subtext {
          color: #856404;
          font-size: 0.9rem;
          opacity: 0.8;
        }
        
        .room-details {
          background: white;
          border-radius: 8px;
          padding: 1.5rem;
          margin-top: 2rem;
          box-shadow: 0 2px 15px rgba(0,0,0,0.1);
          animation: fadeIn 0.5s ease;
          border-left: 4px solid #FF6B35;
        }
        
        .room-details h3 {
          color: #333;
          margin-bottom: 1rem;
          font-size: 1.2rem;
          font-weight: 600;
        }
        
        .room-info h4 {
          color: #FF6B35;
          margin-bottom: 0.5rem;
          font-size: 1.1rem;
          font-weight: 600;
        }
        
        .room-info p {
          color: #666;
          line-height: 1.5;
        }
        
        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        
        @media (min-width: 768px) {

          .hero-title {
            font-size: 3rem;
          }

          .hero-subtitle {
            font-size: 1.25rem;
          }

          .booking-form {
            flex-direction: row;
            flex-wrap: wrap;
            align-items: stretch;
            padding: 1rem;
          }
          
          .form-group {
            flex: 1;
            min-width: 180px;
            margin: 0.25rem;
          }
          
          .btn-search {
            flex: 1;
            min-width: 180px;
            margin: 0.25rem;
            margin-top: 0;
          }

          .availability-message {
            flex-basis: 100%;
            margin: 0.25rem;
          }
        }

        @media (min-width: 1024px) {
          .hero-title {
            font-size: 3.5rem;
          }
          
          .form-group {
            min-width: 200px;
          }
          
          .btn-search {
            min-width: 200px;
          }
        }
      `}</style>
    </section>
  );
};

export default Hero;