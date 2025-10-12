import { PartialType } from '@nestjs/swagger';
import { CreateExpenseClaimDto } from './create-claim.dto';

export class UpdateExpenseClaimDto extends PartialType(CreateExpenseClaimDto) {}
