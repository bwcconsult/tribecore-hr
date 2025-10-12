import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { OvertimeController } from './overtime.controller';
import { OvertimeService } from './overtime.service';
import { OvertimeRequest } from './entities/overtime-request.entity';
import { OvertimePolicy } from './entities/overtime-policy.entity';

@Module({
  imports: [TypeOrmModule.forFeature([OvertimeRequest, OvertimePolicy])],
  controllers: [OvertimeController],
  providers: [OvertimeService],
  exports: [OvertimeService],
})
export class OvertimeModule {}
