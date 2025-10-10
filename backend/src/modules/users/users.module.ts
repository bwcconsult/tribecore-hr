import { Module, forwardRef } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UsersService } from './users.service';
import { UsersController } from './users.controller';
import { User } from './entities/user.entity';
import { OrganizationModule } from '../organization/organization.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([User]),
    forwardRef(() => OrganizationModule),
  ],
  controllers: [UsersController],
  providers: [UsersService],
  exports: [UsersService],
})
export class UsersModule {}
