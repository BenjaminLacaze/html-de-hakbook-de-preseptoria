/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * ISFDyT N° 26 - Bandeja de Reclamos y Sugerencias Estudiantiles
 */

import React, { useState } from 'react';
import {
  ChatCircleDots,
  ShieldCheck,
  ArrowBendUpRight,
  CheckCircle,
  Archive,
  HourglassMedium,
  User,
  Clock,
  ArrowLeft,
  PaperPlaneTilt,
  LockKey,
} from '@phosphor-icons/react';
import { useCentro } from '../../context/CentroContext';
import {
  DestinoDerivacion,
  ReclamoCategoria,
  ReclamoEstado,
} from '../../types';
import { FilterChips } from '../common/FilterChips';
import { Button } from '../common/Button';
import { Dialog } from '../common/Dialog';
import { ReclamoStatusBadge } from '../common/Badge';

export const ReclamosScreen: React.FC = () => {
  const {
    reclamos,
    updateReclamoEstado,
    derivarReclamo,
    responderReclamo,
    archivarReclamo,
    selectedDetailId,
    setSelectedDetailId,
  } = useCentro();
  const [saving, setSaving] = useState(false);

  /** Ejecuta la acción y cierra el diálogo solo si la API respondió bien. */
  const submit = async (action: () => Promise<boolean>, close: () => void) => {
    setSaving(true);
    const ok = await action();
    setSaving(false);
    if (ok) close();
  };

  const [estadoFilter, setEstadoFilter] = useState<'todos' | ReclamoEstado>('todos');
  const [categoriaFilter, setCategoriaFilter] = useState<'todas' | ReclamoCategoria>('todas');

  // Modals for actions
  const [derivarModalOpen, setDerivarModalOpen] = useState(false);
  const [destinoDerivacion, setDestinoDerivacion] = useState<DestinoDerivacion>('Bedelía');
  const [notaDerivacion, setNotaDerivacion] = useState('');

  const [responderModalOpen, setResponderModalOpen] = useState(false);
  const [textoRespuesta, setTextoRespuesta] = useState('');

  const [archivarModalOpen, setArchivarModalOpen] = useState(false);
  const [motivoArchivo, setMotivoArchivo] = useState('');

  const [cambiarEstadoModalOpen, setCambiarEstadoModalOpen] = useState(false);
  const [nuevoEstado, setNuevoEstado] = useState<ReclamoEstado>('en_revision');
  const [notaCambioEstado, setNotaCambioEstado] = useState('');


  // Filter reclamos
  const filteredReclamos = reclamos.filter((r) => {
    if (estadoFilter !== 'todos' && r.estado !== estadoFilter) return false;
    if (categoriaFilter !== 'todas' && r.categoria !== categoriaFilter) return false;
    return true;
  });

  const selectedReclamo = reclamos.find((r) => r.id === selectedDetailId);

  const getRelativeTime = (iso: string) => {
    try {
      const now = Date.now();
      const past = new Date(iso).getTime();
      const diffMin = Math.max(0, Math.round((now - past) / (1000 * 60)));

      if (diffMin < 1) return 'hace instantes';
      if (diffMin < 60) return `hace ${diffMin} min`;
      const diffHours = Math.round(diffMin / 60);
      if (diffHours < 24) return `hace ${diffHours} h`;
      const diffDays = Math.round(diffHours / 24);
      if (diffDays === 1) return 'hace 1 día';
      return `hace ${diffDays} días`;
    } catch {
      return 'recientemente';
    }
  };

  const formatTimelineDate = (iso: string) => {
    try {
      const d = new Date(iso);
      return `${String(d.getDate()).padStart(2, '0')}/${String(d.getMonth() + 1).padStart(2, '0')} ${String(
        d.getHours()
      ).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')} hs`;
    } catch {
      return iso;
    }
  };

  const getCategoriaLabel = (cat: ReclamoCategoria) => {
    switch (cat) {
      case 'academico':
        return 'Académico';
      case 'infraestructura':
        return 'Infraestructura';
      case 'administrativo':
        return 'Administrativo';
      case 'sugerencia':
        return 'Sugerencia';
    }
  };

  // Detailed view of selected claim
  if (selectedReclamo) {
    return (
      <div className="space-y-6 max-w-4xl mx-auto pb-16">
        <div className="flex items-center justify-between gap-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setSelectedDetailId(null)}
            icon={<ArrowLeft className="w-4 h-4" />}
          >
            Volver a la bandeja
          </Button>

          {/* Quick status button */}
          <Button
            variant="secondary"
            size="sm"
            onClick={() => {
              setNuevoEstado(selectedReclamo.estado);
              setNotaCambioEstado('');
              setCambiarEstadoModalOpen(true);
            }}
          >
            Cambiar estado
          </Button>
        </div>

        {/* Claim Main Card */}
        <article className="bg-surface-card rounded-2xl border border-border-subtle p-5 sm:p-7 space-y-6">
          {/* Privacy Notice Required */}
          <div className="p-3 bg-brand-navy/5 dark:bg-white/5 rounded-xl border border-brand-navy/15 dark:border-white/10 flex items-center gap-2.5 text-xs text-foreground-muted">
            <LockKey weight="bold" className="w-4 h-4 text-brand-gold shrink-0" />
            <span>
              <strong>Aviso de privacidad:</strong> Los reclamos solo los ven los integrantes del Centro. Si el reclamo es anónimo, el sistema no muestra quién lo presentó.
            </span>
          </div>

          <div className="space-y-3">
            <div className="flex items-center justify-between gap-2 flex-wrap">
              <div className="flex items-center gap-2">
                <span className="font-mono text-xs font-bold text-brand-navy dark:text-brand-gold bg-surface px-2 py-0.5 rounded border border-border-subtle">
                  {selectedReclamo.codigo}
                </span>
                <span className="text-xs font-semibold px-2 py-0.5 rounded bg-brand-blue/10 text-brand-blue">
                  {getCategoriaLabel(selectedReclamo.categoria)}
                </span>
                <ReclamoStatusBadge estado={selectedReclamo.estado} />
              </div>

              <span className="text-xs text-foreground-muted font-mono">
                {getRelativeTime(selectedReclamo.fechaCreacion)}
              </span>
            </div>

            <h1 className="text-xl sm:text-2xl font-heading font-bold text-foreground">
              {selectedReclamo.titulo}
            </h1>

            {/* Author info */}
            <div className="p-3 bg-surface rounded-xl border border-border-subtle flex items-center justify-between gap-3 text-xs">
              <div className="flex items-center gap-2">
                <User weight="bold" className="w-4 h-4 text-brand-gold" />
                {selectedReclamo.esAnonimo ? (
                  <span className="font-medium text-foreground-muted italic">
                    Remitente anónimo (identidad resguardada a pedido del estudiante)
                  </span>
                ) : (
                  <div>
                    <span className="font-semibold text-foreground">
                      {selectedReclamo.autorNombre}
                    </span>{' '}
                    <span className="text-foreground-muted">· {selectedReclamo.autorCarrera}</span>
                  </div>
                )}
              </div>

              {!selectedReclamo.esAnonimo && selectedReclamo.autorEmail && (
                <span className="font-mono text-[11px] text-brand-blue hidden sm:inline">
                  {selectedReclamo.autorEmail}
                </span>
              )}
            </div>
            <div className="brand-fillet" />
          </div>

          {/* Description */}
          <div className="space-y-2">
            <h3 className="text-xs font-bold text-foreground uppercase tracking-wider">
              Detalle del reclamo
            </h3>
            <p className="text-sm sm:text-base text-foreground leading-relaxed whitespace-pre-wrap font-sans">
              {selectedReclamo.descripcion}
            </p>
          </div>

          {/* If already responded or derived */}
          {selectedReclamo.respuestaAlAutor && (
            <div className="p-4 bg-emerald-50 dark:bg-emerald-950/40 rounded-xl border border-emerald-300 dark:border-emerald-800 text-xs space-y-1.5">
              <div className="font-bold text-emerald-900 dark:text-emerald-200 flex items-center gap-1.5">
                <CheckCircle weight="bold" className="w-4 h-4 text-emerald-600" />
                <span>Respuesta enviada al remitente:</span>
              </div>
              <p className="text-emerald-800 dark:text-emerald-300 leading-relaxed whitespace-pre-wrap">
                {selectedReclamo.respuestaAlAutor}
              </p>
            </div>
          )}

          {selectedReclamo.derivadoA && (
            <div className="p-4 bg-sky-50 dark:bg-sky-950/40 rounded-xl border border-sky-300 dark:border-sky-800 text-xs space-y-1">
              <div className="font-bold text-sky-900 dark:text-sky-200 flex items-center gap-1.5">
                <ArrowBendUpRight weight="bold" className="w-4 h-4 text-sky-600" />
                <span>Derivado a {selectedReclamo.derivadoA}</span>
              </div>
              {selectedReclamo.notaDerivacion && (
                <p className="text-sky-800 dark:text-sky-300">
                  Nota: {selectedReclamo.notaDerivacion}
                </p>
              )}
            </div>
          )}

          {/* Action Buttons Toolbar */}
          <div className="pt-4 border-t border-border-subtle flex flex-wrap items-center gap-3">
            <Button
              variant="accent-gold"
              size="sm"
              icon={<ArrowBendUpRight weight="bold" className="w-4 h-4" />}
              onClick={() => {
                setNotaDerivacion('');
                setDerivarModalOpen(true);
              }}
            >
              Derivar a estamento
            </Button>

            <Button
              variant="primary"
              size="sm"
              icon={<PaperPlaneTilt weight="bold" className="w-4 h-4" />}
              onClick={() => {
                setTextoRespuesta('');
                setResponderModalOpen(true);
              }}
            >
              Responder al autor
            </Button>

            <Button
              variant="secondary"
              size="sm"
              icon={<Archive weight="bold" className="w-4 h-4" />}
              onClick={() => {
                setMotivoArchivo('');
                setArchivarModalOpen(true);
              }}
            >
              Archivar reclamo
            </Button>
          </div>
        </article>

        {/* Audit Trail / Timeline of the Case */}
        <section className="bg-surface-card rounded-2xl border border-border-subtle p-5 sm:p-7 space-y-4">
          <h3 className="text-xs font-bold text-foreground tracking-wider uppercase">
            Línea de tiempo y trazabilidad del caso
          </h3>
          <div className="brand-fillet" />

          <div className="relative pl-6 space-y-6 before:content-[''] before:absolute before:left-2 before:top-2 before:bottom-2 before:w-0.5 before:bg-border-subtle">
            {selectedReclamo.timeline.length === 0 && (
              <p className="text-xs text-foreground-muted">Todavía no hay movimientos registrados.</p>
            )}
            {selectedReclamo.timeline.map((event) => (
              <div key={event.id} className="relative space-y-1">
                {/* Node icon */}
                <div className="absolute -left-6 top-1 w-4 h-4 rounded-full bg-brand-navy dark:bg-brand-gold border-2 border-surface-card" />

                <div className="flex items-center justify-between text-xs">
                  <span className="font-semibold text-foreground">{event.titulo}</span>
                  <span className="text-foreground-muted font-mono text-[11px]">
                    {formatTimelineDate(event.fecha)}
                  </span>
                </div>

                {event.descripcion && (
                  <p className="text-xs text-foreground-muted leading-relaxed whitespace-pre-wrap">
                    {event.descripcion}
                  </p>
                )}

                <div className="text-[10px] text-brand-gold font-medium">
                  Responsable: {event.autor}
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* MODAL DERIVAR */}
        <Dialog
          isOpen={derivarModalOpen}
          onClose={() => setDerivarModalOpen(false)}
          title="Derivar reclamo a estamento institucional"
          description="Seleccioná el sector del Instituto y redactá una nota de pase formal."
          maxWidth="sm"
        >
          <div className="space-y-4">
            <div className="space-y-1">
              <label className="text-xs font-semibold text-foreground uppercase">
                Destino de derivación *
              </label>
              <select
                value={destinoDerivacion}
                onChange={(e) => setDestinoDerivacion(e.target.value as DestinoDerivacion)}
                className="w-full px-3 py-2 text-xs bg-surface rounded-lg border border-border-subtle"
              >
                <option value="Bedelía">Bedelía (materias, notas, correlatividades)</option>
                <option value="Preceptoría">Preceptoría (asistencias, constancias)</option>
                <option value="Dirección">Equipo Directivo / CAI</option>
                <option value="Auxiliares">Personal Auxiliar (edilicio, aulas, higiene)</option>
              </select>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-semibold text-foreground uppercase">
                Nota de elevación *
              </label>
              <textarea
                rows={3}
                required
                value={notaDerivacion}
                onChange={(e) => setNotaDerivacion(e.target.value)}
                placeholder="Explicá el motivo y las actuaciones solicitadas..."
                className="w-full px-3 py-2 text-xs bg-surface rounded-lg border border-border-subtle"
              />
            </div>

            <div className="p-3 bg-surface rounded-lg border border-border-subtle text-[11px] text-foreground-muted">
              La derivación queda registrada en la línea de tiempo del caso. Por ahora el sistema no le avisa
              automáticamente al sector elegido: coordiná el pase por los canales habituales.
            </div>

            <div className="flex items-center justify-end gap-2 pt-2">
              <Button variant="secondary" onClick={() => setDerivarModalOpen(false)}>
                Cancelar
              </Button>
              <Button
                variant="accent-gold"
                disabled={!notaDerivacion.trim() || saving}
                loading={saving}
                onClick={() =>
                  submit(
                    () => derivarReclamo(selectedReclamo.id, destinoDerivacion, notaDerivacion),
                    () => setDerivarModalOpen(false),
                  )
                }
              >
                Confirmar derivación
              </Button>
            </div>
          </div>
        </Dialog>

        {/* MODAL RESPONDER AL AUTOR */}
        <Dialog
          isOpen={responderModalOpen}
          onClose={() => setResponderModalOpen(false)}
          title="Responder formalmente al remitente"
          description="El remitente la lee en su panel de reclamos y recibe una notificación. El reclamo pasa a Respondido."
          maxWidth="sm"
        >
          <div className="space-y-4">
            <div className="space-y-1">
              <label className="text-xs font-semibold text-foreground uppercase">
                Texto de la respuesta *
              </label>
              <textarea
                rows={4}
                required
                value={textoRespuesta}
                onChange={(e) => setTextoRespuesta(e.target.value)}
                placeholder="Escribí una respuesta clara y respetuosa con el voseo del Centro..."
                className="w-full px-3 py-2 text-xs bg-surface rounded-lg border border-border-subtle font-sans"
              />
            </div>

            <div className="flex items-center justify-end gap-2 pt-2">
              <Button variant="secondary" onClick={() => setResponderModalOpen(false)}>
                Cancelar
              </Button>
              <Button
                variant="primary"
                disabled={!textoRespuesta.trim() || saving}
                loading={saving}
                onClick={() =>
                  submit(
                    () => responderReclamo(selectedReclamo.id, textoRespuesta),
                    () => setResponderModalOpen(false),
                  )
                }
              >
                Registrar respuesta
              </Button>
            </div>
          </div>
        </Dialog>

        {/* MODAL ARCHIVAR */}
        <Dialog
          isOpen={archivarModalOpen}
          onClose={() => setArchivarModalOpen(false)}
          title="Archivar reclamo"
          description="Indicá el motivo por el cual se archiva el reclamo (resuelto o desestimado)."
          maxWidth="sm"
        >
          <div className="space-y-4">
            <div className="space-y-1">
              <label className="text-xs font-semibold text-foreground uppercase">
                Motivo de archivo *
              </label>
              <textarea
                rows={3}
                required
                value={motivoArchivo}
                onChange={(e) => setMotivoArchivo(e.target.value)}
                placeholder="Ej.: Resuelto favorablemente con la compra del equipamiento."
                className="w-full px-3 py-2 text-xs bg-surface rounded-lg border border-border-subtle"
              />
            </div>

            <div className="flex items-center justify-end gap-2 pt-2">
              <Button variant="secondary" onClick={() => setArchivarModalOpen(false)}>
                Cancelar
              </Button>
              <Button
                variant="danger"
                disabled={!motivoArchivo.trim() || saving}
                loading={saving}
                onClick={() =>
                  submit(
                    () => archivarReclamo(selectedReclamo.id, motivoArchivo),
                    () => setArchivarModalOpen(false),
                  )
                }
              >
                Confirmar archivo
              </Button>
            </div>
          </div>
        </Dialog>

        {/* MODAL CAMBIAR ESTADO */}
        <Dialog
          isOpen={cambiarEstadoModalOpen}
          onClose={() => setCambiarEstadoModalOpen(false)}
          title="Cambiar estado del reclamo"
          description="Actualizá la etapa procesal del caso."
          maxWidth="sm"
        >
          <div className="space-y-4">
            <div className="space-y-1">
              <label className="text-xs font-semibold text-foreground uppercase">
                Nuevo estado *
              </label>
              <select
                value={nuevoEstado}
                onChange={(e) => setNuevoEstado(e.target.value as ReclamoEstado)}
                className="w-full px-3 py-2 text-xs bg-surface rounded-lg border border-border-subtle"
              >
                <option value="recibido">Recibido (gris azulado)</option>
                <option value="en_revision">En revisión (ámbar)</option>
                <option value="derivado">Derivado (azul cielo)</option>
                <option value="respondido">Respondido (verde)</option>
                <option value="archivado">Archivado (gris)</option>
              </select>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-semibold text-foreground uppercase">
                Comentario de actualización (opcional)
              </label>
              <input
                type="text"
                value={notaCambioEstado}
                onChange={(e) => setNotaCambioEstado(e.target.value)}
                placeholder="Ej.: En evaluación técnica por secretaría"
                className="w-full px-3 py-2 text-xs bg-surface rounded-lg border border-border-subtle"
              />
            </div>

            <div className="flex items-center justify-end gap-2 pt-2">
              <Button variant="secondary" onClick={() => setCambiarEstadoModalOpen(false)}>
                Cancelar
              </Button>
              <Button
                variant="accent-gold"
                disabled={saving || nuevoEstado === selectedReclamo.estado}
                loading={saving}
                onClick={() =>
                  submit(
                    () => updateReclamoEstado(selectedReclamo.id, nuevoEstado, notaCambioEstado),
                    () => setCambiarEstadoModalOpen(false),
                  )
                }
              >
                Actualizar estado
              </Button>
            </div>
          </div>
        </Dialog>
      </div>
    );
  }

  // Tray List View
  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div>
        <div className="text-[11px] font-bold text-brand-gold uppercase tracking-widest">
          ATENCIÓN Y DERECHOS
        </div>
        <h1 className="text-2xl sm:text-3xl font-heading font-extrabold text-foreground">
          Bandeja de <span className="text-brand-gold">Reclamos y Sugerencias</span>
        </h1>
        <div className="brand-fillet mt-2" />
      </div>

      {/* Privacy Notice Banner */}
      <div className="p-3.5 bg-surface-card rounded-xl border border-border-subtle flex items-center justify-between gap-3 text-xs text-foreground-muted">
        <div className="flex items-center gap-2">
          <ShieldCheck weight="bold" className="w-5 h-5 text-brand-gold shrink-0" />
          <span>
            <strong>Privacidad garantizada:</strong> Los reclamos solo son visibles para integrantes acreditados del Centro.
          </span>
        </div>
      </div>

      {/* Filter by Estado */}
      <div className="space-y-3">
        <div className="text-xs font-bold text-foreground uppercase tracking-wide">
          Filtrar por Estado:
        </div>
        <FilterChips
          selected={estadoFilter}
          onChange={(val) => setEstadoFilter(val as any)}
          options={[
            { id: 'todos', label: 'Todos', count: reclamos.length },
            {
              id: 'recibido',
              label: 'Recibidos',
              count: reclamos.filter((r) => r.estado === 'recibido').length,
            },
            {
              id: 'en_revision',
              label: 'En revisión',
              count: reclamos.filter((r) => r.estado === 'en_revision').length,
            },
            {
              id: 'derivado',
              label: 'Derivados',
              count: reclamos.filter((r) => r.estado === 'derivado').length,
            },
            {
              id: 'respondido',
              label: 'Respondidos',
              count: reclamos.filter((r) => r.estado === 'respondido').length,
            },
            {
              id: 'archivado',
              label: 'Archivados',
              count: reclamos.filter((r) => r.estado === 'archivado').length,
            },
          ]}
        />

        {/* Filter by Category */}
        <div className="text-xs font-bold text-foreground uppercase tracking-wide pt-1">
          Filtrar por Categoría:
        </div>
        <FilterChips
          selected={categoriaFilter}
          onChange={(val) => setCategoriaFilter(val as any)}
          options={[
            { id: 'todas', label: 'Todas las áreas' },
            { id: 'academico', label: 'Académico' },
            { id: 'infraestructura', label: 'Infraestructura' },
            { id: 'administrativo', label: 'Administrativo' },
            { id: 'sugerencia', label: 'Sugerencia' },
          ]}
        />
      </div>

      {/* List of claims */}
      <div className="space-y-3">
        {filteredReclamos.length > 0 ? (
          filteredReclamos.map((rec) => (
            <article
              key={rec.id}
              onClick={() => setSelectedDetailId(rec.id)}
              className="p-5 bg-surface-card hover:bg-surface-hover rounded-xl border border-border-subtle hover:border-brand-gold/60 transition-all cursor-pointer group space-y-2.5"
              role="button"
              tabIndex={0}
            >
              <div className="flex items-center justify-between gap-2 flex-wrap">
                <div className="flex items-center gap-2">
                  <span className="font-mono text-xs font-bold text-brand-navy dark:text-brand-gold bg-surface px-2 py-0.5 rounded border border-border-subtle">
                    {rec.codigo}
                  </span>
                  <span className="text-xs font-semibold px-2 py-0.5 rounded bg-brand-blue/10 text-brand-blue">
                    {getCategoriaLabel(rec.categoria)}
                  </span>
                  <ReclamoStatusBadge estado={rec.estado} />
                </div>

                <span className="text-xs text-foreground-muted font-mono">
                  {getRelativeTime(rec.fechaCreacion)}
                </span>
              </div>

              <h2 className="text-base sm:text-lg font-heading font-bold text-foreground group-hover:text-brand-navy dark:group-hover:text-brand-gold transition-colors leading-snug">
                {rec.titulo}
              </h2>

              <p className="text-xs sm:text-sm text-foreground-muted line-clamp-2 leading-relaxed">
                {rec.descripcion}
              </p>

              <div className="flex items-center justify-between pt-2 border-t border-border-subtle text-xs text-foreground-muted">
                <div>
                  Remitente:{' '}
                  <strong className="text-foreground">
                    {rec.esAnonimo ? 'Anónimo/a' : rec.autorNombre}
                  </strong>
                  {!rec.esAnonimo && rec.autorCarrera && ` (${rec.autorCarrera})`}
                </div>

                <span className="text-xs text-brand-blue font-semibold group-hover:underline">
                  Atender caso →
                </span>
              </div>
            </article>
          ))
        ) : (
          <div className="p-12 text-center bg-surface-card rounded-xl border border-border-subtle space-y-3">
            <ChatCircleDots weight="bold" className="w-10 h-10 text-brand-gold mx-auto" />
            <h3 className="text-base font-semibold text-foreground">
              No hay reclamos con estos filtros
            </h3>
            <p className="text-xs text-foreground-muted max-w-sm mx-auto">
              Probá restableciendo los filtros de estado o categoría.
            </p>
            <Button
              size="sm"
              variant="secondary"
              onClick={() => {
                setEstadoFilter('todos');
                setCategoriaFilter('todas');
              }}
            >
              Restablecer filtros
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};
