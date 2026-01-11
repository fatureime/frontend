import { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/useAuth';
import './Navbar.scss';

const Navbar = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { isAuthenticated, user, logout } = useAuth();
  const navigate = useNavigate();
  const menuRef = useRef<HTMLDivElement>(null);
  const toggleRef = useRef<HTMLButtonElement>(null);

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  const closeMenu = () => {
    setIsMenuOpen(false);
  };

  const handleLogout = () => {
    logout();
    navigate('/');
    setIsMenuOpen(false);
  };

  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        isMenuOpen &&
        menuRef.current &&
        toggleRef.current &&
        !menuRef.current.contains(event.target as Node) &&
        !toggleRef.current.contains(event.target as Node)
      ) {
        closeMenu();
      }
    };

    // Close menu on escape key
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && isMenuOpen) {
        closeMenu();
      }
    };

    if (isMenuOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      document.addEventListener('keydown', handleEscape);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleEscape);
    };
  }, [isMenuOpen]);

  return (
    <nav className="navbar">
      <div className="navbar__container">
        <div className="navbar__brand">
          <Link to="/" className="navbar__logo">
            Faturëime
          </Link>
        </div>

        <button
          ref={toggleRef}
          className="navbar__toggle"
          onClick={toggleMenu}
          aria-label="Toggle menu"
          aria-expanded={isMenuOpen}
        >
          <span className="navbar__toggle-icon"></span>
          <span className="navbar__toggle-icon"></span>
          <span className="navbar__toggle-icon"></span>
        </button>

        {isMenuOpen && <div className="navbar__overlay" onClick={closeMenu} />}

        <div 
          ref={menuRef}
          className={`navbar__menu ${isMenuOpen ? 'navbar__menu--open' : ''}`}
        >
          {isAuthenticated ? (
            <>
              <Link 
                to="/businesses" 
                className="navbar__link"
                onClick={closeMenu}
              >
                Bizneset
              </Link>
              {user?.tenant?.issuer_business_id && (
                <Link 
                  to={`/businesses/${user.tenant.issuer_business_id}/articles`} 
                  className="navbar__link"
                  onClick={closeMenu}
                >
                  Artikujt
                </Link>
              )}
              {user?.tenant?.issuer_business_id && (
                <Link 
                  to={`/businesses/${user.tenant.issuer_business_id}/invoices`} 
                  className="navbar__link"
                  onClick={closeMenu}
                >
                  Faturat
                </Link>
              )}
              {user?.roles?.includes('ROLE_ADMIN') && (
                <Link 
                  to="/users" 
                  className="navbar__link"
                  onClick={closeMenu}
                >
                  Përdoruesit
                </Link>
              )}
              {user?.tenant?.is_admin && (
                <Link 
                  to="/tenants" 
                  className="navbar__link"
                  onClick={closeMenu}
                >
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
            <Link 
              to="/login" 
              className="navbar__link navbar__link--login"
              onClick={closeMenu}
            >
              Hyrje
            </Link>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
