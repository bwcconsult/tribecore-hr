import { PartialType } from '@nestjs/mapped-types';
import { CreateCourseDto, CreateEnrollmentDto } from './create-course.dto';

export class UpdateCourseDto extends PartialType(CreateCourseDto) {}

export class UpdateEnrollmentDto extends PartialType(CreateEnrollmentDto) {}
