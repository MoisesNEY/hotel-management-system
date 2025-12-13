import React, { useState } from 'react';
import styles from '../styles/RoomReservationForm.module.css';

const RoomReservationForm: React.FC = () => {
  const [roomData, setRoomData] = useState({
    name: '',
    description: '',
    basePrice: '',
    maxCapacity: '',
    area: '',
    beds: '',
    imageUrl: ''
  });
  const [message, setMessage] = useState('');

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    
    setRoomData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validar campos obligatorios
    if (!roomData.name || !roomData.description || !roomData.basePrice || 
        !roomData.maxCapacity || !roomData.area || !roomData.beds) {
      setMessage('Error: Todos los campos son obligatorios excepto la imagen');
      setTimeout(() => setMessage(''), 3000);
      return;
    }
    if (isNaN(Number(roomData.basePrice)) || Number(roomData.basePrice) <= 0) {
      setMessage('Error: El precio base debe ser un número válido mayor a 0');
      setTimeout(() => setMessage(''), 3000);
      return;
    }
    
    if (isNaN(Number(roomData.maxCapacity)) || Number(roomData.maxCapacity) <= 0) {
      setMessage('Error: La capacidad máxima debe ser un número válido mayor a 0');
      setTimeout(() => setMessage(''), 3000);
      return;
    }
    
    if (isNaN(Number(roomData.area)) || Number(roomData.area) <= 0) {
      setMessage('Error: El área debe ser un número válido mayor a 0');
      setTimeout(() => setMessage(''), 3000);
      return;
    }
    
    if (isNaN(Number(roomData.beds)) || Number(roomData.beds) <= 0) {
      setMessage('Error: El número de camas debe ser un número válido mayor a 0');
      setTimeout(() => setMessage(''), 3000);
      return;
    }
    
    // Mostrar mensaje
    setMessage(`Habitación "${roomData.name}" AGREGADA correctamente!`);
    setTimeout(() => setMessage(''), 3000);
    console.log('Datos de habitación a enviar:', {
      ...roomData,
      basePrice: Number(roomData.basePrice),
      maxCapacity: Number(roomData.maxCapacity),
      area: Number(roomData.area),
      beds: Number(roomData.beds)
    });
    
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

  return (
    <div className={styles.container}>
      <div className={styles.card}>
        <div className={styles.header}>
          <h1>
            <i className="fas fa-plus-circle"></i>
            AGREGAR NUEVA HABITACIÓN
          </h1>
        </div>

        {message && (
          <div className={`${styles.messageAlert} ${message.includes('✅') ? styles.success : styles.error}`}>
            {message}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className={styles.content}>
            {/* FORMULARIO DE AGREGAR */}
            <div className={styles.formSection} style={{ gridColumn: '1 / -1' }}>
              <h2 className={styles.sectionTitle}>
                <i className="fas fa-plus-square"></i>
                DATOS DE LA HABITACIÓN
              </h2>
              
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
                {/* Columna 1 */}
                <div>
                  <div className={styles.formGroup}>
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
                      className={styles.formControl}
                      placeholder="Ej: Suite Presidencial"
                      required
                    />
                  </div>

                  <div className={styles.formGroup}>
                    <label htmlFor="basePrice">
                      <i className="fas fa-dollar-sign"></i>
                      PRECIO BASE ($) *
                    </label>
                    <input
                      type="text"
                      inputMode="decimal"
                      id="basePrice"
                      name="basePrice"
                      value={roomData.basePrice}
                      onChange={handleChange}
                      className={styles.formControl}
                      placeholder="Ej: 150.00"
                      required
                    />
                  </div>

                  <div className={styles.formGroup}>
                    <label htmlFor="maxCapacity">
                      <i className="fas fa-users"></i>
                      CAPACIDAD MÁXIMA *
                    </label>
                    <input
                      type="text"
                      inputMode="numeric"
                      id="maxCapacity"
                      name="maxCapacity"
                      value={roomData.maxCapacity}
                      onChange={handleChange}
                      className={styles.formControl}
                      placeholder="Ej: 4"
                      required
                    />
                  </div>
                </div>

                {/* Columna 2 */}
                <div>
                  <div className={styles.formGroup}>
                    <label htmlFor="area">
                      <i className="fas fa-arrows-alt"></i>
                      ÁREA (m²) *
                    </label>
                    <input
                      type="text"
                      inputMode="decimal"
                      id="area"
                      name="area"
                      value={roomData.area}
                      onChange={handleChange}
                      className={styles.formControl}
                      placeholder="Ej: 45"
                      required
                    />
                  </div>

                  <div className={styles.formGroup}>
                    <label htmlFor="beds">
                      <i className="fas fa-bed"></i>
                      NÚMERO DE CAMAS *
                    </label>
                    <input
                      type="text"
                      inputMode="numeric"
                      id="beds"
                      name="beds"
                      value={roomData.beds}
                      onChange={handleChange}
                      className={styles.formControl}
                      placeholder="Ej: 2"
                      required
                    />
                  </div>

                  <div className={styles.formGroup}>
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
                      className={styles.formControl}
                      placeholder="https://ejemplo.com/imagen.jpg"
                    />
                  </div>
                </div>
              </div>

              {/* Vista previa de imagen */}
              {roomData.imageUrl && (
                <div className={styles.imagePreview} style={{ marginTop: '1rem' }}>
                  <h3 className={styles.sectionTitle}>
                    <i className="fas fa-eye"></i>
                    VISTA PREVIA DE LA IMAGEN
                  </h3>
                  <div className={styles.previewImageContainer}>
                    <img 
                      src={roomData.imageUrl} 
                      alt="Vista previa" 
                      className={styles.previewImage}
                      onError={(e) => {
                        e.currentTarget.src = 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="100" height="100" viewBox="0 0 100 100"><rect width="100" height="100" fill="%23667eea"/><text x="50" y="50" font-family="Arial" font-size="14" fill="white" text-anchor="middle" dy=".3em">Imagen no disponible</text></svg>';
                      }}
                    />
                    <div className={styles.previewImageInfo}>
                      <p><strong>URL:</strong> {roomData.imageUrl.substring(0, 50)}...</p>
                    </div>
                  </div>
                </div>
              )}

              {/* Descripción */}
              <div className={styles.formGroup} style={{ marginTop: '1rem' }}>
                <label htmlFor="description">
                  <i className="fas fa-align-left"></i>
                  DESCRIPCIÓN *
                </label>
                <textarea
                  id="description"
                  name="description"
                  value={roomData.description}
                  onChange={handleChange}
                  className={styles.formControl}
                  rows={4}
                  placeholder="Describe la habitación detalladamente..."
                  required
                />
              </div>

              {/* Botones */}
              <div className={styles.formActions} style={{ marginTop: '2rem' }}>
                <button type="button" className={styles.btnCancel} onClick={clearForm}>
                  <i className="fas fa-times"></i>
                  LIMPIAR FORMULARIO
                </button>
                <button type="submit" className={styles.btnSubmit}>
                  <i className="fas fa-plus"></i>
                  AGREGAR HABITACIÓN
                </button>
              </div>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default RoomReservationForm;