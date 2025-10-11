import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserSettingsService } from './user-settings.service';
import { UserSettingsController } from './user-settings.controller';
import {
  UserSettings,
  NotificationPreference,
  NotificationSubscription,
  NotificationQueue,
} from './entities/user-settings.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      UserSettings,
      NotificationPreference,
      NotificationSubscription,
      NotificationQueue,
    ]),
  ],
  controllers: [UserSettingsController],
  providers: [UserSettingsService],
  exports: [UserSettingsService],
})
export class UserSettingsModule {}
