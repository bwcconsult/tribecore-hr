import {
  Controller,
  Get,
  Patch,
  Body,
  UseGuards,
  Request,
} from '@nestjs/common';
import { UserSignatureService } from '../services/user-signature.service';
import { UpdateUserSignatureDto } from '../dto/update-user-signature.dto';
import { JwtAuthGuard } from '../../../common/guards/jwt-auth.guard';

@Controller('sign/profile')
@UseGuards(JwtAuthGuard)
export class UserSignatureController {
  constructor(
    private readonly userSignatureService: UserSignatureService,
  ) {}

  @Get()
  getProfile(@Request() req) {
    return this.userSignatureService.getProfile(req.user.id);
  }

  @Patch()
  updateProfile(
    @Request() req,
    @Body() updateUserSignatureDto: UpdateUserSignatureDto,
  ) {
    return this.userSignatureService.update(
      req.user.id,
      updateUserSignatureDto,
    );
  }
}
