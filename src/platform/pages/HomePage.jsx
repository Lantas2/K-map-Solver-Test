import { Layout } from "../components/Layout";
import { Badge, Button, SubjectCard } from "../components/UI";
import { SITE_CONFIG, SUBJECTS } from "../siteConfig";

export default function HomePage({ onNavigate }) {
  return (
    <Layout onNavigate={onNavigate}>
      <section className="cit-hero">
        <div className="cit-hero-copy">
          <Badge variant="active">Interactive Computer Science Learning</Badge>
          <h1>Cokroaminoto<br /><span>informatika tool</span></h1>
          <p>
            Platform pembelajaran interaktif untuk memahami konsep informatika,
            elektronika digital, struktur data, algoritma, dan teknologi komputer secara visual.
          </p>
          <div className="cit-hero-actions">
            <Button href="/digital-electronics" onNavigate={onNavigate}>Explore Tools</Button>
            <Button href={SITE_CONFIG.githubUrl} variant="secondary" external>View GitHub</Button>
          </div>
          <div className="cit-hero-metrics">
            <div><strong>01</strong><span>Modul aktif</span></div>
            <div><strong>03</strong><span>Digital tools</span></div>
            <div><strong>Offline</strong><span>Circuit IDE</span></div>
          </div>
        </div>

        <div className="cit-hero-visual" aria-label="Preview Elektronika Digital">
          <div className="cit-preview-window">
            <div className="cit-preview-head">
              <span></span><span></span><span></span>
              <b>DIGITAL-ELECTRONICS / CIRCUIT</b>
            </div>
            <div className="cit-preview-canvas">
              <div className="cit-node input">A <i>1</i></div>
              <div className="cit-wire wire-a" />
              <div className="cit-node gate">XOR</div>
              <div className="cit-wire wire-b" />
              <div className="cit-node output">Q <i>1</i></div>
              <div className="cit-node input second">B <i>0</i></div>
              <div className="cit-wire wire-c" />
            </div>
            <div className="cit-preview-console">
              <span>SIGNAL MONITOR</span>
              <strong>Q = A ⊕ B → 1</strong>
            </div>
          </div>
        </div>
      </section>

      <section className="cit-subjects" id="tools">
        <div className="cit-section-heading">
          <div>
            <Badge>Course Library</Badge>
            <h2>Tools berdasarkan mata kuliah</h2>
          </div>
          <p>Satu platform yang disiapkan untuk berkembang menjadi koleksi alat belajar bidang informatika dan teknologi komputer.</p>
        </div>
        <div className="cit-subject-grid">
          {SUBJECTS.map((subject) => (
            <SubjectCard key={subject.id} subject={subject} onNavigate={onNavigate} />
          ))}
        </div>
      </section>

      <section className="cit-creator" id="creator">
        <div className="cit-creator-intro">
          <Badge variant="active">Academic Portfolio</Badge>
          <h2>Dirancang untuk belajar melalui visual dan eksperimen.</h2>
        </div>
        <div className="cit-profile-card" id="university">
          <span className="cit-brand-mark large">CIT</span>
          <div>
            <small>Dibuat oleh</small>
            <strong>{SITE_CONFIG.creator}</strong>
            <p>{SITE_CONFIG.university}</p>
          </div>
          <Button href="/about" variant="secondary" onNavigate={onNavigate}>About Project</Button>
        </div>
      </section>
    </Layout>
  );
}
