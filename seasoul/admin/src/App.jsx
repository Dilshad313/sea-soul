import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from './context/AuthContext';
import PrivateRoute from './components/Common/PrivateRoute';
import Login from './components/Common/Login';
import Layout from './components/Layout/Layout';
import Dashboard from './components/Dashboard/Dashboard';
import PackagesList from './components/Packages/PackagesList';
import PackageForm from './components/Packages/PackageForm';
// ✅ Activity imports removed
import BookingsList from './components/Bookings/BookingsList';
import PaymentsList from './components/Payments/PaymentsList';
import UsersList from './components/Users/UsersList';
import AdminProfile from './components/AdminProfile/AdminProfile';

function App() {
  return (
    <AuthProvider>
      <Router>
        <Toaster
          position="top-right"
          toastOptions={{
            duration: 4000,
            style: {
              background: '#FFFFFF',
              color: '#1A2B49',
              borderRadius: '12px',
              padding: '16px',
              boxShadow: '0 10px 40px rgba(0,0,0,0.1)',
              maxWidth: '90vw',
            },
            success: {
              icon: '✅',
              style: {
                border: '1px solid #00E5FF',
              },
            },
            error: {
              icon: '❌',
              style: {
                border: '1px solid #FF6B6B',
              },
            },
          }}
        />
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route element={<PrivateRoute />}>
            <Route element={<Layout />}>
              <Route path="/" element={<Navigate to="/dashboard" replace />} />
              <Route path="/dashboard" element={<Dashboard />} />
              {/* ✅ Only Packages - Activities removed */}
              <Route path="/packages" element={<PackagesList />} />
              <Route path="/packages/add" element={<PackageForm />} />
              <Route path="/packages/edit/:id" element={<PackageForm />} />
              <Route path="/bookings" element={<BookingsList />} />
              <Route path="/payments" element={<PaymentsList />} />
              <Route path="/users" element={<UsersList />} />
              <Route path="/admin-profile" element={<AdminProfile />} />
            </Route>
          </Route>
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;