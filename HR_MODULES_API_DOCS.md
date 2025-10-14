# 📚 HR Modules API Documentation

**Version:** 1.0.0  
**Base URL:** `/api`  
**Authentication:** Bearer Token Required

---

## **MODULE 1: OFFBOARDING & REDUNDANCY**

### **Separation Cases**

#### Create Separation Case
```http
POST /offboarding/cases
Content-Type: application/json

{
  "employeeId": "EMP001",
  "organizationId": "ORG001",
  "type": "RESIGNATION",
  "reasonCode": "BETTER_OPPORTUNITY",
  "reasonDetails": "Accepted position at competitor",
  "proposedLeaveDate": "2025-12-31",
  "createdBy": "HR001"
}

Response 201:
{
  "id": "SEP001",
  "status": "DRAFT",
  "riskScore": 25,
  "requiresLegalApproval": false
}
```

#### Get Separation Cases
```http
GET /offboarding/cases?organizationId=ORG001&status=PENDING_APPROVAL

Response 200:
[
  {
    "id": "SEP001",
    "employeeId": "EMP001",
    "type": "RESIGNATION",
    "status": "PENDING_APPROVAL",
    "riskScore": 25,
    "proposedLeaveDate": "2025-12-31"
  }
]
```

#### Calculate Notice Terms
```http
POST /offboarding/cases/SEP001/notice

{
  "tenureYears": 5,
  "contractualDays": 60,
  "country": "GB"
}

Response 200:
{
  "statutoryNoticeDays": 35,
  "contractualNoticeDays": 60,
  "noticeDays": 60,
  "noticeStart": "2025-11-01",
  "noticeEnd": "2025-12-31",
  "method": "WORKED"
}
```

#### Calculate Severance
```http
POST /offboarding/cases/SEP001/severance

{
  "basePay": 45000,
  "tenureYears": 5,
  "country": "GB",
  "age": 35,
  "holidayHours": 40,
  "toilHours": 12
}

Response 200:
{
  "statutoryAmount": 3215.00,
  "exGratiaAmount": 0,
  "holidayPayoutAmount": 923.08,
  "toilPayoutAmount": 276.92,
  "grossAmount": 4415.00,
  "taxAmount": 883.00,
  "nicAmount": 529.80,
  "netAmount": 3002.20
}
```

---

## **MODULE 2: ONBOARDING**

### **Onboarding Cases**

#### Create from Offer
```http
POST /onboarding/cases/from-offer

{
  "candidateId": "CAND001",
  "organizationId": "ORG001",
  "country": "GB",
  "site": "London HQ",
  "department": "Engineering",
  "jobTitle": "Senior Developer",
  "startDate": "2026-01-15",
  "hiringManagerId": "MGR001"
}

Response 201:
{
  "id": "ONB001",
  "status": "OFFER_SIGNED",
  "startDate": "2026-01-15",
  "probationEndDate": "2026-04-15",
  "daysUntilStart": 45
}
```

#### Get Case Details
```http
GET /onboarding/cases/ONB001

Response 200:
{
  "case": {
    "id": "ONB001",
    "status": "PRE_BOARDING",
    "startDate": "2026-01-15",
    "provisioningComplete": false,
    "rightToWorkVerified": true
  },
  "checklists": [
    {
      "name": "HR Pre-boarding",
      "totalTasks": 5,
      "completedTasks": 3,
      "dueDate": "2026-01-01"
    }
  ],
  "provisions": [
    {
      "type": "LAPTOP",
      "status": "REQUESTED",
      "requiredBy": "2026-01-13"
    }
  ],
  "readinessScore": 60,
  "isReadyForDay1": false
}
```

#### Complete Task
```http
POST /onboarding/cases/ONB001/tasks/TASK001/complete

{
  "completedBy": "HR001"
}

Response 200:
{
  "taskId": "TASK001",
  "completedAt": "2025-12-20T10:30:00Z",
  "checklistCompletionPercentage": 80
}
```

---

## **MODULE 3: RECRUITMENT & ATS**

### **Requisitions**

#### Create Requisition
```http
POST /recruitment/requisitions

{
  "organizationId": "ORG001",
  "departmentId": "DEPT001",
  "jobTitle": "Senior Developer",
  "headcount": 2,
  "budgetAmount": 100000,
  "hiringManagerId": "MGR001",
  "reason": "GROWTH",
  "targetStartDate": "2026-02-01"
}

Response 201:
{
  "id": "REQ001",
  "status": "PENDING_APPROVAL",
  "approvals": [
    {
      "approverId": "MGR001",
      "role": "Manager",
      "status": "PENDING"
    }
  ]
}
```

### **Job Postings**

#### Create Job
```http
POST /recruitment/jobs

{
  "requisitionId": "REQ001",
  "title": "Senior Full Stack Developer",
  "description": "We're looking for...",
  "salaryMin": 45000,
  "salaryMax": 55000,
  "showSalary": true,
  "location": "London",
  "remote": true,
  "competencies": ["React", "Node.js", "TypeScript"]
}

Response 201:
{
  "id": "JOB001",
  "status": "DRAFT",
  "requisitionId": "REQ001"
}
```

