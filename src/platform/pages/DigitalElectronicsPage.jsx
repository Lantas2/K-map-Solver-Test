import { Layout } from "../components/Layout";
import { Badge, Button, ModuleCard } from "../components/UI";
import { DIGITAL_MODULES } from "../siteConfig";

export default function DigitalElectronicsPage({ onNavigate }) {
  return (
    <Layout onNavigate={onNavigate}>
      <section className="cit-course-hero">
        <div>
          <Badge variant="active">Available Module · EDG-01</Badge>
          <h1>Elektronika Digital</h1>
          <p>
            Laboratorium visual untuk Boolean logic, gerbang digital, dan perancangan rangkaian interaktif.
            Mulai dari simplifikasi Karnaugh Map hingga circuit workspace tingkat lanjut.
          </p>
        </div>
        <div className="cit-course-stat">
          <strong>3</strong>
          <span>Interactive tools ready</span>
        </div>
      </section>

      <section className="cit-module-section">
        <div className="cit-section-heading compact">
          <div>
            <Badge>Tool Collection</Badge>
            <h2>Pilih workspace</h2>
          </div>
          <Button href="/" variant="ghost" onNavigate={onNavigate}>← Kembali ke Home</Button>
        </div>
        <div className="cit-module-grid">
          {DIGITAL_MODULES.map((module) => (
            <ModuleCard key={module.id} module={module} onNavigate={onNavigate} />
          ))}
        </div>
      </section>

      <section className="cit-offline-note">
        <Badge variant="active">Offline-first</Badge>
        <h2>Circuit IDE bekerja tanpa AI.</h2>
        <p>
          Fitur simulasi dan penyambungan rangkaian dibuat untuk berjalan lokal. Integrasi AI hanya dapat
          menjadi plugin opsional di masa depan, bukan syarat penggunaan aplikasi.
        </p>
      </section>
    </Layout>
  );
}
