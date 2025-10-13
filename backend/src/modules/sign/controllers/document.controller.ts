import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Delete,
  Query,
  UseGuards,
  Request,
  Patch,
} from '@nestjs/common';
import { DocumentService } from '../services/document.service';
import { CreateDocumentDto } from '../dto/create-document.dto';
import { JwtAuthGuard } from '../../../common/guards/jwt-auth.guard';

@Controller('sign/documents')
@UseGuards(JwtAuthGuard)
export class DocumentController {
  constructor(private readonly documentService: DocumentService) {}

  @Post()
  create(@Body() createDocumentDto: CreateDocumentDto, @Request() req) {
    return this.documentService.create(createDocumentDto, req.user.id);
  }

  @Get()
  findAll(@Request() req, @Query() filters: any) {
    return this.documentService.findAll(req.user.id, filters);
  }

  @Get('received')
  findReceived(@Request() req) {
    return this.documentService.findReceived(req.user.email);
  }

  @Get('statistics')
  getStatistics(@Request() req) {
    return this.documentService.getStatistics(req.user.id);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.documentService.findOne(id);
  }

  @Patch(':id/send')
  sendDocument(@Param('id') id: string, @Request() req) {
    return this.documentService.sendDocument(id, req.user.id);
  }

  @Patch(':id/recall')
  recallDocument(@Param('id') id: string, @Request() req) {
    return this.documentService.recallDocument(id, req.user.id);
  }

  @Post(':id/sign')
  signDocument(
    @Param('id') id: string,
    @Body() body: { recipientId: string; signatureData: string },
  ) {
    return this.documentService.signDocument(
      id,
      body.recipientId,
      body.signatureData,
    );
  }

  @Post(':id/decline')
  declineDocument(
    @Param('id') id: string,
    @Body() body: { recipientId: string; reason: string },
  ) {
    return this.documentService.declineDocument(
      id,
      body.recipientId,
      body.reason,
    );
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.documentService.delete(id);
  }
}
