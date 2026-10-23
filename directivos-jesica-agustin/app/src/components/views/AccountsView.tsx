// Cuentas de acceso al sistema (API real).
//
// Desde acá Directivos crea las cuentas con las que entran TODAS las apps
// (profesores, alumnos, preceptoría y directivos). Al crear o blanquear una cuenta
// se muestra una contraseña temporal UNA sola vez; la persona la cambia al entrar.
//
// Se usa cuando la app corre contra la API (VITE_USE_MOCK=false). En modo demo
// se sigue mostrando UsersView con los datos de ejemplo.
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  CheckCircle,
  Copy,
  Edit2,
  Filter,
  KeyRound,
  Loader2,
  Mail,
  Power,
  Search,
  ShieldAlert,
  UserPlus,
  X,
  XCircle,
} from 'lucide-react';
import {
  ApiRequestError,
  createUser,
  getMe,
  listUsers,
  resetUserPassword,
  updateUser,
} from '@shared/api';
import {
  ASSIGNABLE_ROLES,
  ROLES,
  ROLE_LABELS,
  type AuthMe,
  type Role,
  type UserDTO,
  type UserStatus,
} from '@shared/types';

type FormState = { email: string; firstName: string; lastName: string; roles: Role[] };
const EMPTY_FORM: FormState = { email: '', firstName: '', lastName: '', roles: [] };

const formatDate = (iso?: string) =>
  iso
    ? new Date(iso).toLocaleString('es-AR', { dateStyle: 'short', timeStyle: 'short' })
    : 'Nunca ingresó';

