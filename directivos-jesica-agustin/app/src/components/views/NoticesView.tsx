import React, { useState, useMemo } from 'react';
import { useApp } from '../../context/AppContext';
import { OfficialNotice } from '../../types';
import {
  BellRing,
  Plus,
  Search,
  Filter,
  Send,
  Printer,
  Trash2,
  Edit2,
  CheckCircle,
  Clock,
  Archive,
  Eye,
  Pin,
  X,
  AlertCircle,
  FileText,
} from 'lucide-react';

export const NoticesView: React.FC = () => {
  const { notices, activeCycleId, activeUser, addNotice, updateNotice, deleteNotice, institutionSettings } = useApp();

  const [categoryFilter, setCategoryFilter] = useState<string>('TODAS');
  const [statusFilter, setStatusFilter] = useState<string>('TODOS');
  const [searchQuery, setSearchQuery] = useState('');

  // Modal
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingNotice, setEditingNotice] = useState<OfficialNotice | null>(null);
  const [formTitle, setFormTitle] = useState('');
  const [formContent, setFormContent] = useState('');
  const [formCategory, setFormCategory] = useState<OfficialNotice['category']>('INSTITUCIONAL');
  const [formRecipients, setFormRecipients] = useState<OfficialNotice['recipients']>('TODOS');
  const [formStatus, setFormStatus] = useState<OfficialNotice['status']>('PUBLICADO');
  const [formPinned, setFormPinned] = useState(false);
  const [formError, setFormError] = useState('');

  // View Printable Circular Modal
  const [printNotice, setPrintNotice] = useState<OfficialNotice | null>(null);

  const filteredNotices = useMemo(() => {
    return notices
      .filter((n) => n.cycleId === activeCycleId)
      .filter((n) => {
        const matchesCategory = categoryFilter === 'TODAS' || n.category === categoryFilter;
        const matchesStatus = statusFilter === 'TODOS' || n.status === statusFilter;
        const matchesSearch =
          n.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          n.content.toLowerCase().includes(searchQuery.toLowerCase());
        return matchesCategory && matchesStatus && matchesSearch;
      })
      .sort((a, b) => (b.isPinned ? 1 : 0) - (a.isPinned ? 1 : 0) || b.publishDate.localeCompare(a.publishDate));
  }, [notices, activeCycleId, categoryFilter, statusFilter, searchQuery]);

  const openCreateModal = () => {
    setEditingNotice(null);
    setFormTitle('');
    setFormContent('');
    setFormCategory('INSTITUCIONAL');
    setFormRecipients('TODOS');
    setFormStatus('PUBLICADO');
    setFormPinned(false);
    setFormError('');
    setIsModalOpen(true);
  };

  const openEditModal = (notice: OfficialNotice) => {
    setEditingNotice(notice);
    setFormTitle(notice.title);
    setFormContent(notice.content);
    setFormCategory(notice.category);
    setFormRecipients(notice.recipients);
    setFormStatus(notice.status);
    setFormPinned(notice.isPinned);
    setFormError('');
    setIsModalOpen(true);
  };

  const handleSaveNotice = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formTitle.trim() || !formContent.trim()) {
      setFormError('Complete el título y el cuerpo del comunicado.');
      return;
    }

    if (editingNotice) {
      updateNotice(editingNotice.id, {
        title: formTitle.trim(),
        content: formContent.trim(),
        category: formCategory,
        recipients: formRecipients,
        status: formStatus,
        isPinned: formPinned,
      });
    } else {
      addNotice({
        cycleId: activeCycleId,
        title: formTitle.trim(),
        content: formContent.trim(),
        category: formCategory,
        recipients: formRecipients,
        status: formStatus,
        authorName: activeUser.name,
        authorRole: activeUser.role === 'DIRECTIVO' ? 'Directora' : activeUser.role,
        isPinned: formPinned,
      });
    }
    setIsModalOpen(false);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-lg border border-slate-200 shadow-xs">
        <div>
          <div className="text-xs font-semibold uppercase tracking-wider text-[#89743A]">
            Comunicación Oficial e Interinstitucional
          </div>
          <h1 className="text-xl font-bold text-[#14214F] mt-0.5">
            Circulares y Comunicados Institucionales
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Redacción, publicación formal, control de lectura y archivo de disposiciones directivas.
          </p>
        </div>

        <button
          onClick={openCreateModal}
          className="px-4 py-2 bg-[#14214F] hover:bg-[#0A1128] text-white text-xs font-medium rounded transition-colors flex items-center gap-1.5 shadow-xs shrink-0 self-start sm:self-auto"
        >
          <Plus className="w-4 h-4 text-[#D4C08A]" />
          <span>Emitir Nueva Circular</span>
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 rounded-lg border border-slate-200 shadow-xs flex flex-col md:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            placeholder="Buscar por asunto o texto de la circular..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 text-xs rounded border border-slate-300 focus:outline-none focus:border-[#14214F]"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <div className="flex items-center gap-1 text-xs text-slate-500">
            <Filter className="w-3.5 h-3.5" />
            <span>Categoría:</span>
          </div>
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="text-xs py-1.5 px-2.5 rounded border border-slate-300 focus:outline-none focus:border-[#14214F]"
          >
            <option value="TODAS">Todas</option>
            <option value="URGENTE">Urgente</option>
            <option value="INSTITUCIONAL">Institucional</option>
            <option value="PEDAGOGICO">Pedagógico</option>
            <option value="ACADEMICO">Académico</option>
          </select>

          <div className="flex items-center gap-1 text-xs text-slate-500 ml-2">
            <span>Estado:</span>
          </div>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="text-xs py-1.5 px-2.5 rounded border border-slate-300 focus:outline-none focus:border-[#14214F]"
          >
            <option value="TODOS">Todos</option>
            <option value="PUBLICADO">Publicados</option>
            <option value="BORRADOR">Borradores</option>
            <option value="ARCHIVADO">Archivados</option>
          </select>
        </div>
      </div>

      {/* Notices Grid */}
      <div className="space-y-3.5">
        {filteredNotices.length === 0 ? (
          <div className="bg-white rounded-lg border border-slate-200 p-12 text-center text-slate-400 text-xs">
            No se encontraron comunicados que coincidan con la búsqueda.
          </div>
        ) : (
          filteredNotices.map((n) => (
            <div
              key={n.id}
              className={`bg-white rounded-lg border p-5 shadow-xs transition-all ${
                n.isPinned ? 'border-[#89743A]/40 ring-1 ring-[#89743A]/10' : 'border-slate-200'
              }`}
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-slate-100">
                <div className="flex items-center gap-2 flex-wrap">
                  {n.isPinned && (
                    <span className="text-[11px] font-semibold text-[#89743A] flex items-center gap-1">
                      <Pin className="w-3.5 h-3.5" />
                      Fijado
                    </span>
                  )}
                  <span
                    className={`text-[10px] font-bold px-2 py-0.5 rounded uppercase tracking-wider ${
                      n.category === 'URGENTE'
                        ? 'bg-red-50 text-red-800'
                        : n.category === 'PEDAGOGICO'
                        ? 'bg-blue-50 text-blue-800'
                        : 'bg-amber-50 text-amber-800'
                    }`}
                  >
                    {n.category}
                  </span>
                  <span className="text-xs text-slate-500 font-sans">
                    Destinatarios: <strong>{n.recipients}</strong>
                  </span>
                  <span aria-hidden="true" className="text-slate-300">·</span>
                  <span className="text-xs text-slate-500 font-mono tabular-nums">
                    Fecha: {n.publishDate}
                  </span>
                </div>

                <div className="flex items-center gap-1.5 self-end sm:self-auto">
                  <span
                    className={`text-[11px] font-medium px-2 py-0.5 rounded ${
                      n.status === 'PUBLICADO'
                        ? 'text-emerald-800 bg-emerald-50'
                        : n.status === 'BORRADOR'
                        ? 'text-slate-600 bg-slate-100'
                        : 'text-slate-400 bg-slate-50'
                    }`}
                  >
                    {n.status}
                  </span>
                  <button
                    onClick={() => setPrintNotice(n)}
                    className="p-1 text-slate-500 hover:text-[#14214F] hover:bg-slate-100 rounded"
                    title="Vista imprimible con membrete"
                  >
                    <Eye className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => openEditModal(n)}
                    className="p-1 text-slate-500 hover:text-[#14214F] hover:bg-slate-100 rounded"
                    title="Editar comunicado"
                  >
                    <Edit2 className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => deleteNotice(n.id)}
                    className="p-1 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded"
                    title="Eliminar comunicado"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>

              <div className="pt-3">
                <h3 className="text-base font-bold text-[#14214F] mb-1.5">
                  {n.title}
                </h3>
                <p className="text-xs text-slate-700 whitespace-pre-line leading-relaxed">
                  {n.content}
                </p>
              </div>

              <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-400">
                <div>
                  Emisor: <strong className="text-slate-600">{n.authorName}</strong> ({n.authorRole})
                </div>
                <div className="font-mono tabular-nums">
                  {n.readCount} confirmaciones de lectura registradas
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Create / Edit Notice Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-slate-900/60 z-50 flex items-center justify-center p-4 backdrop-blur-xs">
          <div className="bg-white rounded-lg border border-slate-200 shadow-xl max-w-lg w-full overflow-hidden animate-in fade-in">
            <div className="px-5 py-4 bg-[#14214F] text-white flex items-center justify-between">
              <div>
                <h3 className="text-base font-bold text-white">
                  {editingNotice ? 'Modificar Circular Oficial' : 'Redactar Nueva Circular'}
                </h3>
                <p className="text-xs text-[#D4C08A]">ISFDyT N.° 26 · Registro de Disposiciones</p>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-white/70 hover:text-white p-1 rounded"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveNotice} className="p-5 space-y-3.5 text-xs">
              {formError && (
                <div className="p-3 bg-red-50 border border-red-200 rounded text-red-700 flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{formError}</span>
                </div>
              )}

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Título / Asunto de la Circular *
                </label>
                <input
                  type="text"
                  required
                  placeholder="Ej: Circular N.° 15/2026: Disposiciones de Cierre..."
                  value={formTitle}
                  onChange={(e) => setFormTitle(e.target.value)}
                  className="w-full px-3 py-1.5 rounded border border-slate-300 focus:outline-none focus:border-[#14214F] text-xs"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Categoría</label>
                  <select
                    value={formCategory}
                    onChange={(e) => setFormCategory(e.target.value as OfficialNotice['category'])}
                    className="w-full px-3 py-1.5 rounded border border-slate-300 text-xs"
                  >
                    <option value="INSTITUCIONAL">Institucional</option>
                    <option value="URGENTE">Urgente</option>
                    <option value="PEDAGOGICO">Pedagógico</option>
                    <option value="ACADEMICO">Académico</option>
                  </select>
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Destinatarios</label>
                  <select
                    value={formRecipients}
                    onChange={(e) => setFormRecipients(e.target.value as OfficialNotice['recipients'])}
                    className="w-full px-3 py-1.5 rounded border border-slate-300 text-xs"
                  >
                    <option value="TODOS">Toda la Comunidad</option>
                    <option value="DOCENTES">Solo Cuerpo Docente</option>
                    <option value="PRECEPTORES">Preceptores</option>
                    <option value="FAMILIAS">Alumnos y Familias</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Cuerpo del Comunicado *
                </label>
                <textarea
                  rows={5}
                  required
                  placeholder="Texto oficial del comunicado, pautas, plazos y fundamentación..."
                  value={formContent}
                  onChange={(e) => setFormContent(e.target.value)}
                  className="w-full px-3 py-2 rounded border border-slate-300 focus:outline-none focus:border-[#14214F] text-xs leading-relaxed"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Estado de Emisión</label>
                  <select
                    value={formStatus}
                    onChange={(e) => setFormStatus(e.target.value as OfficialNotice['status'])}
                    className="w-full px-3 py-1.5 rounded border border-slate-300 text-xs"
                  >
                    <option value="PUBLICADO">Publicado (Visible)</option>
                    <option value="BORRADOR">Borrador (Solo directivos)</option>
                    <option value="ARCHIVADO">Archivado</option>
                  </select>
                </div>
                <div className="flex items-center gap-2 pt-6">
                  <input
                    type="checkbox"
                    id="pinnedNotice"
                    checked={formPinned}
                    onChange={(e) => setFormPinned(e.target.checked)}
                    className="rounded border-slate-300 text-[#14214F]"
                  />
                  <label htmlFor="pinnedNotice" className="text-slate-700">
                    Fijar al inicio del tablero
                  </label>
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-3 py-2 text-slate-700 hover:bg-slate-100 rounded text-xs transition-colors"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-[#14214F] hover:bg-[#0A1128] text-white rounded text-xs font-medium transition-colors shadow-xs"
                >
                  {editingNotice ? 'Guardar Cambios' : 'Emitir Circular'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Printable Circular Modal */}
      {printNotice && (
        <div className="fixed inset-0 bg-slate-900/60 z-50 flex items-center justify-center p-4 backdrop-blur-xs">
          <div className="bg-white rounded-lg border border-slate-200 shadow-xl max-w-2xl w-full overflow-hidden animate-in fade-in">
            <div className="px-5 py-4 bg-[#14214F] text-white flex items-center justify-between no-print">
              <div>
                <h3 className="text-base font-bold text-white">Vista Oficial Imprimible</h3>
                <p className="text-xs text-[#D4C08A]">Membrete Institucional ISFDyT N.° 26</p>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => window.print()}
                  className="px-3 py-1 bg-white/10 hover:bg-white/20 text-white rounded text-xs flex items-center gap-1"
                >
                  <Printer className="w-3.5 h-3.5" />
                  <span>Imprimir</span>
                </button>
                <button
                  onClick={() => setPrintNotice(null)}
                  className="text-white/70 hover:text-white p-1 rounded"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            <div className="p-8 space-y-6 text-slate-800 text-xs">
              {/* Membrete */}
              <div className="border-b-2 border-[#14214F] pb-4 flex items-center justify-between">
                <div>
                  <div className="text-[11px] font-semibold text-[#89743A] uppercase tracking-wider">
                    Dirección General de Cultura y Educación · Provincia de Buenos Aires
                  </div>
                  <h2 className="text-base font-bold text-[#14214F] font-heading mt-0.5">
                    {institutionSettings.name}
                  </h2>
                  <div className="text-[11px] text-slate-500 font-mono">
                    Distrito Dolores · Región 18 · CUE: {institutionSettings.cue}
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-xs font-bold text-[#14214F]">DISPOSICIÓN DIRECTIVA</div>
                  <div className="text-[11px] text-slate-500 font-mono">Fecha: {printNotice.publishDate}</div>
                </div>
              </div>

              <div>
                <div className="text-[11px] text-slate-500 mb-1">
                  Destinatarios: <strong>{printNotice.recipients}</strong>
                </div>
                <h1 className="text-base font-bold text-[#14214F] mb-3">
                  {printNotice.title}
                </h1>
                <p className="text-xs text-slate-700 whitespace-pre-line leading-relaxed text-justify">
                  {printNotice.content}
                </p>
              </div>

              <div className="pt-12 flex justify-end">
                <div className="text-center w-64 border-t border-slate-300 pt-2 text-xs">
                  <div className="font-bold text-slate-900">{printNotice.authorName}</div>
                  <div className="text-slate-600">{printNotice.authorRole}</div>
                  <div className="text-[10px] text-slate-400 mt-0.5">Firma y Sello Oficial</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
