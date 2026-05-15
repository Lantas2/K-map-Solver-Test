# UI Rewrite Notes — Circuit Atlas Split Console

## INVENTARIS FITUR YANG DIJAGA

NAVIGASI & ROUTING:
- K-Map Solver mode
- Logic Gate Lab mode
- Theme selector
- Dark/Light mode toggle
- Circuit mode selector: Original SOP / Simplified

FITUR PER HALAMAN:
- K-Map Solver:
  - pilih 2/3/4 variabel
  - load sample
  - clear
  - set all
  - toggle label Binary/Variable
  - klik cell K-Map untuk toggle minterm
  - melihat result SOP
  - melihat covered minterms
  - melihat validation
  - melihat grouping
  - melihat Boolean Simplification accordion
  - melihat Logic Circuit
  - zoom circuit
  - melihat Coverage Validation
  - melihat Reasoning accordion
- Logic Gate Lab:
  - pilih gate AND/OR/NOT/NAND/NOR/XOR/XNOR
  - toggle input A/B
  - melihat output Q
  - melihat truth table
  - zoom gate lab
  - melihat Electric Circuit Analogy
  - zoom electric circuit
  - melihat Reasoning

INTERAKSI & LOGIKA:
- Tombol mode K-Map/Gate tetap ada.
- Tombol variable 2/3/4 tetap ada.
- Tombol Load Sample, Clear, Set All tetap ada.
- Tombol Label Binary/Variable tetap ada.
- Selector theme tetap ada.
- Toggle dark/light tetap ada.
- Klik cell K-Map tetap memanggil toggleCell.
- Circuit Original/Simplified dan zoom tetap ada.
- Semua details/accordion tetap ada.
- Logic gate lab controls tetap ada.

DATA & API:
- Aplikasi ini frontend-only untuk K-Map/Gate Lab.
- Tidak ada koneksi database/API yang disentuh.
- Semua logic K-Map, grouping, validation, boolean steps, circuit, gate lab tetap memakai fungsi yang sudah ada.

## 1. AUDIT VISUAL LAMA: DAFTAR LARANGAN
1. Jangan pakai container tengah max-width + card grid seragam.
2. Jangan pakai hero atas → toolbar → section linear seperti template SaaS.
3. Jangan pakai card rounded besar dengan shadow blur seragam.
4. Jangan pakai tombol pill biru/hijau standar.
5. Jangan pakai panel hasil/tabel/list yang semua punya hierarki visual sama.

## 2. IDENTITAS VISUAL BARU
Nama design language: Circuit Atlas Split Console.

Konsepnya adalah meja kerja atlas logika: satu sisi menjadi slab identitas/station label, sisi lain menjadi field kerja yang asimetris. Navigasi dibuat floating command orbit di bawah supaya tidak terasa seperti sidebar/topbar template.

## 3. DESIGN TOKEN
Token utama ada di `src/index.css`:
- warna: --color-void, --color-ink, --color-paper, --color-surface, --color-primary, --color-secondary, --color-accent, --color-danger
- typography: Archivo Black untuk heading, Space Grotesk untuk body
- spacing: --space-1 sampai --space-7 berbasis 4px
- radius: --radius-slit, --radius-card, --radius-display

## 4. ROMBAK KOMPONEN UTAMA
- Layout & navigasi: diganti menjadi split identity + floating command orbit. Tidak memakai sidebar/topbar.
- Tabel/list/data: grouping dan result menjadi ledger/label cards dengan shadow keras dan rotasi minor.
- Form & input: controls menjadi command ribbon full-bleed, bukan toolbar biasa.
- Tombol & CTA: semua tombol menjadi hard-shadow tactile controls.
- Status & notifikasi: status memakai stamp/badge berwarna, bukan alert generik.

## 5. SIGNATURE ELEMENT
Signature element: Boolean Atlas Grid.
Kode ada pada `.signal-grid` dan `.logic-sigil` di CSS. Background berupa grid bergerak dan cap simbol 01/MAP/Σ yang memberi karakter lab logika.

## 6. YANG SENGAJA TIDAK DIGUNAKAN
- Tidak pakai Bootstrap/AdminLTE/Tailwind template.
- Tidak pakai sidebar kiri.
- Tidak pakai topbar full width.
- Tidak pakai max-width 1200px centered dashboard.
- Tidak pakai card grid 3/4 kolom seragam.

## CHECKLIST FITUR MASIH ADA
- [x] Mode K-Map Solver
- [x] Mode Logic Gate Lab
- [x] Pilih 2/3/4 variable
- [x] Load Sample
- [x] Clear
- [x] Set All
- [x] Label Binary/Variable
- [x] Theme selector
- [x] Dark/Light mode
- [x] Toggle cell K-Map
- [x] Result SOP
- [x] Covered minterms
- [x] Grouping overlay
- [x] Grouping list
- [x] Boolean Simplification accordion
- [x] Logic Circuit
- [x] Circuit Original/Simplified
- [x] Circuit zoom
- [x] Coverage Validation
- [x] Reasoning accordion
- [x] Logic gate selector
- [x] Input A/B toggles
- [x] Truth table
- [x] Electric Circuit Analogy
- [x] Electric zoom
