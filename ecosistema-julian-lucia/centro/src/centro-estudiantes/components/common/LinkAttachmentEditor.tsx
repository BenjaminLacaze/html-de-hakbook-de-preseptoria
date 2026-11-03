/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * ISFDyT N° 26 - Adjuntos por enlace (la API todavía no tiene subida de archivos)
 */

import React, { useState } from 'react';
import { FilePdf, FileText, ImageSquare, Info, LinkSimple, Plus, Trash } from '@phosphor-icons/react';
import { toast } from 'sonner';
import { AdjuntoItem } from '../../types';

interface LinkAttachmentEditorProps {
  attachments: AdjuntoItem[];
  onChange: (attachments: AdjuntoItem[]) => void;
  maxFiles?: number;
}

export const isHttpUrl = (value: string) => {
  try {
    const u = new URL(value.trim());
    return u.protocol === 'https:' || u.protocol === 'http:';
  } catch {
    return false;
  }
};

export const AttachmentIcon: React.FC<{ tipo: AdjuntoItem['tipo']; className?: string }> = ({ tipo, className = 'w-5 h-5' }) =>
  tipo === 'pdf' ? (
    <FilePdf weight="fill" className={`${className} text-rose-600`} />
  ) : tipo === 'imagen' ? (
    <ImageSquare weight="fill" className={`${className} text-brand-blue`} />
  ) : (
    <FileText weight="fill" className={`${className} text-brand-gold`} />
  );

/** Aviso único para todos los lugares donde antes se subían archivos. */
export const NoUploadNotice: React.FC<{ what?: string }> = ({ what = 'archivos' }) => (
  <div className="p-3 bg-brand-blue/5 rounded-lg border border-brand-blue/20 text-[11px] text-foreground-muted flex items-start gap-2">
    <Info weight="bold" className="w-4 h-4 text-brand-blue shrink-0 mt-0.5" />
    <span>
      Todavía no se pueden subir {what} al sistema. Pegá un <strong className="text-foreground">enlace (URL)</strong>{' '}
      público, por ejemplo de Google Drive o del sitio del Instituto.
    </span>
  </div>
);

export const LinkAttachmentEditor: React.FC<LinkAttachmentEditorProps> = ({ attachments, onChange, maxFiles = 10 }) => {
  const [nombre, setNombre] = useState('');
  const [url, setUrl] = useState('');
  const [tipo, setTipo] = useState<AdjuntoItem['tipo']>('pdf');

  const add = () => {
    if (!nombre.trim() || !url.trim()) {
      toast.error('Completá el nombre y el enlace del adjunto.');
      return;
    }
    if (!isHttpUrl(url)) {
      toast.error('El enlace tiene que empezar con https:// (o http://).');
      return;
    }
    if (attachments.length >= maxFiles) {
      toast.error(`Se permite un máximo de ${maxFiles} adjuntos por publicación.`);
      return;
    }
    onChange([
      ...attachments,
      { id: `nuevo-${Date.now()}-${attachments.length}`, nombre: nombre.trim(), url: url.trim(), tipo },
    ]);
    setNombre('');
    setUrl('');
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <label className="text-xs font-semibold text-foreground tracking-wide uppercase">
          Adjuntos por enlace ({attachments.length}/{maxFiles})
        </label>
      </div>

      <NoUploadNotice />

      {attachments.length < maxFiles && (
        <div className="p-3 bg-surface/50 rounded-xl border border-dashed border-border-subtle space-y-2">
          <div className="grid grid-cols-1 sm:grid-cols-[1fr_9rem] gap-2">
            <input
              type="text"
              value={nombre}
              onChange={(e) => setNombre(e.target.value)}
              placeholder="Nombre visible (ej.: Cronograma de mesas.pdf)"
              aria-label="Nombre del adjunto"
              className="w-full px-3 py-2 text-xs bg-surface-card rounded-md border border-border-subtle"
            />
            <select
              value={tipo}
              onChange={(e) => setTipo(e.target.value as AdjuntoItem['tipo'])}
              aria-label="Tipo de adjunto"
              className="w-full px-3 py-2 text-xs bg-surface-card rounded-md border border-border-subtle"
            >
              <option value="pdf">PDF</option>
              <option value="imagen">Imagen</option>
              <option value="documento">Documento</option>
            </select>
          </div>
          <div className="flex gap-2">
            <input
              type="url"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder="https://…"
              aria-label="Enlace (URL) del adjunto"
              className="flex-1 min-w-0 px-3 py-2 text-xs bg-surface-card rounded-md border border-border-subtle font-mono"
            />
            <button
              type="button"
              onClick={add}
              className="px-3 rounded-md bg-brand-navy text-white text-xs font-semibold flex items-center gap-1.5 min-h-[44px] hover:bg-[#1C2E6B] focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-blue"
            >
              <Plus weight="bold" className="w-4 h-4" />
              Agregar
            </button>
          </div>
        </div>
      )}

      {attachments.length > 0 && (
        <ul className="space-y-2">
          {attachments.map((item) => (
            <li
              key={item.id}
              className="flex items-center justify-between p-2.5 bg-surface rounded-lg border border-border-subtle gap-3 text-xs"
            >
              <div className="flex items-center gap-2.5 min-w-0">
                <div className="p-2 rounded bg-surface-card border border-border-subtle shrink-0">
                  <AttachmentIcon tipo={item.tipo} />
                </div>
                <div className="min-w-0">
                  <div className="font-medium text-foreground truncate max-w-[200px] sm:max-w-xs">{item.nombre}</div>
                  <a
                    href={item.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-[11px] text-brand-blue font-mono truncate max-w-[200px] sm:max-w-xs hover:underline flex items-center gap-1"
                  >
                    <LinkSimple weight="bold" className="w-3 h-3 shrink-0" />
                    <span className="truncate">{item.url}</span>
                  </a>
                </div>
              </div>

              <button
                type="button"
                onClick={() => onChange(attachments.filter((a) => a.id !== item.id))}
                aria-label={`Quitar ${item.nombre}`}
                className="p-2 text-foreground-muted hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 rounded-md transition-colors min-w-[44px] min-h-[44px] flex items-center justify-center focus:outline-none focus-visible:ring-2 focus-visible:ring-rose-500"
              >
                <Trash weight="bold" className="w-4 h-4" />
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};
