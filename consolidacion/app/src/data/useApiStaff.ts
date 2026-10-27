// Capa traductora: pantalla de Auxiliares (rescatada) ↔ API /staff/*.
import { useCallback, useEffect, useState } from 'react';
import { apiFetch, ApiRequestError } from '@shared/api';
import type {
  AuthMe,
  Incident as ApiIncident,
  Installation as ApiInstallation,
  MaintenanceLog,
  StaffTask,
} from '@shared/types';
import { Role, type DailyTask, type Incident, type Installation, type MaintenanceHistoryItem, type User } from '../legacy/types';
import { diff, invert, today, useSyncedList, userNum } from './sync';

const TASK_TYPE = { CLEANING: 'limpieza', MAINTENANCE: 'mantenimiento', ROUTINE: 'rutina' } as const;
const INST_STATUS = { OK: 'ok', MAINTENANCE: 'maintenance', OUT_OF_SERVICE: 'out_of_service' } as const;
const PRIORITY = { LOW: 'Baja', MEDIUM: 'Media', HIGH: 'Alta' } as const;
const INC_STATUS = { OPEN: 'abierta', IN_PROGRESS: 'en_progreso', RESOLVED: 'resuelta' } as const;

const fmtDateTime = (iso?: string) =>
  iso ? new Date(iso).toLocaleString('es-AR', { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' }) : 'Sin registro';
const ddmmyyyy = (iso: string) => iso.split('-').reverse().join('/');
const isoFromDdmmyyyy = (s: string) => {
  const [d, m, y] = s.split('/');
  return y && m && d ? `${y}-${m.padStart(2, '0')}-${d.padStart(2, '0')}` : today();
};

export interface ApiStaffState {
  state: 'idle' | 'loading' | 'ready' | 'error';
  error?: string;
  user?: User;
  tasks?: ReturnType<typeof useSyncedList<DailyTask>>;
  installations?: ReturnType<typeof useSyncedList<Installation>>;
  incidents?: ReturnType<typeof useSyncedList<Incident>>;
  maintenance?: ReturnType<typeof useSyncedList<MaintenanceHistoryItem>>;
}

export function useApiStaff(me: AuthMe | null): ApiStaffState {
  const [state, setState] = useState<ApiStaffState['state']>(me ? 'loading' : 'idle');
  const [error, setError] = useState<string>();
  const [instByName, setInstByName] = useState<Map<string, string>>(new Map());

  // eslint-disable-next-line prefer-const
  let reload: () => Promise<void>;

  const tasks = useSyncedList<DailyTask>(
    useCallback(async (before, after) => {
      const d = diff(before, after);
      for (const t of d.added)
        await apiFetch('/staff/tasks', {
          method: 'POST',
          body: { date: today(), startTime: t.startTime, title: t.title, type: invert(TASK_TYPE)[t.type], location: t.location, details: t.details },
        });
      for (const { before: b, after: a } of d.changed)
        if (b.status !== a.status) await apiFetch(`/staff/tasks/${a.id}`, { method: 'PATCH', body: { status: a.status === 'completada' ? 'DONE' : 'PENDING' } });
      for (const t of d.removed) await apiFetch(`/staff/tasks/${t.id}`, { method: 'DELETE' });
    }, []),
    () => reload(),
  );

  const installations = useSyncedList<Installation>(
    useCallback(async (before, after) => {
      const d = diff(before, after);
      for (const i of d.added)
        await apiFetch('/staff/installations', {
          method: 'POST',
          body: { name: i.name, status: invert(INST_STATUS)[i.status], layout: i.layout, nextTask: i.details?.nextTask },
        });
      for (const { before: b, after: a } of d.changed)
        await apiFetch(`/staff/installations/${a.id}`, {
          method: 'PATCH',
          body: {
            ...(a.name !== b.name ? { name: a.name } : {}),
            ...(a.status !== b.status ? { status: invert(INST_STATUS)[a.status] } : {}),
            ...(JSON.stringify(a.layout) !== JSON.stringify(b.layout) ? { layout: a.layout } : {}),
            ...(a.details?.nextTask !== b.details?.nextTask ? { nextTask: a.details?.nextTask ?? null } : {}),
            ...(a.details?.lastCleaned !== b.details?.lastCleaned ? { cleanedNow: true } : {}),
          },
        });
      for (const i of d.removed) await apiFetch(`/staff/installations/${i.id}`, { method: 'DELETE' });
    }, []),
    () => reload(),
  );

  const incidents = useSyncedList<Incident>(
    useCallback(
      async (before, after) => {
        const d = diff(before, after);
        for (const i of d.added)
          await apiFetch('/staff/incidents', {
            method: 'POST',
            body: { description: i.description, priority: invert(PRIORITY)[i.priority], sector: i.sector, installationId: instByName.get(i.sector) },
          });
        for (const { before: b, after: a } of d.changed)
          if (b.status !== a.status) await apiFetch(`/staff/incidents/${a.id}`, { method: 'PATCH', body: { status: invert(INC_STATUS)[a.status] } });
      },
      [instByName],
    ),
    () => reload(),
  );

  const maintenance = useSyncedList<MaintenanceHistoryItem>(
    useCallback(async (before, after) => {
      for (const m of diff(before, after).added)
        await apiFetch('/staff/maintenance', { method: 'POST', body: { date: isoFromDdmmyyyy(m.date), task: m.task, responsible: m.responsible } });
    }, []),
    () => reload(),
  );

  reload = useCallback(async () => {
    if (!me) return;
    try {
      const [t, i, inc, m] = await Promise.all([
        apiFetch<StaffTask[]>('/staff/tasks', { query: { date: today() } }),
        apiFetch<ApiInstallation[]>('/staff/installations'),
        apiFetch<ApiIncident[]>('/staff/incidents'),
        apiFetch<MaintenanceLog[]>('/staff/maintenance'),
      ]);
      tasks.replace(
        t.map((x) => ({ id: x.id, title: x.title, startTime: x.startTime, type: TASK_TYPE[x.type], status: x.status === 'DONE' ? 'completada' : 'pendiente', location: x.location, details: x.details })),
      );
      installations.replace(
        i.map((x) => ({
          id: x.id,
          name: x.name,
          status: INST_STATUS[x.status],
          layout: x.layout,
          details: { lastCleaned: x.lastCleanedAt ? fmtDateTime(x.lastCleanedAt) : 'Sin registro', nextTask: x.nextTask, incident: x.notes },
        })),
      );
      setInstByName(new Map(i.map((x) => [x.name, x.id])));
      incidents.replace(
        inc.map((x) => ({ id: x.id, description: x.description, priority: PRIORITY[x.priority], sector: x.sector, image: x.imageUrl, status: INC_STATUS[x.status], timestamp: x.createdAt })),
      );
      maintenance.replace(m.map((x) => ({ id: x.id, date: ddmmyyyy(x.date), task: x.task, responsible: x.responsible })));
      setState('ready');
    } catch (e) {
      setError(e instanceof ApiRequestError ? e.message : 'Error inesperado.');
      setState('error');
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [me]);

  useEffect(() => {
    void reload();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [me]);

  if (!me) return { state: 'idle' };
  if (state !== 'ready') return { state, error };
  return {
    state,
    user: { id: userNum(me.user.id), name: `${me.user.firstName} ${me.user.lastName}`, email: me.user.email, password: '', role: Role.STAFF },
    tasks,
    installations,
    incidents,
    maintenance,
  };
}
