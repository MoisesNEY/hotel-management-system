import React, { useState } from 'react';

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
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-6xl mx-auto bg-white rounded-xl shadow-md">
        <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-6 py-4 rounded-t-xl">
          <h1>
            <i className="fas fa-plus-circle"></i>
            AGREGAR NUEVA HABITACIÓN
          </h1>
        </div>

        {message && (
          <div className={`px-6 py-4 ${message.includes('✅') || message.includes('AGREGADA') ? 'bg-green-100 text-green-800 border-l-4 border-green-500' : 'bg-red-100 text-red-800 border-l-4 border-red-500'}`}>
            {message}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="p-6">
            {/* FORMULARIO DE AGREGAR */}
            <div className="mb-6">
              <h2 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
                <i className="fas fa-plus-square"></i>
                DATOS DE LA HABITACIÓN
              </h2>
              
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
                {/* Columna 1 */}
                <div>
                  <div className="mb-4">
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
                      className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Ej: Suite Presidencial"
                      required
                    />
                  </div>

                  <div className="mb-4">
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
                      className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Ej: 150.00"
                      required
                    />
                  </div>

                  <div className="mb-4">
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
                      className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Ej: 4"
                      required
                    />
                  </div>
                </div>

                {/* Columna 2 */}
                <div>
                  <div className="mb-4">
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
                      className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Ej: 45"
                      required
                    />
                  </div>

                  <div className="mb-4">
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
                      className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Ej: 2"
                      required
                    />
                  </div>

                  <div className="mb-4">
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
                      className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="https://ejemplo.com/imagen.jpg"
                    />
                  </div>
                </div>
              </div>

              {/* Vista previa de imagen */}
              {roomData.imageUrl && (
                <div className="mt-4 p-4 bg-gray-50 rounded-lg">
                  <h3 className="text-md font-semibold text-gray-700 mb-2 flex items-center gap-2">
                    <i className="fas fa-eye"></i>
                    VISTA PREVIA DE LA IMAGEN
                  </h3>
                  <div className="flex gap-4 items-start">
                    <img 
                      src={roomData.imageUrl} 
                      alt="Vista previa" 
                      className="w-48 h-32 object-cover rounded-md"
                      onError={(e) => {
                        e.currentTarget.src = 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="100" height="100" viewBox="0 0 100 100"><rect width="100" height="100" fill="%23667eea"/><text x="50" y="50" font-family="Arial" font-size="14" fill="white" text-anchor="middle" dy=".3em">Imagen no disponible</text></svg>';
                      }}
                    />
                    <div className="flex-1">
                      <p><strong>URL:</strong> {roomData.imageUrl.substring(0, 50)}...</p>
                    </div>
                  </div>
                </div>
              )}

              {/* Descripción */}
              <div className="mb-4 mt-4">
                <label htmlFor="description">
                  <i className="fas fa-align-left"></i>
                  DESCRIPCIÓN *
                </label>
                <textarea
                  id="description"
                  name="description"
                  value={roomData.description}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  rows={4}
                  placeholder="Describe la habitación detalladamente..."
                  required
                />
              </div>

              {/* Botones */}
              <div className="flex gap-4 justify-end mt-8">
                <button type="button" className="px-6 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300 transition-colors flex items-center gap-2" onClick={clearForm}>
                  <i className="fas fa-times"></i>
                  LIMPIAR FORMULARIO
                </button>
                <button type="submit" className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors flex items-center gap-2">
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