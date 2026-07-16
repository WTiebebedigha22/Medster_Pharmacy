import { BrowserRouter, Route, Routes } from "react-router-dom";
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

function App() {

  return (
    <BrowserRouter>
      {/* AUTH ROUTES */}
      <Routes>
        <Route path="/auth/login" element={<Login />} />
        <Route path="/auth/register" element={<CreateAccount />} />

        {/* MAIN ECOMMERCE ROUTES */}
        <Route
          path="/*"
          element={
            <>
              <NavBar />
              <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/shop" element={<Shop />} />
                <Route path="/product/:id" element={<ProductPage />} />
                <Route path="/cart" element={<Cart />} />
                <Route path="/checkout" element={<CheckoutPage />} />
                <Route path="/orders" element={<OrdersPage />} />
                <Route path="/contact-us" element={<Contact />} />
              </Routes>
              <Footer />
            </>
          }
        />
      </Routes>
    </BrowserRouter>
  );
}

export default App;