export const AccountsView: React.FC = () => {
  const [me, setMe] = useState<AuthMe | null>(null);
  const [users, setUsers] = useState<UserDTO[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<ApiRequestError | null>(null);

  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState<Role | ''>('');
  const [statusFilter, setStatusFilter] = useState<UserStatus | ''>('');

  const [modal, setModal] = useState<{ mode: 'create' } | { mode: 'edit'; user: UserDTO } | null>(null);
  const [form, setForm] = useState<FormState>(EMPTY_FORM);
  const [formError, setFormError] = useState<ApiRequestError | null>(null);
  const [saving, setSaving] = useState(false);

  /** Contraseña temporal recién generada: se muestra una sola vez. */
  const [credential, setCredential] = useState<{ email: string; password: string; isNew: boolean } | null>(null);
  const [copied, setCopied] = useState(false);
  const [rowBusy, setRowBusy] = useState<string | null>(null);
  const [rowError, setRowError] = useState<string | null>(null);

  const assignable = useMemo<Role[]>(() => {
    if (!me) return [];
    const set = new Set(me.user.roles.flatMap((r) => ASSIGNABLE_ROLES[r] ?? []));
    return ROLES.filter((r) => set.has(r));
  }, [me]);

  const canManage = (u: UserDTO) => u.roles.every((r) => assignable.includes(r));

  const load = useCallback(async () => {
    setLoading(true);
    setLoadError(null);
    try {
      const [meRes, list] = await Promise.all([
        getMe(),
        listUsers({ role: roleFilter || undefined, status: statusFilter || undefined, search: search.trim() || undefined }),
      ]);
      setMe(meRes);
      setUsers(list);
    } catch (e) {
      setLoadError(e instanceof ApiRequestError ? e : new ApiRequestError(0, 'INTERNAL_ERROR', 'Error inesperado.'));
    } finally {
      setLoading(false);
    }
  }, [roleFilter, statusFilter, search]);

  // Búsqueda con una pequeña espera para no pedir en cada tecla.
  useEffect(() => {
    const t = setTimeout(load, 250);
    return () => clearTimeout(t);
  }, [load]);

  const openCreate = () => {
    setForm(EMPTY_FORM);
    setFormError(null);
    setModal({ mode: 'create' });
  };

  const openEdit = (user: UserDTO) => {
    setForm({ email: user.email, firstName: user.firstName, lastName: user.lastName, roles: user.roles });
    setFormError(null);
    setModal({ mode: 'edit', user });
  };

  const toggleRole = (role: Role) =>
    setForm((f) => ({ ...f, roles: f.roles.includes(role) ? f.roles.filter((r) => r !== role) : [...f.roles, role] }));

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!modal) return;
    setSaving(true);
    setFormError(null);
    try {
      if (modal.mode === 'create') {
        const res = await createUser(form);
        setCredential({ email: res.user.email, password: res.temporaryPassword, isNew: true });
      } else {
        await updateUser(modal.user.id, { firstName: form.firstName, lastName: form.lastName, roles: form.roles });
      }
      setModal(null);
      await load();
    } catch (err) {
      setFormError(err instanceof ApiRequestError ? err : new ApiRequestError(0, 'INTERNAL_ERROR', 'Error inesperado.'));
    } finally {
      setSaving(false);
    }
  };

  const runRowAction = async (user: UserDTO, action: () => Promise<void>) => {
    setRowBusy(user.id);
    setRowError(null);
    try {
      await action();
      await load();
    } catch (err) {
      setRowError(err instanceof ApiRequestError ? err.message : 'Error inesperado.');
    } finally {
      setRowBusy(null);
    }
  };

  const toggleStatus = (user: UserDTO) =>
    runRowAction(user, async () => {
      await updateUser(user.id, { status: user.status === 'ACTIVE' ? 'INACTIVE' : 'ACTIVE' });
    });

  const resetPassword = (user: UserDTO) => {
    if (!window.confirm(`¿Generar una contraseña temporal nueva para ${user.email}? Se cerrarán sus sesiones abiertas.`)) return;
    runRowAction(user, async () => {
      const res = await resetUserPassword(user.id);
      setCredential({ email: res.user.email, password: res.temporaryPassword, isNew: false });
    });
  };

  const copyCredential = async () => {
    if (!credential) return;
    await navigator.clipboard.writeText(`Usuario: ${credential.email}\nContraseña temporal: ${credential.password}`);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // --- Sin sesión o sin permiso ---
  if (loadError && (loadError.status === 401 || loadError.status === 403)) {
    return (
      <div className="bg-white p-8 rounded-lg border border-slate-200 shadow-xs text-center space-y-2">
        <ShieldAlert className="w-8 h-8 text-[#89743A] mx-auto" />
        <h1 className="text-lg font-bold text-[#14214F]">
          {loadError.status === 401 ? 'Tenés que iniciar sesión' : 'Sin acceso a cuentas de usuario'}
        </h1>
        <p className="text-xs text-slate-500">{loadError.message}</p>
      </div>
    );
  }

  const inputCls =
    'w-full px-3 py-1.5 text-xs rounded border border-slate-300 focus:outline-none focus:border-[#14214F] focus:ring-1 focus:ring-[#14214F]';

  return (
    <div className="space-y-6">
      {/* Encabezado */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-lg border border-slate-200 shadow-xs">
        <div>
          <div className="text-xs font-semibold uppercase tracking-wider text-[#89743A]">Acceso al sistema</div>
          <h1 className="text-xl font-bold text-[#14214F] mt-0.5">Cuentas de acceso</h1>
          <p className="text-xs text-slate-500 mt-1">
            Cuentas con las que ingresan directivos, preceptores, profesores y alumnos a todas las apps del ISFDyT N.° 26.
          </p>
        </div>
        <button
          onClick={openCreate}
          disabled={!assignable.length}
          className="px-4 py-2 bg-[#14214F] hover:bg-[#0A1128] disabled:opacity-50 text-white text-xs font-medium rounded transition-colors flex items-center gap-1.5 shadow-xs shrink-0 self-start sm:self-auto"
        >
          <UserPlus className="w-4 h-4 text-[#D4C08A]" />
          <span>Crear cuenta</span>
        </button>
      </div>

      {/* Filtros */}
      <div className="bg-white p-4 rounded-lg border border-slate-200 shadow-xs flex flex-col md:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            placeholder="Buscar por apellido, nombre o email..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 text-xs rounded border border-slate-300 focus:outline-none focus:border-[#14214F] focus:ring-1 focus:ring-[#14214F]"
          />
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <div className="flex items-center gap-1 text-xs text-slate-500">
            <Filter className="w-3.5 h-3.5" />
            <span>Rol:</span>
          </div>
          <select
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value as Role | '')}
            className="text-xs py-1.5 px-2.5 rounded border border-slate-300 focus:outline-none focus:border-[#14214F]"
          >
            <option value="">Todos los roles</option>
            {ROLES.map((r) => (
              <option key={r} value={r}>
                {ROLE_LABELS[r]}
              </option>
            ))}
          </select>
          <span className="text-xs text-slate-500 ml-2">Estado:</span>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as UserStatus | '')}
            className="text-xs py-1.5 px-2.5 rounded border border-slate-300 focus:outline-none focus:border-[#14214F]"
          >
            <option value="">Todos</option>
            <option value="ACTIVE">Activas</option>
            <option value="INACTIVE">Inactivas</option>
          </select>
        </div>
      </div>

      {rowError && (
        <div className="bg-red-50 border border-red-200 text-red-800 text-xs rounded p-3 flex justify-between">
          <span>{rowError}</span>
          <button onClick={() => setRowError(null)} aria-label="Cerrar">
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* Tabla */}
      <div className="bg-white rounded-lg border border-slate-200 shadow-xs overflow-hidden">
        <div className="px-5 py-3 border-b border-slate-100 flex items-center justify-between text-xs text-slate-500">
          <span>{loading ? 'Cargando…' : `${users.length} cuenta(s)`}</span>
          {loading && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
        </div>
        {loadError ? (
          <div className="p-6 text-center text-xs text-red-700">
            {loadError.message}{' '}
            <button onClick={load} className="underline font-semibold">
              Reintentar
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50/70 text-slate-500 uppercase tracking-wider text-[11px]">
                  <th className="py-2.5 px-4 font-semibold">Persona</th>
                  <th className="py-2.5 px-4 font-semibold">Roles</th>
                  <th className="py-2.5 px-4 font-semibold">Estado</th>
                  <th className="py-2.5 px-4 font-semibold">Último ingreso</th>
                  <th className="py-2.5 px-4 font-semibold text-right">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700">
                {!loading && users.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="py-8 text-center text-slate-400">
                      No hay cuentas que coincidan con la búsqueda.
                    </td>
                  </tr>
                ) : (
                  users.map((u) => {
                    const manageable = canManage(u) && u.id !== me?.user.id;
                    return (
                      <tr key={u.id} className="hover:bg-slate-50/80 transition-colors">
                        <td className="py-3 px-4">
                          <div className="font-bold text-slate-900">
                            {u.lastName}, {u.firstName}
                          </div>
                          <div className="text-[11px] text-slate-500 font-mono flex items-center gap-1 mt-0.5">
                            <Mail className="w-3 h-3 text-slate-400" />
                            {u.email}
                          </div>
                        </td>
                        <td className="py-3 px-4">
                          <div className="flex flex-wrap gap-1">
                            {u.roles.map((r) => (
                              <span key={r} className="px-1.5 py-0.5 rounded bg-slate-100 text-[#14214F] text-[10px] font-semibold">
                                {ROLE_LABELS[r]}
                              </span>
                            ))}
                          </div>
                        </td>
                        <td className="py-3 px-4">
                          {u.status === 'ACTIVE' ? (
                            <span className="inline-flex items-center gap-1 text-[11px] text-emerald-800 font-medium">
                              <CheckCircle className="w-3.5 h-3.5 text-emerald-600" /> Activa
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 text-[11px] text-slate-500 font-medium">
                              <XCircle className="w-3.5 h-3.5 text-slate-400" /> Inactiva
                            </span>
                          )}
                          {u.mustChangePassword && (
                            <div className="text-[10px] text-amber-700 mt-0.5">Contraseña temporal pendiente</div>
                          )}
                        </td>
                        <td className="py-3 px-4 text-slate-500 font-mono text-[11px] tabular-nums">
                          {formatDate(u.lastLoginAt)}
                        </td>
                        <td className="py-3 px-4 text-right">
                          {manageable ? (
                            <div className="inline-flex items-center gap-1.5">
                              {rowBusy === u.id && <Loader2 className="w-3.5 h-3.5 animate-spin text-slate-400" />}
                              <button
                                onClick={() => openEdit(u)}
                                className="p-1.5 text-slate-600 hover:text-[#14214F] hover:bg-slate-100 rounded transition-colors"
                                title="Editar nombre y roles"
                              >
                                <Edit2 className="w-3.5 h-3.5" />
                              </button>
                              <button
                                onClick={() => resetPassword(u)}
                                disabled={rowBusy === u.id}
                                className="p-1.5 text-slate-600 hover:text-[#14214F] hover:bg-slate-100 rounded transition-colors"
                                title="Blanquear contraseña"
                              >
                                <KeyRound className="w-3.5 h-3.5" />
                              </button>
                              <button
                                onClick={() => toggleStatus(u)}
                                disabled={rowBusy === u.id}
                                className={`p-1.5 rounded transition-colors ${
                                  u.status === 'ACTIVE' ? 'text-amber-700 hover:bg-amber-50' : 'text-emerald-700 hover:bg-emerald-50'
                                }`}
                                title={u.status === 'ACTIVE' ? 'Desactivar cuenta' : 'Activar cuenta'}
                              >
                                <Power className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          ) : (
                            <span className="text-[10px] text-slate-400">{u.id === me?.user.id ? 'Tu cuenta' : 'Sin permiso'}</span>
                          )}
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Alta / edición */}
      {modal && (
        <div className="fixed inset-0 bg-slate-900/60 z-50 flex items-center justify-center p-4 backdrop-blur-xs">
          <div className="bg-white rounded-lg border border-slate-200 shadow-xl max-w-lg w-full overflow-hidden">
            <div className="px-5 py-3 border-b border-slate-100 flex items-center justify-between">
              <h2 className="text-sm font-bold text-[#14214F]">
                {modal.mode === 'create' ? 'Crear cuenta de acceso' : 'Editar cuenta'}
              </h2>
              <button onClick={() => setModal(null)} className="text-slate-400 hover:text-slate-700" aria-label="Cerrar">
                <X className="w-4 h-4" />
              </button>
            </div>
            <form onSubmit={handleSave} className="p-5 space-y-4 text-xs">
              <label className="block space-y-1">
                <span className="font-semibold text-slate-700">Email institucional (usuario de ingreso)</span>
                <input
                  type="email"
                  required
                  disabled={modal.mode === 'edit'}
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  className={inputCls + ' disabled:bg-slate-100'}
                />
                {formError?.fieldError('email') && <span className="text-red-700">{formError.fieldError('email')}</span>}
              </label>
              <div className="grid grid-cols-2 gap-3">
                <label className="block space-y-1">
                  <span className="font-semibold text-slate-700">Nombre/s</span>
                  <input required value={form.firstName} onChange={(e) => setForm({ ...form, firstName: e.target.value })} className={inputCls} />
                  {formError?.fieldError('firstName') && <span className="text-red-700">{formError.fieldError('firstName')}</span>}
                </label>
                <label className="block space-y-1">
                  <span className="font-semibold text-slate-700">Apellido/s</span>
                  <input required value={form.lastName} onChange={(e) => setForm({ ...form, lastName: e.target.value })} className={inputCls} />
                  {formError?.fieldError('lastName') && <span className="text-red-700">{formError.fieldError('lastName')}</span>}
                </label>
              </div>
              <fieldset className="space-y-1.5">
                <legend className="font-semibold text-slate-700">Roles (define a qué apps puede entrar)</legend>
                <div className="grid grid-cols-2 gap-1.5">
                  {assignable.map((r) => (
                    <label key={r} className="flex items-center gap-2 p-2 rounded border border-slate-200 hover:bg-slate-50 cursor-pointer">
                      <input type="checkbox" checked={form.roles.includes(r)} onChange={() => toggleRole(r)} />
                      <span>{ROLE_LABELS[r]}</span>
                    </label>
                  ))}
                </div>
                {formError?.fieldError('roles') && <span className="text-red-700">{formError.fieldError('roles')}</span>}
              </fieldset>

              {formError && !formError.details.length && (
                <div className="bg-red-50 border border-red-200 text-red-800 rounded p-2">{formError.message}</div>
              )}

              <div className="flex justify-end gap-2 pt-2">
                <button type="button" onClick={() => setModal(null)} className="px-3 py-1.5 rounded border border-slate-300 hover:bg-slate-50">
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={saving || form.roles.length === 0}
                  className="px-4 py-1.5 bg-[#14214F] hover:bg-[#0A1128] disabled:opacity-50 text-white rounded font-medium flex items-center gap-1.5"
                >
                  {saving && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                  {modal.mode === 'create' ? 'Crear cuenta' : 'Guardar cambios'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Contraseña temporal (se muestra una sola vez) */}
      {credential && (
        <div className="fixed inset-0 bg-slate-900/60 z-50 flex items-center justify-center p-4 backdrop-blur-xs">
          <div className="bg-white rounded-lg border border-slate-200 shadow-xl max-w-md w-full p-5 space-y-4 text-xs">
            <div className="flex items-center gap-2">
              <KeyRound className="w-5 h-5 text-[#89743A]" />
              <h2 className="text-sm font-bold text-[#14214F]">
                {credential.isNew ? 'Cuenta creada' : 'Contraseña blanqueada'}
              </h2>
            </div>
            <p className="text-slate-600">
              Pasale estos datos a la persona. <strong>La contraseña no se vuelve a mostrar</strong>: si se pierde, hay que
              blanquearla de nuevo. Al entrar, el sistema le va a pedir que la cambie.
            </p>
            <div className="bg-slate-50 border border-slate-200 rounded p-3 font-mono space-y-1">
              <div>Usuario: {credential.email}</div>
              <div>
                Contraseña temporal: <strong className="text-[#14214F] text-sm">{credential.password}</strong>
              </div>
            </div>
            <div className="flex justify-end gap-2">
              <button onClick={copyCredential} className="px-3 py-1.5 rounded border border-slate-300 hover:bg-slate-50 flex items-center gap-1.5">
                <Copy className="w-3.5 h-3.5" /> {copied ? 'Copiado' : 'Copiar'}
              </button>
              <button
                onClick={() => setCredential(null)}
                className="px-4 py-1.5 bg-[#14214F] hover:bg-[#0A1128] text-white rounded font-medium"
              >
                Listo, ya la anoté
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
