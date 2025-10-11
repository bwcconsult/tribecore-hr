# 🧪 TribeCore HR - Testing Guide

## 📋 **Testing Checklist**

This guide provides comprehensive test scenarios for all Phase 5 features.

---

## 🔐 **1. AUTHENTICATION & RBAC TESTING**

### **Test 1.1: User Registration**

**Steps:**
1. Go to `/register`
2. Fill in registration form:
   - Email: `test@example.com`
   - Password: `SecurePass123!`
   - First Name: `Test`
   - Last Name: `User`
3. Click "Register"

**Expected Result:**
- ✅ User is created
- ✅ Redirected to dashboard
- ✅ User has default role: `EMPLOYEE`

### **Test 1.2: User Login**

**Steps:**
1. Go to `/login`
2. Enter credentials
3. Click "Login"

**Expected Result:**
- ✅ JWT token received
- ✅ Redirected to dashboard
- ✅ User name displayed in header

### **Test 1.3: Role-Based Access**

**Create test users with different roles:**

```sql
-- In your database
UPDATE users SET roles = ARRAY['EMPLOYEE'] WHERE email = 'employee@test.com';
UPDATE users SET roles = ARRAY['MANAGER'] WHERE email = 'manager@test.com';
UPDATE users SET roles = ARRAY['HR_MANAGER'] WHERE email = 'hr@test.com';
UPDATE users SET roles = ARRAY['ADMIN'] WHERE email = 'admin@test.com';
UPDATE users SET roles = ARRAY['SUPER_ADMIN'] WHERE email = 'superadmin@test.com';
```

**Test as EMPLOYEE:**
- ✅ Can view own absence balances
- ✅ Can request absence
- ✅ Can view own tasks
- ✅ Cannot view team tasks
- ❌ Cannot approve absences

**Test as MANAGER:**
- ✅ Can view team absences
- ✅ Can approve/reject team requests
- ✅ Can view team tasks
- ✅ Can assign tasks to team
- ❌ Cannot view org-wide data

**Test as HR_MANAGER:**
- ✅ Can view all absences
- ✅ Can configure absence plans
- ✅ Can verify bank details
- ✅ Can view all employees
- ❌ Cannot manage system permissions

**Test as SUPER_ADMIN:**
- ✅ Has access to everything
- ✅ Can manage permissions
- ✅ Can configure dashboard widgets
- ✅ Can impersonate users

---

## 📅 **2. ABSENCE MANAGEMENT TESTING**

### **Test 2.1: View Absence Plans**

**Steps:**
1. Login as any user
2. Go to `/absence`
3. View absence plans

**Expected Result:**
- ✅ 5 plans displayed: Holiday, Birthday, Level-Up, Sickness, Other
- ✅ Each plan shows description and entitlement

### **Test 2.2: View Absence Balances**

**Steps:**
1. Go to `/absence`
2. View balance cards

**Expected Result:**
- ✅ Balances shown for each plan
- ✅ Shows: Entitlement, Taken, Pending, Remaining
- ✅ Color-coded by plan type

### **Test 2.3: Request Absence - Success**

**Steps:**
1. Go to `/absence`
2. Click "Request Absence"
3. Select plan: "Holiday 2026 Plan"
4. Select start date: Tomorrow
5. Select end date: 3 days from tomorrow
6. Add notes: "Family vacation"
7. Click "Submit Request"

**Expected Result:**
- ✅ Request created with status "PENDING"
- ✅ Pending days increased in balance
- ✅ Available days decreased
- ✅ Request appears in list
- ✅ Success toast notification shown

### **Test 2.4: Request Absence - Insufficient Balance**

**Steps:**
1. Request 100 days of holiday
2. Submit

**Expected Result:**
- ✅ Conflict detected: "EXCEEDS_BALANCE"
- ✅ Request still created (with warning)
- ✅ Error message shown

### **Test 2.5: Request Absence - Overlapping Dates**

