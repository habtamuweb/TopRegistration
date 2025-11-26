import React, { useState, useContext } from 'react';
import { Container, Form, Button, Row, Col, Alert, Spinner } from 'react-bootstrap';
import { AppContext } from '../App';

const FactoryPurchased = () => {
  const { factoryPurchases, setFactoryPurchases, addFactoryPurchase } = useContext(AppContext);
  const [formData, setFormData] = useState({
    factoryName: '',
    quantities: { 
      '8mm': '', '10mm': '', '12mm': '', '14mm': '', 
      '16mm': '', '20mm': '', '24mm': '', '32mm': '' 
    },
    date: new Date().toISOString().split('T')[0],
  });
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleQuantityChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      quantities: { 
        ...prev.quantities, 
        [name]: value === '' ? '' : parseInt(value) || 0 
      },
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');
    
    try {
      // Filter out empty quantities and convert to numbers
      const filledQuantities = Object.fromEntries(
        Object.entries(formData.quantities)
          .filter(([k, v]) => v !== '' && v > 0)
          .map(([k, v]) => [k, parseInt(v)])
      );

      // Validation
      if (Object.keys(filledQuantities).length === 0) {
        setMessage('❌ Please enter at least one quantity');
        setTimeout(() => setMessage(''), 3000);
        return;
      }

      if (!formData.factoryName.trim()) {
        setMessage('❌ Please enter factory name');
        setTimeout(() => setMessage(''), 3000);
        return;
      }
      
      const purchaseData = { 
        factoryName: formData.factoryName.trim(),
        quantities: filledQuantities, 
        date: formData.date
      };
      
      await addFactoryPurchase(purchaseData);
      setMessage('✅ Factory Purchase Registered Successfully!');
      
      // Reset form
      setFormData({
        factoryName: '',
        quantities: { 
          '8mm': '', '10mm': '', '12mm': '', '14mm': '', 
          '16mm': '', '20mm': '', '24mm': '', '32mm': '' 
        },
        date: new Date().toISOString().split('T')[0],
      });
    } catch (error) {
      setMessage('❌ Failed to save factory purchase. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container className="mt-4">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2>Add Factory Purchase</h2>
        <Button 
          variant="outline-info" 
          onClick={() => window.location.href = '/factory'}
        >
          View Factory Purchases
        </Button>
      </div>

      {message && (
        <Alert variant={message.includes('❌') ? 'danger' : 'success'} className="mb-4">
          {message}
        </Alert>
      )}
      
      <div className="card shadow-sm">
        <div className="card-body">
          <Form onSubmit={handleSubmit}>
            <Row className="mb-3">
              <Col md={8}>
                <Form.Group>
                  <Form.Label>
                    <strong>Factory Name *</strong>
                  </Form.Label>
                  <Form.Control 
                    type="text" 
                    name="factoryName" 
                    value={formData.factoryName} 
                    onChange={handleChange} 
                    placeholder="Enter factory name"
                    required 
                    disabled={loading}
                    size="lg"
                  />
                </Form.Group>
              </Col>
              <Col md={4}>
                <Form.Group>
                  <Form.Label>
                    <strong>Date *</strong>
                  </Form.Label>
                  <Form.Control 
                    type="date" 
                    name="date" 
                    value={formData.date} 
                    onChange={handleChange} 
                    required 
                    disabled={loading}
                    size="lg"
                  />
                </Form.Group>
              </Col>
            </Row>

            <div className="mb-3">
              <h5>📏 Enter Quantities (Leave blank for 0)</h5>
              <p className="text-muted">Enter the quantity for each rebar size purchased from the factory</p>
            </div>

            <Row className="mb-4">
              {Object.keys(formData.quantities).map((size) => (
                <Col md={3} key={size} className="mb-3">
                  <Form.Group>
                    <Form.Label>
                      <strong>{size} Rebar</strong>
                    </Form.Label>
                    <Form.Control 
                      type="number" 
                      name={size} 
                      value={formData.quantities[size]} 
                      onChange={handleQuantityChange} 
                      min="0"
                      placeholder="0"
                      disabled={loading}
                    />
                  </Form.Group>
                </Col>
              ))}
            </Row>
            
            <div className="d-grid">
              <Button 
              style={{width:'25%',height:'60px'}}
                variant="primary" 
                type="submit" 
                size="lg" 
                disabled={loading}
                className="py-3"
              >
                {loading ? (
                  <>
                    <Spinner animation="border" size="sm" className="me-2" />
                    Adding Factory Purchase...
                  </>
                ) : (
                  '➕ Add Factory Purchase'
                )}
              </Button>
            </div>
          </Form>
        </div>
      </div>
    </Container>
  );
};

export default FactoryPurchased;