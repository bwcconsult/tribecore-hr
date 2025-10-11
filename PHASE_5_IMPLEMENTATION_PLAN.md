# 🚀 PHASE 5: Employee Self-Service, Manager Tools & Admin Controls

## 📊 **STATUS: PLANNING PHASE**

---

## 1️⃣ **EXISTING FOUNDATION (Phases 1-4 Review)**

### ✅ **What We Already Have:**

#### **Phase 1: Calendar & Absences**
- ✅ `CalendarEvent` entity (basic events)
- ✅ `BankHoliday` entity (84 UK holidays seeded)
- ✅ `AbsenceBalanceCache` entity (caching layer)
- ✅ Calendar service with GDPR filtering
- ✅ 10 REST API endpoints
- ✅ Frontend: CalendarPage, AnnualOverviewPage

#### **Phase 2: Profile & Employment**
- ✅ `EmploymentActivity` entity
- ✅ `WorkSchedule` entity
- ✅ `EmergencyContact` entity
- ✅ `Dependant` entity
- ✅ Profile service with access controls
- ✅ 13 REST API endpoints
- ✅ Frontend: PersonalSummaryPage, PersonalDetailsPage

#### **Phase 3: Skills & Training**
- ✅ `Skill`, `PersonSkill` entities
- ✅ `EducationHistory`, `ProfessionalQualification` entities
- ✅ `Language`, `License` entities
- ✅ `TrainingActivity`, `DevelopmentPlan`, `DevelopmentNeed` entities
- ✅ Skills matrix, certifications, CPD tracking
- ✅ 20 REST API endpoints

#### **Phase 4: Settings & Notifications**
- ✅ `UserSettings` entity
- ✅ `NotificationPreference` entity
- ✅ `NotificationSubscription` entity (12 types)
- ✅ `NotificationQueue` entity
- ✅ 10 REST API endpoints

**Total Existing:** 53 REST API endpoints, 20 entities, 8 frontend pages

---

## 2️⃣ **PHASE 5 SCOPE ANALYSIS**

### 🆕 **What's NEW (Must Build):**

#### **A. Enhanced Absence Management**
| Component | Status | Notes |
|-----------|--------|-------|
| `AbsencePlan` entity | 🆕 NEW | Holiday, Birthday, Level-Up, Sickness, Other |
| `AccrualPolicy` entity | 🆕 NEW | Pro-rata, rolling year calculations |
| `AbsenceRequest` entity | 🆕 NEW | Request/approval workflow |
| `SicknessEpisode` entity | 🆕 NEW | Track episodes & thresholds |
| `AbsenceBalance` improvements | ⚠️ EXISTS | Enhance existing `AbsenceBalanceCache` |
| Approval workflows | 🆕 NEW | Manager approval chains |
| Rolling year calculations | 🆕 NEW | Complex date math |

#### **B. Tasks & Checklists**
| Component | Status | Notes |
|-----------|--------|-------|
| `Task` entity | 🆕 NEW | Process/Checklist tasks |
| `Checklist` entity | 🆕 NEW | Templates & items |
| `TaskEvent` entity | 🆕 NEW | Audit trail |
| Task Centre UI | 🆕 NEW | Frontend dashboard |
| Task approvals | 🆕 NEW | Workflow engine |

#### **C. RBAC & Permissions**
| Component | Status | Notes |
|-----------|--------|-------|
| `Role` entity | ⚠️ CHECK | May exist in User entity |
| `Permission` entity | 🆕 NEW | Feature-action-scope |
| `SecurityGroup` entity | 🆕 NEW | Manager hierarchies |
| RBAC middleware | 🆕 NEW | Guards for all endpoints |
| Impersonation | 🆕 NEW | Admin feature |

#### **D. Enhanced Dashboards**
| Component | Status | Notes |
|-----------|--------|-------|
| `WidgetConfig` entity | 🆕 NEW | Per-role layouts |
| `SavedSearch` entity | 🆕 NEW | People/Absences/Checklists |
| Dashboard widgets | 🆕 NEW | Tasks, Absences, Quick Tiles |
| Configurable layouts | 🆕 NEW | Admin UI |

