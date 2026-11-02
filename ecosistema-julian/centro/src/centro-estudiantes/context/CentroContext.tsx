/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * ISFDyT N° 26 - Contexto Global del Centro de Estudiantes
 *
 * Todos los datos vienen de la API institucional (src/centro-estudiantes/api). Lo único que
 * queda en el navegador son preferencias de esta pantalla: tema, tamaño de texto, movimiento
 * reducido y si ya se vio el video de presentación en esta sesión.
 */

import React, { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';
import { toast } from 'sonner';
import {
  Comunicado,
  ComunicadoInput,
  DestinoDerivacion,
  EventAttendee,
  Evento,
  EventoInput,
  ForoHilo,
  ForoRespuesta,
  MiembroCentro,
  NotificacionItem,
  Reclamo,
  ReclamoEstado,
  ScreenId,
  ThemeName,
  UsuarioActual,
} from '../types';
import * as api from '../api/centro';
import { errorMessage, logout as apiLogout } from '../api/http';
import type { AuthMe } from '../api/dto';

interface CentroContextType {
  // Navigation
  currentScreen: ScreenId;
  setCurrentScreen: (screen: ScreenId) => void;
  selectedDetailId: string | null;
  setSelectedDetailId: (id: string | null) => void;
  showPresentation: boolean;
  setShowPresentation: (show: boolean) => void;

  // Preferences
  theme: ThemeName;
  setTheme: (theme: ThemeName) => void;
  textSize: 'normal' | 'large';
  setTextSize: (size: 'normal' | 'large') => void;
  reducedMotion: boolean;
  setReducedMotion: (val: boolean) => void;

  // Modals & Panels
  openPublishModal: boolean;
  setOpenPublishModal: (open: boolean) => void;
  publishType: 'comunicado' | 'evento' | 'hilo';
  setPublishType: (type: 'comunicado' | 'evento' | 'hilo') => void;
  openNotificationDrawer: boolean;
  setOpenNotificationDrawer: (open: boolean) => void;
  openLogoutModal: boolean;
  setOpenLogoutModal: (open: boolean) => void;

  // Carga
  loading: boolean;
  loadError: string | null;
  reload: () => Promise<void>;

  // Sesión
  currentUser: UsuarioActual;
  logout: () => Promise<void>;
  updatePerfil: (datos: { cargo: string; biografia: string }) => Promise<boolean>;

  // Miembros y mensajes
  members: MiembroCentro[];
  sendMessage: (receiverId: string, text: string) => Promise<boolean>;

  // Notificaciones
  notifications: NotificacionItem[];
  markNotificationAsRead: (id: string) => void;
  markAllNotificationsAsRead: () => void;

  // Comunicados
  comunicados: Comunicado[];
  addComunicado: (item: ComunicadoInput) => Promise<boolean>;
  updateComunicado: (id: string, item: ComunicadoInput) => Promise<boolean>;
  deleteComunicado: (id: string) => Promise<boolean>;

  // Eventos
  eventos: Evento[];
  addEvento: (item: EventoInput) => Promise<boolean>;
  updateEvento: (id: string, item: EventoInput) => Promise<boolean>;
  deleteEvento: (id: string) => Promise<boolean>;
  duplicateEvento: (id: string) => Promise<boolean>;
  fetchInscriptos: (eventId: string) => Promise<EventAttendee[]>;

  // Foros
  hilos: ForoHilo[];
  addHilo: (canal: ForoHilo['canal'], titulo: string, contenido: string) => Promise<boolean>;
  fetchRespuestas: (hiloId: string) => Promise<ForoRespuesta[]>;
  addRespuestaToHilo: (hiloId: string, contenido: string) => Promise<boolean>;
  togglePinHilo: (hiloId: string) => Promise<boolean>;
  hideHilo: (hiloId: string, motivo: string) => Promise<boolean>;
  unhideHilo: (hiloId: string) => Promise<boolean>;
  dismissDenuncia: (hiloId: string) => Promise<boolean>;

  // Reclamos
  reclamos: Reclamo[];
  updateReclamoEstado: (id: string, nuevoEstado: ReclamoEstado, comentario?: string) => Promise<boolean>;
  derivarReclamo: (id: string, destino: DestinoDerivacion, nota: string) => Promise<boolean>;
  responderReclamo: (id: string, respuesta: string) => Promise<boolean>;
  archivarReclamo: (id: string, motivo: string) => Promise<boolean>;

  // Computed metrics
  stats: {
    reclamosSinAtender: number;
    proximosEventos: number;
    inscriptosProximos: number;
    publicacionesDenunciadas: number;
  };
}

/** Preferencias locales de pantalla (no son datos del sistema). */
const LOCAL_STORAGE_KEY_PREFIX = 'isfdyt26_ce_';
const INTRO_SEEN_KEY = 'isfdyt26_ce_intro_vista';
const NOTIFICATIONS_POLL_MS = 60_000;

const readPref = (key: string): string | null => {
  try {
    return localStorage.getItem(`${LOCAL_STORAGE_KEY_PREFIX}${key}`);
  } catch {
    return null;
  }
};
const writePref = (key: string, value: string) => {
  try {
    localStorage.setItem(`${LOCAL_STORAGE_KEY_PREFIX}${key}`, value);
  } catch {
    /* navegación privada: la preferencia dura lo que la pestaña */
  }
};
const introVista = () => {
  try {
    return sessionStorage.getItem(INTRO_SEEN_KEY) === '1';
  } catch {
    return false;
  }
};

const CentroContext = createContext<CentroContextType | undefined>(undefined);

interface CentroProviderProps {
  me: AuthMe;
  /** Se llama después de cerrar la sesión en el servidor. */
  onLoggedOut: () => void;
  children: React.ReactNode;
}

export const CentroProvider: React.FC<CentroProviderProps> = ({ me, onLoggedOut, children }) => {
  // Navigation
  const [currentScreen, setCurrentScreenState] = useState<ScreenId>('inicio');
  const [selectedDetailId, setSelectedDetailId] = useState<string | null>(null);
  const [showPresentation, setShowPresentationState] = useState<boolean>(() => !introVista());

  // Settings
  const [theme, setThemeState] = useState<ThemeName>(() => (readPref('theme') as ThemeName) || 'celestial');
  const [textSize, setTextSizeState] = useState<'normal' | 'large'>(
    () => (readPref('text_size') as 'normal' | 'large') || 'normal',
  );
  const [reducedMotion, setReducedMotionState] = useState<boolean>(() => readPref('reduced_motion') === 'true');

  // Modals
  const [openPublishModal, setOpenPublishModal] = useState(false);
  const [publishType, setPublishType] = useState<'comunicado' | 'evento' | 'hilo'>('comunicado');
  const [openNotificationDrawer, setOpenNotificationDrawer] = useState(false);
  const [openLogoutModal, setOpenLogoutModal] = useState(false);

  // Datos (API)
  const nombreSesion = `${me.user.firstName} ${me.user.lastName}`.trim();
  const [currentUser, setCurrentUser] = useState<UsuarioActual>(() => ({
    id: me.user.id,
    nombre: nombreSesion,
    email: me.user.email,
    roles: me.user.roles,
    cargo: '',
    iniciales: nombreSesion
      .split(/\s+/)
      .slice(0, 2)
      .map((p) => p[0]?.toUpperCase() ?? '')
      .join(''),
    colorAvatar: '#14214F',
  }));
  const [members, setMembers] = useState<MiembroCentro[]>([]);
  const [comunicados, setComunicados] = useState<Comunicado[]>([]);
  const [eventos, setEventos] = useState<Evento[]>([]);
  const [hilos, setHilos] = useState<ForoHilo[]>([]);
  const [reclamos, setReclamos] = useState<Reclamo[]>([]);
  const [notifications, setNotifications] = useState<NotificacionItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);

  // Theme application to documentElement
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    writePref('theme', theme);
  }, [theme]);

  useEffect(() => {
    document.documentElement.setAttribute('data-text-size', textSize);
    writePref('text_size', textSize);
  }, [textSize]);

  useEffect(() => {
    document.documentElement.setAttribute('data-reduced-motion', String(reducedMotion));
    writePref('reduced_motion', String(reducedMotion));
  }, [reducedMotion]);

  const setCurrentScreen = (screen: ScreenId) => {
    setCurrentScreenState(screen);
  };

  const setShowPresentation = (show: boolean) => {
    setShowPresentationState(show);
    if (!show) {
      try {
        sessionStorage.setItem(INTRO_SEEN_KEY, '1');
      } catch {
        /* sin sessionStorage: se vuelve a mostrar al recargar */
      }
    }
  };

  const setTheme = (newTheme: ThemeName) => {
    setThemeState(newTheme);
    toast.success(`Tema cambiado a ${newTheme.charAt(0).toUpperCase() + newTheme.slice(1)}`);
  };

  const setTextSize = (size: 'normal' | 'large') => {
    setTextSizeState(size);
    toast.info(`Tamaño de texto: ${size === 'normal' ? 'Estándar' : 'Grande'}`);
  };

  const setReducedMotion = (val: boolean) => {
    setReducedMotionState(val);
    toast.info(val ? 'Reducción de movimiento activada' : 'Movimiento normal activado');
  };

  // ------------------------------------------------------------------ carga
  const loadEventos = useCallback(async () => setEventos(await api.fetchEventos()), []);
  const loadComunicados = useCallback(async () => setComunicados(await api.fetchComunicados()), []);
  const loadHilos = useCallback(async () => setHilos(await api.fetchHilos()), []);
  const loadReclamos = useCallback(async () => setReclamos(await api.fetchReclamos()), []);
  const loadNotificaciones = useCallback(async () => setNotifications(await api.fetchNotificaciones()), []);

  const reload = useCallback(async () => {
    setLoading(true);
    setLoadError(null);
    try {
      const [usuario, miembros] = await Promise.all([
        api.fetchUsuarioActual(me),
        api.fetchMiembros(),
        loadEventos(),
        loadComunicados(),
        loadHilos(),
        loadReclamos(),
        loadNotificaciones(),
      ]);
      setCurrentUser(usuario);
      setMembers(miembros);
    } catch (error) {
      setLoadError(errorMessage(error));
    } finally {
      setLoading(false);
    }
  }, [me, loadEventos, loadComunicados, loadHilos, loadReclamos, loadNotificaciones]);

  useEffect(() => {
    void reload();
  }, [reload]);

  // Notificaciones: se vuelven a pedir cada minuto mientras el panel está abierto.
  const pollRef = useRef<number | undefined>(undefined);
  useEffect(() => {
    pollRef.current = window.setInterval(() => {
      if (document.visibilityState === 'visible') loadNotificaciones().catch(() => undefined);
    }, NOTIFICATIONS_POLL_MS);
    return () => window.clearInterval(pollRef.current);
  }, [loadNotificaciones]);

  /**
   * Ejecuta una acción contra la API, muestra el resultado y refresca lo que cambió.
   * Devuelve true si salió bien (las pantallas cierran el formulario solo en ese caso).
   */
  const run = async (
    action: () => Promise<unknown>,
    refresh: (() => Promise<void>)[],
    ok?: { title: string; description?: string; kind?: 'success' | 'info' | 'warning' },
  ): Promise<boolean> => {
    try {
      await action();
      if (ok) toast[ok.kind ?? 'success'](ok.title, ok.description ? { description: ok.description } : undefined);
      return true;
    } catch (error) {
      toast.error('No se pudo completar la acción', { description: errorMessage(error) });
      return false;
    } finally {
      await Promise.all(refresh.map((r) => r().catch(() => undefined)));
    }
  };

  // ------------------------------------------------------------------ sesión
  const logout = async () => {
    try {
      await apiLogout();
    } catch {
      /* si la sesión ya no existía, igual se vuelve al ingreso */
    }
    setOpenLogoutModal(false);
    onLoggedOut();
  };

  const updatePerfil = (datos: { cargo: string; biografia: string }) =>
    run(
      () => api.updatePerfil(datos),
      [
        async () => setCurrentUser(await api.fetchUsuarioActual(me)),
        async () => setMembers(await api.fetchMiembros()),
      ],
      { title: 'Perfil actualizado' },
    );

  // ------------------------------------------------------------------ mensajes
  const sendMessage = (receiverId: string, text: string) =>
    run(() => api.sendMessage(receiverId, text), [], {
      title: '¡Listo! Mensaje enviado',
      description: 'Le llega a su bandeja de mensajes del sistema.',
    });

  // ------------------------------------------------------------------ notificaciones
  const markNotificationAsRead = (id: string) => {
    setNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, leida: true } : n)));
    api.marcarNotificacionesLeidas([id]).catch(() => loadNotificaciones().catch(() => undefined));
  };

  const markAllNotificationsAsRead = () => {
    void run(() => api.marcarNotificacionesLeidas(), [loadNotificaciones], {
      title: 'Todas las notificaciones marcadas como leídas',
    });
  };

  // ------------------------------------------------------------------ comunicados
  const addComunicado = (item: ComunicadoInput) =>
    run(() => api.createComunicado(item), [loadComunicados], {
      title:
        item.estado === 'programado'
          ? '¡Listo! Comunicado programado'
          : item.estado === 'borrador'
            ? 'Borrador guardado'
            : '¡Listo! Tu comunicado ya está publicado',
      description:
        item.estado === 'programado'
          ? `La comunidad lo verá desde el ${item.fechaPublicacion?.split('-').reverse().join('/')}.`
          : item.estado === 'borrador'
            ? 'Solo lo ve el Centro hasta que lo publiques.'
            : undefined,
      kind: item.estado === 'borrador' ? 'info' : 'success',
    });

  const updateComunicado = (id: string, item: ComunicadoInput) =>
    run(() => api.updateComunicado(id, item), [loadComunicados], { title: 'Comunicado actualizado' });

  const deleteComunicado = (id: string) =>
    run(() => api.deleteComunicado(id), [loadComunicados], { title: 'Comunicado eliminado', kind: 'info' });

  // ------------------------------------------------------------------ eventos
  const addEvento = (item: EventoInput) =>
    run(() => api.createEvento(item), [loadEventos], {
      title: '¡Listo! Evento publicado',
      description: 'Ya aparece en la agenda de la comunidad.',
    });

  const updateEvento = (id: string, item: EventoInput) =>
    run(() => api.updateEvento(id, item), [loadEventos], { title: 'Evento actualizado' });

  const deleteEvento = (id: string) =>
    run(() => api.deleteEvento(id), [loadEventos], { title: 'Evento eliminado de la agenda', kind: 'info' });

  const duplicateEvento = (id: string) => {
    const original = eventos.find((e) => e.id === id);
    if (!original) return Promise.resolve(false);
    const { id: _id, cantidadInscriptos: _c, esPasado: _p, ...datos } = original;
    return run(() => api.createEvento({ ...datos, titulo: `${original.titulo} (Copia)` }), [loadEventos], {
      title: 'Evento duplicado',
      description: 'Se creó una copia con los mismos datos y sin inscriptos.',
    });
  };

  // ------------------------------------------------------------------ foros
  const addHilo = (canal: ForoHilo['canal'], titulo: string, contenido: string) =>
    run(() => api.createHilo(canal, titulo, contenido), [loadHilos], { title: '¡Listo! Hilo publicado en el foro' });

  const addRespuestaToHilo = (hiloId: string, contenido: string) =>
    run(() => api.createRespuesta(hiloId, contenido), [loadHilos], { title: 'Respuesta enviada' });

  const togglePinHilo = (hiloId: string) => {
    const hilo = hilos.find((h) => h.id === hiloId);
    if (!hilo) return Promise.resolve(false);
    return run(() => api.patchHilo(hiloId, { pinned: !hilo.fijado }), [loadHilos], {
      title: hilo.fijado ? 'Hilo desfijado' : 'Hilo fijado al inicio',
      kind: 'info',
    });
  };

  const hideHilo = (hiloId: string, motivo: string) =>
    run(() => api.patchHilo(hiloId, { hidden: true, hiddenReason: motivo.trim(), reported: false }), [loadHilos], {
      title: 'Hilo ocultado por moderación',
      description: `Motivo: ${motivo}`,
      kind: 'warning',
    });

  const unhideHilo = (hiloId: string) =>
    run(() => api.patchHilo(hiloId, { hidden: false }), [loadHilos], { title: 'El hilo vuelve a estar visible' });

  const dismissDenuncia = (hiloId: string) =>
    run(() => api.patchHilo(hiloId, { reported: false }), [loadHilos], { title: 'Denuncia desestimada' });

  // ------------------------------------------------------------------ reclamos
  const updateReclamoEstado = (id: string, nuevoEstado: ReclamoEstado, comentario?: string) =>
    run(() => api.cambiarEstadoReclamo(id, nuevoEstado, comentario), [loadReclamos], {
      title: 'Estado del reclamo actualizado',
    });

  const derivarReclamo = (id: string, destino: DestinoDerivacion, nota: string) =>
    run(() => api.derivarReclamo(id, destino, nota), [loadReclamos], {
      title: `Reclamo derivado a ${destino}`,
      description: 'Quedó registrado en la línea de tiempo del caso.',
    });

  const responderReclamo = (id: string, respuesta: string) =>
    run(() => api.responderReclamo(id, respuesta), [loadReclamos], {
      title: 'Respuesta registrada',
      description: 'Quien presentó el reclamo la ve en su panel y recibe una notificación.',
    });

  const archivarReclamo = (id: string, motivo: string) =>
    run(() => api.archivarReclamo(id, motivo), [loadReclamos], {
      title: 'Reclamo archivado con motivo registrado',
      kind: 'info',
    });

  // Coherent statistics
  const stats = useMemo(() => {
    const reclamosSinAtender = reclamos.filter((r) => r.estado === 'recibido' || r.estado === 'en_revision').length;
    const proximos = eventos.filter((e) => !e.esPasado);
    const inscriptosProximos = proximos.reduce((acc, e) => acc + e.cantidadInscriptos, 0);
    const publicacionesDenunciadas = hilos.filter((h) => h.denunciado).length;

    return {
      reclamosSinAtender,
      proximosEventos: proximos.length,
      inscriptosProximos,
      publicacionesDenunciadas,
    };
  }, [reclamos, eventos, hilos]);

  return (
    <CentroContext.Provider
      value={{
        currentScreen,
        setCurrentScreen,
        selectedDetailId,
        setSelectedDetailId,
        showPresentation,
        setShowPresentation,
        theme,
        setTheme,
        textSize,
        setTextSize,
        reducedMotion,
        setReducedMotion,
        openPublishModal,
        setOpenPublishModal,
        publishType,
        setPublishType,
        openNotificationDrawer,
        setOpenNotificationDrawer,
        openLogoutModal,
        setOpenLogoutModal,
        loading,
        loadError,
        reload,
        currentUser,
        logout,
        updatePerfil,
        members,
        sendMessage,
        notifications,
        markNotificationAsRead,
        markAllNotificationsAsRead,
        comunicados,
        addComunicado,
        updateComunicado,
        deleteComunicado,
        eventos,
        addEvento,
        updateEvento,
        deleteEvento,
        duplicateEvento,
        fetchInscriptos: api.fetchInscriptos,
        hilos,
        addHilo,
        fetchRespuestas: api.fetchRespuestas,
        addRespuestaToHilo,
        togglePinHilo,
        hideHilo,
        unhideHilo,
        dismissDenuncia,
        reclamos,
        updateReclamoEstado,
        derivarReclamo,
        responderReclamo,
        archivarReclamo,
        stats,
      }}
    >
      {children}
    </CentroContext.Provider>
  );
};

export function useCentro() {
  const context = useContext(CentroContext);
  if (!context) {
    throw new Error('useCentro debe utilizarse dentro de un CentroProvider');
  }
  return context;
}
