# TribeCore Enterprise Modules - Deployment Checklist

Use this checklist to verify successful deployment of all enterprise modules.

---

## ✅ Pre-Deployment

### Environment Setup
- [ ] PostgreSQL 14+ installed and running
- [ ] Node.js 18+ installed
- [ ] npm or yarn package manager available
- [ ] Git repository initialized

### Database Configuration
- [ ] Database `tribecore_db` created
- [ ] Database user has CREATE TABLE permissions
- [ ] Connection string in `.env` file configured
- [ ] UUID extension available (`CREATE EXTENSION "uuid-ossp"`)

### Project Structure
- [ ] Backend directory exists
- [ ] Frontend directory exists
- [ ] Migration files present in `backend/migrations/`

---

## ✅ Database Migration

### Run Migration Scripts
- [ ] Execute `create-ai-governance-hrsd-tables.sql`
- [ ] Execute `create-enterprise-modules-tables.sql`
- [ ] No errors in migration output

### Verify Tables Created
```sql
-- Run this query to verify all tables
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
  AND table_name ~ '^(ai_|hr_|hc_|positions|org_scenarios|skills|employee_skills|marketplace|compensation|webhooks|api_connectors)'
ORDER BY table_name;
```

**Expected Tables (24):**
- [ ] ai_systems
- [ ] ai_decision_logs
- [ ] hr_cases
- [ ] hr_case_comments
- [ ] hr_case_activities
- [ ] knowledge_articles
- [ ] article_feedback
- [ ] er_investigations
- [ ] er_investigation_notes
- [ ] employee_journeys
- [ ] journey_templates
- [ ] hc_metrics
- [ ] hc_reports
- [ ] positions
- [ ] org_scenarios
- [ ] skills
- [ ] employee_skills
- [ ] marketplace_opportunities
- [ ] compensation_bands
- [ ] compensation_reviews
- [ ] webhooks
- [ ] api_connectors

---

## ✅ Backend Setup

### Module Files Present
- [ ] `backend/src/modules/ai-governance/` exists
- [ ] `backend/src/modules/hrsd/` exists
- [ ] `backend/src/modules/iso30414/` exists
- [ ] `backend/src/modules/position-management/` exists
- [ ] `backend/src/modules/skills-cloud/` exists
- [ ] `backend/src/modules/compensation/` exists
- [ ] `backend/src/modules/integrations/` exists

### Each Module Contains
For each of the 7 modules, verify:
- [ ] `entities/` directory with TypeORM entities
- [ ] `services/` directory with service classes
- [ ] `controllers/` directory with REST controllers
- [ ] `[module-name].module.ts` file
- [ ] (Optional) `dto/` directory with DTOs

### Module Registration
Edit `backend/src/app.module.ts` and add:

```typescript
import { AIGovernanceModule } from './modules/ai-governance/ai-governance.module';
import { HRSDModule } from './modules/hrsd/hrsd.module';
import { ISO30414Module } from './modules/iso30414/iso30414.module';
import { PositionManagementModule } from './modules/position-management/position-management.module';
import { SkillsCloudModule } from './modules/skills-cloud/skills-cloud.module';
import { CompensationModule } from './modules/compensation/compensation.module';
import { IntegrationsModule } from './modules/integrations/integrations.module';
```

In the `@Module` imports array:
- [ ] AIGovernanceModule added
- [ ] HRSDModule added
- [ ] ISO30414Module added
- [ ] PositionManagementModule added
- [ ] SkillsCloudModule added
- [ ] CompensationModule added
- [ ] IntegrationsModule added

### Dependencies
- [ ] Run `npm install` in backend directory
- [ ] No dependency conflicts
- [ ] `package.json` includes TypeORM, class-validator, class-transformer

### Build
- [ ] Run `npm run build`
- [ ] Build completes without errors
- [ ] No TypeScript compilation errors

---

## ✅ API Verification

### Start Backend
- [ ] Run `npm run start:dev`
- [ ] Server starts on port 3000 (or configured port)
- [ ] No startup errors
- [ ] All modules loaded successfully

### Test Endpoints
Use curl, Postman, or browser:

**AI Governance:**
```bash
curl http://localhost:3000/api/ai-governance/systems
# Expected: 200 OK, empty array or existing systems
```
- [ ] AI Governance endpoints accessible

**HRSD:**
```bash
curl http://localhost:3000/api/hrsd/cases
# Expected: 200 OK
```
- [ ] HRSD endpoints accessible

**ISO 30414:**
```bash
curl http://localhost:3000/api/iso30414/dashboard/:organizationId
# Expected: 200 OK (may need valid org ID)
```
- [ ] ISO 30414 endpoints accessible

**Positions:**
```bash
curl http://localhost:3000/api/positions/org/:organizationId
# Expected: 200 OK
```
- [ ] Position endpoints accessible

**Skills:**
```bash
curl http://localhost:3000/api/skills-cloud/opportunities/:organizationId
# Expected: 200 OK
```
- [ ] Skills endpoints accessible

**Compensation:**
```bash
curl http://localhost:3000/api/compensation/bands/:organizationId
# Expected: 200 OK
```
- [ ] Compensation endpoints accessible

**Integrations:**
```bash
curl http://localhost:3000/api/integrations/connectors/:organizationId
# Expected: 200 OK
```
- [ ] Integration endpoints accessible

---

## ✅ Frontend Setup (Optional)

### AI Governance Dashboard
- [ ] `frontend/src/pages/ai-governance/AIGovernanceDashboard.tsx` exists
- [ ] `frontend/src/services/aiGovernanceService.ts` exists
- [ ] Route added to App.tsx: `/ai-governance`

