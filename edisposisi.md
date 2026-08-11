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
    │   ├── db.ts                   # Firestore & LocalStorage CRUD + public submissions
    │   └── docxtemplater.ts        # Generator & ekspor file .docx Mail Merge
    ├── context/
    │   └── AuthContext.tsx         # State management global user, role, disposisi & public submissions
    └── components/
        ├── Navbar.tsx              # Header branding, indikator role, logout confirmation modal, theme toggle, & mobile responsive
        ├── Sidebar.tsx             # Sidebar navigasi sesuai hak akses role
        ├── DashboardStats.tsx      # Analytics KPI cards & grafik penugasan PBT
        ├── SuratList.tsx           # Tabel rekapitulasi surat, filter, ekspor docx, & custom delete confirmation modal
        ├── SuratFormModal.tsx      # Modal form input surat baru & disposisi admin
        ├── BendaharaPage.tsx       # Halaman Bendahara untuk mengedit field pembayaran
        ├── UserApprovalModal.tsx   # Panel persetujuan registrasi & hapus user aktif
        ├── LoginRegister.tsx       # Halaman Login, Registrasi, & Tab Permohonan Surat Publik
        ├── PublicSuratForm.tsx     # Form permohonan surat publik (tanpa login)
        ├── PublicSubmissionsReview.tsx # Halaman review permohonan publik (Operator/Admin) dengan optimistic status update
        └── FirebaseConfigModal.tsx # Modal pengaturan kredensial Firebase asli
    ```

---

## 🗄️ Desain Basis Data (Cloud Firestore)

Sistem menggunakan 3 koleksi utama di Cloud Firestore (atau LocalStorage pada mode Demo):

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

### 3. Koleksi Permohonan Publik: `public_submissions`
| Nama Field | Tipe Data | Keterangan & Validasi |
| :--- | :--- | :--- |
| `id` | String | Unique ID dokumen (misal: `PUB-1722849200-x7y8z9`) |
| `surat_dari` | String | Asal instansi / kelompok tani / produsen pemohon |
| `hal_type` | String | Jenis perihal: `Sertifikasi` atau `Wasar` |
| `hal` | String | Rincian kategori perihal (Dropdown Pilihan) |
| `link_dokumen` | String (URL/DataURL) | Link Google Drive PDF atau file terkompresi base64 |
| `status` | String | Status review: `pending` | `processed` | `rejected` |
| `created_at` | String (Timestamp) | Tanggal & waktu permohonan dibuat |
| `updated_at` | String (Timestamp) | Tanggal & waktu permohonan terakhir diperbarui |

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
    * **Review Permohonan Publik:** Meninjau daftar permohonan surat dari publik (tanpa login) di halaman **"Permohonan Publik"** dan mengubah status menjadi `processed` atau `rejected`.
    * **Konfirmasi Hapus:** Dialog konfirmasi custom sebelum menghapus data surat.

### 3. Role: Admin (Koordinator UPT PSBTPH Malang)
 * **Hak Akses:**
    * Akses penuh ke seluruh fitur dan data sistem.
    * **Manajemen & Approval User:** Menyetujui registrasi pengguna baru, memilih role (`admin`, `operator`, `pbt`, `bendahara`), menetapkan pemetaan nama PBT, serta **menghapus akun pengguna aktif**.
    * **Proses Disposisi:** Menentukan petugas PBT (`petugas`), mencentang instruksi disposisi (`catatan`), mengisi catatan manual, dan menetapkan tanggal disposisi.
    * Mengedit, menghapus, serta mendownload dokumen disposisi `.docx`.
    * **Review Permohonan Publik:** Sama seperti Operator, Admin juga dapat meninjau dan mengubah status permohonan surat publik menjadi `processed` atau `rejected`.
    * **Konfirmasi Hapus:** Dialog konfirmasi custom sebelum menghapus data surat.
    * **Konfirmasi Logout:** Dialog konfirmasi sebelum keluar dari sistem.

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

## 📱 Responsivitas Mobile

Aplikasi telah dioptimalkan untuk perangkat mobile dengan layout yang adaptif:
- **Navbar**: menu dan tombol aksi menyesuaikan layar kecil
- **Sidebar**: navigasi collapsed pada layar mobile
- **Tabel surat**: horizontal scroll pada layar kecil
- **Form**: input dan tombol menyesuaikan ukuran layar
- **Modal**: dialog konfirmasi dan form modal menyesuaikan layar mobile

---

## 📝 Form Permohonan Surat Publik (Tanpa Login)

Aplikasi menyediakan form permohonan surat khusus untuk publik yang dapat diakses **tanpa perlu login atau membuat akun**. Form ini tersedia melalui tombol **"Permohonan Surat"** pada halaman login.

### Alur Permohonan Publik:
1. Pengunjung membuka halaman login aplikasi
2. Klik tab **"Permohonan Surat"** pada tab switcher
3. Pilih kategori perihal: **Sertifikasi Benih** atau **Wasar (Pengawasan Pemasaran)**
4. Isi data: nama instansi/pemohon (`surat_dari`), pilih jenis perihal (`hal`), dan lampirkan dokumen PDF via URL Google Drive atau upload file
5. File yang diupload akan dikompres otomatis (maks 2MB) untuk mengoptimalkan ukuran
6. Verifikasi keamanan: jawab captcha aritmatika sederhana
7. Setelah 3 detik (timer keamanan), form dapat dikirim
8. Data disimpan ke koleksi Firestore `public_submissions` dengan **status `pending`**

### Fitur Keamanan Form Publik:
- **Honeypot field**: kolom tersembunyi untuk deteksi bot
- **Rate limiting**: batas 1 permohonan per 5 menit per browser (localStorage)
- **Captcha aritmatika**: verifikasi sederhana untuk mencegah spam
- **Timer minimum**: form tidak dapat dikirim sebelum 3 detik

---

## 🔍 Review Permohonan Surat Publik (Operator & Admin)

Setelah permohonan publik masuk dengan status `pending`, role **Operator** dan **Admin** dapat meninjau dan memproses permohonan tersebut melalui halaman **"Permohonan Publik"** di sidebar navigasi.

### Fitur Halaman Review:
- **Statistik real-time**: menampilkan jumlah total, pending, processed, dan rejected
- **Filter status**: filter daftar berdasarkan status (Semua, Pending, Processed, Rejected)
- **Detail lengkap**: menampilkan surat dari, kategori hal, link dokumen, dan timestamp
- **Aksi cepat**: tombol **Processed** (hijau) dan **Rejected** (merah) untuk setiap permohonan pending
- **Optimistic UI update**: saat tombol **Processed** diklik, status langsung berubah menjadi `processed` dan tombol aksi hilang untuk mencegah klik ganda
- **Real-time sync**: perubahan status langsung terupdate di semua client yang aktif
- **Error handling**: jika update Firestore gagal, status lokal otomatis dikembalikan ke semula dan pesan error ditampilkan

### Hak Akses Review:
- **Operator Surat**: dapat melihat dan mengubah status permohonan publik
- **Admin Koordinator**: dapat melihat dan mengubah status permohonan publik
- **PBT & Bendahara**: tidak memiliki akses ke halaman review permohonan publik

## 🗑️ Konfirmasi Hapus Data

Sistem menggunakan dialog konfirmasi custom (bukan dialog native browser) untuk mencegah penghapusan data yang tidak disengaja.

### Fitur Konfirmasi Hapus:
- **Dark backdrop dengan blur**: fokus ke dialog konfirmasi
- **Informasi detail**: menampilkan data yang akan dihapus (nomor agenda, pengirim, nomor surat)
- **Peringatan file terlampir**: menampilkan peringatan jika ada dokumen yang terhubung
- **Tombol aksi**: **Batal** dan **Ya, Hapus** dengan warna yang jelas

### Lokasi Dialog Konfirmasi:
- **Hapus Surat**: di `SuratList.tsx` saat menekan tombol hapus pada baris tabel surat
- **Logout**: di `Navbar.tsx` saat menekan tombol logout, menampilkan dialog konfirmasi sebelum keluar dari sistem

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

### 4. Akun Demo (Quick Login):
Sistem menyediakan tombol **Quick Login Demo (1-Click)** di halaman login untuk menguji berbagai role tanpa perlu memasukkan kredensial:
- **Admin**: klik tombol "Admin" untuk login sebagai Koordinator Admin UPT
- **Operator**: klik tombol "Operator" untuk login sebagai Operator Surat
- **PBT**: klik tombol "PBT" untuk login sebagai Petugas Pengawas Benih Tanaman

---
*Dokumentasi ini dibuat otomatis oleh AI Assistant Antigravity untuk UPT PSBTPH IV Jawa Timur Wilayah Kerja Malang.*
