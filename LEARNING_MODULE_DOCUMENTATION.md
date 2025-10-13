# Learning & Development Module - Complete Documentation

## Overview
The Learning & Development Module provides comprehensive training management with real-time progress tracking, UK mandatory training compliance, and interactive course delivery. Built for organizations of all sizes to manage statutory, mandatory, and optional training programs.

---

## Key Features

### 1. **UK Mandatory Training Library**
Pre-configured courses covering all UK statutory and mandatory training requirements:
- Health & Safety Awareness (HASAWA 1974)
- Fire Safety Awareness (Fire Safety Order 2005)
- Data Protection & UK GDPR
- Equality, Diversity & Inclusion (Equality Act 2010)
- Display Screen Equipment (DSE) Awareness
- Sexual Harassment Prevention (Worker Protection Act 2023)
- Cyber Security Awareness
- First Aid at Work (FAW & EFAW)
- Manual Handling (TILE Assessment)
- COSHH Training
- Safeguarding Children & Vulnerable Adults

### 2. **Real-Time Progress Tracking**
- Second-by-second time tracking
- Lesson-level progress monitoring
- Automatic progress updates every 30 seconds
- Video position tracking
- Document page tracking
- Quiz attempt tracking
- Interactive element tracking

### 3. **Course Structure**
**Multi-Level Hierarchy:**
- **Course** → **Modules** → **Lessons** → **Content**
- Flexible course design with unlimited modules
- Multiple lesson types per module
- Sequential or non-sequential learning paths

**Lesson Types:**
- VIDEO: Video-based learning with duration tracking
- READING: Text-based content with rich formatting
- DOCUMENT: PDF/document viewing
- QUIZ: Multiple choice, true/false, short answer, essay questions
- INTERACTIVE: Scenarios, simulations, drag-drop, matching
- ASSIGNMENT: Submissions and assessments
- PRACTICAL: Hands-on exercises
- ASSESSMENT: Final evaluations

### 4. **Assessment & Certification**
- Built-in quiz engine with multiple question types
- Configurable passing scores
- Attempt limits
- Instant feedback
- Certificate generation upon completion
- Validity period tracking (12, 24, 36 months)
- Expiry notifications

### 5. **Compliance Dashboards**
- Organization-wide compliance scoring
- Department-level tracking
- Individual employee progress
- Statutory vs mandatory vs optional breakdowns
- Expiry tracking (30, 60, 90-day alerts)
- RIDDOR and HSE compliance reporting

---

## Technical Architecture

### Backend Components

#### **Entities**
1. **Course** - Core course information
   - Title, description, category
   - Duration, instructor, status
   - Mandatory flag, expiry dates
   - Enrollment and completion counts

2. **CourseModule** - Course sections
   - Title, description, order
   - Learning objectives
   - Resource attachments
   - Duration tracking

3. **Lesson** - Individual learning units
   - Type (VIDEO, QUIZ, READING, etc.)
   - Content URL, video URL, document URL
   - Quiz configuration with questions
   - Interactive content configuration
   - Completion criteria

4. **LessonProgress** - Real-time tracking
   - Status (NOT_STARTED, IN_PROGRESS, COMPLETED, FAILED)
   - Progress percentage (0-100%)
   - Time spent (seconds)
   - Quiz scores and attempts
   - Quiz answers with timestamps
   - Assignment submissions
   - Metadata (video position, document page, etc.)

5. **CourseEnrollment** - Student enrollment
   - Enrollment and completion dates
   - Overall progress percentage
   - Status tracking
   - Completed lessons array
   - Total hours completed
   - Certificate URL
   - Mandatory flag

6. **MandatoryTrainingTemplate** - UK training library
   - Category (STATUTORY, MANDATORY, ROLE_SPECIFIC)
   - UK legislation references
   - Frequency (ANNUAL, BIENNIAL, TRIENNIAL)
   - Validity months
   - Applicable roles and departments
   - Learning outcomes
   - Assessment requirements

#### **Services**

