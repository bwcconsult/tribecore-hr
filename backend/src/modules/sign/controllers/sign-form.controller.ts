import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Delete,
  UseGuards,
  Request,
  Patch,
  Query,
} from '@nestjs/common';
import { SignFormService } from '../services/sign-form.service';
import { CreateSignFormDto } from '../dto/create-sign-form.dto';
import { JwtAuthGuard } from '../../../common/guards/jwt-auth.guard';

@Controller('sign/sign-forms')
@UseGuards(JwtAuthGuard)
export class SignFormController {
  constructor(private readonly signFormService: SignFormService) {}

  @Post()
  create(@Body() createSignFormDto: CreateSignFormDto, @Request() req) {
    return this.signFormService.create(createSignFormDto, req.user.id);
  }

  @Get()
  findAll(@Request() req, @Query() filters: any) {
    return this.signFormService.findAll(req.user.id, filters);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.signFormService.findOne(id);
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updateSignFormDto: Partial<CreateSignFormDto>,
  ) {
    return this.signFormService.update(id, updateSignFormDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.signFormService.delete(id);
  }
}
