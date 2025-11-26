import React, { createContext, useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Link, Navigate } from 'react-router-dom';
import { Navbar, Nav, Container, Spinner, Alert, Button } from 'react-bootstrap';
import { apiService } from './pages/api';
import { AuthProvider, useAuth } from './pages/AuthContext';
import './App.css';
import 'bootstrap/dist/css/bootstrap.min.css';

// Import all components
import Home from './pages/Home';
import AddSales from './pages/AddSales';
import Sales from './pages/Sales';
import SalesDetail from './pages/SalesDetail';
import TotalSales from './pages/TotalSales';
import AddPurchase from './pages/AddPurchase';
import Purchase from './pages/Purchase';
import TotalPurchase from './pages/TotalPurchase';
import Remaining from './pages/Remaining';
import StoreBalance from './pages/StoreBalance';
import FactoryPurchased from './pages/AddFactoryPurchased';
import Factory from './pages/Factory';
import Stock from './pages/Stock';
import SalesAvailable from './pages/SalesAvialable';
import Login from './pages/Login';

export const AppContext = createContext();

// Protected Route Component
const ProtectedRoute = ({ children, requiredRoles = [] }) => {
  const { user, hasPermission } = useAuth();
  
  if (!user) {
    return <Navigate to="/login" replace />;
  }
  
  if (requiredRoles.length > 0 && !hasPermission(requiredRoles)) {
    return (
      <Container className="mt-5 text-center">
        <Alert variant="danger">
          <h4>Access Denied</h4>
          <p>You don't have permission to access this page.</p>
          <Button as={Link} to="/" variant="primary">
            Go Home
          </Button>
        </Alert>
      </Container>
    );
  }
  
  return children;
};

// Helper function to calculate totals with safety checks
const calculateTotals = (items, includeShippedOnly = false) => {
  // Safety check: ensure items is an array
  if (!Array.isArray(items)) {
    console.warn('calculateTotals: items is not an array', items);
    items = [];
  }

  const sizes = ['8mm', '10mm', '12mm', '14mm', '16mm', '20mm', '24mm', '32mm'];
  return sizes.reduce((acc, size) => {
    acc[size] = items.reduce((sum, item) => {
      if (!includeShippedOnly) {
        return sum + ((item.quantities && item.quantities[size]) || 0);
      } else {
        const shipped = (item.shippedQuantities && item.shippedQuantities[size]) || 0;
        return sum + shipped;
      }
    }, 0);
    return acc;
  }, {});
};

