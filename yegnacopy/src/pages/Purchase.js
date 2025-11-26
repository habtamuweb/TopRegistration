import React, { useContext, useState } from 'react';
import { Container, Form, Table, Button, Alert, Card, Row, Col } from 'react-bootstrap';
import { AppContext } from '../App';

const Purchase = () => {
  const { purchases, deletePurchase } = useContext(AppContext);
  const [searchTerm, setSearchTerm] = useState('');
  const [message, setMessage] = useState('');

  // Safe filtering with proper error handling
  const filteredPurchases = purchases.filter((purchase) => {
    if (!purchase) return false;
    
    const factory = purchase.factory || '';
    const driverName = purchase.driverName || '';
    const plateNo = purchase.plateNo || '';
    const date = purchase.date || '';

    return (
      factory.toLowerCase().includes(searchTerm.toLowerCase()) ||
      driverName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      plateNo.toLowerCase().includes(searchTerm.toLowerCase()) ||
      date.includes(searchTerm)
    );
  });

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this purchase?')) {
      try {
        await deletePurchase(id);
        setMessage('Purchase deleted successfully');
        setTimeout(() => setMessage(''), 3000);
      } catch (error) {
        setMessage('❌ Failed to delete purchase');
        setTimeout(() => setMessage(''), 3000);
      }
    }
  };

  // All rebar sizes for consistent columns
  const allSizes = ['8mm', '10mm', '12mm', '14mm', '16mm', '20mm', '24mm', '32mm'];

  // Calculate totals for summary
  const calculateTotalBySize = (size) => {
    return purchases.reduce((total, purchase) => {
      return total + (purchase.quantities?.[size] || 0);
    }, 0);
  };

  const totalItems = purchases.reduce((total, purchase) => {
    return total + Object.values(purchase.quantities || {}).reduce((sum, qty) => sum + qty, 0);
  }, 0);

  return (
    <Container className="mt-4">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2 className="text-primary">📦 Purchase Imported to Store</h2>
        <Button 
          variant="success" 
          onClick={() => window.location.href = '/add-purchase'}
          size="lg"
        >
          ➕ Add New Purchase
        </Button>
      </div>

      {message && (
        <Alert variant={message.includes('❌') ? 'danger' : 'success'} className="mb-3">
          {message}
        </Alert>
      )}

      {/* Summary Cards */}
      <Row className="mb-4">
        <Col md={3}>
          <Card className="text-center text-white bg-primary">
            <Card.Body>
              <Card.Title>Total Purchases</Card.Title>
              <Card.Text className="h3">{purchases.length}</Card.Text>
            </Card.Body>
          </Card>
        </Col>
        <Col md={3}>
          <Card className="text-center text-white bg-success">
            <Card.Body>
              <Card.Title>Total Items</Card.Title>
              <Card.Text className="h3">{totalItems}</Card.Text>
            </Card.Body>
          </Card>
        </Col>
        <Col md={3}>
          <Card className="text-center text-white bg-info">
            <Card.Body>
              <Card.Title>Factories</Card.Title>
              <Card.Text className="h3">
                {[...new Set(purchases.map(p => p.factory))].length}
              </Card.Text>
            </Card.Body>
          </Card>
        </Col>
        <Col md={3}>
          <Card className="text-center text-white bg-warning">
            <Card.Body>
              <Card.Title>Last Updated</Card.Title>
              <Card.Text className="h6">
                {new Date().toLocaleDateString()}
              </Card.Text>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      <Card className="shadow-sm">
        <Card.Header className="bg-light">
          <Form className="mb-0">
            <Row>
              <Col md={6}>
                <Form.Group>
                  <Form.Label><strong>🔍 Search Purchases</strong></Form.Label>
                  <Form.Control 
                    type="text"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    placeholder="Search by Factory, Driver Name, Plate No, or Date"
                    size="lg"
                  />
                </Form.Group>
              </Col>
              <Col md={6} className="d-flex align-items-end">
                <div className="text-muted">
                  Showing {filteredPurchases.length} of {purchases.length} purchases
                </div>
              </Col>
            </Row>
          </Form>
        </Card.Header>
        <Card.Body className="p-0">
          {filteredPurchases.length > 0 ? (
            <div className="table-responsive">
              <Table striped bordered hover className="mb-0">
                <thead className="table-dark">
                  <tr>
                    <th>🏭 Factory</th>
                    <th>👤 Driver Name</th>
                    <th>🚗 Plate No</th>
                    <th>📅 Date</th>
                    {allSizes.map(size => (
                      <th key={size} className="text-center">{size}</th>
                    ))}
                
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredPurchases.map((purchase) => {
                    if (!purchase) return null;
                    
                    const purchaseTotal = Object.values(purchase.quantities || {}).reduce((sum, qty) => sum + qty, 0);
                    
                    return (
                      <tr key={purchase._id || purchase.id}>
                        <td>
                          <strong className="text-primary">{purchase.factory}</strong>
                        </td>
                        
                        <td>
                          {purchase.driverName ? (
                            <span className="text-success">{purchase.driverName}</span>
                          ) : (
                            <span className="text-muted">-</span>
                          )}
                        </td>
                        
                        <td>
                          {purchase.plateNo ? (
                            <code className="text-info">{purchase.plateNo}</code>
                          ) : (
                            <span className="text-muted">-</span>
                          )}
                        </td>
                        
                        <td>
                          <small>{new Date(purchase.date).toLocaleDateString()}</small>
                        </td>
                        
                        {allSizes.map(size => (
                          <td key={size} className="text-center">
                            {purchase.quantities && purchase.quantities[size] > 0 ? (
                              <strong className="text-success">
                                {purchase.quantities[size]}
                              </strong>
                            ) : (
                              <span className="text-muted">-</span>
                            )}
                          </td>
                        ))}
                        
                        
                        
                        <td>
                          <Button style={{width:'70px',height:'45px'}}
                            variant="danger" 
                            size="sm"
                            onClick={() => handleDelete(purchase._id || purchase.id)}
                            title="Delete this purchase"
                          >
                            🗑️ Delete
                          </Button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
                <tfoot className="table-info">
                  <tr>
                    <td colSpan="4"><strong>Totals</strong></td>
                    {allSizes.map(size => (
                      <td key={size} className="text-center">
                        <strong>{calculateTotalBySize(size)}</strong>
                      </td>
                    ))}
                    <td className="text-center">
                      <strong>{totalItems}</strong>
                    </td>
                    <td></td>
                  </tr>
                </tfoot>
              </Table>
            </div>
          ) : (
            <div className="text-center py-5">
              <h4 style={{ color: '#6c757d' }}>No purchases found</h4>
              <p>Add new purchases using the "Add Imported Purchase" page</p>
              <Button 
                variant="primary" 
                onClick={() => window.location.href = '/add-purchase'}
              >
                ➕ Add Your First Purchase
              </Button>
            </div>
          )}
        </Card.Body>
      </Card>

      {/* Debug Information
      {process.env.NODE_ENV === 'development' && (
        <Card className="mt-3 border-info">
          <Card.Header className="bg-info text-white">
            <strong>🔍 Debug Data</strong>
          </Card.Header>
          <Card.Body>
            <small>
              <strong>Raw Purchases Data:</strong><br />
              {JSON.stringify(purchases.slice(0, 2), null, 2)}
            </small>
          </Card.Body>
        </Card>
      )} */}
    </Container>
  );
};

export default Purchase;