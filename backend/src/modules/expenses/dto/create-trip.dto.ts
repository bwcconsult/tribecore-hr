import { IsString, IsEnum, IsOptional, IsDate, IsBoolean, IsObject, IsArray, IsNumber } from 'class-validator';
import { Type } from 'class-transformer';
import { TripType } from '../entities/trip.entity';

export class CreateTripDto {
  @IsString()
  tripName: string;

  @IsEnum(TripType)
  tripType: TripType;

  @IsString()
  fromLocation: string;

  @IsString()
  toLocation: string;

  @IsOptional()
  @IsString()
  destinationCountry?: string;

  @IsOptional()
  @IsBoolean()
  isVisaRequired?: boolean;

  @IsOptional()
  @IsString()
  businessPurpose?: string;

  @IsDate()
  @Type(() => Date)
  startDate: Date;

  @IsDate()
  @Type(() => Date)
  endDate: Date;

  @IsOptional()
  @IsObject()
  travelPreferences?: {
    flightClass?: string;
    hotelPreference?: string;
    mealPreference?: string;
    specialRequests?: string;
  };

  @IsOptional()
  @IsNumber()
  estimatedCost?: number;

  @IsOptional()
  @IsString()
  currency?: string;

  @IsOptional()
  @IsString()
  notes?: string;

  @IsOptional()
  @IsArray()
  documents?: string[];

  @IsOptional()
  @IsArray()
  itinerary?: Array<{
    date: string;
    time: string;
    activity: string;
    location: string;
  }>;

  organizationId?: string;
  employeeId?: string;
}