**Steps:**
1. Create first request: Jan 1-5
2. Create second request: Jan 3-7

**Expected Result:**
- ✅ Conflict detected: "OVERLAP"
- ❌ Request rejected or flagged

### **Test 2.6: Cancel Absence Request**

**Steps:**
1. Create a pending request
2. Click "Cancel" on the request
3. Confirm cancellation

**Expected Result:**
- ✅ Request status changed to "CANCELLED"
- ✅ Pending days decreased in balance
- ✅ Available days increased
- ✅ Success toast shown

### **Test 2.7: Approve Absence Request (Manager)**

**Steps:**
1. Login as MANAGER
2. Go to manager dashboard (to be implemented in future)
3. Or use API:
```bash
curl -X POST https://YOUR-API/api/v1/absence/requests/REQUEST_ID/approve \
  -H "Authorization: Bearer MANAGER_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"comment": "Approved - enjoy!"}'
```

**Expected Result:**
- ✅ Request status changed to "APPROVED"
- ✅ Pending days decreased
- ✅ Scheduled days increased
- ✅ Remaining days decreased
- ✅ Calendar event created (future feature)
- ✅ Notification sent (future feature)

### **Test 2.8: Reject Absence Request (Manager)**

**Steps:**
1. Login as MANAGER
2. Reject request with reason
```bash
curl -X POST https://YOUR-API/api/v1/absence/requests/REQUEST_ID/reject \
  -H "Authorization: Bearer MANAGER_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"reason": "Team is at capacity", "comment": "Please try another date"}'
```

**Expected Result:**
- ✅ Request status changed to "REJECTED"
- ✅ Pending days decreased
- ✅ Available days increased (balance restored)
- ✅ Rejection reason stored

### **Test 2.9: Sickness Episode**

**Steps:**
1. Create sickness episode
```bash
curl -X POST https://YOUR-API/api/v1/absence/sickness \
  -H "Authorization: Bearer TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "startDate": "2025-01-15",
    "endDate": "2025-01-17",
    "sicknessType": "GENERAL",
    "reason": "Flu",
    "symptoms": "Fever, cough"
  }'
```

**Expected Result:**
- ✅ Episode created
- ✅ Episode count incremented
- ✅ If 3rd episode in 12 months → trigger RTW interview task

---

## ✅ **3. TASK MANAGEMENT TESTING**

### **Test 3.1: View Tasks**

**Steps:**
1. Go to `/tasks`
2. View tasks list

**Expected Result:**
- ✅ Tasks displayed in cards
- ✅ Shows: title, status, priority, due date
- ✅ Filters work (All, Incomplete, Completed)
- ✅ Tabs work (All, Process, Checklist)

### **Test 3.2: Complete Task**

**Steps:**
1. Go to `/tasks`
2. Click on a pending task card
3. Task is marked as completed

**Expected Result:**
- ✅ Task status changes to "COMPLETED"
- ✅ Completed timestamp recorded
- ✅ Task event logged
- ✅ Success toast shown

### **Test 3.3: Create Task (Manager)**

**Steps:**
```bash
curl -X POST https://YOUR-API/api/v1/tasks \
  -H "Authorization: Bearer MANAGER_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Review Q1 Performance",
    "description": "Complete performance review for team member",
    "type": "PERFORMANCE_REVIEW",
    "priority": "HIGH",
    "assigneeId": "USER_ID",
    "dueDate": "2025-02-01"
  }'
```

**Expected Result:**
- ✅ Task created
- ✅ Assigned to user
- ✅ Task event logged (CREATED)
- ✅ Notification sent to assignee (future feature)

### **Test 3.4: Reassign Task (Manager)**

**Steps:**
```bash
curl -X POST https://YOUR-API/api/v1/tasks/TASK_ID/reassign \
  -H "Authorization: Bearer MANAGER_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"assigneeId": "NEW_USER_ID"}'
```

