# TribeCore Enterprise Modules

## 🎯 Overview

This README provides a comprehensive guide to the **7 enterprise modules** added to TribeCore, transforming it into a world-class HCM platform.

---

## 📦 Module Catalog

### 1. AI Governance & EU AI Act Compliance
**Path:** `backend/src/modules/ai-governance/`  
**Status:** ✅ Production Ready (Backend + Frontend)

Register, monitor, and ensure compliance for all AI systems used in HR processes.

**Key Features:**
- AI system registry with risk classification
- Decision logging and audit trails
- Bias testing and DPIA tracking
- Human-in-the-loop workflows
- Compliance reporting

**API Endpoints:**
```
POST   /ai-governance/systems          # Register AI system
GET    /ai-governance/systems          # List all systems
POST   /ai-governance/decisions        # Log AI decision
GET    /ai-governance/decisions/audit  # Get audit trail
GET    /ai-governance/compliance       # Compliance dashboard
```

**Database Tables:**
- `ai_systems` - AI system catalog
- `ai_decision_logs` - Decision audit trail

**Frontend:**
- `/ai-governance` - Dashboard with system overview, risk analysis, compliance metrics

---

### 2. HR Service Delivery (HRSD)
**Path:** `backend/src/modules/hrsd/`  
**Status:** ✅ Backend Complete

ServiceNow-style case management for HR teams.

**Key Features:**
- Multi-channel case management
- SLA tracking (first response, resolution)
- Knowledge base with deflection analytics
- ER investigations with evidence locker
- Employee journey automation

**API Endpoints:**

**Cases:**
```
POST   /hrsd/cases              # Create case
GET    /hrsd/cases              # List cases
PUT    /hrsd/cases/:id          # Update case
POST   /hrsd/cases/assign       # Assign case
POST   /hrsd/cases/resolve      # Resolve case
GET    /hrsd/cases/:id/comments # Get comments
POST   /hrsd/cases/rate         # CSAT rating
```

**Knowledge Base:**
```
POST   /hrsd/knowledge/articles        # Create article
POST   /hrsd/knowledge/articles/search # Search KB
GET    /hrsd/knowledge/articles/popular # Popular articles
POST   /hrsd/knowledge/articles/rate   # Rate article
```

**ER Investigations:**
```
POST   /hrsd/investigations            # Create investigation
POST   /hrsd/investigations/:id/evidence # Add evidence
POST   /hrsd/investigations/conclude   # Conclude investigation
```

**Employee Journeys:**
```
POST   /hrsd/journeys              # Create journey
POST   /hrsd/journeys/:id/start    # Start journey
PUT    /hrsd/journeys/tasks/update # Update task
GET    /hrsd/journeys/templates    # Get templates
```

**Database Tables:**
- `hr_cases`, `hr_case_comments`, `hr_case_activities`
- `knowledge_articles`, `article_feedback`
- `er_investigations`, `er_investigation_notes`
- `employee_journeys`, `journey_templates`

---

### 3. ISO 30414 Analytics Pack
**Path:** `backend/src/modules/iso30414/`  
**Status:** ✅ Backend Complete

Board-grade human capital metrics and reporting.

**Key Features:**
- 25+ pre-configured ISO 30414 metrics
- Automated metric calculation
- Trend analysis and benchmarking
- Board report generation
- ESG reporting support

**API Endpoints:**
```
POST   /iso30414/metrics/calculate  # Calculate metrics
POST   /iso30414/reports/board      # Generate board report
GET    /iso30414/metrics/:orgId/category/:category # Get by category
GET    /iso30414/metrics/:orgId/trend/:metricCode  # Get trend
GET    /iso30414/dashboard/:orgId   # Dashboard data
```

**Metric Categories:**
- Costs (workforce costs, cost per hire)
- Productivity (revenue/FTE, profit/FTE)
- Recruitment (time to fill, quality of hire)
- Turnover (voluntary, involuntary, regrettable loss)
- Diversity (gender ratio, pay gap)
- Leadership (pipeline, succession)
- Skills (coverage, training hours)

**Database Tables:**
- `hc_metrics` - Metric values
- `hc_reports` - Generated reports

---

### 4. Position Management & Workforce Planning
**Path:** `backend/src/modules/position-management/`  
**Status:** ✅ Backend Complete

