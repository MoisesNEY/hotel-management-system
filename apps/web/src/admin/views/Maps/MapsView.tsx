import React from 'react';
import Card from '../../components/shared/Card';
import { MapPin, Navigation } from 'lucide-react';

const MapsView: React.FC = () => {
    return (
        <div className="space-y-6">
            {/* Header */}
            <div>
            <div>
                <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-1">Mapas</h1>
                <p className="text-gray-500 dark:text-gray-400 text-sm">
                    Visualización de mapas interactivos
                </p>
            </div>
            </div>

            {/* Map Card */}
            <Card title="Ubicación del Hotel" className="shadow-md border-none">
                <div className="relative w-full h-[400px] bg-gray-100 dark:bg-white/5 rounded-xl overflow-hidden border border-gray-100 dark:border-white/10">
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

                <div className="mt-6 flex items-start space-x-4 p-4 bg-blue-50/50 dark:bg-blue-500/10 rounded-xl border border-blue-100 dark:border-blue-500/20">
                    <div className="bg-blue-100 dark:bg-blue-500/20 p-2 rounded-lg">
                        <MapPin className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                    </div>
                    <div>
                        <h4 className="font-bold text-blue-900 dark:text-blue-300 tracking-tight">Dirección del Hotel</h4>
                        <p className="text-sm text-blue-700 dark:text-blue-400/80 mt-0.5 font-medium">
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
                            <Navigation className="w-5 h-5 text-emerald-600 dark:text-emerald-400 mt-0.5" />
                            <div>
                                <h4 className="font-bold text-gray-900 dark:text-white tracking-tight">Desde el Aeropuerto</h4>
                                <p className="text-sm text-gray-500 dark:text-gray-400 mt-1 font-medium">
                                    Aproximadamente 30 minutos en taxi desde JFK
                                </p>
                            </div>
                        </div>
                        <div className="flex items-start space-x-3">
                            <Navigation className="w-5 h-5 text-emerald-600 dark:text-emerald-400 mt-0.5" />
                            <div>
                                <h4 className="font-bold text-gray-900 dark:text-white tracking-tight">Transporte Público</h4>
                                <p className="text-sm text-gray-500 dark:text-gray-400 mt-1 font-medium">
                                    Estación de metro más cercana: 34th Street - Herald Square
                                </p>
                            </div>
                        </div>
                    </div>
                </Card>

                <Card title="Lugares Cercanos" className="shadow-md border-none">
                    <ul className="space-y-2">
                        <li className="flex justify-between items-center p-2.5 hover:bg-gray-50 dark:hover:bg-white/5 rounded-lg transition-colors group">
                            <span className="text-gray-700 dark:text-gray-300 font-medium group-hover:text-gray-900 dark:group-hover:text-white transition-colors">Times Square</span>
                            <span className="text-xs font-bold text-gray-400 dark:text-gray-500 bg-gray-100 dark:bg-white/5 px-2 py-1 rounded">0.5 km</span>
                        </li>
                        <li className="flex justify-between items-center p-2.5 hover:bg-gray-50 dark:hover:bg-white/5 rounded-lg transition-colors group">
                            <span className="text-gray-700 dark:text-gray-300 font-medium group-hover:text-gray-900 dark:group-hover:text-white transition-colors">Central Park</span>
                            <span className="text-xs font-bold text-gray-400 dark:text-gray-500 bg-gray-100 dark:bg-white/5 px-2 py-1 rounded">2.1 km</span>
                        </li>
                        <li className="flex justify-between items-center p-2.5 hover:bg-gray-50 dark:hover:bg-white/5 rounded-lg transition-colors group">
                            <span className="text-gray-700 dark:text-gray-300 font-medium group-hover:text-gray-900 dark:group-hover:text-white transition-colors">Madison Square Garden</span>
                            <span className="text-xs font-bold text-gray-400 dark:text-gray-500 bg-gray-100 dark:bg-white/5 px-2 py-1 rounded">0.8 km</span>
                        </li>
                        <li className="flex justify-between items-center p-2.5 hover:bg-gray-50 dark:hover:bg-white/5 rounded-lg transition-colors group">
                            <span className="text-gray-700 dark:text-gray-300 font-medium group-hover:text-gray-900 dark:group-hover:text-white transition-colors">Bryant Park</span>
                            <span className="text-xs font-bold text-gray-400 dark:text-gray-500 bg-gray-100 dark:bg-white/5 px-2 py-1 rounded">0.3 km</span>
                        </li>
                    </ul>
                </Card>
            </div>
        </div>
    );
};

export default MapsView;
