import { useState } from 'react';
import {
  BrowserRouter as Router,
  Routes,
  Route,
  useLocation
} from 'react-router-dom';

import Header from './components/Header';
import ProfileMenu from './components/ProfileMenu';
import Menu from './pages/Menu';
import Info from './pages/Info';
import Login from './pages/Login';
import CategoryPage from './pages/CategoryPage';
import BookingModal from './components/BookingModal';
import Register from './pages/Register';
import PrivacyPolicy from './pages/PrivacyPolicy';
import Profile from './pages/Profile';
import Cart from './pages/Cart';
import ReservationHistory from './pages/ReservationHistory';
import PaymentPage from './pages/PaymentPage';
import OrderDetails from './pages/OrderDetails';
import WaiterOrdersPage from './pages/WaiterOrdersPage';
import CookPage from './pages/CookPage';
import CardPaymentPage from './pages/CardPaymentPage';
import AdminDashboard from './pages/AdminDashboard';
import StaffLoginPage from './pages/StaffLoginPage';
import AdminMenuPage from './pages/AdminMenuPage';
import EditMenuItemPage from './pages/EditMenuItemPage';
import AddMenuItemPage from './pages/AddMenuItemPage';
import AdminCategoriesPage from './pages/AdminCategoryPage';
import AdminReservationsPage from './pages/AdminReservationsPage';
import AdminPaymentsPage from './pages/AdminPaymentsPage';
import AdminStaffPage from './pages/AdminStaffPage';
import AdminRoomManagementPage from './pages/AdminRoomManagementPage';
import PasswordReset from './pages/ResetPassword';
import { isLoggedIn, getUserRole } from './utilis/auth';
import './styles/App.scss';

function getRoundedCurrentTime() {
  const now = new Date();
  now.setSeconds(0, 0);

  const minutes = now.getMinutes();
  const remainder = minutes % 15;

  if (remainder !== 0) {
    now.setMinutes(minutes + (15 - remainder));
  }

  return now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}

function AppContent() {
  const location = useLocation();
  const role = getUserRole(); 
  
  const showHeader =
  location.pathname !== '/login' &&
  location.pathname !== '/register' &&
  location.pathname !== '/staff/waiter' &&
  (role === 'CLIENT' || !role);

  const [profileOpen, setProfileOpen] = useState(false);
  const [bookingOpen, setBookingOpen] = useState(false);

  return (
    <div className="app">
      {showHeader && <Header toggleProfile={() => setProfileOpen(!profileOpen)} />}

      <ProfileMenu
        isOpen={profileOpen}
        onClose={() => setProfileOpen(false)}
        onBookClick={() => {
          console.log('Открытие модалки бронирования');
          setBookingOpen(true);
          setProfileOpen(false);
        }}
      />

      <BookingModal
        isOpen={bookingOpen}
        onClose={() => setBookingOpen(false)}
      />

      <Routes>
        <Route path="/" element={<Menu />} />
        <Route path="/info" element={<Info />} />
        <Route path="/category/:name" element={<CategoryPage />} />
        <Route path="/login" element={<Login />} />
        <Route path='/register' element={<Register/>}/>
        <Route path="/privacy" element={<PrivacyPolicy />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="/cart" element={<Cart />} />
        <Route path="/reservation-history" element={<ReservationHistory />} />
        <Route path="/orders/:orderId" element={<OrderDetails />} />
        <Route path="/payment/:orderId" element={<PaymentPage />} />
        <Route path="/waiter/orders" element={<WaiterOrdersPage />} />
        <Route path="/pay/card/:orderId" element={<CardPaymentPage />} />
        <Route path="/password-reset" element={<PasswordReset />} />


        {/* страницы для работников /admin/categories */}
        <Route path="/staff/login" element={<StaffLoginPage />} />
        <Route path="/staff/waiter" element={<WaiterOrdersPage />} />
        <Route path="/admin" element={<AdminDashboard />} />
        <Route path="/staff/cook" element={<CookPage />} />
        <Route path="/admin/menu" element={<AdminMenuPage />} />
        <Route path="/admin/menu/add" element={<AddMenuItemPage />} />
        <Route path="/admin/menu/edit/:id" element={<EditMenuItemPage />} />
        <Route path="/admin/categories" element={<AdminCategoriesPage />} />
        <Route path="/admin/Reservation" element={<AdminReservationsPage />} />
        <Route path="/admin/payment" element={<AdminPaymentsPage />} />
        <Route path="/admin/Staff" element={<AdminStaffPage />} />
        <Route path="/admin/Room" element={<AdminRoomManagementPage />} />
      </Routes>
    </div>
  );
}

export default function App() {
  return (
    <Router>
      <AppContent />
    </Router>
  );
}
