import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './routes/ProtectedRoute';
import Layout from './components/shared/Layout';

// Public Auth Pages
import LoginPage from './features/auth/pages/LoginPage';
import SignupPage from './features/auth/pages/SignupPage';

// Protected Feature Pages
import DashboardPage from './features/dashboard/pages/DashboardPage';
import ExpensesPage from './features/expenses/pages/ExpensesPage';
import BudgetsPage from './features/budgets/pages/BudgetsPage';
import DebtsPage from './features/debts/pages/DebtsPage';
import ReportsPage from './features/reports/pages/ReportsPage';

function App() {
  return (
    <Router>
      <AuthProvider>
        <Routes>
          {/* PUBLIC AUTH ROUTES */}
          <Route path="/login" element={<LoginPage />} />
          <Route path="/signup" element={<SignupPage />} />

          {/* PROTECTED CLIENT APP ROUTES */}
          <Route element={<ProtectedRoute />}>
            <Route element={<Layout />}>
              <Route path="/dashboard" element={<DashboardPage />} />
              <Route path="/expenses" element={<ExpensesPage />} />
              <Route path="/budgets" element={<BudgetsPage />} />
              <Route path="/debts" element={<DebtsPage />} />
              <Route path="/reports" element={<ReportsPage />} />
            </Route>
          </Route>

          {/* WILDCARD REDIRECT FALLBACKS */}
          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Routes>
      </AuthProvider>
    </Router>
  );
}

export default App;
