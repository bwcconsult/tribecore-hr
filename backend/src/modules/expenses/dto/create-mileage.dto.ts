import { IsString, IsEnum, IsOptional, IsDate, IsBoolean, IsNumber, IsArray } from 'class-validator';
import { Type } from 'class-transformer';
import { VehicleType } from '../entities/mileage.entity';

export class CreateMileageDto {
  @IsDate()
  @Type(() => Date)
  travelDate: Date;

  @IsEnum(VehicleType)
  vehicleType: VehicleType;

  @IsOptional()
  @IsString()
  vehicleRegistration?: string;

  @IsString()
  fromLocation: string;

  @IsString()
  toLocation: string;

  @IsOptional()
  @IsArray()
  route?: Array<{
    location: string;
    purpose: string;
  }>;

  @IsNumber()
  distance: number;

  @IsOptional()
  @IsString()
  distanceUnit?: string;

  @IsNumber()
  ratePerUnit: number;

  @IsString()
  purpose: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsBoolean()
  isRoundTrip?: boolean;

  @IsOptional()
  @IsBoolean()
  hasPassengers?: boolean;

  @IsOptional()
  @IsNumber()
  passengerCount?: number;

  @IsOptional()
  @IsString()
  currency?: string;

  @IsOptional()
  @IsString()
  expenseClaimId?: string;

  organizationId?: string;
  employeeId?: string;
}
