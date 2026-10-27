// Herramientas comunes de las capas traductoras (pantallas rescatadas ↔ API).
import { useCallback, useRef, useState } from 'react';
import { ApiRequestError } from '@shared/api';
import type { DirectoryEntry, Role as ApiRole } from '@shared/types';
import { Role, type User } from '../legacy/types';

/**
 * Las pantallas rescatadas usan ids numéricos de usuario; la API, UUIDs.
 * Este registro asigna un número estable a cada UUID mientras dura la sesión.
 */
const toNum = new Map<string, number>();
const toUuid = new Map<number, string>();
let next = 500000;
export function userNum(uuid: string): number {
  if (!toNum.has(uuid)) {
    toNum.set(uuid, next);
    toUuid.set(next, uuid);
    next++;
  }
  return toNum.get(uuid)!;
}
export const userUuid = (n: number) => toUuid.get(n);

/** Rol de la API → rol de las pantallas rescatadas (los de gestión se muestran como personal). */
export function legacyRole(roles: ApiRole[]): Role {
  if (roles.includes('STUDENT_REP')) return Role.STUDENT_REP;
  if (roles.includes('STUDENT')) return Role.STUDENT;
  if (roles.includes('STAFF')) return Role.STAFF;
  if (roles.includes('TEACHER')) return Role.TEACHER;
  return Role.PRECEPTOR;
}

export const legacyUser = (d: Pick<DirectoryEntry, 'id' | 'firstName' | 'lastName' | 'roles'>, email = ''): User => ({
  id: userNum(d.id),
  name: `${d.firstName} ${d.lastName}`,
  email,
  password: '',
  role: legacyRole(d.roles),
});

export type Updater<T> = T[] | ((prev: T[]) => T[]);

/**
 * Lista "sincronizada": la pantalla la modifica como siempre (con un array o una función);
 * se aplica al instante en pantalla y después se manda la diferencia a la API.
 */
export function useSyncedList<T extends { id: string }>(
  sync: (before: T[], after: T[]) => Promise<void>,
  onDone: () => Promise<void>,
) {
  const [list, setListState] = useState<T[]>([]);
  const ref = useRef<T[]>([]);
  const replace = useCallback((items: T[]) => {
    ref.current = items;
    setListState(items);
  }, []);
  const update = useCallback(
    (arg: Updater<T>) => {
      const before = ref.current;
      const after = typeof arg === 'function' ? arg(before) : arg;
      replace(after);
      void sync(before, after)
        .catch((e) => window.alert(e instanceof ApiRequestError ? e.message : 'No se pudo guardar. Probá de nuevo.'))
        .finally(() => void onDone());
    },
    [sync, onDone, replace],
  );
  return { list, replace, update };
}

/** Diferencias entre dos listas por id. */
export function diff<T extends { id: string }>(before: T[], after: T[]) {
  const b = new Map(before.map((x) => [x.id, x]));
  const a = new Map(after.map((x) => [x.id, x]));
  return {
    added: after.filter((x) => !b.has(x.id)),
    removed: before.filter((x) => !a.has(x.id)),
    changed: after.filter((x) => b.has(x.id) && JSON.stringify(b.get(x.id)) !== JSON.stringify(x)).map((x) => ({ before: b.get(x.id)!, after: x })),
  };
}

/** Busca la clave (es) de un valor (en) en una tabla de equivalencias, y al revés. */
export const invert = <K extends string, V extends string>(m: Record<K, V>) =>
  Object.fromEntries(Object.entries(m).map(([k, v]) => [v, k])) as Record<V, K>;

export const today = () => new Date().toISOString().slice(0, 10);
