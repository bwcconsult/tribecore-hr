# TribeCore Feature Enhancement Plan

## 📋 Overview

This document outlines the implementation plan for 8 major feature enhancements to TribeCore HR platform.

**Total Features:** 8 major areas  
**Estimated Effort:** 40-50 hours  
**Implementation Phases:** 4 phases  

---

## 🗺️ Feature Mapping to Current Architecture

### **Where Each Feature Fits:**

| Feature | Maps To | Status | Action Required |
|---------|---------|--------|-----------------|
| **A) Calendar Module** | NEW MODULE | ❌ Not exists | Create new `calendar` module |
| **B) Personal Summary** | `employees` module | ✅ Exists | Extend with profile summary |
| **C) Personal & Work Details** | `employees` module | ✅ Exists | Add detailed sections |
| **D) Documents** | `documents` module | ✅ Exists | Enhance with folders/versions |
| **E) Annual Overview** | `leave` module | ✅ Exists | Add annual view endpoint |
| **F) Absences Detail** | `leave` module | ✅ Exists | Enhance balances calculation |
| **G) Training & Skills** | `learning` module | ✅ Exists | Add skills/qualifications |
| **H) Settings & Notifications** | NEW MODULE | ❌ Not exists | Create `user-settings` module |

---

## 📊 Implementation Phases

### **Phase 1: Calendar & Absences (HIGH PRIORITY)** ⭐
**Effort:** 12-15 hours  
**Dependencies:** Leave module, Employees module

**Features:**
- ✅ Calendar module (day/week/month/annual views)
- ✅ Annual overview (absence visualization)
- ✅ Enhanced absence balances (rolling windows)
- ✅ Calendar export (PDF/ICS)

**Backend Tasks:**
1. Create `calendar` module with entities
2. Add calendar event aggregation endpoints
3. Implement rolling-year balance calculator
4. Add PDF/ICS export services

**Frontend Tasks:**
1. Create Calendar page with views
2. Add Annual Overview page
3. Enhance Absences page with detailed cards
4. Add event tooltips and filters

**Database Changes:**
- `calendar_events` table (aggregates holidays, absences, bank holidays)
- `bank_holidays` table
- `absence_balance_cache` table
- Add rolling window calculation fields

---

### **Phase 2: Profile & Employment (MEDIUM PRIORITY)** ⭐
**Effort:** 10-12 hours  
**Dependencies:** Employees module, Documents module

**Features:**
- ✅ Personal Summary dashboard
- ✅ Personal & Work Details Hub
- ✅ Employment history & timeline
- ✅ Work schedules

**Backend Tasks:**
1. Extend Employee entity with detailed fields
2. Create `EmploymentActivity` entity
3. Create `WorkSchedule` entity
4. Add profile summary endpoints
5. Implement field-level ACL

**Frontend Tasks:**
1. Create Personal Summary page
2. Create Personal & Work Details Hub (tabbed)
3. Add employment timeline component
4. Add bio editor with rich text

**Database Changes:**
- Add fields to `employees` table (pronouns, bio, etc.)
- `employment_activities` table
- `work_schedules` table
- `emergency_contacts` table
- `dependants` table

---

### **Phase 3: Documents & Training (MEDIUM PRIORITY)** ⭐
**Effort:** 10-12 hours  
**Dependencies:** Documents module, Learning module

**Features:**
- ✅ Document folders & versioning
- ✅ Training & development plans
- ✅ Skills & qualifications tracking
- ✅ Certification expiry reminders

**Backend Tasks:**
1. Enhance Documents with folders/versions
2. Add document metadata & retention
3. Create Skills & Qualifications entities
4. Add training activity tracking
5. Implement expiry reminder system

**Frontend Tasks:**
1. Add folder tree to Documents page
2. Add version history modal
3. Create Training & Skills page
4. Add skills matrix component
5. Add certification tracker

**Database Changes:**
- `document_folders` table
- `document_versions` table
- `skills` table
- `person_skills` table
- `training_activities` table
- `certifications` table
- `education_history` table

---

### **Phase 4: Settings & Notifications (LOW PRIORITY)** ⭐
**Effort:** 8-10 hours  
**Dependencies:** None (standalone)

**Features:**
- ✅ User settings (locale, timezone, formatting)
- ✅ Notification preferences
- ✅ Digest scheduler
- ✅ Notification subscriptions

**Backend Tasks:**
1. Create `user-settings` module
2. Create notification preference entities
3. Implement digest scheduler (cron job)
4. Add notification subscription management
5. Integrate with existing notification system

**Frontend Tasks:**
1. Create Settings page (Personal tab)
2. Create Notifications preferences page
3. Add subscription toggles
4. Add timezone/locale selectors

**Database Changes:**
- `user_settings` table
- `notification_preferences` table
- `notification_subscriptions` table
- `notification_queue` table (for digests)

---

## 🏗️ New Database Entities

### **Calendar Module**

```typescript
// CalendarEvent (aggregated view)
{
  id, user_id, type, title, start_date, end_date, 
  color, metadata, status, created_at
}

// BankHoliday
{
  id, region, date, name, is_half_day, created_at
}

// AbsenceBalanceCache
{
  id, user_id, plan_type, period_start, period_end,
  entitlement, taken, remaining, rolling_window_days
}
```

### **Employment & Profile**

```typescript
// EmploymentActivity
{
  id, person_id, date, type, payload_json, 
  created_by, created_at
}

// WorkSchedule
{
  id, person_id, weekday, hours, 
  effective_from, effective_to
}

// EmergencyContact
{
  id, person_id, name, relationship, phone, 
  address, is_primary, created_at
}

// Dependant
{
  id, person_id, name, relationship, dob, 
  is_emergency_contact, created_at
}
```

