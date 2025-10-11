import { PartialType } from '@nestjs/mapped-types';
import { CreateTimeEntryDto, CreateProjectDto } from './create-time-entry.dto';

export class UpdateTimeEntryDto extends PartialType(CreateTimeEntryDto) {}

export class UpdateProjectDto extends PartialType(CreateProjectDto) {}
