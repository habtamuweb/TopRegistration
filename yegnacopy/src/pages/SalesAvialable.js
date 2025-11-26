import React, { useContext } from 'react';
import { Container, Table, Alert, Card } from 'react-bootstrap';
import { AppContext } from '../App';

const SalesAvailable = () => {
  const { factoryStockTotals, purchasedTotals } = useContext(AppContext);

  // Safe default values
  const safeFactoryStockTotals = factoryStockTotals || {
    '8mm': 0, '10mm': 0, '12mm': 0, '14mm': 0,
    '16mm': 0, '20mm': 0, '24mm': 0, '32mm': 0
  };

  const safePurchasedTotals = purchasedTotals || {
    '8mm': 0, '10mm': 0, '12mm': 0, '14mm': 0,
    '16mm': 0, '20mm': 0, '24mm': 0, '32mm': 0
  };

  // Calculate available for sale (Stock - Total Purchase)
  const calculateAvailableBySize = (size) => {
    const stock = safeFactoryStockTotals[size] || 0;
    const purchased = safePurchasedTotals[size] || 0;
    return stock - purchased;
  };

  const sizes = ['8mm', '10mm', '12mm', '14mm', '16mm', '20mm', '24mm', '32mm'];

  // Calculate totals
  const totalStock = sizes.reduce((sum, size) => sum + (safeFactoryStockTotals[size] || 0), 0);
  const totalPurchase = sizes.reduce((sum, size) => sum + (safePurchasedTotals[size] || 0), 0);
  const totalAvailable = sizes.reduce((sum, size) => sum + calculateAvailableBySize(size), 0);

  return (
    <Container className="mt-5">
      <h2>Sales Available</h2>
      
      {(!factoryStockTotals || !purchasedTotals) && (
        <Alert variant="info" className="mb-4">
          <strong>Loading data...</strong> Please wait while we load the latest stock information.
        </Alert>
      )}

      <Alert variant="info" className="mb-4">
        <strong>Formula:</strong> Available for Sale = Total Stock (from Factory) - Total Imported Purchase
      </Alert>

      {/* Summary Cards */}
      <div className="row mb-4">
        <div className="col-md-4">
          <Card className="text-center">
            <Card.Body>
              <Card.Title>Total Stock</Card.Title>
              <Card.Text className="h4 text-primary">{totalStock}</Card.Text>
              <Card.Text>From Factory Purchases</Card.Text>
            </Card.Body>
          </Card>
        </div>
        <div className="col-md-4">
          <Card className="text-center">
            <Card.Body>
              <Card.Title>Total Imported Purchase</Card.Title>
              <Card.Text className="h4 text-warning">{totalPurchase}</Card.Text>
              <Card.Text>Purchased & Imported to Store</Card.Text>
            </Card.Body>
          </Card>
        </div>
        <div className="col-md-4">
          <Card className="text-center">
            <Card.Body>
              <Card.Title>Available for Sale</Card.Title>
              <Card.Text className="h4 text-success">{totalAvailable}</Card.Text>
              <Card.Text>Stock - Imported Purchase</Card.Text>
            </Card.Body>
          </Card>
        </div>
      </div>

      <Table striped bordered hover responsive>
        <thead className="table-dark">
          <tr>
            <th>Rebar Size</th>
            <th>Total Stock (Factory)</th>
            <th>Total Imported Purchase</th>
            <th>Available for Sale</th>
            <th>Status</th>
          </tr>
        </thead>
        <tbody>
          {sizes.map((size) => {
            const stock = safeFactoryStockTotals[size] || 0;
            const purchased = safePurchasedTotals[size] || 0;
            const available = calculateAvailableBySize(size);
            
            let status = 'Available';
            let statusVariant = 'success';
            
            if (available === 0) {
              status = 'No Stock';
              statusVariant = 'secondary';
            } else if (available < 0) {
              status = 'Shortage';
              statusVariant = 'danger';
            } else if (available < 10) {
              status = 'Low Stock';
              statusVariant = 'warning';
            }

            return (
              <tr key={size}>
                <td><strong>{size}</strong></td>
                <td>{stock}</td>
                <td>{purchased}</td>
                <td>
                  <strong className={
                    available < 0 ? 'text-danger' : 
                    available === 0 ? 'text-secondary' : 
                    available < 10 ? 'text-warning' : 
                    'text-success'
                  }>
                    {available}
                  </strong>
                </td>
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
            <td><strong>{totalPurchase}</strong></td>
            <td><strong>{totalAvailable}</strong></td>
            <td></td>
          </tr>
        </tfoot>
      </Table>
    </Container>
  );
};

export default SalesAvailable;