#### Publish Job
```http
POST /recruitment/jobs/JOB001/publish

{
  "channels": [
    {
      "name": "LinkedIn",
      "url": "https://linkedin.com/jobs/12345"
    },
    {
      "name": "Indeed",
      "url": "https://indeed.com/job/67890"
    }
  ]
}

Response 200:
{
  "status": "ACTIVE",
  "postedAt": "2025-12-15T09:00:00Z",
  "channels": 2
}
```

### **Applications**

#### Submit Application
```http
POST /recruitment/applications

{
  "candidateId": "CAND001",
  "jobPostingId": "JOB001",
  "organizationId": "ORG001",
  "resumeUrl": "https://storage/resume.pdf",
  "screeningAnswers": [
    {
      "questionId": "Q1",
      "question": "Do you have 5+ years experience?",
      "answer": "Yes",
      "isKnockout": true,
      "knockoutFailed": false
    }
  ]
}

Response 201:
{
  "id": "APP001",
  "stage": "NEW",
  "status": "ACTIVE",
  "candidateId": "CAND001"
}
```

#### Advance Stage
```http
POST /recruitment/applications/APP001/advance

{
  "nextStage": "INTERVIEW"
}

Response 200:
{
  "id": "APP001",
  "stage": "INTERVIEW",
  "previousStage": "HM_SCREEN"
}
```

### **Interviews**

#### Schedule Interview
```http
POST /recruitment/interviews

{
  "applicationId": "APP001",
  "organizationId": "ORG001",
  "type": "PANEL_INTERVIEW",
  "panel": [
    {
      "userId": "MGR001",
      "name": "John Manager",
      "role": "Hiring Manager"
    },
    {
      "userId": "ENG001",
      "name": "Sarah Engineer",
      "role": "Technical Lead"
    }
  ],
  "scheduledStart": "2026-01-10T14:00:00Z",
  "scheduledEnd": "2026-01-10T15:30:00Z",
  "meetingLink": "https://zoom.us/j/12345"
}

Response 201:
{
  "id": "INT001",
  "feedbackDueAt": "2026-01-12T14:00:00Z",
  "panelCount": 2
}
```

#### Submit Feedback
```http
POST /recruitment/interviews/INT001/feedback

{
  "panelId": "MGR001",
  "scorecard": {
    "scores": [
      {
        "competency": "Technical Skills",
        "score": 8,
        "maxScore": 10,
        "notes": "Strong React knowledge"
      }
    ],
    "overallRating": 8,
    "recommendation": "STRONG_YES",
    "feedback": "Excellent candidate, recommend proceeding to offer"
  }
}

Response 200:
{
  "feedbackReceived": 1,
  "feedbackPending": 1,
  "consensusReached": false
}
```

### **Offers**

#### Create Offer
```http
POST /recruitment/offers

{
  "applicationId": "APP001",
  "candidateId": "CAND001",
  "organizationId": "ORG001",
  "jobTitle": "Senior Developer",
  "department": "Engineering",
  "baseSalary": 50000,
  "proposedStartDate": "2026-02-01",
  "benefits": [
    {
      "name": "Health Insurance",
      "description": "Private medical coverage"
    }
  ]
}

Response 201:
{
  "id": "OFFER001",
  "status": "DRAFT",
  "totalCompensation": 50000,
  "expiresAt": "2026-01-15T00:00:00Z"
}
```

#### Accept Offer
```http
POST /recruitment/offers/OFFER001/accept

Response 200:
{
  "status": "ACCEPTED",
  "signedAt": "2026-01-03T10:30:00Z",
  "onboardingCaseCreated": true,
  "onboardingCaseId": "ONB002"
}
```

### **Pipeline Metrics**

#### Get Metrics
```http
GET /recruitment/pipeline/metrics?organizationId=ORG001

Response 200:
{
  "total": 124,
  "byStage": {
    "NEW": 45,
    "SCREENING": 32,
    "HM_SCREEN": 20,
    "INTERVIEW": 15,
    "OFFER": 8,
    "HIRED": 4
  },
  "byStatus": {
    "ACTIVE": 112,
    "REJECTED": 10,
    "OFFER_ACCEPTED": 2
  },
  "conversionRates": {
    "NEW_to_SCREENING": "71.1%",
    "SCREENING_to_HM_SCREEN": "62.5%",
    "HM_SCREEN_to_INTERVIEW": "75.0%",
    "INTERVIEW_to_OFFER": "53.3%",
    "OFFER_to_HIRED": "50.0%"
  }
}
```

---

## **ERROR RESPONSES**

### 400 Bad Request
```json
{
  "statusCode": 400,
  "message": "Validation failed",
  "errors": [
    {
      "field": "proposedLeaveDate",
      "message": "Must be a future date"
    }
  ]
}
```

### 404 Not Found
```json
{
  "statusCode": 404,
  "message": "Case not found"
}
```

### 422 Unprocessable Entity
```json
{
  "statusCode": 422,
  "message": "Cannot complete offboarding: tasks incomplete",
  "details": {
    "pendingTasks": 3,
    "blockingTasks": 1
  }
}
```

---

## **AUTHENTICATION**

All endpoints require Bearer token:

```http
Authorization: Bearer <your_token>
```

---

*Last Updated: October 14, 2025*
