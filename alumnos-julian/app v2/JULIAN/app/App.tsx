/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from "react";
import { QueryClient, QueryClientProvider, useQuery, useQueryClient } from "@tanstack/react-query";
import { Toaster, toast } from "sonner";
import { StudentApi } from "../shared/services/api";
import { NavigationSection } from "../shared/types";
import { ThemeProvider } from "../shared/lib/theme";
import { Layout } from "./Layout";
import { CardSkeleton, ErrorState } from "../shared/ui/States";

// Vistas del Módulo Alumno
import { IntroScreen } from "../features/intro/IntroScreen";
import { InicioView } from "../features/inicio/InicioView";
import { PerfilView } from "../features/perfil/PerfilView";
import { AgendaView } from "../features/agenda/AgendaView";
import { MateriasView } from "../features/materias/MateriasView";
import { NotasView } from "../features/notas/NotasView";
import { FaltasView } from "../features/faltas/FaltasView";
import { HistorialView } from "../features/historial/HistorialView";
import { ComunidadView } from "../features/comunidad/ComunidadView";
import { ForosView } from "../features/foros/ForosView";
import { OpcionesView } from "../features/opciones/OpcionesView";
import { AparienciaView } from "../features/apariencia/AparienciaView";
import { AsistenciaQRView } from "../features/asistencia-qr/AsistenciaQRView";
import { LogoutDialog } from "../features/logout/LogoutDialog";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5,
      refetchOnWindowFocus: false,
    },
  },
});

