import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import { AxiosError } from 'axios';
import { usersApi } from '../services/api';
import { useAuth } from '../contexts/useAuth';
import './AcceptInvitation.scss';

const AcceptInvitation = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  
  const [token, setToken] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);

  // Redirect if already authenticated
  useEffect(() => {
    if (isAuthenticated) {
      navigate('/dashboard');
    }
  }, [isAuthenticated, navigate]);

  // Get token from URL
  useEffect(() => {
    const urlToken = searchParams.get('token');
    if (urlToken) {
      setToken(urlToken);
    }
  }, [searchParams]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!token) {
      setError('Token i ftesës është i nevojshëm');
      return;
    }

    if (!password) {
      setError('Fjalëkalimi është i nevojshëm');
      return;
    }

    if (password.length < 8) {
      setError('Fjalëkalimi duhet të jetë së paku 8 karaktere');
      return;
    }

    if (password !== confirmPassword) {
      setError('Fjalëkalimet nuk përputhen');
      return;
    }

    setError('');
    setSuccess('');
    setIsLoading(true);
    setIsProcessing(true);

    try {
      await usersApi.acceptInvitation({ token, password });
      setSuccess('Ftesa u pranua me sukses! Ju mund të hyni tani në llogarinë tuaj.');
      
      // Redirect to login after 2 seconds
      setTimeout(() => {
        navigate('/login', { 
          state: { 
            message: 'Ftesa u pranua me sukses. Ju lutem hyni në llogarinë tuaj.' 
          } 
        });
      }, 2000);
    } catch (err) {
      const axiosError = err as AxiosError<{ error?: string }>;
      setError(
        axiosError.response?.data?.error || 
        'Token i ftesës është i pavlefshëm ose ka skaduar. Ju lutem kontaktoni administratorin.'
      );
    } finally {
      setIsLoading(false);
      setIsProcessing(false);
    }
  };

  return (
    <div className="accept-invitation-page">
      <div className="accept-invitation-container">
        <div className="accept-invitation-card">
          <h1 className="accept-invitation-title">Prano Ftesën</h1>
          
          {success && (
            <div className="accept-invitation-success">
              <svg
                className="accept-invitation-icon"
                width="48"
                height="48"
                viewBox="0 0 24 24"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
              <p>{success}</p>
              <p className="accept-invitation-redirect">Duke u ridrejtuar te faqja e hyrjes...</p>
            </div>
          )}

          {error && !isProcessing && (
            <div className="accept-invitation-error">
              {error}
            </div>
          )}

          {!success && !isProcessing && (
            <div className="accept-invitation-form-container">
              <p className="accept-invitation-description">
                Ju jeni ftuar të bashkoheni në Faturëime. Ju lutem vendosni fjalëkalimin tuaj për të aktivizuar llogarinë:
              </p>
              
              <form onSubmit={handleSubmit} className="accept-invitation-form">
                {!searchParams.get('token') && (
                  <div className="form-group">
                    <label htmlFor="token" className="form-label">
                      Token i Ftesës
                    </label>
                    <input
                      type="text"
                      id="token"
                      className="form-input"
                      value={token}
                      onChange={(e) => setToken(e.target.value)}
                      required
                      placeholder="Vendosni token-in e ftesës"
                      disabled={isLoading}
                    />
                  </div>
                )}

                <div className="form-group">
                  <label htmlFor="password" className="form-label">
                    Fjalëkalimi
                  </label>
                  <input
                    type="password"
                    id="password"
                    className="form-input"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    minLength={8}
                    placeholder="Minimum 8 karaktere"
                    disabled={isLoading}
                  />
                  <small className="form-hint">Minimum 8 karaktere</small>
                </div>

                <div className="form-group">
                  <label htmlFor="confirmPassword" className="form-label">
                    Konfirmo Fjalëkalimin
                  </label>
                  <input
                    type="password"
                    id="confirmPassword"
                    className="form-input"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    required
                    minLength={8}
                    placeholder="Konfirmo fjalëkalimin"
                    disabled={isLoading}
                  />
                </div>

                <button
                  type="submit"
                  className="btn btn--primary btn--full"
                  disabled={isLoading || !token || !password || password !== confirmPassword}
                >
                  {isLoading ? 'Duke u procesuar...' : 'Prano Ftesën'}
                </button>
              </form>
            </div>
          )}

          {isProcessing && (
            <div className="accept-invitation-loading">
              <div className="spinner"></div>
              <p>Duke u procesuar...</p>
            </div>
          )}

          <div className="accept-invitation-footer">
            <p className="accept-invitation-footer-text">
              <Link to="/login" className="accept-invitation-footer-link">
                Kthehu te faqja e hyrjes
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AcceptInvitation;
