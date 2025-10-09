# TribeCore API Documentation

## Base URL
```
Development: http://localhost:3000/api/v1
Production: https://api.tribecore.com/api/v1
```

## Authentication

All authenticated endpoints require a Bearer token:
```
Authorization: Bearer <your-token>
```

## Endpoints

### Authentication

#### POST /auth/login
Login user
```json
{
  "email": "user@example.com",
  "password": "password123"
}
```

#### POST /auth/register
Register new user
```json
{
  "email": "user@example.com",
  "password": "password123",
  "firstName": "John",
  "lastName": "Doe"
}
```

#### GET /auth/profile
Get current user profile (requires auth)

### Employees

#### GET /employees
Get all employees with pagination
- Query params: `page`, `limit`, `search`

#### GET /employees/:id
Get employee by ID

#### POST /employees
Create new employee (requires HR role)

#### PATCH /employees/:id
Update employee (requires HR role)

#### DELETE /employees/:id
Delete employee (requires Admin role)

### Payroll

#### GET /payroll
Get all payroll records

#### POST /payroll
Create payroll record

#### POST /payroll/:id/approve
Approve payroll

#### POST /payroll/:id/process
Process payroll payment

#### GET /payroll/summary
Get payroll summary

### Leave

#### GET /leave
Get all leave requests

#### POST /leave
Create leave request

#### POST /leave/:id/approve
Approve leave

#### POST /leave/:id/reject
Reject leave

#### GET /leave/balance/:employeeId
Get leave balance

### Attendance

#### POST /attendance/clock-in
Clock in

#### POST /attendance/clock-out/:employeeId
Clock out

#### GET /attendance/employee/:employeeId
Get attendance by employee

### Performance

#### GET /performance/employee/:employeeId
Get performance reviews by employee

#### POST /performance
Create performance review

### Reports

#### GET /reports/workforce-demographics
Get workforce demographics

#### GET /reports/payroll-summary
Get payroll summary

#### GET /reports/leave-utilization
Get leave utilization

For complete API documentation with examples, visit: 
http://localhost:3000/api/v1/docs (Swagger UI)
