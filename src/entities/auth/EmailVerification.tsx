import { useState, useEffect, useCallback } from 'react';
import { useNavigate, useSearchParams, useLocation, Link } from 'react-router-dom';
import { AxiosError } from 'axios';
import { useAuth } from '../../contexts/useAuth';
import './EmailVerification.scss';

const EmailVerification = () => {
  const [searchParams] = useSearchParams();
  const location = useLocation();
  const navigate = useNavigate();
  const { verifyEmail, isAuthenticated } = useAuth();
  
  const [token, setToken] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);

  // Get message and email from navigation state (from signup)
  const signupMessage = location.state?.message;
  const signupEmail = location.state?.email;

  const handleVerify = useCallback(async (verifyToken?: string) => {
    const tokenToVerify = verifyToken || token;
    
    if (!tokenToVerify) {
      setError('Ju lutem vendosni token-in e verifikimit');
      return;
    }

    setError('');
    setSuccess('');
    setIsLoading(true);
    setIsVerifying(true);

    try {
      const response = await verifyEmail({ token: tokenToVerify });
      setSuccess(response.message || 'Email-i u verifikua me sukses!');
      
      // Redirect to login after 2 seconds
      setTimeout(() => {
        navigate('/login', { 
          state: { 
            message: 'Email-i u verifikua me sukses. Ju lutem hyni në llogarinë tuaj.' 
          } 
        });
      }, 2000);
    } catch (err) {
      const axiosError = err as AxiosError<{ error?: string }>;
      setError(
        axiosError.response?.data?.error || 
        'Token i verifikimit është i pavlefshëm ose ka skaduar. Ju lutem provoni përsëri.'
      );
    } finally {
      setIsLoading(false);
      setIsVerifying(false);
    }
  }, [token, verifyEmail, navigate]);

  // Redirect if already authenticated
  useEffect(() => {
    if (isAuthenticated) {
      navigate('/businesses');
    }
  }, [isAuthenticated, navigate]);

  // Auto-verify if token is in URL
  useEffect(() => {
    const urlToken = searchParams.get('token');
    if (urlToken) {
      setToken(urlToken);
      handleVerify(urlToken);
    }
  }, [searchParams, handleVerify]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    handleVerify();
  };

  return (
    <div className="verify-page">
      <div className="verify-container">
        <div className="verify-card">
          {signupMessage && (
            <div className="verify-info">
              <p>{signupMessage}</p>
              {signupEmail && (
                <p className="verify-email">Email: <strong>{signupEmail}</strong></p>
              )}
              <p className="verify-instruction">
                Ju lutem kontrolloni email-in tuaj dhe klikoni në linkun e verifikimit.
              </p>
            </div>
          )}

          {success && (
            <div className="verify-success">
              <svg
                className="verify-icon"
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
              <p className="verify-redirect">Duke u ridrejtuar te faqja e hyrjes...</p>
            </div>
          )}

          {error && !isVerifying && (
            <div className="verify-error">
              {error}
            </div>
          )}

          {!success && !isVerifying && (
            <div className="verify-form-container">
              <p className="verify-description">
                Nëse keni marrë email-in e verifikimit, vendosni token-in këtu:
              </p>
              
              <form onSubmit={handleSubmit} className="verify-form">
                <div className="form-group">
                  <label htmlFor="token" className="form-label">
                    Token i Verifikimit
                  </label>
                  <input
                    type="text"
                    id="token"
                    className="form-input"
                    value={token}
                    onChange={(e) => setToken(e.target.value)}
                    required
                    placeholder="Vendosni token-in e verifikimit"
                    disabled={isLoading}
                  />
                </div>

                <button
                  type="submit"
                  className="btn btn--primary btn--full"
                  disabled={isLoading || !token}
                >
                  {isLoading ? 'Duke u verifikuar...' : 'Verifiko Email-in'}
                </button>
              </form>
            </div>
          )}

          {isVerifying && (
            <div className="verify-loading">
              <div className="spinner"></div>
              <p>Duke u verifikuar...</p>
            </div>
          )}

          <div className="verify-footer">
            <p className="verify-footer-text">
              <Link to="/login" className="verify-footer-link">
                Kthehu te faqja e hyrjes
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EmailVerification;
