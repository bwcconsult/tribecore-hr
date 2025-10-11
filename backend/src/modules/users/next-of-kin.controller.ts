import {
  Controller,
  Get,
  Post,
  Put,
  Patch,
  Delete,
  Body,
  Param,
  UseGuards,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { NextOfKinService } from './next-of-kin.service';
import { CreateNextOfKinDto } from './dto/create-next-of-kin.dto';
import { UpdateNextOfKinDto } from './dto/update-next-of-kin.dto';
import { NextOfKin } from './entities/next-of-kin.entity';

@ApiTags('Next of Kin')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('users/:userId/next-of-kin')
export class NextOfKinController {
  constructor(private readonly nextOfKinService: NextOfKinService) {}

  @Post()
  @ApiOperation({ summary: 'Create next of kin for a user' })
  @ApiResponse({
    status: 201,
    description: 'Next of kin successfully created',
    type: NextOfKin,
  })
  @ApiResponse({ status: 400, description: 'Bad request' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async create(
    @Param('userId') userId: string,
    @Body() createDto: CreateNextOfKinDto,
  ): Promise<NextOfKin> {
    return this.nextOfKinService.create(userId, createDto);
  }

  @Get()
  @ApiOperation({ summary: 'Get all next of kin for a user' })
  @ApiResponse({
    status: 200,
    description: 'List of next of kin',
    type: [NextOfKin],
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async findAll(@Param('userId') userId: string): Promise<NextOfKin[]> {
    return this.nextOfKinService.findAll(userId);
  }

  @Get('primary')
  @ApiOperation({ summary: 'Get primary next of kin for a user' })
  @ApiResponse({
    status: 200,
    description: 'Primary next of kin',
    type: NextOfKin,
  })
  @ApiResponse({ status: 404, description: 'No primary next of kin found' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async findPrimary(@Param('userId') userId: string): Promise<NextOfKin | null> {
    return this.nextOfKinService.findPrimary(userId);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a specific next of kin by ID' })
  @ApiResponse({
    status: 200,
    description: 'Next of kin details',
    type: NextOfKin,
  })
  @ApiResponse({ status: 404, description: 'Next of kin not found' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async findOne(
    @Param('userId') userId: string,
    @Param('id') id: string,
  ): Promise<NextOfKin> {
    return this.nextOfKinService.findOne(userId, id);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update next of kin' })
  @ApiResponse({
    status: 200,
    description: 'Next of kin successfully updated',
    type: NextOfKin,
  })
  @ApiResponse({ status: 404, description: 'Next of kin not found' })
  @ApiResponse({ status: 400, description: 'Bad request' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async update(
    @Param('userId') userId: string,
    @Param('id') id: string,
    @Body() updateDto: UpdateNextOfKinDto,
  ): Promise<NextOfKin> {
    return this.nextOfKinService.update(userId, id, updateDto);
  }

  @Patch(':id/primary')
  @ApiOperation({ summary: 'Set next of kin as primary contact' })
  @ApiResponse({
    status: 200,
    description: 'Next of kin set as primary',
    type: NextOfKin,
  })
  @ApiResponse({ status: 404, description: 'Next of kin not found' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async setPrimary(
    @Param('userId') userId: string,
    @Param('id') id: string,
  ): Promise<NextOfKin> {
    return this.nextOfKinService.setPrimary(userId, id);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete next of kin' })
  @ApiResponse({ status: 204, description: 'Next of kin successfully deleted' })
  @ApiResponse({ status: 404, description: 'Next of kin not found' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async remove(
    @Param('userId') userId: string,
    @Param('id') id: string,
  ): Promise<void> {
    return this.nextOfKinService.remove(userId, id);
  }
}
