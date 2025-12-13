import React, { useState } from 'react';
import '../styles/room-reservation.css';

const AddRoomForm: React.FC = () => {
  const [roomData, setRoomData] = useState({
    name: '',
    description: '',
    basePrice: '',
    maxCapacity: '',
    area: '',
    beds: '',
    imageUrl: ''
  });

  const [rooms, setRooms] = useState<any[]>([]);
  const [message, setMessage] = useState('');

  // Función optimizada con console.log para depuración
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    console.log(`Cambiando ${name}: ${value}`); // Para depuración
    
    setRoomData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validar
    if (!roomData.name || !roomData.description || !roomData.basePrice || 
        !roomData.maxCapacity || !roomData.area || !roomData.beds) {
      setMessage('❌ Error: Todos los campos son obligatorios excepto la imagen');
      setTimeout(() => setMessage(''), 3000);
      return;
    }

    // Crear nueva habitación
    const newRoom = {
      id: Date.now(),
      name: roomData.name,
      description: roomData.description,
      basePrice: parseFloat(roomData.basePrice),
      maxCapacity: parseInt(roomData.maxCapacity),
      area: parseInt(roomData.area),
      beds: parseInt(roomData.beds),
      imageUrl: roomData.imageUrl || 'https://images.unsplash.com/photo-1611892440504-42a792e24d32?w=500&auto=format&fit=crop',
      fecha: new Date().toLocaleString()
    };

    // AGREGAR a la lista
    setRooms(prev => [newRoom, ...prev]);
    
    // Mostrar mensaje
    setMessage(`✅ Habitación "${roomData.name}" AGREGADA correctamente!`);
    setTimeout(() => setMessage(''), 3000);
    
    // Limpiar formulario
    setRoomData({
      name: '',
      description: '',
      basePrice: '',
      maxCapacity: '',
      area: '',
      beds: '',
      imageUrl: ''
    });
  };

  const clearForm = () => {
    setRoomData({
      name: '',
      description: '',
      basePrice: '',
      maxCapacity: '',
      area: '',
      beds: '',
      imageUrl: ''
    });
    setMessage('');
  };

  const handleDeleteRoom = (id: number) => {
    setRooms(prev => prev.filter(room => room.id !== id));
    setMessage(`🗑️ Habitación eliminada correctamente!`);
    setTimeout(() => setMessage(''), 3000);
  };

  return (
    <div className="admin-reservation-container">
      <div className="admin-reservation-card">
        <div className="admin-reservation-header">
          <h1>
            <i className="fas fa-plus-circle"></i>
            AGREGAR NUEVA HABITACIÓN
          </h1>
        </div>

        {message && (
          <div className={`message-alert ${message.includes('✅') ? 'success' : 'error'}`}>
            {message}
          </div>
        )}

        <form onSubmit={handleSubmit} style={{ all: 'unset' }}>
          <div className="admin-reservation-content">
            {/* FORMULARIO DE AGREGAR */}
            <div className="reservation-form-section" style={{ gridColumn: '1 / -1' }}>
              <h2 className="section-title">
                <i className="fas fa-plus-square"></i>
                DATOS DE LA HABITACIÓN
              </h2>
              
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
                {/* Columna 1 */}
                <div>
                  <div className="form-group">
                    <label htmlFor="name">
                      <i className="fas fa-hotel"></i>
                      NOMBRE DE HABITACIÓN *
                    </label>
                    <input
                      type="text"
                      id="name"
                      name="name"
                      value={roomData.name}
                      onChange={handleChange}
                      className="form-control"
                      placeholder="Ej: Suite Presidencial"
                      required
                      style={{ 
                        pointerEvents: 'auto',
                        opacity: 1,
                        backgroundColor: 'white'
                      }}
                    />
                  </div>

                  <div className="form-group">
                    <label htmlFor="basePrice">
                      <i className="fas fa-dollar-sign"></i>
                      PRECIO BASE ($) *
                    </label>
                    <input
                      type="number"
                      id="basePrice"
                      name="basePrice"
                      value={roomData.basePrice}
                      onChange={handleChange}
                      className="form-control"
                      min="0"
                      step="0.01"
                      placeholder="Ej: 150.00"
                      required
                      style={{ 
                        pointerEvents: 'auto',
                        opacity: 1,
                        backgroundColor: 'white'
                      }}
                    />
                  </div>

                  <div className="form-group">
                    <label htmlFor="maxCapacity">
                      <i className="fas fa-users"></i>
                      CAPACIDAD MÁXIMA *
                    </label>
                    <input
                      type="number"
                      id="maxCapacity"
                      name="maxCapacity"
                      value={roomData.maxCapacity}
                      onChange={handleChange}
                      className="form-control"
                      min="1"
                      placeholder="Ej: 4"
                      required
                      style={{ 
                        pointerEvents: 'auto',
                        opacity: 1,
                        backgroundColor: 'white'
                      }}
                    />
                  </div>
                </div>

                {/* Columna 2 */}
                <div>
                  <div className="form-group">
                    <label htmlFor="area">
                      <i className="fas fa-arrows-alt"></i>
                      ÁREA (m²) *
                    </label>
                    <input
                      type="number"
                      id="area"
                      name="area"
                      value={roomData.area}
                      onChange={handleChange}
                      className="form-control"
                      min="1"
                      placeholder="Ej: 45"
                      required
                      style={{ 
                        pointerEvents: 'auto',
                        opacity: 1,
                        backgroundColor: 'white'
                      }}
                    />
                  </div>

                  <div className="form-group">
                    <label htmlFor="beds">
                      <i className="fas fa-bed"></i>
                      NÚMERO DE CAMAS *
                    </label>
                    <input
                      type="number"
                      id="beds"
                      name="beds"
                      value={roomData.beds}
                      onChange={handleChange}
                      className="form-control"
                      min="1"
                      placeholder="Ej: 2"
                      required
                      style={{ 
                        pointerEvents: 'auto',
                        opacity: 1,
                        backgroundColor: 'white'
                      }}
                    />
                  </div>

                  <div className="form-group">
                    <label htmlFor="imageUrl">
                      <i className="fas fa-image"></i>
                      URL DE IMAGEN
                    </label>
                    <input
                      type="url"
                      id="imageUrl"
                      name="imageUrl"
                      value={roomData.imageUrl}
                      onChange={handleChange}
                      className="form-control"
                      placeholder="https://ejemplo.com/imagen.jpg"
                      style={{ 
                        pointerEvents: 'auto',
                        opacity: 1,
                        backgroundColor: 'white'
                      }}
                    />
                  </div>
                </div>
              </div>

              {/* Descripción */}
              <div className="form-group" style={{ marginTop: '1rem' }}>
                <label htmlFor="description">
                  <i className="fas fa-align-left"></i>
                  DESCRIPCIÓN *
                </label>
                <textarea
                  id="description"
                  name="description"
                  value={roomData.description}
                  onChange={handleChange}
                  className="form-control"
                  rows={4}
                  placeholder="Describe la habitación detalladamente..."
                  required
                  style={{ 
                    pointerEvents: 'auto',
                    opacity: 1,
                    backgroundColor: 'white'
                  }}
                />
              </div>

              {/* Botones */}
              <div className="form-actions" style={{ marginTop: '2rem' }}>
                <button type="button" className="btn-cancel" onClick={clearForm}>
                  <i className="fas fa-times"></i>
                  LIMPIAR FORMULARIO
                </button>
                <button type="submit" className="btn-submit">
                  <i className="fas fa-plus"></i>
                  AGREGAR HABITACIÓN
                </button>
              </div>
            </div>

            {/* VISTA PREVIA */}
            <div className="room-preview-section">
              <h2 className="section-title">
                <i className="fas fa-eye"></i>
                VISTA PREVIA
              </h2>
              
              <div className="room-preview-card">
                <div 
                  className="room-image-placeholder"
                  style={{
                    background: roomData.imageUrl 
                      ? `url(${roomData.imageUrl}) center/cover no-repeat`
                      : `url('https://images.unsplash.com/photo-1611892440504-42a792e24d32?w=500&auto=format&fit=crop') center/cover no-repeat`
                  }}
                />
                
                <h3>{roomData.name || 'Nombre de la habitación'}</h3>
                
                <p className="room-description">
                  {roomData.description || 'Descripción de la habitación...'}
                </p>
                
                <div className="room-details">
                  <div className="detail-item">
                    <i className="fas fa-dollar-sign"></i>
                    <span>${roomData.basePrice || '0'}/noche</span>
                  </div>
                  <div className="detail-item">
                    <i className="fas fa-users"></i>
                    <span>{roomData.maxCapacity || '0'} personas</span>
                  </div>
                  <div className="detail-item">
                    <i className="fas fa-arrows-alt"></i>
                    <span>{roomData.area || '0'} m²</span>
                  </div>
                  <div className="detail-item">
                    <i className="fas fa-bed"></i>
                    <span>{roomData.beds || '0'} camas</span>
                  </div>
                </div>
              </div>
            </div>

            {/* HABITACIONES AGREGADAS */}
            <div className="room-preview-section">
              <h2 className="section-title">
                <i className="fas fa-list-check"></i>
                HABITACIONES AGREGADAS ({rooms.length})
              </h2>
              
              {rooms.length === 0 ? (
                <div className="empty-state">
                  <i className="fas fa-bed"></i>
                  <div>No hay habitaciones agregadas aún</div>
                </div>
              ) : (
                <div className="rooms-list">
                  {rooms.map((room) => (
                    <div key={room.id} className="room-item">
                      <div className="room-item-header">
                        <div className="room-item-title">{room.name}</div>
                        <button 
                          className="btn-delete-room"
                          onClick={() => handleDeleteRoom(room.id)}
                        >
                          <i className="fas fa-trash"></i>
                        </button>
                      </div>
                      <div className="room-item-description">
                        {room.description.substring(0, 100)}...
                      </div>
                      <div className="room-item-details">
                        <span><i className="fas fa-dollar-sign"></i> ${room.basePrice}</span>
                        <span><i className="fas fa-users"></i> {room.maxCapacity} pers.</span>
                        <span><i className="fas fa-arrows-alt"></i> {room.area} m²</span>
                        <span><i className="fas fa-bed"></i> {room.beds} camas</span>
                      </div>
                      <div className="room-item-date">
                        Agregado: {room.fecha}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddRoomForm;