import { Controller, Get, Body, Patch, Param, Delete, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiResponse } from '@nestjs/swagger';
import { UsersService } from './users.service';
import { UpdateUserDto } from './dto/update-user.dto';
import { UpdatePersonalDetailsDto } from './dto/update-personal-details.dto';
import { UpdateAddressDto } from './dto/update-address.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { UserRole } from '../../common/enums';

@ApiTags('Users')
@Controller('users')
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiBearerAuth()
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get()
  @Roles(UserRole.ADMIN, UserRole.HR_MANAGER)
  @ApiOperation({ summary: 'Get all users' })
  findAll() {
    return this.usersService.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get user by ID' })
  findOne(@Param('id') id: string) {
    return this.usersService.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update user' })
  update(@Param('id') id: string, @Body() updateUserDto: UpdateUserDto) {
    return this.usersService.update(id, updateUserDto);
  }

  @Delete(':id')
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Delete user' })
  remove(@Param('id') id: string) {
    return this.usersService.remove(id);
  }

  @Get(':id/personal-details')
  @ApiOperation({ summary: 'Get user personal details' })
  @ApiResponse({ status: 200, description: 'User personal details retrieved successfully' })
  @ApiResponse({ status: 404, description: 'User not found' })
  getPersonalDetails(@Param('id') id: string) {
    return this.usersService.getPersonalDetails(id);
  }

  @Patch(':id/personal-details')
  @ApiOperation({ summary: 'Update user personal details (pronouns, nationality, etc.)' })
  @ApiResponse({ status: 200, description: 'Personal details updated successfully' })
  @ApiResponse({ status: 404, description: 'User not found' })
  updatePersonalDetails(
    @Param('id') id: string,
    @Body() updateDto: UpdatePersonalDetailsDto,
  ) {
    return this.usersService.updatePersonalDetails(id, updateDto);
  }

  @Patch(':id/address')
  @ApiOperation({ summary: 'Update user address' })
  @ApiResponse({ status: 200, description: 'Address updated successfully' })
  @ApiResponse({ status: 404, description: 'User not found' })
  updateAddress(@Param('id') id: string, @Body() updateDto: UpdateAddressDto) {
    return this.usersService.updateAddress(id, updateDto);
  }
}
