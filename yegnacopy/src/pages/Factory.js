import React, { useContext, useState } from 'react';
import { Container, Table, Form, Button, Alert } from 'react-bootstrap';
import { AppContext } from '../App';

const Factory = () => {
  const { factoryPurchases, setFactoryPurchases } = useContext(AppContext);
  const [searchTerm, setSearchTerm] = useState('');
  const [message, setMessage] = useState('');

  const filteredPurchases = factoryPurchases.filter((purchase) => {
    return purchase.factoryName.toLowerCase().includes(searchTerm.toLowerCase());
  });

  const handleDelete = (id) => {
    if (window.confirm('Are you sure you want to delete this factory purchase?')) {
      setFactoryPurchases(prev => prev.filter(purchase => purchase.id !== id));
      setMessage('Factory purchase deleted successfully');
      setTimeout(() => setMessage(''), 3000);
    }
  };

  const calculateTotalBySize = (size) => {
    return factoryPurchases.reduce((total, purchase) => {
      return total + (purchase.quantities[size] || 0);
    }, 0);
  };

  const sizes = ['8mm', '10mm', '12mm', '14mm', '16mm', '20mm', '24mm', '32mm'];

  return (
    <Container className="mt-5">
      <h2>Factory Purchases</h2>
      
      {message && <Alert variant="success">{message}</Alert>}

      <Form className="mb-4">
        <Form.Group>
          <Form.Label>Search Factory Purchases</Form.Label>
          <Form.Control
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search by factory name"
            style={{ maxWidth: '400px' }}
          />
        </Form.Group>
      </Form>

      {filteredPurchases.length > 0 ? (
        <Table striped bordered hover responsive>
          <thead className="table-dark">
            <tr>
              <th>Factory Name</th>
              <th>Date</th>
              {sizes.map(size => (
                <th key={size}>{size}</th>
              ))}
              <th>Total Items</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredPurchases.map((purchase) => {
              const totalItems = Object.values(purchase.quantities).reduce((sum, qty) => sum + qty, 0);
              
              return (
                <tr key={purchase.id}>
                  <td>
                    <strong>{purchase.factoryName}</strong>
                  </td>
                  <td>{purchase.date}</td>
                  {sizes.map(size => (
                    <td key={size}>
                      {purchase.quantities[size] > 0 ? (
                        <span className="text-primary fw-bold">
                          {purchase.quantities[size]}
                        </span>
                      ) : (
                        <span className="text-muted">-</span>
                      )}
                    </td>
                  ))}
                  <td>
                    <strong>{totalItems}</strong>
                  </td>
                  <td>
                    <Button 
                      variant="danger" 
                      size="sm"
                      onClick={() => handleDelete(purchase.id)}
                    >
                      Delete
                    </Button>
                  </td>
                </tr>
              );
            })}
          </tbody>
          <tfoot className="table-info">
            <tr>
              <td colSpan="2"><strong>Total</strong></td>
              {sizes.map(size => (
                <td key={size}><strong>{calculateTotalBySize(size)}</strong></td>
              ))}
              <td><strong>
                {sizes.reduce((total, size) => total + calculateTotalBySize(size), 0)}
              </strong></td>
              <td></td>
            </tr>
          </tfoot>
        </Table>
      ) : (
        <div className="text-center mt-5">
          <h4 style={{ color: '#6c757d' }}>No factory purchases found</h4>
          <p>Add factory purchases using the "Factory Purchase" page</p>
        </div>
      )}
    </Container>
  );
};

export default Factory;