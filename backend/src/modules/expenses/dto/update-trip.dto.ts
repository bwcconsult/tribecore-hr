import { PartialType } from '@nestjs/swagger';
import { CreateTripDto } from './create-trip.dto';
import { IsEnum, IsOptional, IsString } from 'class-validator';
import { TripStatus } from '../entities/trip.entity';

export class UpdateTripDto extends PartialType(CreateTripDto) {
  @IsOptional()
  @IsEnum(TripStatus)
  status?: TripStatus;

  @IsOptional()
  @IsString()
  rejectionReason?: string;
}
