import { IsString, IsEnum, IsEmail, IsOptional, IsBoolean, IsDateString } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { NextOfKinRelationship } from '../entities/next-of-kin.entity';

export class CreateNextOfKinDto {
  @ApiProperty({ description: 'Full name of next of kin' })
  @IsString()
  name: string;

  @ApiProperty({
    description: 'Relationship to the user',
    enum: NextOfKinRelationship,
  })
  @IsEnum(NextOfKinRelationship)
  relationship: NextOfKinRelationship;

  @ApiProperty({ description: 'Phone number' })
  @IsString()
  phoneNumber: string;

  @ApiPropertyOptional({ description: 'Email address' })
  @IsEmail()
  @IsOptional()
  email?: string;

  @ApiPropertyOptional({ description: 'Date of birth' })
  @IsDateString()
  @IsOptional()
  dateOfBirth?: string;

  @ApiProperty({ description: 'Address line 1' })
  @IsString()
  addressLine1: string;

  @ApiPropertyOptional({ description: 'Address line 2' })
  @IsString()
  @IsOptional()
  addressLine2?: string;

  @ApiProperty({ description: 'City' })
  @IsString()
  city: string;

  @ApiPropertyOptional({ description: 'State/Province' })
  @IsString()
  @IsOptional()
  state?: string;

  @ApiProperty({ description: 'Postcode/ZIP code' })
  @IsString()
  postcode: string;

  @ApiProperty({ description: 'Country (ISO code or name)' })
  @IsString()
  country: string;

  @ApiPropertyOptional({
    description: 'Set as primary next of kin',
    default: false,
  })
  @IsBoolean()
  @IsOptional()
  isPrimary?: boolean;
}
