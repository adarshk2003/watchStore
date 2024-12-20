import React from 'react'
import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom'
import Home from './components/homeComponent/Home';
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
import AdminHome from './components/adminComponent/Admin';
import SellerSignUpForm from './components/ValidationComponent/SellerSignupform';
import LoadingWrapper from './components/GraphicComponent/loadingWrapper';
// import Wishlist from './components/homeComponent/wishlist';
library.add(fas);

function App() {
  return (
    <>
      <Router>
        <Routes>
          <Route path="/login" element={<LoadingWrapper> <LoginForm /> </LoadingWrapper>} />
          <Route path="/home" element={<LoadingWrapper> <Home /> </LoadingWrapper>} />
          <Route path='/signup' element={<LoadingWrapper> <SignUp /> </LoadingWrapper>} />
          <Route path='/addproduct' element={<LoadingWrapper> <AddProduct /> </LoadingWrapper>} />
          <Route path='/seller-signup' element={<LoadingWrapper><SellerSignUpForm /></LoadingWrapper>} />
          <Route path='/admin-home' element={<LoadingWrapper><AdminHome /></LoadingWrapper>} />
          <Route path='/product/:id' element={<LoadingWrapper><ProductPage /></LoadingWrapper>} />
          <Route path='/seller-home' element={<LoadingWrapper><Seller /></LoadingWrapper>} />
          <Route path='/profile'element={<LoadingWrapper><Profile/></LoadingWrapper>}/>
          <Route path='/myproducts' element={<LoadingWrapper><MyProducts/></LoadingWrapper>}/>
          {/* <Route path='/wishlist' element={<LoadingWrapper> <Wishlist /> </LoadingWrapper>} /> */}
          <Route path='/cart' element={<LoadingWrapper> <Cart/></LoadingWrapper>} /> 
          <Route path="/" element={<Navigate to="/login" />} />
        </Routes>
      </Router>
    </>
  )
}

export default App;
