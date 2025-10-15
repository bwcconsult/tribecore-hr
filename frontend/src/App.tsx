import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'sonner';
import { Toaster as HotToast } from 'react-hot-toast';
import { useAuthStore } from './stores/authStore';

// Layouts
import AuthLayout from './layouts/AuthLayout';
import DashboardLayout from './layouts/DashboardLayout';

// Auth Pages
import LoginPage from './pages/auth/LoginPage';
import RegisterPage from './pages/auth/RegisterPage';

// Dashboard Pages
import DashboardPage from './pages/dashboard/DashboardPage';
import EmployeesPage from './pages/employees/EmployeesPage';
import EmployeeDetailsPage from './pages/employees/EmployeeDetailsPage';
import PayrollPage from './pages/payroll/PayrollPage';
import { EmployeePayrollDashboard } from './pages/payroll/EmployeePayrollDashboard';
import { EmployeePayslipsPage } from './pages/payroll/EmployeePayslipsPage';
import { PayrollRunWizard } from './pages/payroll/PayrollRunWizard';
import { ContractorPayments } from './pages/payroll/ContractorPayments';
import { PayrollAnalyticsDashboard } from './pages/payroll/PayrollAnalyticsDashboard';
import { TaxComplianceDashboard } from './pages/payroll/TaxComplianceDashboard';
import { MultiCurrencyPayments } from './pages/payroll/MultiCurrencyPayments';
import AIForecastingDashboard from './pages/payroll/AIForecastingDashboard';
import AnomalyDetectionDashboard from './pages/payroll/AnomalyDetectionDashboard';
import BonusCommissionManager from './pages/payroll/BonusCommissionManager';
import ThirteenthMonthCalculator from './pages/payroll/ThirteenthMonthCalculator';
import AuditReportDashboard from './pages/payroll/AuditReportDashboard';
import EnhancedPayrollDashboard from './pages/payroll/EnhancedPayrollDashboard';
import PayslipsPage from './pages/payroll/PayslipsPage';
import PayslipDetailPage from './pages/payroll/PayslipDetailPage';
import PayslipManagementPage from './pages/payroll/admin/PayslipManagementPage';
import CodesCatalogPage from './pages/payroll/admin/CodesCatalogPage';
import LeavePage from './pages/leave/LeavePage';
import AttendancePage from './pages/attendance/AttendancePage';
import PerformancePage from './pages/performance/PerformancePage';
import ObjectivesPage from './pages/performance/ObjectivesPage';
import OneOnOnesPage from './pages/performance/OneOnOnesPage';
import WellbeingPage from './pages/performance/WellbeingPage';
import FeedbackPage from './pages/performance/FeedbackPage';
import PerformanceRecognitionPage from './pages/performance/RecognitionPage';
import ActionsPage from './pages/performance/ActionsPage';
import ReviewCyclesPage from './pages/performance/ReviewCyclesPage';
import ReviewCycleDetailPage from './pages/performance/ReviewCycleDetailPage';
import ReviewFormPage from './pages/performance/ReviewFormPage';
import CalibrationPage from './pages/performance/CalibrationPage';
import ReviewResultsPage from './pages/performance/ReviewResultsPage';
import ReportsPage from './pages/reports/ReportsPage';
import SettingsPage from './pages/settings/SettingsPage';
import OnboardingPage from './pages/onboarding/OnboardingPage';
import BenefitsPage from './pages/benefits/BenefitsPage';
import TimeTrackingPage from './pages/time-tracking/TimeTrackingPage';
import ExpensesPage from './pages/expenses/ExpensesPage';
import SubmitExpensePage from './pages/expenses/SubmitExpensePage';
import ExpenseDetailsPage from './pages/expenses/ExpenseDetailsPage';
import ApprovalsPage from './pages/expenses/ApprovalsPage';
import ExpenseAnalyticsPage from './pages/expenses/ExpenseAnalyticsPage';
import BudgetHealthPage from './pages/expenses/BudgetHealthPage';
import WorkflowManagementPage from './pages/expenses/WorkflowManagementPage';
import TripsPage from './pages/expenses/TripsPage';
import MileagePage from './pages/expenses/MileagePage';
import ExpenseSettingsPage from './pages/expenses/ExpenseSettingsPage';
import ExpensesAdminLayout from './components/expenses/ExpensesAdminLayout';
import ExpensesAdminDashboard from './pages/expenses/admin/ExpensesAdminDashboard';
import ExpensesAdminTrips from './pages/expenses/admin/ExpensesAdminTrips';
import ExpensesAdminReports from './pages/expenses/admin/ExpensesAdminReports';
import ExpensesAdminAdvances from './pages/expenses/admin/ExpensesAdminAdvances';
import ExpensesAdminBatchPayments from './pages/expenses/admin/ExpensesAdminBatchPayments';
import ExpensesAdminCorporateCards from './pages/expenses/admin/ExpensesAdminCorporateCards';
import ExpensesAdminBudgets from './pages/expenses/admin/ExpensesAdminBudgets';
import ExpensesAdminAnalytics from './pages/expenses/admin/ExpensesAdminAnalytics';
import ExpensesAdminSettings from './pages/expenses/admin/ExpensesAdminSettings';
import ExpensesAdminGettingStarted from './pages/expenses/admin/ExpensesAdminGettingStarted';
import RecruitmentPage from './pages/recruitment/RecruitmentPage';
import LearningPage from './pages/learning/LearningPage';
import MyLearningDashboard from './pages/learning/MyLearningDashboard';
import UKMandatoryTrainingPage from './pages/learning/UKMandatoryTrainingPage';
import LearningComplianceDashboard from './pages/learning/LearningComplianceDashboard';
import CoursePlayerPage from './pages/learning/CoursePlayerPage';
import AnalyticsPage from './pages/analytics/AnalyticsPage';
import CalendarPage from './pages/calendar/CalendarPage';
import AnnualOverviewPage from './pages/calendar/AnnualOverviewPage';
import PersonalSummaryPage from './pages/profile/PersonalSummaryPage';
import PersonalDetailsPage from './pages/profile/PersonalDetailsPage';
import TaskCentrePage from './pages/tasks/TaskCentrePage';
import AbsenceRequestsPage from './pages/absence/AbsenceRequestsPage';
import ShiftsRotasPage from './pages/shifts/ShiftsRotasPage';
import RecognitionPage from './pages/recognition/RecognitionPage';
import OffboardingPage from './pages/offboarding/OffboardingPage';
import OffboardingDashboard from './pages/offboarding/OffboardingDashboard';
import CreateSeparationCasePage from './pages/offboarding/CreateSeparationCasePage';
import OnboardingDashboard from './pages/onboarding/OnboardingDashboard';
import CreateOnboardingCasePage from './pages/onboarding/CreateOnboardingCasePage';
import RecruitmentDashboard from './pages/recruitment/RecruitmentDashboard';
import CreateRequisitionPage from './pages/recruitment/CreateRequisitionPage';
import CreateJobPage from './pages/recruitment/CreateJobPage';
import OvertimePage from './pages/overtime/OvertimePage';
import OvertimeCapturePage from './pages/overtime/OvertimeCapturePage';
import OvertimeApprovalDashboard from './pages/overtime/OvertimeApprovalDashboard';
import ClockInDashboard from './pages/attendance/ClockInDashboard';
import HolidayPlannerPage from './pages/leave/HolidayPlannerPage';
import EmployeeHolidayDashboard from './pages/leave/EmployeeHolidayDashboard';
import ManagerCapacityView from './pages/leave/ManagerCapacityView';
import HRPolicyStudio from './pages/leave/HRPolicyStudio';
import SicknessDashboard from './pages/absence/SicknessDashboard';
import HealthSafetyDashboard from './pages/health-safety/HealthSafetyDashboard';
import RiskAssessmentsPage from './pages/health-safety/RiskAssessmentsPage';
import IncidentReportingPage from './pages/health-safety/IncidentReportingPage';
import HazardousSubstancesPage from './pages/health-safety/HazardousSubstancesPage';