#### **E. Manager Self-Service**
| Component | Status | Notes |
|-----------|--------|-------|
| Team list view | 🆕 NEW | Filtered by hierarchy |
| Org chart | 🆕 NEW | Reporting lines |
| Team absence dashboard | 🆕 NEW | Balances & approvals |
| Saved searches (shared) | 🆕 NEW | Share with team |

#### **F. Admin Controls**
| Component | Status | Notes |
|-----------|--------|-------|
| Plan configuration UI | 🆕 NEW | Absence plans builder |
| Dashboard configurator | 🆕 NEW | Per-role widgets |
| Audit explorer | 🆕 NEW | System-wide logs |
| DSAR export | 🆕 NEW | GDPR compliance |
| Retention automation | 🆕 NEW | Data lifecycle |

#### **G. Enhanced ESS**
| Component | Status | Notes |
|-----------|--------|-------|
| Bank details | 🆕 NEW | Payment information |
| Document management | ⚠️ EXISTS? | Check DocumentsModule |
| Right-to-work docs | 🆕 NEW | Verification workflow |
| Training records | ✅ EXISTS | Already in Phase 3 |

---

## 3️⃣ **OVERLAP & INTEGRATION POINTS**

### ⚠️ **Potential Duplications to Avoid:**

1. **Calendar Events vs Absence Requests**
   - ✅ **Solution:** `AbsenceRequest` → creates `CalendarEvent` on approval
   - Existing `CalendarEvent` becomes the display layer

2. **Training Records**
   - ✅ Already have: `TrainingActivity`, `DevelopmentPlan`
   - **Solution:** Enhance existing, don't duplicate

3. **Documents**
   - ⚠️ Need to check: `DocumentsModule` may already exist
   - **Solution:** Extend if exists, create if not

4. **Notifications**
   - ✅ Already have: `NotificationQueue`, `NotificationSubscription`
   - **Solution:** Add new subscription types for absences/tasks

5. **User Settings**
   - ✅ Already have: `UserSettings` entity
   - **Solution:** Extend with dashboard preferences

---

## 4️⃣ **DATABASE SCHEMA ADDITIONS**

### 🆕 **New Entities Required:**

```typescript
// Absence Management (8 entities)
AbsencePlan
AccrualPolicy
AbsenceRequest
AbsenceApproval
SicknessEpisode
AbsenceConflict
CarryoverBalance
BlackoutPeriod

// Tasks & Workflows (4 entities)
Task
Checklist
ChecklistItem
TaskEvent

// RBAC (5 entities)
Role (if not exists)
Permission
RolePermission
SecurityGroup
SecurityGroupMember

// Dashboards (3 entities)
WidgetConfig
SavedSearch
DashboardLayout

// Admin (2 entities)
AuditEvent (enhance existing)
DataRetentionPolicy

// Totals: ~22 NEW entities
```

---

## 5️⃣ **PROPOSED IMPLEMENTATION PHASES**

### 🎯 **Phase 5A: Foundation (Week 1-2)**

**Priority 1: RBAC Infrastructure**
- [ ] Create `Role`, `Permission`, `RolePermission` entities
- [ ] Create RBAC guards/decorators for NestJS
- [ ] Create role-check middleware
- [ ] Seed basic roles (EMPLOYEE, MANAGER, HR_ADMIN, ORG_ADMIN, SUPER_ADMIN)
- [ ] Update existing endpoints with role guards

**Priority 2: Enhanced Absence Entities**
- [ ] Create `AbsencePlan` entity (5 plan types)
- [ ] Create `AccrualPolicy` entity
- [ ] Create `AbsenceRequest` entity
- [ ] Create `AbsenceApproval` entity
- [ ] Seed default plans (Holiday, Birthday, Level-Up, Sickness, Other)

**Priority 3: Task System Foundation**
- [ ] Create `Task` entity
- [ ] Create `Checklist` entity
- [ ] Create `ChecklistItem` entity
- [ ] Create `TaskEvent` entity

---

### 🎯 **Phase 5B: Core Features (Week 3-4)**

