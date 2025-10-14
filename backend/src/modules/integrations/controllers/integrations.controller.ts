import { Controller, Get, Post, Body, Param } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { IntegrationsService } from '../services/integrations.service';

@ApiTags('Integration Platform')
@Controller('integrations')
export class IntegrationsController {
  constructor(private readonly integrationsService: IntegrationsService) {}

  @Post('webhooks')
  @ApiOperation({ summary: 'Create webhook subscription' })
  async createWebhook(@Body() data: any) {
    return this.integrationsService.createWebhook(data);
  }

  @Post('webhooks/trigger')
  @ApiOperation({ summary: 'Trigger webhook (internal use)' })
  async triggerWebhook(@Body() data: any) {
    return this.integrationsService.triggerWebhook(
      data.organizationId,
      data.event,
      data.payload,
    );
  }

  @Post('connectors')
  @ApiOperation({ summary: 'Create API connector' })
  async createConnector(@Body() data: any) {
    return this.integrationsService.createConnector(data);
  }

  @Get('connectors/:organizationId')
  @ApiOperation({ summary: 'Get connectors' })
  async getConnectors(@Param('organizationId') organizationId: string) {
    return this.integrationsService.getConnectors(organizationId);
  }

  @Post('connectors/:connectorId/sync')
  @ApiOperation({ summary: 'Sync connector' })
  async syncConnector(@Param('connectorId') connectorId: string) {
    return this.integrationsService.syncConnector(connectorId);
  }
}
