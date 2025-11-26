import React, { useState, useContext } from 'react';
import { Container, Form, Button, Card, Alert, InputGroup } from 'react-bootstrap';
import { AppContext } from '../App';

const ChangePassword = () => {
  const { changePassword, user, logout } = useContext(AppContext);
  const [formData, setFormData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');

    // Validation
    if (formData.newPassword !== formData.confirmPassword) {
      setMessage('❌ New passwords do not match');
      setLoading(false);
      return;
    }

    if (formData.newPassword.length < 3) {
      setMessage('❌ Password must be at least 3 characters long');
      setLoading(false);
      return;
    }

    if (formData.currentPassword === formData.newPassword) {
      setMessage('❌ New password must be different from current password');
      setLoading(false);
      return;
    }

    // Change password
    const result = await changePassword(formData.currentPassword, formData.newPassword);
    
    if (result.success) {
      setMessage('✅ Password changed successfully! Please log in again with your new password.');
      
      // Clear form
      setFormData({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
      });

      // Logout after successful password change (security best practice)
      setTimeout(() => {
        logout();
      }, 3000);
    } else {
      setMessage(`❌ ${result.message || 'Password change failed'}`);
    }
    
    setLoading(false);
  };

  return (
    <Container className="mt-5">
      <Card>
        <Card.Body>
          <h2 className="text-center mb-4">Change Password</h2>
          <p className="text-center text-muted">
            Changing password for: <strong>{user?.username}</strong> (Role: <strong>{user?.role}</strong>)
          </p>
          
          {message && (
            <Alert variant={message.includes('✅') ? 'success' : 'danger'}>
              {message}
            </Alert>
          )}
          
          <Form onSubmit={handleSubmit}>
            <Form.Group className="mb-3">
              <Form.Label>Current Password</Form.Label>
              <InputGroup>
                <Form.Control
                  type={showCurrentPassword ? "text" : "password"}
                  name="currentPassword"
                  value={formData.currentPassword}
                  onChange={handleChange}
                  placeholder="Enter current password"
                  required
                />
                <Button
                  variant="outline-secondary"
                  onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                >
                  {showCurrentPassword ? 'Hide' : 'Show'}
                </Button>
              </InputGroup>
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>New Password</Form.Label>
              <InputGroup>
                <Form.Control
                  type={showNewPassword ? "text" : "password"}
                  name="newPassword"
                  value={formData.newPassword}
                  onChange={handleChange}
                  placeholder="Enter new password (min 3 characters)"
                  required
                  minLength="3"
                />
                <Button
                  variant="outline-secondary"
                  onClick={() => setShowNewPassword(!showNewPassword)}
                >
                  {showNewPassword ? 'Hide' : 'Show'}
                </Button>
              </InputGroup>
              <Form.Text className="text-muted">
                Password must be at least 3 characters long.
              </Form.Text>
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Confirm New Password</Form.Label>
              <InputGroup>
                <Form.Control
                  type={showConfirmPassword ? "text" : "password"}
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  placeholder="Confirm new password"
                  required
                />
                <Button
                  variant="outline-secondary"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                >
                  {showConfirmPassword ? 'Hide' : 'Show'}
                </Button>
              </InputGroup>
            </Form.Group>

            <Button
              variant="primary"
              type="submit"
              className="w-100"
              disabled={loading}
            >
              {loading ? 'Changing Password...' : 'Change Password'}
            </Button>
          </Form>

          <div className="mt-3 text-center">
            <small className="text-muted">
              <strong>Note:</strong> You will be automatically logged out after changing your password for security reasons.
            </small>
          </div>
        </Card.Body>
      </Card>
    </Container>
  );
};

export default ChangePassword;