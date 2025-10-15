import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  Query,
} from '@nestjs/common';
import { NotesService } from '../services/notes.service';
import { CreateNoteDto, UpdateNoteDto } from '../dto/create-note.dto';

@Controller('api/v1/notes')
export class NotesController {
  constructor(private readonly notesService: NotesService) {}

  @Post()
  async addNote(@Body() dto: CreateNoteDto) {
    return this.notesService.addNote(dto);
  }

  @Get()
  async getNotes(
    @Query('objectType') objectType: string,
    @Query('objectId') objectId: string,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ) {
    return this.notesService.getNotes(
      objectType,
      objectId,
      page ? parseInt(page) : 1,
      limit ? parseInt(limit) : 20,
    );
  }

  @Get(':id')
  async getNote(@Param('id') id: string) {
    return this.notesService.getNote(id);
  }

  @Patch(':id')
  async updateNote(@Param('id') id: string, @Body() dto: UpdateNoteDto) {
    return this.notesService.updateNote(id, dto);
  }

  @Delete(':id')
  async deleteNote(@Param('id') id: string) {
    await this.notesService.deleteNote(id);
    return { message: 'Note deleted successfully' };
  }

  @Patch(':id/pin')
  async togglePin(@Param('id') id: string) {
    return this.notesService.togglePin(id);
  }

  @Get('pinned/:objectType/:objectId')
  async getPinnedNotes(
    @Param('objectType') objectType: string,
    @Param('objectId') objectId: string,
  ) {
    return this.notesService.getPinnedNotes(objectType, objectId);
  }

  @Get('mentions/:userId')
  async getMentionedNotes(
    @Param('userId') userId: string,
    @Query('organizationId') organizationId: string,
  ) {
    return this.notesService.getMentionedNotes(userId, organizationId);
  }

  @Get('search')
  async searchNotes(
    @Query('organizationId') organizationId: string,
    @Query('query') query: string,
    @Query('objectType') objectType?: string,
    @Query('authorId') authorId?: string,
    @Query('visibility') visibility?: string,
  ) {
    return this.notesService.searchNotes(organizationId, query, {
      objectType,
      authorId,
      visibility: visibility as any,
    });
  }

  @Get(':parentNoteId/thread')
  async getThreadedNotes(@Param('parentNoteId') parentNoteId: string) {
    return this.notesService.getThreadedNotes(parentNoteId);
  }
}
