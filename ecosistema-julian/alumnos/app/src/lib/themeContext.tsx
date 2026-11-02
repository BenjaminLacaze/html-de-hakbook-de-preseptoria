import React, { createContext, useContext, useEffect, useState } from 'react';
import type { ThemeType, RadiusType, FontType, UserPreferences } from '../types';

interface ThemeContextType {
  theme: ThemeType;
  setTheme: (theme: ThemeType) => void;
  radius: RadiusType;
  setRadius: (radius: RadiusType) => void;
  font: FontType;
  setFont: (font: FontType) => void;
  preferences: UserPreferences;
  updatePreferences: (partial: Partial<UserPreferences>) => void;
}

const defaultPreferences: UserPreferences = {
  theme: 'celestial',
  radius: 'suave',
  font: 'plus-jakarta',
  compactMode: false,
  reducedMotion: false,
  emailNotifications: {
    notasPublicadas: true,
    ausenciasRegistradas: true,
    fechasExamen: true,
    respuestasForo: false,
  },
  pushNotifications: true,
};

const STORAGE_KEY = 'asistencia_terciario_user_preferences_v1';

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [preferences, setPreferences] = useState<UserPreferences>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        return { ...defaultPreferences, ...JSON.parse(saved) };
      }
    } catch (e) {
      console.warn('No se pudieron leer las preferencias de localStorage', e);
    }
    return defaultPreferences;
  });

  const setTheme = (theme: ThemeType) => {
    updatePreferences({ theme });
  };

  const setRadius = (radius: RadiusType) => {
    updatePreferences({ radius });
  };

  const setFont = (font: FontType) => {
    updatePreferences({ font });
  };

  const updatePreferences = (partial: Partial<UserPreferences>) => {
    setPreferences((prev) => {
      const updated = { ...prev, ...partial };
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
      } catch (e) {
        console.warn('Error guardando preferencias en localStorage', e);
      }
      return updated;
    });
  };

  useEffect(() => {
    const root = document.documentElement;
    root.setAttribute('data-theme', preferences.theme);
    root.setAttribute('data-radius', preferences.radius);
    root.setAttribute('data-font', preferences.font);

    if (preferences.reducedMotion) {
      root.classList.add('reduce-motion');
    } else {
      root.classList.remove('reduce-motion');
    }
  }, [preferences.theme, preferences.radius, preferences.font, preferences.reducedMotion]);

  return (
    <ThemeContext.Provider
      value={{
        theme: preferences.theme,
        setTheme,
        radius: preferences.radius,
        setRadius,
        font: preferences.font,
        setFont,
        preferences,
        updatePreferences,
      }}
    >
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = (): ThemeContextType => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme debe ser utilizado dentro de un ThemeProvider');
  }
  return context;
};