**Priority 1: Absence Request Workflow**
- [ ] AbsenceService: request absence flow
- [ ] AbsenceService: approval/rejection logic
- [ ] AbsenceService: balance calculations
- [ ] AbsenceService: conflict detection
- [ ] REST API: 10 absence endpoints
- [ ] Frontend: Add Absence modal
- [ ] Frontend: Absence request list
- [ ] Frontend: Manager approval queue

**Priority 2: Task Centre**
- [ ] TaskService: create, assign, complete tasks
- [ ] TaskService: checklist management
- [ ] REST API: 8 task endpoints
- [ ] Frontend: Task Centre dashboard
- [ ] Frontend: Task filters & tabs
- [ ] Frontend: Checklist UI

**Priority 3: Enhanced Balances**
- [ ] Enhance `AbsenceBalanceCache` with plan-specific logic
- [ ] Rolling year calculations
- [ ] Pro-rata calculations
- [ ] Carryover logic
- [ ] Episode tracking (sickness)

---

### 🎯 **Phase 5C: Manager Tools (Week 5-6)**

**Priority 1: Team Views**
- [ ] Team list with hierarchy filtering
- [ ] Org chart component
- [ ] Team absence dashboard
- [ ] Team calendar view
- [ ] REST API: 6 team endpoints

**Priority 2: Approvals**
- [ ] Manager approval queue UI
- [ ] One-click approve/reject
- [ ] Bulk actions
- [ ] Delegation features

**Priority 3: Saved Searches**
- [ ] SavedSearch entity & service
- [ ] Create/edit/share searches
- [ ] People searches
- [ ] Absence searches
- [ ] Frontend: Saved searches drawer

---

### 🎯 **Phase 5D: Admin Controls (Week 7-8)**

**Priority 1: Plan Configuration**
- [ ] Absence plan builder UI
- [ ] Accrual policy editor
- [ ] Approval chain configurator
- [ ] Blackout periods
- [ ] Public holidays assignment

**Priority 2: Dashboard Configurator**
- [ ] WidgetConfig entity & service
- [ ] Admin UI: enable/disable widgets per role
- [ ] Widget marketplace
- [ ] Default layouts

**Priority 3: Audit & Compliance**
- [ ] Enhanced AuditEvent entity
- [ ] Audit explorer UI
- [ ] DSAR export (GDPR)
- [ ] Data retention policies
- [ ] Consent registry

---

### 🎯 **Phase 5E: Enhanced ESS (Week 9-10)**

**Priority 1: Bank Details**
- [ ] BankDetails entity
- [ ] Bank details service
- [ ] REST API: 4 endpoints
- [ ] Frontend: Bank details tab

**Priority 2: Document Enhancements**
- [ ] Check existing DocumentsModule
- [ ] Extend with categories (contracts, IDs, certs)
- [ ] Virus scanning integration
- [ ] Expiry reminders
- [ ] Frontend: Document viewer

**Priority 3: Training Integration**
- [ ] Link existing TrainingActivity to dashboard
- [ ] CPD hours summary
- [ ] Certificate viewer
- [ ] Course assignments UI

---

## 6️⃣ **API ENDPOINTS SUMMARY**

### 🆕 **New Endpoints Required:**

**Absence Management (15 endpoints)**
```
GET    /api/v1/absence/plans
GET    /api/v1/absence/plans/:id
POST   /api/v1/absence/plans (admin)
GET    /api/v1/absence/balances
POST   /api/v1/absence/requests
GET    /api/v1/absence/requests
GET    /api/v1/absence/requests/:id
POST   /api/v1/absence/requests/:id/approve
POST   /api/v1/absence/requests/:id/reject
POST   /api/v1/absence/requests/:id/cancel
GET    /api/v1/absence/conflicts
GET    /api/v1/absence/sickness-episodes
POST   /api/v1/absence/sickness-episodes
GET    /api/v1/absence/carryover
POST   /api/v1/absence/carryover/execute (admin)
```

