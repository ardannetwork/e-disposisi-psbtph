# Dokumentasi Arsitektur & Source Code: E-Disposisi UPT PSBTPH Malang

**Aplikasi Web Sistem Informasi E-Disposisi Surat Permohonan Benih**  
*UPT Pengawasan dan Sertifikasi Benih Tanaman Pangan dan Hortikultura IV Jawa Timur Wilayah Kerja Malang*

---

## 📌 Ringkasan Proyek

Aplikasi berbasis web ini dirancang untuk mendigitalisasi proses pengolahan, pengarsipan, dan disposisi surat masuk permohonan pemeriksaan benih di **UPT PSBTPH IV Jawa Timur Wilayah Kerja Malang**. Sistem ini menggantikan lembar disposisi kertas manual dengan alur digital yang efisien, mendukung manajemen peran berbasis hak akses (*Role-Based Access Control*), pencetakan otomatis lembar disposisi `.docx` (*Mail Merge*), serta dapat berjalan dalam mode **Demo Local Storage** maupun terhubung ke ekosistem **Firebase (Authentication & Cloud Firestore)**.

---

## 🛠️ Arsitektur & Spesifikasi Teknologi

| Layer | Teknologi | Keterangan |
| :--- | :--- | :--- |
| **Frontend Framework** | React 18 + Vite (TypeScript) | Single Page Application (SPA) responsif & cepat |
| **Styling & UI** | Tailwind CSS + Lucide Icons | Palette warna resmi hijau UPT PSBTPH, Glassmorphism, Dark/Light Theme toggle |
| **Document Generation** | `docxtemplater` + `pizzip` + `file-saver` | Generator dokumen `.docx` instansi otomatis via Mail Merge |
| **Database & Engine** | Cloud Firestore + LocalStorage Fallback | Dual-Engine (Demo Local + Live Firebase Sync) |
| **Authentication** | Firebase Auth + Internal Role Engine | Login email/password dengan mekanisme Admin Approval |

---

## 📁 Struktur Direktori & File Source Code

```text
e-disposisi-psbtph/
├── edisposisi.md                   # Dokumentasi lengkap proyek (File ini)
├── index.html                      # Entry point HTML dengan font Inter & Meta Tag
├── package.json                    # Konfigurasi dependensi npm & build scripts (npx vite)
├── postcss.config.js               # Konfigurasi PostCSS & Tailwind
├── tailwind.config.js              # Custom theme & warna UPT PSBTPH Malang
├── tsconfig.json                   # Konfigurasi TypeScript
├── vite.config.ts                  # Konfigurasi Vite dev server & build
└── src/
    ├── main.tsx                    # Entry point React DOM render
    ├── App.tsx                     # Main layout router & auth state wrapper
    ├── index.css                   # Global styling & custom scrollbar
    ├── types/
    │   └── disposisi.ts            # Interface TypeScript, enum Hal, PBT, & Catatan
    ├── data/
    │   └── mockData.ts             # Initial mock data pengguna & disposisi surat
    ├── services/
    │   ├── firebase.ts             # SDK Firebase initialization & config saver
    │   └── docxtemplater.ts        # Generator & ekspor file .docx Mail Merge
    ├── context/
    │   └── AuthContext.tsx         # State management global user, role, & disposisi CRUD
    └── components/
        ├── Navbar.tsx              # Header branding, indikator role, & logout
        ├── Sidebar.tsx             # Sidebar navigasi sesuai hak akses role
        ├── DashboardStats.tsx      # Analytics KPI cards & grafik penugasan PBT
        ├── SuratList.tsx           # Tabel rekapitulasi surat, filter, & ekspor docx
        ├── SuratFormModal.tsx      # Modal form input surat baru & disposisi admin
        ├── BendaharaPage.tsx       # Halaman Bendahara untuk mengedit field pembayaran
        ├── UserApprovalModal.tsx   # Panel persetujuan registrasi & hapus user aktif
        ├── LoginRegister.tsx       # Halaman Login & Registrasi pengguna baru
        └── FirebaseConfigModal.tsx # Modal pengaturan kredensial Firebase asli
```

---

## 🗄️ Desain Basis Data (Cloud Firestore)

Sistem menggunakan 2 koleksi utama di Cloud Firestore (atau LocalStorage pada mode Demo):

