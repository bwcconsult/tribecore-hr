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
} from '@nestjs/common';
import { TemplateService } from '../services/template.service';
import { CreateOnboardingTemplateDto } from '../dto/create-onboarding-template.dto';

@Controller('api/v1/onboarding/templates')
export class TemplateController {
  constructor(private readonly templateService: TemplateService) {}

  @Post()
  async createTemplate(@Body() dto: CreateOnboardingTemplateDto) {
    return this.templateService.createTemplate(dto);
  }

  @Get()
  async getTemplates(
    @Query('organizationId') organizationId: string,
    @Query('country') country?: string,
    @Query('active') active?: string,
    @Query('tags') tags?: string,
  ) {
    return this.templateService.getTemplates({
      organizationId,
      country,
      active: active ? active === 'true' : undefined,
      tags: tags ? tags.split(',') : undefined,
    });
  }

  @Get(':id')
  async getTemplate(@Param('id') id: string) {
    return this.templateService.getTemplate(id);
  }

  @Put(':id')
  async updateTemplate(
    @Param('id') id: string,
    @Body() dto: Partial<CreateOnboardingTemplateDto>,
  ) {
    return this.templateService.updateTemplate(id, dto);
  }

  @Delete(':id')
  async deleteTemplate(@Param('id') id: string) {
    await this.templateService.deleteTemplate(id);
    return { message: 'Template deleted successfully' };
  }

  @Post(':id/clone')
  async cloneTemplate(@Param('id') id: string, @Body('name') name?: string) {
    return this.templateService.cloneTemplate(id, name);
  }

  @Post(':id/generate-case')
  async generateCase(
    @Param('id') templateId: string,
    @Body()
    body: {
      employeeId: string;
      startDate: string;
      candidateId?: string;
      organizationId?: string;
      country?: string;
      site?: string;
      department?: string;
      jobTitle?: string;
      hiringManagerId?: string;
      buddyId?: string;
      mentorId?: string;
      metadata?: any;
    },
  ) {
    return this.templateService.generateCaseFromTemplate(
      templateId,
      body.employeeId,
      new Date(body.startDate),
      {
        candidateId: body.candidateId,
        organizationId: body.organizationId,
        country: body.country,
        site: body.site,
        department: body.department,
        jobTitle: body.jobTitle,
        hiringManagerId: body.hiringManagerId,
        buddyId: body.buddyId,
        mentorId: body.mentorId,
        metadata: body.metadata,
      },
    );
  }
}