**LearningEnhancedService** - Core business logic:
```typescript
// Module Management
createModule(courseId, data)
getCourseModules(courseId)
updateModule(id, data)
deleteModule(id)

// Lesson Management
createLesson(moduleId, data)
getModuleLessons(moduleId)
getLessonById(id)
updateLesson(id, data)
deleteLesson(id)

// Progress Tracking
startLesson(enrollmentId, lessonId, employeeId)
updateLessonProgress(progressId, data)
submitQuiz(progressId, answers)
completeLesson(progressId)
updateEnrollmentProgress(enrollmentId)

// Dashboard & Analytics
getEnrollmentProgress(enrollmentId)
getComplianceDashboard(organizationId)
getEmployeeLearningDashboard(employeeId)

// Mandatory Training
getAllMandatoryTraining()
getMandatoryTrainingById(id)
```

#### **API Endpoints**
Base URL: `/learning-enhanced`

**Modules:**
- `POST /courses/:courseId/modules` - Create module
- `GET /courses/:courseId/modules` - Get all modules
- `PATCH /modules/:id` - Update module
- `DELETE /modules/:id` - Delete module

**Lessons:**
- `POST /modules/:moduleId/lessons` - Create lesson
- `GET /modules/:moduleId/lessons` - Get module lessons
- `GET /lessons/:id` - Get lesson details
- `PATCH /lessons/:id` - Update lesson
- `DELETE /lessons/:id` - Delete lesson

**Progress:**
- `POST /progress/start` - Start lesson
- `PATCH /progress/:progressId` - Update progress
- `POST /progress/:progressId/quiz` - Submit quiz
- `POST /progress/:progressId/complete` - Complete lesson
- `GET /enrollments/:enrollmentId/progress` - Get full progress

**Dashboards:**
- `GET /compliance/dashboard?organizationId=X` - Compliance dashboard
- `GET /employee/:employeeId/dashboard` - Employee dashboard

**Mandatory Training:**
- `GET /mandatory-training` - Get all UK mandatory courses
- `GET /mandatory-training/:id` - Get specific course

---

### Frontend Components

#### **Pages**

1. **LearningPage** (`/learning`)
   - Course catalog overview
   - Enrollment management
   - Course creation and editing
   - Statistics dashboard

2. **MyLearningDashboard** (`/learning/my-learning`)
   - Personal learning overview
   - Mandatory training status
   - Continue learning section
   - Achievement badges
   - All enrolled courses

3. **UKMandatoryTrainingPage** (`/learning/mandatory-training`)
   - UK statutory training library
   - Filtered by category (STATUTORY, MANDATORY, ROLE_SPECIFIC)
   - Legislation references
   - Enrollment options

4. **LearningComplianceDashboard** (`/learning/compliance`)
   - Organization-wide compliance rate
   - Course-by-course breakdown
   - Department compliance tracking
   - Upcoming expirations
   - Action items

5. **CoursePlayerPage** (`/learning/course/:enrollmentId`)
   - Interactive course player
   - Module/lesson navigation sidebar
   - Progress tracking indicator
   - Content rendering by type
   - Quiz submission
   - Automatic progress saving

#### **Service Layer**
`learningService.ts` - API integration with 30+ methods covering:
- Course CRUD operations
- Enrollment management
- Module and lesson operations
- Real-time progress tracking
- Quiz submissions
- Dashboard data fetching

---

## UK Mandatory Training Details

### Statutory Training (Legally Required)

1. **Health and Safety Awareness**
   - **Legislation:** Health and Safety at Work etc. Act 1974
   - **Duration:** 90 minutes
   - **Frequency:** Annual
   - **Applicable to:** All employees
   - **Covers:** Hazard identification, RIDDOR, risk assessment, emergency procedures

2. **Fire Safety Awareness**
   - **Legislation:** Regulatory Reform (Fire Safety) Order 2005
   - **Duration:** 60 minutes
   - **Frequency:** Annual
   - **Applicable to:** All employees
   - **Covers:** Fire prevention, evacuation, fire-fighting equipment