### 1. Koleksi Utama: `disposisi_surat`
| Nama Field | Tipe Data | Keterangan & Validasi |
| :--- | :--- | :--- |
| `id` | String | Unique ID dokumen (misal: `disp-1722849200`) |
| `surat_dari` | String | Asal instansi / kelompok tani / produsen pemohon |
| `nomor_surat` | String | Nomor surat permohonan resmi pemohon |
| `tanggal_surat` | String (Date) | Tanggal terbit surat pemohon (`YYYY-MM-DD`) |
| `diterima_tanggal` | String (Date) | Tanggal surat diterima di kantor UPT Malang |
| `nomor_agenda` | String | Nomor agenda surat masuk (misal: `AGD/2026/08/045`) |
| `sifat` | String | Sifat surat (`Biasa`, `Penting`, `Segera`, `Rahasia`) |
| `hal_type` | String | Jenis perihal: `Sertifikasi` atau `Wasar` |
| `hal` | String | Rincian kategori perihal (Dropdown Pilihan) |
| `petugas` | String | Nama Petugas PBT yang ditugaskan (Dropdown 8 PBT) |
| `catatan` | Array<String> | Opsi instruksi disposisi yang dicentang |
| `catatan_lain` | String | Teks instruksi manual jika *"Lain-lain"* dicentang |
| `link_dokumen` | String (URL) | Link Google Drive PDF berkas surat masuk |
| `status` | Boolean | Status penyelesaian tugas PBT (`true` = Selesai, `false` = Belum) |
| `tanggal_disposisi`| String (Date) | Tanggal disposisi ditetapkan oleh Admin |
| `disposisi_oleh` | String | Nama Admin Koordinator yang memproses disposisi |
| `pembayaran` | String (Optional) | Status pembayaran untuk Bendahara (`Belum Dibayar`, `DP 50%`, `Lunas`, `Dicicil`, `Dibatalkan`) |

#### A. Rincian Pilihan Dropdown `hal`:
* **Kategori A. Sertifikasi Benih:**
  1. *Pemeriksaan Pendahuluan*
  2. *Pemeriksaan Fase Vegetatif*
  3. *Pemeriksaan Fase Berbunga*
  4. *Pemeriksaan Fase Masak*
  5. *Pemeriksaan Umbi*
  6. *Pengambilan Contoh Benih*
  7. *Pemeriksaan Siap Salur*
* **Kategori B. Wasar (Pengawasan Pemasaran):**
  1. *PCB LU*
  2. *Penilaian Produsen Pengedar Baru*
  3. *Penilaian Produsen Ulang*

#### B. Daftar 8 Petugas PBT Aktif (`petugas`):
1. *Prima S. Welli Candra, A.Md.*
2. *Shofiana Widiningtyas*
3. *Dedy Kristiyawan SP.*
4. *Tedy Irawan S. TP.*
5. *Ary Danar Kisworo, S.P.*
6. *Nedya P. Bachtiar, S.P.*
7. *Nanang Budi Astanto*
8. *Budi Winarto*
*(Catatan: Avianita Agustianti, S. TP. bertindak sebagai Koordinator Admin)*.

#### C. Opsi Checkbox Instruksi (`catatan`):
- `[ ] TL sesuai peraturan yang berlaku`
- `[ ] Laporkan PBT yang melaksanakan`
- `[ ] Laksanakan maksimal 5 hari dari rencana`
- `[ ] Lain-lain` *(jika dipilih, memunculkan kolom input teks manual `catatan_lain`)*

---

### 2. Koleksi Pengguna: `users`
| Nama Field | Tipe Data | Keterangan |
| :--- | :--- | :--- |
| `id` | String | Unique ID User |
| `email` | String | Email terdaftar pengguna |
| `name` | String | Nama lengkap pengguna |
| `password` | String | Kata sandi akun |
| `role` | String | Peran hak akses: `admin`, `operator`, `pbt`, atau `bendahara` |
| `approved` | Boolean | `true` = Aktif & disetujui Admin, `false` = Pending Approval |
| `pbt_name` | String (Optional) | Nama PBT yang terhubung jika role = `pbt` |
| `createdAt` | String (Timestamp) | Tanggal registrasi akun |

---

## 👥 Manajemen Hak Akses (Role-Based Access Control / RBAC)

### 1. Role: PBT (Pengawas Benih Tanaman)
* **Hak Akses:**
  * Login ke sistem dengan email & password.
  * Melihat data surat/disposisi yang **secara khusus ditugaskan kepada namanya** (`petugas == currentUser.pbt_name`).
  * **Interaktif Status:** Bebas mencentang/mengubah status penyelesaian tugas (`status: true/false`).
  * **Restriksi:** Tidak dapat mengubah data utama surat atau menghapus berkas.

