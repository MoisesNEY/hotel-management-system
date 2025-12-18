import React from 'react';
import { Shield, Clock, Wifi, Utensils, Car, ConciergeBell, Star } from 'lucide-react';
import { useListContent } from '../hooks/useContent';

const Features: React.FC = () => {
    const { data: features, loading } = useListContent('HOME_FEATURES');

    // Icon colors array matching the CSS
    const iconColors = [
        'text-[#4361ee]', // blue
        'text-[#f72585]', // pink
        'text-[#4cc9f0]', // cyan
        'text-[#ff9e00]', // orange
        'text-[#7209b7]', // purple
        'text-[#2a9d8f]'  // teal
    ];

    const getIcon = (title: string, index: number) => {
        const t = title.toLowerCase();
        const colorClass = iconColors[index % iconColors.length];
        const iconProps = { size: 32, className: colorClass };
        
        if (t.includes('seguridad')) return <Shield {...iconProps} />;
        if (t.includes('tiempo')) return <Clock {...iconProps} />;
        if (t.includes('wifi') || t.includes('conexión')) return <Wifi {...iconProps} />;
        if (t.includes('restaurante') || t.includes('gourmet')) return <Utensils {...iconProps} />;
        if (t.includes('estacionamiento') || t.includes('parking')) return <Car {...iconProps} />;
        if (t.includes('servicio') || t.includes('24/7')) return <ConciergeBell {...iconProps} />;
        return <Star {...iconProps} />;
    };

    if (loading) return null;

    return (
        <section className="bg-white dark:bg-[#1a1a2e] py-[70px] border-t border-b border-gray-200 dark:border-gray-700 flex flex-col items-center" id="caracteristicas">
            <div className="max-w-7xl mx-auto px-5 w-full">
                <div className="text-center mb-10 flex flex-col items-center justify-center">
                    <h2 className="text-3xl md:text-4xl text-gray-900 dark:text-white mb-2.5 font-semibold">
                        Características Exclusivas
                    </h2>
                    <p className="text-gray-600 dark:text-white text-base max-w-[500px] mx-auto">
                        Descubre lo que hace de nuestra experiencia hotelera algo único y memorable
                    </p>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                    {features.map((feature, index) => (
                        <div key={feature.id || index} className="py-[30px] px-5 text-center bg-white dark:bg-[#1e1e3e] rounded-lg shadow-sm hover:shadow-md transition-shadow">
                            <div className="mx-auto mb-4 flex items-center justify-center">
                                {getIcon(feature.title || '', index)}
                            </div>
                            <h3 className="text-xl mb-2.5 text-gray-900 dark:text-white font-semibold">
                                {feature.title}
                            </h3>
                            <p className="text-gray-600 dark:text-gray-300 leading-relaxed text-sm">
                                {feature.subtitle}
                            </p>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
};

export default Features;