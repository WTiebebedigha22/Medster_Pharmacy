/* eslint-disable no-unused-vars */
import React from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faExclamationTriangle } from '@fortawesome/free-solid-svg-icons';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    console.error('App Error:', error, errorInfo);
    this.setState({ error, errorInfo });
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          minHeight: '100vh',
          flexDirection: 'column',
          padding: '20px',
          textAlign: 'center'
        }}>
          <FontAwesomeIcon icon={faExclamationTriangle} style={{ fontSize: '48px', marginBottom: '16px', color: '#dc2626' }} />
          <h2>Something went wrong</h2>
          <p style={{ color: '#565959', maxWidth: '500px' }}>
            We're sorry for the inconvenience. Please try refreshing the page or contact support if the problem persists.
          </p>
          <button 
            onClick={() => window.location.reload()}
            style={{
              padding: '12px 32px',
              background: '#FFD814',
              border: '1px solid #FCD200',
              borderRadius: '8px',
              fontWeight: 600,
              cursor: 'pointer',
              marginTop: '16px'
            }}
          >
            Refresh Page
          </button>
          <button 
            onClick={() => window.location.href = '/'}
            style={{
              padding: '12px 32px',
              background: 'transparent',
              border: '1px solid #D5D9D9',
              borderRadius: '8px',
              fontWeight: 600,
              cursor: 'pointer',
              marginTop: '8px'
            }}
          >
            Go to Home
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
