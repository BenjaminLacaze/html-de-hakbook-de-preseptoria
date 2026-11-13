import React, { createContext, useContext, useEffect, useState, useCallback, useMemo } from 'react';
import { Child } from '../types/api';
import * as childrenApi from '../api/children';
import * as noticesApi from '../api/notices';
import * as authorizationsApi from '../api/authorizations';
import { useAuth } from './AuthContext';

export type ScreenId =
  | 'inicio'
  | 'asistencia'
  | 'calificaciones'
  | 'agenda'
  | 'comunicados'
  | 'justificaciones'
  | 'autorizaciones'
  | 'mensajes'
  | 'perfil'
  | 'opciones';

interface AppContextType {
  activeScreen: ScreenId;
  setActiveScreen: (screen: ScreenId) => void;
  childrenList: Child[];
  selectedChild: Child | null;
  selectedChildId: string | null;
  setSelectedChildId: (id: string) => void;
  isLoadingChildren: boolean;
  refreshChildren: () => Promise<void>;
  
  // Preferencias visuales (únicas permitidas en localStorage)
  theme: string;
  setTheme: (t: string) => void;
  textSize: 'normal' | 'large';
  setTextSize: (s: 'normal' | 'large') => void;
  reducedMotion: boolean;
  setReducedMotion: (r: boolean) => void;

  // Notificaciones & badges
  unreadNoticesCount: number;
  pendingAuthorizationsCount: number;
  refreshBadges: () => Promise<void>;

  // Flujos cruzados (ej: desde inasistencia a formulario de justificar)
  prefillJustificationDate: string | null;
  setPrefillJustificationDate: (d: string | null) => void;

  // Presentación en video
  showPresentation: boolean;
  setShowPresentation: (show: boolean) => void;
  replayPresentation: () => void;

