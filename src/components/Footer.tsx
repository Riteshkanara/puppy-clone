import { Link, useLocation } from "react-router-dom";
import teddyPupsLogo from "../assets/images/teddypups-logo.png";
import FooterBasket from "./FooterBasket";
import { CONTACT as contact } from "../data/contactDetails";
import "./Footer.css";

const exploreLinks = [
  { label: "Available puppies", to: "/puppies" },
  { label: "Gone home", to: "/gone-home" },
  { label: "Happy families", to: "/happy-families" },
  { label: "How it works", to: "/how-it-works" },
  { label: "Delivery & collection", to: "/how-it-works#delivery" },
  { label: "FAQ", to: "/faq" },
  { label: "Visit & contact", to: "/contact" },
];

function Footer() {
  // Same basket on every page (the original's). On Home it is also Teddy's last stop (he walks down and jumps in);
  // on the other pages it is the original's static, breathing, blinking Teddy.
  const live = useLocation().pathname === "/";
  return (
    <footer className={live ? "site-footer site-footer--live" : "site-footer"}>
      <svg
        className="site-footer__wave"
        aria-hidden="true"
        viewBox="0 0 1440 80"
        preserveAspectRatio="none"
      >
        <path d="M0 80V44c120-30 240-44 360-30s240 46 360 34 240-58 360-46 240 40 360 26v52z" />
      </svg>

      <div className="site-footer__night-sky" aria-hidden="true">
        {[6, 14, 23, 31, 44, 52, 63, 71, 92].map((left, index) => (
          <span
            className="site-footer__star"
            key={left}
            style={{ left: `${left}%`, top: `${[18, 42, 12, 30, 9, 36, 15, 40, 33][index]}%` }}
          />
        ))}
        <span className="site-footer__moon" />
      </div>

      <div className="site-footer__content">
        <section className="site-footer__intro" aria-labelledby="footer-title">
          <h2 id="footer-title">Home, at last.</h2>
          <p>
            TeddyPups U.A.E. is a Dubai-based brand specializing in miniature
            puppies, offering premium services and worldwide shipping.
          </p>
          <FooterBasket live={live} />
        </section>

        <nav className="site-footer__explore" aria-label="Footer navigation">
          <h3>Explore</h3>
          <ul>
            {exploreLinks.map((item) => (
              <li key={item.to}>
                <Link to={item.to}>{item.label}</Link>
              </li>
            ))}
          </ul>
        </nav>

        <section className="site-footer__hello" aria-labelledby="footer-hello">
          <h3 id="footer-hello">Say hello</h3>
          <p className="site-footer__line site-footer__line--strong">
            <Link to="/contact">WhatsApp {contact.whatsapp.display}</Link>
          </p>
          <p className="site-footer__line">{contact.email}</p>
          <p className="site-footer__line">{contact.address}</p>
          <div className="site-footer__socials" aria-label="Social media">
            <span>Instagram</span>
            <span>TikTok</span>
            <span>Facebook</span>
          </div>
        </section>
      </div>

      <div className="site-footer__bottom">
        <div className="site-footer__bottom-inner">
          <span className="site-footer__copyright">
            <img src={teddyPupsLogo} alt="" />
            © 2026 TeddyPups U.A.E.
          </span>
          <span className="site-footer__tagline">every puppy is family</span>
        </div>
      </div>
    </footer>
  );
}

export default Footer;