// Sign Module
import SignLayout from './components/sign/SignLayout';
import SignHomePage from './pages/sign/SignHomePage';
import SendForSignaturesPage from './pages/sign/SendForSignaturesPage';
import SignYourselfPage from './pages/sign/SignYourselfPage';
import DocumentsPage from './pages/sign/DocumentsPage';
import TemplatesPage from './pages/sign/TemplatesPage';
import SignFormsPage from './pages/sign/SignFormsPage';
import SignReportsPage from './pages/sign/ReportsPage';
import SignProfilePage from './pages/sign/ProfilePage';
import MethodStatementsPage from './pages/health-safety/MethodStatementsPage';
import ResponsibilitiesPage from './pages/health-safety/ResponsibilitiesPage';
import ComplianceDashboardPage from './pages/health-safety/ComplianceDashboardPage';
import TrainingManagementPage from './pages/health-safety/TrainingManagementPage';
import DSEAssessmentPage from './pages/health-safety/DSEAssessmentPage';
import PPEManagementPage from './pages/health-safety/PPEManagementPage';
import EmploymentLawServicesPage from './pages/legal/EmploymentLawServicesPage';
import DocumentLibraryPage from './pages/legal/DocumentLibraryPage';
import HRInsurancePage from './pages/legal/HRInsurancePage';
import EmploymentLawDashboardPage from './pages/legal/EmploymentLawDashboardPage';
import EqualityCompliancePage from './pages/legal/EqualityCompliancePage';
import WorkingTimeCompliancePage from './pages/legal/WorkingTimeCompliancePage';
import RedundancyProcessPage from './pages/legal/RedundancyProcessPage';
import MinimumWageCompliancePage from './pages/legal/MinimumWageCompliancePage';
import WhistleblowingPage from './pages/legal/WhistleblowingPage';
import FamilyLeavePage from './pages/legal/FamilyLeavePage';

