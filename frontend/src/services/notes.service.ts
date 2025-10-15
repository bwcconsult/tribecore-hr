import { axiosInstance } from '../lib/axios';

export interface Note {
  id: string;
  organizationId: string;
  objectType: string;
  objectId: string;
  authorId: string;
  body: string;
  mentions: string[];
  visibility: 'internal' | 'shared';
  pinned: boolean;
  attachments: Array<{
    name: string;
    url: string;
    size: number;
    mimeType: string;
  }>;
  parentNoteId?: string;
  metadata?: any;
  createdAt: string;
  updatedAt: string;
}

class NotesService {
  async getNotes(
    objectType: string,
    objectId: string,
    page: number = 1,
    limit: number = 20,
  ): Promise<{ data: Note[]; total: number; page: number; totalPages: number }> {
    const params = new URLSearchParams({
      objectType,
      objectId,
      page: String(page),
      limit: String(limit),
    });

    const response = await axiosInstance.get(`/notes?${params}`);
    return response.data;
  }

  async getNote(id: string): Promise<Note> {
    const response = await axiosInstance.get(`/notes/${id}`);
    return response.data;
  }

  async addNote(data: {
    organizationId: string;
    objectType: string;
    objectId: string;
    authorId: string;
    body: string;
    mentions?: string[];
    visibility?: 'internal' | 'shared';
    pinned?: boolean;
    attachments?: Array<{
      name: string;
      url: string;
      size: number;
      mimeType: string;
    }>;
    parentNoteId?: string;
    metadata?: any;
  }): Promise<Note> {
    const response = await axiosInstance.post('/notes', data);
    return response.data;
  }

  async updateNote(
    id: string,
    data: {
      body?: string;
      mentions?: string[];
      visibility?: 'internal' | 'shared';
      pinned?: boolean;
      metadata?: any;
    },
  ): Promise<Note> {
    const response = await axiosInstance.patch(`/notes/${id}`, data);
    return response.data;
  }

  async deleteNote(id: string): Promise<void> {
    await axiosInstance.delete(`/notes/${id}`);
  }

  async togglePin(id: string): Promise<Note> {
    const response = await axiosInstance.patch(`/notes/${id}/pin`);
    return response.data;
  }

  async getPinnedNotes(objectType: string, objectId: string): Promise<Note[]> {
    const response = await axiosInstance.get(`/notes/pinned/${objectType}/${objectId}`);
    return response.data;
  }

  async getMentionedNotes(userId: string, organizationId: string): Promise<Note[]> {
    const response = await axiosInstance.get(
      `/notes/mentions/${userId}?organizationId=${organizationId}`,
    );
    return response.data;
  }

  async searchNotes(
    organizationId: string,
    query: string,
    filters?: {
      objectType?: string;
      authorId?: string;
      visibility?: 'internal' | 'shared';
    },
  ): Promise<Note[]> {
    const params = new URLSearchParams({ organizationId, query });
    if (filters?.objectType) params.append('objectType', filters.objectType);
    if (filters?.authorId) params.append('authorId', filters.authorId);
    if (filters?.visibility) params.append('visibility', filters.visibility);

    const response = await axiosInstance.get(`/notes/search?${params}`);
    return response.data;
  }

  async getThreadedNotes(parentNoteId: string): Promise<Note[]> {
    const response = await axiosInstance.get(`/notes/${parentNoteId}/thread`);
    return response.data;
  }
}

export const notesService = new NotesService();
