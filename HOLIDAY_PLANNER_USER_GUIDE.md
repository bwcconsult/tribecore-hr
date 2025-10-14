# Holiday Planner User Guide

**TribeCore Holiday Planner**  
World-Class Leave Management System

---

## Table of Contents

1. [Introduction](#introduction)
2. [For Employees](#for-employees)
3. [For Managers](#for-managers)
4. [For HR Administrators](#for-hr-administrators)
5. [Leave Types](#leave-types)
6. [Working Patterns](#working-patterns)
7. [FAQs](#faqs)
8. [Troubleshooting](#troubleshooting)

---

## Introduction

TribeCore Holiday Planner is a comprehensive leave management system designed for organizations of any size, in any region. It supports:

✅ **Multi-country compliance** (UK, US, South Africa, Nigeria, NHS)  
✅ **Any working pattern** (full-time, part-time, shift work)  
✅ **Policy-driven rules** (accrual, carryover, purchase/sell)  
✅ **Smart approvals** (multi-level, conditional, auto-approval)  
✅ **Coverage protection** (safe staffing, capacity tracking)  
✅ **TOIL management** (time off in lieu from overtime)  

---

## For Employees

### Accessing Your Holiday Dashboard

1. Navigate to **Leave → My Holidays**
2. View your dashboard with:
   - 📊 Balance cards for each leave type
   - 📅 Upcoming leave bookings
   - 📈 Year-to-date statistics
   - ⚠️ Expiry warnings

### Understanding Your Balances

Each leave type shows:

- **Entitled:** Your annual entitlement (pro-rated for part-time)
- **Accrued:** Amount earned to date (if monthly accrual)
- **Carried Over:** Days/hours from last year
- **Taken:** Already used this year
- **Pending:** Awaiting approval
- **Available:** What you can book now

**Example:**
```
Annual Leave (AL)
Available: 180.0h
-------------------
Entitled:    224.0h
Accrued:     224.0h  
Carried:      40.0h
Taken:        54.0h
Pending:      30.0h
-------------------
Available:   180.0h  ✅
```

### Requesting Leave

#### Step 1: Check Your Balance

Before requesting, check:
- ✅ Sufficient balance available
- ⚠️ No expiry warnings
- ⚠️ No embargo periods

#### Step 2: Select Dates

Click **"Request Leave"** and select:
- **Leave Type:** Annual Leave, Sick, TOIL, etc.
- **Start Date:** When leave begins
- **End Date:** When leave ends
- **Partial Days:** (Optional) Half days, specific hours

💡 **Tip:** The system shows live balance deduction as you select dates!

#### Step 3: Provide Details

- **Reason:** Brief explanation (required)
- **Notes:** Additional context (optional)
- **Attachments:** Medical certificates, etc. (if required)
- **Cover:** Suggest colleague cover (optional)

#### Step 4: Review Warnings

The system will show:

⚠️ **Notice Warnings**
- "Requires 7 days notice" → Too short notice

⚠️ **Coverage Warnings**
- "Coverage breach on Aug 14" → Team understaffed
- **Suggested alternatives** → Better dates shown

⚠️ **Balance Warnings**
- "Would cause negative balance" → Insufficient leave

#### Step 5: Submit

- **Auto-Approved:** ✅ If under 4 hours & 7+ days notice
- **Pending Approval:** ⏳ Manager notification sent
- **With Warnings:** ⚠️ Manager sees issues

---

### Leave Request Statuses

| Status | Meaning | Next Action |
|--------|---------|-------------|
| 🟡 **PENDING** | Awaiting approval | Wait for manager response |
| 🟢 **APPROVED** | Fully approved | Enjoy your leave! |
| 🔴 **REJECTED** | Denied by manager | Review reason, reschedule |
| ⚫ **CANCELLED** | You cancelled | Balance restored |

---

### Cancelling Leave

You can cancel requests if:
- ✅ Start date is in future
- ✅ Not yet locked for payroll

**How to cancel:**
1. Go to **My Holidays**
2. Find the request
3. Click **"Cancel Request"**
4. Confirm cancellation
5. ✅ Balance automatically restored!

---

### Special Leave Types

#### 🟢 Annual Leave (AL)
- Standard holiday entitlement
- Pro-rated for part-time staff
- Carryover available (usually 5 days)
- Can purchase/sell extra days
- Requires 7 days notice

#### 🔴 Sickness
- Self-certify up to 7 days
- Medical certificate required after 7 days
- Paid stages: Full pay → Half pay → Unpaid
- No approval needed (just notify manager)
- No balance deduction

#### 🟣 Time Off In Lieu (TOIL)
- Earned from approved overtime
- Expires after 90 days
- Conversion rate: 1:1 or 1:1.5
- Check expiry warnings!
- Requires approval

#### 🟠 Maternity/Paternity
- Job-protected leave
- Document upload required
- Statutory pay stages
- Up to 52 weeks (maternity)
- Special approval workflow

---

### Top Tips for Employees

💡 **Book early** - Best availability & no last-minute stress  
💡 **Check team calendar** - Avoid clashes with colleagues  
💡 **Use expiring leave first** - Carried over days expire Apr 1  
💡 **Plan around public holidays** - Maximize your time off  
💡 **Keep manager informed** - Communicate early & often  
💡 **Track your TOIL** - Don't let it expire!  

---

## For Managers

### Accessing Team Capacity Dashboard

1. Navigate to **Leave → Team Capacity**
2. View your dashboard with:
   - 📊 Pending approvals (your action needed)
   - 🗓️ 4-week capacity heatmap
   - 👥 Team off today count
   - ⚠️ Coverage issue alerts

### Capacity Heatmap

Visual 4-week forward view showing team capacity:

```
[Green]  80-100% = Fully staffed
[Yellow] 60-79%  = Warning level
[Orange] 40-59%  = Understaffed
[Red]    <40%    = Critical
```

**How to use:**
- Hover over dates to see details
- Identify risky periods
- Plan approvals strategically

---

### Approving Leave Requests

#### Review Process

For each pending request, you'll see:

**Request Details:**
- Employee name & ID
- Leave type & dates
- Duration (days/hours)
- Reason for leave

**Coverage Analysis:**
- ✅ **Safe:** Coverage looks good
- ⚠️ **Warning:** Close to minimum
- 🔴 **Breach:** Below safe staffing
- 💡 **Alternative dates** suggested

**Example Coverage Breach:**
```
⚠️ Coverage Breach Detected

Aug 14, 2025: DEPT:ENGINEERING
Remaining: 3 / 5 staff required (60% coverage)

Suggested alternatives:
• Aug 21-25 (90% coverage)
• Sep 4-8 (95% coverage)
```

#### Approval Actions

**✅ Approve**
- Normal approval
- Leave is granted
- Balance deducted
- Employee notified

**🔄 Approve with Override**
- Override coverage breach
- Requires senior auth
- Add justification
- Backfill option

**❌ Reject**
- Deny request
- Provide clear reason
- Suggest alternatives
- Employee notified

**💬 Request Changes**
- Ask employee to modify
- Suggest better dates
- Provide reasoning
- Keep pending

#### Backfill Management

For critical roles:
1. Mark request as **"Requires Backfill"**
2. Assign replacement employee
3. System creates backfill shift
4. Track completion

---

### Approval Best Practices

**⏰ Respond Quickly**
- SLA: 48 hours for most requests
- Auto-escalates if overdue
- Employees waiting for confirmation

**👀 Check Coverage**
- Review team capacity heatmap
- Ensure minimum staffing met
- Balance team time off fairly

**💬 Communicate**
- Explain rejections clearly
- Suggest alternative dates
- Keep employees informed

**📋 Document Overrides**
- Coverage breaches need justification
- Note backfill arrangements
- Maintain audit trail

**🤝 Be Fair**
- First-come-first-served (where possible)
- Consider personal circumstances
- Distribute peak times fairly

---

### Bulk Actions

Approve multiple requests at once:

1. Select requests (checkbox)
2. Click **"Bulk Approve"**
3. Review summary
4. Confirm action
5. ✅ All processed together

---

### Delegation

Going on leave yourself?

1. Go to **Settings → Approvals**
2. Click **"Delegate Approvals"**
3. Select delegate (colleague/senior)
4. Set date range
5. ✅ Delegate receives notifications

---

### Manager Reporting

Access team leave reports:

**📊 Team Utilization**
- % of leave used vs entitled
- Unused leave warnings
- Carryover predictions

**📈 Coverage Trends**
- Historical staffing levels
- Breach incidents
- Seasonal patterns

**👥 Individual Balances**
- Employee-by-employee breakdown
- Bradford Factor (sickness)
- TOIL tracking

---

## For HR Administrators

### Accessing HR Policy Studio

1. Navigate to **Leave → Policy Studio**
2. Configure leave policies no-code style:
   - 📝 Leave type definitions
   - ⚙️ Accrual rules
   - 🔄 Carryover settings
   - 💰 Purchase/Sell programs
   - ✅ Approval workflows

### Managing Leave Types

#### Creating a New Leave Type

1. Click **"+ New Leave Type"**
2. Fill in details:
   - **Code:** AL, SICK, MAT, etc.
   - **Name:** Display name
   - **Unit:** Hours, Days, or Weeks
   - **Color:** UI display color

3. Configure **Entitlement:**
   - Full-time hours/days per year
   - Pro-rating for part-time
   - Unlimited balance (for sick)

4. Set **Accrual:**
   - **Upfront:** All at start of year
   - **Monthly Pro-Rata:** Earned monthly
   - **Anniversary:** On hire date
   - **Rounding:** Up, Down, Nearest 0.5h

5. Define **Carryover:**
   - ☑️ Enable carryover
   - Max hours/days allowed
   - Expiry date (e.g., Apr 1)
   - Approval required?

6. Configure **Purchase/Sell:**
   - ☑️ Enable purchase
   - Max hours to buy
   - ☑️ Enable sell
   - Max hours to sell
   - Window (Sep 1 - Oct 31)

7. Set **Approval Rules:**
   - Minimum notice days
   - Minimum block size
   - Maximum request length
   - Documentation required

8. Click **"Save"**

---

### Preset Templates

Quick-start with compliance-ready presets:

**🇬🇧 UK Standard**
- 28 days (5.6 weeks) WTD compliant
- Monthly pro-rata accrual
- 5 days carryover (expires Apr 1)
- SSP sick pay stages
- Purchase/Sell program

**🇺🇸 US FMLA**
- 20 days PTO (combined vacation/sick)
- 12 weeks FMLA (unpaid, job-protected)
- Documentation required
- Rolling 12-month measurement

**🇿🇦 South Africa BCEA**
- 21 consecutive days mandatory
- No carryover (use or forfeit)
- Pro-rated for part-time
- BCEA Act 75 of 1997 compliant

**🇳🇬 Nigeria**
- 6 days minimum after 1 year
- Anniversary-based accrual
- Labour Act compliant

**🏥 NHS Agenda for Change**
- 27-33 days (by service years)
- Study leave (30 days/3 years)
- On-call recovery time
- Carryover with approval

---

### Working Patterns

Define standard working patterns:

**Full-Time (Mon-Fri)**
```
37.5 hours/week
Mon-Fri: 7.5h/day (9am-5pm)
Weekend: Off
FTE: 100%
```

**Part-Time 60%**
```
22.5 hours/week
Mon-Wed: 7.5h/day
Thu-Sun: Off
FTE: 60%
```

**4-on-4-off Shifts**
```
42 hours/week average
12h shifts (7am-7pm)
4 days on, 4 days off rotation
FTE: 100%
```

---

### Public Holiday Management

Upload public holiday calendars:

1. **CSV Import:**
   ```csv
   Date,Name,Country,State,Type
   2025-12-25,Christmas Day,GB,ENG,BANK_HOLIDAY
   2025-12-26,Boxing Day,GB,ENG,BANK_HOLIDAY
   ```

2. **Manual Entry:**
   - Date, Name, Country, State
   - Type (NATIONAL, REGIONAL, COMPANY)
   - In-lieu rules

3. **Recurrence:**
   - Fixed dates (Dec 25)
   - Floating (Easter Monday)
   - Observed dates (if weekend)

---

### Embargo Windows

Create blackout periods:

**Example: Retail Christmas Freeze**
```
Name: Christmas Trading Period
Dates: Dec 10 - Jan 5
Scope: DEPARTMENT:RETAIL
Strictness: ABSOLUTE
Reason: Peak trading period
```

**Example: Project Go-Live**
```
Name: System Migration Freeze
Dates: Nov 1 - Nov 7
Scope: TEAM:IT-INFRASTRUCTURE
Strictness: APPROVAL_REQUIRED
Override: CTO approval only
```

---

### Approval Workflows

Configure multi-level approvals:

**Standard Workflow:**
```
1. LINE_MANAGER (48h SLA)
2. ROSTER_OWNER (if shift conflict)
3. DEPARTMENT_HEAD (if >40h)
4. HR (if compliance issue)
```

**Threshold Rules:**
- `>40 hours` → Add DEPARTMENT_HEAD
- `Negative balance` → Add HR
- `Coverage breach` → Add ROSTER_OWNER
- `<7 days notice` → Add override requirement

**Auto-Approval:**
```
Criteria:
• ≤4 hours duration
• ≥7 days notice
• Coverage OK
• Balance sufficient
→ Auto-approve immediately
```

---

### Payroll Export

Generate leave deductions for payroll:

1. **Select Period:**
   - Month: October 2025
   - Pay cycle: Monthly

2. **Review Deductions:**
   - Approved leave only
   - Paid vs unpaid breakdown
   - Sick pay stages applied

3. **Export Format:**
   - **CSV:** Import to payroll software
   - **JSON:** API integration
   - **PDF:** Audit report

4. **Mark as Exported:**
   - Locks leave requests
   - Prevents double-export
   - Creates batch ID

5. **Rollback:**
   - Unlock if needed
   - Re-export if errors

---

### Reporting & Analytics

**📊 Leave Utilization**
- % used by department
- Unused leave warnings
- Carryover projections

**📈 Bradford Factor**
- Sickness patterns
- Trigger levels (50, 150, 300)
- OH referral alerts

**👥 Equity Analysis**
- Fair access to peak times
- Approval time SLAs
- Gender/role breakdowns

**⚠️ Coverage Breaches**
- Historical incidents
- Severity levels
- Department trends

**💰 Cost Analysis**
- Leave liability
- Purchase/Sell costs
- TOIL accruals

---

## Leave Types

### Standard Leave Types

| Code | Name | Typical Entitlement | Paid? | Approval? |
|------|------|---------------------|-------|-----------|
| **AL** | Annual Leave | 28 days (UK) | Yes | Yes |
| **SICK** | Sickness | Unlimited | Staged | No |
| **TOIL** | Time Off In Lieu | Earned from OT | Yes | Yes |
| **MAT** | Maternity | Up to 52 weeks | Staged | Yes |
| **PAT** | Paternity | 2 weeks | Yes | Yes |
| **STUDY** | Study Leave | 5-30 days | Yes | Yes |
| **COMP** | Compassionate | 3-5 days | Yes | Fast-track |
| **UNPAID** | Unpaid Leave | Negotiable | No | Yes |

### Country-Specific

**🇬🇧 UK**
- 28 days statutory minimum
- SSP for sickness
- Shared parental leave
- Paternity (2 weeks)

**🇺🇸 United States**
- No federal vacation mandate
- FMLA (12 weeks unpaid)
- State-specific sick leave
- Parental varies by state

**🇿🇦 South Africa**
- 21 consecutive days/year
- 30 days sick per 3 years
- 4 months maternity
- Family responsibility (3 days)

**🇳🇬 Nigeria**
- 6 days after 1 year service
- 12 days after 5 years
- 12 weeks maternity
- 2 days paternity

---

## Working Patterns

### Pattern Types

**📅 Fixed Patterns**
- Same schedule every week
- e.g., Mon-Fri 9-5

**🔄 Rotating Patterns**
- Repeating cycle
- e.g., 4-on-4-off, Dupont, Pitman

**📊 Compressed Hours**
- Full-time hours in fewer days
- e.g., 10h/day Mon-Thu

**🌙 Shift Patterns**
- Day/Night/Evening rotations
- 24/7 operations

### FTE Calculations

**Full-Time (100% FTE)**
- 37.5h/week → 224h/year leave
- 40h/week → 240h/year leave

**Part-Time (60% FTE)**
- 22.5h/week → 134.4h/year leave
- Pro-rated entitlement

**Compressed (100% FTE)**
- 37.5h/week over 4 days
- Same entitlement, fewer leave days needed

---

## FAQs

**Q: Can I take leave before I've accrued it?**  
A: Depends on policy. UK usually allows (with negative balance at leave), US usually requires accrual first.

**Q: What happens to unused leave?**  
A: Check carryover rules. Usually 5 days carry to next year, expiring Apr 1. Rest is forfeited.

**Q: Can I cancel approved leave?**  
A: Yes, if not yet locked for payroll and start date is future.

**Q: Do public holidays count as leave?**  
A: Depends on policy. UK: Usually deducted from entitlement. If you work, you get day in-lieu.

**Q: How does TOIL work?**  
A: Overtime hours → TOIL hours (1:1 or 1:1.5 rate). Expires after 90 days. Use it or lose it!

**Q: Can I see my team's leave?**  
A: Yes, managers see team calendar. Employees see public team view (not details).

**Q: What's Bradford Factor?**  
A: Sickness tracking: `(Episodes² × Days) ÷ 2`. Score >300 triggers review.

**Q: Can I buy extra leave?**  
A: If enabled, during purchase window (usually Sep-Oct). Max 5 days typically. Salary sacrifice.

**Q: Can I sell unused leave?**  
A: If enabled, during sell window. Max 3 days typically. Paid as taxable income.

**Q: How do I contest a rejection?**  
A: Speak with manager first. Escalate to HR if needed. Provide business case.

---

## Troubleshooting

### "Insufficient balance" error

**Cause:** Not enough leave available  
**Solution:**
1. Check balance card (taken + pending)
2. Wait for pending approvals
3. Consider part-day request
4. Use different leave type (TOIL?)

---

### "Coverage breach" warning

**Cause:** Team understaffed on request dates  
**Solution:**
1. Check suggested alternative dates
2. Coordinate with team
3. Manager can override with backfill
4. Consider shorter duration

---

### "Notice requirement not met"

**Cause:** Requesting too close to start date  
**Solution:**
1. Check policy (usually 7 days)
2. Add explanation/justification
3. Manager can override if genuine emergency
4. Plan earlier next time

---

### "TOIL not showing in balance"

**Cause:** Overtime not yet approved  
**Solution:**
1. Check overtime status
2. Wait for OT approval
3. TOIL auto-added once OT approved
4. Contact HR if approved >24h ago

---

### "Request disappeared"

**Cause:** Auto-cancelled due to embargo  
**Solution:**
1. Check email notifications
2. Review embargo calendar
3. Re-submit for different dates
4. Contact manager for override

---

### "Can't cancel approved leave"

**Cause:** Locked for payroll export  
**Solution:**
1. Check if payroll already run
2. Contact payroll/HR
3. May need manual adjustment
4. Cancel earlier in future

---

## Support

**📧 Email:** support@tribecore.com  
**📞 Phone:** +44 (0)20 1234 5678  
**💬 Live Chat:** Available 9am-5pm GMT  
**📚 Docs:** docs.tribecore.com/holiday-planner  
**🎥 Training:** training.tribecore.com  

---

*Last Updated: October 2025*  
*Version 1.0.0*
