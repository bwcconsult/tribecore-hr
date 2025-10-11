import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Permission } from './entities/permission.entity';
import { SecurityGroup } from './entities/security-group.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Permission,
      SecurityGroup,
    ]),
  ],
  providers: [],
  controllers: [],
  exports: [TypeOrmModule],
})
export class RbacModule {}
