import { Module, forwardRef } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UsersService } from './users.service';
import { UsersController } from './users.controller';
import { User } from './entities/user.entity';
import { NextOfKin } from './entities/next-of-kin.entity';
import { NextOfKinService } from './next-of-kin.service';
import { NextOfKinController } from './next-of-kin.controller';
import { OrganizationModule } from '../organization/organization.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([User, NextOfKin]),
    forwardRef(() => OrganizationModule),
  ],
  controllers: [UsersController, NextOfKinController],
  providers: [UsersService, NextOfKinService],
  exports: [UsersService, NextOfKinService],
})
export class UsersModule {}
