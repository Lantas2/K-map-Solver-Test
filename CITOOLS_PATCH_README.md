# CITools Refactor Patch

Patch ini mengubah project menjadi platform CITools tanpa menghapus logika K-Map, Learning Mode, atau Circuit IDE yang sudah bekerja.

## File yang diubah
- `index.html`
- `src/App.jsx`

## File baru
- `public/404.html` — fallback route untuk GitHub Pages.
- `src/platform/CIToolsApp.jsx`
- `src/platform/citools.css`
- `src/platform/siteConfig.js`
- `src/platform/components/Layout.jsx`
- `src/platform/components/UI.jsx`
- `src/platform/pages/HomePage.jsx`
- `src/platform/pages/DigitalElectronicsPage.jsx`
- `src/platform/pages/AboutPage.jsx`

## Route
- `/` — Home CITools
- `/digital-electronics` — modul Elektronika Digital
- `/digital-electronics/kmap` — K-Map Solver
- `/digital-electronics/logic-lab` — Learning Mode
- `/digital-electronics/circuit-ide` — Circuit IDE
- `/about` — informasi project dan pembuat

## Cara pasang
Copy isi patch ke root project lama dan replace hanya file yang bernama sama. Jangan menghapus file/folder lain.

## Validasi
- `npm run build` berhasil.
- `npm run lint` berhasil.
