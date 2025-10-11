import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { LearningService } from './learning.service';
import { LearningController } from './learning.controller';
import { SkillsTrainingService } from './skills-training.service';
import { SkillsTrainingController } from './skills-training.controller';
import { Course, CourseEnrollment } from './entities/course.entity';
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
  controllers: [LearningController, SkillsTrainingController],
  providers: [LearningService, SkillsTrainingService],
  exports: [LearningService, SkillsTrainingService],
})
export class LearningModule {}
