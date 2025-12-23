import React from 'react';
import { CollectionType } from '../../../types/adminTypes';
import type {
  BookingStatus,
  RoomStatus,
  RequestStatus,
  Gender
} from '../../../types/adminTypes';

interface TypeBadgeProps {
  type: string;
  value: string;
  category: 'collection' | 'booking' | 'room' | 'request' | 'gender';
}

const TypeBadge: React.FC<TypeBadgeProps> = ({ type, value, category }) => {
  const getConfig = () => {
    switch (category) {
      case 'collection':
        const collectionConfig = {
          [CollectionType.SINGLE_IMAGE]: { color: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200', icon: '🖼️', label: 'Imagen Única' },
          [CollectionType.GALLERY]: { color: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200', icon: '🎞️', label: 'Galería' },
          [CollectionType.TEXT_LIST]: { color: 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200', icon: '📝', label: 'Lista de Texto' },
          [CollectionType.MAP_EMBED]: { color: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200', icon: '🗺️', label: 'Mapa' }
        };
        return collectionConfig[value as keyof typeof collectionConfig] || { color: 'bg-gray-100 text-gray-800', icon: '❓', label: value };

      case 'booking':
        const bookingConfig = {
          PENDING: { color: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200', icon: '⏳', label: 'Pendiente' },
          CONFIRMED: { color: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200', icon: '✅', label: 'Confirmada' },
          CANCELLED: { color: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200', icon: '❌', label: 'Cancelada' },
          CHECKED_IN: { color: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200', icon: '🏨', label: 'Check-in' },
          CHECKED_OUT: { color: 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200', icon: '🚪', label: 'Check-out' }
        };
        return bookingConfig[value as BookingStatus] || { color: 'bg-gray-100 text-gray-800', icon: '❓', label: value };

      case 'room':
        const roomConfig = {
          AVAILABLE: { color: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200', icon: '✅', label: 'Disponible' },
          OCCUPIED: { color: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200', icon: '🚫', label: 'Ocupada' },
          MAINTENANCE: { color: 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200', icon: '🔧', label: 'Mantenimiento' },
          CLEANING: { color: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200', icon: '🧹', label: 'Limpieza' },
          DIRTY: { color: 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200', icon: '🛁', label: 'Sucia' }
        };
        return roomConfig[value as RoomStatus] || { color: 'bg-gray-100 text-gray-800', icon: '❓', label: value };

      case 'request':
        const requestConfig = {
          OPEN: { color: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200', icon: '📋', label: 'Abierto' },
          IN_PROGRESS: { color: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200', icon: '⚙️', label: 'En Progreso' },
          COMPLETED: { color: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200', icon: '✅', label: 'Completado' },
          REJECTED: { color: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200', icon: '❌', label: 'Rechazado' }
        };
        return requestConfig[value as RequestStatus] || { color: 'bg-gray-100 text-gray-800', icon: '❓', label: value };

      case 'gender':
        const genderConfig = {
          MALE: { color: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200', icon: '👨', label: 'Masculino' },
          FEMALE: { color: 'bg-pink-100 text-pink-800 dark:bg-pink-900 dark:text-pink-200', icon: '👩', label: 'Femenino' },
          OTHER: { color: 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200', icon: '👤', label: 'Otro' }
        };
        return genderConfig[value as Gender] || { color: 'bg-gray-100 text-gray-800', icon: '❓', label: value };

      default:
        return { color: 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200', icon: '📌', label: value };
    }
  };

  const config = getConfig();

  return (
    <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${config.color}`}>
      <span className="mr-1">{config.icon}</span>
      {type ? `${type}: ` : ''}{config.label}
    </span>
  );
};

export default TypeBadge;