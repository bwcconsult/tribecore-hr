import { PartialType } from '@nestjs/swagger';
import { CreatePerformanceReviewDto } from './create-performance.dto';

export class UpdatePerformanceReviewDto extends PartialType(CreatePerformanceReviewDto) {}