**Expected Result:**
- ✅ Task assigned to new user
- ✅ Task event logged (REASSIGNED)
- ✅ Previous assignee notified (future feature)
- ✅ New assignee notified (future feature)

### **Test 3.5: Create Checklist (Admin)**

**Steps:**
```bash
curl -X POST https://YOUR-API/api/v1/checklists \
  -H "Authorization: Bearer ADMIN_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "New Employee Onboarding",
    "description": "Standard onboarding checklist",
    "category": "ONBOARDING",
    "isTemplate": true,
    "items": [
      {
        "title": "Send welcome email",
        "description": "Include login credentials",
        "sequence": 1,
        "isRequired": true
      },
      {
        "title": "Provide laptop and equipment",
        "sequence": 2,
        "isRequired": true,
        "dueInDays": 1
      },
      {
        "title": "Schedule first 1:1 meeting",
        "sequence": 3,
        "isRequired": true,
        "dueInDays": 7
      }
    ]
  }'
```

**Expected Result:**
- ✅ Checklist template created
- ✅ 3 items created with sequence
- ✅ Total items count = 3
- ✅ Completion percentage = 0%

### **Test 3.6: Complete Checklist Item**

**Steps:**
```bash
curl -X PATCH https://YOUR-API/api/v1/checklist-items/ITEM_ID \
  -H "Authorization: Bearer TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "isCompleted": true,
    "completionNotes": "Email sent successfully"
  }'
```

**Expected Result:**
- ✅ Item marked as completed
- ✅ Completed timestamp recorded
- ✅ Checklist completion % updated (33%)

---

## 📊 **4. DASHBOARD & SAVED SEARCHES TESTING**

### **Test 4.1: Create Saved Search**

**Steps:**
```bash
curl -X POST https://YOUR-API/api/v1/dashboard/saved-searches \
  -H "Authorization: Bearer TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Pending Absences",
    "description": "All pending absence requests",
    "category": "ABSENCES",
    "scope": "PRIVATE",
    "query": {
      "filters": [
        {"field": "status", "operator": "eq", "value": "PENDING"}
      ],
      "sort": [
        {"field": "createdAt", "direction": "DESC"}
      ]
    }
  }'
```

**Expected Result:**
- ✅ Search saved
- ✅ Usage count = 0
- ✅ Appears in user's saved searches list

### **Test 4.2: Execute Saved Search**

**Steps:**
```bash
curl -X POST https://YOUR-API/api/v1/dashboard/saved-searches/SEARCH_ID/execute \
  -H "Authorization: Bearer TOKEN"
```

**Expected Result:**
- ✅ Usage count incremented
- ✅ Last used timestamp updated
- ✅ Search results returned

### **Test 4.3: Share Saved Search**

**Steps:**
```bash
curl -X PATCH https://YOUR-API/api/v1/dashboard/saved-searches/SEARCH_ID \
  -H "Authorization: Bearer TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "scope": "TEAM",
    "sharedWithUserIds": ["USER_ID_1", "USER_ID_2"]
  }'
```

**Expected Result:**
- ✅ Scope changed to TEAM
- ✅ Specific users can access
- ✅ Search appears in shared searches for those users

---

## 💳 **5. BANK DETAILS TESTING**

### **Test 5.1: Add Bank Details**

**Steps:**
```bash
curl -X POST https://YOUR-API/api/v1/profile/bank-details \
  -H "Authorization: Bearer TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "accountHolderName": "John Doe",
    "accountNumber": "12345678",
    "sortCode": "12-34-56",
    "accountType": "CHECKING",
    "bankName": "Test Bank",
    "country": "UK",
    "currency": "GBP",
    "isPrimary": true,
    "consentGiven": true
  }'
```

**Expected Result:**
- ✅ Bank details created
- ✅ Verification status: UNVERIFIED
- ✅ Set as primary account
- ✅ Consent timestamp recorded

### **Test 5.2: Verify Bank Details (HR)**

