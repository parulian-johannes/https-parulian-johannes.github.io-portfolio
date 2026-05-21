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

Deploy ke Vercel (via GitHub)
--------------------------------
Langkah singkat untuk mendeploy situs ini melalui GitHub + Vercel:

1) Buat repository kosong di GitHub (via web atau `gh repo create`).
2) Tambahkan remote dan push dari folder ini:

```powershell
# ganti <your-remote-url> dengan URL repo GitHub Anda
git remote add origin <your-remote-url>
git branch -M main
git push -u origin main
```

3) Hubungkan repository ke Vercel:
- Buka https://vercel.com/new lalu pilih repository yang baru Anda push
- Pilih "Framework Preset" → "Other" atau "Static"
- Build Command: kosong
- Output Directory: `/` (root)
- Klik Deploy

4) Setelah deploy selesai, Vercel akan memberikan URL produksi.

Alternatif: deploy langsung dari mesin ini via Vercel CLI (`npx vercel --prod`) — saya bisa bantu, namun proses instalasi CLI dan login bersifat interaktif.

Catatan keamanan: jangan membagikan token pribadi lewat chat; gunakan GitHub UI atau undang saya sebagai collaborator bila ingin saya yang menghubungkan repo.
