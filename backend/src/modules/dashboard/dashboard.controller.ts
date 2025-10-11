import { Controller, Get, Post, Patch, Delete, Body, Param, Query, UseGuards, Req } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { DashboardService } from './dashboard.service';
import { CreateSavedSearchDto, UpdateSavedSearchDto } from './dto/create-saved-search.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { PermissionsGuard } from '../../common/guards/permissions.guard';
import { RequirePermissions, CanViewSelf } from '../../common/decorators/permissions.decorator';

@ApiTags('Dashboard')
@ApiBearerAuth()
@Controller('dashboard')
@UseGuards(JwtAuthGuard, PermissionsGuard)
export class DashboardController {
  constructor(private readonly dashboardService: DashboardService) {}

  @Get('widgets')
  @ApiOperation({ summary: 'Get widgets for current user role' })
  @CanViewSelf('dashboard')
  async getMyWidgets(@Req() req) {
    const primaryRole = req.user.roles[0]; // Get primary role
    return this.dashboardService.getWidgetsForRole(primaryRole);
  }

  @Get('saved-searches')
  @ApiOperation({ summary: 'Get user saved searches' })
  @CanViewSelf('dashboard')
  async getMySavedSearches(@Req() req, @Query('category') category?: string) {
    return this.dashboardService.getUserSavedSearches(req.user.id, category);
  }

  @Get('saved-searches/shared')
  @ApiOperation({ summary: 'Get shared searches accessible to user' })
  @CanViewSelf('dashboard')
  async getSharedSearches(@Req() req) {
    return this.dashboardService.getSharedSearches(req.user.id, req.user.roles);
  }

  @Post('saved-searches')
  @ApiOperation({ summary: 'Create saved search' })
  @RequirePermissions({ feature: 'dashboard', action: 'create_search', scope: 'self' })
  async createSavedSearch(@Req() req, @Body() dto: CreateSavedSearchDto) {
    return this.dashboardService.createSavedSearch(req.user.id, dto);
  }

  @Patch('saved-searches/:id')
  @ApiOperation({ summary: 'Update saved search' })
  @RequirePermissions({ feature: 'dashboard', action: 'create_search', scope: 'self' })
  async updateSavedSearch(
    @Param('id') id: string,
    @Req() req,
    @Body() dto: UpdateSavedSearchDto,
  ) {
    return this.dashboardService.updateSavedSearch(id, req.user.id, dto);
  }

  @Delete('saved-searches/:id')
  @ApiOperation({ summary: 'Delete saved search' })
  @RequirePermissions({ feature: 'dashboard', action: 'create_search', scope: 'self' })
  async deleteSavedSearch(@Param('id') id: string, @Req() req) {
    await this.dashboardService.deleteSavedSearch(id, req.user.id);
    return { message: 'Saved search deleted successfully' };
  }

  @Post('saved-searches/:id/execute')
  @ApiOperation({ summary: 'Execute saved search (increments usage count)' })
  @CanViewSelf('dashboard')
  async executeSavedSearch(@Param('id') id: string, @Req() req) {
    return this.dashboardService.executeSavedSearch(id, req.user.id);
  }

  @Get('admin/widgets')
  @ApiOperation({ summary: 'Get all widget configurations (admin)' })
  @RequirePermissions({ feature: 'dashboard', action: 'configure', scope: 'org' })
  async getAllWidgetConfigs() {
    return this.dashboardService.getAllWidgetConfigs();
  }

  @Patch('admin/widgets/:id')
  @ApiOperation({ summary: 'Update widget configuration (admin)' })
  @RequirePermissions({ feature: 'dashboard', action: 'configure', scope: 'org' })
  async updateWidgetConfig(@Param('id') id: string, @Body() updates: any) {
    return this.dashboardService.updateWidgetConfig(id, updates);
  }

  @Patch('admin/widgets/:id/toggle')
  @ApiOperation({ summary: 'Toggle widget enabled state (admin)' })
  @RequirePermissions({ feature: 'dashboard', action: 'configure', scope: 'org' })
  async toggleWidget(@Param('id') id: string, @Body('isEnabled') isEnabled: boolean) {
    return this.dashboardService.toggleWidget(id, isEnabled);
  }
}
