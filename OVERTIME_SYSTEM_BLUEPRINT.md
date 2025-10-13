# World-Class Overtime System - Implementation Progress

## System Overview
Policy-driven, audit-proof, multi-country overtime system for TribeCore supporting tech, manufacturing, healthcare (NHS), retail, public sector, and union environments.

## Current State (Existing)
✅ Basic OvertimeRequest entity
✅ Basic OvertimePolicy entity
✅ Simple approval workflow
✅ Basic multipliers (1.5x, 2.0x)
✅ Frontend OvertimePage (basic)

## Required Additions (from Blueprint)

### Phase 1: Core Data Model (8 New Entities) 🚧
1. **WorkRuleSet** - Policy engine core
   - Country/sector-specific rules (US/FLSA, UK/NHS, EU WTD, SA BCEA, Nigeria)
   - Weekly/daily thresholds
   - Premium ladders (OT125, OT150, OT200, Night, Weekend, Holiday)
   - Rest period rules & fatigue controls
   - Approval hierarchy
   - Call-out minimums
   - Split-shift penalties
   - Meal/rest break penalties
   - Comp-time rules
   - Banking caps

2. **Shift** (Enhanced) - Time capture
   - scheduledStart/End, actualStart/End
   - breaks[] (paid/unpaid)
   - shiftType (day/night/holiday/standby)
   - source (roster, manual, API, time-clock, geofence)
   - confirmedBy, approvedBy, status
   - locationId, deviceId

3. **TimeBlock** - Immutable atomic ledger
   - shiftId reference
   - start/end timestamps
   - workType (work, travel, training, on-call, call-out)
   - costCenter, project
   - isEmergency, isRemote
   - deviceId, geohash
   - Hash chain for tamper-proofing

4. **OvertimeLine** - Calculated results
   - shiftId, policyCode
   - rateClass (OT125/OT150/OT200/NIGHT/WKD/HOL/CALL_OUT/etc.)
   - basis (daily/weekly/consecutive/nth-shift)
   - quantityHours, multiplier
   - calcAmount, earningCode
   - explainTrace (full calculation breakdown)

5. **CompTimeBank** - TOIL/Comp-time tracking
   - employeeId, balanceHours
   - accruals[] (history)
   - redemptions[] (time-off taken)
   - expiryPolicy, caps

6. **OnCallStandby** - On-call tracking
   - windowStart/End
   - rateType (flat/hourly)
   - callOutMinimumHours
   - responseTimeTarget
   - breachFlag

7. **OvertimeApproval** - Advanced workflow
   - approvalFlowId
   - levels (L1/L2/Payroll)
   - SLA timers
   - escalation rules
   - comments, attachments

8. **OvertimeBudget** - Cost control
   - costCenter/project
   - period (week/month/quarter)
   - capHours/capAmount
   - alerts, thresholds

### Phase 2: Calculation Engine 🚧
- **Policy Engine**: Rule matching by country/sector/union
- **Premium Stacking**: Configurable stacking strategies
- **Daily/Weekly OT**: FLSA, CA daily rules, EU WTD
- **Night/Weekend/Holiday Differentials**
- **On-call & Call-out Calculations**: Minimums, travel time
- **Consecutive Day Premiums**: 7th day double-time
- **Split-shift & Meal Penalties**: CA-style configurable
- **Comp-time Banking**: Conversion ratios
- **Rounding**: 6/15-minute configurable
- **ExplainTrace**: Full calculation breakdown per line
- **Audit Trail**: Immutable ledger

### Phase 3: Multi-Country Policy Packs 🚧
1. **United States (FLSA + State)**
   - Weekly OT >40h @ 1.5× (non-exempt)
   - CA daily OT: >8h 1.5×, >12h 2.0×, 7th day rules
   - Meal/rest penalties (CA)
   - Split-shift premium (CA)
   - Exempt roles (no OT)

2. **UK / NHS / EU**
   - EU WTD: ≤48h avg/week, 11h daily rest, 24h weekly rest
   - NHS Agenda for Change: unsocial hours, on-call, call-out
   - Bank Holiday premiums
   - TOIL policies

3. **South Africa (BCEA)**
   - OT ≤10h/week, 1.5× premium
   - Sunday/PH 2.0×
   - Night shift allowance

4. **Nigeria (Labour Act)**
   - 40-48h week, OT by CBA
   - Night/holiday rates

### Phase 4: Safety & Fatigue 🚧
- Rest-breach detector (<11h EU, configurable)
- Consecutive days counter with caps
- Fatigue score (rolling index)
- Safe-staffing dashboards (healthcare)
- Skill/License checks

