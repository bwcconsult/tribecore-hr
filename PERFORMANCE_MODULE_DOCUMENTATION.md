# Performance Management System - Documentation

## Overview

Comprehensive, modern performance management system implementing continuous performance tracking through OKRs/KRAs, 1:1 meetings, feedback, recognition, wellbeing monitoring, and structured reviews.

### Statistics
- **15 Backend Entities**
- **50+ REST API Endpoints**
- **7 Frontend Pages**
- **6,400+ lines** of production code
- **Complete State Machines**
- **Real-time Updates** with React Query

---

## Architecture

### Technology Stack
**Backend:** NestJS, TypeORM, PostgreSQL, TypeScript, JWT  
**Frontend:** React 18, TypeScript, React Query, TailwindCSS, Lucide Icons

---

## Features

### 1. Objectives (OKRs/KRAs)
- Weighted objectives with progress tracking (0-100%)
- Parent-child alignment for cascading goals
- Milestones with acceptance criteria
- Confidence levels (High/Medium/Low)
- Auto-status: Draft → Active → At Risk/On Track → Completed
- Blockers tracking and evidence links
- Check-in system

### 2. 1:1 Meetings
- Auto-generated agendas from at-risk objectives, overdue actions, wellbeing
- Meeting notes (employee and manager)
- Decisions → Actions conversion
- Status tracking

### 3. Wellbeing Check-ins
- 3 sliders: Happiness, Motivation, Work-Life Balance (1-10)
- Color-coded scoring (Green/Yellow/Red)
- Support requests and manager responses
- Privacy-first (visible to manager only)
- Auto-flagging for low scores

### 4. Feedback (360-Degree)
- Types: Private, Public, Peer, Upward, Requested
- Competency and values tagging
- Anonymous support
- Read/unread tracking

### 5. Recognition & Badges
- 10 badge types with unique colors
- Public/private recognition
- Social reactions
- Badge distribution tracking

### 6. Actions & Tasks
- From 1:1s, objectives, reviews, feedback
- Priority levels (1-5)
- Overdue detection
- Bulk completion

### 7. Reviews (Ready)
- Configurable cycles (Quarterly, Mid-Year, Annual)
- Self, Manager, Peer, Upward reviews
- Calibration with bias indicators
- AI summary support

---

## Backend Implementation

### Key Entities
1. **Objective** - OKR/KRA with status machine, milestones, progress
2. **Action** - Tasks from multiple sources with priorities
3. **OneOnOne** - Meetings with auto-agendas
4. **Feedback** - 360-degree feedback with tagging
5. **Recognition** - Badges and high fives
6. **WellbeingCheck** - 3-score check-ins with privacy
7. **ReviewCycle** - Performance review configuration
8. **ReviewForm** - Self/Manager/Peer review submissions
9. **CalibrationRecord** - 9-box calibration with audit
10. **Competency** - Skill library with level descriptors
11. **PIP** - Performance Improvement Plans
12. **TalentCard** - Succession planning
13. **Nudge** - Automated notifications

### State Machines

**Objective:**
```
DRAFT → ACTIVE → (AT_RISK | ON_TRACK) → COMPLETED → ARCHIVED
              ↘ CANCELED
```

**Review Cycle:**
```
DRAFT → ACTIVE → SELF_REVIEW_OPEN → MANAGER_REVIEW_OPEN 
→ PEER_REVIEW_OPEN → CALIBRATION → PUBLISHED → CLOSED
```

**PIP:**
```
DRAFT → PENDING_APPROVAL → ACTIVE → EXTENDED 
→ CLOSED_SUCCESS | CLOSED_UNSUCCESSFUL
```

---

## API Endpoints (50+)

### Objectives
- `GET /performance-enhanced/objectives` - List with filters
- `POST /performance-enhanced/objectives` - Create
- `POST /performance-enhanced/objectives/:id/check-in` - Update progress
- `POST /performance-enhanced/objectives/:id/activate` - Approve

### Actions
- `GET /performance-enhanced/actions` - List with filters
- `POST /performance-enhanced/actions/bulk-complete` - Bulk complete

### 1:1s
- `POST /performance-enhanced/one-on-ones` - Schedule
- `POST /performance-enhanced/one-on-ones/:id/generate-agenda` - Auto-generate
- `POST /performance-enhanced/one-on-ones/:id/complete` - Complete

