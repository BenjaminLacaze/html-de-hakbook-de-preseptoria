import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  MessageSquare,
  Search,
  Plus,
  Pin,
  Send,
  User,
  ShieldCheck,
  CheckCircle,
  Clock,
  Sparkles,
  Info,
} from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { Input, Select } from '../../components/ui/Input';
import { Tabs } from '../../components/ui/Tabs';
import { Modal } from '../../components/ui/Modal';
import { Skeleton } from '../../components/ui/Skeleton';
import { EmptyState } from '../../components/ui/EmptyState';
import { forumService } from '../../services/forumService';
import { subjectsService } from '../../services/subjectsService';
import type { ForumPost } from '../../types';

export const ForumsView: React.FC = () => {
  const queryClient = useQueryClient();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('todos');
  const [selectedPost, setSelectedPost] = useState<ForumPost | null>(null);
  const [isNewPostModalOpen, setIsNewPostModalOpen] = useState(false);

  // Nuevo post form state
  const [newTitle, setNewTitle] = useState('');
  const [newContent, setNewContent] = useState('');
  const [newCategory, setNewCategory] = useState<ForumPost['categoria']>('Consultas de TP');
  const [newMateriaId, setNewMateriaId] = useState('');

  // Respuesta form state
  const [replyContent, setReplyContent] = useState('');

  const { data: posts, isLoading } = useQuery({
    queryKey: ['forumPosts'],
    queryFn: () => forumService.getPosts(),
  });

  const { data: subjects } = useQuery({
    queryKey: ['subjects'],
    queryFn: () => subjectsService.getSubjects(),
  });

  const createPostMutation = useMutation({
    mutationFn: (data: {
      titulo: string;
      contenido: string;
      categoria: ForumPost['categoria'];
      materiaId?: string;
      materiaNombre?: string;
    }) => forumService.createPost(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['forumPosts'] });
      setIsNewPostModalOpen(false);
      setNewTitle('');
      setNewContent('');
    },
  });

  const replyMutation = useMutation({
    mutationFn: ({ postId, content }: { postId: string; content: string }) =>
      forumService.replyToPost(postId, content),
    onSuccess: (newReply) => {
      queryClient.invalidateQueries({ queryKey: ['forumPosts'] });
      if (selectedPost) {
        setSelectedPost((prev) =>
          prev
            ? {
                ...prev,
                respuestasCount: prev.respuestasCount + 1,
                respuestas: [...prev.respuestas, newReply],
              }
            : null
        );
      }
      setReplyContent('');
    },
  });

  const categoryTabs = [
    { id: 'todos', label: 'Todos los Temas' },
    { id: 'Consultas de TP', label: 'Consultas de TP' },
    { id: 'Académico', label: 'Académico' },
    { id: 'Material de Estudio', label: 'Material' },
    { id: 'General', label: 'General' },
  ];

  const filteredPosts = posts?.filter((p) => {
    const matchesCategory = selectedCategory === 'todos' || p.categoria === selectedCategory;
    const matchesSearch =
      p.titulo.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.contenido.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (p.materiaNombre && p.materiaNombre.toLowerCase().includes(searchTerm.toLowerCase()));

    return matchesCategory && matchesSearch;
  }) || [];

  const handleCreatePostSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim() || !newContent.trim()) return;

    const matchedSubject = subjects?.find((s) => s.id === newMateriaId);
    createPostMutation.mutate({
      titulo: newTitle,
      contenido: newContent,
      categoria: newCategory,
      materiaId: newMateriaId || undefined,
      materiaNombre: matchedSubject ? matchedSubject.nombre : undefined,
    });
  };

  const handleReplySubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedPost || !replyContent.trim()) return;
    replyMutation.mutate({ postId: selectedPost.id, content: replyContent });
  };

  return (
    <div className="space-y-6">
      {/* Header, Search & New Post Button */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-bold text-primary-custom tracking-tight">
            Foros Académicos
          </h2>
          <p className="text-xs text-secondary-custom mt-0.5">
            Espacio colaborativo de consultas entre estudiantes y docentes
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="w-full sm:w-64">
            <Input
              placeholder="Buscar en foros..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              icon={<Search className="w-4 h-4" />}
            />
          </div>
          <Button variant="primary" size="md" onClick={() => setIsNewPostModalOpen(true)}>
            <Plus className="w-4 h-4" />
            <span className="hidden sm:inline">Nueva Consulta</span>
          </Button>
        </div>
      </div>

      {/* Categories */}
      <Tabs tabs={categoryTabs} activeTab={selectedCategory} onChange={setSelectedCategory} />

      {/* Main Forum Split: Posts List and Conversation Detail */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Posts List (5 cols on lg) */}
        <div className="lg:col-span-5 space-y-3">
          {isLoading ? (
            <div className="space-y-3">
              <Skeleton className="h-24 w-full" />
              <Skeleton className="h-24 w-full" />
              <Skeleton className="h-24 w-full" />
            </div>
          ) : filteredPosts.length === 0 ? (
            <EmptyState
              icon={<MessageSquare className="w-6 h-6 text-muted-custom" />}
              title="No hay publicaciones"
              description="No encontramos consultas en esta categoría."
              actionText="Crear primera consulta"
              onAction={() => setIsNewPostModalOpen(true)}
            />
          ) : (
            filteredPosts.map((post) => {
              const isSelected = selectedPost?.id === post.id;

              return (
                <div
                  key={post.id}
                  onClick={() => setSelectedPost(post)}
                  className={`p-4 rounded-[var(--radius-current)] border transition-all cursor-pointer text-left ${
                    isSelected
                      ? 'border-[var(--accent-primary)] bg-[var(--accent-subtle)]/20 shadow-xs'
                      : 'border-subtle-custom bg-surface hover:border-strong-custom'
                  }`}
                >
                  <div className="flex items-start justify-between gap-2 mb-1.5">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      {post.fijado && <Pin className="w-3.5 h-3.5 text-amber-500 fill-amber-500 shrink-0" />}
                      <Badge variant="default">{post.categoria}</Badge>
                      {post.materiaNombre && (
                        <span className="text-[10px] text-muted-custom truncate max-w-[140px]">
                          {post.materiaNombre}
                        </span>
                      )}
                    </div>
                    <span className="text-[10px] text-muted-custom font-mono whitespace-nowrap">
                      {post.fecha}
                    </span>
                  </div>

                  <h3 className="text-xs sm:text-sm font-bold text-primary-custom leading-snug line-clamp-2">
                    {post.titulo}
                  </h3>
                  <p className="text-xs text-secondary-custom line-clamp-2 mt-1">
                    {post.contenido}
                  </p>

                  <div className="mt-3 pt-2 border-t border-subtle-custom flex items-center justify-between text-[11px] text-muted-custom">
                    <span>
                      Por <strong>{post.autorNombre}</strong> ({post.autorRol})
                    </span>
                    <span className="flex items-center gap-1 font-mono">
                      <MessageSquare className="w-3 h-3" />
                      {post.respuestasCount} respuesta(s)
                    </span>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Selected Conversation Detail View (7 cols on lg) */}
        <div className="lg:col-span-7">
          {selectedPost ? (
            <Card className="flex flex-col">
              {/* Thread Header */}
              <div className="p-5 border-b border-subtle-custom space-y-3">
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <Badge variant="default">{selectedPost.categoria}</Badge>
                    {selectedPost.materiaNombre && (
                      <span className="text-xs text-muted-custom font-medium">
                        {selectedPost.materiaNombre}
                      </span>
                    )}
                  </div>
                  <span className="text-xs text-muted-custom font-mono">{selectedPost.fecha}</span>
                </div>

                <h2 className="text-base font-bold text-primary-custom tracking-tight leading-snug">
                  {selectedPost.titulo}
                </h2>

                <div className="flex items-center gap-2.5 text-xs text-secondary-custom">
                  <div className="w-6 h-6 rounded-full bg-[var(--bg-surface-elevated)] flex items-center justify-center font-bold text-[10px]">
                    {selectedPost.autorNombre[0]}
                  </div>
                  <span>
                    Iniciado por <strong>{selectedPost.autorNombre}</strong> · {selectedPost.autorRol}
                  </span>
                </div>

                <div className="p-4 rounded-[calc(var(--radius-current)-2px)] bg-[var(--bg-surface-elevated)]/40 border border-subtle-custom text-xs text-primary-custom leading-relaxed whitespace-pre-wrap">
                  {selectedPost.contenido}
                </div>
              </div>

              {/* Replies Thread */}
              <div className="p-5 space-y-4 max-h-[480px] overflow-y-auto">
                <h4 className="text-xs font-semibold text-primary-custom flex items-center gap-1.5">
                  <MessageSquare className="w-3.5 h-3.5 text-muted-custom" />
                  Respuestas de la comunidad ({selectedPost.respuestas.length})
                </h4>

                {selectedPost.respuestas.length === 0 ? (
                  <p className="text-xs text-secondary-custom p-4 text-center border border-dashed border-subtle-custom rounded-[calc(var(--radius-current)-2px)]">
                    Aún no hay respuestas en este hilo. ¡Sé el primero en colaborar!
                  </p>
                ) : (
                  <div className="space-y-3">
                    {selectedPost.respuestas.map((reply) => (
                      <div
                        key={reply.id}
                        className={`p-3.5 rounded-[calc(var(--radius-current)-2px)] border text-xs space-y-1.5 ${
                          reply.autorRol === 'Docente'
                            ? 'border-blue-200 dark:border-blue-900 bg-blue-50/40 dark:bg-blue-950/20'
                            : 'border-subtle-custom bg-surface'
                        }`}
                      >
                        <div className="flex items-center justify-between gap-2">
                          <div className="flex items-center gap-2">
                            <span className="font-semibold text-primary-custom">
                              {reply.autorNombre}
                            </span>
                            <Badge variant={reply.autorRol === 'Docente' ? 'info' : 'default'}>
                              {reply.autorRol}
                            </Badge>
                          </div>
                          <span className="text-[10px] text-muted-custom font-mono">
                            {reply.fecha}
                          </span>
                        </div>
                        <p className="text-secondary-custom leading-relaxed whitespace-pre-wrap">
                          {reply.contenido}
                        </p>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Reply Form */}
              <div className="p-4 border-t border-subtle-custom bg-[var(--bg-surface-elevated)]/40 rounded-b-[var(--radius-current)]">
                <form onSubmit={handleReplySubmit} className="space-y-3">
                  <textarea
                    value={replyContent}
                    onChange={(e) => setReplyContent(e.target.value)}
                    placeholder="Escribí una respuesta académica para colaborar en este hilo..."
                    rows={3}
                    className="w-full rounded-[var(--radius-current)] border border-subtle-custom bg-surface p-3 text-xs text-primary-custom placeholder:text-muted-custom focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent-primary)]"
                  />
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] text-muted-custom">
                      Respuestas moderadas según pautas de convivencia institucional.
                    </span>
                    <Button
                      type="submit"
                      variant="primary"
                      size="sm"
                      isLoading={replyMutation.isPending}
                      disabled={!replyContent.trim()}
                    >
                      <Send className="w-3.5 h-3.5" />
                      <span>Responder</span>
                    </Button>
                  </div>
                </form>
              </div>
            </Card>
          ) : (
            <Card className="p-12 text-center">
              <MessageSquare className="w-10 h-10 text-muted-custom mx-auto mb-2" />
              <h3 className="text-sm font-semibold text-primary-custom">
                Seleccioná una conversación
              </h3>
              <p className="text-xs text-secondary-custom max-w-sm mx-auto mt-1">
                Elegí cualquier publicación del listado para leer las respuestas de los docentes y compañeros o enviar tu consulta.
              </p>
            </Card>
          )}
        </div>
      </div>

      {/* New Post Modal */}
      <Modal
        isOpen={isNewPostModalOpen}
        onClose={() => setIsNewPostModalOpen(false)}
        title="Crear Nueva Consulta en Foros"
        description="Publicación académica visible para docentes y compañeros de la comisión"
        maxWidth="lg"
        footer={
          <>
            <Button variant="outline" size="sm" onClick={() => setIsNewPostModalOpen(false)}>
              Cancelar
            </Button>
            <Button
              variant="primary"
              size="sm"
              onClick={handleCreatePostSubmit}
              isLoading={createPostMutation.isPending}
              disabled={!newTitle.trim() || !newContent.trim()}
            >
              Publicar Tema
            </Button>
          </>
        }
      >
        <form onSubmit={handleCreatePostSubmit} className="space-y-4">
          <Input
            label="Título de la consulta o tema"
            placeholder="Ej: Duda con el modelo entidad-relación en TP 2"
            value={newTitle}
            onChange={(e) => setNewTitle(e.target.value)}
            required
          />

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Select
              label="Categoría"
              value={newCategory}
              onChange={(e) => setNewCategory(e.target.value as any)}
            >
              <option value="Consultas de TP">Consultas de TP</option>
              <option value="Académico">Académico</option>
              <option value="Material de Estudio">Material de Estudio</option>
              <option value="Exámenes">Exámenes</option>
              <option value="General">General</option>
            </Select>

            <Select
              label="Asignatura asociada (opcional)"
              value={newMateriaId}
              onChange={(e) => setNewMateriaId(e.target.value)}
            >
              <option value="">Institucional / General</option>
              {subjects?.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.nombre}
                </option>
              ))}
            </Select>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-primary-custom block">
              Detalle de la consulta o contenido
            </label>
            <textarea
              value={newContent}
              onChange={(e) => setNewContent(e.target.value)}
              placeholder="Explicá con claridad el problema, código o duda teórica..."
              rows={5}
              required
              className="w-full rounded-[var(--radius-current)] border border-subtle-custom bg-surface p-3 text-xs text-primary-custom placeholder:text-muted-custom focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent-primary)]"
            />
          </div>

          <div className="p-3 rounded-[calc(var(--radius-current)-2px)] bg-[var(--bg-surface-elevated)] border border-subtle-custom text-[11px] text-muted-custom flex items-center gap-2">
            <Info className="w-4 h-4 text-secondary-custom shrink-0" />
            <span>
              Modo demostración: la publicación se almacena localmente en memoria durante esta sesión.
            </span>
          </div>
        </form>
      </Modal>
    </div>
  );
};
