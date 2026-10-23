/**
 * Contexto de Accesibilidad
 * Sistema de Asistencia Escolar - Módulo Alumno
 * Responsable: Lucia Salgado
 */

import React, { createContext, useContext, useEffect, useState } from 'react';
import { AccessibilitySettings } from '../types';

interface AccessibilityContextType {
  settings: AccessibilitySettings;
  setTextSize: (size: 'normal' | 'large' | 'xlarge') => void;
  setHighContrast: (enabled: boolean) => void;
  setDarkMode: (enabled: boolean) => void;
  resetAccessibility: () => void;
}

const STORAGE_KEY = 'sae_alumno_accessibility_prefs';

const DEFAULT_SETTINGS: AccessibilitySettings = {
  textSize: 'normal',
  highContrast: false,
  darkMode: false
};

const AccessibilityContext = createContext<AccessibilityContextType | undefined>(undefined);

export const AccessibilityProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [settings, setSettings] = useState<AccessibilitySettings>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        return { ...DEFAULT_SETTINGS, ...JSON.parse(saved) };
      }
    } catch {
      // Ignorar errores de localStorage
    }
    return DEFAULT_SETTINGS;
  });

  // Sincronizar clases y atributos con el elemento raíz HTML
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
    } catch {
      // noop
    }

    const root = document.documentElement;

    // Tamaño de texto
    root.setAttribute('data-text-size', settings.textSize);

    // Alto contraste
    if (settings.highContrast) {
      root.classList.add('high-contrast');
    } else {
      root.classList.remove('high-contrast');
    }

    // Modo oscuro
    if (settings.darkMode) {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
  }, [settings]);

  const setTextSize = (size: 'normal' | 'large' | 'xlarge') => {
    setSettings((prev) => ({ ...prev, textSize: size }));
  };

  const setHighContrast = (enabled: boolean) => {
    setSettings((prev) => ({ ...prev, highContrast: enabled }));
  };

  const setDarkMode = (enabled: boolean) => {
    setSettings((prev) => ({ ...prev, darkMode: enabled }));
  };

  const resetAccessibility = () => {
    setSettings(DEFAULT_SETTINGS);
  };

  return (
    <AccessibilityContext.Provider
      value={{
        settings,
        setTextSize,
        setHighContrast,
        setDarkMode,
        resetAccessibility
      }}
    >
      {children}
    </AccessibilityContext.Provider>
  );
};

export function useAccessibility() {
  const context = useContext(AccessibilityContext);
  if (!context) {
    throw new Error('useAccessibility debe ser utilizado dentro de un AccessibilityProvider');
  }
  return context;
}
