export function Badge({ children, variant = "neutral" }) {
  return <span className={`cit-badge cit-badge-${variant}`}>{children}</span>;
}

export function Button({ children, href, variant = "primary", onNavigate, external = false }) {
  const className = `cit-button cit-button-${variant}`;

  if (external) {
    return (
      <a className={className} href={href} target="_blank" rel="noreferrer">
        <span>{children}</span><i aria-hidden="true">↗</i>
      </a>
    );
  }

  return (
    <a
      className={className}
      href={href}
      onClick={(event) => {
        if (!onNavigate) return;
        event.preventDefault();
        onNavigate(href);
      }}
    >
      <span>{children}</span><i aria-hidden="true">→</i>
    </a>
  );
}

function SubjectVisual({ active, index }) {
  return (
    <div className={`cit-subject-visual ${active ? "active" : "idle"}`} aria-hidden="true">
      <span className="cit-subject-disc" />
      <span className="cit-subject-line" />
      <b>{String(index + 1).padStart(2, "0")}</b>
    </div>
  );
}

export function SubjectCard({ subject, onNavigate, index = 0 }) {
  const active = subject.status === "active";
  const position = String(index + 1).padStart(2, "0");
  const content = (
    <>
      <SubjectVisual active={active} index={index} />
      <div className="cit-card-meta">
        <span>{position} / {subject.code}</span>
        <Badge variant={active ? "active" : "soon"}>{active ? "Available" : "Coming Soon"}</Badge>
      </div>
      <div className="cit-card-body">
        <h3>{subject.title}</h3>
        <p>{subject.description}</p>
      </div>
      <div className="cit-card-link">
        {active ? <><span>Open laboratory</span><b>↗</b></> : <span>Collection in development</span>}
      </div>
      <div className="cit-card-sheen" aria-hidden="true" />
    </>
  );

  if (!active) {
    return <article className="cit-subject-card is-disabled">{content}</article>;
  }

  return (
    <a
      className="cit-subject-card is-active"
      href={subject.href}
      onClick={(event) => {
        event.preventDefault();
        onNavigate(subject.href);
      }}
    >
      {content}
    </a>
  );
}

function ModulePreview({ id }) {
  if (id === "kmap") {
    return (
      <div className="cit-module-preview preview-map" aria-hidden="true">
        <div className="preview-map-grid">
          <span className="map-cell cell-1" />
          <span className="map-cell cell-2" />
          <span className="map-cell cell-3" />
          <span className="map-cell cell-4" />
          <span className="map-cell cell-5" />
          <span className="map-cell cell-6" />
          <span className="map-cell cell-7" />
          <span className="map-cell cell-8" />
          <span className="map-group group-left" />
          <span className="map-group group-right" />
          <span className="map-cursor" />
        </div>
      </div>
    );
  }

  if (id === "logic-lab") {
    return (
      <div className="cit-module-preview preview-gate" aria-hidden="true">
        <div className="gate-side">
          <span className="gate-port-label">A</span>
          <b className="gate-state">1</b>
        </div>
        <span className="gate-wire wire-input"><i /></span>
        <div className="gate-chip">
          <small>GATE</small>
          <b className="gate-name">
            <span>AND</span>
            <span>OR</span>
            <span>XOR</span>
          </b>
        </div>
        <span className="gate-wire wire-output"><i /></span>
        <div className="gate-side gate-output">
          <span className="gate-port-label">Q</span>
          <b className="gate-state">1</b>
          <i className="gate-led" />
        </div>
      </div>
    );
  }

  return (
    <div className="cit-module-preview preview-ide" aria-hidden="true">
      <div className="ide-wire-bank">
        <span><i /></span>
        <span><i /></span>
        <span><i /></span>
      </div>
      <div className="ide-terminal">
        <b>IDE</b>
        <span className="ide-live"><i />LIVE</span>
      </div>
    </div>
  );
}

export function ModuleCard({ module, onNavigate, index = 0 }) {
  return (
    <a
      className={`cit-module-card module-${module.id}`}
      href={module.href}
      onClick={(event) => {
        event.preventDefault();
        event.currentTarget.setAttribute("data-tool-launching", "true");
        onNavigate(module.href);
      }}
      style={{ "--module-index": index }}
    >
      <div className="cit-module-top">
        <span className="cit-module-code">{module.code}</span>
        <Badge variant="active">{module.level}</Badge>
      </div>
      <ModulePreview id={module.id} />
      <div className="cit-module-content">
        <h3>{module.title}</h3>
        <p>{module.description}</p>
        <ul>
          {module.features.map((feature) => <li key={feature}>{feature}</li>)}
        </ul>
      </div>
      <span className="cit-module-arrow">Open workspace <b>↗</b></span>
      <span className="cit-module-glare" aria-hidden="true" />
    </a>
  );
}
