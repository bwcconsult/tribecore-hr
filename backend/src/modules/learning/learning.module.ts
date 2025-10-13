import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { LearningService } from './learning.service';
import { LearningController } from './learning.controller';
import { LearningEnhancedService } from './services/learning-enhanced.service';
import { LearningEnhancedController } from './controllers/learning-enhanced.controller';
import { SkillsTrainingService } from './skills-training.service';
import { SkillsTrainingController } from './skills-training.controller';
import { Course, CourseEnrollment } from './entities/course.entity';
import { CourseModule } from './entities/course-module.entity';
import { Lesson } from './entities/lesson.entity';
import { LessonProgress } from './entities/lesson-progress.entity';
import { MandatoryTrainingTemplate } from './entities/mandatory-training.entity';
import { Skill, PersonSkill } from './entities/skill.entity';
import {
  EducationHistory,
  ProfessionalQualification,
  Language,
  License,
} from './entities/qualification.entity';
import {
  TrainingActivity,
  DevelopmentPlan,
  DevelopmentNeed,
} from './entities/training-activity.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Course,
      CourseEnrollment,
      CourseModule,
      Lesson,
      LessonProgress,
      MandatoryTrainingTemplate,
      Skill,
      PersonSkill,
      EducationHistory,
      ProfessionalQualification,
      Language,
      License,
      TrainingActivity,
      DevelopmentPlan,
      DevelopmentNeed,
    ]),
  ],
  controllers: [LearningController, LearningEnhancedController, SkillsTrainingController],
  providers: [LearningService, LearningEnhancedService, SkillsTrainingService],
  exports: [LearningService, LearningEnhancedService, SkillsTrainingService],
})
export class LearningModule {}
