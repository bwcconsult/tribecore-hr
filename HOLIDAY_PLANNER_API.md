# Holiday Planner API Documentation

**Version:** 1.0.0  
**Base URL:** `/api/leave`  
**Authentication:** Bearer Token Required

---

## Table of Contents
1. [Overview](#overview)
2. [Leave Requests](#leave-requests)
3. [Balances](#balances)
4. [Public Holidays](#public-holidays)
5. [Policy Management](#policy-management)
6. [Payroll Exports](#payroll-exports)
7. [Error Handling](#error-handling)
8. [Rate Limiting](#rate-limiting)

---

## Overview

The Holiday Planner API provides comprehensive leave management capabilities including:
- Policy-driven leave types (AL, SICK, TOIL, MAT, PAT, etc.)
- Working pattern-aware calculations
- Multi-level approval workflows
- Coverage/staffing validation
- Payroll integration
- Multi-region support (UK, US, SA, NG, NHS)

### Authentication

All API requests require a valid Bearer token:

```bash
Authorization: Bearer <your_token_here>
```

---

## Leave Requests

### Create Leave Request

**POST** `/leave/requests`

Creates a new leave request with full validation pipeline.

#### Request Body

```json
{
  "employeeId": "EMP001",
  "leaveTypeCode": "AL",
  "startDate": "2025-08-12T00:00:00Z",
  "endDate": "2025-08-16T23:59:59Z",
  "partialDays": [
    {
      "date": "2025-08-12",
      "startTime": "09:00",
      "endTime": "13:00",
      "minutes": 240
    }
  ],
  "reason": "Family wedding",
  "employeeNotes": "Will be back in office on Monday",
  "attachments": [
    {
      "name": "invitation.pdf",
      "type": "DOCUMENT",
      "url": "/uploads/inv.pdf"
    }
  ],
  "coverEmployeeId": "EMP002"
}
```

#### Response (201 Created)

```json
{
  "id": "REQ-001",
  "status": "PENDING",
  "autoApproved": false,
  "totalDaysRequested": 4,
  "totalHoursRequested": "30.00",
  "balanceAfter": "170.50",
  "warnings": [
    "Requires 7 days notice"
  ],
  "coverageBreaches": [
    {
      "date": "2025-08-14",
      "scope": "DEPT:ENGINEERING",
      "role": "Developer",
      "scheduled": 10,
      "onLeave": 3,
      "remaining": 6,
      "minRequired": 5,
      "status": "WARNING",
      "coveragePercent": 70
    }
  ],
  "suggestedAlternatives": [
    "2025-08-19T00:00:00Z",
    "2025-08-26T00:00:00Z"
  ]
}
```

#### Validation Pipeline

1. ✅ Leave type exists
2. ✅ Working pattern configured
3. ✅ Public holidays fetched
4. ✅ Deductions calculated (segment-by-segment)
5. ✅ Notice period checked
6. ✅ Balance verified
7. ✅ Embargoes checked
8. ✅ Coverage validated
9. ✅ Auto-approval evaluated
10. ✅ Approval chain built

---

### Get Leave Requests

**GET** `/leave/requests`

Retrieves leave requests with optional filters.

#### Query Parameters

- `status` - Filter by status (PENDING, APPROVED, REJECTED, CANCELLED)
- `employeeId` - Filter by employee
- `approverId` - Get requests pending approval by specific manager
- `startDate` - Filter by start date (YYYY-MM-DD)
- `endDate` - Filter by end date (YYYY-MM-DD)

#### Example

```bash
GET /leave/requests?status=PENDING&approverId=MGR001
```

#### Response (200 OK)

```json
[
  {
    "id": "REQ-001",
    "employeeId": "EMP001",
    "leaveType": "Annual Leave",
    "leaveTypeCode": "AL",
    "startDate": "2025-08-12",
    "endDate": "2025-08-16",
    "durationHours": "30.00",
    "durationDays": 4,
    "status": "PENDING",
    "reason": "Family wedding",
    "createdAt": "2025-07-15T10:30:00Z"
  }
]
```

---

### Get Leave Request Details

**GET** `/leave/requests/:id`

Retrieves full details of a leave request including segments and approvals.

#### Response (200 OK)

```json
{
  "id": "REQ-001",
  "employeeId": "EMP001",
  "leaveType": {
    "id": "LT-001",
    "code": "AL",
    "name": "Annual Leave",
    "color": "#4CAF50"
  },
  "startDate": "2025-08-12T00:00:00Z",
  "endDate": "2025-08-16T23:59:59Z",
  "totalMinutesDeducted": 1800,
  "workingDaysCount": 4,
  "status": "PENDING",
  "segments": [
    {
      "id": "SEG-001",
      "date": "2025-08-12",
      "dayOfWeek": "TUE",
      "minutesDeducted": 240,
      "isWorkingDay": true,
      "isPublicHoliday": false,
      "isPartialDay": true
    }
  ],
  "approvals": [
    {
      "id": "APP-001",
      "step": 1,
      "stepName": "LINE_MANAGER",
      "approverId": "MGR001",
      "decision": "PENDING",
      "dueAt": "2025-07-17T10:30:00Z",
      "isOverdue": false
    }
  ],
  "coverageAnalysis": {
    "affected": true,
    "breaches": [...]
  }
}
```

---

### Approve Leave Request

**POST** `/leave/requests/:id/approve`

Approves the current approval step.

#### Request Body

```json
{
  "comment": "Approved - coverage looks good",
  "override": {
    "type": "COVERAGE",
    "reason": "Emergency backfill arranged",
    "authorizedBy": "HEAD001"
  },
  "requiresBackfill": true,
  "backfillAssignedTo": "EMP999"
}
```

#### Response (200 OK)

```json
{
  "approved": true,
  "completed": false,
  "nextStep": "DEPARTMENT_HEAD",
  "message": "Approved - awaiting DEPARTMENT_HEAD"
}
```

---

### Reject Leave Request

**POST** `/leave/requests/:id/reject`

Rejects a leave request.

#### Request Body

```json
{
  "reason": "Insufficient coverage during peak period",
  "suggestedAction": "Please reschedule to week of Aug 26"
}
```

#### Response (200 OK)

```json
{
  "rejected": true,
  "message": "Request rejected"
}
```

---

### Cancel Leave Request

**POST** `/leave/requests/:id/cancel`

Cancels a leave request (employee or manager).

#### Response (200 OK)

```json
{
  "cancelled": true,
  "message": "Request cancelled and balance restored"
}
```

---

## Balances

### Get Employee Leave Balances

**GET** `/employees/:id/leave/balances`

Retrieves all leave balances for an employee.

#### Query Parameters

- `asOf` - Balance as of specific date (YYYY-MM-DD, optional)

#### Response (200 OK)

```json
[
  {
    "leaveTypeCode": "AL",
    "leaveTypeName": "Annual Leave",
    "color": "#4CAF50",
    "entitled": "224.00",
    "accrued": "224.00",
    "carriedOver": "40.00",
    "purchased": "0.00",
    "sold": "0.00",
    "taken": "54.00",
    "pending": "30.00",
    "available": "180.00",
    "expiringSoon": "40.00",
    "expiryDate": "2026-04-01"
  },
  {
    "leaveTypeCode": "SICK",
    "leaveTypeName": "Sickness",
    "color": "#F44336",
    "entitled": "0.00",
    "accrued": "0.00",
    "taken": "16.00",
    "available": "999999.00"
  },
  {
    "leaveTypeCode": "TOIL",
    "leaveTypeName": "Time Off In Lieu",
    "color": "#9C27B0",
    "accrued": "12.50",
    "taken": "0.00",
    "available": "12.50",
    "expiringSoon": "0.00",
    "expiryDate": "2025-10-15"
  }
]
```

---

## Public Holidays

### Get Public Holidays

**GET** `/holidays`

Retrieves public holidays for a specific region.

#### Query Parameters

- `country` - ISO 3166-1 alpha-2 code (required, e.g., "GB", "US")
- `state` - State/province code (optional, e.g., "ENG", "CA")
- `year` - Year (optional, e.g., 2025)

#### Example

```bash
GET /holidays?country=GB&state=ENG&year=2025
```

#### Response (200 OK)

```json
[
  {
    "date": "2025-01-01",
    "name": "New Year's Day",
    "type": "BANK_HOLIDAY",
    "isCompanySpecific": false
  },
  {
    "date": "2025-04-18",
    "name": "Good Friday",
    "type": "BANK_HOLIDAY",
    "isCompanySpecific": false
  },
  {
    "date": "2025-12-25",
    "name": "Christmas Day",
    "type": "BANK_HOLIDAY",
    "isCompanySpecific": false
  }
]
```

---

## Policy Management

### Get Organization Policy

**GET** `/policies/:id`

Retrieves complete leave policy for an organization.

#### Response (200 OK)

```json
{
  "organizationId": "ORG001",
  "leaveTypes": [
    {
      "code": "AL",
      "name": "Annual Leave",
      "unit": "HOURS",
      "entitlement": {
        "fullTimeHoursPerYear": 224
      },
      "accrual": {
        "method": "MONTHLY_PRORATA",
        "rounding": "NEAREST_0_5H"
      },
      "carryover": {
        "enabled": true,
        "maxHours": 40,
        "expiresOn": "04-01"
      },
      "purchaseSell": {
        "purchaseEnabled": true,
        "sellEnabled": true,
        "purchaseMaxHours": 40,
        "sellMaxHours": 24,
        "window": {
          "start": "09-01",
          "end": "10-31"
        }
      },
      "minNoticeDays": 7
    }
  ]
}
```

---

## Payroll Exports

### Export Leave Deductions

**GET** `/exports/payroll/leave-deductions`

Exports leave deductions for payroll processing.

#### Query Parameters

- `period` - Payroll period (YYYY-MM, required)

#### Example

```bash
GET /exports/payroll/leave-deductions?period=2025-10
```

#### Response (200 OK)

```json
{
  "organizationId": "ORG001",
  "period": {
    "start": "2025-10-01",
    "end": "2025-10-31"
  },
  "deductions": [
    {
      "employeeId": "EMP001",
      "leaveTypeCode": "AL",
      "leaveTypeName": "Annual Leave",
      "payrollCode": "AL",
      "startDate": "2025-10-15",
      "endDate": "2025-10-19",
      "totalDays": 5,
      "totalHours": 37.5,
      "paidHours": 37.5,
      "unpaidHours": 0,
      "payRate": 1.0,
      "leaveRequestId": "REQ-001",
      "status": "READY_FOR_EXPORT"
    }
  ],
  "summary": {
    "totalEmployees": 5,
    "totalRequests": 8,
    "totalHours": 180.5,
    "totalPaidHours": 165.0,
    "totalUnpaidHours": 15.5
  }
}
```

---

## Error Handling

### Error Response Format

```json
{
  "statusCode": 400,
  "message": "Validation failed",
  "error": "Bad Request",
  "details": [
    {
      "field": "startDate",
      "message": "Start date must be in the future"
    }
  ]
}
```

### Common Status Codes

- `200 OK` - Request successful
- `201 Created` - Resource created
- `400 Bad Request` - Validation error
- `401 Unauthorized` - Authentication required
- `403 Forbidden` - Insufficient permissions
- `404 Not Found` - Resource not found
- `409 Conflict` - Resource conflict (e.g., duplicate request)
- `422 Unprocessable Entity` - Business logic error
- `500 Internal Server Error` - Server error

### Common Errors

**Insufficient Balance**
```json
{
  "statusCode": 422,
  "message": "Insufficient leave balance",
  "error": "Unprocessable Entity",
  "details": {
    "requested": 40,
    "available": 25,
    "shortfall": 15
  }
}
```

**Coverage Breach**
```json
{
  "statusCode": 422,
  "message": "Coverage breach detected",
  "error": "Unprocessable Entity",
  "details": {
    "breaches": [
      {
        "date": "2025-08-14",
        "scope": "DEPT:ENGINEERING",
        "remaining": 3,
        "minRequired": 5
      }
    ]
  }
}
```

---

## Rate Limiting

API requests are rate-limited to prevent abuse:

- **Standard tier:** 100 requests/minute
- **Premium tier:** 500 requests/minute

Rate limit headers included in responses:

```
X-RateLimit-Limit: 100
X-RateLimit-Remaining: 95
X-RateLimit-Reset: 1634567890
```

---

## Webhooks

Subscribe to leave events:

### Available Events

- `leave.requested` - New leave request created
- `leave.approved` - Leave request approved
- `leave.rejected` - Leave request rejected
- `leave.cancelled` - Leave request cancelled
- `balance.low` - Leave balance below threshold
- `toil.expiring` - TOIL expiring soon

### Webhook Payload

```json
{
  "event": "leave.approved",
  "timestamp": "2025-07-15T14:30:00Z",
  "data": {
    "leaveRequestId": "REQ-001",
    "employeeId": "EMP001",
    "status": "APPROVED",
    "approvedBy": "MGR001"
  }
}
```

---

## SDK Support

Official SDKs available:

- **JavaScript/TypeScript** - `npm install @tribecore/holiday-planner`
- **Python** - `pip install tribecore-holiday-planner`
- **PHP** - `composer require tribecore/holiday-planner`

---

## Support

- **Documentation:** https://docs.tribecore.com/holiday-planner
- **Email:** support@tribecore.com
- **Status:** https://status.tribecore.com

---

*Last Updated: October 2025*
