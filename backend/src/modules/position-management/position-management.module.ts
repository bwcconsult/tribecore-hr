import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Position } from './entities/position.entity';
import { OrgScenario } from './entities/org-scenario.entity';
import { PositionManagementService } from './services/position-management.service';
import { PositionManagementController } from './controllers/position-management.controller';

@Module({
  imports: [
    TypeOrmModule.forFeature([Position, OrgScenario]),
  ],
  controllers: [PositionManagementController],
  providers: [PositionManagementService],
  exports: [PositionManagementService],
})
export class PositionManagementModule {}
