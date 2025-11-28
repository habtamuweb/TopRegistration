import React, { useContext, useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { Container, Table, Button, Col, Row, Alert, Form, Card, Badge, Spinner } from 'react-bootstrap';
import { AppContext } from '../App';

const SalesDetail = () => {
  const { id } = useParams();
  const { sales, updateSale, processShipment, deleteSale, setAlertMessage } = useContext(AppContext);
  const navigate = useNavigate();
  
  const sale = sales.find(s => s._id === id || s.id === id);
  const [shippedQuantities, setShippedQuantities] = useState({});
  const [isEditing, setIsEditing] = useState(false);
  const [editFormData, setEditFormData] = useState({});
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);

  // Get only ordered sizes (non-zero quantities)
  const getOrderedSizes = (saleData) => {
    if (!saleData || !saleData.quantities) return [];
    return Object.entries(saleData.quantities)
      .filter(([size, quantity]) => quantity > 0)
      .map(([size, quantity]) => size);
  };

  useEffect(() => {
    if (sale) {
      setShippedQuantities({});
      setEditFormData(sale);
    }
  }, [sale]);

  const handleShippedChange = (size, value) => {
    const shipped = parseInt(value) || 0;
    const previouslyShipped = sale.shippedQuantities?.[size] || 0;
    const totalOrdered = sale.quantities[size] || 0;
    const remaining = totalOrdered - previouslyShipped;
    
    if (shipped >= 0 && shipped <= remaining) {
      setShippedQuantities(prev => ({ ...prev, [size]: shipped }));
    } else if (shipped > remaining) {
      setShippedQuantities(prev => ({ ...prev, [size]: remaining }));
      setMessage(`⚠️ Maximum available for ${size} is ${remaining}`);
      setTimeout(() => setMessage(''), 2000);
    }
  };

  // // Replace the current handleShip function with this version
const handleShip = async () => {
  // ... validation code ...

  setLoading(true);
  try {
    console.log('🚚 Processing shipment for sale:', sale._id || sale.id);
    
    // Process the shipment
    await processShipment(sale._id || sale.id, validShipments);
    
    // Refresh the entire sales data to get updates from all roles
    await loadInitialData(); // Use the function from context
    
    setMessage(`✅ Successfully shipped ${totalShippedThisTime} items!`);
    setShippedQuantities({});
    
  } catch (error) {
    console.error('❌ Error processing shipment:', error);
    setMessage(`❌ Failed to process shipment: ${error.message}`);
  } finally {
    setLoading(false);
  }
};

  const handleDelete = async () => {
    if (window.confirm('Are you sure you want to delete this sale? This action cannot be undone.')) {
      try {
        await deleteSale(sale._id || sale.id);
        setAlertMessage('Sale deleted successfully');
        setTimeout(() => {
          setAlertMessage('');
          navigate('/sales');
        }, 2000);
      } catch (error) {
        setMessage(`❌ Failed to delete sale: ${error.message}`);
      }
    }
  };

  const handleEditChange = (e) => {
    const { name, value } = e.target;
    setEditFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleEditQuantityChange = (e) => {
    const { name, value } = e.target;
    setEditFormData(prev => ({
      ...prev,
      quantities: { 
        ...prev.quantities, 
        [name]: parseInt(value) || 0 
      },
    }));
  };

  const handleSaveEdit = async () => {
    try {
      await updateSale(sale._id || sale.id, editFormData);
      setIsEditing(false);
      setMessage('✅ Sale updated successfully');
      setTimeout(() => setMessage(''), 3000);
    } catch (error) {
      setMessage(`❌ Failed to update sale: ${error.message}`);
    }
  };

  if (!sale) {
    return (
      <Container className="mt-5">
        <Alert variant="danger">
          <h4>Sale Not Found</h4>
          <p>The requested sale could not be found.</p>
          <Button as={Link} to="/sales" variant="primary">
            ← Back to Sales
          </Button>
        </Alert>
      </Container>
    );
  }

  // Calculate order completion status
  const orderedSizes = getOrderedSizes(sale);
  const totalOrdered = Object.values(sale.quantities || {}).reduce((sum, qty) => sum + qty, 0);
  const totalShipped = Object.values(sale.shippedQuantities || {}).reduce((sum, qty) => sum + qty, 0);
  const totalRemaining = totalOrdered - totalShipped;
  const isOrderComplete = totalRemaining === 0;
  const completionPercentage = totalOrdered > 0 ? (totalShipped / totalOrdered) * 100 : 0;

  return (
    <Container className="mt-4">
      {/* Header with Back Button */}
      <div className="d-flex justify-content-between align-items-center mb-4">
        <Button 
          as={Link} 
          to="/sales" 
          variant="outline-primary" 
          size="lg"
        >
          ← Back to Sales
        </Button>
        <div>
          <Badge bg={isOrderComplete ? "success" : "warning"} className="fs-6">
            {isOrderComplete ? "Order Complete" : "In Progress"}
          </Badge>
        </div>
      </div>

      {message && (
        <Alert variant={message.includes('❌') ? 'danger' : 'success'} className="mb-4">
          {message}
        </Alert>
      )}

      <Card className="shadow-sm">
        <Card.Header className="bg-primary text-white">
          <div className="d-flex justify-content-between align-items-center">
            <h2 className="mb-0">📋 Order Details - {sale.customer}</h2>
            <div className="text-end">
              <div className="text-light">Plate: {sale.plate}</div>
              <div className="text-light">FS: {sale.fs}</div>
              <div className="text-light">Date: {new Date(sale.date).toLocaleDateString()}</div>
            </div>
          </div>
        </Card.Header>
        
        <Card.Body>
          {/* Order Summary */}
          <Row className="mb-4">
            <Col md={3}>
              <Card className="text-center bg-light">
                <Card.Body>
                  <Card.Title>Total Ordered</Card.Title>
                  <Card.Text className="h4 text-primary">{totalOrdered}</Card.Text>
                  <Card.Text>Pieces</Card.Text>
                </Card.Body>
              </Card>
            </Col>
            <Col md={3}>
              <Card className="text-center bg-light">
                <Card.Body>
                  <Card.Title>Total Shipped</Card.Title>
                  <Card.Text className="h4 text-success">{totalShipped}</Card.Text>
                  <Card.Text>Pieces (Accumulated)</Card.Text>
                </Card.Body>
              </Card>
            </Col>
            <Col md={3}>
              <Card className="text-center bg-light">
                <Card.Body>
                  <Card.Title>Remaining</Card.Title>
                  <Card.Text className="h4 text-warning">{totalRemaining}</Card.Text>
                  <Card.Text>Pieces</Card.Text>
                </Card.Body>
              </Card>
            </Col>
            <Col md={3}>
              <Card className="text-center bg-light">
                <Card.Body>
                  <Card.Title>Completion</Card.Title>
                  <Card.Text className="h4 text-info">{completionPercentage.toFixed(1)}%</Card.Text>
                  <div className="progress mt-2" style={{ height: '8px' }}>
                    <div 
                      className="progress-bar bg-success" 
                      style={{ width: `${completionPercentage}%` }}
                    ></div>
                  </div>
                </Card.Body>
              </Card>
            </Col>
          </Row>

          {isEditing ? (
            <Card>
              <Card.Header className="bg-warning text-dark">
                <h4 className="mb-0">Edit Sale Order</h4>
              </Card.Header>
              <Card.Body>
                <Form>
                  <Row>
                    <Col md={4}>
                      <Form.Group className="mb-3">
                        <Form.Label><strong>Customer Name *</strong></Form.Label>
                        <Form.Control 
                          type="text" 
                          name="customer" 
                          value={editFormData.customer || ''} 
                          onChange={handleEditChange} 
                          required 
                          size="lg"
                        />
                      </Form.Group>
                    </Col>
                    <Col md={4}>
                      <Form.Group className="mb-3">
                        <Form.Label><strong>Plate Number *</strong></Form.Label>
                        <Form.Control 
                          type="text" 
                          name="plate" 
                          value={editFormData.plate || ''} 
                          onChange={handleEditChange} 
                          required 
                          size="lg"
                        />
                      </Form.Group>
                    </Col>
                    <Col md={4}>
                      <Form.Group className="mb-3">
                        <Form.Label><strong>FS Number *</strong></Form.Label>
                        <Form.Control 
                          type="text" 
                          name="fs" 
                          value={editFormData.fs || ''} 
                          onChange={handleEditChange} 
                          required 
                          size="lg"
                        />
                      </Form.Group>
                    </Col>
                  </Row>
                  
                  <Row>
                    <Col md={12}>
                      <Form.Group className="mb-3">
                        <Form.Label><strong>Date *</strong></Form.Label>
                        <Form.Control 
                          type="date" 
                          name="date" 
                          value={editFormData.date ? new Date(editFormData.date).toISOString().split('T')[0] : ''} 
                          onChange={handleEditChange} 
                          required 
                          size="lg"
                        />
                      </Form.Group>
                    </Col>
                  </Row>

                  <h5 className="mt-4 mb-3">Rebar Quantities</h5>
                  <Row>
                    {orderedSizes.map((size) => (
                      <Col md={3} key={size} className="mb-3">
                        <Form.Group>
                          <Form.Label><strong>{size}</strong></Form.Label>
                          <Form.Control 
                            type="number" 
                            name={size} 
                            value={editFormData.quantities?.[size] || 0} 
                            onChange={handleEditQuantityChange} 
                            min="0" 
                            size="lg"
                          />
                        </Form.Group>
                      </Col>
                    ))}
                  </Row>
                  
                  <div className="d-flex gap-2 mt-4">
                    <Button variant="primary" onClick={handleSaveEdit} size="lg">
                      💾 Save Changes
                    </Button>
                    <Button variant="secondary" onClick={() => setIsEditing(false)} size="lg">
                      ❌ Cancel
                    </Button>
                  </div>
                </Form>
              </Card.Body>
            </Card>
          ) : (
            <>
              {/* Shipping Table */}
              <Card className="mb-4">
                <Card.Header className="bg-info text-white">
                  <h4 className="mb-0">🚚 Ship Rebar - Multiple Shipments Allowed</h4>
                  <p className="mb-0 mt-1">Shipments accumulate with previous shipments. You can ship multiple times.</p>
                </Card.Header>
                <Card.Body className="p-0">
                  <Table striped bordered hover className="mb-0">
                    <thead className="table-dark">
                      <tr>
                        <th>Rebar Size</th>
                        <th className="text-center">Total Ordered</th>
                        <th className="text-center">Already Shipped (Accumulated)</th>
                        <th className="text-center">Remaining</th>
                        <th className="text-center">Ship Now</th>
                        <th className="text-center">Progress</th>
                      </tr>
                    </thead>
                    <tbody>
                      {orderedSizes.map((size) => {
                        const ordered = sale.quantities[size] || 0;
                        const shipped = sale.shippedQuantities?.[size] || 0;
                        const remaining = ordered - shipped;
                        const progress = ordered > 0 ? (shipped / ordered) * 100 : 0;
                        
                        return (
                          <tr key={size} className={remaining === 0 ? 'table-success' : ''}>
                            <td>
                              <strong>{size}</strong>
                            </td>
                            <td className="text-center">
                              <strong className="text-primary">{ordered}</strong>
                            </td>
                            <td className="text-center">
                              <span className="text-success fw-bold">{shipped}</span>
                              <div className="text-muted small">
                                (Previous shipments)
                              </div>
                            </td>
                            <td className="text-center">
                              <span className={remaining === 0 ? 'text-success fw-bold' : 'text-warning fw-bold'}>
                                {remaining}
                                {remaining === 0 && ' ✓ Complete'}
                              </span>
                            </td>
                            <td className="text-center">
                              <Form.Control
                                type="number"
                                min="0"
                                max={remaining}
                                value={shippedQuantities[size] || ''}
                                onChange={(e) => handleShippedChange(size, e.target.value)}
                                placeholder="0"
                                disabled={remaining === 0 || loading}
                                className="text-center"
                                style={{ maxWidth: '120px', margin: '0 auto' }}
                              />
                              {remaining > 0 && (
                                <small className="text-muted d-block">
                                  Max: {remaining}
                                </small>
                              )}
                            </td>
                            <td>
                              <div className="progress" style={{ height: '20px' }}>
                                <div 
                                  className={`progress-bar ${progress === 100 ? 'bg-success' : 'bg-info'}`}
                                  style={{ width: `${progress}%` }}
                                >
                                  {progress.toFixed(0)}%
                                </div>
                              </div>
                              <small className="text-muted">
                                {shipped} / {ordered} pieces
                              </small>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </Table>
                </Card.Body>
              </Card>

              {/* Action Buttons */}
              <div className="d-flex justify-content-between align-items-center">
                <div>
                  <Button 
                    variant="success" 
                    onClick={handleShip} 
                    disabled={loading || Object.values(shippedQuantities).every(q => !q || q === 0) || isOrderComplete}
                    size="lg"
                  >
                    {loading ? (
                      <>
                        <Spinner animation="border" size="sm" className="me-2" />
                        Processing...
                      </>
                    ) : (
                      '🚚 Ship Now'
                    )}
                  </Button>
                  
                  <Button 
                    variant="primary" 
                    onClick={() => setIsEditing(true)} 
                    className="ms-2"
                    size="lg"
                    disabled={loading}
                  >
                    ✏️ Edit Order
                  </Button>
                </div>
                
                <Button 
                  variant="danger" 
                  onClick={handleDelete}
                  size="lg"
                  disabled={loading}
                >
                  🗑️ Delete Sale
                </Button>
              </div>

              {isOrderComplete && (
                <Alert variant="success" className="mt-4">
                  <h5>🎉 Order Complete!</h5>
                  <p className="mb-0">All items have been shipped successfully. This order is now complete.</p>
                </Alert>
              )}
            </>
          )}
        </Card.Body>
      </Card>
    </Container>
  );
};

export default SalesDetail;