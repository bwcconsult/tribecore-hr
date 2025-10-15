# TribeCore Contract Management System - Complete Documentation

**Version:** 1.0  
**Last Updated:** January 2025  
**Module:** Contract Management (CMS)

---

## **Table of Contents**

1. [Overview](#overview)
2. [Architecture](#architecture)
3. [Contract Lifecycle](#contract-lifecycle)
4. [State Machine](#state-machine)
5. [Core Features](#core-features)
6. [User Guide](#user-guide)
7. [API Reference](#api-reference)
8. [Integration Points](#integration-points)

---

## **1. Overview**

### **What is the Contract Management System?**

The Contract Management System (CMS) is an **enterprise-grade platform** for managing the complete lifecycle of all contracts—from creation and negotiation through execution, compliance tracking, renewal, and termination.

### **Key Capabilities**

✅ **Contract Authoring** - Templates, clause library, dynamic fields  
✅ **Workflow Automation** - Approval routing, policy-based rules  
✅ **E-Signature Integration** - DocuSign, Adobe Sign ready  
✅ **Obligation Tracking** - Payments, SLAs, audits, deliverables  
✅ **Renewal Management** - 180/90/60/30-day alerts, performance analysis  
✅ **Compliance Management** - GDPR/DPIA, risk scoring, audit trails  
✅ **Analytics & Reporting** - Contract value, renewal pipeline, performance  

### **Contract Types Supported**

- **Employment** - Offer letters, employment contracts, NDAs
- **Vendor** - Purchase agreements, MSAs, SOWs, SLAs
- **Customer** - Sales agreements, subscription terms
- **Legal** - NDAs, partnership agreements, IP agreements
- **Finance** - Loans, leases, insurance
- **Property** - Office leases, maintenance contracts

---

## **2. Architecture**

### **Backend Stack**

```
┌──────────────────────────────────────────────────┐
│              Backend (NestJS)                     │
├──────────────────────────────────────────────────┤
│  Controllers:                                     │
│  • ContractsController (15 endpoints)            │
│                                                   │
│  Services:                                        │
│  • ContractService (lifecycle management)        │
│  • ApprovalService (workflow routing)            │
│  • ObligationService (tracking & alerts)         │
│  • RenewalService (renewal pipeline)             │
│  • ClauseLibraryService (template management)    │
│                                                   │
│  Entities (11 tables):                           │
│  • Contract, ContractClause, ClauseLibrary       │
│  • Approval, NegotiationVersion, Obligation      │
│  • Renewal, Attachment, Dispute                  │
│  • ContractTemplate, ContractAuditLog            │
└──────────────────────────────────────────────────┘
                     ↕ PostgreSQL
```

### **Frontend Stack**

```
┌──────────────────────────────────────────────────┐
│              Frontend (React)                     │
├──────────────────────────────────────────────────┤
│  Pages (5 main interfaces):                      │
│  • ContractsDashboard - Overview & list          │
│  • ContractDetailPage - Full contract view       │
│  • CreateContractPage - 3-step wizard            │
│  • RenewalsRadar - Renewal pipeline              │
│  • ObligationsBoard - Kanban/list view           │
└──────────────────────────────────────────────────┘
```

---

## **3. Contract Lifecycle**

### **Complete Flow**

```
INTAKE → DRAFT → INTERNAL_REVIEW → COUNTERPARTY_REVIEW
→ AGREED → E_SIGNATURE → EXECUTED → ACTIVE
→ (RENEWAL_DUE | TERMINATION_DUE) → TERMINATED → ARCHIVED
```

### **Workflow Stages**

1. **INTAKE** - Contract request initiated
2. **DRAFT** - Template + data merge, clause selection
3. **INTERNAL_REVIEW** - Legal/Finance/IT/CISO/DPO approvals
4. **COUNTERPARTY_REVIEW** - External negotiation, redlines
5. **AGREED** - Final terms agreed by all parties
6. **E_SIGNATURE** - Multi-party signing ceremony
7. **EXECUTED** - All signatures complete, hash stored
8. **ACTIVE** - Obligations tracking begins
9. **RENEWAL_DUE** - Approaching end date
10. **TERMINATED** - Contract ended, obligations closed
11. **ARCHIVED** - Long-term storage (7 years)

---

## **4. State Machine**

### **State Transitions**

```
DRAFT
  ├─ submitInternal() → INTERNAL_REVIEW

INTERNAL_REVIEW
  ├─ approveAll() → COUNTERPARTY_REVIEW
  └─ reject() → DRAFT

COUNTERPARTY_REVIEW
  ├─ agree() → AGREED
  └─ requestChange() → INTERNAL_REVIEW

AGREED
  ├─ launchSigning() → E_SIGNATURE

E_SIGNATURE
  ├─ allSigned() → EXECUTED
  └─ fail/expire() → AGREED

EXECUTED
  ├─ activate() → ACTIVE

ACTIVE
  ├─ scheduleRenewal() → RENEWAL_DUE
  └─ scheduleTermination() → TERMINATION_DUE

RENEWAL_DUE
  ├─ renewSigned() → ACTIVE (version++)
  └─ lapse() → TERMINATED

TERMINATION_DUE
  └─ closeoutComplete() → TERMINATED

TERMINATED → ARCHIVED (retention policy)
```

### **Hard Gates**

- ❌ No e-signature until **Approvals = Complete** and **Risk ≤ Threshold**
- ❌ No EXECUTED until **All Parties Signed** + **Hash/Certificate stored**
- ❌ No TERMINATE without **Obligation closeout** & **Asset/Data disposition**

---

## **5. Core Features**

### **5.1 Approval Workflow**

**Auto-Routing Rules:**

| Condition | Approver Required |
|-----------|-------------------|
| Risk Score > 5 | Legal |
| Value > £10,000 | Finance |
| Value > £100,000 | CFO |
| Data Categories includes PII | CISO + DPO |
| Requires DPIA | DPO |
| Requires SCC | Legal + DPO |

**Approval Steps:**
1. Legal reviews clauses
2. Finance validates commercial terms
3. Security completes DPIA/questionnaire
4. Executives approve high-value contracts
5. All must approve before proceeding

### **5.2 Obligation Tracking**

**Obligation Types:**
- **PAYMENT** - Invoice payments, recurring charges
- **DELIVERY** - Milestones, deliverables
- **SLA** - Service level agreements, KPIs
- **AUDIT** - Compliance audits, certifications
- **NOTICE** - Renewal notices, termination notices
- **REPORTING** - Regular status reports
- **COMPLIANCE_CHECK** - Policy reviews, security checks

**Status Tracking:**
- PENDING → IN_PROGRESS → COMPLETED
- Auto-detection of OVERDUE and AT_RISK

### **5.3 Renewal Management**

**Renewal Radar Alerts:**
- 🟦 **180 days** - Initial alert
- 🟨 **90 days** - Planning phase
- 🟧 **60 days** - Decision required
- 🟥 **30 days** - Urgent action
- 🔴 **Overdue** - Notice period missed

**Decision Options:**
- **RENEW** - Continue with same/updated terms
- **RENEGOTIATE** - Major term changes
- **TERMINATE** - End contract
- **AUTO_RENEWED** - Automatic renewal clause

**Performance Analysis:**
- Track vendor/employee performance
- SLA compliance metrics
- Cost/benefit analysis
- Recommendation engine

### **5.4 Compliance & Risk**

**Risk Scoring (0-10):**
- Clause deviations from standard
- Data categories (PII, PHI, Financial)
- Cross-border data transfers
- High-value contracts
- Non-standard terms

**Compliance Checks:**
- ✅ GDPR compliance
- ✅ DPIA required for PII processing
- ✅ SCC for EU data transfers
- ✅ Jurisdiction-specific requirements
- ✅ Retention policies (7 years)

**Audit Trail:**
- Every action logged
- User, timestamp, IP address
- Before/after state capture
- Immutable log entries
- Export for compliance audits

---

## **6. User Guide**

### **6.1 Dashboard** (`/contracts`)

**Stats Cards:**
- Total contracts
- Active contracts
- Total contract value
- Expiring soon (90 days)

**Quick Actions:**
- Renewal Radar
- Obligations Board
- Pending Approvals
- Analytics

**Contract List:**
- Search by title, number, counterparty
- Filter by status, type
- Color-coded status badges

### **6.2 Create Contract** (`/contracts/create`)

**3-Step Wizard:**

**Step 1: Basic Information**
- Contract type (15 options)
- Title and description
- Counterparty details

**Step 2: Financial & Dates**
- Contract value
- Currency (GBP/USD/EUR)
- Start and end dates

**Step 3: Compliance & Risk**
- Jurisdiction
- Data categories (PII, PHI, etc.)
- DPIA requirement
- SCC requirement

### **6.3 Contract Detail** (`/contracts/:id`)

**Tabs:**

**Details Tab:**
- Contract information
- Financial details
- Compliance & risk scoring

**Approvals Tab:**
- Approval workflow steps
- Approver names and roles
- Status (Pending/Approved/Rejected)
- Comments and timestamps
- Approve/Reject buttons

**Obligations Tab:**
- List of all obligations
- Due dates and owners
- Status tracking
- Mark complete action

**History Tab:**
- Complete audit trail
- Who did what, when
- State changes

**Workflow Actions:**
- Submit for Review
- Send to Counterparty
- Mark as Agreed
- Launch E-Signature
- Activate Contract

### **6.4 Renewals Radar** (`/contracts/renewals`)

**Features:**
- All upcoming renewals
- Days until renewal/notice
- Performance scores
- Status-based filtering
- Decision modal (Renew/Renegotiate/Terminate)

**Stats:**
- Total renewals
- Due in 30/90 days
- Overdue notices

### **6.5 Obligations Board** (`/contracts/obligations`)

**View Modes:**
- **Kanban** - Drag-and-drop columns (Pending/In Progress/At Risk/Overdue/Completed)
- **List** - Detailed list view with all info

**Features:**
- Filter by type
- Filter by status
- Owner assignment
- Due date tracking
- Amount tracking
- KPI monitoring

---

## **7. API Reference**

### **Base URL:** `/contracts`

### **Contract Endpoints**

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/contracts` | Create new contract |
| GET | `/contracts` | Get all contracts (with filters) |
| GET | `/contracts/stats` | Get statistics |
| GET | `/contracts/:id` | Get contract by ID |
| PUT | `/contracts/:id` | Update contract |
| DELETE | `/contracts/:id` | Delete contract (draft only) |

### **Workflow Endpoints**

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/contracts/:id/submit` | Submit for internal review |
| POST | `/contracts/:id/send-counterparty` | Send to counterparty |
| POST | `/contracts/:id/agree` | Mark as agreed |
| POST | `/contracts/:id/launch-signature` | Launch e-signature |
| POST | `/contracts/:id/execute` | Mark as executed |
| POST | `/contracts/:id/activate` | Activate (start obligations) |

### **Approval Endpoints**

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/contracts/:id/approvals` | Get approvals for contract |
| POST | `/contracts/approvals/:approvalId/decide` | Make approval decision |

### **Obligation Endpoints**

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/contracts/:id/obligations` | Get obligations for contract |

### **Renewal Endpoints**

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/contracts/:id/renewal` | Get renewal for contract |
| GET | `/contracts/renewals/radar` | Get all upcoming renewals |

### **Example: Create Contract**

```http
POST /contracts
Authorization: Bearer {token}
Content-Type: application/json

{
  "type": "EMPLOYMENT",
  "title": "Senior Software Engineer Employment Contract",
  "description": "Full-time employment agreement",
  "counterpartyName": "John Smith",
  "counterpartyEmail": "john.smith@example.com",
  "ownerId": "user-123",
  "value": 85000,
  "currency": "GBP",
  "startDate": "2025-02-01",
  "endDate": "2026-02-01",
  "jurisdiction": "UK",
  "dataCategories": ["PII"],
  "requiresDPIA": true
}

Response: 201 Created
{
  "id": "contract-uuid",
  "contractNumber": "CON-2025-00001",
  "status": "DRAFT",
  ...
}
```

---

## **8. Integration Points**

### **8.1 E-Signature Platforms**

**Supported:**
- DocuSign
- Adobe Sign
- HelloSign

**Integration Flow:**
1. Contract reaches AGREED status
2. System calls `/launch-signature`
3. Backend creates envelope in e-sign platform
4. Signer order defined
5. Email notifications sent
6. Webhook on completion → `/execute` endpoint
7. Certificate and hash stored

### **8.2 HRIS Integration**

**Employment Contracts:**
- Auto-create on employee hire
- Sync salary/benefits data
- Link to employee profile
- Probation tracking
- Termination letters

### **8.3 Finance/ERP Integration**

**Vendor Contracts:**
- Create PO on contract activation
- Link invoices to obligations
- Track spend vs contract value
- Payment reminders
- Accruals and liabilities

### **8.4 Document Storage**

**Cloud Storage:**
- AWS S3
- Azure Blob Storage
- Google Cloud Storage

**Features:**
- Encrypted storage
- Versioning
- Secure access URLs
- Retention policies

---

## **9. Database Schema**

### **Primary Tables**

**contracts** - Main contract records
- 40+ fields including status, dates, value, risk
- Foreign keys to organization, owner
- Full audit fields

**contract_clauses** - Individual clauses
- Links to clause library
- Tracks deviations from standard
- Risk scoring per clause

**clause_library** - Reusable clause templates
- Categorized (confidentiality, payment, etc.)
- Jurisdiction-specific
- Merge field support

**approvals** - Approval workflow steps
- Step number, role, approver
- Status, comments, timestamps
- SLA tracking

**obligations** - Contract deliverables
- Type, title, due date
- Owner, team assignment
- Amount, KPI metrics
- Recurrence patterns

**renewals** - Renewal tracking
- Renewal and notice dates
- Performance metrics
- Decision history

**contract_audit_logs** - Immutable audit trail
- Actor, action, timestamp
- Before/after state
- IP address, user agent

---

## **10. Best Practices**

### **Contract Creation**

1. ✅ Use templates for standard contract types
2. ✅ Select appropriate jurisdiction
3. ✅ Tag data categories accurately
4. ✅ Set realistic start/end dates
5. ✅ Add renewal notice period

### **Approval Management**

1. ✅ Review risk scores before approval
2. ✅ Add detailed comments on rejections
3. ✅ Escalate high-risk deviations
4. ✅ Track approval SLAs

### **Obligation Tracking**

1. ✅ Create obligations during activation
2. ✅ Assign clear owners
3. ✅ Set reminders 7 days before due
4. ✅ Attach evidence on completion

### **Renewal Management**

1. ✅ Review performance 180 days before renewal
2. ✅ Start renegotiations at 90 days
3. ✅ Issue notice by deadline
4. ✅ Document decision rationale

---

## **11. Troubleshooting**

### **Q: Contract stuck in INTERNAL_REVIEW?**
**A:** Check approval workflow. All required approvers must approve. If someone rejected, contract returns to DRAFT.

### **Q: Can't activate executed contract?**
**A:** Ensure contract status is EXECUTED (all parties signed) and certificates are stored.

### **Q: Renewal radar showing wrong dates?**
**A:** Verify end date and notice date are set correctly. Notice date = end date - notice period.

### **Q: Obligation not showing up?**
**A:** Obligations are seeded when contract is activated. Check contract status is ACTIVE.

---

## **12. Roadmap**

**Phase 2 Features:**
- AI clause extraction from uploaded PDFs
- Contract comparison (highlight differences)
- Automated performance scoring
- Blockchain notarization
- Advanced analytics dashboard
- Mobile app for approvals

---

## **13. Support**

**Documentation:** `/docs/CONTRACT_MANAGEMENT_SYSTEM.md`  
**API Docs:** `/api/contracts/docs`  
**Support:** support@tribecore.com

---

**© 2025 TribeCore. All rights reserved.**
