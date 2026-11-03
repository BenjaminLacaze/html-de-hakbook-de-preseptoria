import React, { useState } from 'react';
import {
  Megaphone,
  CheckCircle,
  Warning,
  Sparkle,
  CalendarCheck,
  Check,
} from '@phosphor-icons/react';
import { useAuxiliares } from '../context/AuxiliaresContext';
import { toast } from 'sonner';

export const ComunidadScreen: React.FC = () => {
  const { communityNotices, markNoticeRead } = useAuxiliares();
  const [filter, setFilter] = useState<'todos' | 'urgente' | 'novedades'>('todos');

  const filtered = communityNotices.filter((n) => {
    if (filter === 'urgente') return n.category === 'urgente';
    if (filter === 'novedades') return n.category === 'institucional';
    return true;
  });

  const handleMarkAsRead = async (id: string, title: string) => {
    if (await markNoticeRead(id)) {
      toast.success('Aviso marcado como leído', { description: `"${title}"` });
    }
  };

  return (
    <div className="space-y-6 pb-20 lg:pb-10">
      {/* Header */}
      <div>
        <span className="text-xs font-bold text-[#89743A] uppercase tracking-wider block">
          Comunicación interna
        </span>
        <h1 className="text-2xl sm:text-3xl font-heading font-extrabold text-slate-900 dark:text-slate-100">
          Comunidad y <span className="text-[#89743A]">Avisos</span>
        </h1>
        <div className="w-12 h-0.5 bg-[#89743A] mt-1" />
      </div>

      {/* Filter Chips */}
      <div className="flex gap-2">
        <button
          type="button"
          onClick={() => setFilter('todos')}
          className={`touch-target px-4 py-2 rounded-lg text-xs font-bold transition-all ${
            filter === 'todos'
              ? 'bg-[#14214F] text-white'
              : 'bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300'
          }`}
        >
          Todos los avisos ({communityNotices.length})
        </button>

        <button
          type="button"
          onClick={() => setFilter('urgente')}
          className={`touch-target px-4 py-2 rounded-lg text-xs font-bold transition-all ${
            filter === 'urgente'
              ? 'bg-red-600 text-white'
              : 'bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300'
          }`}
        >
          Urgentes e importantes
        </button>

        <button
          type="button"
          onClick={() => setFilter('novedades')}
          className={`touch-target px-4 py-2 rounded-lg text-xs font-bold transition-all ${
            filter === 'novedades'
              ? 'bg-[#3F78B6] text-white'
              : 'bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300'
          }`}
        >
          Novedades y eventos
        </button>
      </div>

      {/* List */}
      <div className="space-y-4">
        {filtered.length === 0 && (
          <div className="p-8 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-center">
            <Megaphone size={40} className="mx-auto mb-2 opacity-40 text-slate-400" />
            <p className="font-bold text-sm text-slate-600 dark:text-slate-300">
              No hay avisos publicados para vos
            </p>
          </div>
        )}
        {filtered.map((notice) => (
          <div
            key={notice.id}
            className={`p-5 rounded-xl border transition-all ${
              notice.category === 'urgente'
                ? 'bg-red-50/60 dark:bg-red-950/20 border-red-300 dark:border-red-800'
                : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700'
            } ${notice.read ? 'opacity-85' : 'shadow-xs'}`}
          >
            <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
              <div className="space-y-2 flex-1">
                <div className="flex items-center gap-2">
                  <span
                    className={`text-[11px] font-bold px-2 py-0.5 rounded uppercase tracking-wider ${
                      notice.category === 'urgente'
                        ? 'bg-red-600 text-white'
                        : 'bg-sky-100 text-[#14214F] dark:bg-sky-950 dark:text-sky-300'
                    }`}
                  >
                    {notice.categoryLabel}
                  </span>
                  {notice.priority && (
                    <span className="text-[11px] font-bold text-[#89743A] uppercase">Fijado</span>
                  )}
                  <span className="font-mono text-xs text-slate-400">{notice.date}</span>
                  {notice.read && (
                    <span className="text-[11px] font-medium text-emerald-600 flex items-center gap-1">
                      <Check size={14} /> Leído
                    </span>
                  )}
                </div>

                <h3 className="font-heading font-bold text-lg text-slate-900 dark:text-slate-100">
                  {notice.title}
                </h3>

                <p className="text-sm text-slate-700 dark:text-slate-300 leading-relaxed font-medium whitespace-pre-line">
                  {notice.message}
                </p>
              </div>

              {!notice.read && (
                <div className="shrink-0 pt-2 sm:pt-0">
                  <button
                    type="button"
                    onClick={() => handleMarkAsRead(notice.id, notice.title)}
                    className="touch-target px-3.5 py-2 rounded-lg border border-slate-300 dark:border-slate-700 text-xs font-bold text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 flex items-center gap-1.5"
                  >
                    <Check size={16} />
                    <span>Marcar como leído</span>
                  </button>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