**Steps:**
```bash
curl -X POST https://YOUR-API/api/v1/profile/bank-details/admin/verify \
  -H "Authorization: Bearer HR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "bankDetailsId": "BANK_ID",
    "verificationNotes": "Verified with bank letter"
  }'
```

**Expected Result:**
- ✅ Status changed to VERIFIED
- ✅ Verified by user ID recorded
- ✅ Verification timestamp recorded
- ✅ Notes saved

---

## 🔒 **6. PERMISSION & SECURITY TESTING**

### **Test 6.1: Permission Check - Employee Cannot Approve**

**Steps:**
1. Login as EMPLOYEE
2. Try to approve absence request:
```bash
curl -X POST https://YOUR-API/api/v1/absence/requests/REQUEST_ID/approve \
  -H "Authorization: Bearer EMPLOYEE_TOKEN"
```

**Expected Result:**
- ❌ 403 Forbidden
- ❌ Error: "Insufficient permissions"

### **Test 6.2: Permission Check - Manager Can Approve Team**

**Steps:**
1. Login as MANAGER
2. Approve team member's request
```bash
curl -X POST https://YOUR-API/api/v1/absence/requests/REQUEST_ID/approve \
  -H "Authorization: Bearer MANAGER_TOKEN"
```

**Expected Result:**
- ✅ 200 OK
- ✅ Request approved

### **Test 6.3: Permission Check - Manager Cannot Approve Other Teams**

**Steps:**
1. Login as MANAGER
2. Try to approve request from different team

**Expected Result:**
- ❌ 403 Forbidden
- ❌ Error: "Access denied - outside your team scope"

---

## 📱 **7. FRONTEND UI TESTING**

### **Test 7.1: Task Centre Page**

**Navigation:**
- ✅ Click "Tasks" in sidebar
- ✅ Page loads at `/tasks`
- ✅ Task Centre header visible

**Tabs:**
- ✅ "All Tasks" tab shows all tasks
- ✅ "Process Tasks" tab filters by process type
- ✅ "Checklist Tasks" tab filters by checklist type

**Filters:**
- ✅ "All" button shows all statuses
- ✅ "Incomplete" button hides completed tasks
- ✅ "Completed" button shows only completed

**Task Cards:**
- ✅ Priority icon displayed (urgent = red)
- ✅ Status badge color-coded
- ✅ Requester name shown
- ✅ Task type label shown
- ✅ Created date formatted correctly
- ✅ Due date shown (if exists)

**Interactions:**
- ✅ Click task card → completes task
- ✅ Success toast shown
- ✅ Task moves to completed
- ✅ Status badge updates

### **Test 7.2: Absence Requests Page**

**Navigation:**
- ✅ Click "Absence" in sidebar
- ✅ Page loads at `/absence`
- ✅ Absence Requests header visible

**Balance Cards:**
- ✅ 4 cards displayed (if 4 active plans)
- ✅ Each card shows plan name
- ✅ Color dot matches plan type
- ✅ Entitlement, Taken, Pending, Remaining shown
- ✅ Numbers formatted correctly

**Request List:**
- ✅ Requests displayed in list
- ✅ Status badge color-coded
- ✅ Date range formatted
- ✅ Days count shown
- ✅ Notes displayed (if exists)
- ✅ "Cancel" button shown for pending requests

**Request Modal:**
- ✅ Click "Request Absence" → modal opens
- ✅ Plan dropdown populated
- ✅ Select plan → shows available balance
- ✅ Date pickers work
- ✅ Notes textarea accepts input
- ✅ Submit → request created
- ✅ Cancel → modal closes
- ✅ Success toast shown on submit

**Error Handling:**
- ✅ Missing required fields → error toast
- ✅ API error → error toast with message
- ✅ Loading states shown during API calls

### **Test 7.3: Profile Page**

**Navigation:**
- ✅ Click "My Profile" in sidebar
- ✅ Page loads at `/profile/me`

