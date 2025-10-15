# 🚀 Enterprise Onboarding System - Build Progress

## 📊 Overall Status: **Phase 1 Complete (Entities)**

---

## ✅ **COMPLETED: Backend Entities (18 Total)**

### **Employee Onboarding Entities (7)**

| Entity | File | Purpose | Status |
|--------|------|---------|--------|
| **OnboardingTemplate** | `onboarding-template.entity.ts` | Templates for onboarding workflows | ✅ |
| **ChecklistItem** | `checklist-item.entity.ts` | Template task definitions | ✅ |
| **OnboardingTask** | `onboarding-task.entity.ts` | Actual tasks for cases | ✅ |
| **OnboardingDocument** | `onboarding-document.entity.ts` | Documents (NDA, ID, contracts) | ✅ |
| **ProvisioningTicket** | `provisioning-ticket.entity.ts` | IT/System provisioning tracking | ✅ |
| **Checkin** | `checkin.entity.ts` | 30/60/90 day check-ins | ✅ |
| **Note** | `note.entity.ts` | Shared notes/comments (both systems) | ✅ |

### **Customer Onboarding Entities (11)**

| Entity | File | Purpose | Status |
|--------|------|---------|--------|
| **ClientAccount** | `client-account.entity.ts` | Customer company profiles | ✅ |
| **ClientContact** | `client-contact.entity.ts` | Customer contacts (Sponsor, IT, etc.) | ✅ |
| **ClientOnboardingCase** | `client-onboarding-case.entity.ts` | Main customer onboarding case | ✅ |
| **Workstream** | `workstream.entity.ts` | Security, Legal, Technical streams | ✅ |
| **COTask** | `co-task.entity.ts` | Customer onboarding tasks | ✅ |
| **CODocument** | `co-document.entity.ts` | DPA, MSA, SOW documents | ✅ |
| **Environment** | `environment.entity.ts` | Sandbox, UAT, Prod environments | ✅ |
| **Risk** | `risk.entity.ts` | Risk tracking & mitigation | ✅ |
| **SuccessPlan** | `success-plan.entity.ts` | KPIs, objectives, reviews | ✅ |

---

## 🔧 **IN PROGRESS: DTOs**

Need to create DTOs for all entities to handle API requests/responses.

### Required DTOs:
- [ ] CreateOnboardingTemplateDto
- [ ] CreateChecklistItemDto
- [ ] CreateOnboardingTaskDto
- [ ] UpdateOnboardingTaskDto
- [ ] CreateOnboardingDocumentDto
- [ ] CreateProvisioningTicketDto
- [ ] CreateCheckinDto
- [ ] CreateNoteDto
- [ ] CreateClientAccountDto
- [ ] CreateClientContactDto
- [ ] CreateClientOnboardingCaseDto
- [ ] CreateWorkstreamDto
- [ ] CreateCOTaskDto
- [ ] CreateCODocumentDto
- [ ] CreateEnvironmentDto
- [ ] CreateRiskDto
- [ ] CreateSuccessPlanDto

---

## ⏳ **PENDING: Services & Business Logic**

### **Services to Build:**

#### 1. **TemplateService**
- `generateCaseFromTemplate(templateId, employeeId, startDate)` → Creates OnboardingCase + tasks
- `createTemplate(dto)` → Create new template
- `updateTemplate(id, dto)` → Update template
- `getTemplates(filters)` → List templates
- **Business Rules:**
  - Calculate task due dates based on `durationDays` offset from start date
  - Map `ownerRole` to `assigneeRole` in generated tasks
  - Handle task dependencies

#### 2. **OnboardingCaseService** (Enhanced)
- `createCase(dto)` → Manual case creation
- `getCases(filters)` → List cases with pagination
- `getCase(id)` → Get case with tasks, documents, notes
- `updateCaseStatus(id, status)` → Transition states with gates
- `getDay1Readiness(id)` → Check if ready for Day 1
- **Gates:**
  - Cannot move to DAY1 unless PREBOARDING & PROVISIONING tasks are DONE
  - SLA escalations for overdue/blocked tasks

