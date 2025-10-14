# TribeCore Enterprise API - Quick Reference

Base URL: `http://localhost:3000/api`

---

## 🛡️ AI Governance

### Systems
```http
POST   /ai-governance/systems
GET    /ai-governance/systems
GET    /ai-governance/systems/:id
PUT    /ai-governance/systems/:id
DELETE /ai-governance/systems/:id
POST   /ai-governance/systems/:id/bias-test
POST   /ai-governance/systems/:id/certify
```

### Decisions
```http
POST   /ai-governance/decisions
GET    /ai-governance/decisions/audit
GET    /ai-governance/decisions/:id
POST   /ai-governance/decisions/:id/review
```

### Compliance
```http
GET    /ai-governance/compliance/:organizationId
GET    /ai-governance/risk-assessment/:organizationId
```

---

## 🎧 HR Service Delivery

### Cases
```http
POST   /hrsd/cases
GET    /hrsd/cases
GET    /hrsd/cases/:id
PUT    /hrsd/cases/:id
POST   /hrsd/cases/assign
POST   /hrsd/cases/resolve
POST   /hrsd/cases/:id/close
POST   /hrsd/cases/:id/escalate
POST   /hrsd/cases/comments
POST   /hrsd/cases/rate
GET    /hrsd/cases/:id/comments
GET    /hrsd/cases/:id/activities
GET    /hrsd/cases/metrics/:organizationId
```

### Knowledge Base
```http
POST   /hrsd/knowledge/articles
PUT    /hrsd/knowledge/articles/:id
POST   /hrsd/knowledge/articles/publish
POST   /hrsd/knowledge/articles/:id/archive
GET    /hrsd/knowledge/articles/:id
POST   /hrsd/knowledge/articles/search
GET    /hrsd/knowledge/articles/category/:organizationId/:category
GET    /hrsd/knowledge/articles/popular/:organizationId
POST   /hrsd/knowledge/articles/rate
POST   /hrsd/knowledge/articles/:id/deflection
GET    /hrsd/knowledge/metrics/:organizationId
```

### ER Investigations
```http
POST   /hrsd/investigations
PUT    /hrsd/investigations/:id
POST   /hrsd/investigations/:id/start
POST   /hrsd/investigations/notes
POST   /hrsd/investigations/:id/evidence
POST   /hrsd/investigations/interviews
POST   /hrsd/investigations/conclude
POST   /hrsd/investigations/:id/notify/:party
POST   /hrsd/investigations/:id/close
GET    /hrsd/investigations/:id
GET    /hrsd/investigations/organization/:organizationId
GET    /hrsd/investigations/metrics/:organizationId
```

### Employee Journeys
```http
POST   /hrsd/journeys
POST   /hrsd/journeys/:id/start
PUT    /hrsd/journeys/tasks/update
POST   /hrsd/journeys/tasks/:journeyId/:taskId/complete
POST   /hrsd/journeys/:id/pause
POST   /hrsd/journeys/:id/resume
POST   /hrsd/journeys/complete
GET    /hrsd/journeys/:id
GET    /hrsd/journeys/employee/:employeeId
GET    /hrsd/journeys/templates/:organizationId/:journeyType
GET    /hrsd/journeys/metrics/:organizationId
```

---

## 📊 ISO 30414 Analytics

```http
POST   /iso30414/metrics/calculate
POST   /iso30414/reports/board
GET    /iso30414/metrics/:organizationId/category/:category
GET    /iso30414/metrics/:organizationId/trend/:metricCode
GET    /iso30414/dashboard/:organizationId
```

**Metric Categories:**
- COSTS
- PRODUCTIVITY
- RECRUITMENT
- TURNOVER
- DIVERSITY
- LEADERSHIP
- SKILLS
- CULTURE
- COMPLIANCE

---

## 🏢 Position Management

```http
POST   /positions
GET    /positions/org/:organizationId
GET    /positions/org/:organizationId/vacant
GET    /positions/org/:organizationId/chart
GET    /positions/org/:organizationId/metrics
POST   /positions/scenarios
GET    /positions/scenarios/:organizationId
```

---

## 🎯 Skills Cloud

### Skills
```http
POST   /skills-cloud/skills
POST   /skills-cloud/employee-skills
GET    /skills-cloud/employee-skills/:employeeId
GET    /skills-cloud/skill-gaps/:organizationId
```

### Marketplace
```http
POST   /skills-cloud/opportunities
GET    /skills-cloud/opportunities/:organizationId
GET    /skills-cloud/opportunities/:opportunityId/matches
```

---

## 💰 Compensation

```http
POST   /compensation/bands
GET    /compensation/bands/:organizationId
POST   /compensation/reviews
GET    /compensation/reviews/employee/:employeeId
GET    /compensation/reviews/pending/:organizationId
POST   /compensation/reviews/:reviewId/approve
```

---

## 🔗 Integrations