### Feedback & Recognition
- `POST /performance-enhanced/feedback` - Give feedback
- `POST /performance-enhanced/recognition` - Give recognition
- `POST /performance-enhanced/recognition/:id/reactions` - React

### Wellbeing
- `POST /performance-enhanced/wellbeing` - Submit check-in
- `GET /performance-enhanced/wellbeing/:userId/trend` - Get trend

### Dashboards
- `GET /performance-enhanced/dashboard/employee/:userId` - Employee view
- `GET /performance-enhanced/dashboard/manager/:managerId` - Manager view
- `GET /performance-enhanced/dashboard/org` - Org view

---

## Frontend Pages

### 1. Performance Home (`/performance`)
- 6 quick access cards
- Key metrics dashboard
- Nudges/alerts
- Recent activity feeds

### 2. Objectives (`/performance/objectives`)
- Stats: Total, Active, At Risk, Completed
- Filter tabs (6 options)
- Progress bars and status badges
- Actions: View, Check In, Edit, Delete

### 3. 1:1s (`/performance/one-on-ones`)
- Meeting cards with agendas
- Auto-generated agenda items
- Actions: Start, View, Edit, Delete

### 4. Wellbeing (`/performance/wellbeing`)
- Interactive 3-slider form
- Score history and trends
- Support requests

### 5. Feedback (`/performance/feedback`)
- Received/Given tabs
- Unread tracking
- Competency tags

### 6. Recognition (`/performance/recognition`)
- Top badges display
- Recognition feed
- Social reactions

### 7. Actions (`/performance/actions`)
- Bulk operations
- Overdue detection
- Source type indicators

---

## User Guide

### Employees
1. **Set Objectives:** Create OKRs with milestones, align to parent objectives
2. **Check In:** Update progress, confidence, blockers regularly
3. **Wellbeing:** Submit weekly check-ins with 3 scores
4. **Give Feedback:** Private coaching or public kudos
5. **Give Recognition:** Choose from 10 badges
6. **1:1 Meetings:** Review agenda, add topics, complete with notes

### Managers
All employee features PLUS:
1. **Approve Objectives:** Review and activate employee objectives
2. **Auto-Agendas:** System generates 1:1 agendas from at-risk items
3. **Review Wellbeing:** Monitor and respond to employee check-ins
4. **Track Team:** View team dashboard with insights

### HR/People Ops
1. **Configure Cycles:** Create review cycles with date windows
2. **Run Calibration:** Adjust ratings with bias checking
3. **Monitor Compliance:** Org dashboard with trends
4. **Manage PIPs:** Approve and track improvement plans

---

## Deployment

### Environment Variables

**Backend:**
```env
DATABASE_HOST=localhost
DATABASE_PORT=5432
DATABASE_USERNAME=postgres
DATABASE_PASSWORD=yourpassword
DATABASE_NAME=tribecore
JWT_SECRET=your-jwt-secret
NODE_ENV=production
```

**Frontend:**
```env
VITE_API_URL=https://api.yourcompany.com
```

### Installation

**Backend:**
```bash
cd backend
npm install
npm run build
npm run migration:run
npm start
```

**Frontend:**
```bash
cd frontend
npm install
npm run build
npm run preview
```

---

## Future Enhancements

### Priority 1 (Modals)
- Create/Edit objective modal with full form
- Check-in modal for quick updates
- Give feedback modal with all options
- Give recognition modal with badge selector

### Priority 2 (Advanced)
- Review forms (self, manager, peer)
- Calibration board (9-box drag-drop)
- Manager team dashboard
- Objective detail page with milestones

### Priority 3 (Executive)
- Org heatmaps and analytics
- Talent cards (succession planning)
- Export and reporting
- Bias detection algorithms

### Priority 4 (Automation)
- Nudge scheduler (cron jobs)
- Email notifications
- Slack/Teams integrations
- Reminder and escalation system

---

## Support

For issues, questions, or feature requests, please contact the development team or create an issue in the repository.

## License

Proprietary - TribeCore HR Platform

---

**Version:** 1.0.0  
**Last Updated:** October 2025  
**Built By:** TribeCore Development Team
