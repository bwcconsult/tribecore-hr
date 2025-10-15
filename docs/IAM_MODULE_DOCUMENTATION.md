# TribeCore IAM Module - Complete Documentation

**Version:** 1.0  
**Last Updated:** January 2025

---

## **Table of Contents**

1. [Overview](#overview)
2. [Core Components](#core-components)
3. [Pages & Features](#pages--features)
4. [API Endpoints](#api-endpoints)
5. [Security Model](#security-model)
6. [Quick Start Guide](#quick-start-guide)

---

## **1. Overview**

### **What is the IAM Module?**

The Identity & Access Management (IAM) module is an **enterprise-grade security system** implementing RBAC, ABAC, SoD enforcement, delegation management, and comprehensive audit logging.

### **Key Capabilities**

✅ **Role-Based Access Control (RBAC)**  
✅ **Attribute-Based Access Control (ABAC)**  
✅ **Policy-as-Code** (JSON-based policies)  
✅ **Separation of Duties (SoD)** enforcement  
✅ **Role Delegation** with approval workflows  
✅ **Security Groups** for organizational hierarchy  
✅ **Field-Level Data Masking**  
✅ **Comprehensive Audit Logging**  
✅ **Policy Simulation** (test before deploy)  
✅ **IAM User Management** (service accounts, external users)  
✅ **Role Analytics & Reporting**

---

## **2. Core Components**

### **2.1 Roles**

**Built-in Roles:**

| Role | Description | Permissions |
|------|-------------|-------------|
| `SUPER_ADMIN` | Full system access | Everything |
| `ADMIN` | Organization admin | Manage users, org settings |
| `HR_MANAGER` | HR oversight | View/edit employees, approve leave |
| `MANAGER` | Team management | View team, approve requests |
| `FINANCE_MANAGER` | Financial oversight | Process/approve payroll |
| `FINANCE` | Financial operations | View payroll, process expenses |
| `EMPLOYEE` | Standard employee | Self-service HR functions |

**Role Hierarchy:**  
`SUPER_ADMIN` → `ADMIN` → `MANAGER` → `EMPLOYEE`

### **2.2 Permissions**

**Format:** `feature:action:scope`

**Examples:**
- `employee:view:self` - View own profile
- `employee:view:team` - View team profiles  
- `payroll:approve:org` - Approve payroll runs

**Scopes:** `self`, `team`, `org`, `system`

### **2.3 Security Groups**

**Types:** DEPARTMENT, TEAM, PROJECT, LOCATION, CUSTOM

**Use Cases:**
- ABAC attribute filtering
- Delegation scope restrictions
- Organizational hierarchy

### **2.4 IAM Users (NEW!)**

**Types:**

| Type | Description | API Key |
|------|-------------|---------|
| `SERVICE_ACCOUNT` | Automated system access | ✅ Yes |
| `EXTERNAL_USER` | External human users | ❌ No |
| `CONTRACTOR` | Contract workers | ❌ No |
| `CONSULTANT` | External consultants | ❌ No |
| `AUDITOR` | External auditors | ❌ No |
| `TEMPORARY` | Short-term access | ❌ No |

**Features:**
- IP whitelisting
- Access expiration dates
- API key generation (service accounts only)
- External company tracking

---

## **3. Pages & Features**

### **3.1 IAM Overview** (`/iam`)
Central dashboard with stats and quick links.

### **3.2 Roles Management** (`/iam/roles`)
- View all roles with permissions
- **Policy-as-Code JSON editor**
- **Role Hierarchy tree visualization**
- **SoD conflict rules configuration**

**How to Access Policy Editor:**
1. Click **[Policy]** button next to role name
2. Edit JSON (RBAC + ABAC rules)
3. Save changes

### **3.3 User Role Assignment** (`/iam/user-roles`)
- Assign roles to employees
- **Real-time SoD conflict warnings**
- **Active delegations displayed**

### **3.4 Permissions Matrix** (`/iam/permissions`)
- Visual matrix (roles × permissions)
- **ABAC Scope Filters** button → View attribute rules
- **Field Masking** button → View field visibility

### **3.5 Security Groups** (`/iam/security-groups`)
- Manage organizational hierarchies
- **Delegation usage indicators**
- Click badge to view scoped delegations

### **3.6 IAM Users** (`/iam/users`) **[NEW!]**
- Manage external users & service accounts
- Create/Edit/Delete users
- API key management
- Access expiration tracking
- Status management (Active/Inactive/Suspended)

**How to Create Service Account:**
1. Click **[Create IAM User]**
2. Username: `api_service_name`
3. Type: `SERVICE_ACCOUNT`
4. Check "This is a service account"
5. Assign roles
6. Click Create → API key generated

**API Key Format:**  
`tc_a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6...`

### **3.7 Role Analytics** (`/iam/analytics`)
- Role distribution charts
- Dormant users (90+ days no login)
- SoD violations count
- Pending delegations

### **3.8 Delegation Management** (`/iam/delegations`)
- Create role delegations
- Approve/Reject requests
- View active/pending/expired
- Revoke delegations

### **3.9 SoD Violations** (`/iam/sod-violations`)
- View conflicting role assignments
- Risk level classification (Critical/High/Medium/Low)
- Recommendations
- One-click resolution

### **3.10 Audit Log Viewer** (`/iam/audit-logs`)
- Search and filter access logs
- Export to CSV
- Date range filtering
- Action type filtering

### **3.11 Policy Simulator** (`/iam/policy-simulator`)
- Test permission scenarios
- Preview ABAC filters
- See field masking
- Risk assessment

---

## **4. API Endpoints**

### **4.1 IAM Users API**

**Base URL:** `/rbac/iam-users`

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/rbac/iam-users` | Create IAM user |
| GET | `/rbac/iam-users` | Get all IAM users |
| GET | `/rbac/iam-users/stats` | Get statistics |
| GET | `/rbac/iam-users/{id}` | Get user by ID |
| PUT | `/rbac/iam-users/{id}` | Update user |
| POST | `/rbac/iam-users/{id}/roles` | Assign roles |
| POST | `/rbac/iam-users/{id}/deactivate` | Deactivate user |
| POST | `/rbac/iam-users/{id}/reactivate` | Reactivate user |
| POST | `/rbac/iam-users/{id}/suspend` | Suspend user |
| POST | `/rbac/iam-users/{id}/regenerate-api-key` | Regenerate API key |
| DELETE | `/rbac/iam-users/{id}` | Delete user |

**Example: Create Service Account**

```http
POST /rbac/iam-users
Authorization: Bearer {token}
Content-Type: application/json

{
  "username": "api_service_1",
  "type": "SERVICE_ACCOUNT",
  "roles": ["ADMIN"],
  "isServiceAccount": true,
  "purpose": "CRM integration"
}

Response:
{
  "id": "uuid",
  "username": "api_service_1",
  "apiKey": "tc_a1b2c3d4...",
  "status": "ACTIVE"
}
```

---

## **5. Security Model**

### **5.1 RBAC (Role-Based Access Control)**

Users assigned roles → Roles have permissions → Permissions grant access

### **5.2 ABAC (Attribute-Based Access Control)**

Filter data based on user attributes:
- `country` == `user.country`
- `department` == `user.department`
- `businessUnit` == `user.businessUnit`

### **5.3 Separation of Duties (SoD)**

**Example Conflicts:**

| Role A | Conflicts With | Severity |
|--------|----------------|----------|
| `FINANCE_MANAGER` | `FINANCE` | HIGH |
| `ADMIN` | `FINANCE_MANAGER` | CRITICAL |
| `HR_MANAGER` | `FINANCE_MANAGER` | MEDIUM |

### **5.4 Field-Level Masking**

Example: Employee Profile

| Field | EMPLOYEE | MANAGER | HR_MANAGER |
|-------|----------|---------|------------|
| email | ✅ | ✅ | ✅ |
| salary | ❌ | ❌ | ✅ |
| ssn | ❌ | ❌ | ✅ |
| taxId | ❌ | ❌ | ❌ |

---

## **6. Quick Start Guide**

### **For System Administrators:**

1. **Review Roles:** `/iam/roles` - Check default roles
2. **Configure SoD Rules:** Click [SoD Rules] button
3. **Create Security Groups:** `/iam/security-groups`
4. **Assign User Roles:** `/iam/user-roles`

### **For Creating Service Accounts:**

1. Go to **IAM Users** (`/iam/users`)
2. Click **[Create IAM User]**
3. Fill form:
   - Username: `api_service_name`
   - Type: `SERVICE_ACCOUNT`
   - Roles: Select appropriate roles
   - Purpose: Describe use case
4. Check "This is a service account"
5. Click **Create**
6. **Copy API key immediately** (shown once only!)
7. Use API key in your integration:

```javascript
axios.get('https://api.tribecore.com/employees', {
  headers: {
    'Authorization': 'Bearer tc_a1b2c3d4...'
  }
});
```

### **For Creating External Users:**

1. Go to **IAM Users** (`/iam/users`)
2. Click **[Create IAM User]**
3. Fill form:
   - Type: `CONTRACTOR` or `CONSULTANT` or `AUDITOR`
   - Email: Required for login
   - Access Expires: Set end date
   - External Company: Company name
   - Purpose: Reason for access
4. Click **Create**
5. User receives email invitation

### **For Managing Delegations:**

1. Go to **Delegations** (`/iam/delegations`)
2. Click **[Create Delegation]**
3. Select delegate, role, dates
4. Add justification
5. Optional: Restrict to security group
6. Submit for approval or activate immediately

### **For Monitoring Security:**

1. **SoD Violations:** `/iam/sod-violations` - Daily check
2. **Audit Logs:** `/iam/audit-logs` - Weekly review
3. **Role Analytics:** `/iam/analytics` - Monthly review
4. **Expired Users:** Check "Expiring Soon" on IAM Users page

---

## **7. Troubleshooting**

### **Q: Can't assign role to user - SoD warning?**
**A:** The role conflicts with user's existing role. Review SoD Rules page to see conflicts. Remove conflicting role first.

### **Q: API key not working?**
**A:** Check:
- User status is ACTIVE
- API key not expired
- IP address whitelisted (if configured)
- Bearer token format correct

### **Q: User can't see data they should have access to?**
**A:** Check:
1. User has correct role assigned
2. ABAC attributes match (country, department)
3. Field masking configuration
4. Use Policy Simulator to test

### **Q: Delegation not working?**
**A:** Check:
- Delegation status is ACTIVE (not PENDING)
- Current date is between start and end dates
- Delegation not revoked
- Scope restrictions don't block access

---

## **8. Support**

For additional help:
- **Documentation:** `/docs`
- **Support Email:** support@tribecore.com
- **Admin Console:** `/settings`

---

**© 2025 TribeCore. All rights reserved.**
