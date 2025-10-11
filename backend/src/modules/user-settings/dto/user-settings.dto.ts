import { IsString, IsEnum, IsOptional, IsBoolean, IsInt, Min, Max } from 'class-validator';

export class UpdateUserSettingsDto {
  @IsString()
  @IsOptional()
  language?: string;

  @IsString()
  @IsOptional()
  picklistLanguage?: string;

  @IsString()
  @IsOptional()
  formattingStyle?: string;

  @IsString()
  @IsOptional()
  country?: string;

  @IsString()
  @IsOptional()
  timezone?: string;

  @IsEnum(['light', 'dark', 'auto'])
  @IsOptional()
  theme?: string;

  @IsString()
  @IsOptional()
  dateFormat?: string;

  @IsEnum(['12', '24'])
  @IsOptional()
  timeFormat?: string;

  @IsString()
  @IsOptional()
  currency?: string;
}

export class UpdateNotificationPreferenceDto {
  @IsEnum(['INSTANT', 'DAILY_DIGEST', 'WEEKLY_DIGEST', 'OFF'])
  @IsOptional()
  delivery?: string;

  @IsString()
  @IsOptional()
  digestTime?: string; // Format: "HH:MM:SS"

  @IsInt()
  @Min(1)
  @Max(7)
  @IsOptional()
  digestDayOfWeek?: number;
}

export class UpdateNotificationSubscriptionDto {
  @IsBoolean()
  enabled: boolean;

  @IsEnum(['EMAIL', 'IN_APP', 'PUSH'])
  @IsOptional()
  channel?: string;
}

export class CreateNotificationDto {
  @IsString()
  userId: string;

  @IsString()
  subscriptionKey: string;

  @IsString()
  title: string;

  @IsString()
  message: string;

  @IsOptional()
  data?: any;

  @IsEnum(['EMAIL', 'IN_APP', 'PUSH'])
  @IsOptional()
  channel?: string;
}

export const DEFAULT_NOTIFICATION_SUBSCRIPTIONS = [
  {
    key: 'absence_request_overdue',
    label: 'Overdue Absence Request',
    description: 'Receive as Supervisor',
    roleContext: 'SUPERVISOR',
    enabled: true,
  },
  {
    key: 'absence_request_pending',
    label: 'Pending Absence Request',
    description: 'Receive as Supervisor',
    roleContext: 'SUPERVISOR',
    enabled: true,
  },
  {
    key: 'sickness_threshold_reached',
    label: 'Sickness Days Threshold Reached',
    description: 'Receive as Employee',
    roleContext: 'EMPLOYEE',
    enabled: true,
  },
  {
    key: 'toil_expiring',
    label: 'TOIL Expiring',
    description: 'Receive as Employee',
    roleContext: 'EMPLOYEE',
    enabled: true,
  },
  {
    key: 'holiday_unused_entitlement',
    label: 'Unused Holiday Entitlement',
    description: 'Receive as Employee',
    roleContext: 'EMPLOYEE',
    enabled: true,
  },
  {
    key: 'employee_termination_approaching',
    label: 'Employee Termination Date Approaching',
    description: 'Receive as Supervisor',
    roleContext: 'SUPERVISOR',
    enabled: true,
  },
  {
    key: 'contract_expiring',
    label: 'Employment Contract Expiring',
    description: 'Receive as Supervisor',
    roleContext: 'SUPERVISOR',
    enabled: true,
  },
  {
    key: 'probation_ending',
    label: 'Probation Period Ending',
    description: 'Receive as Supervisor',
    roleContext: 'SUPERVISOR',
    enabled: true,
  },
  {
    key: 'birthday_upcoming',
    label: 'Upcoming Birthday',
    description: 'Receive as Employee',
    roleContext: 'EMPLOYEE',
    enabled: true,
  },
  {
    key: 'training_overdue',
    label: 'Training Overdue',
    description: 'Receive as Employee',
    roleContext: 'EMPLOYEE',
    enabled: true,
  },
  {
    key: 'certification_expiring',
    label: 'Certification Expiring',
    description: 'Receive as Employee',
    roleContext: 'EMPLOYEE',
    enabled: true,
  },
  {
    key: 'performance_review_due',
    label: 'Performance Review Due',
    description: 'Receive as Supervisor',
    roleContext: 'SUPERVISOR',
    enabled: true,
  },
];
