import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import PrivateRoute from './components/Common/PrivateRoute';
import Login from './components/Common/Login';
import Layout from './components/Layout/Layout';
import Dashboard from './components/Dashboard/Dashboard';
import ProductsList from './components/Products/ProductsList';
import ProductForm from './components/Products/ProductForm';
import ActivitiesList from './components/Activities/ActivitiesList';
import ActivityForm from './components/Activities/ActivityForm';
import BookingsList from './components/Bookings/BookingsList';
import PaymentsList from './components/Payments/PaymentsList';
import UsersList from './components/Users/UsersList';

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route element={<PrivateRoute />}>
            <Route element={<Layout />}>
              <Route path="/" element={<Navigate to="/dashboard" replace />} />
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/products" element={<ProductsList />} />
              <Route path="/products/add" element={<ProductForm />} />
              <Route path="/products/edit/:id" element={<ProductForm />} />
              <Route path="/activities" element={<ActivitiesList />} />
              <Route path="/activities/add" element={<ActivityForm />} />
              <Route path="/activities/edit/:id" element={<ActivityForm />} />
              <Route path="/bookings" element={<BookingsList />} />
              <Route path="/payments" element={<PaymentsList />} />
              <Route path="/users" element={<UsersList />} />
            </Route>
          </Route>
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;