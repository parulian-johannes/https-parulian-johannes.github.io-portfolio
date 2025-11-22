# Portfolio — Nama Anda

Situs portfolio statis modern (template). Dibangun untuk cepat di-deploy dan mudah dikustomisasi.

Fitur utama:
- Layout responsif (mobile-first)
- Tailwind CSS via CDN
- Dark mode dengan localStorage
- Smooth scroll dan project modal

File penting:
- `index.html` — halaman utama
- `styles.css` — beberapa style tambahan
- `script.js` — interaksi (nav, tema, modal)
- `assets/profile.svg` — avatar placeholder

Menjalankan lokalan:
1. Buka `index.html` langsung di browser (fitur dasar bekerja).

Atau jalankan server lokal (direkomendasikan untuk testing fetch / routing):

Powershell (Windows):

```powershell
# jika memiliki Python 3
python -m http.server 8000
# lalu buka http://localhost:8000 di browser
```

Kustomisasi:
- Ganti teks, gambar, dan data pada `index.html`.
- Untuk production, pertimbangkan build pipeline (Tailwind dengan JIT) dan optimasi gambar.

Checklist cepat:
- [ ] Ganti `Nama Anda` dan `email@contoh.com`
- [ ] Tambah resume (`resume.pdf`) ke root jika ingin link download
- [ ] Tambah link proyek di atribut data pada kartu proyek

Jika mau, saya bisa:
- Menambahkan generator project list dari data (JSON/MD)
- Menambahkan form backend atau integrasi Netlify Forms
- Menambahkan CI/CD dan deploy script
