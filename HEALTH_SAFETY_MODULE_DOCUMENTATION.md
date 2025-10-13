# Health & Safety Module - Complete UK Compliance System

## Overview
The Health & Safety Module provides comprehensive coverage of all UK health and safety legislation, helping organizations of all sizes maintain HASAWA 1974 compliance and manage workplace safety effectively.

## Covered Legislation

### 1. Health and Safety at Work etc. Act 1974 (HASAWA)
The Foundation of UK H&S Law - Core Principle: "So far as is reasonably practicable"

Features:
- H&S Policy management (required for 5+ employees)
- Risk assessment framework
- Employer responsibility tracking
- Employee duty monitoring

### 2. Management of Health and Safety at Work Regulations 1999
Risk Assessment Requirements with 5-step methodology

### 3. RIDDOR 2013
Reporting of Injuries, Diseases and Dangerous Occurrences
- Deaths, specified injuries, over-7-day injuries
- 10-day and 15-day reporting deadlines
- HSE submission tracking

### 4. COSHH Regulations 2002
Control of Substances Hazardous to Health
- Substance register with 9 hazard classes
- Safety Data Sheet management
- Control measures tracking

### 5. Display Screen Equipment Regulations 1992
Workstation assessments for habitual users
- 6-point assessment system
- Eye test provision tracking

### 6. Manual Handling Operations Regulations 1992
TILE Assessment (Task, Individual, Load, Environment)
- Hierarchy of controls implementation

### 7. Fire Safety Order 2005
Fire Risk Assessments with 5-step process

### 8. PPE at Work Regulations 1992
Last resort protection with full inventory management

## Backend Architecture

### New Entities Created
1. HealthSafetyPolicy - Written policy for 5+ employees
2. TrainingRecord - Competency tracking with expiry management
3. DSEAssessment - Display screen equipment evaluations
4. ManualHandlingAssessment - TILE methodology
5. FireRiskAssessment - Comprehensive fire safety
6. RIDDORReport - Serious incident reporting
7. PPEManagement - Stock and issue tracking
8. WorkplaceInspection - Regular safety inspections
9. HSEEnforcement - Improvement/prohibition notices

### Services
- HealthSafetyEnhancedService - Complete business logic
- Automated compliance scoring
- Expiry notifications
- Review scheduling

### API Endpoints
Base: /health-safety-enhanced

- POST /policies - Create H&S policy
- GET /policies/active - Get current policy
- POST /training - Record training
- GET /training/expiring - Get expiring certificates
- POST /dse-assessments - Create DSE assessment
- GET /dse-assessments/due-review - Get overdue reviews
- POST /manual-handling - Manual handling assessment
- POST /fire-risk-assessments - Fire risk assessment
- POST /riddor - RIDDOR report submission
- POST /ppe - Add PPE to inventory
- POST /ppe/:id/issue - Issue PPE to employee
- GET /ppe/low-stock - Low stock alerts
- POST /inspections - Workplace inspection
- POST /enforcement - HSE enforcement notice
- GET /dashboard - Compliance dashboard

## Frontend Pages

### 1. Compliance Dashboard (/health-safety/compliance-dashboard)
- Overall compliance score
- Key metrics across all modules
- UK legislation coverage overview
- Quick action links

### 2. Training Management (/health-safety/training)
- Training record management
- Expiry tracking (30-day alerts)
- Certificate management
- Competency matrix

### 3. DSE Assessments (/health-safety/dse)
- Workstation evaluations
- 6-point risk assessment
- Action plan generation
- Annual review scheduling

### 4. PPE Management (/health-safety/ppe)
- Inventory tracking
- Low stock alerts
- Issue records with signatures
- Maintenance scheduling

### 5. Existing Pages Enhanced
- Risk Assessments
- Incident Reporting (RIDDOR-ready)
- COSHH Management
- Method Statements
- Responsibilities Assignment

## Key Features

### Compliance Scoring
Real-time compliance percentage based on:
- Policy status (5+ employees requirement)
- Training currency
- Assessment completion
- Incident management
- HSE enforcement compliance

### Automated Workflows
- Training expiry notifications (30 days)
- DSE review reminders (annual)
- Risk assessment review scheduling
- PPE reorder alerts
- RIDDOR deadline tracking

### Proportionality
System adapts to company size:
- Small businesses (< 5 employees): Simplified requirements
- Medium businesses (5-50): Standard requirements
- Large businesses (50+): Full documentation

## Employer Responsibilities (HASAWA Section 2)

1. Safe systems of work
2. Safe plant and equipment
3. Safe handling, storage and transport of substances
4. Information, instruction, training and supervision
5. Safe workplace
6. Consultation with employees

## Employee Duties (HASAWA Section 7)

1. Take reasonable care of own health & safety
2. Take reasonable care of others affected by actions
3. Cooperate with employer
4. Not interfere with or misuse safety equipment
5. Report hazards and defects

## HSE Enforcement

### Enforcement Actions Tracked
1. Improvement Notices (time to comply)
2. Prohibition Notices (immediate/deferred)
3. Prosecutions
4. Fee for Intervention (FFI)

### Notice Management
- Compliance deadline tracking
- Action plan creation
- Evidence documentation
- Appeal process (21-day window)
- Verification of compliance

## Regulatory Compliance

### HSE Inspection Readiness
- All records centralized
- Audit trail for all actions
- Policy documentation
- Training records
- Assessment history
- Incident logs
- Improvement tracking

### Record Retention
- Risk assessments: Life of premises + 5 years
- Training records: Employee tenure + 7 years
- RIDDOR reports: 3 years minimum
- Medical records: 40 years (COSHH)
- Accident book: 3 years

## Future Enhancements

1. Mobile inspection app
2. AI hazard detection from photos
3. Wearable device integration
4. Predictive risk analytics
5. Benchmarking against industry standards
6. Direct HSE form submission
7. Contractor management
8. Permit to work system
9. Lock-out/Tag-out tracking
10. Near-miss trending analysis

## Integration Points

- HR System: Employee data, training schedules
- Payroll: Accident-related absence
- Facilities: Building maintenance
- Procurement: PPE ordering
- Legal: Incident investigations
- Insurance: Claims management

## Technical Stack

Backend:
- NestJS
- TypeORM
- PostgreSQL
- TypeScript

Frontend:
- React 18
- TypeScript
- TailwindCSS
- Lucide Icons

## Support & Resources

Internal:
- 24/7 H&S advisory service
- Template library
- Risk assessment guides

External:
- HSE website (hse.gov.uk)
- HSE guidance documents (HSG series)
- Industry-specific guidance
- INDG series (information sheets)

## Conclusion

This Health & Safety Module provides end-to-end UK compliance for organizations of all sizes, ensuring legal compliance with HASAWA 1974 and all major H&S regulations. The system is designed to be proportionate, user-friendly, and comprehensive.

Version: 1.0.0
Last Updated: October 2025
Maintained By: TribeCore HR Platform Team