Manage positions independently of people for org design and planning.

**Key Features:**
- Position-based org structure
- Vacancy tracking
- Org chart generation
- What-if scenario modeling
- Budget planning

**API Endpoints:**
```
POST   /positions                      # Create position
GET    /positions/org/:orgId           # Get all positions
GET    /positions/org/:orgId/vacant    # Get vacant positions
GET    /positions/org/:orgId/chart     # Get org chart
GET    /positions/org/:orgId/metrics   # Workforce metrics
POST   /positions/scenarios            # Create scenario
GET    /positions/scenarios/:orgId     # Get scenarios
```

**Database Tables:**
- `positions` - Position registry
- `org_scenarios` - What-if scenarios

---

### 5. Skills Cloud & Talent Marketplace
**Path:** `backend/src/modules/skills-cloud/`  
**Status:** ✅ Backend Complete

Internal talent marketplace for skills visibility and mobility.

**Key Features:**
- Skills taxonomy management
- Employee skill profiles
- Proficiency tracking
- Skill gap analysis
- Internal gig marketplace
- AI-powered talent matching

**API Endpoints:**
```
POST   /skills-cloud/skills              # Create skill
POST   /skills-cloud/employee-skills     # Add employee skill
GET    /skills-cloud/employee-skills/:employeeId # Get skills
GET    /skills-cloud/skill-gaps/:orgId   # Skill gap analysis
POST   /skills-cloud/opportunities       # Create opportunity
GET    /skills-cloud/opportunities/:orgId # Get opportunities
GET    /skills-cloud/opportunities/:id/matches # Match employees
```

**Database Tables:**
- `skills` - Skills taxonomy
- `employee_skills` - Skill profiles
- `marketplace_opportunities` - Internal gigs

---

### 6. Compensation & Total Rewards
**Path:** `backend/src/modules/compensation/`  
**Status:** ✅ Backend Complete

Manage compensation bands and review cycles.

**Key Features:**
- Compensation band management
- Annual review cycles
- Compa-ratio analysis
- Pay equity reporting
- Approval workflows

**API Endpoints:**
```
POST   /compensation/bands                # Create band
GET    /compensation/bands/:orgId         # Get bands
POST   /compensation/reviews              # Create review
GET    /compensation/reviews/employee/:id # Employee reviews
GET    /compensation/reviews/pending/:orgId # Pending reviews
POST   /compensation/reviews/:id/approve  # Approve review
```

**Database Tables:**
- `compensation_bands` - Salary bands
- `compensation_reviews` - Review cycles

---

### 7. Integration Platform
**Path:** `backend/src/modules/integrations/`  
**Status:** ✅ Backend Complete

Connect TribeCore to your HR tech ecosystem.

**Key Features:**
- Webhook subscriptions
- Pre-built API connectors
- Auto-sync schedules
- Field mapping
- Event-driven architecture

**API Endpoints:**
```
POST   /integrations/webhooks            # Create webhook
POST   /integrations/webhooks/trigger    # Trigger webhook
POST   /integrations/connectors          # Create connector
GET    /integrations/connectors/:orgId   # Get connectors
POST   /integrations/connectors/:id/sync # Sync connector
```

**Supported Events:**
- employee.created, employee.updated, employee.terminated
- leave.requested, leave.approved
- payroll.processed
- case.created
- position.created

**Pre-built Connectors:**
- SCIM, Okta, Azure AD
- Workday, SuccessFactors
- Slack, Teams
- BambooHR
- Custom APIs

**Database Tables:**
- `webhooks` - Webhook subscriptions
- `api_connectors` - API integrations

---

## 🚀 Quick Start

### 1. Deploy Modules
```bash
# Linux/Mac
chmod +x deploy-enterprise-modules.sh
./deploy-enterprise-modules.sh

# Windows
.\deploy-enterprise-modules.ps1
```

### 2. Register Modules
Add to `backend/src/app.module.ts`:

```typescript
import { AIGovernanceModule } from './modules/ai-governance/ai-governance.module';
import { HRSDModule } from './modules/hrsd/hrsd.module';
import { ISO30414Module } from './modules/iso30414/iso30414.module';
import { PositionManagementModule } from './modules/position-management/position-management.module';
import { SkillsCloudModule } from './modules/skills-cloud/skills-cloud.module';
import { CompensationModule } from './modules/compensation/compensation.module';
import { IntegrationsModule } from './modules/integrations/integrations.module';

@Module({
  imports: [
    // ... existing modules
    AIGovernanceModule,
    HRSDModule,
    ISO30414Module,
    PositionManagementModule,
    SkillsCloudModule,
    CompensationModule,
    IntegrationsModule,
  ],
})
export class AppModule {}
```

