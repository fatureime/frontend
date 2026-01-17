import { useState, useEffect, FormEvent } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { AxiosError } from 'axios';
import { useAuth } from '../../contexts/useAuth';
import { businessesApi } from '../../services/api';
import './Login.scss';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isRedirecting, setIsRedirecting] = useState(false);
  
  const { login, isAuthenticated, user } = useAuth();
  const navigate = useNavigate();

  // Redirect if already authenticated
  useEffect(() => {
    const redirectToInvoices = async () => {
      if (isAuthenticated && !isRedirecting) {
        setIsRedirecting(true);
        try {
          // Try to use issuer business first, otherwise get first business
          const issuerBusinessId = user?.tenant?.issuer_business_id;
          if (issuerBusinessId) {
            navigate('/invoices');
            return;
          }

          // Fetch businesses to get the first one
          const businesses = await businessesApi.getBusinesses();
          if (businesses.length > 0) {
            navigate('/invoices');
          } else {
            // No businesses, redirect to businesses page to create one
            navigate('/businesses');
          }
        } catch (err) {
          // If fetching fails, redirect to businesses page
          navigate('/businesses');
        }
      }
    };

    redirectToInvoices();
  }, [isAuthenticated, user, navigate]);

  if (isAuthenticated) {
    return (
      <div className="login-page">
        <div className="login-container">
          <div className="login-card">
            <div className="loading">Duke u ridrejtuar...</div>
          </div>
        </div>
      </div>
    );
  }

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      await login({
        email,
        password,
        remember_me: rememberMe,
      });
      // The useEffect will handle redirect to invoices page after login
      // when isAuthenticated becomes true
    } catch (err) {
      const axiosError = err as AxiosError<{ error?: string }>;
      setError(
        axiosError.response?.data?.error || 
        'Ndodhi një gabim gjatë hyrjes. Ju lutem provoni përsëri.'
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="login-page">
      <div className="login-container">
        <div className="login-card">
          <p className="login-subtitle">Hyni në llogarinë tuaj për të vazhduar</p>

          {error && (
            <div className="login-error">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="login-form">
            <div className="form-group">
              <label htmlFor="email" className="form-label">
                Email
              </label>
              <input
                type="email"
                id="email"
                className="form-input"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                placeholder="email@example.com"
                disabled={isLoading}
              />
            </div>

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
                placeholder="••••••••"
                disabled={isLoading}
              />
            </div>

            <div className="form-group form-group--checkbox">
              <label className="checkbox-label">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  disabled={isLoading}
                  className="checkbox-input"
                />
                <span className="checkbox-text">Më mbaj mend</span>
              </label>
            </div>

            <button
              type="submit"
              className="btn btn--primary btn--full"
              disabled={isLoading}
            >
              {isLoading ? 'Duke u kyçur...' : 'Hyr'}
            </button>
          </form>

          <div className="login-footer">
            <p className="login-footer-text">
              Nuk keni llogari?{' '}
              <Link to="/signup" className="login-footer-link">
                Regjistrohuni këtu
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
