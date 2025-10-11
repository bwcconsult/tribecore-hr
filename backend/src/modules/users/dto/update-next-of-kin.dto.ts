import { PartialType } from '@nestjs/swagger';
import { CreateNextOfKinDto } from './create-next-of-kin.dto';

export class UpdateNextOfKinDto extends PartialType(CreateNextOfKinDto) {}
