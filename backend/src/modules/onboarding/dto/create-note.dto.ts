import { IsString, IsOptional, IsEnum, IsArray, IsBoolean } from 'class-validator';
import { NoteVisibility } from '../entities/note.entity';

export class CreateNoteDto {
  @IsString()
  organizationId: string;

  @IsString()
  objectType: string; // 'OnboardingCase', 'ClientOnboardingCase', 'OnboardingTask', etc.

  @IsString()
  objectId: string;

  @IsString()
  authorId: string;

  @IsString()
  body: string;

  @IsOptional()
  @IsArray()
  mentions?: string[]; // User IDs

  @IsOptional()
  @IsEnum(NoteVisibility)
  visibility?: NoteVisibility;

  @IsOptional()
  @IsBoolean()
  pinned?: boolean;

  @IsOptional()
  @IsArray()
  attachments?: Array<{
    name: string;
    url: string;
    size: number;
    mimeType: string;
  }>;

  @IsOptional()
  @IsString()
  parentNoteId?: string;

  @IsOptional()
  metadata?: any;
}

export class UpdateNoteDto {
  @IsOptional()
  @IsString()
  body?: string;

  @IsOptional()
  @IsArray()
  mentions?: string[];

  @IsOptional()
  @IsEnum(NoteVisibility)
  visibility?: NoteVisibility;

  @IsOptional()
  @IsBoolean()
  pinned?: boolean;

  @IsOptional()
  metadata?: any;
}
