import React from 'react'
import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom'
import Home from './components/homeComponent/Home';
import NavAdmin from './components/adminComponent/AdminNav';
import AddProduct from './components/sellerComponent/AddProduct';
import LoginForm from './components/ValidationComponent/Login';
import SignUp from './components/ValidationComponent/Signup';
import Profile from './components/homeComponent/yourProfile';
import MyProducts from './components/sellerComponent/Myproduct';
import Cart from './components/homeComponent/Cart';
import ProductPage from './components/homeComponent/SingleProduct';
import { library } from '@fortawesome/fontawesome-svg-core';
import { fas } from '@fortawesome/free-solid-svg-icons';
import Seller from './components/sellerComponent/Seller';
import LoadingWrapper from './components/GraphicComponent/loadingWrapper';
import Wishlist from './components/homeComponent/wishlist';
import Allusers from './components/adminComponent/Alluser';
import SingleUser from './components/adminComponent/Singleuser';
import WarningBlocked from './components/SecurityComponent/Usersblock';
import CookiePolicy from './components/SecurityComponent/cookie';
import ContactSupport from './components/SecurityComponent/Support';
import Checkout from './components/homeComponent/orderdetails';
import OrderDetailPage from './components/homeComponent/myOrders';
import DashboardAdmin from './components/adminComponent/Dashbord';
import DashboardSeller from './components/sellerComponent/exploreDetails';
import SingleProductSeller from './components/sellerComponent/singleProductSeller';
import NavBar from './components/homeComponent/Nav';
import Shop from './components/homeComponent/Shop';
import UpdateProductForm from './components/sellerComponent/updateProduct';
import OrderConfirmation from './components/homeComponent/conformed';
import BrandProducts from './components/homeComponent/Brandoroducts';
library.add(fas);

function App() {
  return (
    <>
      <Router>
        <Routes>
          {/* for testing */}
          <Route path='/navuser' element={<NavBar/>}/>
          <Route path="/login" element={<LoadingWrapper> <LoginForm /> </LoadingWrapper>} />
          <Route path="/shop" element={<LoadingWrapper> <Shop /> </LoadingWrapper>} />
          <Route path="/home" element={<LoadingWrapper> <Home /> </LoadingWrapper>} />
          <Route path='/signup' element={<LoadingWrapper> <SignUp /> </LoadingWrapper>} />
          <Route path='/addproduct' element={<LoadingWrapper> <AddProduct /> </LoadingWrapper>} />
          <Route path='/product/:id' element={<LoadingWrapper><ProductPage /></LoadingWrapper>} />
          <Route path='/products/:id' element={<LoadingWrapper><SingleProductSeller /></LoadingWrapper>} />
          <Route path='/edit-product/:productId' element={<LoadingWrapper><UpdateProductForm /></LoadingWrapper>} />


          <Route path='/seller-home' element={<LoadingWrapper><Seller /></LoadingWrapper>} />
          <Route path='/profile'element={<LoadingWrapper><Profile/></LoadingWrapper>}/>
          <Route path='/myproducts' element={<LoadingWrapper><MyProducts/></LoadingWrapper>}/>
          <Route path='/wishlist' element={<LoadingWrapper> <Wishlist /> </LoadingWrapper>} />
          <Route path='/adminav' element={<NavAdmin/>}/>
          <Route path='/cart' element={<LoadingWrapper> <Cart/></LoadingWrapper>} /> 
          <Route path='/user/:id'element={<LoadingWrapper><SingleUser/></LoadingWrapper>}/>
          <Route path='/alluser' element={<LoadingWrapper><Allusers/></LoadingWrapper>}/>
          <Route path='/blockeduser' element={<WarningBlocked/>}/>
          <Route path='/cookies' element={<CookiePolicy/>}/>
          <Route path='/support' element={<LoadingWrapper><ContactSupport/></LoadingWrapper>}/>
          <Route path='/Checkout/:id' element={<LoadingWrapper><Checkout/></LoadingWrapper>}/>
          <Route path='/Checkout' element={<LoadingWrapper><Checkout/></LoadingWrapper>}/>
          <Route path='/conformed' element={<OrderConfirmation/>}/>
          <Route path="/category/:brandName" element={<BrandProducts />} />
          <Route path='/orders' element={<LoadingWrapper><OrderDetailPage/></LoadingWrapper>}/>
          <Route path='/admin-home' element={<LoadingWrapper><DashboardAdmin/></LoadingWrapper>}/>
          <Route path='/dashboard-seller' element={<LoadingWrapper><DashboardSeller/></LoadingWrapper>}/>
          <Route path="/" element={<Navigate to="/login" />} />
        </Routes>
      </Router>
     
    </>
  )
}

export default App;
