import { PartialType } from '@nestjs/mapped-types';
import { CreateBenefitDto, CreateEmployeeBenefitDto } from './create-benefit.dto';

export class UpdateBenefitDto extends PartialType(CreateBenefitDto) {}

export class UpdateEmployeeBenefitDto extends PartialType(CreateEmployeeBenefitDto) {}