  // Controles del entorno de prueba institucional
  isMockTestingOpen: boolean;
  setIsMockTestingOpen: (open: boolean) => void;
  forceErrorState: boolean;
  setForceErrorState: (val: boolean) => void;
  forceEmptyState: boolean;
  setForceEmptyState: (val: boolean) => void;
  simulatedLatency: number;
  setSimulatedLatency: (ms: number) => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

const STORAGE_KEYS = {
  THEME: 'familias_theme',
  TEXT_SIZE: 'familias_text_size',
  REDUCED_MOTION: 'familias_reduced_motion',
  SELECTED_CHILD: 'familias_selected_child_id',
};

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, isGuardian } = useAuth();

  // Navegación
  const [activeScreen, setActiveScreen] = useState<ScreenId>('inicio');

  // Preferencias de pantalla
  const [theme, setThemeState] = useState<string>(() => {
    return localStorage.getItem(STORAGE_KEYS.THEME) || 'institucional';
  });

  const [textSize, setTextSizeState] = useState<'normal' | 'large'>(() => {
    return (localStorage.getItem(STORAGE_KEYS.TEXT_SIZE) as 'normal' | 'large') || 'normal';
  });

  const [reducedMotion, setReducedMotionState] = useState<boolean>(() => {
    return localStorage.getItem(STORAGE_KEYS.REDUCED_MOTION) === 'true';
  });

  // Hijos
  const [childrenList, setChildrenList] = useState<Child[]>([]);
  const [isLoadingChildren, setIsLoadingChildren] = useState<boolean>(false);
  const [selectedChildId, setSelectedChildIdState] = useState<string | null>(() => {
    return localStorage.getItem(STORAGE_KEYS.SELECTED_CHILD);
  });

  // Notificaciones
  const [unreadNoticesCount, setUnreadNoticesCount] = useState<number>(0);
  const [pendingAuthorizationsCount, setPendingAuthorizationsCount] = useState<number>(0);

  // Prefill justificación
  const [prefillJustificationDate, setPrefillJustificationDate] = useState<string | null>(null);

  // Estados de prueba (mock)
  const [isMockTestingOpen, setIsMockTestingOpen] = useState<boolean>(false);
  const [forceErrorState, setForceErrorState] = useState<boolean>(false);
  const [forceEmptyState, setForceEmptyState] = useState<boolean>(false);
  const [simulatedLatency, setSimulatedLatency] = useState<number>(300);

  // Presentación en video (aparece siempre al refrescar o cargar la pantalla)
  const [showPresentation, setShowPresentation] = useState<boolean>(true);

  const replayPresentation = () => {
    setShowPresentation(true);
  };

  // Aplicar atributos a <html>
  const setTheme = (newTheme: string) => {
    setThemeState(newTheme);
    localStorage.setItem(STORAGE_KEYS.THEME, newTheme);
    document.documentElement.setAttribute('data-theme', newTheme);
  };

  const setTextSize = (newSize: 'normal' | 'large') => {
    setTextSizeState(newSize);
    localStorage.setItem(STORAGE_KEYS.TEXT_SIZE, newSize);
    document.documentElement.setAttribute('data-text-size', newSize);
  };

  const setReducedMotion = (enabled: boolean) => {
    setReducedMotionState(enabled);
    localStorage.setItem(STORAGE_KEYS.REDUCED_MOTION, String(enabled));
    document.documentElement.setAttribute('data-reduced-motion', String(enabled));
  };

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    document.documentElement.setAttribute('data-text-size', textSize);
    document.documentElement.setAttribute('data-reduced-motion', String(reducedMotion));
  }, [theme, textSize, reducedMotion]);

  const setSelectedChildId = (id: string) => {
    setSelectedChildIdState(id);
    localStorage.setItem(STORAGE_KEYS.SELECTED_CHILD, id);
  };

  const refreshBadges = useCallback(async () => {
    if (!user || !isGuardian) return;
    try {
      const [notices, auths] = await Promise.all([
        noticesApi.getNotices().catch(() => []),
        authorizationsApi.getAuthorizations().catch(() => []),
      ]);
      setUnreadNoticesCount(notices.filter((n) => !n.readByGuardian).length);
      setPendingAuthorizationsCount(auths.filter((a) => a.response === 'PENDING').length);
    } catch {
      // Ignorar en segundo plano
    }
  }, [user, isGuardian]);

  const refreshChildren = useCallback(async () => {
    if (!user || !isGuardian) {
      setChildrenList([]);
      return;
    }
    setIsLoadingChildren(true);
    try {
      const list = await childrenApi.getChildren();
      setChildrenList(list);

      // Si no hay hijo seleccionado o el seleccionado ya no pertenece al tutor
      if (list.length > 0) {
        const exists = list.some((c) => c.id === selectedChildId);
        if (!exists) {
          setSelectedChildId(list[0].id);
        }
      } else {
        setSelectedChildIdState(null);
      }
      await refreshBadges();
    } catch {
      setChildrenList([]);
    } finally {
      setIsLoadingChildren(false);
    }
  }, [user, isGuardian, selectedChildId, refreshBadges]);

  useEffect(() => {
    refreshChildren();
  }, [refreshChildren]);

  const selectedChild = useMemo(() => {
    if (!selectedChildId || childrenList.length === 0) return null;
    return childrenList.find((c) => c.id === selectedChildId) || childrenList[0] || null;
  }, [selectedChildId, childrenList]);

  return (
    <AppContext.Provider
      value={{
        activeScreen,
        setActiveScreen,
        childrenList,
        selectedChild,
        selectedChildId,
        setSelectedChildId,
        isLoadingChildren,
        refreshChildren,
        theme,
        setTheme,
        textSize,
        setTextSize,
        reducedMotion,
        setReducedMotion,
        unreadNoticesCount,
        pendingAuthorizationsCount,
        refreshBadges,
        prefillJustificationDate,
        setPrefillJustificationDate,
        showPresentation,
        setShowPresentation,
        replayPresentation,
        isMockTestingOpen,
        setIsMockTestingOpen,
        forceErrorState,
        setForceErrorState,
        forceEmptyState,
        setForceEmptyState,
        simulatedLatency,
        setSimulatedLatency,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export function useApp() {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
}
