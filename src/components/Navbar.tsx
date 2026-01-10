import { useState } from 'react';
import './Navbar.scss';

const Navbar = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  return (
    <nav className="navbar">
      <div className="navbar__container">
        <div className="navbar__brand">
          <a href="/" className="navbar__logo">
            Faturëime
          </a>
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
          <a href="/login" className="navbar__link navbar__link--login">
            Hyrje
          </a>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
