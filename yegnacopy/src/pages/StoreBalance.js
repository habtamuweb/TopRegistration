import React, { useContext } from 'react';
import { Container, Table, Alert } from 'react-bootstrap';
import { AppContext } from '../App';

const StoreBalance = () => {
  const { balances } = useContext(AppContext);

  // Safe default values
  const safeBalances = balances || {
    '8mm': 0, '10mm': 0, '12mm': 0, '14mm': 0,
    '16mm': 0, '20mm': 0, '24mm': 0, '32mm': 0
  };

  const sizes = ['8mm', '10mm', '12mm', '14mm', '16mm', '20mm', '24mm', '32mm'];

  return (
    <Container className="mt-5">
      <h2>Store Balance</h2>
      
      {!balances && (
        <Alert variant="warning" className="mb-4">
          <strong>Loading...</strong> Balance data is being loaded.
        </Alert>
      )}

      <Table striped bordered hover>
        <thead>
          <tr>
            <th>Size</th>
            <th>Balance</th>
          </tr>
        </thead>
        <tbody>
          {sizes.map((size) => (
            <tr key={size}>
              <td>{size}</td>
              <td>{safeBalances[size] || 0}</td>
            </tr>
          ))}
        </tbody>
      </Table>
    </Container>
  );
};

export default StoreBalance;