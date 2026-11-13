import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../context/AuthContext';
import { SectionHeader } from '../components/SectionHeader';
import { LoadingState, EmptyState, ErrorState } from '../components/States';
import * as profileApi from '../api/profile';
import { GuardianProfile } from '../types/api';
import { toast } from 'sonner';
import { 
  User, 
  Student, 
  PencilSimpleLine, 
  CheckCircle, 
  IdentificationCard, 
  Phone, 
  Envelope, 
  MapPin, 
  Briefcase,
  ShieldCheck
} from '@phosphor-icons/react';

export const ProfileScreen: React.FC = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [profile, setProfile] = useState<GuardianProfile | null>(null);

  // Formulario de rectificación de datos
  const [isEditing, setIsEditing] = useState(false);
  const [newPhone, setNewPhone] = useState('');
  const [newEmail, setNewEmail] = useState('');
  const [newAddress, setNewAddress] = useState('');
  const [correctionNotes, setCorrectionNotes] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const loadProfile = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await profileApi.getGuardianProfile();
      setProfile(data);
      setNewPhone(data.phone || '');
      setNewEmail(data.email || '');
      setNewAddress(data.address || '');
    } catch (err: any) {
      setError(err.message || 'Error al obtener el legajo de datos familiares.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadProfile();
  }, [loadProfile]);

  const handleSubmitCorrection = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await profileApi.submitCorrection({
        phone: newPhone !== profile?.phone ? newPhone : undefined,
        email: newEmail !== profile?.email ? newEmail : undefined,
        address: newAddress !== profile?.address ? newAddress : undefined,
        notes: correctionNotes.trim() || undefined,
      });
      toast.success('Solicitud de corrección remitida a Preceptoría para su validación.');
      setIsEditing(false);
      setCorrectionNotes('');
    } catch (err: any) {
      toast.error(err.message || 'No se pudo enviar la solicitud de corrección.');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return <LoadingState message="Recuperando legajo y vínculos familiares..." />;
  }

  if (error || !profile) {
    return (
      <ErrorState
        message="No se pudo cargar el perfil institucional"
        details={error || 'Legajo no disponible'}
        onRetry={loadProfile}
      />
    );
  }

  return (
    <div className="space-y-6 animate-in fade-in">
      <SectionHeader
        kicker="Legajo Familiar Oficial"
        title="Mi Perfil y Vínculos"
        subtitle="Datos del responsable y parentesco con cada estudiante a cargo. Conforme a registros de secretaría."
      />

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Columna izquierda: Datos del Responsable */}
        <div className="md:col-span-2 space-y-5">
          <div className="rounded-2xl bg-[var(--surface-card)] border border-[var(--border)] p-5 md:p-6 shadow-xs">
            <div className="flex items-center justify-between pb-4 border-b border-[var(--border)]">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-[#14214F] text-[#E2C374] flex items-center justify-center font-black text-xl font-display">
                  {profile.firstName[0]}
                </div>
                <div>
                  <h2 className="text-base font-bold text-[var(--text)]">
                    {profile.firstName} {profile.lastName}
                  </h2>
                  <span className="text-xs text-[#89743A] font-semibold flex items-center gap-1">
                    <ShieldCheck className="w-3.5 h-3.5" />
                    Responsable Autorizado/a
                  </span>
                </div>
              </div>

              {!isEditing && (
                <button
                  type="button"
                  onClick={() => setIsEditing(true)}
                  className="px-3 py-1.5 rounded-xl text-xs font-bold border border-[var(--border)] hover:bg-[var(--surface-subtle)] text-[var(--text)] flex items-center gap-1.5 transition-colors cursor-pointer"
                >
                  <PencilSimpleLine className="w-4 h-4 text-[#89743A]" />
                  <span>Pedir corrección de datos</span>
                </button>
              )}
            </div>

            {/* Vista de datos */}
            {!isEditing ? (
              <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                <div className="p-3 rounded-xl bg-[var(--surface-subtle)]">
                  <span className="block text-[11px] font-semibold text-[var(--text-muted)] flex items-center gap-1">
                    <IdentificationCard className="w-3.5 h-3.5 text-[#89743A]" />
                    DNI / Documento
                  </span>
                  <span className="text-sm font-bold font-mono text-[var(--text)] mt-0.5 block">
                    {profile.dni}
                  </span>
                </div>

                <div className="p-3 rounded-xl bg-[var(--surface-subtle)]">
                  <span className="block text-[11px] font-semibold text-[var(--text-muted)] flex items-center gap-1">
                    <Envelope className="w-3.5 h-3.5 text-[#89743A]" />
                    Correo Electrónico
                  </span>
                  <span className="text-xs font-bold font-mono text-[var(--text)] mt-0.5 block truncate">
                    {profile.email}
                  </span>
                </div>

                <div className="p-3 rounded-xl bg-[var(--surface-subtle)]">
                  <span className="block text-[11px] font-semibold text-[var(--text-muted)] flex items-center gap-1">
                    <Phone className="w-3.5 h-3.5 text-[#89743A]" />
                    Teléfono de Contacto
                  </span>
                  <span className="text-xs font-bold font-mono text-[var(--text)] mt-0.5 block">
                    {profile.phone}
                  </span>
                </div>

                <div className="p-3 rounded-xl bg-[var(--surface-subtle)]">
                  <span className="block text-[11px] font-semibold text-[var(--text-muted)] flex items-center gap-1">
                    <Briefcase className="w-3.5 h-3.5 text-[#89743A]" />
                    Ocupación
                  </span>
                  <span className="text-xs font-bold text-[var(--text)] mt-0.5 block">
                    {profile.occupation || 'No declarada'}
                  </span>
                </div>

                <div className="sm:col-span-2 p-3 rounded-xl bg-[var(--surface-subtle)]">
                  <span className="block text-[11px] font-semibold text-[var(--text-muted)] flex items-center gap-1">
                    <MapPin className="w-3.5 h-3.5 text-[#89743A]" />
                    Domicilio Registrado
                  </span>
                  <span className="text-xs font-bold text-[var(--text)] mt-0.5 block">
                    {profile.address}
                  </span>
                </div>
              </div>
            ) : (
              /* Formulario "Pedir corrección de mis datos" (Requisito §4.9) */
              <form onSubmit={handleSubmitCorrection} className="mt-4 space-y-4">
                <div className="p-3 rounded-xl bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800 text-xs text-amber-900 dark:text-amber-200">
                  <strong>Solicitud formal de rectificación:</strong> Los cambios solicitados son remitidos a la secretaría del ISFDyT N° 26 para actualizar tu legajo administrativo.
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label htmlFor="corr-phone" className="block text-xs font-bold uppercase tracking-wider text-[var(--text-muted)] mb-1">
                      Teléfono de Contacto
                    </label>
                    <input
                      id="corr-phone"
                      type="text"
                      value={newPhone}
                      onChange={(e) => setNewPhone(e.target.value)}
                      className="w-full py-2 px-3 text-xs rounded-xl border border-[var(--border)] bg-[var(--surface)] text-[var(--text)] font-mono"
                    />
                  </div>

                  <div>
                    <label htmlFor="corr-email" className="block text-xs font-bold uppercase tracking-wider text-[var(--text-muted)] mb-1">
                      Correo Electrónico
                    </label>
                    <input
                      id="corr-email"
                      type="email"
                      value={newEmail}
                      onChange={(e) => setNewEmail(e.target.value)}
                      className="w-full py-2 px-3 text-xs rounded-xl border border-[var(--border)] bg-[var(--surface)] text-[var(--text)] font-mono"
                    />
                  </div>

                  <div className="sm:col-span-2">
                    <label htmlFor="corr-address" className="block text-xs font-bold uppercase tracking-wider text-[var(--text-muted)] mb-1">
                      Domicilio Real
                    </label>
                    <input
                      id="corr-address"
                      type="text"
                      value={newAddress}
                      onChange={(e) => setNewAddress(e.target.value)}
                      className="w-full py-2 px-3 text-xs rounded-xl border border-[var(--border)] bg-[var(--surface)] text-[var(--text)]"
                    />
                  </div>

                  <div className="sm:col-span-2">
                    <label htmlFor="corr-notes" className="block text-xs font-bold uppercase tracking-wider text-[var(--text-muted)] mb-1">
                      Motivo o aclaración del pedido
                    </label>
                    <textarea
                      id="corr-notes"
                      rows={2}
                      value={correctionNotes}
                      onChange={(e) => setCorrectionNotes(e.target.value)}
                      placeholder="Ej: Cambio de número celular por cambio de prestadora..."
                      className="w-full py-2 px-3 text-xs rounded-xl border border-[var(--border)] bg-[var(--surface)] text-[var(--text)]"
                    />
                  </div>
                </div>

                <div className="flex items-center justify-end gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setIsEditing(false)}
                    className="px-3 py-1.5 rounded-xl text-xs font-semibold border border-[var(--border)] text-[var(--text-muted)] hover:bg-[var(--surface-subtle)] cursor-pointer"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    disabled={submitting}
                    className="px-4 py-1.5 rounded-xl text-xs font-bold bg-[#14214F] hover:bg-[#1D2D63] text-white cursor-pointer disabled:opacity-50"
                  >
                    {submitting ? 'Enviando pedido...' : 'Enviar Solicitud a Preceptoría'}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>

        {/* Columna derecha: Vínculo con cada Hijo (Solo Lectura, Requisito §4.9) */}
        <div className="space-y-4">
          <div className="rounded-2xl bg-[var(--surface-card)] border border-[var(--border)] p-5 shadow-xs">
            <h3 className="text-xs font-bold uppercase tracking-wider text-[var(--text-muted)] mb-3 flex items-center gap-1.5">
              <Student className="w-4 h-4 text-[#89743A]" />
              <span>Estudiantes Vinculados ({profile.children.length})</span>
            </h3>

            <div className="space-y-3">
              {profile.children.map((child) => (
                <div
                  key={child.childId}
                  className="p-3.5 rounded-xl border border-[var(--border)] bg-[var(--surface-subtle)] text-xs"
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-bold text-[var(--text)]">
                      {child.fullName}
                    </span>
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-[#89743A]/20 text-[#89743A]">
                      {child.relationship}
                    </span>
                  </div>
                  <p className="text-[11px] text-[var(--text-muted)]">
                    {child.courseName}
                  </p>
                  <div className="mt-2 pt-2 border-t border-[var(--border)] text-[10px] text-[var(--text-muted)] italic">
                    * Datos académicos de solo lectura protegidos por normativa.
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
