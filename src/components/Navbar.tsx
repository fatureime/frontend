import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/useAuth';
import './Navbar.scss';

const Navbar = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { isAuthenticated, user, logout } = useAuth();
  const navigate = useNavigate();

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  const handleLogout = () => {
    logout();
    navigate('/');
    setIsMenuOpen(false);
  };

  return (
    <nav className="navbar">
      <div className="navbar__container">
        <div className="navbar__brand">
          <Link to="/" className="navbar__logo">
            Faturëime
          </Link>
        </div>

        <button
          className="navbar__toggle"
          onClick={toggleMenu}
          aria-label="Toggle menu"
          aria-expanded={isMenuOpen}
        >
          <span className="navbar__toggle-icon"></span>
          <span className="navbar__toggle-icon"></span>
          <span className="navbar__toggle-icon"></span>
        </button>

        <div className={`navbar__menu ${isMenuOpen ? 'navbar__menu--open' : ''}`}>
          {isAuthenticated ? (
            <>
              <Link to="/dashboard" className="navbar__link">
                Paneli
              </Link>
              <Link to="/businesses" className="navbar__link">
                Bizneset
              </Link>
              {user?.roles?.includes('ROLE_ADMIN') && (
                <Link to="/users" className="navbar__link">
                  Përdoruesit
                </Link>
              )}
              {user?.tenant?.is_admin && (
                <Link to="/tenants" className="navbar__link">
                  Hapësirëmarrësit
                </Link>
              )}
              <div className="navbar__user">
                <span className="navbar__user-email">{user?.email}</span>
                {user?.tenant && (
                  <span className="navbar__user-tenant">
                    {user.tenant.name}
                    {user.tenant.is_admin && <span className="badge">Menagjues</span>}
                  </span>
                )}
              </div>
              <button
                onClick={handleLogout}
                className="navbar__link navbar__link--logout"
              >
                Dil
              </button>
            </>
          ) : (
            <Link to="/login" className="navbar__link navbar__link--login">
              Hyrje
            </Link>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