### Phase 5: Time Capture & Validation 🚧
**Capture Sources:**
- Mobile/web timesheets
- Biometric/time-clock
- Geofenced mobile punches
- API from rostering/EMR/ERP
- CSV import

**Real-time Validations:**
- Overlapping shifts
- Missing breaks
- Rest period violations
- Max daily/weekly hours
- Geofence distance
- Contractor/visa hour limits

### Phase 6: Approval Workflows 🚧
- Multi-level approvals (Employee → Manager L1 → L2 → Payroll)
- Auto-approve thresholds
- SLA timers with escalation
- Comments & attachments
- Bulk approve
- Locking (immutable after export)

### Phase 7: REST APIs (15+ Endpoints) 🚧
```
POST   /shifts (create/punch in)
PATCH  /shifts/:id (update/punch out)
POST   /shifts/:id/punch
POST   /overtime/classify (preview)
GET    /employees/:id/overtime (lines, balances, trends)
POST   /approvals/overtime (bulk)
POST   /comp-time/redemptions
GET    /comp-time/balance
POST   /overtime/export/payroll
GET    /rulesets/:id
POST   /rulesets (effective-dated)
GET    /audit/overtime/:lineId
POST   /budgets
GET    /budgets/:id/burn
POST   /geofence/validate
```

### Phase 8: Frontend UX 🚧
**Employee (Mobile/Web):**
- Punch in/out interface
- Timeline with auto-detected premiums (badges)
- Attest & submit
- Comp-time vs pay toggle
- Preview earnings impact
- Exception assistant
- Calendar view

**Manager Dashboard:**
- Inbox of pending OT
- Bulk approve with filters
- Budget burn tracker
- Fatigue flags
- Cost center editor
- "Approve cheapest coverage" AI

**Payroll Ops:**
- Period close wizard
- Validate exceptions
- Lock & export to payroll
- Retro tool for corrections
- Adjustment batches

**Admin:**
- Policy management (WorkRuleSet CRUD)
- Budget setup
- Analytics dashboards
- Audit logs

### Phase 9: Analytics & Reports 🚧
- OT rate (% of paid hours)
- Cost per cost center/project/role
- Fatigue & rest-breach metrics
- Compliance: hours over limits
- Forecast vs actual
- Nurse staffing lens (skill mix, patient ratio)
- Diversity lens (optional)

### Phase 10: Integrations 🚧
- Time devices (Kronos/UKG, HID, ZKTeco)
- Rostering/EMR/ERP (HealthRoster, Allocate, Workday, SAP)
- Payroll export (SFTP/API, bank files)
- Geo/Maps for geofencing
- Telephony IVR for clocking

### Phase 11: Security & Privacy 🚧
- Immutable TimeBlock ledger with hash chain
- Role-based access
- Location privacy (hashed geohash)
- PII minimized
- Device & IP logs
- Anti-tampering

---

## Implementation Roadmap

**Session 1** (Current): Entities & Core Engine (4-5 hours)
- Create 8 new entities
- Build calculation engine
- Policy engine foundation
- Basic multi-country rules

**Session 2**: API Layer & Services (3-4 hours)
- 15+ REST endpoints
- Service layer
- DTOs & validation
- Controller logic

**Session 3**: Frontend - Employee (3-4 hours)
- Shift capture UI
- Timeline view
- Comp-time interface
- Exception handling

**Session 4**: Frontend - Manager & Admin (3-4 hours)
- Manager approval dashboard
- Admin policy management
- Budget management
- Analytics dashboards

**Session 5**: Advanced Features (2-3 hours)
- Geofencing
- Fatigue tracking
- Integration hooks
- Testing & polish

---

## Technical Stack
**Backend**: NestJS + TypeORM + PostgreSQL
**Frontend**: React + TypeScript + TanStack Query
**Styling**: TailwindCSS + shadcn/ui
**Charts**: Recharts
**Maps**: Leaflet (geofencing)

---

## Success Criteria
✅ Multi-country policy support (5 countries)
✅ Audit-proof immutable ledger
✅ Calculation explainability
✅ Real-time validations
✅ Fatigue & safety controls
✅ Comp-time banking
✅ Mobile-first UX
✅ Manager efficiency tools
✅ Budget enforcement
✅ World-class analytics

---

**Status**: Ready to build! 🚀
**Estimated Total**: 15-20 hours for complete system
**Current Session**: Phase 1 (Entities & Engine)
