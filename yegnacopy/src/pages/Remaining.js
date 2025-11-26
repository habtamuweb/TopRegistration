import React, { useContext } from 'react';
import { Container, Table, Card, Row, Col, Badge, Alert } from 'react-bootstrap';
import { AppContext } from '../App';

const Remaining = () => {
  const { sales } = useContext(AppContext);

  // Get only sales that have remaining quantities
  const getSalesWithRemaining = () => {
    return sales.filter(sale => {
      if (!sale.quantities) return false;
      
      return Object.entries(sale.quantities).some(([size, ordered]) => {
        const shipped = sale.shippedQuantities?.[size] || 0;
        return ordered - shipped > 0;
      });
    });
  };

  const salesWithRemaining = getSalesWithRemaining();

  // Get all sizes that appear in any sale (only show sizes that were actually ordered)
  const getAllOrderedSizes = () => {
    const sizes = new Set();
    sales.forEach(sale => {
      if (sale.quantities) {
        Object.keys(sale.quantities).forEach(size => {
          sizes.add(size);
        });
      }
    });
    return Array.from(sizes).sort();
  };

  const orderedSizes = getAllOrderedSizes();

  // Calculate total remaining for each size
  const calculateTotalRemaining = (size) => {
    return sales.reduce((total, sale) => {
      const ordered = sale.quantities?.[size] || 0;
      const shipped = sale.shippedQuantities?.[size] || 0;
      return total + (ordered - shipped);
    }, 0);
  };

  // Calculate summary statistics
  const totalOrders = salesWithRemaining.length;
  const totalRemainingItems = salesWithRemaining.reduce((total, sale) => {
    return total + Object.entries(sale.quantities || {}).reduce((sum, [size, ordered]) => {
      const shipped = sale.shippedQuantities?.[size] || 0;
      return sum + (ordered - shipped);
    }, 0);
  }, 0);

  return (
    <Container className="mt-4">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2 className="text-warning">⏳ Remaining Orders</h2>
        <Badge bg="warning" className="fs-6">
          {totalOrders} Pending Orders
        </Badge>
      </div>

      {/* Summary Cards */}
      <Row className="mb-4">
        <Col md={4}>
          <Card className="text-center text-white bg-warning">
            <Card.Body>
              <Card.Title>Pending Orders</Card.Title>
              <Card.Text className="h3">{totalOrders}</Card.Text>
              <Card.Text>Orders to be Shipped</Card.Text>
            </Card.Body>
          </Card>
        </Col>
        <Col md={4}>
          <Card className="text-center text-white bg-info">
            <Card.Body>
              <Card.Title>Total Remaining</Card.Title>
              <Card.Text className="h3">{totalRemainingItems}</Card.Text>
              <Card.Text>Pieces to Ship</Card.Text>
            </Card.Body>
          </Card>
        </Col>
        <Col md={4}>
          <Card className="text-center text-white bg-success">
            <Card.Body>
              <Card.Title>Rebar Sizes</Card.Title>
              <Card.Text className="h3">{orderedSizes.length}</Card.Text>
              <Card.Text>Different Sizes</Card.Text>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {salesWithRemaining.length > 0 ? (
        <Card className="shadow-sm">
          <Card.Header className="bg-light">
            <h5 className="mb-0">📋 Orders Pending Shipment</h5>
            <small className="text-muted">
              Showing {salesWithRemaining.length} orders with remaining quantities
            </small>
          </Card.Header>
          <Card.Body className="p-0">
            <div className="table-responsive">
              <Table striped bordered hover className="mb-0">
                <thead className="table-dark">
                  <tr>
                    <th>Date</th>
                    <th>Customer</th>
                    <th>Plate</th>
                    <th>FS</th>
                    {orderedSizes.map(size => (
                      <th key={size} className="text-center">{size}</th>
                    ))}
                    <th className="text-center">Total Remaining</th>
                    <th className="text-center">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {salesWithRemaining.map((sale) => {
                    // Calculate remaining quantities for this sale
                    const remainingQuantities = {};
                    let totalRemainingForSale = 0;

                    orderedSizes.forEach(size => {
                      const ordered = sale.quantities?.[size] || 0;
                      const shipped = sale.shippedQuantities?.[size] || 0;
                      const remaining = Math.max(0, ordered - shipped);
                      remainingQuantities[size] = remaining;
                      totalRemainingForSale += remaining;
                    });

                    // Calculate completion percentage
                    const totalOrdered = Object.values(sale.quantities || {}).reduce((sum, qty) => sum + qty, 0);
                    const totalShipped = Object.values(sale.shippedQuantities || {}).reduce((sum, qty) => sum + qty, 0);
                    const completionPercentage = totalOrdered > 0 ? (totalShipped / totalOrdered) * 100 : 0;

                    return (
                      <tr key={sale._id || sale.id}>
                        <td>
                          <small>{new Date(sale.date).toLocaleDateString()}</small>
                        </td>
                        <td>
                          <strong className="text-primary">{sale.customer}</strong>
                        </td>
                        <td>
                          <code className="text-info">{sale.plate}</code>
                        </td>
                        <td>
                          <strong>{sale.fs}</strong>
                        </td>
                        {orderedSizes.map(size => (
                          <td key={size} className="text-center">
                            {remainingQuantities[size] > 0 ? (
                              <strong className="text-warning">
                                {remainingQuantities[size]}
                              </strong>
                            ) : (
                              <span className="text-muted">-</span>
                            )}
                          </td>
                        ))}
                        <td className="text-center">
                          <Badge bg="warning" className="fs-6">
                            {totalRemainingForSale}
                          </Badge>
                        </td>
                        <td className="text-center">
                          <div className="progress" style={{ height: '8px', width: '80px', margin: '0 auto' }}>
                            <div 
                              className="progress-bar bg-success" 
                              style={{ width: `${completionPercentage}%` }}
                            ></div>
                          </div>
                          <small className="text-muted">
                            {completionPercentage.toFixed(0)}%
                          </small>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
                <tfoot className="table-info">
                  <tr>
                    <td colSpan="4" className="text-end">
                      <strong>Total Remaining:</strong>
                    </td>
                    {orderedSizes.map(size => (
                      <td key={size} className="text-center">
                        <strong>{calculateTotalRemaining(size)}</strong>
                      </td>
                    ))}
                    <td className="text-center">
                      <strong>{totalRemainingItems}</strong>
                    </td>
                    <td></td>
                  </tr>
                </tfoot>
              </Table>
            </div>
          </Card.Body>
        </Card>
      ) : (
        <Card className="text-center py-5">
          <Card.Body>
            <h4 style={{ color: '#6c757d' }}>🎉 No Remaining Orders!</h4>
            <p>All orders have been completely shipped.</p>
            <Alert variant="success" className="mt-3">
              <strong>Great job!</strong> All customer orders are fulfilled.
            </Alert>
          </Card.Body>
        </Card>
      )}

      {/* Information Card */}
      <Card className="mt-4 bg-light">
        <Card.Body>
          <h6>💡 About Remaining Orders</h6>
          <p className="mb-0 small">
            This page shows all sales orders that still have quantities waiting to be shipped. 
            Each order displays the remaining pieces for each rebar size that needs to be delivered to customers.
          </p>
        </Card.Body>
      </Card>
    </Container>
  );
};

export default Remaining;