**Edit Functionality:**
- ✅ Click "Edit Profile" → navigates to `/profile/details`
- ✅ Click "Edit Bio" → textarea appears
- ✅ Type in bio → text updates
- ✅ Click "Save" → success toast
- ✅ Click "Cancel" → reverts changes

**Profile Details:**
- ✅ All tabs functional (Personal, Employment, Contacts, Dependants)
- ✅ Click "Edit" → fields become editable
- ✅ Fields update when typing
- ✅ Click "Save Changes" → success toast
- ✅ Click "Cancel" → exits edit mode

**Add Contact:**
- ✅ Click "Add Contact" → modal opens
- ✅ Fill form → fields work
- ✅ Click "Add Contact" → success toast
- ✅ Modal closes

**Add Dependant:**
- ✅ Click "Add Dependant" → modal opens
- ✅ Fill form → fields work
- ✅ Click "Add Dependant" → success toast
- ✅ Modal closes

---

## 🚨 **8. ERROR HANDLING TESTING**

### **Test 8.1: Network Errors**

**Steps:**
1. Disconnect network
2. Try to load tasks page

**Expected Result:**
- ✅ Error toast: "Failed to load tasks"
- ✅ Empty state shown
- ✅ No crash

### **Test 8.2: Invalid JWT Token**

**Steps:**
1. Manually edit JWT in localStorage
2. Try to make API call

**Expected Result:**
- ✅ 401 Unauthorized
- ✅ Redirected to login page
- ✅ Token cleared

### **Test 8.3: Validation Errors**

**Steps:**
1. Submit absence request with end date before start date

**Expected Result:**
- ✅ Error toast shown
- ✅ Validation message clear
- ✅ Form not submitted

---

## 📊 **9. PERFORMANCE TESTING**

### **Test 9.1: Page Load Times**

**Expected:**
- ✅ Dashboard: < 2 seconds
- ✅ Tasks page: < 2 seconds
- ✅ Absence page: < 3 seconds (loads balances + requests)
- ✅ Profile page: < 2 seconds

### **Test 9.2: API Response Times**

**Expected:**
- ✅ GET endpoints: < 500ms
- ✅ POST endpoints: < 1 second
- ✅ Approval workflow: < 1.5 seconds

---

## ✅ **TEST SUMMARY CHECKLIST**

### **Authentication & RBAC**
- [ ] Registration works
- [ ] Login works
- [ ] Role-based access enforced
- [ ] Permissions guard working

### **Absence Management**
- [ ] View plans works
- [ ] View balances works
- [ ] Request absence works
- [ ] Cancel request works
- [ ] Approve request works (manager)
- [ ] Reject request works (manager)
- [ ] Conflict detection works
- [ ] Balance updates correctly

### **Task Management**
- [ ] View tasks works
- [ ] Complete task works
- [ ] Create task works (manager)
- [ ] Reassign task works (manager)
- [ ] Checklist creation works (admin)
- [ ] Checklist item completion works
- [ ] Audit trail recorded

### **Dashboard**
- [ ] Create saved search works
- [ ] Execute search works
- [ ] Share search works
- [ ] Widget configuration works (admin)

### **Bank Details**
- [ ] Add bank details works
- [ ] Verify works (HR)
- [ ] Consent tracked

### **Frontend**
- [ ] All pages load
- [ ] All navigation links work
- [ ] All forms submit
- [ ] All modals open/close
- [ ] Error handling works
- [ ] Loading states shown

---

## 🎯 **REGRESSION TESTING**

After each deployment, test:

1. ✅ Login/logout flow
2. ✅ Profile editing (existing feature)
3. ✅ Calendar viewing (existing feature)
4. ✅ New tasks page
5. ✅ New absence page
6. ✅ All navigation links

---

**Testing completed:** [  /  /2025]  
**Tested by:** _______________  
**Issues found:** _______________  
**Status:** [ ] Pass [ ] Fail

---

**Last Updated:** 2025-10-11
