/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * ISFDyT N° 26 - Pantalla de Inicio y Tablero de Gestión
 */

import React from 'react';
import {
  ChatCircleDots,
  CalendarBlank,
  UsersThree,
  WarningCircle,
  ArrowRight,
  MapPin,
  Clock,
  Megaphone,
  CheckCircle,
} from '@phosphor-icons/react';
import { useCentro } from '../../context/CentroContext';
import { EventCategoryBadge, ReclamoStatusBadge } from '../common/Badge';
import { Button } from '../common/Button';
import { ISOTIPO_NEGATIVO_SVG, LOGO_NEGATIVO_PNG } from '../../lib/assets';

export const InicioScreen: React.FC = () => {
  const {
    currentUser,
    stats,
    setCurrentScreen,
    setSelectedDetailId,
    eventos,
    comunicados,
    reclamos,
    hilos,
  } = useCentro();

  // Próximo evento (el más cercano que todavía no pasó)
  const proximoEvento = [...eventos]
    .filter((e) => !e.esPasado)
    .sort((a, b) => a.fecha.localeCompare(b.fecha))[0];

  // Último comunicado publicado (la API ya los ordena: fijados primero, después los más nuevos)
  const ultimoComunicado = [...comunicados]
    .filter((c) => c.estado === 'publicado')
    .sort((a, b) => b.fechaCreacion.localeCompare(a.fechaCreacion))[0];

  // Reclamos para atender (antiguos recibidos o en revisión)
  const reclamosPendientes = reclamos
    .filter((r) => r.estado === 'recibido' || r.estado === 'en_revision')
    .slice(0, 3);

  // Denuncias pendientes
  const hilosDenunciados = hilos.filter((h) => h.denunciado);

  const formatDateShort = (dateStr: string) => {
    try {
      const parts = dateStr.split('-');
      if (parts.length === 3) {
        return `${parts[2]}/${parts[1]}/${parts[0]}`;
      }
      return dateStr;
    } catch {
      return dateStr;
    }
  };

  return (
    <div className="space-y-6 sm:space-y-8 pb-12">
      {/* 1. Franja Navy sólida con saludo, cargo y lema oficial */}
      <section className="bg-brand-navy rounded-2xl p-6 sm:p-8 text-white relative overflow-hidden shadow-sm">
        {/* Decorative subtle brand background pattern */}
        <div className="absolute -right-12 -bottom-12 w-64 h-64 rounded-full bg-[#1C2E6B]/50 pointer-events-none" />
        <div className="absolute right-12 top-4 opacity-15 pointer-events-none">
          <img
            src={LOGO_NEGATIVO_PNG}
            alt=""
            className="w-48 h-48 object-contain"
            onError={(e) => {
              (e.target as HTMLImageElement).src = ISOTIPO_NEGATIVO_SVG;
            }}
          />
        </div>

        <div className="relative z-10 max-w-2xl space-y-3">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-brand-gold/25 border border-brand-gold/40 text-[11px] font-bold text-brand-gold-sand tracking-widest uppercase">
            LA VOZ DE LOS ESTUDIANTES
          </div>

          <h1 className="text-2xl sm:text-3xl font-heading font-extrabold text-white tracking-tight leading-tight">
            Hola, {currentUser.nombre}
          </h1>

          <p className="text-sm sm:text-base text-white/80 leading-relaxed font-sans">
            Módulo de gestión del Centro de Estudiantes del{' '}
            <strong className="text-brand-gold-sand font-semibold">ISFDyT N° 26</strong>.
            {currentUser.cargo ? (
              <>
                {' '}Cargo:{' '}
                <span className="text-white font-medium underline decoration-brand-gold decoration-2 underline-offset-4">
                  {currentUser.cargo}
                </span>
                .
              </>
            ) : (
              ' Todavía no cargaste tu cargo en el Centro (lo podés completar en tu perfil).'
            )}{' '}
            Todo lo que publiques o respondas aquí se organiza en la comunidad terciaria.
          </p>
        </div>
      </section>

      {/* 2. Cuatro cifras clicables de gestión y comunidad */}
      <section aria-label="Métricas del Centro">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
          {/* Cifra 1: Reclamos sin atender */}
          <button
            type="button"
            onClick={() => setCurrentScreen('reclamos')}
            className="p-4 sm:p-5 bg-surface-card hover:bg-surface-hover rounded-xl border border-border-subtle hover:border-brand-gold/60 text-left transition-all group focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-blue cursor-pointer"
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-foreground-muted uppercase tracking-wider">
                Reclamos sin atender
              </span>
              <div className="p-2 rounded-lg bg-amber-500/10 text-amber-700 dark:text-amber-400 group-hover:scale-110 transition-transform">
                <ChatCircleDots weight="bold" className="w-5 h-5" />
              </div>
            </div>
            <div className="mt-3 text-3xl font-heading font-extrabold text-foreground font-mono tabular-nums">
              {stats.reclamosSinAtender}
            </div>
            <div className="mt-1 text-[11px] text-foreground-muted flex items-center gap-1">
              <span>Recibidos y en revisión</span>
              <ArrowRight className="w-3 h-3 group-hover:translate-x-1 transition-transform" />
            </div>
          </button>

          {/* Cifra 2: Próximos eventos */}
          <button
            type="button"
            onClick={() => setCurrentScreen('eventos')}
            className="p-4 sm:p-5 bg-surface-card hover:bg-surface-hover rounded-xl border border-border-subtle hover:border-brand-blue/60 text-left transition-all group focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-blue cursor-pointer"
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-foreground-muted uppercase tracking-wider">
                Próximos eventos
              </span>
              <div className="p-2 rounded-lg bg-brand-blue/10 text-brand-blue group-hover:scale-110 transition-transform">
                <CalendarBlank weight="bold" className="w-5 h-5" />
              </div>
            </div>
            <div className="mt-3 text-3xl font-heading font-extrabold text-foreground font-mono tabular-nums">
              {stats.proximosEventos}
            </div>
            <div className="mt-1 text-[11px] text-foreground-muted flex items-center gap-1">
              <span>En la agenda terciaria</span>
              <ArrowRight className="w-3 h-3 group-hover:translate-x-1 transition-transform" />
            </div>
          </button>

          {/* Cifra 3: Inscriptos esta semana */}
          <button
            type="button"
            onClick={() => setCurrentScreen('eventos')}
            className="p-4 sm:p-5 bg-surface-card hover:bg-surface-hover rounded-xl border border-border-subtle hover:border-emerald-600/60 text-left transition-all group focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-blue cursor-pointer"
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-foreground-muted uppercase tracking-wider">
                Inscriptos a eventos
              </span>
              <div className="p-2 rounded-lg bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 group-hover:scale-110 transition-transform">
                <UsersThree weight="bold" className="w-5 h-5" />
              </div>
            </div>
            <div className="mt-3 text-3xl font-heading font-extrabold text-foreground font-mono tabular-nums">
              {stats.inscriptosProximos}
            </div>
            <div className="mt-1 text-[11px] text-foreground-muted flex items-center gap-1">
              <span>En los próximos eventos</span>
              <ArrowRight className="w-3 h-3 group-hover:translate-x-1 transition-transform" />
            </div>
          </button>

          {/* Cifra 4: Publicaciones denunciadas */}
          <button
            type="button"
            onClick={() => setCurrentScreen('foros')}
            className="p-4 sm:p-5 bg-surface-card hover:bg-surface-hover rounded-xl border border-border-subtle hover:border-rose-500/60 text-left transition-all group focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-blue cursor-pointer"
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-foreground-muted uppercase tracking-wider">
                Hilos denunciados
              </span>
              <div className="p-2 rounded-lg bg-rose-500/10 text-rose-700 dark:text-rose-400 group-hover:scale-110 transition-transform">
                <WarningCircle weight="bold" className="w-5 h-5" />
              </div>
            </div>
            <div className="mt-3 text-3xl font-heading font-extrabold text-foreground font-mono tabular-nums">
              {stats.publicacionesDenunciadas}
            </div>
            <div className="mt-1 text-[11px] text-foreground-muted flex items-center gap-1">
              <span>Para moderación del Centro</span>
              <ArrowRight className="w-3 h-3 group-hover:translate-x-1 transition-transform" />
            </div>
          </button>
        </div>
      </section>

      {/* 3. Grid de dos columnas: Próximo evento & Último comunicado */}
      <section className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Próximo evento destacado */}
        {!proximoEvento ? (
          <div className="bg-surface-card rounded-xl border border-border-subtle p-5 sm:p-6 flex flex-col justify-center items-start space-y-3">
            <div className="text-[11px] font-bold text-brand-gold uppercase tracking-widest">PRÓXIMO EVENTO</div>
            <p className="text-sm text-foreground-muted">No hay actividades próximas en la agenda.</p>
            <Button size="sm" variant="accent-gold" onClick={() => setCurrentScreen('eventos')}>
              Crear una actividad
            </Button>
          </div>
        ) : (
        <div className="bg-surface-card rounded-xl border border-border-subtle p-5 sm:p-6 flex flex-col justify-between space-y-4">
          <div>
            <div className="flex items-center justify-between mb-2">
              <div className="text-[11px] font-bold text-brand-gold uppercase tracking-widest">
                PRÓXIMO EVENTO
              </div>
              <EventCategoryBadge category={proximoEvento.categoria} />
            </div>
            <div className="brand-fillet mb-3" />

            <h3 className="text-lg sm:text-xl font-heading font-bold text-foreground">
              {proximoEvento.titulo}
            </h3>

            <p className="text-xs sm:text-sm text-foreground-muted mt-2 line-clamp-3 leading-relaxed">
              {proximoEvento.descripcion}
            </p>
          </div>

          <div className="space-y-3 pt-3 border-t border-border-subtle">
            <div className="grid grid-cols-2 gap-2 text-xs text-foreground-muted">
              <div className="flex items-center gap-2">
                <CalendarBlank weight="bold" className="w-4 h-4 text-brand-navy dark:text-brand-gold" />
                <span className="font-mono">{formatDateShort(proximoEvento.fecha)}</span>
              </div>
              <div className="flex items-center gap-2">
                <Clock weight="bold" className="w-4 h-4 text-brand-navy dark:text-brand-gold" />
                <span className="font-mono">
                  {proximoEvento.horaInicio
                    ? `${proximoEvento.horaInicio}${proximoEvento.horaFin ? ` a ${proximoEvento.horaFin}` : ''} hs`
                    : 'Horario a confirmar'}
                </span>
              </div>
              <div className="flex items-center gap-2 col-span-2">
                <MapPin weight="bold" className="w-4 h-4 text-brand-gold" />
                <span className="truncate">{proximoEvento.lugar || 'Lugar a confirmar'}</span>
              </div>
            </div>

            <div className="flex items-center justify-between pt-2">
              <div className="text-xs font-semibold text-foreground">
                <span className="font-mono text-brand-gold font-bold">
                  {proximoEvento.cantidadInscriptos}
                </span>{' '}
                estudiantes inscriptos
                {proximoEvento.cupoMaximo && (
                  <span className="text-foreground-muted text-[11px]">
                    {' '}/ cupo de {proximoEvento.cupoMaximo}
                  </span>
                )}
              </div>

              <Button
                size="sm"
                variant="accent-gold"
                onClick={() => {
                  setSelectedDetailId(proximoEvento.id);
                  setCurrentScreen('eventos');
                }}
              >
                Ver detalle y lista
              </Button>
            </div>
          </div>
        </div>
        )}

        {/* Último comunicado publicado */}
        {!ultimoComunicado ? (
          <div className="bg-surface-card rounded-xl border border-border-subtle p-5 sm:p-6 flex flex-col justify-center items-start space-y-3">
            <div className="text-[11px] font-bold text-brand-gold uppercase tracking-widest">ÚLTIMO COMUNICADO</div>
            <p className="text-sm text-foreground-muted">Todavía no hay comunicados publicados.</p>
            <Button size="sm" variant="secondary" onClick={() => setCurrentScreen('comunicados')}>
              Redactar un comunicado
            </Button>
          </div>
        ) : (
        <div className="bg-surface-card rounded-xl border border-border-subtle p-5 sm:p-6 flex flex-col justify-between space-y-4">
          <div>
            <div className="flex items-center justify-between mb-2">
              <div className="text-[11px] font-bold text-brand-gold uppercase tracking-widest">
                ÚLTIMO COMUNICADO
              </div>
              <span className="text-[11px] text-foreground-muted font-mono">
                {formatDateShort(ultimoComunicado.fechaCreacion.split('T')[0])}
              </span>
            </div>
            <div className="brand-fillet mb-3" />

            <h3 className="text-lg sm:text-xl font-heading font-bold text-foreground">
              {ultimoComunicado.titulo}
            </h3>

            <p className="text-xs sm:text-sm text-foreground-muted mt-2 line-clamp-3 leading-relaxed">
              {ultimoComunicado.extracto || ultimoComunicado.contenido}
            </p>
          </div>

          <div className="pt-3 border-t border-border-subtle flex items-center justify-between">
            <div className="text-xs text-foreground-muted">
              Por <strong className="text-foreground">{ultimoComunicado.autorNombre}</strong>
              {ultimoComunicado.autorCargo && ` (${ultimoComunicado.autorCargo})`}
            </div>

            <Button
              size="sm"
              variant="secondary"
              onClick={() => {
                setSelectedDetailId(ultimoComunicado.id);
                setCurrentScreen('comunicados');
              }}
            >
              Leer completo
            </Button>
          </div>
        </div>
        )}
      </section>

      {/* 4. "Para atender": Reclamos pendientes y denuncias */}
      <section className="bg-surface-card rounded-xl border border-border-subtle p-5 sm:p-6 space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <div className="text-[11px] font-bold text-brand-gold uppercase tracking-widest">
              BANDEJA DE PRIORIDADES
            </div>
            <h2 className="text-lg sm:text-xl font-heading font-bold text-foreground">
              Para atender en el Centro
            </h2>
          </div>
          <Button
            size="sm"
            variant="ghost"
            onClick={() => setCurrentScreen('reclamos')}
            iconRight={<ArrowRight className="w-4 h-4" />}
          >
            Ver todos los reclamos
          </Button>
        </div>
        <div className="brand-fillet" />

        {/* Reclamos prioritarios */}
        <div className="space-y-3">
          {reclamosPendientes.length > 0 ? (
            reclamosPendientes.map((rec) => (
              <div
                key={rec.id}
                onClick={() => {
                  setSelectedDetailId(rec.id);
                  setCurrentScreen('reclamos');
                }}
                className="p-3.5 bg-surface hover:bg-surface-hover rounded-lg border border-border-subtle flex flex-col sm:flex-row sm:items-center justify-between gap-3 cursor-pointer transition-colors"
                role="button"
                tabIndex={0}
              >
                <div className="space-y-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-xs font-mono font-bold text-brand-navy dark:text-brand-gold-sand">
                      {rec.codigo}
                    </span>
                    <ReclamoStatusBadge estado={rec.estado} />
                    <span className="text-xs text-foreground-muted">
                      · {rec.esAnonimo ? 'Anónimo' : rec.autorNombre}
                    </span>
                  </div>
                  <div className="text-sm font-semibold text-foreground truncate">
                    {rec.titulo}
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <span className="text-xs text-brand-blue font-medium hover:underline">
                    Atender reclamo →
                  </span>
                </div>
              </div>
            ))
          ) : (
            <div className="p-6 text-center text-sm text-foreground-muted">
              ¡Excelente! No hay reclamos pendientes de atención en este momento.
            </div>
          )}
        </div>

        {/* Alerta de denuncias en foros si existen */}
        {hilosDenunciados.length > 0 && (
          <div className="p-4 rounded-lg bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900 flex items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <WarningCircle weight="bold" className="w-5 h-5 text-rose-600 shrink-0" />
              <div>
                <div className="text-xs font-bold text-rose-900 dark:text-rose-200">
                  Hay {hilosDenunciados.length} publicación(es) denunciada(s) en los foros
                </div>
                <div className="text-[11px] text-rose-700 dark:text-rose-300">
                  Revisá el contenido para moderar, desestimar o fijar una advertencia.
                </div>
              </div>
            </div>

            <Button
              size="sm"
              variant="danger"
              onClick={() => setCurrentScreen('foros')}
            >
              Revisar denuncias
            </Button>
          </div>
        )}
      </section>
    </div>
  );
};