#### 3. **NotesService** (Shared)
- `addNote(objectType, objectId, authorId, body, mentions[], visibility)` → Create note
- `getNotes(objectType, objectId, pagination)` → Get notes for object
- `updateNote(id, body)` → Edit note
- `deleteNote(id)` → Soft delete
- **Business Rules:**
  - Update `noteCount` and `lastActivityAt` on parent task/case
  - Trigger notifications for @mentions
  - Support threading (parentNoteId)

#### 4. **CXOService** (Customer Onboarding)
- `createCaseFromIntake(accountId, tier, region, goLiveTarget)` → Create case with workstreams
- `addWorkstream(caseId, name)` → Add workstream
- `getCases(filters)` → List client cases
- `getCase(id)` → Full case with workstreams, tasks, risks, environments
- `updateGoLiveGate(caseId)` → Check all gates before ENABLEMENT
- **Go-Live Gate Logic:**
  - Security ✅ + Legal ✅ + Billing ✅ + UAT ✅ + Runbook ✅
  - Can only move to ENABLEMENT if all gates pass

#### 5. **RiskService**
- `addRisk(caseId, severity, description)` → Create risk
- `getRisks(caseId)` → List risks
- `updateRiskStatus(id, status, mitigation)` → Update risk
- `getRiskBurndown(caseId)` → Calculate open critical/high risks

---

## ⏳ **PENDING: REST Endpoints**

### **Employee Onboarding Endpoints:**
```
POST   /api/v1/onboarding/templates
GET    /api/v1/onboarding/templates
GET    /api/v1/onboarding/templates/:id

POST   /api/v1/onboarding/cases                    (from template or manual)
GET    /api/v1/onboarding/cases?status=&ownerId=
GET    /api/v1/onboarding/cases/:id                (with tasks, docs, notes)
PATCH  /api/v1/onboarding/cases/:id/status

POST   /api/v1/onboarding/cases/:id/tasks
PATCH  /api/v1/onboarding/tasks/:id
POST   /api/v1/onboarding/cases/:id/documents
POST   /api/v1/onboarding/cases/:id/checkins

GET    /api/v1/dashboard/onboarding                (HR dashboard)
```

### **Customer Onboarding Endpoints:**
```
POST   /api/v1/cxo/accounts
GET    /api/v1/cxo/accounts

POST   /api/v1/cxo/cases                           (from intake)
GET    /api/v1/cxo/cases?status=&csmId=
GET    /api/v1/cxo/cases/:id                       (full case)
PATCH  /api/v1/cxo/cases/:id/status

POST   /api/v1/cxo/workstreams/:id/tasks
PATCH  /api/v1/cxo/tasks/:id
POST   /api/v1/cxo/cases/:id/documents
POST   /api/v1/cxo/cases/:id/environments
POST   /api/v1/cxo/cases/:id/risks
PATCH  /api/v1/cxo/risks/:id
POST   /api/v1/cxo/cases/:id/success-plan

GET    /api/v1/dashboard/cxo                       (CSM dashboard)
```

### **Shared Endpoints:**
```
POST   /api/v1/notes
GET    /api/v1/notes?objectType=&objectId=&page=
PATCH  /api/v1/notes/:id
DELETE /api/v1/notes/:id
```

---

## ⏳ **PENDING: Frontend Pages & Components**

### **Employee Onboarding UI:**

#### 1. `/onboarding` - **HR Overview Dashboard**
- Metrics tiles: Active, At Risk, Overdue Tasks
- Table with filters (status, owner, start date)
- Search functionality
- Quick actions: Create Case, View Templates

#### 2. `/onboarding/templates` - **Template Manager**
- List templates by country/department
- Create/Edit template wizard
- Checklist item manager with drag-drop ordering

#### 3. `/onboarding/cases/:id` - **Case Workspace**
- **Header:** Employee, start date, status, completion bar, risk
- **Tabs:**
  - **Tasks**: Kanban board by status + list view
  - **Documents**: Upload, e-sign status, verification
  - **Notes**: Shared notes panel with @mentions
  - **Provisioning**: IT tickets status
  - **30/60/90**: Check-ins schedule & feedback
- **Right Rail:** SLA warnings, blockers, owners
- **Drawers:** Add task, Upload doc, Add note

### **Customer Onboarding UI:**

