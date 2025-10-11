import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CalendarService } from './calendar.service';
import { CalendarController } from './calendar.controller';
import { CalendarEvent } from './entities/calendar-event.entity';
import { BankHoliday } from './entities/bank-holiday.entity';
import { AbsenceBalanceCache } from './entities/absence-balance-cache.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      CalendarEvent,
      BankHoliday,
      AbsenceBalanceCache,
    ]),
  ],
  controllers: [CalendarController],
  providers: [CalendarService],
  exports: [CalendarService],
})
export class CalendarModule {}
