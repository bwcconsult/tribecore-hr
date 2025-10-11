import { IsDateString, IsEnum, IsOptional, IsArray, IsString } from 'class-validator';
import { Type } from 'class-transformer';
import { CalendarEventType } from '../entities/calendar-event.entity';

export enum CalendarScope {
  SELF = 'SELF',
  DIRECT_REPORTS = 'DIRECT_REPORTS',
  TEAM = 'TEAM',
  ORGANIZATION = 'ORGANIZATION',
  PEERS = 'PEERS',
  MANAGER = 'MANAGER',
}

export enum CalendarView {
  DAY = 'DAY',
  WEEK = 'WEEK',
  MONTH = 'MONTH',
  TIMELINE_MONTH = 'TIMELINE_MONTH',
  ANNUAL = 'ANNUAL',
}

export class CalendarQueryDto {
  @IsDateString()
  from: string;

  @IsDateString()
  to: string;

  @IsEnum(CalendarScope)
  @IsOptional()
  scope?: CalendarScope = CalendarScope.SELF;

  @IsArray()
  @IsEnum(CalendarEventType, { each: true })
  @IsOptional()
  types?: CalendarEventType[];

  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  userIds?: string[]; // For multi-select filtering

  @IsOptional()
  @IsString()
  region?: string; // For bank holidays filtering
}

export class CalendarExportDto {
  @IsEnum(CalendarView)
  view: CalendarView;

  @IsDateString()
  from: string;

  @IsDateString()
  to: string;

  @IsArray()
  @IsEnum(CalendarEventType, { each: true })
  @IsOptional()
  types?: CalendarEventType[];

  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  userIds?: string[];

  @IsString()
  @IsOptional()
  title?: string;
}

export class AnnualOverviewDto {
  @IsString()
  year: string;

  @IsString()
  @IsOptional()
  userId?: string;
}

export class ICSSubscriptionDto {
  @IsEnum(CalendarScope)
  scope: CalendarScope;

  @IsString()
  @IsOptional()
  token?: string; // Secure token for subscription
}
