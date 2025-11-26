import React, { useContext, useState } from 'react';
import { Container, Form, Button, Alert, Card, Badge, Row, Col } from 'react-bootstrap';
import { useNavigate, Link } from 'react-router-dom';
import { AppContext } from '../App';

const Sales = () => {
  const { sales } = useContext(AppContext);
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  const filteredSales = sales.filter((sale) => {
    const matchesSearch = 
      sale.customer?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      sale.plate?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      sale.fs?.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus = 
      statusFilter === 'all' || 
      (statusFilter === 'pending' && !sale.shipped) || 
      (statusFilter === 'shipped' && sale.shipped);

    return matchesSearch && matchesStatus;
  });

  // Get only ordered sizes (non-zero quantities) for a sale
  const getOrderedSizes = (sale) => {
    if (!sale.quantities) return [];
    return Object.entries(sale.quantities)
      .filter(([size, quantity]) => quantity > 0)
      .map(([size, quantity]) => ({ size, quantity }));
  };

  // Calculate order progress for each sale
  const calculateOrderProgress = (sale) => {
    const totalOrdered = Object.values(sale.quantities || {}).reduce((sum, qty) => sum + qty, 0);
    const totalShipped = Object.values(sale.shippedQuantities || {}).reduce((sum, qty) => sum + qty, 0);
    return totalOrdered > 0 ? (totalShipped / totalOrdered) * 100 : 0;
  };

  return (
    <Container className="mt-4">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2 className="text-primary">💰 Customer Sales</h2>
        <Button as={Link} to="/add-sales" variant="success" size="lg">
          ➕ Add New Sale
        </Button>
      </div>

      {/* Search and Filter Section */}
      <Card className="shadow-sm mb-4">
        <Card.Header className="bg-light">
          <Form>
            <Row>
              <Col md={6}>
                <Form.Group>
                  <Form.Label><strong>🔍 Search Sales</strong></Form.Label>
                  <Form.Control
                    type="text"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    placeholder="Search by Customer, Plate, FS Number..."
                    size="lg"
                  />
                </Form.Group>
              </Col>
              <Col md={4}>
                <Form.Group>
                  <Form.Label><strong>📊 Status Filter</strong></Form.Label>
                  <Form.Select 
                    value={statusFilter} 
                    onChange={(e) => setStatusFilter(e.target.value)}
                    size="lg"
                  >
                    <option value="all">All Orders</option>
                    <option value="pending">Pending</option>
                    <option value="shipped">Shipped</option>
                  </Form.Select>
                </Form.Group>
              </Col>
              <Col md={2} className="d-flex align-items-end">
                <div className="text-muted">
                  {filteredSales.length} orders
                </div>
              </Col>
            </Row>
          </Form>
        </Card.Header>
      </Card>

      {/* Individual Customer Tables */}
      {filteredSales.length > 0 ? (
        <div>
          {filteredSales.map((sale) => {
            const progress = calculateOrderProgress(sale);
            const isComplete = progress === 100;
            const orderedSizes = getOrderedSizes(sale);
            
            const totalOrdered = Object.values(sale.quantities || {}).reduce((sum, qty) => sum + qty, 0);
            const totalShipped = Object.values(sale.shippedQuantities || {}).reduce((sum, qty) => sum + qty, 0);
            const totalRemaining = totalOrdered - totalShipped;

            return (
              <Card key={sale._id || sale.id} className="shadow-sm mb-4">
                <Card.Header className={isComplete ? "bg-success text-white" : "bg-primary text-white"}>
                  <div className="d-flex justify-content-between align-items-center">
                    <h5 className="mb-0">Customer: <strong>{sale.customer}</strong></h5>
                    <Badge bg={isComplete ? "light" : "warning"} text={isComplete ? "dark" : "dark"}>
                      {isComplete ? "SHIPPED" : "PENDING"}
                    </Badge>
                  </div>
                </Card.Header>
                
                <Card.Body>
                  {/* Individual Table for This Customer */}
                  <div className="table-responsive">
                    <table className="table table-bordered table-hover">
                      <thead className="table-dark">
                        <tr>
                          <th>Customer Name</th>
                          <th>Plate Number</th>
                          <th>Date</th>
                          <th>FS Number</th>
                          {/* DYNAMIC HEADERS - Only show sizes this customer ordered */}
                          {orderedSizes.map(item => (
                            <th key={item.size} className="text-center">{item.size}</th>
                          ))}
                          <th>Status</th>
                          <th>Action</th>
                        </tr>
                      </thead>
                      <tbody>
                        <tr>
                          {/* Customer Info */}
                          <td><strong>{sale.customer}</strong></td>
                          <td><code>{sale.plate}</code></td>
                          <td>{new Date(sale.date).toLocaleDateString()}</td>
                          <td><strong>{sale.fs}</strong></td>
                          
                          {/* DYNAMIC QUANTITIES - Only show quantities for sizes this customer ordered */}
                          {orderedSizes.map(item => {
                            const ordered = item.quantity;
                            const shipped = sale.shippedQuantities?.[item.size] || 0;
                            const remaining = ordered - shipped;
                            
                            return (
                              <td key={item.size} className="text-center">
                                <div>
                                  <div className="fw-bold text-primary">{ordered} pcs</div>
                                  {shipped > 0 && (
                                    <div className="text-success small">Shipped: {shipped}</div>
                                  )}
                                  {remaining > 0 && (
                                    <div className="text-warning small">Remaining: {remaining}</div>
                                  )}
                                  {remaining === 0 && shipped > 0 && (
                                    <div className="text-success small">✓ Complete</div>
                                  )}
                                </div>
                              </td>
                            );
                          })}
                          
                          {/* Status */}
                          <td>
                            <Badge bg={isComplete ? "success" : "warning"}>
                              {isComplete ? "Shipped" : "Pending"}
                            </Badge>
                            <div className="progress mt-1" style={{ height: '6px' }}>
                              <div 
                                className={`progress-bar ${isComplete ? 'bg-success' : 'bg-info'}`}
                                style={{ width: `${progress}%` }}
                              ></div>
                            </div>
                            <small className="text-muted">{progress.toFixed(0)}%</small>
                          </td>
                          
                          {/* Action */}
                          <td>
                            <Button 
                              variant="primary" 
                              size="sm"
                              onClick={() => navigate(`/sales/${sale._id || sale.id}`)}
                            >
                              📋 Manage
                            </Button>
                          </td>
                        </tr>
                      </tbody>
                    </table>
                  </div>

                  {/* Progress Summary */}
                  <div className="mt-3 p-3 bg-light rounded">
                    <Row className="text-center">
                      <Col md={4}>
                        <strong className="text-primary">Total Ordered: {totalOrdered} pcs</strong>
                      </Col>
                      <Col md={4}>
                        <strong className="text-success">Total Shipped: {totalShipped} pcs</strong>
                      </Col>
                      <Col md={4}>
                        <strong className="text-warning">Total Remaining: {totalRemaining} pcs</strong>
                      </Col>
                    </Row>
                  </div>
                </Card.Body>
              </Card>
            );
          })}
        </div>
      ) : (
        <Card className="text-center py-5">
          <Card.Body>
            <h4 style={{ color: '#6c757d' }}>No sales orders found</h4>
            <p>Create new sales orders using the "Add Sales" page</p>
            <Button as={Link} to="/add-sales" variant="primary" size="lg">
              💰 Add Your First Sale
            </Button>
          </Card.Body>
        </Card>
      )}

      {/* Summary Statistics */}
      {filteredSales.length > 0 && (
        <Card className="mt-4 bg-light">
          <Card.Body>
            <Row className="text-center">
              <Col md={3}>
                <h5 className="text-primary">Total Orders</h5>
                <h3>{filteredSales.length}</h3>
              </Col>
              <Col md={3}>
                <h5 className="text-success">Shipped</h5>
                <h3>{filteredSales.filter(s => calculateOrderProgress(s) === 100).length}</h3>
              </Col>
              <Col md={3}>
                <h5 className="text-warning">In Progress</h5>
                <h3>{filteredSales.filter(s => calculateOrderProgress(s) > 0 && calculateOrderProgress(s) < 100).length}</h3>
              </Col>
              <Col md={3}>
                <h5 className="text-secondary">Pending</h5>
                <h3>{filteredSales.filter(s => calculateOrderProgress(s) === 0).length}</h3>
              </Col>
            </Row>
          </Card.Body>
        </Card>
      )}
    </Container>
  );
};

export default Sales;