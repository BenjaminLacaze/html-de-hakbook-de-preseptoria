import React, { useEffect, useState } from 'react';
import { Phone, Envelope, WarningCircle, PencilSimple, NotePencil } from '@phosphor-icons/react';
import { useAuxiliares } from '../context/AuxiliaresContext';
import { toast } from 'sonner';

/**
 * Perfil = /auth/me (nombre, email, rol) + /social/profiles/me (teléfono, presentación).
 * Legajo, sector habitual y contacto de emergencia no existen en el sistema: no se muestran.
 */
export const PerfilScreen: React.FC = () => {
  const { userProfile, saveProfile } = useAuxiliares();
  const [editing, setEditing] = useState(false);
  const [phone, setPhone] = useState(userProfile.phone ?? '');
  const [bio, setBio] = useState(userProfile.bio ?? '');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!editing) {
      setPhone(userProfile.phone ?? '');
      setBio(userProfile.bio ?? '');
    }
  }, [userProfile.phone, userProfile.bio, editing]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    const ok = await saveProfile({ phone, bio });
    setSaving(false);
    if (!ok) return;
    toast.success('Datos de contacto actualizados');
    setEditing(false);
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6 pb-20 lg:pb-10">
      {/* Header */}
      <div>
        <span className="text-xs font-bold text-[#89743A] uppercase tracking-wider block">
          Datos de la cuenta
        </span>
        <h1 className="text-2xl sm:text-3xl font-heading font-extrabold text-slate-900 dark:text-slate-100">
          Mi Perfil de <span className="text-[#89743A]">Auxiliar</span>
        </h1>
        <div className="w-12 h-0.5 bg-[#89743A] mt-1" />
      </div>

      {/* Main Profile Card */}
      <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-6 shadow-xs">
        <div className="flex flex-col sm:flex-row items-center sm:items-start gap-4 sm:gap-6 text-center sm:text-left">
          <div className="w-20 h-20 rounded-full bg-[#14214F] text-[#AF9B63] flex items-center justify-center font-heading font-extrabold text-2xl border-4 border-[#AF9B63]/30 shrink-0 shadow-md">
            {userProfile.initials}
          </div>

          <div className="space-y-1 min-w-0 flex-1">
            <h2 className="text-xl sm:text-2xl font-heading font-extrabold text-slate-900 dark:text-slate-100 break-words">
              {userProfile.name}
            </h2>
            <p className="text-sm font-semibold text-[#89743A] dark:text-[#E5C365]">
              {userProfile.roleLabel}
            </p>
            <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2 pt-1 text-xs text-slate-500">
              <span>Sede Central ISFDyT 26</span>
            </div>
          </div>
        </div>
      </div>

      {/* Contact details */}
      <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-6 shadow-xs space-y-4">
        <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-700 pb-2">
          <h3 className="font-heading font-bold text-base text-slate-900 dark:text-slate-100">
            Datos de contacto
          </h3>
          {!editing && (
            <button
              type="button"
              onClick={() => setEditing(true)}
              className="touch-target text-xs font-bold text-[#3F78B6] hover:underline flex items-center gap-1"
            >
              <PencilSimple size={14} />
              Editar
            </button>
          )}
        </div>

        {editing ? (
          <form onSubmit={handleSave} className="space-y-3 text-xs">
            <label className="block font-bold text-slate-500 uppercase">
              Teléfono
              <input
                type="tel"
                maxLength={40}
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="Ej: 2245 40-0000"
                className="mt-1 w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-sm font-mono normal-case"
              />
            </label>
            <label className="block font-bold text-slate-500 uppercase">
              Presentación (visible para el equipo)
              <textarea
                rows={3}
                maxLength={2000}
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                className="mt-1 w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-sm normal-case"
              />
            </label>
            <div className="flex gap-2 pt-1">
              <button
                type="button"
                onClick={() => setEditing(false)}
                className="touch-target flex-1 py-2.5 rounded-lg border border-slate-300 dark:border-slate-700 text-xs font-bold"
              >
                Cancelar
              </button>
              <button
                type="submit"
                disabled={saving}
                className="touch-target flex-1 py-2.5 rounded-lg bg-[#89743A] text-white text-xs font-bold shadow-xs hover:brightness-110 disabled:opacity-60"
              >
                {saving ? 'Guardando…' : 'Guardar'}
              </button>
            </div>
          </form>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div className="p-3 rounded-lg bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-700 space-y-1">
              <span className="font-bold text-slate-400 uppercase tracking-wider block flex items-center gap-1">
                <Phone size={14} className="text-[#AF9B63]" />
                Teléfono
              </span>
              <p className="font-mono font-semibold text-sm text-slate-800 dark:text-slate-200">
                {userProfile.phone || 'Sin cargar'}
              </p>
            </div>

            <div className="p-3 rounded-lg bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-700 space-y-1">
              <span className="font-bold text-slate-400 uppercase tracking-wider block flex items-center gap-1">
                <Envelope size={14} className="text-[#3F78B6]" />
                Correo institucional
              </span>
              <p className="font-mono text-sm text-slate-800 dark:text-slate-200 break-all">
                {userProfile.email}
              </p>
            </div>

            {userProfile.bio && (
              <div className="p-3 rounded-lg bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-700 space-y-1 sm:col-span-2">
                <span className="font-bold text-slate-400 uppercase tracking-wider block flex items-center gap-1">
                  <NotePencil size={14} className="text-[#3F78B6]" />
                  Presentación
                </span>
                <p className="text-sm text-slate-800 dark:text-slate-200 whitespace-pre-line">
                  {userProfile.bio}
                </p>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Institutional correction note */}
      <div className="p-4 rounded-xl bg-sky-50 dark:bg-sky-950/30 border border-sky-200 dark:border-sky-800 flex items-start gap-3 text-xs text-sky-950 dark:text-sky-200">
        <WarningCircle size={20} className="text-[#3F78B6] shrink-0 mt-0.5" weight="fill" />
        <div className="space-y-1">
          <p className="font-bold">¿Necesitás modificar tu nombre, email o turnos?</p>
          <p className="text-slate-600 dark:text-slate-300">
            Esos datos los administra Dirección del ISFDyT N° 26. Legajo, sector habitual y
            contacto de emergencia todavía no están disponibles en el sistema.
          </p>
        </div>
      </div>
    </div>
  );
};
