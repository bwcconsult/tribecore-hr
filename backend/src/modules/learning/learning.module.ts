import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { LearningService } from './learning.service';
import { LearningController } from './learning.controller';
import { Course, CourseEnrollment } from './entities/course.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Course, CourseEnrollment])],
  controllers: [LearningController],
  providers: [LearningService],
  exports: [LearningService],
})
export class LearningModule {}
