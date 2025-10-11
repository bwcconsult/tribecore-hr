import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Task } from './entities/task.entity';
import { Checklist, ChecklistItem } from './entities/checklist.entity';
import { TaskEvent } from './entities/task-event.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Task,
      Checklist,
      ChecklistItem,
      TaskEvent,
    ]),
  ],
  providers: [],
  controllers: [],
  exports: [TypeOrmModule],
})
export class TasksModule {}
