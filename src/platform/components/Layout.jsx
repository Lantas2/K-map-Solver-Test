import { useState } from "react";
import { SITE_CONFIG } from "../siteConfig";
import { Button } from "./UI";

function InternalLink({ href, children, onNavigate, className = "", onClick }) {
  return (
    <a
      className={className}
      href={href}
      onClick={(event) => {
        event.preventDefault();
        onNavigate(href);
        onClick?.();
      }}
    >
      {children}
    </a>
  );
}

export function Navbar({ onNavigate }) {
  const [isOpen, setIsOpen] = useState(false);
  const closeMenu = () => setIsOpen(false);

  return (
    <header className="cit-navbar">
      <div className="cit-nav-inner">
        <InternalLink className="cit-brand" href="/" onNavigate={onNavigate} onClick={closeMenu}>
          <span className="cit-brand-mark">{SITE_CONFIG.mark}</span>
          <span className="cit-brand-copy">
            <strong>{SITE_CONFIG.name}</strong>
            <small>{SITE_CONFIG.subtitle}</small>
          </span>
        </InternalLink>

        <button
          className={`cit-nav-toggle ${isOpen ? "is-open" : ""}`}
          type="button"
          aria-expanded={isOpen}
          aria-controls="cit-mobile-navigation"
          onClick={() => setIsOpen((open) => !open)}
        >
          <span /><span />
          <b>{isOpen ? "Close" : "Menu"}</b>
        </button>

        <nav id="cit-mobile-navigation" className={`cit-nav-links ${isOpen ? "is-open" : ""}`} aria-label="CITools navigation">
          <InternalLink href="/digital-electronics" onNavigate={onNavigate} onClick={closeMenu}>Tools</InternalLink>
          <InternalLink href="/academic-origin" onNavigate={onNavigate} onClick={closeMenu}>University</InternalLink>
          <InternalLink href="/about" onNavigate={onNavigate} onClick={closeMenu}>About</InternalLink>
          <a href={SITE_CONFIG.githubUrl} target="_blank" rel="noreferrer" onClick={closeMenu}>GitHub</a>
          <a className="cit-nav-pill" href={SITE_CONFIG.linkedinUrl} target="_blank" rel="noreferrer" onClick={closeMenu}>LinkedIn ↗</a>
        </nav>
      </div>
    </header>
  );
}

function UniversityIdentity() {
  const [logoFailed, setLogoFailed] = useState(false);

  return (
    <section className="cit-footer-university" aria-label="Academic identity">
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
        <span className="cit-footer-overline">CIT / Interactive study collection</span>
        <div className="cit-footer-lockup">
          <span className="cit-brand-mark large">CIT</span>
          <div>
            <strong>CITools</strong>
            <p>Visual instruments for informatics and digital electronics learning.</p>
            <small>Created by {SITE_CONFIG.creator}.</small>
          </div>
        </div>
      </section>

      <UniversityIdentity />

      <section className="cit-footer-links" aria-label="Footer links">
        <strong>Navigate</strong>
        <InternalLink href="/digital-electronics" onNavigate={onNavigate}>Elektronika Digital</InternalLink>
        <InternalLink href="/academic-origin" onNavigate={onNavigate}>Academic Origin</InternalLink>
        <InternalLink href="/about" onNavigate={onNavigate}>About Project</InternalLink>
        <a href={SITE_CONFIG.githubUrl} target="_blank" rel="noreferrer">GitHub ↗</a>
        <a href={SITE_CONFIG.linkedinUrl} target="_blank" rel="noreferrer">LinkedIn ↗</a>
      </section>

      <p className="cit-copyright">© 2026 {SITE_CONFIG.creator}. CITools is an independent academic project.</p>
    </footer>
  );
}

export function Layout({ children, onNavigate, pageClassName = "" }) {
  return (
    <div className={`citools-site ${pageClassName}`.trim()}>
      <div className="cit-background-grid" aria-hidden="true" />
      <div className="cit-ambient-sculpture" aria-hidden="true"><span /><span /><span /></div>
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
