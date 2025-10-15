import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

// Entities
import { InternalJobPosting } from './entities/internal-job-posting.entity';
import { InternalApplication } from './entities/internal-application.entity';
import { SuccessionPlan } from './entities/succession-plan.entity';
import { CareerPath } from './entities/career-path.entity';
import { TalentReview } from './entities/talent-review.entity';
import { CareerProgress } from './entities/career-progress.entity';

// Services
import { InternalJobsService } from './services/internal-jobs.service';
import { InternalApplicationsService } from './services/internal-applications.service';
import { SuccessionPlanningService } from './services/succession-planning.service';

// Controllers
import { InternalJobsController } from './controllers/internal-jobs.controller';
import { InternalApplicationsController } from './controllers/internal-applications.controller';
import { SuccessionPlanningController } from './controllers/succession-planning.controller';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      InternalJobPosting,
      InternalApplication,
      SuccessionPlan,
      CareerPath,
      TalentReview,
      CareerProgress,
    ]),
  ],
  controllers: [
    InternalJobsController,
    InternalApplicationsController,
    SuccessionPlanningController,
  ],
  providers: [
    InternalJobsService,
    InternalApplicationsService,
    SuccessionPlanningService,
  ],
  exports: [
    InternalJobsService,
    InternalApplicationsService,
    SuccessionPlanningService,
  ],
})
export class InternalRecruitmentModule {}
