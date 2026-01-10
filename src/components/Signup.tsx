import { useState, FormEvent } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { AxiosError } from 'axios';
import { useAuth } from '../contexts/useAuth';
import './Signup.scss';

const Signup = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  
  const { register, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  // Redirect if already authenticated
  if (isAuthenticated) {
    navigate('/dashboard');
    return null;
  }

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError('');

    // Client-side validation
    if (password !== confirmPassword) {
      setError('Fjalëkalimet nuk përputhen');
      return;
    }

    if (password.length < 8) {
      setError('Fjalëkalimi duhet të jetë së paku 8 karaktere');
      return;
    }

    setIsLoading(true);

    try {
      const response = await register({
        email,
        password,
      });
      
      // Redirect to email verification page with success message
      navigate('/verify-email', { 
        state: { 
          message: response.message,
          email: response.email 
        } 
      });
    } catch (err) {
      const axiosError = err as AxiosError<{ error?: string }>;
      setError(
        axiosError.response?.data?.error || 
        'Ndodhi një gabim gjatë regjistrimit. Ju lutem provoni përsëri.'
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="signup-page">
      <div className="signup-container">
        <div className="signup-card">
          <h1 className="signup-title">Regjistrim</h1>
          <p className="signup-subtitle">Krijoni një llogari të re për të filluar</p>

          {error && (
            <div className="signup-error">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="signup-form">
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
                placeholder="Më së paku 8 karaktere"
                disabled={isLoading}
                minLength={8}
              />
              <small className="form-hint">
                Fjalëkalimi duhet të jetë së paku 8 karaktere
              </small>
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
                placeholder="••••••••"
                disabled={isLoading}
                minLength={8}
              />
            </div>

            <button
              type="submit"
              className="btn btn--primary btn--full"
              disabled={isLoading}
            >
              {isLoading ? 'Duke u regjistruar...' : 'Regjistrohu'}
            </button>
          </form>

          <div className="signup-footer">
            <p className="signup-footer-text">
              Keni tashmë një llogari?{' '}
              <Link to="/login" className="signup-footer-link">
                Hyni këtu
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Signup;
