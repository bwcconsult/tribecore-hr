import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DashboardService } from './dashboard.service';
import { DashboardController } from './dashboard.controller';
import { SavedSearch } from './entities/saved-search.entity';
import { WidgetConfig } from './entities/widget-config.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      SavedSearch,
      WidgetConfig,
    ]),
  ],
  providers: [DashboardService],
  controllers: [DashboardController],
  exports: [DashboardService, TypeOrmModule],
})
export class DashboardModule {}