### **Documents**

```typescript
// DocumentFolder
{
  id, name, parent_id, visibility, 
  retention_policy_id, created_at
}

// DocumentVersion
{
  id, document_id, version, uri, 
  checksum, created_by, created_at
}
```

### **Training & Skills**

```typescript
// Skill
{
  id, name, category, level_type, created_at
}

// PersonSkill
{
  id, person_id, skill_id, level, 
  validated_by, validated_at, expires_at
}

// TrainingActivity
{
  id, person_id, type, status, title, 
  hours, evidence_uri, due_at, completed_at
}

// Certification
{
  id, person_id, name, issuer, issue_date, 
  expiry_date, attachment_uri, created_at
}

// EducationHistory
{
  id, person_id, institution, degree, 
  field, start_date, end_date, created_at
}
```

### **User Settings**

```typescript
// UserSettings
{
  id, user_id, language, picklist_language, 
  formatting_style, country, timezone, created_at
}

// NotificationPreference
{
  id, user_id, delivery, digest_time, created_at
}

// NotificationSubscription
{
  id, user_id, key, channel, role_context, 
  enabled, created_at
}
```

---

## 🔌 New API Endpoints

### **Calendar Module**
```
GET    /calendar/events?from&to&scope&types
POST   /calendar/export/pdf
GET    /calendar/ics?scope&token
GET    /annual-overview?year&user_id
```

### **Profile & Employment**
```
GET    /me/profile
PATCH  /me/profile/{section}
GET    /me/employment/activities
POST   /me/work-schedule
GET    /me/absences/balances
GET    /me/absences/episodes
```

### **Documents**
```
POST   /documents (multipart)
GET    /documents?folder
POST   /documents/{id}/move
POST   /documents/{id}/restore
GET    /documents/{id}/versions
```

### **Training & Skills**
```
GET    /training/summary
POST   /training/activities
GET    /skills/matrix
POST   /skills/validate
GET    /certifications?expiring=true
```

### **Settings & Notifications**
```
GET    /me/settings
PATCH  /me/settings
GET    /me/notifications
PATCH  /me/notifications/preferences
PATCH  /me/notifications/subscriptions/{key}
```

---

## 🎨 Frontend Pages to Create/Enhance

### **New Pages:**
1. `/calendar` - Calendar module (day/week/month/annual views)
2. `/me/profile` - Personal Summary
3. `/me/details` - Personal & Work Details Hub
4. `/annual-overview` - Annual absence overview
5. `/me/training` - Training & Skills
6. `/me/settings` - User Settings
7. `/me/notifications` - Notification Preferences

### **Enhanced Pages:**
1. `/leave` - Enhanced with detailed balances
2. `/documents` - Add folders & versions
3. `/learning` - Add skills tracking

---

## ✅ Open Questions & Design Decisions

### **1. Privacy & Security**
**Q:** Anonymize peer names on calendars for non-managers?  
**A:** ⏳ **Your Decision Required**

**Q:** Obfuscate sickness details to non-HR?  
**A:** ⏳ **Your Decision Required**

### **2. Storage**
**Q:** Document storage choice?  
**Recommendation:** Use Railway Volumes or S3-compatible storage  
**A:** ⏳ **Your Decision Required**

### **3. Notifications**
**Q:** Push notifications (web/mobile) beyond email?  
**Recommendation:** Start with email + in-app, add push later  
**A:** ⏳ **Your Decision Required**

### **4. Calendar Colors**
**Q:** Use fixed colors or make admin-configurable?  
**Recommendation:** Start fixed, add admin config in Phase 4  
**A:** ⏳ **Your Decision Required**

---

## 📅 Recommended Implementation Schedule

### **Week 1: Phase 1 (Calendar & Absences)**
- Day 1-2: Calendar backend (entities, services, APIs)
- Day 3-4: Calendar frontend (views, filters, tooltips)
- Day 5: Annual overview + enhanced absences

### **Week 2: Phase 2 (Profile & Employment)**
- Day 1-2: Profile backend (entities, ACL, APIs)
- Day 3-4: Profile frontend (summary, details hub)
- Day 5: Employment timeline + work schedules

### **Week 3: Phase 3 (Documents & Training)**
- Day 1-2: Documents enhancement (folders, versions)
- Day 3-4: Training & Skills (entities, APIs, pages)
- Day 5: Expiry reminders + notifications

### **Week 4: Phase 4 (Settings & Notifications)**
- Day 1-2: User settings backend
- Day 3-4: Notification preferences + digest
- Day 5: Testing + bug fixes

---

## 🚀 Ready to Start?

**Before I begin implementation, please confirm:**

1. ✅ **Priority:** Start with Phase 1 (Calendar & Absences)?
2. ✅ **Design Decisions:** Answer the 4 open questions above?
3. ✅ **Database:** OK to add ~15 new tables?
4. ✅ **Breaking Changes:** Some existing APIs may need modification?

**Once confirmed, I'll start with Phase 1: Calendar Module!** 🎯

---

## 📊 Estimated Total Additions

- **New Modules:** 2 (calendar, user-settings)
- **Enhanced Modules:** 4 (employees, documents, learning, leave)
- **New Database Tables:** ~15 tables
- **New API Endpoints:** ~30 endpoints
- **New Frontend Pages:** ~7 pages
- **Lines of Code:** ~5,000+ lines

---

**Status:** ⏳ Awaiting Approval to Start Phase 1
