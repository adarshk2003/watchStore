import { lazy, Suspense } from 'react';
import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';
import LoadingWrapper from './components/GraphicComponent/loadingWrapper';
import ProtectedRoute from './components/SecurityComponent/ProtectedRoute';

const Home = lazy(() => import('./components/homeComponent/Home'));
const NavAdmin = lazy(() => import('./components/adminComponent/AdminNav'));
const AddProduct = lazy(() => import('./components/sellerComponent/AddProduct'));
const LoginForm = lazy(() => import('./components/ValidationComponent/Login'));
const ForgotPassword = lazy(() => import('./components/ValidationComponent/ForgotPassword'));
const SignUp = lazy(() => import('./components/ValidationComponent/Signup'));
const Profile = lazy(() => import('./components/homeComponent/yourProfile'));
const Settings = lazy(() => import('./components/homeComponent/Settings'));
const MyProducts = lazy(() => import('./components/sellerComponent/Myproduct'));
const Cart = lazy(() => import('./components/homeComponent/Cart'));
const ProductPage = lazy(() => import('./components/homeComponent/SingleProduct'));
const Seller = lazy(() => import('./components/sellerComponent/Seller'));
const Wishlist = lazy(() => import('./components/homeComponent/wishlist'));
const Allusers = lazy(() => import('./components/adminComponent/Alluser'));
const AllOrders = lazy(() => import('./components/adminComponent/AllOrders'));
const SingleUser = lazy(() => import('./components/adminComponent/Singleuser'));
const WarningBlocked = lazy(() => import('./components/SecurityComponent/Usersblock'));
const CookiePolicy = lazy(() => import('./components/SecurityComponent/cookie'));
const PrivacyPolicy = lazy(() => import('./components/SecurityComponent/privicyPolicy'));
const TermsPolicy = lazy(() => import('./components/SecurityComponent/Terms'));
const ContactSupport = lazy(() => import('./components/SecurityComponent/Support'));
const OrderActivity = lazy(() => import('./components/SecurityComponent/Notification'));
const Checkout = lazy(() => import('./components/homeComponent/orderdetails'));
const OrderDetailPage = lazy(() => import('./components/homeComponent/myOrders'));
const DashboardAdmin = lazy(() => import('./components/adminComponent/Dashbord'));
const DashboardSeller = lazy(() => import('./components/sellerComponent/exploreDetails'));
const SingleProductSeller = lazy(() => import('./components/sellerComponent/singleProductSeller'));
const NavBar = lazy(() => import('./components/homeComponent/Nav'));
const Shop = lazy(() => import('./components/homeComponent/Shop'));
const UpdateProductForm = lazy(() => import('./components/sellerComponent/updateProduct'));
const OrderConfirmation = lazy(() => import('./components/homeComponent/conformed'));
const BrandProducts = lazy(() => import('./components/homeComponent/Brandoroducts'));

