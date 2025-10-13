import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

// Entities
import { Document } from './entities/document.entity';
import { Recipient } from './entities/recipient.entity';
import { Template } from './entities/template.entity';
import { SignForm } from './entities/sign-form.entity';
import { ActivityLog } from './entities/activity-log.entity';
import { UserSignature } from './entities/user-signature.entity';

// Services
import { DocumentService } from './services/document.service';
import { TemplateService } from './services/template.service';
import { SignFormService } from './services/sign-form.service';
import { ActivityLogService } from './services/activity-log.service';
import { UserSignatureService } from './services/user-signature.service';

// Controllers
import { DocumentController } from './controllers/document.controller';
import { TemplateController } from './controllers/template.controller';
import { SignFormController } from './controllers/sign-form.controller';
import { ActivityLogController } from './controllers/activity-log.controller';
import { UserSignatureController } from './controllers/user-signature.controller';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Document,
      Recipient,
      Template,
      SignForm,
      ActivityLog,
      UserSignature,
    ]),
  ],
  controllers: [
    DocumentController,
    TemplateController,
    SignFormController,
    ActivityLogController,
    UserSignatureController,
  ],
  providers: [
    DocumentService,
    TemplateService,
    SignFormService,
    ActivityLogService,
    UserSignatureService,
  ],
  exports: [
    DocumentService,
    TemplateService,
    SignFormService,
    ActivityLogService,
    UserSignatureService,
  ],
})
export class SignModule {}
