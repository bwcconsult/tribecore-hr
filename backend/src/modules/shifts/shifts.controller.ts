import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
  Request,
} from '@nestjs/common';
import { ShiftsService } from './shifts.service';
import { CreateShiftDto, UpdateShiftDto, CreateRotaDto, AssignShiftDto, SwapShiftDto } from './dto/create-shift.dto';
import { ShiftStatus } from './entities/shift.entity';

@Controller('shifts')
export class ShiftsController {
  constructor(private readonly shiftsService: ShiftsService) {}

  // ===== SHIFTS ENDPOINTS =====

  @Post()
  async createShift(@Body() createShiftDto: CreateShiftDto, @Request() req) {
    return this.shiftsService.createShift(createShiftDto, req.user?.id || 'system');
  }

  @Get()
  async findAllShifts(
    @Query('organizationId') organizationId?: string,
    @Query('employeeId') employeeId?: string,
    @Query('department') department?: string,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
    @Query('status') status?: ShiftStatus,
    @Query('isOpenShift') isOpenShift?: string,
  ) {
    return this.shiftsService.findAllShifts({
      organizationId,
      employeeId,
      department,
      startDate: startDate ? new Date(startDate) : undefined,
      endDate: endDate ? new Date(endDate) : undefined,
      status,
      isOpenShift: isOpenShift === 'true',
    });
  }

  @Get(':id')
  async findShiftById(@Param('id') id: string) {
    return this.shiftsService.findShiftById(id);
  }

  @Put(':id')
  async updateShift(@Param('id') id: string, @Body() updateShiftDto: UpdateShiftDto) {
    return this.shiftsService.updateShift(id, updateShiftDto);
  }

  @Delete(':id')
  async deleteShift(@Param('id') id: string) {
    await this.shiftsService.deleteShift(id);
    return { message: 'Shift deleted successfully' };
  }

  @Post(':id/assign')
  async assignOpenShift(@Param('id') id: string, @Body() assignDto: AssignShiftDto) {
    return this.shiftsService.assignOpenShift(id, assignDto);
  }

  @Post(':id/swap')
  async requestShiftSwap(@Param('id') id: string, @Body() swapDto: SwapShiftDto) {
    await this.shiftsService.requestShiftSwap(id, swapDto);
    return { message: 'Shift swap requested successfully' };
  }

  @Post(':id/swap/:targetId/approve')
  async approveShiftSwap(
    @Param('id') id: string,
    @Param('targetId') targetId: string,
    @Request() req,
  ) {
    await this.shiftsService.approveShiftSwap(id, targetId, req.user?.id || 'system');
    return { message: 'Shift swap approved successfully' };
  }

  @Post('publish')
  async publishShifts(@Body('shiftIds') shiftIds: string[]) {
    await this.shiftsService.publishShifts(shiftIds);
    return { message: 'Shifts published successfully' };
  }

  @Get('employee/:employeeId/hours')
  async getEmployeeShiftHours(
    @Param('employeeId') employeeId: string,
    @Query('startDate') startDate: string,
    @Query('endDate') endDate: string,
  ) {
    return this.shiftsService.getEmployeeShiftHours(
      employeeId,
      new Date(startDate),
      new Date(endDate),
    );
  }

  // ===== ROTAS ENDPOINTS =====

  @Post('rotas')
  async createRota(@Body() createRotaDto: CreateRotaDto, @Request() req) {
    return this.shiftsService.createRota(createRotaDto, req.user?.id || 'system');
  }

  @Get('rotas/organization/:organizationId')
  async findAllRotas(@Param('organizationId') organizationId: string) {
    return this.shiftsService.findAllRotas(organizationId);
  }

  @Get('rotas/:id')
  async findRotaById(@Param('id') id: string) {
    return this.shiftsService.findRotaById(id);
  }

  @Get('rotas/:id/details')
  async getRotaWithShifts(@Param('id') id: string) {
    return this.shiftsService.getRotaWithShifts(id);
  }

  @Post('rotas/:id/publish')
  async publishRota(@Param('id') id: string, @Request() req) {
    return this.shiftsService.publishRota(id, req.user?.id || 'system');
  }

  @Delete('rotas/:id')
  async deleteRota(@Param('id') id: string) {
    await this.shiftsService.deleteRota(id);
    return { message: 'Rota deleted successfully' };
  }

  // ===== ANALYTICS =====

  @Get('analytics/overview')
  async getShiftAnalytics(
    @Query('organizationId') organizationId: string,
    @Query('startDate') startDate: string,
    @Query('endDate') endDate: string,
    @Query('department') department?: string,
  ) {
    return this.shiftsService.getShiftAnalytics({
      organizationId,
      startDate: new Date(startDate),
      endDate: new Date(endDate),
      department,
    });
  }
}
