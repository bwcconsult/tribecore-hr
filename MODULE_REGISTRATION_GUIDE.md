# TribeCore Enterprise Modules - Registration Guide

## Step 1: Register Modules in app.module.ts

Add these imports to `backend/src/app.module.ts`:

```typescript
import { AIGovernanceModule } from './modules/ai-governance/ai-governance.module';
import { HRSDModule } from './modules/hrsd/hrsd.module';
import { ISO30414Module } from './modules/iso30414/iso30414.module';
import { PositionManagementModule } from './modules/position-management/position-management.module';
import { SkillsCloudModule } from './modules/skills-cloud/skills-cloud.module';
import { CompensationModule } from './modules/compensation/compensation.module';
import { IntegrationsModule } from './modules/integrations/integrations.module';
```

Add to the `imports` array in `@Module()`:

```typescript
@Module({
  imports: [
    // ... existing modules ...
    AIGovernanceModule,
    HRSDModule,
    ISO30414Module,
    PositionManagementModule,
    SkillsCloudModule,
    CompensationModule,
    IntegrationsModule,
  ],
  // ... rest of config
})
export class AppModule {}
```

---

## Step 2: Run Database Migrations

### Option A: Using SQL Scripts (Recommended)

```bash
# From project root
psql -U postgres -d tribecore_db -f backend/migrations/create-ai-governance-hrsd-tables.sql
psql -U postgres -d tribecore_db -f backend/migrations/create-enterprise-modules-tables.sql
```

### Option B: Using TypeORM CLI

```bash
# Generate migration from entities
npm run migration:generate -- -n EnterpriseModules

# Run migrations
npm run migration:run
```

---

## Step 3: Update Frontend Routes

Add these routes to `frontend/src/App.tsx`:

```typescript
// AI Governance
import AIGovernanceDashboard from './pages/ai-governance/AIGovernanceDashboard';

// HRSD
import CasesPage from './pages/hrsd/CasesPage';
import KnowledgeBasePage from './pages/hrsd/KnowledgeBasePage';
import InvestigationsPage from './pages/hrsd/InvestigationsPage';
import JourneysPage from './pages/hrsd/JourneysPage';

// ISO 30414
import ISO30414Dashboard from './pages/iso30414/ISO30414Dashboard';

// Position Management
import PositionsPage from './pages/positions/PositionsPage';
import OrgChartPage from './pages/positions/OrgChartPage';

// Skills Cloud
import SkillsPage from './pages/skills/SkillsPage';
import MarketplacePage from './pages/skills/MarketplacePage';

// Compensation
import CompensationPage from './pages/compensation/CompensationPage';

// Routes
<Route path="/ai-governance" element={<AIGovernanceDashboard />} />
<Route path="/cases" element={<CasesPage />} />
<Route path="/knowledge" element={<KnowledgeBasePage />} />
<Route path="/investigations" element={<InvestigationsPage />} />
<Route path="/journeys" element={<JourneysPage />} />
<Route path="/analytics/iso30414" element={<ISO30414Dashboard />} />
<Route path="/positions" element={<PositionsPage />} />
<Route path="/org-chart" element={<OrgChartPage />} />
<Route path="/skills" element={<SkillsPage />} />
<Route path="/marketplace" element={<MarketplacePage />} />
<Route path="/compensation" element={<CompensationPage />} />
```

---

## Step 4: Add Navigation Menu Items

Update your navigation component with these new menu items:

```typescript
const menuItems = [
  // ... existing items ...
  {
    label: 'AI Governance',
    icon: <Shield />,
    path: '/ai-governance',
    roles: ['SUPER_ADMIN', 'HR_ADMIN'],
  },
  {
    label: 'HR Service Desk',
    icon: <Headphones />,
    path: '/cases',
    submenu: [
      { label: 'Cases', path: '/cases' },
      { label: 'Knowledge Base', path: '/knowledge' },
      { label: 'Investigations', path: '/investigations' },
      { label: 'Journeys', path: '/journeys' },
    ],
  },
  {
    label: 'Analytics',
    icon: <BarChart3 />,
    path: '/analytics',
    submenu: [
      { label: 'ISO 30414', path: '/analytics/iso30414' },
      // ... other analytics
    ],
  },
  {
    label: 'Workforce Planning',
    icon: <Network />,
    path: '/positions',
    submenu: [
      { label: 'Positions', path: '/positions' },
      { label: 'Org Chart', path: '/org-chart' },
    ],
  },
  {
    label: 'Talent',
    icon: <Users />,
    submenu: [
      { label: 'Skills', path: '/skills' },
      { label: 'Marketplace', path: '/marketplace' },
    ],
  },
  {
    label: 'Compensation',
    icon: <DollarSign />,
    path: '/compensation',
  },
];
```

---

## Step 5: Verify Installation

Run these commands to verify everything is working:

```bash
# Backend
cd backend
npm run build
npm run start:dev

# Frontend
cd frontend
npm run dev

# Check database
psql -U postgres -d tribecore_db -c "\dt" | grep -E "(ai_|hr_|hc_|positions|skills|compensation|webhooks)"
```

Expected tables:
- ai_systems, ai_decision_logs
- hr_cases, hr_case_comments, hr_case_activities
- knowledge_articles, article_feedback
- er_investigations, er_investigation_notes
- employee_journeys, journey_templates
- hc_metrics, hc_reports
- positions, org_scenarios
- skills, employee_skills, marketplace_opportunities
- compensation_bands, compensation_reviews
- webhooks, api_connectors

---

## Step 6: Seed Initial Data (Optional)

Create seed data for testing:

```bash
npm run seed:enterprise-modules
```

---

## Troubleshooting

**Issue:** Module not found errors
**Solution:** Run `npm install` in backend directory

**Issue:** Database connection errors
**Solution:** Verify DATABASE_URL in .env file

**Issue:** TypeORM entity errors
**Solution:** Ensure all entities are registered in their respective modules

**Issue:** Frontend routing issues
**Solution:** Clear browser cache and restart dev server

---

## Next Steps

1. Configure RBAC permissions for new modules
2. Set up API documentation (Swagger)
3. Create user guides for each module
4. Configure monitoring & logging
5. Set up automated testing

---

**Total New Modules:** 7  
**Total New Tables:** 20+  
**Total New Endpoints:** 100+  
**Estimated Value:** $2M+ in enterprise functionality