### Navigation
- [ ] New menu items added for enterprise modules
- [ ] Icons imported from lucide-react
- [ ] Links work correctly

### Start Frontend
- [ ] Run `npm install` in frontend directory
- [ ] Run `npm run dev`
- [ ] Frontend starts on port 5173 (or configured port)
- [ ] No compilation errors

### Test UI
- [ ] Navigate to http://localhost:5173
- [ ] Login works
- [ ] AI Governance page loads
- [ ] No console errors

---

## ✅ Integration Testing

### Create Test Data

**1. Create AI System:**
```bash
curl -X POST http://localhost:3000/api/ai-governance/systems \
  -H "Content-Type: application/json" \
  -d '{
    "organizationId": "your-org-id",
    "name": "Resume Screening AI",
    "vendor": "OpenAI",
    "riskLevel": "HIGH",
    "usageArea": "RECRUITMENT"
  }'
```
- [ ] AI system created successfully

**2. Create HR Case:**
```bash
curl -X POST http://localhost:3000/api/hrsd/cases \
  -H "Content-Type: application/json" \
  -d '{
    "organizationId": "your-org-id",
    "title": "Payroll Question",
    "description": "How do I update my tax withholding?",
    "caseType": "PAYROLL",
    "priority": "MEDIUM",
    "channel": "PORTAL",
    "employeeId": "employee-id"
  }'
```
- [ ] HR case created successfully

**3. Create Position:**
```bash
curl -X POST http://localhost:3000/api/positions \
  -H "Content-Type: application/json" \
  -d '{
    "organizationId": "your-org-id",
    "positionTitle": "Senior Software Engineer",
    "department": "Engineering",
    "fte": 1.0,
    "effectiveDate": "2025-01-01"
  }'
```
- [ ] Position created successfully

---

## ✅ Performance Verification

### Database Queries
- [ ] Check query performance with EXPLAIN ANALYZE
- [ ] Verify indexes are being used
- [ ] No sequential scans on large tables

### API Response Times
- [ ] List endpoints return in < 200ms
- [ ] Detail endpoints return in < 100ms
- [ ] Create/update endpoints return in < 300ms

### Memory Usage
- [ ] Backend process uses reasonable memory (< 500MB idle)
- [ ] No memory leaks during extended operation

---

## ✅ Security Verification

### Authentication
- [ ] JWT authentication working (if implemented)
- [ ] Protected routes require authentication
- [ ] Invalid tokens rejected

### Authorization
- [ ] RBAC permissions enforced
- [ ] Users can only access authorized resources
- [ ] Admin-only endpoints protected

### Data Validation
- [ ] Invalid input rejected with proper error messages
- [ ] SQL injection prevented (TypeORM parameterization)
- [ ] XSS prevention in place

---

## ✅ Documentation

### Files Present
- [ ] ENTERPRISE_BUILD_FINAL_SUMMARY.md
- [ ] MODULE_REGISTRATION_GUIDE.md
- [ ] ENTERPRISE_MODULES_README.md
- [ ] DEPLOYMENT_CHECKLIST.md (this file)
- [ ] ENTERPRISE_HCM_AUDIT.md

### Code Documentation
- [ ] Entities have JSDoc comments
- [ ] Services have method descriptions
- [ ] Controllers have Swagger decorators

---

## ✅ Production Readiness

### Environment Variables
- [ ] Production .env file created
- [ ] Database credentials secured
- [ ] API keys stored in environment variables
- [ ] CORS configured for production domain

### Error Handling
- [ ] Global exception filter in place
- [ ] Validation pipe configured
- [ ] Proper HTTP status codes returned

### Logging
- [ ] Request logging enabled
- [ ] Error logging configured
- [ ] Log levels appropriate for production

### Monitoring
- [ ] Health check endpoint available
- [ ] Database connection monitoring
- [ ] API endpoint monitoring

---

## ✅ Final Verification

### Smoke Tests
- [ ] Create an AI system
- [ ] Log an AI decision
- [ ] Create and resolve an HR case
- [ ] Create a knowledge article
- [ ] Create a position
- [ ] Add skills to an employee
- [ ] Create a compensation review
- [ ] Set up a webhook

### Data Integrity
- [ ] Foreign key constraints working
- [ ] Cascade deletes configured correctly
- [ ] Soft deletes preserving data
- [ ] Timestamps auto-updating

### Backup & Recovery
- [ ] Database backup script created
- [ ] Backup tested and verified
- [ ] Recovery procedure documented

---

## 🎉 Deployment Complete!

Once all items are checked:

✅ **Backend:** 100% Complete  
✅ **Database:** 24 tables created  
✅ **APIs:** 100+ endpoints functional  
✅ **Documentation:** Comprehensive guides available

### Next Steps:
1. Build remaining frontend pages
2. Configure RBAC permissions
3. Set up monitoring and alerts
4. Create user training materials
5. Plan go-live schedule

---

## 📞 Troubleshooting

**Issue:** Module not found errors  
**Solution:** Run `npm install` in backend directory

**Issue:** Database connection failed  
**Solution:** Check DATABASE_URL in .env file

**Issue:** Port already in use  
**Solution:** Change port in main.ts or kill existing process

**Issue:** TypeORM sync errors  
**Solution:** Verify entity imports in module files

**Issue:** CORS errors  
**Solution:** Configure CORS in main.ts with frontend URL

---

**Checklist Version:** 1.0  
**Last Updated:** October 14, 2025
