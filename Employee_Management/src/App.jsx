import { Routes, Route, Navigate } from 'react-router-dom'
import { useAuth } from './context/AuthContext.jsx'
import Landing from './Pages/Landing'
import AppLayout from './components/Layout/AppLayout.jsx'
import Dashboard from './Pages/Dashboard.jsx'
import EmployeeList from './Pages/Employees/EmployeeList.jsx'
import EmployeeProfile from './Pages/Employees/EmployeeProfile.jsx'
import CatchRecording from './Pages/CatchRecording.jsx'
import FishPricing from './Pages/FishPricing.jsx'
import ExpenseRecording from './Pages/ExpenseRecording.jsx'
import SellerInvoice from './Pages/Invoices/SellerInvoice.jsx'
import DailyInvoice from './Pages/Invoices/DailyInvoice.jsx'
import WeeklySettlement from './Pages/Invoices/WeeklySettlement.jsx'
import Settings from './Pages/Settings.jsx'

function ProtectedRoute({ children }) {
  const { isAuthenticated } = useAuth();
  if (!isAuthenticated) return <Navigate to="/" replace />;
  return children;
}

function App() {
  const { login } = useAuth();

  return (
    <Routes>
      {/* Public: Login */}
      <Route path="/" element={<Landing onLoginSuccess={login} />} />

      {/* Protected: App Shell */}
      <Route
        element={
          <ProtectedRoute>
            <AppLayout />
          </ProtectedRoute>
        }
      >
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/employees" element={<EmployeeList />} />
        <Route path="/employees/:id" element={<EmployeeProfile />} />
        <Route path="/catch" element={<CatchRecording />} />
        <Route path="/pricing" element={<FishPricing />} />
        <Route path="/expenses" element={<ExpenseRecording />} />
        <Route path="/invoices/seller" element={<SellerInvoice />} />
        <Route path="/invoices/daily" element={<DailyInvoice />} />
        <Route path="/invoices/weekly" element={<WeeklySettlement />} />
        <Route path="/settings" element={<Settings />} />
      </Route>

      {/* Fallback */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default App
