import { useState, useEffect, useRef } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/useAuth';
import './Navbar.scss';

const Navbar = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isAdminMenuOpen, setIsAdminMenuOpen] = useState(false);
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const { isAuthenticated, user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const menuRef = useRef<HTMLDivElement>(null);
  const toggleRef = useRef<HTMLButtonElement>(null);
  const adminMenuRef = useRef<HTMLDivElement>(null);

  const getPageTitle = (pathname: string): string => {
    // Remove query params and hash
    const path = pathname.split('?')[0].split('#')[0];
    
    // Match routes in order of specificity
    if (path === '/' || path === '/login') {
      return 'Hyrje';
    }
    if (path === '/about') {
      return 'Rreth Nesh';
    }
    if (path === '/signup') {
      return 'Regjistrohuni';
    }
    if (path === '/verify-email') {
      return 'Verifikimi i Email';
    }
    if (path === '/accept-invitation') {
      return 'Pranimi i Ftesës';
    }
    if (path.match(/^\/businesses\/\d+\/invoices\/\d+\/edit$/)) {
      return 'Ndrysho Faturë';
    }
    if (path.match(/^\/businesses\/\d+\/invoices\/create$/)) {
      return 'Krijo Faturë';
    }
    if (path.match(/^\/businesses\/\d+\/invoices\/\d+$/)) {
      return 'Detajet e Faturës';
    }
    if (path.match(/^\/businesses\/\d+\/invoices$/)) {
      return 'Faturat';
    }
    if (path.match(/^\/businesses\/\d+\/articles$/)) {
      return 'Artikujt';
    }
    if (path === '/businesses') {
      return 'Subjektet';
    }
    if (path === '/bank-accounts') {
      return 'Llogaritë Bankare';
    }
    if (path === '/users') {
      return 'Përdoruesit';
    }
    if (path === '/tenants') {
      return 'Hapësirëmarrësit';
    }
    if (path === '/invoice-statuses') {
      return 'Gjendjet e Faturave';
    }
    
    // Default fallback
    return 'Faturëime';
  };

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  const closeMenu = () => {
    setIsMenuOpen(false);
    setIsAdminMenuOpen(false);
  };

  const toggleAdminMenu = () => {
    setIsAdminMenuOpen(!isAdminMenuOpen);
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
        !toggleRef.current.contains(event.target as Node) &&
        !adminMenuRef.current?.contains(event.target as Node)
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
            {getPageTitle(location.pathname)}
          </Link>
        </div>

        <button
          ref={toggleRef}
          className={`navbar__toggle ${isMenuOpen ? 'navbar__toggle--open' : ''}`}
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
              <Link 
                to="/bank-accounts" 
                className="navbar__link"
                onClick={closeMenu}
              >
                Llogaritë Bankare
              </Link>
              {user?.roles?.includes('ROLE_ADMIN') && (
                <div ref={adminMenuRef} className="navbar__admin-menu">
                  <button
                    className="navbar__link navbar__link--admin-toggle"
                    onClick={toggleAdminMenu}
                  >
                    <span>Admin Panel</span>
                    <svg
                      className={`navbar__admin-chevron ${isAdminMenuOpen ? 'navbar__admin-chevron--open' : ''}`}
                      width="16"
                      height="16"
                      viewBox="0 0 16 16"
                      fill="none"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path
                        d="M4 6L8 10L12 6"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  </button>
                  {isAdminMenuOpen && (
                    <div className="navbar__admin-submenu">
                      <Link 
                        to="/users" 
                        className="navbar__link navbar__link--submenu"
                        onClick={closeMenu}
                      >
                        Përdoruesit
                      </Link>
                      {user?.tenant?.is_admin && (
                        <Link 
                          to="/tenants" 
                          className="navbar__link navbar__link--submenu"
                          onClick={closeMenu}
                        >
                          Hapësirëmarrësit
                        </Link>
                      )}
                      {user?.tenant?.is_admin && (
                        <Link 
                          to="/invoice-statuses" 
                          className="navbar__link navbar__link--submenu"
                          onClick={closeMenu}
                        >
                          Gjendjet e Faturave
                        </Link>
                      )}
                    </div>
                  )}
                </div>
              )}
              {!user?.roles?.includes('ROLE_ADMIN') && user?.tenant?.is_admin && (
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
              to="/" 
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