### 3. Start Services
```bash
# Backend
cd backend
npm run start:dev

# Frontend
cd frontend
npm run dev
```

### 4. Verify
```bash
# Check API
curl http://localhost:3000/api/ai-governance/systems
curl http://localhost:3000/api/iso30414/dashboard/:orgId

# Check database
psql -U postgres -d tribecore_db -c "\dt" | grep -E "(ai_|hr_|hc_|positions|skills|compensation)"
```

---

## 📊 Architecture

### Design Patterns
- **Entity-first design** - TypeORM entities define schema
- **Service layer** - Business logic separated from controllers
- **DTO validation** - class-validator for input validation
- **Repository pattern** - TypeORM repositories for data access
- **Modular monolith** - Independent modules with clear boundaries

### Code Organization
```
backend/src/modules/[module-name]/
├── entities/          # TypeORM entities
├── dto/              # Data transfer objects
├── services/         # Business logic
├── controllers/      # REST endpoints
└── [module].module.ts # Module definition
```

### Database Strategy
- PostgreSQL 14+
- UUID primary keys
- JSONB for flexible data
- Soft deletes (deletedAt)
- Full indexing on foreign keys
- Audit timestamps (createdAt, updatedAt)

---

## 🔐 Security & Compliance

### Data Privacy
- GDPR-compliant data handling
- Soft deletes preserve audit trail
- Access logging for sensitive data (ER investigations)
- Field-level encryption ready

### Compliance
- EU AI Act compliance tracking
- ISO 30414 reporting standards
- Audit trails for all changes
- Data retention policies
- Evidence chain of custody

---

## 📈 Performance

### Database Optimization
- Indexed all foreign keys
- Composite indexes on common queries
- JSONB GIN indexes for searching
- Query builder for complex queries

### API Performance
- Pagination on all list endpoints
- Eager loading to prevent N+1
- Caching strategy ready
- Rate limiting ready

---

## 🧪 Testing (Recommended)

### Unit Tests
```bash
npm run test
```

### E2E Tests
```bash
npm run test:e2e
```

### Test Coverage
```bash
npm run test:cov
```

---

## 📚 Additional Documentation

- **ENTERPRISE_BUILD_FINAL_SUMMARY.md** - Complete build summary
- **MODULE_REGISTRATION_GUIDE.md** - Step-by-step installation
- **ENTERPRISE_HCM_AUDIT.md** - Gap analysis and requirements
- **API Documentation** - Swagger at `/api/docs` (configure in main.ts)

---

## 🛠️ Customization

### Adding Custom Fields
Use the `metadata` JSONB column available in all entities:

```typescript
await hrCaseService.createCase({
  // ... standard fields
  metadata: {
    customField1: 'value',
    customField2: 123,
  }
});
```

### Extending Entities
Create migrations to add columns:

```bash
npm run migration:generate -- -n AddCustomFields
npm run migration:run
```

---

## 🆘 Troubleshooting

### Module not found
```bash
cd backend && npm install
```

### Database errors
Check `.env` file:
```env
DATABASE_URL=postgresql://postgres:password@localhost:5432/tribecore_db
```

### TypeORM entity errors
Verify all entities are imported in module files.

### Port conflicts
Change ports in:
- Backend: `backend/src/main.ts` (default 3000)
- Frontend: `frontend/vite.config.ts` (default 5173)

---

## 🚀 Roadmap

### Coming Soon
- [ ] Frontend pages for all modules
- [ ] Advanced RBAC integration
- [ ] Real-time notifications
- [ ] Mobile app support
- [ ] Advanced analytics dashboards
- [ ] AI-powered recommendations
- [ ] Workflow automation engine

---

## 📞 Support

For issues or questions:
1. Check documentation files
2. Review code comments
3. Check TypeScript types
4. Verify database schema

---

## 📄 License

Part of TribeCore HCM Platform.

---

**Built with ❤️ using NestJS, TypeORM, and PostgreSQL**