### 2. Role: Operator Surat
* **Hak Akses:**
  * Login ke sistem dengan email & password.
  * Menginput data surat masuk baru (`surat_dari`, `nomor_surat`, `tanggal_surat`, `diterima_tanggal`, `nomor_agenda`, `sifat`, `hal`, `link_dokumen`).
  * Melihat rekapitulasi seluruh data surat.
  * Mengedit data surat sebelum diproses lebih lanjut oleh Admin.
  * Mendownload lembar disposisi `.docx` siap cetak.

### 3. Role: Admin (Koordinator UPT PSBTPH Malang)
* **Hak Akses:**
  * Akses penuh ke seluruh fitur dan data sistem.
  * **Manajemen & Approval User:** Menyetujui registrasi pengguna baru, memilih role (`admin`, `operator`, `pbt`, `bendahara`), menetapkan pemetaan nama PBT, serta **menghapus akun pengguna aktif**.
  * **Proses Disposisi:** Menentukan petugas PBT (`petugas`), mencentang instruksi disposisi (`catatan`), mengisi catatan manual, dan menetapkan tanggal disposisi.
  * Mengedit, menghapus, serta mendownload dokumen disposisi `.docx`.

### 4. Role: Bendahara (Pengelola Keuangan)
* **Hak Akses:**
  * Login ke sistem dengan email & password.
  * Mengakses halaman **Pembayaran** dari sidebar navigasi.
  * Melihat daftar seluruh surat disposisi dengan status pembayaran.
  * **Mengedit field `pembayaran`** pada setiap surat disposisi (misal: `Belum Dibayar`, `DP 50%`, `Lunas`, `Dicicil`, `Dibatalkan`).
  * **Restriksi:** Tidak dapat mengubah data utama surat, menghapus surat, atau mengakses fitur manajemen user.

---

## 🌗 Tema (Light/Dark Mode)

Aplikasi mendukung toggle antara **Dark Mode** dan **Light Mode**. Pengguna dapat mengganti tema menggunakan tombol toggle di navbar (ikon matahari/bulan). Preferensi tema disimpan di localStorage dan akan tetap dipertahankan saat login kembali.

### Cara Kerja:
- Secara default, aplikasi menggunakan **Dark Mode**
- Tombol toggle di navbar (kanan atas) memungkinkan switch ke **Light Mode**
- Tema dipersist ke `localStorage` dengan key `e_disposisi_theme`
- Semua komponen menggunakan CSS custom properties untuk mendukung kedua tema

---

## 🖨️ Fitur Mail Merge (Ekspor Dokumen `.docx`)

File service [`src/services/docxtemplater.ts`](file:///Users/macintoshhd/.gemini/antigravity/scratch/e-disposisi-psbtph/src/services/docxtemplater.ts) memuat template XML dokumen Microsoft Word instansi. 

Saat tombol **`.docx`** diklik pada baris tabel:
1. Data dokumen diambil dari Firestore/LocalStorage.
2. `Docxtemplater` memetakan placeholder: `{surat_dari}`, `{nomor_surat}`, `{tanggal_surat}`, `{diterima_tanggal}`, `{nomor_agenda}`, `{sifat}`, `{hal}`, `{petugas}`, `{catatan_text}`, `{tanggal_disposisi}`, `{disposisi_oleh}`.
3. Menghasilkan file `.docx` siap cetak dengan nama file otomatis:  
   `Disposisi_[NoAgenda]_[NamaPBT].docx`.

---

## ⚡ Panduan Menjalankan untuk AI Agent / Developer Selanjutnya

### 1. Menjalankan Server Pengembangan (Dev Server):
```bash
cd /Users/macintoshhd/.gemini/antigravity/scratch/e-disposisi-psbtph
npm install
npm run dev
```
Aplikasi akan secara otomatis aktif di `http://localhost:3000`.

### 2. Membangun Bundle Produksi (Build):
```bash
npm run build
```
Hasil build produksi akan tersimpan secara otomatis di folder `dist/`.

### 3. Kredensial Akun Bawaan (Default Demo Credentials):
- 🛡️ **Admin Koordinator**: `admin.malang@psbtph.go.id` | Password: `admin`
- 📋 **Operator Surat**: `operator.malang@psbtph.go.id` | Password: `operator`
- 🌱 **PBT**: `prima.candra@psbtph.go.id` | Password: `pbt`
- 💰 **Bendahara**: `bendahara.malang@psbtph.go.id` | Password: `bendahara`

---
*Dokumentasi ini dibuat otomatis oleh AI Assistant Antigravity untuk UPT PSBTPH IV Jawa Timur Wilayah Kerja Malang.*
