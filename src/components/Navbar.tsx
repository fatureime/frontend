import { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/useAuth';
import './Navbar.scss';

const Navbar = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [showLogoutModal, setShowLogoutModal] = useState(false);
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

  const handleLogoutClick = () => {
    setShowLogoutModal(true);
    setIsMenuOpen(false);
  };

  const handleLogoutConfirm = () => {
    logout();
    navigate('/');
    setShowLogoutModal(false);
  };

  const handleLogoutCancel = () => {
    setShowLogoutModal(false);
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
              <div className="navbar__user">
                <span className="navbar__user-email">{user?.email}</span>
                {user?.tenant && (
                  <span className="navbar__user-tenant">
                    {user.tenant.name}
                    {user.tenant.is_admin && <span className="badge">Menagjues</span>}
                  </span>
                )}
              </div>
              <Link 
                to="/businesses" 
                className="navbar__link"
                onClick={closeMenu}
              >
                Subjektet
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
              <Link 
                to="/bank-accounts" 
                className="navbar__link"
                onClick={closeMenu}
              >
                Llogaritë Bankare
              </Link>
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
              <button
                onClick={handleLogoutClick}
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

        {/* Logout Confirmation Modal */}
        {showLogoutModal && (
          <div className="modal-overlay" onClick={handleLogoutCancel}>
            <div className="modal-content" onClick={(e) => e.stopPropagation()}>
              <h3>Konfirmo Daljen</h3>
              <p>Jeni të sigurt që dëshironi të dilni?</p>
              <div className="modal-actions">
                <button
                  onClick={handleLogoutConfirm}
                  className="btn btn-primary"
                >
                  Po, Dil
                </button>
                <button
                  onClick={handleLogoutCancel}
                  className="btn btn-secondary"
                >
                  Anulo
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
