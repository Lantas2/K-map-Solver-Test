# CITools — Academic Origin Page Patch

Patch ini dipasang setelah patch Circuit IDE Phase 2 + Academic Footer. Isinya hanya file yang berubah atau baru; jangan menghapus folder project lama.

## Tambahan
- Route baru: `/academic-origin`
- Menu navbar `Asal Universitas` membuka halaman Academic Origin.
- Halaman baru berisi konteks akademik project, logo UNCP, official campus website, portal PMB, Instagram resmi, dan monitor peta kampus.
- Footer sekarang memiliki link menuju Academic Origin.
- Path SVG footer diperbaiki menggunakan `import.meta.env.BASE_URL`, sehingga logo aman saat project dipublish di GitHub Pages pada subfolder repository.

## Data yang digunakan
- Universitas: Universitas Cokroaminoto Palopo (UNCP)
- Website kampus: https://uncp.ac.id/
- Portal PMB: https://pmb.uncp.ac.id/
- Instagram: https://www.instagram.com/uncp_official/
- Lokasi: X5VX+H5G, Jl. Latamacelling, Tompotika, Kec. Wara, Kota Palopo, Sulawesi Selatan 91911

## Instalasi
Copy folder `src` dan `public` dari patch ini ke project CITools lama, lalu replace file dengan nama yang sama.

```bash
npm run dev -- --host 0.0.0.0
```

Buka `/academic-origin` atau klik `Asal Universitas` pada navbar.