3. **Data Protection & UK GDPR**
   - **Legislation:** UK GDPR, Data Protection Act 2018
   - **Duration:** 60 minutes
   - **Frequency:** Annual
   - **Applicable to:** All employees handling personal data
   - **Covers:** 7 principles, data security, breaches, ICO reporting

4. **Equality, Diversity & Inclusion**
   - **Legislation:** Equality Act 2010
   - **Duration:** 60 minutes
   - **Frequency:** Annual
   - **Applicable to:** All employees
   - **Covers:** 9 protected characteristics, discrimination, harassment

5. **Display Screen Equipment Awareness**
   - **Legislation:** DSE Regulations 1992
   - **Duration:** 30 minutes
   - **Frequency:** Annual
   - **Applicable to:** DSE users (1+ hour daily)
   - **Covers:** Ergonomic setup, health risks, assessments

6. **Sexual Harassment Prevention**
   - **Legislation:** Equality Act 2010, Worker Protection Act 2023
   - **Duration:** 60 minutes
   - **Frequency:** Annual
   - **Applicable to:** All employees (mandatory since Oct 2024)
   - **Covers:** Legal definition, reporting, preventative duty

### Role-Specific Training

7. **First Aid at Work (FAW)**
   - **Legislation:** First-Aid Regulations 1981
   - **Duration:** 3 days (1440 minutes)
   - **Validity:** 3 years
   - **Applicable to:** Designated first aiders (higher-risk)
   - **Covers:** CPR, AED, injuries, medical emergencies

8. **Manual Handling**
   - **Legislation:** Manual Handling Regulations 1992
   - **Duration:** 120 minutes
   - **Frequency:** Annual
   - **Applicable to:** Anyone lifting/carrying
   - **Covers:** TILE assessment, safe techniques, injury prevention

9. **COSHH Training**
   - **Legislation:** COSHH Regulations 2002
   - **Duration:** 120 minutes
   - **Frequency:** Annual
   - **Applicable to:** Workers with hazardous substances
   - **Covers:** Risk assessment, control measures, PPE, emergency procedures

10. **Safeguarding**
    - **Legislation:** Children Act 1989, Care Act 2014
    - **Duration:** 180 minutes
    - **Validity:** 2 years
    - **Applicable to:** Staff working with children/vulnerable adults
    - **Covers:** Abuse recognition, reporting, safeguarding principles

---

## Real-Time Progress Tracking Implementation

### How It Works

1. **Lesson Start**
   ```typescript
   startLesson(enrollmentId, lessonId, employeeId)
   → Creates LessonProgress record
   → Status: IN_PROGRESS
   → Starts timer
   ```

2. **Progress Updates** (Every 30 seconds)
   ```typescript
   updateLessonProgress(progressId, {
     progressPercentage: calculated,
     timeSpentSeconds: timer,
     metadata: { videoPosition, documentPage, ... }
   })
   → Auto-saves progress
   → Updates enrollment progress
   ```

3. **Quiz Submission**
   ```typescript
   submitQuiz(progressId, answers)
   → Checks answers against correct answers
   → Calculates score
   → Compares to passing score
   → If passed: Status = COMPLETED
   → If failed: Status = FAILED, can retry
   ```

4. **Lesson Completion**
   ```typescript
   completeLesson(progressId)
   → Status = COMPLETED
   → completedAt = now
   → progressPercentage = 100
   → Triggers enrollment progress recalculation
   ```

5. **Enrollment Progress Calculation**
   ```typescript
   updateEnrollmentProgress(enrollmentId)
   → Counts completed lessons
   → totalLessons vs completedLessons
   → progressPercentage = (completed / total) * 100
   → If 100%: Status = COMPLETED, issue certificate
   ```

---

## Compliance Scoring

### Organization-Level
```
Compliance Rate = (Completed Mandatory Enrollments / Total Mandatory Enrollments) × 100

Status Ratings:
- Excellent: ≥ 95%
- Good: 80-94%
- Fair: 60-79%
- Poor: < 60%
```

