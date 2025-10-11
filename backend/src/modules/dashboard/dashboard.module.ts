import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SavedSearch } from './entities/saved-search.entity';
import { WidgetConfig } from './entities/widget-config.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      SavedSearch,
      WidgetConfig,
    ]),
  ],
  providers: [],
  controllers: [],
  exports: [TypeOrmModule],
})
export class DashboardModule {}
