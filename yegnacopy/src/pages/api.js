const API_BASE_URL = 'http://localhost:5000/api';

// Get session headers
const getSessionHeaders = () => {
  const sessionId = localStorage.getItem('sessionId');
  return {
    'Content-Type': 'application/json',
    ...(sessionId && { 'X-Session-ID': sessionId })
  };
};

const handleResponse = async (response) => {
  if (!response.ok) {
    // If unauthorized, clear local storage
    if (response.status === 401) {
      localStorage.removeItem('user');
      localStorage.removeItem('sessionId');
      window.location.href = '/login';
    }
    
    const errorData = await response.json().catch(() => ({ message: 'Network error' }));
    throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
  }
  return response.json();
};

export const apiService = {
  // Auth endpoints
  login: (credentials) => 
    fetch(`${API_BASE_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(credentials)
    }).then(handleResponse),

  logout: () =>
    fetch(`${API_BASE_URL}/auth/logout`, {
      method: 'POST',
      headers: getSessionHeaders()
    }).then(handleResponse),

  // Sales endpoints
  getSales: () => 
    fetch(`${API_BASE_URL}/sales`, {
      headers: getSessionHeaders()
    }).then(handleResponse),
  
  createSale: (saleData) => 
    fetch(`${API_BASE_URL}/sales`, {
      method: 'POST',
      headers: getSessionHeaders(),
      body: JSON.stringify(saleData)
    }).then(handleResponse),
  
  updateSale: (id, saleData) => 
    fetch(`${API_BASE_URL}/sales/${id}`, {
      method: 'PUT',
      headers: getSessionHeaders(),
      body: JSON.stringify(saleData)
    }).then(handleResponse),
  
  deleteSale: (id) => 
    fetch(`${API_BASE_URL}/sales/${id}`, {
      method: 'DELETE',
      headers: getSessionHeaders()
    }).then(handleResponse),
  
  processShipment: (id, shipmentData) => 
    fetch(`${API_BASE_URL}/sales/${id}/ship`, {
      method: 'PATCH',
      headers: getSessionHeaders(),
      body: JSON.stringify(shipmentData)
    }).then(handleResponse),

  // Purchase endpoints
  getPurchases: () => 
    fetch(`${API_BASE_URL}/purchases`, {
      headers: getSessionHeaders()
    }).then(handleResponse),
  
  createPurchase: (purchaseData) => 
    fetch(`${API_BASE_URL}/purchases`, {
      method: 'POST',
      headers: getSessionHeaders(),
      body: JSON.stringify(purchaseData)
    }).then(handleResponse),
  
  deletePurchase: (id) => 
    fetch(`${API_BASE_URL}/purchases/${id}`, {
      method: 'DELETE',
      headers: getSessionHeaders()
    }).then(handleResponse),

  // Factory purchase endpoints
  getFactoryPurchases: () => 
    fetch(`${API_BASE_URL}/factory`, {
      headers: getSessionHeaders()
    }).then(handleResponse),
  
  createFactoryPurchase: (purchaseData) => 
    fetch(`${API_BASE_URL}/factory`, {
      method: 'POST',
      headers: getSessionHeaders(),
      body: JSON.stringify(purchaseData)
    }).then(handleResponse),
  
  deleteFactoryPurchase: (id) => 
    fetch(`${API_BASE_URL}/factory/${id}`, {
      method: 'DELETE',
      headers: getSessionHeaders()
    }).then(handleResponse)
};