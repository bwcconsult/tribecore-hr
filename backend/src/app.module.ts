import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ScheduleModule } from '@nestjs/schedule';
import * as Joi from 'joi';

// Modules
import { AuthModule } from './modules/auth/auth.module';
import { UsersModule } from './modules/users/users.module';
import { EmployeesModule } from './modules/employees/employees.module';
import { PayrollModule } from './modules/payroll/payroll.module';
import { LeaveModule } from './modules/leave/leave.module';
import { AttendanceModule } from './modules/attendance/attendance.module';
import { PerformanceModule } from './modules/performance/performance.module';
import { ComplianceModule } from './modules/compliance/compliance.module';
import { ReportsModule } from './modules/reports/reports.module';
import { OrganizationModule } from './modules/organization/organization.module';
import { DocumentsModule } from './modules/documents/documents.module';
import { RecruitmentModule } from './modules/recruitment/recruitment.module';
import { TimeTrackingModule } from './modules/time-tracking/time-tracking.module';
import { OnboardingModule } from './modules/onboarding/onboarding.module';
import { BenefitsModule } from './modules/benefits/benefits.module';
import { ExpensesModule } from './modules/expenses/expenses.module';
import { LearningModule } from './modules/learning/learning.module';
import { CalendarModule } from './modules/calendar/calendar.module';
import { UserSettingsModule } from './modules/user-settings/user-settings.module';
import { RbacModule } from './modules/rbac/rbac.module';
import { AbsenceModule } from './modules/absence/absence.module';
import { TasksModule } from './modules/tasks/tasks.module';
import { DashboardModule } from './modules/dashboard/dashboard.module';

@Module({
  imports: [
    // Configuration
    ConfigModule.forRoot({
      isGlobal: true,
      validationSchema: Joi.object({
        NODE_ENV: Joi.string().valid('development', 'production', 'test').default('development'),
        PORT: Joi.number().default(3000),
        DATABASE_HOST: Joi.string().required(),
        DATABASE_PORT: Joi.number().default(5432),
        DATABASE_NAME: Joi.string().required(),
        DATABASE_USER: Joi.string().required(),
        DATABASE_PASSWORD: Joi.string().required(),
        JWT_SECRET: Joi.string().required(),
        JWT_EXPIRATION: Joi.string().default('7d'),
      }),
    }),

    // Database
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        type: 'postgres',
        host: configService.get('DATABASE_HOST'),
        port: configService.get('DATABASE_PORT'),
        username: configService.get('DATABASE_USER'),
        password: configService.get('DATABASE_PASSWORD'),
        database: configService.get('DATABASE_NAME'),
        entities: [__dirname + '/**/*.entity{.ts,.js}'],
        synchronize: configService.get('NODE_ENV') !== 'production', // Auto-create tables in dev, use migrations in prod
        logging: configService.get('DATABASE_LOGGING') === 'true',
        ssl: configService.get('DATABASE_SSL') === 'true' ? { rejectUnauthorized: false } : false,
      }),
    }),

    // Schedule (for cron jobs)
    ScheduleModule.forRoot(),

    // Feature Modules
    AuthModule,
    UsersModule,
    EmployeesModule,
    PayrollModule,
    LeaveModule,
    AttendanceModule,
    PerformanceModule,
    ComplianceModule,
    ReportsModule,
    OrganizationModule,
    DocumentsModule,
    RecruitmentModule,
    TimeTrackingModule,
    OnboardingModule,
    BenefitsModule,
    ExpensesModule,
    LearningModule,
    CalendarModule,
    UserSettingsModule,
    RbacModule,
    AbsenceModule,
    TasksModule,
    DashboardModule,
  ],
})
export class AppModule {}
