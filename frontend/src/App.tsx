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
            <Route path="/payroll" element={<PayrollPage />} />
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
