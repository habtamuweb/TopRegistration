import React, { useState, useContext } from 'react';
import { Container, Form, Button, Row, Col, Alert, Spinner, Card } from 'react-bootstrap';
import { AppContext } from '../App';

const AddSales = () => {
  const { addSale } = useContext(AppContext);
  const [formData, setFormData] = useState({
    customer: '',
    plate: '',
    fs: '',
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

      if (!formData.customer.trim()) {
        setMessage('❌ Please enter customer name');
        setTimeout(() => setMessage(''), 3000);
        return;
      }

      if (!formData.plate.trim()) {
        setMessage('❌ Please enter plate number');
        setTimeout(() => setMessage(''), 3000);
        return;
      }

      if (!formData.fs.trim()) {
        setMessage('❌ Please enter FS number');
        setTimeout(() => setMessage(''), 3000);
        return;
      }
      
      const saleData = { 
        customer: formData.customer.trim(),
        plate: formData.plate.trim(),
        fs: formData.fs.trim(),
        quantities: filledQuantities, // Only send filled quantities
        date: formData.date
      };
      
      console.log('💰 Submitting sale data:', saleData);
      
      await addSale(saleData);
      setMessage('✅ Sale Registered Successfully!');
      
      // Reset form
      setFormData({
        customer: '',
        plate: '',
        fs: '',
        quantities: { 
          '8mm': '', '10mm': '', '12mm': '', '14mm': '', 
          '16mm': '', '20mm': '', '24mm': '', '32mm': '' 
        },
        date: new Date().toISOString().split('T')[0],
      });
    } catch (error) {
      console.error('Error adding sale:', error);
      setMessage(`❌ Failed to register sale: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container className="mt-4">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2>💰 Add New Sale</h2>
        <Button 
          variant="outline-info" 
          onClick={() => window.location.href = '/sales'}
          size="lg"
        >
          📋 View Sales
        </Button>
      </div>

      {message && (
        <Alert variant={message.includes('❌') ? 'danger' : 'success'} className="mb-4">
          {message}
        </Alert>
      )}
      
      <Card className="shadow-sm">
        <Card.Body>
          <Form onSubmit={handleSubmit}>
            <Row className="mb-3">
              <Col md={4}>
                <Form.Group>
                  <Form.Label>
                    <strong>Customer Name *</strong>
                  </Form.Label>
                  <Form.Control 
                    type="text" 
                    name="customer" 
                    value={formData.customer} 
                    onChange={handleChange} 
                    placeholder="Enter customer name"
                    required 
                    disabled={loading}
                    size="lg"
                  />
                </Form.Group>
              </Col>
              <Col md={4}>
                <Form.Group>
                  <Form.Label>
                    <strong>Plate Number *</strong>
                  </Form.Label>
                  <Form.Control 
                    type="text" 
                    name="plate" 
                    value={formData.plate} 
                    onChange={handleChange} 
                    placeholder="Enter plate number"
                    required 
                    disabled={loading}
                    size="lg"
                  />
                </Form.Group>
              </Col>
              <Col md={4}>
                <Form.Group>
                  <Form.Label>
                    <strong>FS Number *</strong>
                  </Form.Label>
                  <Form.Control 
                    type="text" 
                    name="fs" 
                    value={formData.fs} 
                    onChange={handleChange} 
                    placeholder="Enter FS number"
                    required 
                    disabled={loading}
                    size="lg"
                  />
                </Form.Group>
              </Col>
            </Row>

            <Row className="mb-3">
              <Col md={12}>
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
              <p className="text-muted">Only sizes with quantities will be saved to the order</p>
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
                variant="success" 
                type="submit" 
                size="lg" 
                disabled={loading}
                className="py-3"
              >
                {loading ? (
                  <>
                    <Spinner animation="border" size="sm" className="me-2" />
                    Registering Sale...
                  </>
                ) : (
                  '💰 Register Sale'
                )}
              </Button>
            </div>
          </Form>
        </Card.Body>
      </Card>
    </Container>
  );
};

export default AddSales;