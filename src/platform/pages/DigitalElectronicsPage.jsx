import { Layout } from "../components/Layout";
import { Badge, Button, ModuleCard } from "../components/UI";
import { DIGITAL_MODULES } from "../siteConfig";

function ModuleStage({ onNavigate }) {
  const openWorkspace = (event, href) => {
    const sourcePanel = event.currentTarget.closest(".cit-course-interface");

    sourcePanel?.setAttribute("data-tool-launching", "true");
    onNavigate(href);
  };

  return (
    <div className="cit-course-stage" aria-label="Elektronika Digital module preview">
      <div className="cit-course-glow" aria-hidden="true" />
      <div className="cit-course-ribbon" aria-hidden="true" />
      <article className="cit-course-interface">
        <header>
          <span>EDG-01 / MODULE</span>
          <b>3 workspaces available</b>
        </header>
        <div className="cit-course-interface-body">
          <div className="cit-interface-copy">
            <small>ACTIVE STUDY</small>
            <strong>Digital signal<br />laboratory</strong>
            <p>Boolean → Gate → Circuit</p>
          </div>
          <div className="cit-interface-orbit" aria-hidden="true">
            <i /><i /><i />
          </div>
        </div>
        <nav className="cit-interface-tabs">
          <button
            type="button"
            onClick={(event) => openWorkspace(event, "/digital-electronics/kmap")}
          >
            K-Map
          </button>
          <button
            type="button"
            onClick={(event) => openWorkspace(event, "/digital-electronics/logic-lab")}
          >
            Learning
          </button>
          <button
            type="button"
            onClick={(event) => openWorkspace(event, "/digital-electronics/circuit-ide")}
          >
            Circuit IDE
          </button>
        </nav>
      </article>
    </div>
  );
}

export default function DigitalElectronicsPage({ onNavigate }) {
  return (
    <Layout onNavigate={onNavigate} pageClassName="cit-course-showcase">
      <section className="cit-course-showcase-hero">
        <div className="cit-course-copy">
          <Badge variant="active">EDG-01 / Available Module</Badge>
          <p className="cit-minimal-eyebrow">Digital electronics collection</p>
          <h1>Elektronika<br /><em>Digital.</em></h1>
          <p>
            Laboratorium visual untuk memahami logika Boolean, gerbang digital,
            dan perancangan rangkaian interaktif melalui tiga workspace yang terhubung.
          </p>
          <div className="cit-showcase-actions">
            <Button
              href="/digital-electronics/kmap"
              onNavigate={(href) => {
                document
                  .querySelector(".cit-course-interface")
                  ?.setAttribute("data-tool-launching", "true");

                onNavigate(href);
              }}
            >
              Start K-Map Solver
            </Button>
            <Button href="/" variant="secondary" onNavigate={onNavigate}>Back Home</Button>
          </div>
        </div>
        <ModuleStage onNavigate={onNavigate} />
      </section>

      <section className="cit-workspaces-section">
        <div className="cit-editorial-head compact">
          <div>
            <Badge>Workspaces</Badge>
            <h2>Three ways to<br /><em>study a signal.</em></h2>
          </div>
          <p>
            Mulai dari penyederhanaan Boolean, lanjut ke pemahaman gerbang,
            kemudian bangun circuit yang dapat disimulasikan secara realtime.
          </p>
        </div>
        <div className="cit-module-gallery">
          {DIGITAL_MODULES.map((module, index) => (
            <ModuleCard key={module.id} module={module} index={index} onNavigate={onNavigate} />
          ))}
        </div>
      </section>

      <section className="cit-offline-glass-note">
        <div>
          <Badge variant="active">Offline-first</Badge>
          <h2>Simulation first.<br /><em>No paid AI required.</em></h2>
        </div>
        <p>
          Circuit IDE berjalan lokal melalui engine simulasi yang dibangun untuk CITools.
          AI hanya dapat menjadi plugin opsional pada masa depan, bukan syarat penggunaan laboratorium.
        </p>
        <Button href="/digital-electronics/circuit-ide" variant="secondary" onNavigate={onNavigate}>Enter Circuit IDE</Button>
      </section>
    </Layout>
  );
}
