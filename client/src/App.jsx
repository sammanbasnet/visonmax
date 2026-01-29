import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import Shop from './pages/Shop';
import ProductDetails from './pages/ProductDetails';
import PrivateRoute from './components/PrivateRoute';
import Checkout from './pages/Checkout';
import { AuthProvider } from './context/AuthContext';
import EsewaSuccess from './pages/EsewaSuccess';
import EsewaFailure from './pages/EsewaFailure';

import { Toaster } from 'react-hot-toast';

function App() {
  return (
    <AuthProvider>
      <Router>
        <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
          <Toaster position="top-center" toastOptions={{ duration: 3000 }} />
          <Navbar />
          <main style={{ flex: 1, background: '#ffffff' }}>
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route path="/shop" element={<Shop />} />
              <Route path="/product/:id" element={<ProductDetails />} />
              <Route
                path="/checkout"
                element={
                  <PrivateRoute>
                    <Checkout />
                  </PrivateRoute>
                }
              />
              <Route
                path="/dashboard"
                element={
                  <PrivateRoute>
                    <Dashboard />
                  </PrivateRoute>
                }
              />
              <Route
                path="/payment-success"
                element={
                  <PrivateRoute>
                    <EsewaSuccess />
                  </PrivateRoute>
                }
              />
              <Route
                path="/payment-failure"
                element={
                  <PrivateRoute>
                    <EsewaFailure />
                  </PrivateRoute>
                }
              />
            </Routes>
          </main>
          <footer style={{ background: '#ffffff', padding: '2rem 0', textAlign: 'center', borderTop: '1px solid #e5e7eb' }}>
            <div className="container">
              <p style={{ color: '#6b7280' }}>&copy; 2024 VisionMax Eyewear. All rights reserved.</p>
            </div>
          </footer>
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;