### Employee-Level
```
Individual Compliance = (Completed Mandatory / Total Required Mandatory) × 100

Tracked Metrics:
- Total enrollments
- Completed courses
- In-progress courses
- Total learning hours
- Mandatory vs optional breakdown
```

---

## Expiry Management

### Tracking System
- Each enrollment has `expiryDate` calculated from completion
- Validity based on course requirements:
  - Annual: 12 months
  - Biennial: 24 months
  - Triennial: 36 months

### Notifications
- **90 days before expiry:** First warning
- **30 days before expiry:** Second warning
- **7 days before expiry:** Final warning
- **On expiry:** Status = EXPIRED, requires renewal

---

## Certificate Generation

### Requirements
- Course must have `hasCertificate = true`
- Enrollment status = COMPLETED
- All lessons completed
- All assessments passed

### Certificate Content
- Employee name
- Course title
- Completion date
- Issue date
- Expiry date (if applicable)
- Certificate number (unique)
- Awarding organization details
- Digital signature

---

## Integration Points

### With Health & Safety Module
- Training records linked to H&S compliance
- COSHH, Manual Handling, First Aid training records
- Certificate tracking for competency verification

### With HR Module
- Employee onboarding (automatic mandatory enrollment)
- Performance reviews (training completion)
- Role changes (trigger role-specific training)
- Termination (archive training records)

### With Payroll Module
- Training time as paid hours
- Training cost allocation
- CPD hours tracking for professional staff

---

## Best Practices

### For Administrators
1. **Set up mandatory courses first** - Ensure compliance before optional training
2. **Configure automatic enrollment** - New employees get mandatory training immediately
3. **Monitor compliance dashboard weekly** - Stay ahead of expirations
4. **Send reminders 30 days before expiry** - Give employees time to renew
5. **Review completion rates monthly** - Identify barriers to completion

### For Course Creators
1. **Break courses into small modules** - 15-20 minutes per module
2. **Mix content types** - Combine videos, readings, and quizzes
3. **Include knowledge checks** - Short quizzes after each module
4. **Provide downloadable resources** - Job aids, checklists, templates
5. **Set realistic passing scores** - 80% for general, 90% for critical

### For Employees
1. **Complete mandatory training first** - Avoid compliance issues
2. **Set aside dedicated time** - Minimize interruptions
3. **Take notes during lessons** - Reinforce learning
4. **Review resources after completion** - Apply knowledge immediately
5. **Track your progress** - Monitor upcoming renewals

---

## Future Enhancements

### Planned Features
1. **Mobile App** - Learn on-the-go
2. **Offline Mode** - Download courses for offline access
3. **AI-Powered Recommendations** - Personalized learning paths
4. **Gamification** - Points, badges, leaderboards
5. **Social Learning** - Discussion forums, peer reviews
6. **Video Conferencing Integration** - Live virtual training
7. **SCORM Compliance** - Import external courses
8. **Advanced Analytics** - Completion patterns, effectiveness metrics
9. **Multi-Language Support** - Translate courses automatically
10. **Integration with LinkedIn Learning** - External course tracking

---

## Technical Requirements

### Backend
- NestJS 10+
- TypeORM 0.3+
- PostgreSQL 14+
- Node.js 18+

### Frontend
- React 18+
- TypeScript 5+
- TailwindCSS 3+
- Lucide Icons
- React Router 6+

### Storage
- Video hosting (AWS S3, Cloudflare R2, etc.)
- Document storage (PDF, DOCX support)
- Certificate storage
- Large file uploads (chunking support)

---

## Conclusion

The Learning & Development Module provides a complete, UK-compliant training management system with real-time progress tracking, comprehensive course structures, and detailed analytics. It addresses all statutory training requirements while providing flexibility for custom organizational training programs.

**Version:** 1.0.0  
**Last Updated:** October 2025  
**Maintained By:** TribeCore HR Platform Team
