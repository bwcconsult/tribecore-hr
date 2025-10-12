import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ShiftsController } from './shifts.controller';
import { ShiftsService } from './shifts.service';
import { Shift } from './entities/shift.entity';
import { Rota } from './entities/rota.entity';
import { ShiftTemplate } from './entities/shift-template.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Shift, Rota, ShiftTemplate])],
  controllers: [ShiftsController],
  providers: [ShiftsService],
  exports: [ShiftsService],
})
export class ShiftsModule {}
