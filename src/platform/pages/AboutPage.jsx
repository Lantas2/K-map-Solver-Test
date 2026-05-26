import { Layout } from "../components/Layout";
import { Badge, Button } from "../components/UI";
import { SITE_CONFIG } from "../siteConfig";

export default function AboutPage({ onNavigate }) {
  return (
    <Layout onNavigate={onNavigate}>
      <section className="cit-about-hero">
        <Badge variant="active">About CITools</Badge>
        <h1>Platform pembelajaran interaktif untuk teknologi digital.</h1>
        <p>
          CITools atau CIT adalah singkatan dari Cokroaminoto informatika tool. Project ini dibangun sebagai
          media pembelajaran visual sekaligus portofolio akademik di bidang informatika dan teknik komputer.
        </p>
      </section>

      <section className="cit-about-grid">
        <article className="cit-about-card">
          <span className="cit-about-number">01</span>
          <h2>Tujuan</h2>
          <p>Menyediakan alat belajar yang membuat konsep abstrak seperti Boolean logic dan rangkaian digital dapat diuji secara langsung.</p>
        </article>
        <article className="cit-about-card">
          <span className="cit-about-number">02</span>
          <h2>Modul Pertama</h2>
          <p>Elektronika Digital dengan K-Map Solver, Learning Mode, dan Circuit IDE yang berfungsi offline tanpa AI.</p>
        </article>
        <article className="cit-about-card profile">
          <span className="cit-brand-mark large">CIT</span>
          <div>
            <small>Pembuat</small>
            <h2>{SITE_CONFIG.creator}</h2>
            <p>{SITE_CONFIG.university}</p>
            <div className="cit-about-actions">
              <Button href={SITE_CONFIG.githubUrl} external>GitHub</Button>
              <Button href={SITE_CONFIG.linkedinUrl} variant="secondary" external>LinkedIn</Button>
            </div>
          </div>
        </article>
      </section>
    </Layout>
  );
}
