/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * ISFDyT N° 26 - Miembros del Centro de Estudiantes y Vista Pública
 *
 * Integrantes = cuentas con rol de Centro en el directorio institucional (GET /social/directory),
 * con cargo y biografía de su perfil. "Escribir" manda un mensaje interno (POST /social/messages).
 */

import React, { useState } from 'react';
import { Envelope, Eye, UsersThree } from '@phosphor-icons/react';
import { useCentro } from '../../context/CentroContext';
import { MiembroCentro } from '../../types';
import { Button } from '../common/Button';
import { Dialog } from '../common/Dialog';

const Avatar: React.FC<{ member: MiembroCentro }> = ({ member }) =>
  member.avatarUrl ? (
    <img src={member.avatarUrl} alt="" className="w-13 h-13 rounded-2xl object-cover shrink-0" />
  ) : (
    <div
      className="w-13 h-13 rounded-2xl flex items-center justify-center font-heading font-bold text-lg text-white shadow-xs shrink-0"
      style={{ backgroundColor: member.colorAvatar }}
    >
      {member.iniciales}
    </div>
  );

export const MiembrosScreen: React.FC = () => {
  const { members, currentUser, sendMessage } = useCentro();

  const [publicViewMode, setPublicViewMode] = useState(false);
  const [contactMember, setContactMember] = useState<MiembroCentro | null>(null);

  // Form states
  const [senderSubject, setSenderSubject] = useState('');
  const [senderMessage, setSenderMessage] = useState('');
  const [sending, setSending] = useState(false);

  const handleSendContactMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!contactMember || !senderSubject.trim() || !senderMessage.trim()) {
      alert('Por favor completá los campos del formulario.');
      return;
    }
    setSending(true);
    const ok = await sendMessage(contactMember.id, `Asunto: ${senderSubject.trim()}\n\n${senderMessage.trim()}`);
    setSending(false);
    if (!ok) return;
    setContactMember(null);
    setSenderSubject('');
    setSenderMessage('');
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="text-[11px] font-bold text-brand-gold uppercase tracking-widest">
            EQUIPO DE CONDUCCIÓN
          </div>
          <h1 className="text-2xl sm:text-3xl font-heading font-extrabold text-foreground">
            Miembros del <span className="text-brand-gold">Centro de Estudiantes</span>
          </h1>
          <div className="brand-fillet mt-2" />
        </div>

        {/* Vista: Cómo lo ve la comunidad */}
        <Button
          variant={publicViewMode ? 'primary' : 'secondary'}
          icon={<Eye weight="bold" className="w-4 h-4" />}
          onClick={() => setPublicViewMode(!publicViewMode)}
        >
          {publicViewMode ? 'Volver a modo gestión' : 'Cómo lo ve la comunidad'}
        </Button>
      </div>

      {publicViewMode && (
        <div className="p-4 bg-brand-gold/15 rounded-xl border border-brand-gold/30 flex items-center justify-between text-xs text-brand-gold-sand">
          <div>
            <strong className="text-foreground">Modo vista pública activo:</strong> Así ven los estudiantes a los
            integrantes del Centro (sin acciones de gestión).
          </div>
          <button
            type="button"
            onClick={() => setPublicViewMode(false)}
            className="text-brand-navy dark:text-white font-bold underline"
          >
            Salir de la vista previa
          </button>
        </div>
      )}

      {!publicViewMode && (
        <p className="text-xs text-foreground-muted">
          El cargo y la biografía salen del perfil de cada integrante. Cada uno los completa desde su perfil del
          sistema.
        </p>
      )}

      {members.length === 0 ? (
        <div className="p-12 text-center bg-surface-card rounded-xl border border-border-subtle space-y-3">
          <UsersThree weight="bold" className="w-10 h-10 text-brand-gold mx-auto" />
          <h3 className="text-base font-semibold text-foreground">No hay integrantes cargados</h3>
          <p className="text-xs text-foreground-muted max-w-sm mx-auto">
            Las cuentas del Centro las da de alta Dirección desde el panel de Directivos.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {members.map((member) => {
            const esYo = member.id === currentUser.id;
            return (
              <div
                key={member.id}
                className="bg-surface-card rounded-2xl border border-border-subtle p-5 sm:p-6 flex flex-col justify-between space-y-4 hover:border-brand-gold/60 transition-colors shadow-xs"
              >
                <div className="space-y-3">
                  {/* Header with avatar & role */}
                  <div className="flex items-start gap-3.5">
                    <Avatar member={member} />

                    <div className="min-w-0">
                      <h3 className="text-base font-heading font-bold text-foreground truncate">
                        {member.nombre}
                        {esYo && <span className="text-[11px] font-sans font-medium text-foreground-muted"> (vos)</span>}
                      </h3>
                      <div className="text-xs font-semibold text-brand-gold truncate">
                        {member.cargo || 'Integrante del Centro'}
                      </div>
                    </div>
                  </div>

                  {/* Bio */}
                  <p className="text-xs text-foreground-muted leading-relaxed line-clamp-3">
                    {member.biografia || (publicViewMode ? '' : 'Sin biografía cargada en el perfil.')}
                  </p>
                </div>

                {/* Contacto interno (no se muestran emails personales) */}
                <div className="pt-3 border-t border-border-subtle flex items-center justify-between gap-2">
                  <span className="text-[11px] text-foreground-muted truncate">Mensaje interno del sistema</span>

                  {!esYo && (
                    <Button
                      size="sm"
                      variant="secondary"
                      icon={<Envelope weight="bold" className="w-3.5 h-3.5" />}
                      onClick={() => setContactMember(member)}
                    >
                      Escribir
                    </Button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* MODAL ESCRIBIR */}
      <Dialog
        isOpen={!!contactMember}
        onClose={() => setContactMember(null)}
        title={`Escribir a ${contactMember?.nombre || 'un integrante'}`}
        description="El mensaje le llega a su bandeja de mensajes del sistema, con tu nombre como remitente."
        maxWidth="sm"
      >
        <form onSubmit={handleSendContactMessage} className="space-y-4">
          <div className="p-3 bg-surface rounded-lg border border-border-subtle text-xs text-foreground-muted">
            Destinatario: <strong className="text-foreground">{contactMember?.nombre}</strong>
            {contactMember?.cargo && ` (${contactMember.cargo})`}
            <div className="text-[11px] mt-0.5">
              Remitente: <strong className="text-foreground">{currentUser.nombre}</strong>
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-xs font-semibold text-foreground uppercase tracking-wide">Asunto *</label>
            <input
              type="text"
              required
              value={senderSubject}
              onChange={(e) => setSenderSubject(e.target.value)}
              placeholder="Ej.: Consulta sobre cupos para taller"
              className="w-full px-3 py-2 text-xs bg-surface rounded-lg border border-border-subtle"
            />
          </div>

          <div className="space-y-1">
            <label className="text-xs font-semibold text-foreground uppercase tracking-wide">
              Mensaje o propuesta *
            </label>
            <textarea
              rows={4}
              required
              maxLength={3900}
              value={senderMessage}
              onChange={(e) => setSenderMessage(e.target.value)}
              placeholder="Escribí tu consulta..."
              className="w-full px-3 py-2 text-xs bg-surface rounded-lg border border-border-subtle font-sans"
            />
          </div>

          <div className="flex items-center justify-end gap-2 pt-2 border-t border-border-subtle">
            <Button variant="secondary" type="button" onClick={() => setContactMember(null)}>
              Cancelar
            </Button>
            <Button variant="accent-gold" type="submit" loading={sending} disabled={sending}>
              Enviar mensaje
            </Button>
          </div>
        </form>
      </Dialog>
    </div>
  );
};
