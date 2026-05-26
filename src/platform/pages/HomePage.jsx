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
              <div className="cit-preview-lights" aria-hidden="true">
                <span></span><span></span><span></span>
              </div>
              <b>DIGITAL-ELECTRONICS / CIRCUIT</b>
            </div>

            <div className="cit-preview-stage">
              <svg
                className="cit-preview-circuit"
                viewBox="0 0 560 330"
                role="img"
                aria-label="Rangkaian XOR: input A bernilai satu dan B bernilai nol menghasilkan output Q bernilai satu."
              >
                <defs>
                  <filter id="cit-signal-glow" x="-20%" y="-30%" width="140%" height="160%">
                    <feGaussianBlur stdDeviation="5" result="blur" />
                    <feMerge>
                      <feMergeNode in="blur" />
                      <feMergeNode in="SourceGraphic" />
                    </feMerge>
                  </filter>
                </defs>

                <text className="cit-preview-watermark" x="286" y="296">CIT / SIGNAL</text>

                <g className="cit-svg-wire is-live" filter="url(#cit-signal-glow)">
                  <path d="M116 105 L242 152" />
                  <path d="M328 161 L444 161" />
                </g>
                <g className="cit-svg-wire is-low">
                  <path d="M116 235 L242 170" />
                </g>

                <g className="cit-svg-port is-live" aria-hidden="true">
                  <circle cx="116" cy="105" r="4" />
                  <circle cx="242" cy="152" r="4" />
                  <circle cx="328" cy="161" r="4" />
                  <circle cx="444" cy="161" r="4" />
                </g>
                <g className="cit-svg-port is-low" aria-hidden="true">
                  <circle cx="116" cy="235" r="4" />
                  <circle cx="242" cy="170" r="4" />
                </g>

                <g className="cit-svg-node">
                  <rect className="cit-svg-node-box input" x="38" y="79" width="78" height="52" rx="13" />
                  <text className="cit-svg-label" x="53" y="111">A</text>
                  <text className="cit-svg-value is-live" x="92" y="111">1</text>
                </g>

                <g className="cit-svg-node">
                  <rect className="cit-svg-node-box input" x="38" y="209" width="78" height="52" rx="13" />
                  <text className="cit-svg-label" x="53" y="241">B</text>
                  <text className="cit-svg-value is-low" x="92" y="241">0</text>
                </g>

                <g className="cit-svg-node">
                  <rect className="cit-svg-node-box gate" x="242" y="135" width="86" height="52" rx="13" />
                  <text className="cit-svg-label gate-label" x="285" y="167">XOR</text>
                </g>

                <g className="cit-svg-node">
                  <rect className="cit-svg-node-box output" x="444" y="135" width="78" height="52" rx="13" />
                  <text className="cit-svg-label" x="459" y="167">Q</text>
                  <text className="cit-svg-value is-live" x="498" y="167">1</text>
                </g>
              </svg>
            </div>

            <div className="cit-preview-console">
              <span>SIGNAL MONITOR</span>
              <strong>Q = A ⊕ B <i>→</i> 1</strong>
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
