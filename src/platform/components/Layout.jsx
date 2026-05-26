import { useState } from "react";
import { SITE_CONFIG } from "../siteConfig";
import { Button } from "./UI";

function InternalLink({ href, children, onNavigate, className = "" }) {
  return (
    <a
      className={className}
      href={href}
      onClick={(event) => {
        event.preventDefault();
        onNavigate(href);
      }}
    >
      {children}
    </a>
  );
}

export function Navbar({ onNavigate }) {
  return (
    <header className="cit-navbar">
      <div className="cit-nav-inner">
        <InternalLink className="cit-brand" href="/" onNavigate={onNavigate}>
          <span className="cit-brand-mark">{SITE_CONFIG.mark}</span>
          <span className="cit-brand-copy">
            <strong>{SITE_CONFIG.name}</strong>
            <small>{SITE_CONFIG.subtitle}</small>
          </span>
        </InternalLink>

        <nav className="cit-nav-links" aria-label="CITools navigation">
          <a href={SITE_CONFIG.githubUrl} target="_blank" rel="noreferrer">GitHub</a>
          <a href={SITE_CONFIG.linkedinUrl} target="_blank" rel="noreferrer">LinkedIn</a>
          <a href="#creator">Pembuat</a>
          <InternalLink href="/academic-origin" onNavigate={onNavigate}>Asal Universitas</InternalLink>
          <InternalLink href="/about" onNavigate={onNavigate}>About</InternalLink>
        </nav>
      </div>
    </header>
  );
}

function UniversityIdentity() {
  const [logoFailed, setLogoFailed] = useState(false);

  return (
    <section className="cit-footer-university" id="university" aria-label="Academic identity">
      <span className="cit-academic-label">Academic Project</span>
      {!logoFailed ? (
        <img
          className="cit-university-logo"
          src={SITE_CONFIG.universityLogo}
          alt={`Logo ${SITE_CONFIG.university}`}
          loading="lazy"
          decoding="async"
          onError={() => setLogoFailed(true)}
        />
      ) : (
        <span className="cit-university-fallback">{SITE_CONFIG.university}</span>
      )}
      <strong>{SITE_CONFIG.university}</strong>
      <p>Developed for educational and academic purposes.</p>
    </section>
  );
}

export function Footer({ onNavigate }) {
  return (
    <footer className="cit-footer">
      <section className="cit-footer-brand">
        <span className="cit-brand-mark large">CIT</span>
        <div>
          <strong>CITools</strong>
          <p>Interactive engineering learning tools for informatics and digital technology.</p>
          <small>Developed by {SITE_CONFIG.creator}.</small>
        </div>
      </section>

      <UniversityIdentity />

      <section className="cit-footer-links" aria-label="Footer links">
        <strong>Connect</strong>
        <a href={SITE_CONFIG.githubUrl} target="_blank" rel="noreferrer">GitHub</a>
        <a href={SITE_CONFIG.linkedinUrl} target="_blank" rel="noreferrer">LinkedIn</a>
        <InternalLink href="/digital-electronics" onNavigate={onNavigate}>Elektronika Digital</InternalLink>
        <InternalLink href="/academic-origin" onNavigate={onNavigate}>Academic Origin</InternalLink>
        <InternalLink href="/about" onNavigate={onNavigate}>About Project</InternalLink>
      </section>

      <p className="cit-copyright">© 2026 {SITE_CONFIG.creator}. CITools remains the primary project identity; university attribution is presented as academic context.</p>
    </footer>
  );
}

export function Layout({ children, onNavigate }) {
  return (
    <div className="citools-site">
      <div className="cit-background-grid" aria-hidden="true" />
      <Navbar onNavigate={onNavigate} />
      <main className="cit-main">{children}</main>
      <Footer onNavigate={onNavigate} />
    </div>
  );
}

export function ToolRouteHeader({ title, onNavigate }) {
  return (
    <div className="cit-toolroute-bar">
      <button type="button" onClick={() => onNavigate("/digital-electronics")}>
        <span>CIT</span>
        Elektronika Digital
      </button>
      <div>
        <small>Active Tool</small>
        <strong>{title}</strong>
      </div>
      <Button href="/" variant="ghost" onNavigate={onNavigate}>Home</Button>
    </div>
  );
}