**Tasks (8 endpoints)**
```
GET    /api/v1/tasks
GET    /api/v1/tasks/:id
POST   /api/v1/tasks
PATCH  /api/v1/tasks/:id
POST   /api/v1/tasks/:id/complete
GET    /api/v1/checklists
POST   /api/v1/checklists
GET    /api/v1/checklists/:id
```

**Team & Manager (6 endpoints)**
```
GET    /api/v1/team/members
GET    /api/v1/team/org-chart
GET    /api/v1/team/absence-summary
GET    /api/v1/team/approvals
GET    /api/v1/team/calendar
POST   /api/v1/team/delegate
```

**Saved Searches (5 endpoints)**
```
GET    /api/v1/saved-searches
POST   /api/v1/saved-searches
PATCH  /api/v1/saved-searches/:id
DELETE /api/v1/saved-searches/:id
POST   /api/v1/saved-searches/:id/execute
```

**Admin (10 endpoints)**
```
GET    /api/v1/admin/roles
POST   /api/v1/admin/roles
GET    /api/v1/admin/permissions
POST   /api/v1/admin/absence-plans
GET    /api/v1/admin/widgets
POST   /api/v1/admin/widgets/config
GET    /api/v1/admin/audit
GET    /api/v1/admin/dsar-export
POST   /api/v1/admin/impersonate
POST   /api/v1/admin/retention/execute
```

**Bank Details (4 endpoints)**
```
GET    /api/v1/profile/bank-details
POST   /api/v1/profile/bank-details
PATCH  /api/v1/profile/bank-details/:id
DELETE /api/v1/profile/bank-details/:id
```

**Total New Endpoints: ~48**

---

## 7️⃣ **FRONTEND STRUCTURE**

### 🆕 **New Pages/Components:**

```
frontend/src/
├── pages/
│   ├── tasks/
│   │   ├── TaskCentrePage.tsx          🆕
│   │   └── ChecklistPage.tsx           🆕
│   ├── absence/
│   │   ├── AbsenceRequestsPage.tsx     🆕
│   │   ├── AbsenceBalancesPage.tsx     🆕
│   │   └── components/
│   │       ├── AddAbsenceModal.tsx     🆕
│   │       └── ApprovalQueueCard.tsx   🆕
│   ├── team/
│   │   ├── MyTeamPage.tsx              🆕
│   │   ├── OrgChartPage.tsx            🆕
│   │   └── TeamAbsencesPage.tsx        🆕
│   ├── admin/
│   │   ├── AbsencePlansPage.tsx        🆕
│   │   ├── DashboardConfigPage.tsx     🆕
│   │   ├── AuditExplorerPage.tsx       🆕
│   │   └── RolesPermissionsPage.tsx    🆕
│   └── banking/
│       └── BankDetailsPage.tsx         🆕
├── components/
│   ├── dashboard/
│   │   ├── DashboardWidget.tsx         🆕
│   │   ├── TasksWidget.tsx             🆕
│   │   ├── AbsenceSummaryWidget.tsx    🆕
│   │   └── QuickTilesWidget.tsx        🆕
│   └── saved-searches/
│       └── SavedSearchesDrawer.tsx     🆕
└── services/
    ├── absence.service.ts              🆕
    ├── tasks.service.ts                🆕
    ├── team.service.ts                 🆕
    └── admin.service.ts                🆕
```

**Total New Frontend Files: ~25**

---

## 8️⃣ **INTEGRATION WITH EXISTING CODE**

### 🔗 **Integration Points:**

1. **Calendar Integration**
   - `AbsenceRequest` (approved) → creates `CalendarEvent`
   - Calendar displays both events and absences
   - Color-coding by absence plan type

2. **Notification Integration**
   - Add new subscription types:
     - `ABSENCE_REQUEST_PENDING`
     - `ABSENCE_REQUEST_APPROVED`
     - `ABSENCE_REQUEST_REJECTED`
     - `TASK_ASSIGNED`
     - `TASK_COMPLETED`
     - `SICKNESS_THRESHOLD_REACHED`

3. **Profile Integration**
   - Add Bank Details tab to PersonalDetailsPage
   - Link to existing EmploymentActivity
   - Link to existing TrainingActivity

