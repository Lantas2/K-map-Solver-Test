# CITools — Circuit IDE Phase 2 + Academic Footer Patch

Patch ini hanya berisi file baru/berubah. Salin isinya ke project CITools lama dan replace file yang sama; jangan menghapus folder project lama.

## Circuit IDE Phase 2
Aktif:
- Clock source dengan Run Clock, Pause, Step Edge, Reset State
- D Flip-Flop
- Register 4-bit
- Counter 4-bit
- Bus 4-bit dan Splitter 4-bit
- Binary Display 4-bit dan Hex Display 4-bit
- Timing Diagram clocked
- Template: D Flip-Flop Lab, Counter 4-bit, Register 4-bit
- Save/load JSON tetap mendukung state sequential

Belum aktif:
- Analog electronics, breadboard, Arduino, AI plugin, RAM/ROM, export PNG.

## Footer identitas akademik
- Footer tiga kolom: CITools, Academic Project/university identity, links
- Logo SVG diletakkan pada public/assets/university/logo.svg
- Fallback teks otomatis jika SVG gagal dimuat
- Brand utama tetap CITools/CIT; universitas tampil sebagai identitas akademik.

## Test
Setelah copy file:
```bash
npm run dev -- --host 0.0.0.0
```

Masuk ke `/digital-electronics/circuit-ide`, lalu pilih template `Counter 4-bit` dan tekan `Run Clock`.
