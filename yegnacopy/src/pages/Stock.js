import React, { useContext } from 'react';
import { Container, Table, Card, Row, Col, Alert } from 'react-bootstrap';
import { AppContext } from '../App';

const Stock = () => {
  const { factoryStockTotals } = useContext(AppContext);

  // Safe default values
  const safeFactoryStockTotals = factoryStockTotals || {
    '8mm': 0, '10mm': 0, '12mm': 0, '14mm': 0,
    '16mm': 0, '20mm': 0, '24mm': 0, '32mm': 0
  };

  const calculateStockBySize = (size) => {
    return safeFactoryStockTotals[size] || 0;
  };

  const sizes = ['8mm', '10mm', '12mm', '14mm', '16mm', '20mm', '24mm', '32mm'];
  
  const totalStock = sizes.reduce((total, size) => total + calculateStockBySize(size), 0);

  return (
    <Container className="mt-5">
      <h2>Stock - Total Rebar from Factory</h2>
      
      {!factoryStockTotals && (
        <Alert variant="warning" className="mb-4">
          <strong>Loading...</strong> Stock data is being loaded.
        </Alert>
      )}

      {/* Summary Cards */}
      <Row className="mb-4">
        <Col md={6} lg={3} className="mb-3">
          <Card className="text-center bg-primary text-white">
            <Card.Body>
              <Card.Title>Total Stock</Card.Title>
              <Card.Text className="h3">{totalStock}</Card.Text>
              <Card.Text>Total Pieces</Card.Text>
            </Card.Body>
          </Card>
        </Col>
        <Col md={6} lg={3} className="mb-3">
          <Card className="text-center bg-success text-white">
            <Card.Body>
              <Card.Title>Total Sizes</Card.Title>
              <Card.Text className="h3">{sizes.length}</Card.Text>
              <Card.Text>Different Sizes</Card.Text>
            </Card.Body>
          </Card>
        </Col>
        <Col md={6} lg={3} className="mb-3">
          <Card className="text-center bg-info text-white">
            <Card.Body>
              <Card.Title>Average per Size</Card.Title>
              <Card.Text className="h3">
                {Math.round(totalStock / sizes.length)}
              </Card.Text>
              <Card.Text>Pieces Average</Card.Text>
            </Card.Body>
          </Card>
        </Col>
        <Col md={6} lg={3} className="mb-3">
          <Card className="text-center bg-warning text-dark">
            <Card.Body>
              <Card.Title>Last Updated</Card.Title>
              <Card.Text className="h6">
                {new Date().toLocaleDateString()}
              </Card.Text>
              <Card.Text>Real-time Data</Card.Text>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      <Table striped bordered hover responsive>
        <thead className="table-dark">
          <tr>
            <th>Rebar Size</th>
            <th>Quantity (Pieces)</th>
            <th>Percentage of Total</th>
            <th>Status</th>
          </tr>
        </thead>
        <tbody>
          {sizes.map((size) => {
            const quantity = calculateStockBySize(size);
            const percentage = totalStock > 0 ? ((quantity / totalStock) * 100).toFixed(2) : 0;
            let status = 'Good';
            let statusVariant = 'success';
            
            if (quantity === 0) {
              status = 'Out of Stock';
              statusVariant = 'danger';
            } else if (quantity < 10) {
              status = 'Low Stock';
              statusVariant = 'warning';
            }
            
            return (
              <tr key={size}>
                <td><strong>{size}</strong></td>
                <td>
                  <span className={quantity === 0 ? 'text-danger fw-bold' : 'text-success fw-bold'}>
                    {quantity}
                  </span>
                </td>
                <td>{percentage}%</td>
                <td>
                  <span className={`badge bg-${statusVariant}`}>
                    {status}
                  </span>
                </td>
              </tr>
            );
          })}
        </tbody>
        <tfoot className="table-info">
          <tr>
            <td><strong>Grand Total</strong></td>
            <td><strong>{totalStock}</strong></td>
            <td><strong>100%</strong></td>
            <td></td>
          </tr>
        </tfoot>
      </Table>
    </Container>
  );
};

export default Stock;