function StudentPortalContent() {
  const qc = useQueryClient();

  // Pantalla de Introducción con el video oficial de transición
  const [showIntro, setShowIntro] = useState<boolean>(() => {
    if (typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search);
      if (params.get("skip_intro") === "true") return false;
    }
    return true;
  });

  // Gestión de ruta/pestaña activa sincronizada con la URL
  const [currentSection, setCurrentSection] = useState<NavigationSection>(() => {
    if (typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search);
      const tab = params.get("tab") as NavigationSection | null;
      const validTabs: NavigationSection[] = [
        "inicio",
        "perfil",
        "agenda",
        "materias",
        "notas",
        "faltas",
        "historial",
        "comunidad",
        "foros",
        "opciones",
        "apariencia",
        "asistencia-qr",
      ];
      if (tab && validTabs.includes(tab)) return tab;
    }
    return "inicio";
  });

  const [initialParam, setInitialParam] = useState<string | null>(null);
  const [logoutModalOpen, setLogoutModalOpen] = useState(false);

  // Sincronizar URL search params
  const handleNavigate = (section: NavigationSection, param?: string) => {
    if (section === "logout") {
      setLogoutModalOpen(true);
      return;
    }
    setCurrentSection(section);
    if (param) setInitialParam(param);

    if (typeof window !== "undefined") {
      const url = new URL(window.location.href);
      url.searchParams.set("tab", section);
      if (param) url.searchParams.set("id", param);
      window.history.pushState({}, "", url.toString());
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  // Queries TanStack Query v5
  const alumnoQuery = useQuery({ queryKey: ["alumno"], queryFn: StudentApi.getAlumno });
  const materiasQuery = useQuery({ queryKey: ["materias"], queryFn: StudentApi.getMaterias });
  const evaluacionesQuery = useQuery({ queryKey: ["evaluaciones"], queryFn: StudentApi.getEvaluaciones });
  const asistenciasQuery = useQuery({ queryKey: ["asistencias"], queryFn: StudentApi.getAsistencias });
  const agendaQuery = useQuery({ queryKey: ["agenda"], queryFn: StudentApi.getAgenda });
  const avisosQuery = useQuery({ queryKey: ["avisos"], queryFn: StudentApi.getAvisos });
  const forosQuery = useQuery({ queryKey: ["foros"], queryFn: StudentApi.getForos });
  const historialQuery = useQuery({ queryKey: ["historial"], queryFn: StudentApi.getHistorial });
  const notificacionesQuery = useQuery({ queryKey: ["notificaciones"], queryFn: StudentApi.getNotificaciones });
  const solicitudesCorreccionQuery = useQuery({
    queryKey: ["solicitudesCorreccion"],
    queryFn: StudentApi.getSolicitudesCorreccion,
  });

  const isLoading =
    alumnoQuery.isLoading ||
    materiasQuery.isLoading ||
    evaluacionesQuery.isLoading ||
    asistenciasQuery.isLoading ||
    agendaQuery.isLoading ||
    avisosQuery.isLoading;

  const isError =
    alumnoQuery.isError ||
    materiasQuery.isError ||
    evaluacionesQuery.isError ||
    asistenciasQuery.isError ||
    agendaQuery.isError ||
    avisosQuery.isError;

  const handleToggleReminder = async (eventoId: string) => {
    try {
      await StudentApi.toggleRecordatorioEvento(eventoId);
      await qc.invalidateQueries({ queryKey: ["agenda"] });
      await qc.invalidateQueries({ queryKey: ["notificaciones"] });
      toast.success("Recordatorio actualizado en la demo.");
    } catch (e: any) {
      toast.error("Error al modificar recordatorio.");
    }
  };

  const handleMarcarNotificacionLeida = async (id: string, refId?: string, tipo?: string) => {
    if (tipo === "aviso" && refId) {
      await StudentApi.toggleAvisoLeido(refId);
      await qc.invalidateQueries({ queryKey: ["avisos"] });
      await qc.invalidateQueries({ queryKey: ["notificaciones"] });
    }
  };

  const handleMarcarTodasNotificacionesLeidas = async () => {
    await StudentApi.marcarTodosAvisosLeidos();
    await qc.invalidateQueries({ queryKey: ["avisos"] });
    await qc.invalidateQueries({ queryKey: ["notificaciones"] });
    toast.success("Todas las notificaciones marcadas como leídas.");
  };

  const handleConfirmDemoLogout = () => {
    setLogoutModalOpen(false);
    setCurrentSection("inicio");
    setShowIntro(true);
    toast.info("Sesión reiniciada (Modo Demostración).");
  };

  const unreadAvisosCount = avisosQuery.data?.filter((a) => !a.leido).length ?? 0;

  // Si está activa la pantalla de introducción, se muestra antes de ingresar al panel
  if (showIntro) {
    return <IntroScreen onEnterPanel={() => setShowIntro(false)} />;
  }

  return (
    <Layout
      currentSection={currentSection}
      onNavigate={handleNavigate}
      onShowIntro={() => setShowIntro(true)}
      unreadAvisosCount={unreadAvisosCount}
      materias={materiasQuery.data ?? []}
      evaluaciones={evaluacionesQuery.data ?? []}
      agenda={agendaQuery.data ?? []}
      avisos={avisosQuery.data ?? []}
      foros={forosQuery.data ?? []}
      notificaciones={notificacionesQuery.data ?? []}
      onMarcarNotificacionLeida={handleMarcarNotificacionLeida}
      onMarcarTodasNotificacionesLeidas={handleMarcarTodasNotificacionesLeidas}
    >
      <Toaster
        position="top-right"
        toastOptions={{
          style: {
            background: "var(--surface-raised)",
            color: "var(--text)",
            border: "1px solid var(--border)",
            fontFamily: "var(--font-body)",
          },
        }}
      />

      {isLoading && (
        <div className="space-y-6">
          <CardSkeleton />
          <CardSkeleton />
          <CardSkeleton />
        </div>
      )}

      {isError && (
        <ErrorState
          onRetry={() => {
            alumnoQuery.refetch();
            materiasQuery.refetch();
            evaluacionesQuery.refetch();
            asistenciasQuery.refetch();
            agendaQuery.refetch();
            avisosQuery.refetch();
            notificacionesQuery.refetch();
          }}
        />
      )}

      {!isLoading && !isError && alumnoQuery.data && materiasQuery.data && (
        <>
          {currentSection === "inicio" && (
            <InicioView
              onNavigate={handleNavigate}
              materias={materiasQuery.data}
              evaluaciones={evaluacionesQuery.data ?? []}
              agenda={agendaQuery.data ?? []}
              avisos={avisosQuery.data ?? []}
              asistencias={asistenciasQuery.data ?? []}
            />
          )}

          {currentSection === "perfil" && (
            <PerfilView
              alumno={alumnoQuery.data}
              solicitudes={solicitudesCorreccionQuery.data ?? []}
              onSubmitSolicitud={async (data) => {
                await StudentApi.addSolicitudCorreccion(data);
                await qc.invalidateQueries({ queryKey: ["solicitudesCorreccion"] });
                toast.success("Solicitud enviada a Bedelía (Modo DEMO).");
              }}
            />
          )}

          {currentSection === "agenda" && (
            <AgendaView
              eventos={agendaQuery.data ?? []}
              onToggleReminder={handleToggleReminder}
            />
          )}

          {currentSection === "materias" && (
            <MateriasView
              materias={materiasQuery.data}
              evaluaciones={evaluacionesQuery.data ?? []}
              asistencias={asistenciasQuery.data ?? []}
              initialMateriaId={initialParam}
              onNavigate={handleNavigate}
            />
          )}

          {currentSection === "notas" && (
            <NotasView
              evaluaciones={evaluacionesQuery.data ?? []}
              materias={materiasQuery.data}
              initialEvalId={initialParam}
            />
          )}

          {currentSection === "faltas" && (
            <FaltasView
              asistencias={asistenciasQuery.data ?? []}
              materias={materiasQuery.data}
              onAsistenciaMutated={() => {
                qc.invalidateQueries({ queryKey: ["asistencias"] });
                qc.invalidateQueries({ queryKey: ["materias"] });
              }}
            />
          )}

          {currentSection === "historial" && (
            <HistorialView historial={historialQuery.data ?? []} />
          )}

          {currentSection === "comunidad" && (
            <ComunidadView
              avisos={avisosQuery.data ?? []}
              onAvisosMutated={() => {
                qc.invalidateQueries({ queryKey: ["avisos"] });
                qc.invalidateQueries({ queryKey: ["notificaciones"] });
              }}
            />
          )}

          {currentSection === "foros" && (
            <ForosView
              foros={forosQuery.data ?? []}
              onForosMutated={() => qc.invalidateQueries({ queryKey: ["foros"] })}
            />
          )}

          {currentSection === "opciones" && <OpcionesView />}

          {currentSection === "apariencia" && <AparienciaView />}

          {currentSection === "asistencia-qr" && (
            <AsistenciaQRView
              onSuccessRegistered={() => {
                qc.invalidateQueries({ queryKey: ["asistencias"] });
                qc.invalidateQueries({ queryKey: ["materias"] });
              }}
            />
          )}
        </>
      )}

      {/* Modal de logout con pantalla de confirmación honesta */}
      <LogoutDialog
        isOpen={logoutModalOpen}
        onClose={() => setLogoutModalOpen(false)}
        onConfirmDemoLogout={handleConfirmDemoLogout}
      />
    </Layout>
  );
}

export default function JulianApp() {
  return (
    <ThemeProvider>
      <QueryClientProvider client={queryClient}>
        <StudentPortalContent />
      </QueryClientProvider>
    </ThemeProvider>
  );
}
