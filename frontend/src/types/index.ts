// User Types
export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  roles: UserRole[];
  organizationId: string;
  phoneNumber?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export enum UserRole {
  SUPER_ADMIN = 'SUPER_ADMIN',
  ADMIN = 'ADMIN',
  HR_MANAGER = 'HR_MANAGER',
  MANAGER = 'MANAGER',
  EMPLOYEE = 'EMPLOYEE',
}

// Employee Types
export interface Employee {
  id: string;
  employeeId: string;
  userId: string;
  organizationId: string;
  firstName: string;
  lastName: string;
  email: string;
  phoneNumber?: string;
  dateOfBirth?: string;
  department: string;
  jobTitle: string;
  managerId?: string;
  hireDate: string;
  terminationDate?: string;
  employmentType: EmploymentType;
  status: EmploymentStatus;
  workLocation: Country;
  baseSalary: number;
  salaryCurrency: string;
  profilePicture?: string;
  createdAt: string;
  updatedAt: string;
}

export enum EmploymentType {
  FULL_TIME = 'FULL_TIME',
  PART_TIME = 'PART_TIME',
  CONTRACT = 'CONTRACT',
  INTERN = 'INTERN',
  CONSULTANT = 'CONSULTANT',
}

export enum EmploymentStatus {
  ACTIVE = 'ACTIVE',
  INACTIVE = 'INACTIVE',
  ON_LEAVE = 'ON_LEAVE',
  TERMINATED = 'TERMINATED',
  RESIGNED = 'RESIGNED',
}

// Payroll Types
export interface Payroll {
  id: string;
  employeeId: string;
  organizationId: string;
  payPeriodStart: string;
  payPeriodEnd: string;
  payDate: string;
  frequency: PayrollFrequency;
  basicSalary: number;
  allowances: number;
  bonuses: number;
  overtime: number;
  grossPay: number;
  incomeTax: number;
  nationalInsurance: number;
  pensionContribution: number;
  totalDeductions: number;
  netPay: number;
  currency: string;
  country: Country;
  status: PayrollStatus;
  createdAt: string;
  updatedAt: string;
}

export enum PayrollFrequency {
  WEEKLY = 'WEEKLY',
  BIWEEKLY = 'BIWEEKLY',
  MONTHLY = 'MONTHLY',
  ANNUAL = 'ANNUAL',
}

export enum PayrollStatus {
  DRAFT = 'DRAFT',
  PENDING_APPROVAL = 'PENDING_APPROVAL',
  APPROVED = 'APPROVED',
  PROCESSING = 'PROCESSING',
  PAID = 'PAID',
  FAILED = 'FAILED',
}

// Leave Types
export interface Leave {
  id: string;
  employeeId: string;
  leaveType: LeaveType;
  startDate: string;
  endDate: string;
  numberOfDays: number;
  reason: string;
  status: LeaveStatus;
  approvedBy?: string;
  approvedAt?: string;
  rejectionReason?: string;
  createdAt: string;
  updatedAt: string;
}

export enum LeaveType {
  ANNUAL = 'ANNUAL',
  SICK = 'SICK',
  MATERNITY = 'MATERNITY',
  PATERNITY = 'PATERNITY',
  UNPAID = 'UNPAID',
  COMPASSIONATE = 'COMPASSIONATE',
  STUDY = 'STUDY',
}

export enum LeaveStatus {
  PENDING = 'PENDING',
  APPROVED = 'APPROVED',
  REJECTED = 'REJECTED',
  CANCELLED = 'CANCELLED',
}

// Attendance Types
export interface Attendance {
  id: string;
  employeeId: string;
  date: string;
  clockIn?: string;
  clockOut?: string;
  workMinutes?: number;
  status: AttendanceStatus;
  location?: string;
  createdAt: string;
  updatedAt: string;
}

export enum AttendanceStatus {
  PRESENT = 'PRESENT',
  ABSENT = 'ABSENT',
  LATE = 'LATE',
  HALF_DAY = 'HALF_DAY',
  ON_LEAVE = 'ON_LEAVE',
  HOLIDAY = 'HOLIDAY',
}

// Performance Types
export interface PerformanceReview {
  id: string;
  employeeId: string;
  reviewerId: string;
  reviewType: PerformanceReviewType;
  reviewPeriodStart: string;
  reviewPeriodEnd: string;
  reviewDate: string;
  overallRating: PerformanceRating;
  strengths?: string;
  areasForImprovement?: string;
  reviewerComments?: string;
  employeeComments?: string;
  employeeAcknowledged: boolean;
  createdAt: string;
  updatedAt: string;
}

export enum PerformanceReviewType {
  QUARTERLY = 'QUARTERLY',
  ANNUAL = 'ANNUAL',
  PROBATION = 'PROBATION',
  MID_YEAR = 'MID_YEAR',
}

export enum PerformanceRating {
  OUTSTANDING = 'OUTSTANDING',
  EXCEEDS_EXPECTATIONS = 'EXCEEDS_EXPECTATIONS',
  MEETS_EXPECTATIONS = 'MEETS_EXPECTATIONS',
  NEEDS_IMPROVEMENT = 'NEEDS_IMPROVEMENT',
  UNSATISFACTORY = 'UNSATISFACTORY',
}

// Common Types
export enum Country {
  UK = 'UK',
  USA = 'USA',
  NIGERIA = 'NIGERIA',
  CANADA = 'CANADA',
  INDIA = 'INDIA',
}

export enum Currency {
  GBP = 'GBP',
  USD = 'USD',
  NGN = 'NGN',
  CAD = 'CAD',
  INR = 'INR',
  EUR = 'EUR',
}

// API Response Types
export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface ApiError {
  message: string;
  statusCode: number;
  error?: string;
}
