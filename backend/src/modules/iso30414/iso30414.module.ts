import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { HCMetric } from './entities/hc-metric.entity';
import { HCReport } from './entities/hc-report.entity';
import { ISO30414Service } from './services/iso30414.service';
import { ISO30414Controller } from './controllers/iso30414.controller';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      HCMetric,
      HCReport,
    ]),
  ],
  controllers: [ISO30414Controller],
  providers: [ISO30414Service],
  exports: [ISO30414Service],
})
export class ISO30414Module {}
