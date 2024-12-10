import React from 'react'
import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom'
import Home from './components/homeComponent/Home';
import ProductForm from './components/sellerComponent/AddProduct';
import LoginForm from './components/ValidationComponent/Login';
import SignUp from './components/ValidationComponent/Signup';
import ProductPage from './components/homeComponent/SingleProduct';
import { library } from '@fortawesome/fontawesome-svg-core';
import { fas } from '@fortawesome/free-solid-svg-icons';
import CartComponent from './components/homeComponent/Cart';
import SellerSignUpForm from './components/ValidationComponent/SellerSignupform';
library.add(fas);

function App() {
    return (
      <>
          <Router>
            <Routes>
              <Route path="/login" element={<LoginForm />} />
              <Route path="/home" element={ <Home/>} />
              <Route path='/signup' element={<SignUp />} />
              <Route path='/addproduct' element={<ProductForm/>} />
              <Route path='/seller-signup' element={<SellerSignUpForm />} />
              <Route path='/single-product' element={<ProductPage/>} />
              
            </Routes>
          </Router>
      </>
    )
}

export default App;
