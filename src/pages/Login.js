import React, { useState, useEffect } from 'react';
import { Container, Card, Form, Button, Alert, Row, Col, Spinner, Modal } from 'react-bootstrap';
import { useAuth } from '../pages/AuthContext';

const Login = () => {
  const [selectedRole, setSelectedRole] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [setupLoading, setSetupLoading] = useState(false);
  const [showSetupModal, setShowSetupModal] = useState(false);
  const [setupMessage, setSetupMessage] = useState('');
  const { login } = useAuth();

  // Role configurations
  const roles = [
    { 
      value: 'admin', 
      label: '👑 System Administrator', 
      password: '0521',
      description: 'Full access to all system features'
    },
    { 
      value: 'warehouse_manager', 
      label: '🏭 Warehouse Manager', 
      password: '0621',
      description: 'Manage inventory, shipments, and factory purchases'
    },
    { 
      value: 'sales_person', 
      label: '💰 Sales Person', 
      password: '0721',
      description: 'Add sales and manage customer orders'
    },
    { 
      value: 'manager', 
      label: '📊 General Manager', 
      password: '0821',
      description: 'View all reports and analytics'
    }
  ];

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    
    if (!selectedRole) {
      setError('Please select your role');
      return;
    }

    setLoading(true);

    const selectedRoleConfig = roles.find(role => role.value === selectedRole);
    const username = 'yegna';
    const password = selectedRoleConfig.password;

    console.log('🔐 Logging in as:', selectedRoleConfig.label);

    const result = await login(username, password);
    
    if (!result.success) {
      setError(result.message);
    }
    
    setLoading(false);
  };

  const handleSetupUsers = async () => {
    setSetupLoading(true);
    setSetupMessage('🔄 Creating users in MongoDB Atlas...');
    
    try {
      const response = await fetch('/api/auth/setup-users', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      const data = await response.json();

      if (data.success) {
        setSetupMessage('✅ Users created successfully! You can now login.');
        setTimeout(() => {
          setShowSetupModal(false);
        }, 3000);
      } else {
        setSetupMessage('❌ Failed to create users: ' + data.message);
      }
    } catch (error) {
      setSetupMessage('❌ Cannot connect to server. Make sure backend is running on port 5000');
    } finally {
      setSetupLoading(false);
    }
  };

  return (
    <>
      <Container fluid className="bg-light min-vh-100 d-flex align-items-center">
        <Container>
          <Row className="justify-content-center">
            <Col md={8} lg={6}>
              <Card className="shadow-lg">
                <Card.Header className="bg-primary text-white text-center py-4">
                  <h2 className="mb-0">🏗️ Yegna Rebar Management</h2>
                  <p className="mb-0 mt-2">Select Your Role to Continue</p>
                </Card.Header>
                <Card.Body className="p-4">
                  {error && (
                    <Alert variant="danger" className="mb-3">
                      {error}
                    </Alert>
                  )}

                  <Form onSubmit={handleSubmit}>
                    <Form.Group className="mb-4">
                      <Form.Label>
                        <h5>👤 Select Your Role</h5>
                      </Form.Label>
                      <div className="role-selection">
                        {roles.map((role) => (
                          <Card 
                            key={role.value}
                            className={`mb-3 role-card ${selectedRole === role.value ? 'border-primary bg-light' : ''}`}
                            style={{ cursor: 'pointer' }}
                            onClick={() => setSelectedRole(role.value)}
                          >
                            <Card.Body>
                              <div className="d-flex align-items-center">
                                <Form.Check 
                                  type="radio"
                                  name="role"
                                  value={role.value}
                                  checked={selectedRole === role.value}
                                  onChange={() => setSelectedRole(role.value)}
                                  className="me-3"
                                />
                                <div>
                                  <h6 className="mb-1">{role.label}</h6>
                                  <p className="text-muted mb-1 small">{role.description}</p>
                                  <div className="text-info small">
                                    <strong>Auto-login with password: {role.password}</strong>
                                  </div>
                                </div>
                              </div>
                            </Card.Body>
                          </Card>
                        ))}
                      </div>
                    </Form.Group>

                    <Button 
                      variant="primary" 
                      type="submit" 
                      className="w-100 py-3"
                      disabled={loading || !selectedRole}
                      size="lg"
                    >
                      {loading ? (
                        <>
                          <Spinner animation="border" size="sm" className="me-2" />
                          Signing In as {roles.find(r => r.value === selectedRole)?.label}...
                        </>
                      ) : (
                        `🚀 Sign In as ${selectedRole ? roles.find(r => r.value === selectedRole)?.label : 'User'}`
                      )}
                    </Button>
                  </Form>

                  {/* Current Database Status */}
                  <Card className="mt-4 bg-info text-white">
                    <Card.Body className="text-center">
                      <h6>📊 Database Status</h6>
                      <p className="mb-0">Connected to MongoDB Atlas Cloud</p>
                      <small>4 users available in database</small>
                    </Card.Body>
                  </Card>

                  {/* Setup Button */}
                  <div className="text-center mt-3">
                    <Button 
                      variant="outline-light" 
                      size="sm"
                      onClick={() => setShowSetupModal(true)}
                    >
                      🔧 Re-create Users
                    </Button>
                  </div>
                </Card.Body>
              </Card>
            </Col>
          </Row>
        </Container>
      </Container>

      {/* Setup Modal */}
      <Modal show={showSetupModal} onHide={() => setShowSetupModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>🔧 Re-create Users</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {setupMessage && (
            <Alert variant={setupMessage.includes('✅') ? 'success' : 'warning'}>
              {setupMessage}
            </Alert>
          )}
          
          {!setupMessage && (
            <>
              <p>This will re-create all users in the database:</p>
              <ul>
                {roles.map(role => (
                  <li key={role.value}>
                    <strong>{role.label}:</strong> Password: {role.password}
                  </li>
                ))}
              </ul>
              <Alert variant="warning">
                <strong>Note:</strong> This will delete any existing users and create new ones.
              </Alert>
            </>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowSetupModal(false)}>
            Cancel
          </Button>
          <Button variant="primary" onClick={handleSetupUsers} disabled={setupLoading}>
            {setupLoading ? (
              <>
                <Spinner animation="border" size="sm" className="me-2" />
                Creating Users...
              </>
            ) : (
              '✅ Re-create Users'
            )}
          </Button>
        </Modal.Footer>
      </Modal>
    </>
  );
};

export default Login;