### Webhooks
```http
POST   /integrations/webhooks
POST   /integrations/webhooks/trigger
```

**Webhook Events:**
- employee.created
- employee.updated
- employee.terminated
- leave.requested
- leave.approved
- payroll.processed
- case.created
- position.created

### Connectors
```http
POST   /integrations/connectors
GET    /integrations/connectors/:organizationId
POST   /integrations/connectors/:connectorId/sync
```

**Connector Types:**
- SCIM
- OKTA
- AZURE_AD
- WORKDAY
- SUCCESSFACTORS
- SLACK
- TEAMS
- BAMBOO_HR
- CUSTOM_API

---

## 📝 Request Examples

### Create AI System
```bash
curl -X POST http://localhost:3000/api/ai-governance/systems \
  -H "Content-Type: application/json" \
  -d '{
    "organizationId": "org-123",
    "name": "Resume Screening AI",
    "vendor": "OpenAI",
    "riskLevel": "HIGH",
    "usageArea": "RECRUITMENT",
    "requiresHumanReview": true,
    "hasTransparencyNotice": true
  }'
```

### Create HR Case
```bash
curl -X POST http://localhost:3000/api/hrsd/cases \
  -H "Content-Type: application/json" \
  -d '{
    "organizationId": "org-123",
    "title": "Benefits Question",
    "description": "How do I enroll in health insurance?",
    "caseType": "BENEFITS",
    "priority": "MEDIUM",
    "channel": "PORTAL",
    "employeeId": "emp-456"
  }'
```

### Calculate Metrics
```bash
curl -X POST http://localhost:3000/api/iso30414/metrics/calculate \
  -H "Content-Type: application/json" \
  -d '{
    "organizationId": "org-123",
    "periodStart": "2025-01-01",
    "periodEnd": "2025-03-31"
  }'
```

### Create Position
```bash
curl -X POST http://localhost:3000/api/positions \
  -H "Content-Type: application/json" \
  -d '{
    "organizationId": "org-123",
    "positionTitle": "Senior Engineer",
    "department": "Engineering",
    "location": "New York",
    "fte": 1.0,
    "minSalary": 120000,
    "maxSalary": 180000,
    "effectiveDate": "2025-01-01"
  }'
```

### Create Skill
```bash
curl -X POST http://localhost:3000/api/skills-cloud/skills \
  -H "Content-Type: application/json" \
  -d '{
    "organizationId": "org-123",
    "skillName": "Python Programming",
    "category": "TECHNICAL",
    "isCritical": true
  }'
```

### Create Compensation Band
```bash
curl -X POST http://localhost:3000/api/compensation/bands \
  -H "Content-Type: application/json" \
  -d '{
    "organizationId": "org-123",
    "bandCode": "IC3",
    "bandName": "Individual Contributor Level 3",
    "minSalary": 100000,
    "midSalary": 130000,
    "maxSalary": 160000,
    "currency": "USD",
    "effectiveDate": "2025-01-01"
  }'
```

### Create Webhook
```bash
curl -X POST http://localhost:3000/api/integrations/webhooks \
  -H "Content-Type: application/json" \
  -d '{
    "organizationId": "org-123",
    "webhookName": "Slack Employee Notifications",
    "targetUrl": "https://hooks.slack.com/services/xxx/yyy/zzz",
    "events": ["employee.created", "employee.terminated"],
    "isActive": true
  }'
```

---

## 🔍 Query Parameters

Most `GET` endpoints support:
- `page` - Page number (default: 1)
- `limit` - Items per page (default: 20)
- `search` - Search term
- `sortBy` - Field to sort by
- `sortOrder` - ASC or DESC
- `startDate` - Filter by date range
- `endDate` - Filter by date range

Example:
```
GET /hrsd/cases?page=1&limit=50&search=payroll&sortBy=createdAt&sortOrder=DESC
```

---

## 📤 Response Format

### Success Response
```json
{
  "id": "uuid",
  "field1": "value1",
  "field2": "value2",
  "createdAt": "2025-01-15T10:30:00Z",
  "updatedAt": "2025-01-15T10:30:00Z"
}
```

### Paginated Response
```json
{
  "data": [...],
  "total": 100,
  "page": 1,
  "limit": 20,
  "totalPages": 5
}
```

### Error Response
```json
{
  "statusCode": 400,
  "message": "Validation failed",
  "error": "Bad Request"
}
```

---

## 🔐 Authentication (When Implemented)

Add JWT token to requests:
```bash
curl -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  http://localhost:3000/api/ai-governance/systems
```

---

## 📊 HTTP Status Codes

- `200 OK` - Success
- `201 Created` - Resource created
- `400 Bad Request` - Validation error
- `401 Unauthorized` - Authentication required
- `403 Forbidden` - Insufficient permissions
- `404 Not Found` - Resource not found
- `500 Internal Server Error` - Server error

---

**Total Endpoints:** 100+  
**API Version:** 1.0  
**Last Updated:** October 14, 2025