function App() {
  // Role‑based fallback component for unknown routes
  const RoleRedirect = () => {
    const role = localStorage.getItem('role') || localStorage.getItem('userType');
    if (role === 'admin') return <Navigate to="/admin-home" replace />;
    if (role === 'seller') return <Navigate to="/seller-home" replace />;
    return <Navigate to="/home" replace />;
  };

  return (
    <>
      <Router>
        <Suspense fallback={<div className="flex min-h-screen items-center justify-center font-sans text-stone-600" role="status">Loading page...</div>}>
          <Routes>
            {/* Public routes */}
            <Route path="/login" element={<LoadingWrapper><LoginForm /></LoadingWrapper>} />
            <Route path="/signup" element={<LoadingWrapper><SignUp /></LoadingWrapper>} />
            <Route path="/forgot-password" element={<LoadingWrapper><ForgotPassword /></LoadingWrapper>} />
            <Route path="/cookies" element={<CookiePolicy />} />
            <Route path="/privacy" element={<PrivacyPolicy />} />
            <Route path="/terms" element={<TermsPolicy />} />
            <Route path="/blockeduser" element={<WarningBlocked />} />
            <Route path="/shop" element={<LoadingWrapper><Shop /></LoadingWrapper>} />
            <Route path="/home" element={<LoadingWrapper><Home /></LoadingWrapper>} />
            <Route path="/product/:id" element={<LoadingWrapper><ProductPage /></LoadingWrapper>} />
            <Route path="/category/:brandName" element={<BrandProducts />} />
            <Route path="/navuser" element={<NavBar />} />

            {/* Buyer Protected routes */}
            <Route path="/cart" element={<ProtectedRoute allowedRoles={['buyer', 'admin', 'seller']}><LoadingWrapper><Cart /></LoadingWrapper></ProtectedRoute>} />
            <Route path="/wishlist" element={<ProtectedRoute allowedRoles={['buyer', 'admin', 'seller']}><LoadingWrapper><Wishlist /></LoadingWrapper></ProtectedRoute>} />
            <Route path="/profile" element={<ProtectedRoute allowedRoles={['buyer', 'admin', 'seller']}><LoadingWrapper><Profile /></LoadingWrapper></ProtectedRoute>} />
            <Route path="/settings" element={<ProtectedRoute allowedRoles={['buyer', 'admin', 'seller']}><LoadingWrapper><Settings /></LoadingWrapper></ProtectedRoute>} />
            <Route path="/support" element={<ProtectedRoute allowedRoles={['buyer', 'admin', 'seller']}><LoadingWrapper><ContactSupport /></LoadingWrapper></ProtectedRoute>} />
            <Route path="/notifications" element={<ProtectedRoute allowedRoles={['buyer', 'admin', 'seller']}><LoadingWrapper><OrderActivity /></LoadingWrapper></ProtectedRoute>} />
            <Route path="/Checkout/:id" element={<ProtectedRoute allowedRoles={['buyer']}><LoadingWrapper><Checkout /></LoadingWrapper></ProtectedRoute>} />
            <Route path="/Checkout" element={<ProtectedRoute allowedRoles={['buyer']}><LoadingWrapper><Checkout /></LoadingWrapper></ProtectedRoute>} />
            <Route path="/orders" element={<ProtectedRoute allowedRoles={['buyer', 'admin']}><LoadingWrapper><OrderDetailPage /></LoadingWrapper></ProtectedRoute>} />
            <Route path="/conformed" element={<OrderConfirmation />} />
            <Route path="/confirmed" element={<OrderConfirmation />} />

            {/* Seller Protected routes */}
            <Route path="/seller-home" element={<ProtectedRoute allowedRoles={['seller', 'admin']}><LoadingWrapper><Seller /></LoadingWrapper></ProtectedRoute>} />
            <Route path="/dashboard-seller" element={<ProtectedRoute allowedRoles={['seller', 'admin']}><LoadingWrapper><DashboardSeller /></LoadingWrapper></ProtectedRoute>} />
            <Route path="/addproduct" element={<ProtectedRoute allowedRoles={['seller', 'admin']}><LoadingWrapper><AddProduct /></LoadingWrapper></ProtectedRoute>} />
            <Route path="/myproducts" element={<ProtectedRoute allowedRoles={['seller', 'admin']}><LoadingWrapper><MyProducts /></LoadingWrapper></ProtectedRoute>} />
            <Route path="/products/:id" element={<ProtectedRoute allowedRoles={['seller', 'admin']}><LoadingWrapper><SingleProductSeller /></LoadingWrapper></ProtectedRoute>} />
            <Route path="/edit-product/:productId" element={<ProtectedRoute allowedRoles={['seller', 'admin']}><LoadingWrapper><UpdateProductForm /></LoadingWrapper></ProtectedRoute>} />

            {/* Admin Protected routes */}
            <Route path="/admin-home" element={<ProtectedRoute allowedRoles={['admin']}><LoadingWrapper><DashboardAdmin /></LoadingWrapper></ProtectedRoute>} />
            <Route path="/alluser" element={<ProtectedRoute allowedRoles={['admin']}><LoadingWrapper><Allusers /></LoadingWrapper></ProtectedRoute>} />
            <Route path="/admin-orders" element={<ProtectedRoute allowedRoles={['admin']}><LoadingWrapper><AllOrders /></LoadingWrapper></ProtectedRoute>} />
            <Route path="/user/:id" element={<ProtectedRoute allowedRoles={['admin']}><LoadingWrapper><SingleUser /></LoadingWrapper></ProtectedRoute>} />
            <Route path="/adminav" element={<ProtectedRoute allowedRoles={['admin']}><LoadingWrapper><NavAdmin /></LoadingWrapper></ProtectedRoute>} />

            {/* Default root */}
            <Route path="/" element={<Navigate to="/login" replace />} />
            <Route path="*" element={<RoleRedirect />} />
          </Routes>
        </Suspense>
      </Router>
    </>
  );
}

export default App;
