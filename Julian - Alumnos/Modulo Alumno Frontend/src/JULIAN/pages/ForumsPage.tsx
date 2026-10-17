import React, { useState } from 'react';
import {
  MessageSquare,
  Search,
  PlusCircle,
  ThumbsUp,
  Tag,
  Clock,
  User,
  Send,
  X,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';
import { usePortal } from '../context/PortalContext';
import { getBorderRadiusClass } from '../styles/themes';
import { ForumTopic } from '../types';

export const ForumsPage: React.FC = () => {
  const { forums, subjects, postReply, createTopic, student, appearance, themeColors } = usePortal();
  const radius = getBorderRadiusClass(appearance.borderStyle);

  const [selectedTopic, setSelectedTopic] = useState<ForumTopic | null>(forums[0] || null);
  const [replyContent, setReplyContent] = useState('');
  const [isPostingReply, setIsPostingReply] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [isNewTopicModalOpen, setIsNewTopicModalOpen] = useState(false);

  // New topic form state
  const [newTitle, setNewTitle] = useState('');
  const [newContent, setNewContent] = useState('');
  const [newSubject, setNewSubject] = useState(subjects[0]?.name || 'Programación II');
  const [newTags, setNewTags] = useState('');

  const filteredForums = forums.filter(
    (t) =>
      t.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      t.subjectName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      t.content.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleReplySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!replyContent.trim() || !selectedTopic) return;

    setIsPostingReply(true);
    await postReply(selectedTopic.id, replyContent);
    setIsPostingReply(false);
    setReplyContent('');

    // Update active view
    const updated = forums.find((f) => f.id === selectedTopic.id);
    if (updated) setSelectedTopic(updated);
  };

  const handleCreateTopic = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim() || !newContent.trim()) return;

    const tagsArray = newTags
      .split(',')
      .map((t) => t.trim())
      .filter((t) => t.length > 0);

    await createTopic(newTitle, newContent, newSubject, tagsArray);
    setIsNewTopicModalOpen(false);
    setNewTitle('');
    setNewContent('');
    setNewTags('');
  };

  // Keep selectedTopic updated if forums state changes
  const activeTopic = selectedTopic
    ? forums.find((f) => f.id === selectedTopic.id) || selectedTopic
    : null;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div
        style={{
          backgroundColor: themeColors.bgCard,
          borderColor: themeColors.borderSubtle
        }}
        className={`p-6 border shadow-xs ${radius.card}`}
      >
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <span
              style={{ color: themeColors.accentGold }}
              className="text-xs font-bold uppercase tracking-wider block mb-1"
            >
              Espacio de Intercambio Académico · Instituto 26
            </span>
            <h1 style={{ color: themeColors.textPrimary }} className="text-2xl font-extrabold tracking-tight">
              Foros de Consulta y Cátedra
            </h1>
            <p style={{ color: themeColors.textMuted }} className="text-xs mt-1">
              Debates técnicos, consultas de trabajos prácticos y coordinación entre estudiantes y docentes
            </p>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            <button
              onClick={() => setIsNewTopicModalOpen(true)}
              style={{
                backgroundColor: themeColors.accentGold,
                color: '#FFFFFF'
              }}
              className={`flex items-center gap-1.5 px-4 py-2.5 text-xs font-bold shadow-xs hover:opacity-95 transition-opacity ${radius.button}`}
            >
              <PlusCircle className="w-4 h-4" />
              <span>Abrir Nuevo Debate</span>
            </button>
          </div>
        </div>
      </div>

      {/* Main Forum Split: Left List, Right Thread */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: Topics List (5 cols) */}
        <div className="lg:col-span-5 space-y-3">
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Buscar en debates..."
              style={{
                backgroundColor: themeColors.bgCard,
                borderColor: themeColors.borderSubtle,
                color: themeColors.textPrimary
              }}
              className={`w-full pl-9 pr-3 py-2 text-xs border focus:outline-none ${radius.inner}`}
            />
          </div>

          <div className="space-y-2.5">
            {filteredForums.map((topic) => {
              const isSelected = activeTopic?.id === topic.id;
              return (
                <div
                  key={topic.id}
                  onClick={() => setSelectedTopic(topic)}
                  style={{
                    backgroundColor: isSelected ? themeColors.accentSurface : themeColors.bgCard,
                    borderColor: isSelected ? themeColors.accentGold : themeColors.borderSubtle
                  }}
                  className={`p-4 border transition-all cursor-pointer ${radius.card} space-y-2`}
                >
                  <div className="flex items-center justify-between text-[11px]">
                    <span
                      style={{ color: themeColors.accentText }}
                      className="font-bold truncate max-w-[200px]"
                    >
                      {topic.subjectName}
                    </span>
                    <span style={{ color: themeColors.textMuted }} className="tabular-nums">
                      {topic.createdAt}
                    </span>
                  </div>

                  <h3
                    style={{ color: themeColors.textPrimary }}
                    className={`text-xs ${isSelected ? 'font-extrabold' : 'font-bold'} line-clamp-2`}
                  >
                    {topic.title}
                  </h3>

                  <div className="flex items-center justify-between text-[11px] pt-1" style={{ color: themeColors.textMuted }}>
                    <span>{topic.authorName}</span>
                    <span className="font-semibold text-amber-600 dark:text-amber-400">
                      {topic.replies.length} respuestas
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right: Active Thread View (7 cols) */}
        <div className="lg:col-span-7">
          {activeTopic ? (
            <div
              style={{
                backgroundColor: themeColors.bgCard,
                borderColor: themeColors.borderSubtle
              }}
              className={`p-6 border shadow-xs ${radius.card} space-y-6`}
            >
              {/* Thread Header */}
              <div className="border-b pb-4 space-y-2" style={{ borderColor: themeColors.borderSubtle }}>
                <div className="flex items-center gap-2">
                  <span
                    style={{
                      backgroundColor: themeColors.accentSurface,
                      color: themeColors.accentText
                    }}
                    className="text-xs font-semibold px-2 py-0.5 rounded"
                  >
                    {activeTopic.subjectName}
                  </span>
                  <span style={{ color: themeColors.textMuted }} className="text-xs">
                    · Publicado {activeTopic.createdAt}
                  </span>
                </div>

                <h2 style={{ color: themeColors.textPrimary }} className="text-base font-extrabold">
                  {activeTopic.title}
                </h2>

                <div className="flex items-center gap-2 text-xs" style={{ color: themeColors.textSecondary }}>
                  <User className="w-3.5 h-3.5 text-slate-400" />
                  <span className="font-semibold">{activeTopic.authorName}</span>
                  <span className="text-slate-400">({activeTopic.authorRole})</span>
                </div>

                <p style={{ color: themeColors.textPrimary }} className="text-xs mt-3 leading-relaxed whitespace-pre-line">
                  {activeTopic.content}
                </p>

                {/* Tags */}
                <div className="flex flex-wrap items-center gap-1.5 pt-2">
                  {activeTopic.tags.map((tag, idx) => (
                    <span
                      key={idx}
                      style={{
                        backgroundColor: themeColors.bgSubtle,
                        color: themeColors.textMuted
                      }}
                      className="text-[10px] px-2 py-0.5 rounded font-mono"
                    >
                      #{tag}
                    </span>
                  ))}
                </div>
              </div>

              {/* Replies Section */}
              <div className="space-y-4">
                <h4 style={{ color: themeColors.textPrimary }} className="text-xs font-bold uppercase tracking-wider">
                  Respuestas del debate ({activeTopic.replies.length})
                </h4>

                <div className="space-y-3">
                  {activeTopic.replies.map((reply) => (
                    <div
                      key={reply.id}
                      style={{
                        backgroundColor: reply.isCurrentUser ? themeColors.accentSurface + '40' : themeColors.bgSubtle,
                        borderColor: themeColors.borderSubtle
                      }}
                      className={`p-4 border ${radius.inner} space-y-2`}
                    >
                      <div className="flex items-center justify-between text-xs">
                        <div className="flex items-center gap-2">
                          <span style={{ color: themeColors.textPrimary }} className="font-bold">
                            {reply.authorName}
                          </span>
                          <span style={{ color: themeColors.accentGold }} className="text-[11px] font-medium">
                            ({reply.authorRole})
                          </span>
                        </div>
                        <span style={{ color: themeColors.textMuted }} className="text-[10px] tabular-nums">
                          {reply.createdAt}
                        </span>
                      </div>

                      <p style={{ color: themeColors.textSecondary }} className="text-xs leading-relaxed whitespace-pre-line">
                        {reply.content}
                      </p>
                    </div>
                  ))}
                </div>

                {/* Reply Form */}
                <form onSubmit={handleReplySubmit} className="pt-2 space-y-3">
                  <textarea
                    rows={3}
                    value={replyContent}
                    onChange={(e) => setReplyContent(e.target.value)}
                    placeholder="Escribí tu respuesta o aporte a esta consulta..."
                    style={{
                      backgroundColor: themeColors.bgPage,
                      borderColor: themeColors.borderSubtle,
                      color: themeColors.textPrimary
                    }}
                    className={`w-full p-3 text-xs border focus:outline-none focus:ring-1 focus:ring-amber-500 ${radius.inner}`}
                  />
                  <div className="flex justify-between items-center">
                    <span style={{ color: themeColors.textMuted }} className="text-[11px] italic">
                      Demostración local: los aportes se guardan en el navegador.
                    </span>
                    <button
                      type="submit"
                      disabled={isPostingReply || !replyContent.trim()}
                      style={{
                        backgroundColor: themeColors.accentGold,
                        color: '#FFFFFF'
                      }}
                      className={`flex items-center gap-1.5 px-4 py-2 text-xs font-semibold disabled:opacity-50 ${radius.button}`}
                    >
                      <Send className="w-3.5 h-3.5" />
                      <span>{isPostingReply ? 'Publicando...' : 'Publicar Respuesta'}</span>
                    </button>
                  </div>
                </form>
              </div>
            </div>
          ) : (
            <div
              style={{
                backgroundColor: themeColors.bgCard,
                borderColor: themeColors.borderSubtle
              }}
              className={`p-12 border text-center ${radius.card}`}
            >
              <MessageSquare className="w-8 h-8 mx-auto text-slate-400 mb-2" />
              <p style={{ color: themeColors.textMuted }} className="text-xs">
                Seleccioná un debate del listado para consultar sus respuestas.
              </p>
            </div>
          )}
        </div>
      </div>

      {/* New Topic Modal */}
      {isNewTopicModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div
            style={{
              backgroundColor: themeColors.bgCard,
              borderColor: themeColors.borderSubtle
            }}
            className={`w-full max-w-lg border p-6 shadow-2xl relative ${radius.card}`}
          >
            <button
              onClick={() => setIsNewTopicModalOpen(false)}
              className="absolute top-4 right-4 p-1.5 text-slate-400 hover:text-slate-600 rounded-lg"
              aria-label="Cerrar modal de nuevo debate"
            >
              <X className="w-5 h-5" />
            </button>

            <h3 style={{ color: themeColors.textPrimary }} className="text-base font-bold mb-1">
              Abrir Nuevo Debate Académico
            </h3>
            <p style={{ color: themeColors.textMuted }} className="text-xs mb-4">
              Iniciá una consulta para tu comisión o cátedra correspondiente
            </p>

            <form onSubmit={handleCreateTopic} className="space-y-3.5">
              <div>
                <label style={{ color: themeColors.textPrimary }} className="block text-xs font-semibold mb-1">
                  Materia o Espacio *
                </label>
                <select
                  value={newSubject}
                  onChange={(e) => setNewSubject(e.target.value)}
                  style={{
                    backgroundColor: themeColors.bgPage,
                    borderColor: themeColors.borderSubtle,
                    color: themeColors.textPrimary
                  }}
                  className={`w-full p-2 text-xs border ${radius.inner}`}
                >
                  {subjects.map((s) => (
                    <option key={s.id} value={s.name}>
                      {s.name}
                    </option>
                  ))}
                  <option value="Comunidad Institucional I26">Comunidad Institucional I26</option>
                </select>
              </div>

              <div>
                <label style={{ color: themeColors.textPrimary }} className="block text-xs font-semibold mb-1">
                  Título del tema / Pregunta concreta *
                </label>
                <input
                  type="text"
                  required
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  placeholder="Ej: Duda con la normalización de la 3FN en el TP 2"
                  style={{
                    backgroundColor: themeColors.bgPage,
                    borderColor: themeColors.borderSubtle,
                    color: themeColors.textPrimary
                  }}
                  className={`w-full p-2.5 text-xs border focus:outline-none ${radius.inner}`}
                />
              </div>

              <div>
                <label style={{ color: themeColors.textPrimary }} className="block text-xs font-semibold mb-1">
                  Descripción detallada *
                </label>
                <textarea
                  required
                  rows={4}
                  value={newContent}
                  onChange={(e) => setNewContent(e.target.value)}
                  placeholder="Explicá tu consulta o propuesta..."
                  style={{
                    backgroundColor: themeColors.bgPage,
                    borderColor: themeColors.borderSubtle,
                    color: themeColors.textPrimary
                  }}
                  className={`w-full p-2.5 text-xs border focus:outline-none ${radius.inner}`}
                />
              </div>

              <div>
                <label style={{ color: themeColors.textPrimary }} className="block text-xs font-semibold mb-1">
                  Etiquetas (separadas por comas)
                </label>
                <input
                  type="text"
                  value={newTags}
                  onChange={(e) => setNewTags(e.target.value)}
                  placeholder="SQL, Normalización, TP 2"
                  style={{
                    backgroundColor: themeColors.bgPage,
                    borderColor: themeColors.borderSubtle,
                    color: themeColors.textPrimary
                  }}
                  className={`w-full p-2.5 text-xs border focus:outline-none ${radius.inner}`}
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsNewTopicModalOpen(false)}
                  style={{
                    backgroundColor: themeColors.bgSubtle,
                    color: themeColors.textSecondary
                  }}
                  className={`px-3 py-1.5 text-xs font-medium ${radius.button}`}
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={!newTitle.trim() || !newContent.trim()}
                  style={{
                    backgroundColor: themeColors.accentGold,
                    color: '#FFFFFF'
                  }}
                  className={`px-4 py-1.5 text-xs font-semibold disabled:opacity-50 ${radius.button}`}
                >
                  Publicar Debate
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
