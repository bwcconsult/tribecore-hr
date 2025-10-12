export enum UserRole {
  SUPER_ADMIN = 'SUPER_ADMIN',
  ADMIN = 'ADMIN',
  FINANCE = 'FINANCE',
  FINANCE_MANAGER = 'FINANCE_MANAGER',
  HR_MANAGER = 'HR_MANAGER',
  MANAGER = 'MANAGER',
  EMPLOYEE = 'EMPLOYEE',
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

export enum Country {
  UK = 'UK',
  USA = 'USA',
  NIGERIA = 'NIGERIA',
  CANADA = 'CANADA',
  INDIA = 'INDIA',
}

// ISO 4217 Currency Codes - Major World Currencies
export enum Currency {
  // Americas
  USD = 'USD', // US Dollar
  CAD = 'CAD', // Canadian Dollar
  MXN = 'MXN', // Mexican Peso
  BRL = 'BRL', // Brazilian Real
  ARS = 'ARS', // Argentine Peso
  CLP = 'CLP', // Chilean Peso
  COP = 'COP', // Colombian Peso
  
  // Europe
  EUR = 'EUR', // Euro
  GBP = 'GBP', // British Pound
  CHF = 'CHF', // Swiss Franc
  SEK = 'SEK', // Swedish Krona
  NOK = 'NOK', // Norwegian Krone
  DKK = 'DKK', // Danish Krone
  PLN = 'PLN', // Polish Zloty
  CZK = 'CZK', // Czech Koruna
  HUF = 'HUF', // Hungarian Forint
  RON = 'RON', // Romanian Leu
  BGN = 'BGN', // Bulgarian Lev
  RUB = 'RUB', // Russian Ruble
  UAH = 'UAH', // Ukrainian Hryvnia
  TRY = 'TRY', // Turkish Lira
  
  // Asia Pacific
  CNY = 'CNY', // Chinese Yuan
  JPY = 'JPY', // Japanese Yen
  KRW = 'KRW', // South Korean Won
  INR = 'INR', // Indian Rupee
  PKR = 'PKR', // Pakistani Rupee
  BDT = 'BDT', // Bangladeshi Taka
  LKR = 'LKR', // Sri Lankan Rupee
  SGD = 'SGD', // Singapore Dollar
  MYR = 'MYR', // Malaysian Ringgit
  THB = 'THB', // Thai Baht
  IDR = 'IDR', // Indonesian Rupiah
  PHP = 'PHP', // Philippine Peso
  VND = 'VND', // Vietnamese Dong
  HKD = 'HKD', // Hong Kong Dollar
  TWD = 'TWD', // Taiwan Dollar
  AUD = 'AUD', // Australian Dollar
  NZD = 'NZD', // New Zealand Dollar
  
  // Middle East
  AED = 'AED', // UAE Dirham
  SAR = 'SAR', // Saudi Riyal
  QAR = 'QAR', // Qatari Riyal
  KWD = 'KWD', // Kuwaiti Dinar
  BHD = 'BHD', // Bahraini Dinar
  OMR = 'OMR', // Omani Rial
  JOD = 'JOD', // Jordanian Dinar
  ILS = 'ILS', // Israeli Shekel
  
  // Africa
  ZAR = 'ZAR', // South African Rand
  NGN = 'NGN', // Nigerian Naira
  EGP = 'EGP', // Egyptian Pound
  KES = 'KES', // Kenyan Shilling
  GHS = 'GHS', // Ghanaian Cedi
  TZS = 'TZS', // Tanzanian Shilling
  UGX = 'UGX', // Ugandan Shilling
  MAD = 'MAD', // Moroccan Dirham
  XOF = 'XOF', // West African CFA Franc
  XAF = 'XAF', // Central African CFA Franc
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

export enum AttendanceStatus {
  PRESENT = 'PRESENT',
  ABSENT = 'ABSENT',
  LATE = 'LATE',
  HALF_DAY = 'HALF_DAY',
  ON_LEAVE = 'ON_LEAVE',
  HOLIDAY = 'HOLIDAY',
}

export enum PerformanceReviewType {
  QUARTERLY = 'QUARTERLY',
  ANNUAL = 'ANNUAL',
  PROBATION = 'PROBATION',
  MID_YEAR = 'MID_YEAR',
}

// Performance Rating is now numeric 0-100
// Rating bands for reference:
// 90-100: Outstanding
// 75-89: Exceeds Expectations
// 60-74: Meets Expectations
// 40-59: Needs Improvement
// 0-39: Unsatisfactory

export enum DocumentType {
  CONTRACT = 'CONTRACT',
  ID_PROOF = 'ID_PROOF',
  ADDRESS_PROOF = 'ADDRESS_PROOF',
  CERTIFICATE = 'CERTIFICATE',
  PAYSLIP = 'PAYSLIP',
  TAX_DOCUMENT = 'TAX_DOCUMENT',
  OTHER = 'OTHER',
}
