import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TasksService } from './tasks.service';
import { TasksController } from './tasks.controller';
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
  providers: [TasksService],
  controllers: [TasksController],
  exports: [TasksService, TypeOrmModule],
})
export class TasksModule {}