// Main App Content
function AppContent() {
  const { user, logout, hasPermission } = useAuth();
  const [sales, setSales] = useState([]);
  const [purchases, setPurchases] = useState([]);
  const [factoryPurchases, setFactoryPurchases] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [alertMessage, setAlertMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Load initial data when user is authenticated
  useEffect(() => {
    if (user) {
      loadInitialData();
    }
  }, [user]);

  const loadInitialData = async () => {
    setLoading(true);
    try {
      const [salesData, purchasesData, factoryData] = await Promise.all([
        apiService.getSales().catch(() => []),
        apiService.getPurchases().catch(() => []),
        apiService.getFactoryPurchases().catch(() => [])
      ]);

      setSales(salesData || []);
      setPurchases(purchasesData || []);
      setFactoryPurchases(factoryData || []);
      setError('');
    } catch (err) {
      console.error('Error loading initial data:', err);
      setError('Failed to load data. Please check your connection.');
    } finally {
      setLoading(false);
    }
  };

  // Factory Purchase Functions
  const addFactoryPurchase = async (purchaseData) => {
    try {
      const newPurchase = await apiService.createFactoryPurchase(purchaseData);
      setFactoryPurchases(prev => [newPurchase, ...prev]);
      setAlertMessage('✅ Factory Purchase Registered Successfully!');
      return newPurchase;
    } catch (err) {
      setAlertMessage('❌ Failed to add factory purchase');
      throw err;
    }
  };

  const deleteFactoryPurchase = async (id) => {
    try {
      await apiService.deleteFactoryPurchase(id);
      setFactoryPurchases(prev => prev.filter(purchase => purchase._id !== id));
      setAlertMessage('Factory purchase deleted successfully');
    } catch (err) {
      setAlertMessage('❌ Failed to delete factory purchase');
      throw err;
    }
  };

  // Purchase Functions
  const addPurchase = async (purchaseData) => {
    try {
      const newPurchase = await apiService.createPurchase(purchaseData);
      setPurchases(prev => [newPurchase, ...prev]);
      setAlertMessage('✅ Registered To Purchase-Thank you!');
      return newPurchase;
    } catch (err) {
      setAlertMessage('❌ Failed to add purchase');
      throw err;
    }
  };

  const deletePurchase = async (id) => {
    try {
      await apiService.deletePurchase(id);
      setPurchases(prev => prev.filter(purchase => purchase._id !== id));
      setAlertMessage('Purchase deleted successfully');
    } catch (err) {
      setAlertMessage('❌ Failed to delete purchase');
      throw err;
    }
  };

  // Sales Functions
  const addSale = async (saleData) => {
    try {
      const newSale = await apiService.createSale(saleData);
      setSales(prev => [newSale, ...prev]);
      setAlertMessage('✅ Registered To Sales-Thank you!');
      return newSale;
    } catch (err) {
      setAlertMessage('❌ Failed to add sale');
      throw err;
    }
  };

  const updateSale = async (id, saleData) => {
    try {
      const updatedSale = await apiService.updateSale(id, saleData);
      setSales(prev => prev.map(sale => sale._id === id ? updatedSale : sale));
      setAlertMessage('Sale updated successfully');
      return updatedSale;
    } catch (err) {
      setAlertMessage('❌ Failed to update sale');
      throw err;
    }
  };

  const deleteSale = async (id) => {
    try {
      await apiService.deleteSale(id);
      setSales(prev => prev.filter(sale => sale._id !== id));
      setAlertMessage('Sale deleted successfully');
    } catch (err) {
      setAlertMessage('❌ Failed to delete sale');
      throw err;
    }
  };

  const processShipment = async (id, shipmentData) => {
    try {
      const updatedSale = await apiService.processShipment(id, { shippedQuantities: shipmentData });
      setSales(prev => prev.map(sale => sale._id === id ? updatedSale : sale));
      setAlertMessage('✅ Shipped successfully!');
      return updatedSale;
    } catch (err) {
      setAlertMessage('❌ Failed to process shipment');
      throw err;
    }
  };

  // Calculate totals with safe defaults
  const purchasedTotals = calculateTotals(purchases, false);
  const soldTotals = calculateTotals(sales, true);
  const factoryStockTotals = calculateTotals(factoryPurchases, false);

  // Calculate balances with safe defaults
  const balances = Object.keys(purchasedTotals).reduce((acc, size) => {
    const purchased = purchasedTotals[size] || 0;
    const sold = soldTotals[size] || 0;
    acc[size] = Math.max(0, purchased - sold);
    return acc;
  }, {});

  // Auto-hide alerts
  useEffect(() => {
    if (alertMessage) {
      const timer = setTimeout(() => setAlertMessage(''), 5000);
      return () => clearTimeout(timer);
    }
  }, [alertMessage]);

  // Navigation items with role-based permissions
  const getNavItems = () => {
    const allItems = [
      { path: "/", label: "🏠 Home", roles: ['admin', 'warehouse_manager', 'sales_person', 'manager'] },
      { path: "/add-sales", label: "💰 Add Sales", roles: ['admin', 'sales_person'] },
      { path: "/sales", label: "📋 Sales", roles: ['admin', 'warehouse_manager', 'sales_person', 'manager'] },
      { path: "/total-sales", label: "📊 Total Sales", roles: ['admin', 'warehouse_manager', 'manager'] },
      { path: "/add-purchase", label: "🛒 Add Purchase", roles: ['admin', 'warehouse_manager'] },
      { path: "/purchase", label: "📦 Purchases", roles: ['admin', 'warehouse_manager', 'manager'] },
      { path: "/total-purchase", label: "📈 Total Purchase", roles: ['admin', 'warehouse_manager', 'manager'] },
      { path: "/remaining", label: "⏳ Remaining", roles: ['admin', 'warehouse_manager', 'manager'] },
      { path: "/store", label: "🏪 Store Balance", roles: ['admin', 'warehouse_manager', 'manager'] },
      { path: "/factory-purchased", label: "🏭 Factory Purchase", roles: ['admin', 'warehouse_manager'] },
      { path: "/factory", label: "📋 Factory", roles: ['admin', 'warehouse_manager', 'manager'] },
      { path: "/stock", label: "📊 Stock", roles: ['admin', 'warehouse_manager', 'manager'] },
      { path: "/sales-available", label: "🛍️ Sales Available", roles: ['admin', 'warehouse_manager', 'sales_person', 'manager'] },
    ];

    return allItems.filter(item => hasPermission(item.roles));
  };

  if (!user) {
    return <Login />;
  }

  // Context value with all necessary data and functions
  const contextValue = {
    // Data arrays
    sales: sales || [],
    purchases: purchases || [],
    factoryPurchases: factoryPurchases || [],
    
    // UI state
    searchTerm,
    alertMessage,
    
    // Setters
    setSales,
    setPurchases,
    setFactoryPurchases,
    setSearchTerm,
    setAlertMessage,
    
    // Factory purchase functions
    addFactoryPurchase,
    deleteFactoryPurchase,
    
    // Purchase functions
    addPurchase,
    deletePurchase,
    
    // Sales functions
    addSale,
    updateSale,
    deleteSale,
    processShipment,
    
    // Calculated totals with safe defaults
    purchasedTotals,
    soldTotals,
    factoryStockTotals,
    balances,
    
    // Utility function
    reloadData: loadInitialData
  };

  return (
    <AppContext.Provider value={contextValue}>
      <Router>
        {/* Navigation */}
        <Navbar bg="light" expand="lg" className="py-2 border-bottom">
          <Container>
            <Navbar.Brand style={{color:'blue'}}>
              🏗️  ({user.role})
            </Navbar.Brand>
            <Navbar.Toggle aria-controls="basic-navbar-nav" />
            <Navbar.Collapse id="basic-navbar-nav" className="justify-content-center">
              <Nav className="mx-auto">
                {getNavItems().map((item) => (
                  <Nav.Link key={item.path} as={Link} to={item.path}>
                    {item.label}
                  </Nav.Link>
                ))}
              </Nav>
              <Nav>
                <Button variant="outline-danger" size="sm" onClick={logout}>
                  🚪 Logout
                </Button>
              </Nav>
            </Navbar.Collapse>
          </Container>
        </Navbar>

        {/* Main Content */}
        <Container fluid className="mt-3">
          {error && (
            <Alert variant="warning" className="mb-3">
              ⚠️ {error}
            </Alert>
          )}

          {alertMessage && (
            <Alert 
              variant={alertMessage.includes('❌') ? 'danger' : 'success'} 
              className="mb-3"
            >
              {alertMessage}
            </Alert>
          )}

          {loading ? (
            <div className="text-center py-5">
              <Spinner animation="border" role="status" variant="primary">
                <span className="visually-hidden">Loading...</span>
              </Spinner>
              <p className="mt-2">Loading application data...</p>
            </div>
          ) : (
            <Routes>
              <Route path="/login" element={<Navigate to="/" replace />} />
              <Route path="/" element={
                <ProtectedRoute>
                  <Home />
                </ProtectedRoute>
              } />
              
              {/* Sales Routes */}
              <Route path="/add-sales" element={
                <ProtectedRoute requiredRoles={['admin', 'sales_person']}>
                  <AddSales />
                </ProtectedRoute>
              } />
              <Route path="/sales" element={
                <ProtectedRoute>
                  <Sales />
                </ProtectedRoute>
              } />
              <Route path="/sales/:id" element={
                <ProtectedRoute>
                  <SalesDetail />
                </ProtectedRoute>
              } />
              <Route path="/total-sales" element={
                <ProtectedRoute requiredRoles={['admin', 'warehouse_manager', 'manager']}>
                  <TotalSales />
                </ProtectedRoute>
              } />
              
              {/* Purchase Routes */}
              <Route path="/add-purchase" element={
                <ProtectedRoute requiredRoles={['admin', 'warehouse_manager']}>
                  <AddPurchase />
                </ProtectedRoute>
              } />
              <Route path="/purchase" element={
                <ProtectedRoute requiredRoles={['admin', 'warehouse_manager', 'manager']}>
                  <Purchase />
                </ProtectedRoute>
              } />
              <Route path="/total-purchase" element={
                <ProtectedRoute requiredRoles={['admin', 'warehouse_manager', 'manager']}>
                  <TotalPurchase />
                </ProtectedRoute>
              } />
              
              {/* Factory Routes */}
              <Route path="/factory-purchased" element={
                <ProtectedRoute requiredRoles={['admin', 'warehouse_manager']}>
                  <FactoryPurchased />
                </ProtectedRoute>
              } />
              <Route path="/factory" element={
                <ProtectedRoute requiredRoles={['admin', 'warehouse_manager', 'manager']}>
                  <Factory />
                </ProtectedRoute>
              } />
              
              {/* Other Routes */}
              <Route path="/remaining" element={
                <ProtectedRoute requiredRoles={['admin', 'warehouse_manager', 'manager']}>
                  <Remaining />
                </ProtectedRoute>
              } />
              <Route path="/store" element={
                <ProtectedRoute requiredRoles={['admin', 'warehouse_manager', 'manager']}>
                  <StoreBalance />
                </ProtectedRoute>
              } />
              <Route path="/stock" element={
                <ProtectedRoute requiredRoles={['admin', 'warehouse_manager', 'manager']}>
                  <Stock />
                </ProtectedRoute>
              } />
              <Route path="/sales-available" element={
                <ProtectedRoute>
                  <SalesAvailable />
                </ProtectedRoute>
              } />
            </Routes>
          )}
        </Container>
      </Router>
    </AppContext.Provider>
  );
}

// Main App wrapper
function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}

export default App;