// Enterprise Modules (NEW)
import AIGovernanceDashboard from './pages/ai-governance/AIGovernanceDashboard';
import CasesPage from './pages/hrsd/CasesPage';
import ISO30414Dashboard from './pages/iso30414/ISO30414Dashboard';
import PositionsPage from './pages/positions/PositionsPage';
import SkillsPage from './pages/skills/SkillsPage';
import CompensationPage from './pages/compensation/CompensationPage';
import ContractorsPage from './pages/contractors/ContractorsPage';
import ContractorDetailPage from './pages/contractors/ContractorDetailPage';
import SurveysPage from './pages/surveys/SurveysPage';
import SurveyBuilderPage from './pages/surveys/SurveyBuilderPage';
import SurveyResultsPage from './pages/surveys/SurveyResultsPage';
import IntegrationsPage from './pages/integrations/IntegrationsPage';
import OrgChartPage from './pages/organization/OrgChartPage';
import ComplianceOverviewPage from './pages/compliance/ComplianceDashboardPage';
import DocumentsLibraryPage from './pages/documents/DocumentsLibraryPage';
import NotificationsCenterPage from './pages/notifications/NotificationsCenterPage';
import IAMOverviewPage from './pages/iam/IAMOverviewPage';
import RolesManagementPage from './pages/iam/RolesManagementPage';
import UserRolesPage from './pages/iam/UserRolesPage';
import PermissionsMatrixPage from './pages/iam/PermissionsMatrixPage';
import SecurityGroupsPage from './pages/iam/SecurityGroupsPage';
import RoleAnalyticsDashboard from './pages/iam/RoleAnalyticsDashboard';
import DelegationManagementPage from './pages/iam/DelegationManagementPage';
import SoDViolationsPage from './pages/iam/SoDViolationsPage';
import AuditLogViewerPage from './pages/iam/AuditLogViewerPage';
import PolicySimulatorPage from './pages/iam/PolicySimulatorPage';
import IamUsersPage from './pages/iam/IamUsersPage';

// Contract Management Pages
import ContractsDashboard from './pages/contracts/ContractsDashboard';
import ContractDetailPage from './pages/contracts/ContractDetailPage';
import CreateContractPage from './pages/contracts/CreateContractPage';
import RenewalsRadar from './pages/contracts/RenewalsRadar';
import ObligationsBoard from './pages/contracts/ObligationsBoard';

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated } = useAuthStore();
  return isAuthenticated ? <>{children}</> : <Navigate to="/login" replace />;
}

