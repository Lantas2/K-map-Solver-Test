export function Badge({ children, variant = "neutral" }) {
  return <span className={`cit-badge cit-badge-${variant}`}>{children}</span>;
}

export function Button({ children, href, variant = "primary", onNavigate, external = false }) {
  const className = `cit-button cit-button-${variant}`;

  if (external) {
    return (
      <a className={className} href={href} target="_blank" rel="noreferrer">
        {children}
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
      {children}
    </a>
  );
}

export function SubjectCard({ subject, onNavigate }) {
  const active = subject.status === "active";
  const content = (
    <>
      <div className="cit-card-meta">
        <span>{subject.code}</span>
        <Badge variant={active ? "active" : "soon"}>
          {active ? "Available" : "Coming Soon"}
        </Badge>
      </div>
      <h3>{subject.title}</h3>
      <p>{subject.description}</p>
      <div className="cit-card-link">{active ? "Open module →" : "Dalam pengembangan"}</div>
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

export function ModuleCard({ module, onNavigate }) {
  return (
    <a
      className="cit-module-card"
      href={module.href}
      onClick={(event) => {
        event.preventDefault();
        onNavigate(module.href);
      }}
    >
      <div className="cit-module-code">{module.code}</div>
      <div className="cit-module-content">
        <Badge variant="active">{module.level}</Badge>
        <h3>{module.title}</h3>
        <p>{module.description}</p>
        <ul>
          {module.features.map((feature) => (
            <li key={feature}>{feature}</li>
          ))}
        </ul>
      </div>
      <span className="cit-module-arrow">→</span>
    </a>
  );
}
