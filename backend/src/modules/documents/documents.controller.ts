import { Controller, Get, Post, Body, Param, Delete, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { DocumentsService } from './documents.service';
import { CreateDocumentDto } from './dto/create-document.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';

@ApiTags('Documents')
@Controller('documents')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class DocumentsController {
  constructor(private readonly documentsService: DocumentsService) {}

  @Post()
  @ApiOperation({ summary: 'Upload document' })
  create(@Body() createDto: CreateDocumentDto, @CurrentUser() user: any) {
    createDto.uploadedBy = user.id;
    createDto.organizationId = user.organizationId;
    return this.documentsService.create(createDto);
  }

  @Get('employee/:employeeId')
  @ApiOperation({ summary: 'Get documents by employee' })
  findByEmployee(@Param('employeeId') employeeId: string) {
    return this.documentsService.findByEmployee(employeeId);
  }

  @Get('organization')
  @ApiOperation({ summary: 'Get documents by organization' })
  findByOrganization(@CurrentUser() user: any) {
    return this.documentsService.findByOrganization(user.organizationId);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get document by ID' })
  findOne(@Param('id') id: string) {
    return this.documentsService.findOne(id);
  }

  @Post(':id/verify')
  @ApiOperation({ summary: 'Verify document' })
  verify(@Param('id') id: string, @CurrentUser() user: any) {
    return this.documentsService.verifyDocument(id, user.id);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete document' })
  remove(@Param('id') id: string) {
    return this.documentsService.remove(id);
  }
}
