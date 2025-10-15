import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Note, NoteVisibility } from '../entities/note.entity';
import { OnboardingTask } from '../entities/onboarding-task.entity';
import { COTask } from '../entities/co-task.entity';
import { CreateNoteDto, UpdateNoteDto } from '../dto/create-note.dto';

@Injectable()
export class NotesService {
  constructor(
    @InjectRepository(Note)
    private readonly noteRepository: Repository<Note>,
    @InjectRepository(OnboardingTask)
    private readonly taskRepository: Repository<OnboardingTask>,
    @InjectRepository(COTask)
    private readonly coTaskRepository: Repository<COTask>,
  ) {}

  /**
   * Add a note to an object (case, task, etc.)
   * Automatically updates parent task/case with noteCount and lastActivityAt
   */
  async addNote(dto: CreateNoteDto): Promise<Note> {
    const note = this.noteRepository.create({
      organizationId: dto.organizationId,
      objectType: dto.objectType,
      objectId: dto.objectId,
      authorId: dto.authorId,
      body: dto.body,
      mentions: dto.mentions || [],
      visibility: dto.visibility || NoteVisibility.INTERNAL,
      pinned: dto.pinned || false,
      attachments: dto.attachments || [],
      parentNoteId: dto.parentNoteId,
      metadata: dto.metadata,
    });

    const savedNote = await this.noteRepository.save(note);

    // Update parent object's noteCount and lastActivityAt
    await this.updateParentObject(dto.objectType, dto.objectId);

    // TODO: Send notifications for @mentions
    if (dto.mentions && dto.mentions.length > 0) {
      await this.sendMentionNotifications(savedNote);
    }

    return savedNote;
  }

  /**
   * Get notes for an object with pagination
   */
  async getNotes(
    objectType: string,
    objectId: string,
    page: number = 1,
    limit: number = 20,
  ): Promise<{ data: Note[]; total: number; page: number; totalPages: number }> {
    const skip = (page - 1) * limit;

    const [data, total] = await this.noteRepository.findAndCount({
      where: { objectType, objectId },
      order: { createdAt: 'DESC' },
      skip,
      take: limit,
    });

    return {
      data,
      total,
      page,
      totalPages: Math.ceil(total / limit),
    };
  }

  /**
   * Get note by ID
   */
  async getNote(id: string): Promise<Note> {
    const note = await this.noteRepository.findOne({ where: { id } });
    if (!note) {
      throw new NotFoundException(`Note with ID ${id} not found`);
    }
    return note;
  }

  /**
   * Update note
   */
  async updateNote(id: string, dto: UpdateNoteDto): Promise<Note> {
    const note = await this.getNote(id);
    Object.assign(note, dto);
    return this.noteRepository.save(note);
  }

  /**
   * Delete note (soft delete)
   */
  async deleteNote(id: string): Promise<void> {
    const note = await this.getNote(id);
    await this.noteRepository.softRemove(note);

    // Update parent object's noteCount
    await this.updateParentObject(note.objectType, note.objectId);
  }

  /**
   * Pin/Unpin note
   */
  async togglePin(id: string): Promise<Note> {
    const note = await this.getNote(id);
    note.pinned = !note.pinned;
    return this.noteRepository.save(note);
  }

  /**
   * Get pinned notes for an object
   */
  async getPinnedNotes(objectType: string, objectId: string): Promise<Note[]> {
    return this.noteRepository.find({
      where: { objectType, objectId, pinned: true },
      order: { createdAt: 'DESC' },
    });
  }

  /**
   * Get notes by user (for activity feed)
   */
  async getNotesByAuthor(
    authorId: string,
    organizationId: string,
    limit: number = 50,
  ): Promise<Note[]> {
    return this.noteRepository.find({
      where: { authorId, organizationId },
      order: { createdAt: 'DESC' },
      take: limit,
    });
  }

  /**
   * Get notes where user is mentioned
   */
  async getMentionedNotes(userId: string, organizationId: string): Promise<Note[]> {
    return this.noteRepository
      .createQueryBuilder('note')
      .where('note.organizationId = :organizationId', { organizationId })
      .andWhere(':userId = ANY(note.mentions)', { userId })
      .orderBy('note.createdAt', 'DESC')
      .getMany();
  }

  /**
   * Update parent object's noteCount and lastActivityAt
   */
  private async updateParentObject(objectType: string, objectId: string): Promise<void> {
    const noteCount = await this.noteRepository.count({
      where: { objectType, objectId },
    });

    const now = new Date();

    // Update based on object type
    if (objectType === 'OnboardingTask') {
      await this.taskRepository.update(objectId, {
        noteCount,
        lastActivityAt: now,
      });
    } else if (objectType === 'CO_Task') {
      await this.coTaskRepository.update(objectId, {
        noteCount,
      });
    }
    // Add more object types as needed
  }

  /**
   * Send notifications for mentioned users
   * TODO: Integrate with notification service
   */
  private async sendMentionNotifications(note: Note): Promise<void> {
    // This would integrate with your notification service
    // For now, just log
    console.log(`Sending mention notifications for note ${note.id} to users:`, note.mentions);

    // TODO: Create notification records
    // TODO: Send email notifications
    // TODO: Send Slack/Teams notifications
  }

  /**
   * Search notes by content
   */
  async searchNotes(
    organizationId: string,
    query: string,
    filters?: {
      objectType?: string;
      authorId?: string;
      visibility?: NoteVisibility;
    },
  ): Promise<Note[]> {
    const queryBuilder = this.noteRepository
      .createQueryBuilder('note')
      .where('note.organizationId = :organizationId', { organizationId })
      .andWhere('note.body ILIKE :query', { query: `%${query}%` });

    if (filters?.objectType) {
      queryBuilder.andWhere('note.objectType = :objectType', {
        objectType: filters.objectType,
      });
    }

    if (filters?.authorId) {
      queryBuilder.andWhere('note.authorId = :authorId', { authorId: filters.authorId });
    }

    if (filters?.visibility) {
      queryBuilder.andWhere('note.visibility = :visibility', {
        visibility: filters.visibility,
      });
    }

    return queryBuilder.orderBy('note.createdAt', 'DESC').take(50).getMany();
  }

  /**
   * Get threaded notes (replies)
   */
  async getThreadedNotes(parentNoteId: string): Promise<Note[]> {
    return this.noteRepository.find({
      where: { parentNoteId },
      order: { createdAt: 'ASC' },
    });
  }
}