#### 1. `/cxo` - **Portfolio Dashboard**
- Filters: By CSM, tier, region, status
- TTL (Time-to-Live) gauges
- Risk heatmap
- Table with go-live targets

#### 2. `/cxo/cases/:id` - **Client Case Room**
- **Header:** Account, tier, region, go-live target, CSM
- **Tabs:**
  - **Plan**: Workstreams + tasks with dependencies
  - **Docs**: DPA, MSA, SOW with signature status
  - **Environments**: Sandbox, UAT, Prod status
  - **Risks**: Risk register with mitigation plans
  - **Success Plan**: KPIs, objectives, reviews
  - **Notes**: Shared notes (internal/client visibility toggle)
- **Go-Live Gate Widget:** Checklist with ✅/❌ indicators

#### 3. `/cxo/portal/:caseId` - **Client Portal** (External)
- Shared timeline & tasks
- Document upload/download
- Visible notes only (visibility=shared)
- UAT signoff form

### **Reusable Components:**

```typescript
<NotesPanel objectType="OnboardingCase" objectId={caseId} />
<SLAChip dueDate={task.dueDate} status={task.status} />
<RiskBadge level={risk.severity} />
<GateChecklist gates={case.gateChecks} />
<TaskDependencyGraph tasks={tasks} />
```

---

## ⏳ **PENDING: Seed Data**

Need to create comprehensive seed data:

### Employee Onboarding Seeds:
- 3 templates (UK Office, US Remote, NG Contractor)
- 12 employee cases at various stages
- 60+ tasks across all cases
- Sample documents, provisioning tickets
- Notes with @mentions

### Customer Onboarding Seeds:
- 5 client accounts (Enterprise, Professional, Standard tiers)
- 8 client onboarding cases
- 40+ workstream tasks
- DPA/MSA documents
- Environments (sandbox, prod)
- Risks and success plans

---

## 🎯 **NEXT STEPS**

### **Immediate (Session 2):**
1. ✅ Create all DTOs
2. ✅ Build TemplateService with case generation logic
3. ✅ Build NotesService
4. ✅ Update onboarding.module.ts to include all entities

### **Short-term (Session 3-4):**
5. Build all REST endpoints
6. Create employee onboarding UI pages
7. Create customer onboarding UI pages
8. Build NotesPanel component

### **Final (Session 5):**
9. Add comprehensive seed data
10. Integration testing
11. Documentation

---

## 📝 **Entity Relationships Summary**

### **Employee Onboarding Flow:**
```
OnboardingTemplate (1)
  ↓ has many
ChecklistItem (n)
  ↓ generates
OnboardingCase (1)
  ↓ has many
OnboardingTask (n)
OnboardingDocument (n)
ProvisioningTicket (n)
Checkin (n)
Note (n)
```

### **Customer Onboarding Flow:**
```
ClientAccount (1)
  ↓ has many
ClientContact (n)
ClientOnboardingCase (1)
  ↓ has many
Workstream (n)
  ↓ each has many
COTask (n)

ClientOnboardingCase also has:
  - CODocument (n)
  - Environment (n)
  - Risk (n)
  - SuccessPlan (1)
  - Note (n)
```

---

## 🔐 **Security & Compliance**

- **RBAC**: Role-based access (HR_ADMIN, IT_ADMIN, MANAGER, CSM, etc.)
- **ABAC**: Attribute-based (can only see own department cases)
- **Audit Log**: All actions tracked with user + timestamp
- **Data Retention**: Configurable auto-delete after X years
- **GDPR Compliance**: Right to erasure, consent tracking
- **Encryption**: PII data encrypted at rest

---

## 📊 **Key Metrics to Track**

### Employee Onboarding:
- Time to onboard (avg days from offer → active)
- Task completion rate (%)
- Engagement score (survey ratings)
- First 90-day retention rate
- Automation coverage (% auto-triggered tasks)

### Customer Onboarding:
- Time-to-live (avg days from sale → go-live)
- SLA adherence (% tasks on time)
- Risk burndown (trend)
- First-value time (days to first value delivered)
- NPS at T+7 and T+30
- Expansion likelihood

---

**Status:** ✅ **18/18 Entities Created** | 🔧 **DTOs & Services In Progress**

**Last Updated:** {{ timestamp }}