4. **Settings Integration**
   - Extend UserSettings with dashboard preferences
   - Widget visibility toggles
   - Saved search favorites

5. **Documents Integration**
   - Check if DocumentsModule exists
   - Extend or create as needed
   - Link to absence requests (attachments)

---

## 9️⃣ **GDPR & COMPLIANCE**

### 🔒 **Privacy Enhancements:**

1. **Field-Level Masking**
   - Bank details: mask account number
   - NI/SSN: show last 4 digits only
   - Salary: HR/Payroll roles only

2. **Audit Logging**
   - All absence approvals
   - All task assignments
   - All RBAC changes
   - All impersonation actions
   - All sensitive data access

3. **Data Retention**
   - Absence records: 6 years (legal requirement)
   - Task records: 2 years
   - Audit logs: 7 years
   - Documents: policy-based

4. **DSAR Export**
   - Employee self-export (all personal data)
   - Redact third-party information
   - Automated PDF generation

---

## 🔟 **EFFORT ESTIMATION**

### ⏱️ **Time Breakdown:**

| Phase | Tasks | Backend | Frontend | Testing | Total |
|-------|-------|---------|----------|---------|-------|
| 5A: Foundation | RBAC, Entities | 40h | 10h | 10h | **60h** |
| 5B: Core Features | Absence, Tasks | 50h | 40h | 20h | **110h** |
| 5C: Manager Tools | Team Views | 30h | 30h | 15h | **75h** |
| 5D: Admin Controls | Config UIs | 40h | 40h | 20h | **100h** |
| 5E: Enhanced ESS | Bank, Docs | 20h | 20h | 10h | **50h** |
| **TOTAL** | | **180h** | **140h** | **75h** | **395h** |

**Estimated Duration: 10-12 weeks (with 1 developer)**

---

## 1️⃣1️⃣ **CRITICAL SUCCESS FACTORS**

### ✅ **Must-Haves:**

1. **No Data Duplication**
   - Reuse existing entities where possible
   - Extend, don't recreate

2. **Backward Compatibility**
   - Don't break existing 53 endpoints
   - Enhance, don't replace

3. **RBAC from Day 1**
   - Every new endpoint must have role guards
   - Test with all 5 roles

4. **Performance**
   - Cache absence balances
   - Paginate all lists
   - Index all foreign keys

5. **GDPR Compliance**
   - Audit all actions
   - Field-level masking
   - Retention policies

---

## 1️⃣2️⃣ **NEXT STEPS**

### 📋 **Immediate Actions:**

1. ✅ **PLAN REVIEW** (this document)
   - Review for completeness
   - Identify gaps
   - Confirm approach

2. ⏳ **PENDING USER APPROVAL**
   - Wait for user confirmation
   - Adjust plan based on feedback
   - Prioritize features

3. 🚀 **START PHASE 5A**
   - Begin with RBAC foundation
   - Create entities
   - Set up guards
   - Seed data

---

## 1️⃣3️⃣ **OPEN QUESTIONS**

### ❓ **Need Clarification:**

1. **Documents Module**
   - Does it already exist in the codebase?
   - If yes, what's the current structure?

2. **User/Role Relationship**
   - Is there a Role entity already?
   - How is user role currently stored?

3. **Prioritization**
   - Which sub-phase is most critical?
   - Any features to deprioritize?

4. **Timeline**
   - Is 10-12 weeks acceptable?
   - Any hard deadlines?

---

## 📊 **SUMMARY**

**Phase 5 Scope:**
- 22 new database entities
- 48 new REST API endpoints
- 25 new frontend files
- Enhanced RBAC across all modules
- Full absence request/approval workflow
- Task management system
- Manager self-service tools
- Admin configuration interfaces

**Integration Strategy:**
- Extend existing Calendar with absence requests
- Enhance existing Notifications with new types
- Link to existing Training/Skills modules
- Preserve all 53 existing endpoints

**Timeline:** 10-12 weeks (395 hours)

**Status:** ⏳ **AWAITING USER APPROVAL TO PROCEED**

---

**Created:** 2025-10-11  
**Author:** AI Assistant  
**Version:** 1.0
