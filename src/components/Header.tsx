import { useEffect, useState } from "react";
import { Link, NavLink } from "react-router-dom";
import teddyPupsLogo from "../assets/images/teddypups-logo.png";
import "./Header.css";

const navigationLinks = [
  { label: "Home", href: "/", end: true },
  { label: "Puppies", href: "/puppies" },
  { label: "Happy families", href: "/happy-families" },
  { label: "How it works", href: "/how-it-works" },
  { label: "FAQ", href: "/faq" },
  { label: "Visit & contact", href: "/contact" },
];

function PawIcon() {
  return (
    <svg
      className="header-paw"
      viewBox="0 0 64 64"
      aria-hidden="true"
    >
      <path
        fill="currentColor"
        d="M32 30.5c-7.6 0-15.6 8.3-15.6 15.5 0 5.4 4.2 8.3 9.2 8.3 2.6 0 4.5-1.1 6.4-1.1s3.8 1.1 6.4 1.1c5 0 9.2-2.9 9.2-8.3 0-7.2-8-15.5-15.6-15.5zM19.28 26.71C21.07 30.08 20.42 33.92 17.84 35.29C15.25 36.67 11.71 35.05 9.92 31.69C8.13 28.32 8.78 24.48 11.36 23.11C13.95 21.73 17.49 23.35 19.28 26.71ZM29.62 15.64C30.32 19.62 28.46 23.26 25.47 23.79C22.48 24.32 19.48 21.53 18.78 17.56C18.08 13.58 19.94 9.94 22.93 9.41C25.92 8.88 28.92 11.67 29.62 15.64ZM45.22 17.56C44.52 21.53 42.52 24.32 38.53 23.79C35.54 23.26 33.68 19.62 34.38 15.64C35.08 11.67 38.08 8.88 41.07 9.41C44.06 9.94 45.92 13.58 45.22 17.56ZM54.08 31.69C52.29 35.05 48.75 36.67 46.16 35.29C43.58 33.92 42.93 30.08 44.72 26.71C46.51 23.35 50.05 21.73 52.64 23.11C55.22 24.48 55.87 28.32 54.08 31.69Z"
      />
    </svg>
  );
}

function Header() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [hidden, setHidden] = useState(false);

  useEffect(() => {
    function handleEscape(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setMenuOpen(false);
      }
    }

    document.addEventListener("keydown", handleEscape);

    return () => {
      document.removeEventListener("keydown", handleEscape);
    };
  }, []);

  useEffect(() => {
  let lastY = window.scrollY;
  function handleScroll() {
    const y = window.scrollY;
    setScrolled(y > 10);
    // tuck away while scrolling down, return on any upward scroll
    if (Math.abs(y - lastY) > 6) {
      setHidden(y > lastY && y > 160);
      lastY = y;
    }
  }

  handleScroll();

  window.addEventListener("scroll", handleScroll, { passive: true });

  return () => {
    window.removeEventListener("scroll", handleScroll);
  };
}, []);

  useEffect(() => {
    document.body.style.overflow = menuOpen ? "hidden" : "";

    return () => {
      document.body.style.overflow = "";
    };
  }, [menuOpen]);

  function closeMenu() {
    setMenuOpen(false);
  }

  return (
    <header
  className="site-header"
  data-home={window.location.pathname === "/" ? "true" : undefined}
  data-scrolled={scrolled ? "true" : "false"}
  data-hidden={hidden && !menuOpen ? "true" : undefined}
>
      <div className="header-inner">
        <Link
          className="header-brand"
          to="/"
          aria-label="TeddyPups home"
          onClick={closeMenu}
        >
          <img className="header-paw" src={teddyPupsLogo} alt="" />
          <span>TeddyPups</span>
        </Link>

        <nav className="desktop-nav" aria-label="Main navigation">
          {navigationLinks.map((link) => (
            <NavLink
              key={link.href}
              to={link.href}
              end={link.end}
              className={({ isActive }) =>
                `nav-link ${isActive ? "active" : ""}`
              }
            >
              <span>{link.label}</span>
              <PawIcon />
            </NavLink>
          ))}
        </nav>

        <div className="header-actions">
          <Link className="whatsapp-button" to="/contact">
            WhatsApp us
          </Link>

          <button
            className="menu-toggle"
            type="button"
            aria-label={menuOpen ? "Close menu" : "Open menu"}
            aria-expanded={menuOpen}
            aria-controls="mobile-navigation"
            onClick={() => setMenuOpen(!menuOpen)}
          >
            <span className="menu-toggle-lines">
              <span />
              <span />
            </span>
            {menuOpen ? "Close" : "Menu"}
          </button>
        </div>
      </div>

      <div
        id="mobile-navigation"
        className={`mobile-menu ${menuOpen ? "is-open" : ""}`}
        aria-hidden={!menuOpen}
        inert={!menuOpen}
      >
        <div className="mobile-menu-top">
          <span>where to, friend?</span>

          <button
            className="mobile-close"
            type="button"
            onClick={closeMenu}
          >
            Close
          </button>
        </div>

        <nav className="mobile-nav" aria-label="Mobile navigation">
          {navigationLinks.map((link) => (
            <NavLink
              key={link.href}
              to={link.href}
              end={link.end}
              onClick={closeMenu}
            >
              {link.label}
            </NavLink>
          ))}
        </nav>

        <Link
          className="mobile-whatsapp"
          to="/contact"
          onClick={closeMenu}
        >
          WhatsApp us
        </Link>
      </div>

      <svg
        className="header-hem"
        aria-hidden="true"
        width="100%"
        height="14"
      >
        <defs>
          <pattern id="header-hem-pattern" width="44" height="14" patternUnits="userSpaceOnUse">
            <path className="header-hem-fill" d="M0 0H44V2A22 11 0 0 1 0 2Z" />
            <path className="header-hem-line" d="M0 2A22 11 0 0 0 44 2" />
          </pattern>
        </defs>
        <rect width="100%" height="14" fill="url(#header-hem-pattern)" />
      </svg>
    </header>
  );
}

export default Header;
