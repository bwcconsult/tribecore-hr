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
import LeavePage from './pages/leave/LeavePage';
import AttendancePage from './pages/attendance/AttendancePage';
import PerformancePage from './pages/performance/PerformancePage';
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
import RecruitmentPage from './pages/recruitment/RecruitmentPage';
import LearningPage from './pages/learning/LearningPage';
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
import OvertimePage from './pages/overtime/OvertimePage';
import ClockInDashboard from './pages/attendance/ClockInDashboard';
import HolidayPlannerPage from './pages/leave/HolidayPlannerPage';
import SicknessDashboard from './pages/absence/SicknessDashboard';
import HealthSafetyDashboard from './pages/health-safety/HealthSafetyDashboard';
import RiskAssessmentsPage from './pages/health-safety/RiskAssessmentsPage';
import IncidentReportingPage from './pages/health-safety/IncidentReportingPage';
import HazardousSubstancesPage from './pages/health-safety/HazardousSubstancesPage';
import MethodStatementsPage from './pages/health-safety/MethodStatementsPage';
import ResponsibilitiesPage from './pages/health-safety/ResponsibilitiesPage';

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
            <Route path="/expenses/:id" element={<ExpenseDetailsPage />} />
            <Route path="/recruitment" element={<RecruitmentPage />} />
            <Route path="/learning" element={<LearningPage />} />
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
            <Route path="/overtime" element={<OvertimePage />} />
            <Route path="/attendance/clock-in" element={<ClockInDashboard />} />
            <Route path="/leave/holiday-planner" element={<HolidayPlannerPage />} />
            <Route path="/health-safety" element={<HealthSafetyDashboard />} />
            <Route path="/health-safety/risk-assessments" element={<RiskAssessmentsPage />} />
            <Route path="/health-safety/incidents" element={<IncidentReportingPage />} />
            <Route path="/health-safety/hazardous-substances" element={<HazardousSubstancesPage />} />
            <Route path="/health-safety/method-statements" element={<MethodStatementsPage />} />
            <Route path="/health-safety/responsibilities" element={<ResponsibilitiesPage />} />
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
