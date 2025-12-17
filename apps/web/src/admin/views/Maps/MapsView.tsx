import React from 'react';
import Card from '../../components/shared/Card';
import { MapPin, Navigation } from 'lucide-react';

const MapsView: React.FC = () => {
    return (
        <div className="space-y-6">
            {/* Header */}
            <div>
                <h1 className="text-3xl font-bold text-gray-800 mb-2">Mapas</h1>
                <p className="text-gray-600">
                    Visualización de mapas interactivos
                </p>
            </div>

            {/* Map Card */}
            <Card title="Ubicación del Hotel" className="shadow-md border-none">
                <div className="relative w-full h-96 bg-gray-100 rounded-lg overflow-hidden">
                    {/* Google Maps Embed */}
                    <iframe
                        src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3022.2412648718453!2d-73.98784368459395!3d40.74844097932847!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x89c259a9b3117469%3A0xd134e199a405a163!2sEmpire%20State%20Building!5e0!3m2!1sen!2sus!4v1639584994563!5m2!1sen!2sus"
                        width="100%"
                        height="100%"
                        style={{ border: 0 }}
                        allowFullScreen
                        loading="lazy"
                        title="Hotel Location Map"
                    ></iframe>
                </div>

                <div className="mt-4 flex items-start space-x-3 p-4 bg-blue-50 rounded-lg border border-blue-200">
                    <MapPin className="w-5 h-5 text-blue-600 mt-0.5" />
                    <div>
                        <h4 className="font-semibold text-blue-900">Dirección del Hotel</h4>
                        <p className="text-sm text-blue-700 mt-1">
                            350 5th Ave, New York, NY 10118, Estados Unidos
                        </p>
                    </div>
                </div>
            </Card>

            {/* Info Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card title="Instrucciones" className="shadow-md border-none">
                    <div className="space-y-3">
                        <div className="flex items-start space-x-3">
                            <Navigation className="w-5 h-5 text-green-600 mt-0.5" />
                            <div>
                                <h4 className="font-semibold text-gray-800">Desde el Aeropuerto</h4>
                                <p className="text-sm text-gray-600 mt-1">
                                    Aproximadamente 30 minutos en taxi desde JFK
                                </p>
                            </div>
                        </div>
                        <div className="flex items-start space-x-3">
                            <Navigation className="w-5 h-5 text-green-600 mt-0.5" />
                            <div>
                                <h4 className="font-semibold text-gray-800">Transporte Público</h4>
                                <p className="text-sm text-gray-600 mt-1">
                                    Estación de metro más cercana: 34th Street - Herald Square
                                </p>
                            </div>
                        </div>
                    </div>
                </Card>

                <Card title="Lugares Cercanos" className="shadow-md border-none">
                    <ul className="space-y-2">
                        <li className="flex justify-between items-center p-2 hover:bg-gray-50 rounded">
                            <span className="text-gray-700">Times Square</span>
                            <span className="text-sm text-gray-500">0.5 km</span>
                        </li>
                        <li className="flex justify-between items-center p-2 hover:bg-gray-50 rounded">
                            <span className="text-gray-700">Central Park</span>
                            <span className="text-sm text-gray-500">2.1 km</span>
                        </li>
                        <li className="flex justify-between items-center p-2 hover:bg-gray-50 rounded">
                            <span className="text-gray-700">Madison Square Garden</span>
                            <span className="text-sm text-gray-500">0.8 km</span>
                        </li>
                        <li className="flex justify-between items-center p-2 hover:bg-gray-50 rounded">
                            <span className="text-gray-700">Bryant Park</span>
                            <span className="text-sm text-gray-500">0.3 km</span>
                        </li>
                    </ul>
                </Card>
            </div>
        </div>
    );
};

export default MapsView;
