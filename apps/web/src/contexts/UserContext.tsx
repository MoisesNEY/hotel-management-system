// apps/web/src/contexts/UserContext.tsx
import React, { createContext, useContext, useState, useEffect } from 'react';
import type { ReactNode } from 'react';

interface UserData {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  birthDate: string;
  address: string;
  city: string;
  country: string;
  gender: string;
  licenseId: string;
  preferences: {
    notifications: boolean;
    newsletter: boolean;
    language: string;
    currency: string;
  };
}

interface UserContextType {
  userData: UserData;
  hasCompletedExtraInfo: boolean;
  updateUserData: (data: Partial<UserData>) => void;
  markExtraInfoAsCompleted: () => void;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

export const UserProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [userData, setUserData] = useState<UserData>({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    birthDate: '',
    address: '',
    city: '',
    country: '',
    gender: '',
    licenseId: '',
    preferences: {
      notifications: true,
      newsletter: false,
      language: 'es',
      currency: 'USD'
    }
  });

  const [hasCompletedExtraInfo, setHasCompletedExtraInfo] = useState<boolean>(() => {
    // Verificar en localStorage si ya completó la información
    const saved = localStorage.getItem('hasCompletedExtraInfo');
    return saved === 'true';
  });

  useEffect(() => {
    // Cargar datos guardados del localStorage
    const savedUserData = localStorage.getItem('userData');
    if (savedUserData) {
      setUserData(JSON.parse(savedUserData));
    }
  }, []);

  const updateUserData = (data: Partial<UserData>) => {
    setUserData(prev => {
      const newData = { ...prev, ...data };
      // Guardar en localStorage
      localStorage.setItem('userData', JSON.stringify(newData));
      return newData;
    });
  };

  const markExtraInfoAsCompleted = () => {
    setHasCompletedExtraInfo(true);
    localStorage.setItem('hasCompletedExtraInfo', 'true');
  };

  return (
    <UserContext.Provider value={{ 
      userData, 
      hasCompletedExtraInfo, 
      updateUserData, 
      markExtraInfoAsCompleted 
    }}>
      {children}
    </UserContext.Provider>
  );
};

export const useUser = () => {
  const context = useContext(UserContext);
  if (context === undefined) {
    throw new Error('useUser must be used within a UserProvider');
  }
  return context;
};