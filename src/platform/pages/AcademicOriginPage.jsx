import { useState } from "react";
import { Layout } from "../components/Layout";
import { Badge, Button } from "../components/UI";
import { SITE_CONFIG } from "../siteConfig";

function UniversityLogo({ className = "" }) {
  const [logoFailed, setLogoFailed] = useState(false);

  if (logoFailed) {
    return <span className={`cit-origin-logo-fallback ${className}`}>{SITE_CONFIG.university}</span>;
  }

  return (
    <img
      className={`cit-origin-logo ${className}`}
      src={SITE_CONFIG.universityLogo}
      alt={`Logo ${SITE_CONFIG.university}`}
      loading="lazy"
      decoding="async"
      onError={() => setLogoFailed(true)}
    />
  );
}

function CampusMonitor() {
  return (
    <div className="cit-campus-monitor" aria-label="Lokasi kampus Universitas Cokroaminoto Palopo">
      <div className="cit-campus-monitor-head">
        <div className="cit-monitor-lights" aria-hidden="true"><span /><span /><span /></div>
        <b>CAMPUS / LOCATION</b>
      </div>

      <div className="cit-campus-map-frame">
        <iframe
          title="Peta Universitas Cokroaminoto Palopo"
          src={SITE_CONFIG.universityMapEmbedUrl}
          loading="lazy"
          referrerPolicy="no-referrer-when-downgrade"
        />
        <div className="cit-map-plate">
          <span className="cit-map-code">UNCP • PALOPO</span>
          <strong>{SITE_CONFIG.university}</strong>
          <small>{SITE_CONFIG.universityAddress}</small>
        </div>
      </div>

      <div className="cit-campus-monitor-foot">
        <span>ACADEMIC LOCATION</span>
        <a href={SITE_CONFIG.universityMapsUrl} target="_blank" rel="noreferrer">Open Maps ↗</a>
      </div>
    </div>
  );
}

export default function AcademicOriginPage({ onNavigate }) {
  return (
    <Layout onNavigate={onNavigate}>
      <section className="cit-origin-hero">
        <div className="cit-origin-copy">
          <Badge variant="active">Academic Origin</Badge>
          <h1>Universitas<br /><span>Cokroaminoto Palopo</span></h1>
          <p>
            CITools dikembangkan sebagai project pembelajaran dan portofolio akademik yang berangkat dari
            bidang informatika dan teknologi digital. Identitas universitas ditampilkan sebagai konteks akademik
            pembuat project, bukan sebagai branding utama platform.
          </p>
          <div className="cit-origin-actions">
            <Button href={SITE_CONFIG.universityWebsiteUrl} external>Website Kampus</Button>
            <Button href={SITE_CONFIG.admissionUrl} external variant="secondary">Pendaftaran PMB</Button>
            <Button href={SITE_CONFIG.universityMapsUrl} external variant="ghost">Buka Maps</Button>
          </div>
        </div>

        <CampusMonitor />
      </section>

      <section className="cit-academic-card">
        <div className="cit-academic-identity">
          <div className="cit-academic-label-wrap">
            <Badge>Academic Project</Badge>
            <UniversityLogo />
          </div>
          <div>
            <small className="cit-origin-eyebrow">University Identity</small>
            <h2>{SITE_CONFIG.university}</h2>
            <p>
              Developed for educational and academic purposes. CITools merupakan project independen
              yang dikembangkan oleh {SITE_CONFIG.creator}; website ini bukan situs resmi universitas.
            </p>
          </div>
        </div>
        <dl className="cit-academic-facts">
          <div><dt>Developer</dt><dd>{SITE_CONFIG.creator}</dd></div>
          <div><dt>Project</dt><dd>CITools / CIT</dd></div>
          <div><dt>Focus</dt><dd>Informatics & Digital Electronics</dd></div>
          <div><dt>Location</dt><dd>Palopo, Sulawesi Selatan</dd></div>
        </dl>
      </section>

      <section className="cit-origin-links">
        <div className="cit-section-heading compact">
          <div>
            <Badge>Reference Links</Badge>
            <h2>Akses informasi akademik</h2>
          </div>
          <p>Tautan eksternal berikut mengarah ke kanal universitas dan layanan penerimaan mahasiswa baru.</p>
        </div>

        <div className="cit-origin-link-grid">
          <a href={SITE_CONFIG.universityWebsiteUrl} target="_blank" rel="noreferrer" className="cit-origin-link-card">
            <span>01 / Official Site</span>
            <h3>Website Kampus</h3>
            <p>Informasi institusi, akademik, fakultas, layanan, dan berita resmi universitas.</p>
            <b>Buka website ↗</b>
          </a>
          <a href={SITE_CONFIG.admissionUrl} target="_blank" rel="noreferrer" className="cit-origin-link-card">
            <span>02 / Admission</span>
            <h3>PMB UNCP</h3>
            <p>Portal informasi penerimaan mahasiswa baru dan tahapan pendaftaran daring.</p>
            <b>Lihat pendaftaran ↗</b>
          </a>
          <a href={SITE_CONFIG.universityInstagramUrl} target="_blank" rel="noreferrer" className="cit-origin-link-card">
            <span>03 / Social</span>
            <h3>Instagram UNCP</h3>
            <p>Kanal sosial universitas untuk mengikuti informasi dan aktivitas kampus.</p>
            <b>Buka Instagram ↗</b>
          </a>
          <a href={SITE_CONFIG.universityMapsUrl} target="_blank" rel="noreferrer" className="cit-origin-link-card">
            <span>04 / Maps</span>
            <h3>Lokasi Kampus</h3>
            <p>{SITE_CONFIG.universityAddress}</p>
            <b>Buka petunjuk arah ↗</b>
          </a>
        </div>
      </section>

      <section className="cit-origin-disclaimer">
        <strong>Independent Academic Project</strong>
        <p>
          CITools tetap menggunakan identitas utama CIT/CITools. Logo dan informasi universitas ditampilkan
          secara proporsional untuk menjelaskan asal akademik pembuat project.
        </p>
      </section>
    </Layout>
  );
}