function App() {
  return (
    <>
      <BrowserRouter>
        <Routes>
          {/* Auth Routes */}
          <Route element={<AuthLayout />}>
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />
          </Route>

          {/* Dashboard Routes */}
          <Route
            element={
              <ProtectedRoute>
                <DashboardLayout />
              </ProtectedRoute>
            }
          >
            <Route path="/" element={<DashboardPage />} />
            <Route path="/employees" element={<EmployeesPage />} />
            <Route path="/employees/:id" element={<EmployeeDetailsPage />} />
            <Route path="/payroll" element={<EnhancedPayrollDashboard />} />
            <Route path="/payroll/dashboard" element={<EmployeePayrollDashboard />} />
            <Route path="/payroll/payslips" element={<EmployeePayslipsPage />} />
            <Route path="/payroll/run" element={<PayrollRunWizard />} />
            <Route path="/payroll/contractors" element={<ContractorPayments />} />
            <Route path="/payroll/analytics" element={<PayrollAnalyticsDashboard />} />
            <Route path="/payroll/tax-compliance" element={<TaxComplianceDashboard />} />
            <Route path="/payroll/multi-currency" element={<MultiCurrencyPayments />} />
            <Route path="/payroll/ai-forecasting" element={<AIForecastingDashboard />} />
            <Route path="/payroll/anomaly-detection" element={<AnomalyDetectionDashboard />} />
            <Route path="/payroll/bonus-commission" element={<BonusCommissionManager />} />
            <Route path="/payroll/thirteenth-month" element={<ThirteenthMonthCalculator />} />
            <Route path="/payroll/audit-reports" element={<AuditReportDashboard />} />
            <Route path="/payroll/payslips" element={<PayslipsPage />} />
            <Route path="/payroll/payslips/:id" element={<PayslipDetailPage />} />
            <Route path="/payroll/admin/payslips" element={<PayslipManagementPage />} />
            <Route path="/payroll/codes-catalog" element={<CodesCatalogPage />} />
            <Route path="/leave" element={<LeavePage />} />
            <Route path="/attendance" element={<AttendancePage />} />
            <Route path="/reports" element={<ReportsPage />} />
            <Route path="/settings" element={<SettingsPage />} />
            <Route path="/onboarding" element={<OnboardingPage />} />
            <Route path="/benefits" element={<BenefitsPage />} />
            <Route path="/time-tracking" element={<TimeTrackingPage />} />
            <Route path="/expenses" element={<ExpensesPage />} /> {/* This now redirects to ExpensesDashboard */}
            <Route path="/expenses/submit" element={<SubmitExpensePage />} />
            <Route path="/expenses/approvals" element={<ApprovalsPage />} />
            <Route path="/expenses/analytics" element={<ExpenseAnalyticsPage />} />
            <Route path="/expenses/budget-health" element={<BudgetHealthPage />} />
            <Route path="/expenses/workflows" element={<WorkflowManagementPage />} />
            <Route path="/expenses/trips" element={<TripsPage />} />
            <Route path="/expenses/mileage" element={<MileagePage />} />
            <Route path="/expenses/settings" element={<ExpenseSettingsPage />} />
            <Route path="/expenses/:id" element={<ExpenseDetailsPage />} />
          </Route>

          {/* Expenses Admin Routes */}
          <Route
            path="/expenses/admin"
            element={
              <ProtectedRoute>
                <ExpensesAdminLayout />
              </ProtectedRoute>
            }
          >
            <Route index element={<ExpensesAdminDashboard />} />
            <Route path="getting-started" element={<ExpensesAdminGettingStarted />} />
            <Route path="trips" element={<ExpensesAdminTrips />} />
            <Route path="reports" element={<ExpensesAdminReports />} />
            <Route path="advances" element={<ExpensesAdminAdvances />} />
            <Route path="batch-payments" element={<ExpensesAdminBatchPayments />} />
            <Route path="corporate-cards" element={<ExpensesAdminCorporateCards />} />
            <Route path="budgets" element={<ExpensesAdminBudgets />} />
            <Route path="analytics" element={<ExpensesAdminAnalytics />} />
            <Route path="settings" element={<ExpensesAdminSettings />} />
          </Route>

          {/* Continue with other routes */}
          <Route
            element={
              <ProtectedRoute>
                <DashboardLayout />
              </ProtectedRoute>
            }
          >
            <Route path="/recruitment" element={<RecruitmentPage />} />
            <Route path="/learning" element={<LearningPage />} />
            <Route path="/learning/my-learning" element={<MyLearningDashboard />} />
            <Route path="/learning/mandatory-training" element={<UKMandatoryTrainingPage />} />
            <Route path="/learning/compliance" element={<LearningComplianceDashboard />} />
            <Route path="/learning/course/:enrollmentId" element={<CoursePlayerPage />} />
            <Route path="/performance" element={<PerformancePage />} />
            <Route path="/performance/objectives" element={<ObjectivesPage />} />
            <Route path="/performance/one-on-ones" element={<OneOnOnesPage />} />
            <Route path="/performance/wellbeing" element={<WellbeingPage />} />
            <Route path="/performance/feedback" element={<FeedbackPage />} />
            <Route path="/performance/recognition" element={<PerformanceRecognitionPage />} />
            <Route path="/performance/actions" element={<ActionsPage />} />
            <Route path="/performance/reviews" element={<ReviewCyclesPage />} />
            <Route path="/performance/reviews/:id" element={<ReviewCycleDetailPage />} />
            <Route path="/performance/reviews/:id/submit" element={<ReviewFormPage />} />
            <Route path="/performance/reviews/:id/calibration" element={<CalibrationPage />} />
            <Route path="/performance/reviews/:id/results/:employeeId" element={<ReviewResultsPage />} />
            <Route path="/analytics" element={<AnalyticsPage />} />
            <Route path="/calendar" element={<CalendarPage />} />
            <Route path="/profile/me" element={<PersonalSummaryPage />} />
            <Route path="/profile/details" element={<PersonalDetailsPage />} />
            <Route path="/tasks" element={<TaskCentrePage />} />
            <Route path="/absence" element={<AbsenceRequestsPage />} />
            <Route path="/absence/sickness" element={<SicknessDashboard />} />
            <Route path="/shifts" element={<ShiftsRotasPage />} />
            <Route path="/recognition" element={<RecognitionPage />} />
            <Route path="/offboarding" element={<OffboardingPage />} />
            <Route path="/offboarding/dashboard" element={<OffboardingDashboard />} />
            <Route path="/offboarding/create" element={<CreateSeparationCasePage />} />
            <Route path="/onboarding/dashboard" element={<OnboardingDashboard />} />
            <Route path="/onboarding/create" element={<CreateOnboardingCasePage />} />
            <Route path="/recruitment/dashboard" element={<RecruitmentDashboard />} />
            <Route path="/recruitment/requisitions/new" element={<CreateRequisitionPage />} />
            <Route path="/recruitment/jobs/new" element={<CreateJobPage />} />
            <Route path="/overtime" element={<OvertimePage />} />
            <Route path="/overtime/capture" element={<OvertimeCapturePage />} />
            <Route path="/overtime/approvals" element={<OvertimeApprovalDashboard />} />
            <Route path="/attendance/clock-in" element={<ClockInDashboard />} />
            <Route path="/leave/holiday-planner" element={<HolidayPlannerPage />} />
            <Route path="/leave/my-holidays" element={<EmployeeHolidayDashboard />} />
            <Route path="/leave/team-capacity" element={<ManagerCapacityView />} />
            <Route path="/leave/policy-studio" element={<HRPolicyStudio />} />
            <Route path="/health-safety" element={<HealthSafetyDashboard />} />
            <Route path="/health-safety/risk-assessments" element={<RiskAssessmentsPage />} />
            <Route path="/health-safety/incidents" element={<IncidentReportingPage />} />
            <Route path="/health-safety/hazardous-substances" element={<HazardousSubstancesPage />} />
            <Route path="/health-safety/method-statements" element={<MethodStatementsPage />} />
            <Route path="/health-safety/responsibilities" element={<ResponsibilitiesPage />} />
            <Route path="/health-safety/compliance-dashboard" element={<ComplianceDashboardPage />} />
            <Route path="/health-safety/training" element={<TrainingManagementPage />} />
            <Route path="/health-safety/dse" element={<DSEAssessmentPage />} />
            <Route path="/health-safety/ppe" element={<PPEManagementPage />} />
            <Route path="/legal/employment-law" element={<EmploymentLawServicesPage />} />
            <Route path="/legal/documents" element={<DocumentLibraryPage />} />
            <Route path="/legal/insurance" element={<HRInsurancePage />} />
            <Route path="/legal/employment-law-dashboard" element={<EmploymentLawDashboardPage />} />
            <Route path="/legal/equality-compliance" element={<EqualityCompliancePage />} />
            <Route path="/legal/working-time" element={<WorkingTimeCompliancePage />} />
            <Route path="/legal/redundancy" element={<RedundancyProcessPage />} />
            <Route path="/legal/minimum-wage" element={<MinimumWageCompliancePage />} />
            <Route path="/legal/whistleblowing" element={<WhistleblowingPage />} />
            <Route path="/legal/family-leave" element={<FamilyLeavePage />} />
            
            {/* Enterprise Module Routes (NEW) */}
            <Route path="/ai-governance" element={<AIGovernanceDashboard />} />
            <Route path="/cases" element={<CasesPage />} />
            <Route path="/analytics/iso30414" element={<ISO30414Dashboard />} />
            <Route path="/positions" element={<PositionsPage />} />
            <Route path="/skills" element={<SkillsPage />} />
            <Route path="/compensation" element={<CompensationPage />} />
            
            {/* Contractors Module Routes (NEW) */}
            <Route path="/contractors" element={<ContractorsPage />} />
            <Route path="/contractors/:id" element={<ContractorDetailPage />} />
            
            {/* Surveys Module Routes (NEW) */}
            <Route path="/surveys" element={<SurveysPage />} />
            <Route path="/surveys/builder/:id" element={<SurveyBuilderPage />} />
            <Route path="/surveys/:id/results" element={<SurveyResultsPage />} />
            
            {/* Admin Pages (NEW) */}
            <Route path="/integrations" element={<IntegrationsPage />} />
            <Route path="/organization/chart" element={<OrgChartPage />} />
            <Route path="/compliance/overview" element={<ComplianceOverviewPage />} />
            <Route path="/documents" element={<DocumentsLibraryPage />} />
            <Route path="/notifications" element={<NotificationsCenterPage />} />
            
            {/* IAM Module Routes (NEW) */}
            <Route path="/iam" element={<IAMOverviewPage />} />
            <Route path="/iam/roles" element={<RolesManagementPage />} />
            <Route path="/iam/user-roles" element={<UserRolesPage />} />
            <Route path="/iam/permissions" element={<PermissionsMatrixPage />} />
            <Route path="/iam/security-groups" element={<SecurityGroupsPage />} />
            <Route path="/iam/users" element={<IamUsersPage />} />
            <Route path="/iam/analytics" element={<RoleAnalyticsDashboard />} />
            <Route path="/iam/delegations" element={<DelegationManagementPage />} />
            <Route path="/iam/sod-violations" element={<SoDViolationsPage />} />
            <Route path="/iam/audit-logs" element={<AuditLogViewerPage />} />
            <Route path="/iam/policy-simulator" element={<PolicySimulatorPage />} />

            {/* Contract Management Module Routes (NEW) */}
            <Route path="/contracts" element={<ContractsDashboard />} />
            <Route path="/contracts/create" element={<CreateContractPage />} />
            <Route path="/contracts/:id" element={<ContractDetailPage />} />
            <Route path="/contracts/renewals" element={<RenewalsRadar />} />
            <Route path="/contracts/obligations" element={<ObligationsBoard />} />
          </Route>

          {/* Sign Module Routes */}
          <Route
            path="/sign"
            element={
              <ProtectedRoute>
                <SignLayout />
              </ProtectedRoute>
            }
          >
            <Route index element={<SignHomePage />} />
            <Route path="send-for-signatures" element={<SendForSignaturesPage />} />
            <Route path="sign-yourself" element={<SignYourselfPage />} />
            <Route path="documents" element={<DocumentsPage />} />
            <Route path="templates" element={<TemplatesPage />} />
            <Route path="sign-forms" element={<SignFormsPage />} />
            <Route path="reports" element={<SignReportsPage />} />
            <Route path="settings" element={<SignProfilePage />} />
          </Route>

          {/* Fallback */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
      <Toaster position="top-right" richColors />
      <HotToast position="top-right" />
    </>
  );
}

export default App;
