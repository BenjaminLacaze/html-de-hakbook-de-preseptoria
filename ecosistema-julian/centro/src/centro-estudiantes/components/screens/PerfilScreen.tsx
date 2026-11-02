/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * ISFDyT N° 26 - Mi Perfil, Apariencia (6 temas), Opciones y Cierre de Sesión
 */

import React, { useState } from 'react';
import {
  User,
  Palette,
  Gear,
  SignOut,
  Check,
  Info,
  TextAa,
  VideoCamera,
  Pencil,
} from '@phosphor-icons/react';
import { useCentro } from '../../context/CentroContext';
import { ThemeName } from '../../types';
import { Button } from '../common/Button';

export const PerfilScreen: React.FC = () => {
  const {
    currentUser,
    theme,
    setTheme,
    textSize,
    setTextSize,
    reducedMotion,
    setReducedMotion,
    setOpenLogoutModal,
    setShowPresentation,
    updatePerfil,
  } = useCentro();

  const [activeTab, setActiveTab] = useState<'perfil' | 'apariencia' | 'opciones'>('perfil');

  // Edición del perfil propio (cargo y biografía)
  const [editing, setEditing] = useState(false);
  const [cargo, setCargo] = useState('');
  const [biografia, setBiografia] = useState('');
  const [saving, setSaving] = useState(false);

  const startEdit = () => {
    setCargo(currentUser.cargo);
    setBiografia(currentUser.biografia ?? '');
    setEditing(true);
  };

  const saveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    const ok = await updatePerfil({ cargo, biografia });
    setSaving(false);
    if (ok) setEditing(false);
  };

  const themesList: { id: ThemeName; name: string; description: string; colors: string[] }[] = [
    {
      id: 'celestial',
      name: 'Celestial (Oficial)',
      description: 'Limpio y luminoso, con el azul marino y dorado institucional sobre blanco puro.',
      colors: ['#14214F', '#89743A', '#3F78B6', '#FFFFFF'],
    },
    {
      id: 'oscuro',
      name: 'Oscuro',
      description: 'Superficies navy profundo para lectura nocturna o entornos de poca luz.',
      colors: ['#0B1124', '#131C38', '#D6BC77', '#60A5FA'],
    },
    {
      id: 'ensonacion',
      name: 'Ensoñación',
      description: 'Atardecer cálido, tonos pergamino y arena dorada acogedora.',
      colors: ['#FBF8F5', '#EADBCE', '#9E7B3B', '#182245'],
    },
    {
      id: 'moderno',
      name: 'Moderno',
      description: 'Alto contraste arquitectónico, blanco puro y tipografía definida.',
      colors: ['#FFFFFF', '#0A0D14', '#14214F', '#89743A'],
    },
    {
      id: 'fantasma',
      name: 'Fantasma',
      description: 'Estructura en grafito y pizarra etérea, sin saturación excesiva.',
      colors: ['#F4F6F8', '#DFE5EC', '#1B253D', '#7D6F4B'],
    },
    {
      id: 'rebelde',
      name: 'Rebelde',
      description: 'Vibrante y participativo, con presencia intensa del dorado y azul.',
      colors: ['#F5F7FD', '#14214F', '#946E18', '#1F6AC4'],
    },
  ];

  return (
    <div className="space-y-6 max-w-4xl mx-auto pb-16">
      {/* Header */}
      <div>
        <div className="text-[11px] font-bold text-brand-gold uppercase tracking-widest">
          CONFIGURACIÓN INSTITUCIONAL
        </div>
        <h1 className="text-2xl sm:text-3xl font-heading font-extrabold text-foreground">
          Mi Perfil y <span className="text-brand-gold">Ajustes del Sistema</span>
        </h1>
        <div className="brand-fillet mt-2" />
      </div>

      {/* Segmented controls for navigation */}
      <div className="flex items-center gap-1 p-1 bg-surface-card rounded-xl border border-border-subtle overflow-x-auto">
        <button
          type="button"
          onClick={() => setActiveTab('perfil')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-xs font-semibold transition-colors min-h-[44px] whitespace-nowrap cursor-pointer ${
            activeTab === 'perfil'
              ? 'bg-brand-navy text-white shadow-xs'
              : 'text-foreground-muted hover:text-foreground'
          }`}
        >
          <User weight="bold" className="w-4 h-4" />
          <span>Datos del Perfil</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('apariencia')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-xs font-semibold transition-colors min-h-[44px] whitespace-nowrap cursor-pointer ${
            activeTab === 'apariencia'
              ? 'bg-brand-navy text-white shadow-xs'
              : 'text-foreground-muted hover:text-foreground'
          }`}
        >
          <Palette weight="bold" className="w-4 h-4" />
          <span>Apariencia y 6 Temas</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('opciones')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-xs font-semibold transition-colors min-h-[44px] whitespace-nowrap cursor-pointer ${
            activeTab === 'opciones'
              ? 'bg-brand-navy text-white shadow-xs'
              : 'text-foreground-muted hover:text-foreground'
          }`}
        >
          <Gear weight="bold" className="w-4 h-4" />
          <span>Opciones</span>
        </button>
      </div>

      {/* TAB 1: PERFIL */}
      {activeTab === 'perfil' && (
        <div className="space-y-6">
          <section className="bg-surface-card rounded-2xl border border-border-subtle p-6 sm:p-8 space-y-6">
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
              {currentUser.avatarUrl ? (
                <img src={currentUser.avatarUrl} alt="" className="w-16 h-16 rounded-2xl object-cover shrink-0" />
              ) : (
                <div
                  className="w-16 h-16 rounded-2xl flex items-center justify-center font-heading font-extrabold text-2xl text-white shadow-sm shrink-0"
                  style={{ backgroundColor: currentUser.colorAvatar }}
                >
                  {currentUser.iniciales}
                </div>
              )}

              <div>
                <h2 className="text-xl font-heading font-bold text-foreground">
                  {currentUser.nombre}
                </h2>
                <div className="text-sm font-semibold text-brand-gold">
                  {currentUser.cargo || 'Integrante del Centro'} · ISFDyT N° 26
                </div>
                <div className="text-xs text-foreground-muted mt-0.5 font-mono">
                  {currentUser.email}
                </div>
              </div>
            </div>

            {/* Aviso sobre datos no editables */}
            <div className="p-4 bg-surface rounded-xl border border-border-subtle flex items-start gap-3 text-xs text-foreground-muted">
              <Info weight="bold" className="w-5 h-5 text-brand-blue shrink-0 mt-0.5" />
              <div className="space-y-1">
                <strong className="text-foreground">Datos de la cuenta:</strong>
                <p>
                  El nombre y el email institucional los administra{' '}
                  <span className="text-brand-navy dark:text-brand-gold font-semibold">Dirección</span>. El cargo en
                  el Centro y la biografía los completás vos y se muestran en Miembros, el foro y los comunicados.
                </p>
              </div>
            </div>

            {editing ? (
              <form onSubmit={saveProfile} className="space-y-4 pt-2">
                <div className="space-y-1">
                  <label htmlFor="perfil-cargo" className="text-xs font-semibold text-foreground uppercase tracking-wide">
                    Cargo en el Centro
                  </label>
                  <input
                    id="perfil-cargo"
                    type="text"
                    maxLength={80}
                    value={cargo}
                    onChange={(e) => setCargo(e.target.value)}
                    placeholder="Ej.: Secretaría de Cultura"
                    className="w-full px-3 py-2 text-sm bg-surface rounded-lg border border-border-subtle"
                  />
                </div>
                <div className="space-y-1">
                  <label htmlFor="perfil-bio" className="text-xs font-semibold text-foreground uppercase tracking-wide">
                    Biografía
                  </label>
                  <textarea
                    id="perfil-bio"
                    rows={4}
                    maxLength={2000}
                    value={biografia}
                    onChange={(e) => setBiografia(e.target.value)}
                    placeholder="Contale a la comunidad quién sos y de qué te ocupás en el Centro."
                    className="w-full px-3 py-2 text-sm bg-surface rounded-lg border border-border-subtle font-sans"
                  />
                </div>
                <div className="flex items-center justify-end gap-2">
                  <Button type="button" variant="secondary" onClick={() => setEditing(false)} disabled={saving}>
                    Cancelar
                  </Button>
                  <Button type="submit" variant="accent-gold" loading={saving} disabled={saving}>
                    Guardar perfil
                  </Button>
                </div>
              </form>
            ) : (
              <div className="space-y-4 pt-2">
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-foreground uppercase tracking-wide">
                    Biografía
                  </label>
                  <div className="p-3 bg-surface rounded-lg border border-border-subtle text-xs text-foreground leading-relaxed whitespace-pre-wrap">
                    {currentUser.biografia || (
                      <span className="text-foreground-muted italic">Todavía no cargaste una biografía.</span>
                    )}
                  </div>
                </div>
              </div>
            )}

            <div className="pt-4 border-t border-border-subtle flex flex-wrap justify-end gap-2">
              {!editing && (
                <Button variant="secondary" icon={<Pencil weight="bold" className="w-4 h-4" />} onClick={startEdit}>
                  Editar cargo y biografía
                </Button>
              )}
              <Button
                variant="danger"
                icon={<SignOut weight="bold" className="w-4 h-4" />}
                onClick={() => setOpenLogoutModal(true)}
              >
                Cerrar sesión
              </Button>
            </div>
          </section>
        </div>
      )}

      {/* TAB 2: APARIENCIA */}
      {activeTab === 'apariencia' && (
        <div className="space-y-6">
          <section className="bg-surface-card rounded-2xl border border-border-subtle p-6 sm:p-8 space-y-6">
            <div className="space-y-1">
              <h2 className="text-lg font-heading font-bold text-foreground">
                Temas del Sistema (6 opciones)
              </h2>
              <p className="text-xs text-foreground-muted">
                Seleccioná el estilo visual que mejor se adapte a tu preferencia. Todos los temas cumplen con contraste WCAG AA.
              </p>
            </div>

            {/* Aviso de marca: no se tocan tipografías ni bordes */}
            <div className="p-3 bg-brand-gold/10 rounded-xl border border-brand-gold/20 text-xs text-foreground-muted">
              <strong>Identidad de marca:</strong> En Apariencia no se eligen tipografías ni estilos de borde porque son parte del Manual de Marca del ISFDyT N° 26.
            </div>

            {/* Grid de 6 temas */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {themesList.map((t) => {
                const isSelected = theme === t.id;
                return (
                  <button
                    key={t.id}
                    type="button"
                    onClick={() => setTheme(t.id)}
                    className={`p-4 rounded-xl border text-left transition-all relative flex flex-col justify-between space-y-3 cursor-pointer ${
                      isSelected
                        ? 'border-brand-gold bg-brand-gold/5 shadow-xs ring-2 ring-brand-gold/20'
                        : 'border-border-subtle bg-surface hover:border-brand-navy/40'
                    }`}
                  >
                    <div className="space-y-1">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-heading font-bold text-foreground">
                          {t.name}
                        </span>
                        {isSelected && (
                          <div className="w-5 h-5 rounded-full bg-brand-gold text-white flex items-center justify-center">
                            <Check weight="bold" className="w-3 h-3" />
                          </div>
                        )}
                      </div>
                      <p className="text-[11px] text-foreground-muted leading-relaxed">
                        {t.description}
                      </p>
                    </div>

                    {/* Paleta miniatura */}
                    <div className="flex items-center gap-1.5 pt-1">
                      {t.colors.map((c, i) => (
                        <div
                          key={i}
                          className="w-5 h-5 rounded-md border border-black/10 shrink-0"
                          style={{ backgroundColor: c }}
                        />
                      ))}
                    </div>
                  </button>
                );
              })}
            </div>

            {/* Accesibilidad: Tamaño de texto */}
            <div className="pt-6 border-t border-border-subtle space-y-3">
              <h3 className="text-xs font-bold text-foreground uppercase tracking-wider flex items-center gap-2">
                <TextAa weight="bold" className="w-4 h-4 text-brand-gold" />
                <span>Tamaño de texto</span>
              </h3>

              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => setTextSize('normal')}
                  className={`px-4 py-2.5 rounded-lg text-xs font-medium border min-h-[44px] transition-colors ${
                    textSize === 'normal'
                      ? 'bg-brand-navy text-white border-brand-navy'
                      : 'bg-surface text-foreground-muted border-border-subtle hover:text-foreground'
                  }`}
                >
                  Estándar (16px base)
                </button>
                <button
                  type="button"
                  onClick={() => setTextSize('large')}
                  className={`px-4 py-2.5 rounded-lg text-xs font-medium border min-h-[44px] transition-colors ${
                    textSize === 'large'
                      ? 'bg-brand-navy text-white border-brand-navy'
                      : 'bg-surface text-foreground-muted border-border-subtle hover:text-foreground'
                  }`}
                >
                  Grande (+12% accesibilidad)
                </button>
              </div>
            </div>

            {/* Accesibilidad: Reducción de movimiento */}
            <div className="pt-4 border-t border-border-subtle flex items-center justify-between gap-4">
              <div>
                <div className="text-xs font-bold text-foreground uppercase tracking-wide">
                  Reducir animaciones y movimiento
                </div>
                <div className="text-[11px] text-foreground-muted">
                  Desactiva transiciones complejas para usuarios con sensibilidad vestibular.
                </div>
              </div>

              <input
                type="checkbox"
                id="motion-toggle"
                checked={reducedMotion}
                onChange={(e) => setReducedMotion(e.target.checked)}
                className="w-5 h-5 rounded text-brand-navy focus:ring-brand-blue cursor-pointer"
              />
            </div>
          </section>
        </div>
      )}

      {/* TAB 3: OPCIONES */}
      {activeTab === 'opciones' && (
        <div className="space-y-6">
          <section className="bg-surface-card rounded-2xl border border-border-subtle p-6 sm:p-8 space-y-6">
            <div className="space-y-1">
              <h2 className="text-lg font-heading font-bold text-foreground">Notificaciones</h2>
              <p className="text-xs text-foreground-muted">
                El sistema te avisa en la campana cuando entra un reclamo, alguien se inscribe a un evento que
                creaste, denuncian un hilo del foro o te mandan un mensaje. Por ahora no se pueden elegir qué avisos
                recibir.
              </p>
            </div>

            {/* Video de Presentación Institucional */}
            <div className="pt-6 border-t border-border-subtle space-y-3">
              <div className="space-y-1">
                <h3 className="text-xs font-bold text-foreground uppercase tracking-wider">
                  Video de Presentación del Centro
                </h3>
                <p className="text-xs text-foreground-muted">
                  Volvé a reproducir la pantalla de presentación animada inicial con el loop institucional en video.
                </p>
              </div>

              <Button
                variant="accent-gold"
                icon={<VideoCamera weight="bold" className="w-4 h-4" />}
                onClick={() => setShowPresentation(true)}
              >
                Reproducir Video de Presentación
              </Button>
            </div>
          </section>
        </div>
      )}
    </div>
  );
};
