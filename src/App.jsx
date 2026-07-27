import { Route, Routes, Navigate } from "react-router-dom";
import { useEffect } from "react";
import ErrorBoundary from "./components/ErrorBoundary";
import NavBar from "./components/NavBar/NavBar";
import Footer from "./components/Footer/Footer";

import Login from "./pages/Login/Login";
import CreateAccount from "./pages/Register/CreateAccount";

import Home from "./pages/Home/Home";
import Contact from "./pages/Contact/Contact";
import Cart from "./pages/Cart/CartPage";
import Shop from "./pages/Shop/Shop";
import ProductPage from "./pages/Product/ProductPage";
import CheckoutPage from "./pages/Checkout/CheckoutPage";
import OrdersPage from "./pages/Orders/OrdersPage";
import AddPrescription from "./pages/Prescriptions/AddPrescription";
import Consult from "./pages/Consult/Consult";
import FAQs from "./pages/FAQs/FAQs";
import Help from "./pages/Help/Help";
import Account from "./pages/Account/Account";
import Services from "./pages/Services/Services";
import AboutPharmacy from "./pages/AboutPharmacy/AboutPharmacy";

// Admin imports
import AdminLayout from "./pages/Admin/AdminLayout";
import AdminDashboard from "./pages/Admin/Dashboard";
import AdminProducts from "./pages/Admin/Products";
import AdminOrders from "./pages/Admin/Orders";
import AdminPrescriptions from "./pages/Admin/Prescriptions";
import AdminUsers from "./pages/Admin/Users";
import AdminCoupons from "./pages/Admin/Coupons";
import AdminReports from "./pages/Admin/ReportAnalytics";
import AdminSettings from "./pages/Admin/Settings";
import AdminRoute from "./components/AdminRoute";

import ForgotPassword from "./pages/ForgotPassword/ForgotPassword";
import { useAuth } from "./context/AuthContext";
import { LoadingSpinner } from "./components/LoadingSpinner";
import { supabase } from "./lib/supabase";

// Protected Route Component
const ProtectedRoute = ({ children }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return <LoadingSpinner />;
  }

  if (!user) {
    return <Navigate to="/auth/login" replace />;
  }

  return children;
};

// Main App Routes
function App() {
  const { user, loading } = useAuth();

  // Test Supabase connection on startup
  useEffect(() => {
    const checkConnection = async () => {
      try {
        const { error } = await supabase.from('orders').select('count', { count: 'exact', head: true });
        if (error) {
          console.warn('⚠️ Supabase connection warning:', error.message);
        } else {
          console.log('✅ Supabase connected successfully');
        }
      } catch (err) {
        console.warn('⚠️ Supabase connection error:', err.message);
      }
    };
    
    // Only run in development
    if (import.meta.env.DEV) {
      checkConnection();
    }
  }, []);

  if (loading) {
    return <LoadingSpinner />;
  }

  return (
    <ErrorBoundary>
      <Routes>
        {/* AUTH ROUTES (full-screen, no NavBar/Footer) */}
        <Route 
          path="/auth/login" 
          element={user ? <Navigate to="/" replace /> : <Login />} 
        />
        <Route 
          path="/auth/register" 
          element={user ? <Navigate to="/" replace /> : <CreateAccount />} 
        />
        <Route 
          path="/auth/reset-password" 
          element={<ForgotPassword />} 
        />

        {/* PUBLIC ROUTES (with NavBar & Footer) */}
        <Route path="/" element={<><NavBar /><Home /><Footer /></>} />
        <Route path="/shop" element={<><NavBar /><Shop /><Footer /></>} />
        <Route path="/product/:id" element={<><NavBar /><ProductPage /><Footer /></>} />
        <Route path="/contact-us" element={<><NavBar /><Contact /><Footer /></>} />
        <Route path="/faqs" element={<><NavBar /><FAQs /><Footer /></>} />
        <Route path="/help" element={<><NavBar /><Help /><Footer /></>} />
        <Route path="/services" element={<><NavBar /><Services /><Footer /></>} />
        <Route path="/about" element={<><NavBar /><AboutPharmacy /><Footer /></>} />
        <Route path="/consult" element={<><NavBar /><Consult /><Footer /></>} />
        <Route path="/prescriptions/add" element={<><NavBar /><AddPrescription /><Footer /></>} />

        {/* PROTECTED ROUTES (with NavBar & Footer) */}
        <Route 
          path="/cart" 
          element={
            <ProtectedRoute>
              <NavBar /><Cart /><Footer />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/checkout" 
          element={
            <ProtectedRoute>
              <NavBar /><CheckoutPage /><Footer />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/orders" 
          element={
            <ProtectedRoute>
              <NavBar /><OrdersPage /><Footer />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/account" 
          element={
            <ProtectedRoute>
              <NavBar /><Account /><Footer />
            </ProtectedRoute>
          } 
        />

        {/* ADMIN ROUTES (protected + role-based) */}
        <Route 
          path="/admin" 
          element={
            <AdminRoute>
              <AdminLayout />
            </AdminRoute>
          }
        >
          <Route index element={<AdminDashboard />} />
          <Route path="products" element={<AdminProducts />} />
          <Route path="orders" element={<AdminOrders />} />
          <Route path="prescriptions" element={<AdminPrescriptions />} />
          <Route path="users" element={<AdminUsers />} />
          <Route path="coupons" element={<AdminCoupons />} />
          <Route path="reports" element={<AdminReports />} />
          <Route path="settings" element={<AdminSettings />} />
        </Route>

        {/* 404 Redirect */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </ErrorBoundary>
  );
}

export default App;
