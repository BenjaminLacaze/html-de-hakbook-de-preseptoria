import { apiClient } from '../lib/apiClient';
import { IS_MOCK_MODE, simulateNetworkLatency } from './apiConfig';
import { mockForumPosts } from '../mocks/mockData';
import type { ForumPost, ForumPostReply } from '../types';

let forumPostsStore: ForumPost[] = [...mockForumPosts];

export const forumService = {
  async getPosts(): Promise<ForumPost[]> {
    if (IS_MOCK_MODE) {
      await simulateNetworkLatency(200);
      return [...forumPostsStore];
    }
    const { data } = await apiClient.get<ForumPost[]>('/student/forums');
    return data;
  },

  async createPost(newPostData: {
    titulo: string;
    contenido: string;
    categoria: ForumPost['categoria'];
    materiaId?: string;
    materiaNombre?: string;
  }): Promise<ForumPost> {
    if (IS_MOCK_MODE) {
      await simulateNetworkLatency(350);
      const createdPost: ForumPost = {
        id: `post-${Date.now()}`,
        titulo: newPostData.titulo,
        contenido: newPostData.contenido,
        categoria: newPostData.categoria,
        materiaId: newPostData.materiaId,
        materiaNombre: newPostData.materiaNombre,
        autorNombre: 'Alex Estudiante',
        autorRol: 'Alumno',
        fecha: 'Hace instantes',
        respuestasCount: 0,
        respuestas: [],
      };
      forumPostsStore = [createdPost, ...forumPostsStore];
      return createdPost;
    }
    const { data } = await apiClient.post<ForumPost>('/student/forums', newPostData);
    return data;
  },

  async replyToPost(postId: string, content: string): Promise<ForumPostReply> {
    if (IS_MOCK_MODE) {
      await simulateNetworkLatency(300);
      const postIndex = forumPostsStore.findIndex((p) => p.id === postId);
      if (postIndex === -1) throw new Error('Foro no encontrado');

      const newReply: ForumPostReply = {
        id: `rep-${Date.now()}`,
        postId,
        autorNombre: 'Alex Estudiante',
        autorRol: 'Alumno',
        fecha: 'Hace instantes',
        contenido: content,
      };

      forumPostsStore[postIndex] = {
        ...forumPostsStore[postIndex],
        respuestasCount: forumPostsStore[postIndex].respuestasCount + 1,
        respuestas: [...forumPostsStore[postIndex].respuestas, newReply],
      };

      return newReply;
    }
    const { data } = await apiClient.post<ForumPostReply>(`/student/forums/${postId}/replies`, { content });
    return data;
  },
};
