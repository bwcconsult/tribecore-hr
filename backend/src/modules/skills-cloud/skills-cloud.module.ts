import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Skill } from './entities/skill.entity';
import { EmployeeSkill } from './entities/employee-skill.entity';
import { MarketplaceOpportunity } from './entities/marketplace-opportunity.entity';
import { SkillsCloudService } from './services/skills-cloud.service';
import { SkillsCloudController } from './controllers/skills-cloud.controller';

@Module({
  imports: [
    TypeOrmModule.forFeature([Skill, EmployeeSkill, MarketplaceOpportunity]),
  ],
  controllers: [SkillsCloudController],
  providers: [SkillsCloudService],
  exports: [SkillsCloudService],
})
export class SkillsCloudModule {}
