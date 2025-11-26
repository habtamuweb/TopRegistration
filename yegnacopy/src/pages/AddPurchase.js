import React, { useState, useContext } from 'react';
import { Container, Form, Button, Row, Col, Alert, Spinner, Card } from 'react-bootstrap';
import { AppContext } from '../App';

const AddPurchase = () => {
  const { addPurchase } = useContext(AppContext);
  const [formData, setFormData] = useState({
    factory: '',
    driverName: '',
    plateNo: '',
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

      if (!formData.factory.trim()) {
        setMessage('❌ Please enter factory name');
        setTimeout(() => setMessage(''), 3000);
        return;
      }
      
      // Create complete purchase data with ALL fields
      const purchaseData = { 
        factory: formData.factory.trim(),
        driverName: formData.driverName.trim() || '', // Ensure it's always sent
        plateNo: formData.plateNo.trim() || '', // Ensure it's always sent
        quantities: filledQuantities, 
        date: formData.date
      };
      
      console.log('🛒 Sending purchase data to backend:', purchaseData);
      
      await addPurchase(purchaseData);
      setMessage('✅ Purchase Registered Successfully!');
      
      // Reset form
      setFormData({
        factory: '',
        driverName: '',
        plateNo: '',
        quantities: { 
          '8mm': '', '10mm': '', '12mm': '', '14mm': '', 
          '16mm': '', '20mm': '', '24mm': '', '32mm': '' 
        },
        date: new Date().toISOString().split('T')[0],
      });
    } catch (error) {
      console.error('❌ Error adding purchase:', error);
      setMessage(`❌ Failed to register purchase: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container className="mt-4">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2>🛒 Add Imported Purchase</h2>
        <Button 
          variant="outline-info" 
          onClick={() => window.location.href = '/purchase'}
          size="lg"
        >
          📦 View Purchases
        </Button>
      </div>

      {message && (
        <Alert variant={message.includes('❌') ? 'danger' : 'success'} className="mb-4">
          {message}
        </Alert>
      )}
      
      <Card className="shadow-sm">
        <Card.Header className="bg-primary text-white">
          <h4 className="mb-0">Purchase Information</h4>
        </Card.Header>
        <Card.Body>
          <Form onSubmit={handleSubmit}>
            {/* Factory Information */}
            <Row className="mb-4">
              <Col md={12}>
                <h5 className="text-primary">🏭 Factory Details</h5>
                <hr />
              </Col>
              <Col md={8}>
                <Form.Group>
                  <Form.Label>
                    <strong>Factory Name *</strong>
                  </Form.Label>
                  <Form.Control 
                    type="text" 
                    name="factory" 
                    value={formData.factory} 
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

            {/* Driver & Vehicle Information */}
            <Row className="mb-4">
              <Col md={12}>
                <h5 className="text-primary">🚚 Delivery Information</h5>
                <hr />
              </Col>
              <Col md={6}>
                <Form.Group>
                  <Form.Label>
                    <strong>Driver Name</strong>
                  </Form.Label>
                  <Form.Control 
                    type="text" 
                    name="driverName" 
                    value={formData.driverName} 
                    onChange={handleChange} 
                    placeholder="Enter driver name"
                    disabled={loading}
                    size="lg"
                  />
                  <Form.Text className="text-muted">
                    Optional: Name of the delivery driver
                  </Form.Text>
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group>
                  <Form.Label>
                    <strong>Plate Number</strong>
                  </Form.Label>
                  <Form.Control 
                    type="text" 
                    name="plateNo" 
                    value={formData.plateNo} 
                    onChange={handleChange} 
                    placeholder="Enter vehicle plate number"
                    disabled={loading}
                    size="lg"
                  />
                  <Form.Text className="text-muted">
                    Optional: Vehicle license plate
                  </Form.Text>
                </Form.Group>
              </Col>
            </Row>

            {/* Quantities Section */}
            <Row className="mb-4">
              <Col md={12}>
                <h5 className="text-primary">📏 Rebar Quantities</h5>
                <p className="text-muted">Enter quantities for each rebar size (leave blank for 0)</p>
                <hr />
              </Col>
              
              {Object.keys(formData.quantities).map((size) => (
                <Col md={3} key={size} className="mb-3">
                  <Form.Group>
                    <Form.Label>
                      <strong className="text-success">{size} Rebar</strong>
                    </Form.Label>
                    <Form.Control 
                      type="number" 
                      name={size} 
                      value={formData.quantities[size]} 
                      onChange={handleQuantityChange} 
                      min="0"
                      placeholder="0"
                      disabled={loading}
                      className="text-center"
                    />
                    <Form.Text className="text-muted d-block text-center">
                      Pieces
                    </Form.Text>
                  </Form.Group>
                </Col>
              ))}
            </Row>
            
            <div className="d-grid gap-2">
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
                    Registering Purchase...
                  </>
                ) : (
                  '🛒 Register Purchase'
                )}
              </Button>
              
              {/* <Button 
                variant="outline-secondary" 
                onClick={() => {
                  setFormData({
                    factory: '',
                    driverName: '',
                    plateNo: '',
                    quantities: { 
                      '8mm': '', '10mm': '', '12mm': '', '14mm': '', 
                      '16mm': '', '20mm': '', '24mm': '', '32mm': '' 
                    },
                    date: new Date().toISOString().split('T')[0],
                  });
                  setMessage('');
                }}
                disabled={loading}
              >
                🔄 Clear Form
              </Button> */}
            </div>
          </Form>
        </Card.Body>
      </Card>

      {/* Debug Information */}
      <Card className="mt-3 border-warning">
        
        {/* <Card.Body>
          <small>
            <strong>Form Data:</strong><br />
            Factory: {formData.factory || 'Empty'}<br />
            Driver: {formData.driverName || 'Empty'}<br />
            Plate: {formData.plateNo || 'Empty'}<br />
            Quantities: {JSON.stringify(formData.quantities)}
          </small>
        </Card.Body> */}
      </Card>
    </Container>
  );
};

export default AddPurchase;