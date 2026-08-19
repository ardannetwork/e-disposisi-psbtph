# Dokumentasi Arsitektur & Source Code: E-Disposisi UPT PSBTPH Malang

**Aplikasi Web Sistem Informasi E-Disposisi Surat Permohonan Benih**  
*UPT Pengawasan dan Sertifikasi Benih Tanaman Pangan dan Hortikultura IV Jawa Timur Wilayah Kerja Malang*

---

## 📌 Ringkasan Proyek

Aplikasi berbasis web ini dirancang untuk mendigitalisasi proses pengolahan, pengarsipan, dan disposisi surat masuk permohonan pemeriksaan benih di **UPT PSBTPH IV Jawa Timur Wilayah Kerja Malang**. Sistem ini menggantikan lembar disposisi kertas manual dengan alur digital yang efisien, mendukung manajemen peran berbasis hak akses (*Role-Based Access Control*), pencetakan otomatis lembar disposisi `.docx` (*Mail Merge*), serta terhubung ke ekosistem **Firebase (Authentication & Cloud Firestore)**. Aplikasi menggunakan Cloud Firestore sebagai sumber data utama dengan fallback LocalStorage jika Firebase tidak dikonfigurasi.

---

## 🛠️ Arsitektur & Spesifikasi Teknologi

| Layer | Teknologi | Keterangan |
| :--- | :--- | :--- |
| **Frontend Framework** | React 18 + Vite (TypeScript) | Single Page Application (SPA) responsif & cepat |
| **Styling & UI** | Tailwind CSS + Lucide Icons | Palette warna resmi hijau UPT PSBTPH, Glassmorphism, Dark/Light Theme toggle |
| **Document Generation** | `docxtemplater` + `pizzip` + `file-saver` | Generator dokumen `.docx` produsen otomatis via Mail Merge |
| **Database & Engine** | Cloud Firestore + LocalStorage Fallback | Firestore sebagai sumber data utama, LocalStorage hanya fallback |
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
        ├── SuratList.tsx           # Tabel rekapitulasi surat, filter, ekspor docx, pagination, & custom delete confirmation modal
        ├── SuratFormModal.tsx      # Modal form input surat baru & disposisi admin
        ├── BendaharaPage.tsx       # Halaman Bendahara untuk mengedit field pembayaran dengan pagination
        ├── UserApprovalModal.tsx   # Panel persetujuan registrasi & hapus user aktif dengan pagination
        ├── Pagination.tsx          # Komponen reusable pagination untuk tabel data
        ├── LoginRegister.tsx       # Halaman Login, Registrasi, & Tab Permohonan Surat Publik
        ├── PublicSuratForm.tsx     # Form permohonan surat publik (tanpa login)
        ├── PublicSubmissionsReview.tsx # Halaman review permohonan publik (Operator/Admin) dengan optimistic status update
        └── FirebaseConfigModal.tsx # Modal pengaturan kredensial Firebase asli
    ```

---

## 🗄️ Desain Basis Data (Cloud Firestore)

Sistem menggunakan 3 koleksi utama di Cloud Firestore:

### 1. Koleksi Utama: `disposisi_surat`
| Nama Field | Tipe Data | Keterangan & Validasi |
| :--- | :--- | :--- |
| `id` | String | Unique ID dokumen (misal: `disp-1722849200`) |
| `surat_dari` | String | Asal Produsen / kelompok tani / produsen pemohon |
| `nomor_surat` | String | Nomor surat permohonan resmi pemohon |
| `tanggal_surat` | String (Date) | Tanggal terbit surat pemohon (`YYYY-MM-DD`) |
| `diterima_tanggal` | String (Date) | Tanggal surat diterima di kantor UPT Malang |
| `nomor_agenda` | String | Nomor agenda surat masuk (misal: `AGD/2026/08/045`) |
| `sifat` | String | Sifat surat (`Biasa`, `Penting`, `Segera`, `Rahasia`) |
| `hal_type` | String | Jenis perihal: `Sertifikasi` atau `Wasar` |
| `hal` | String | Rincian kategori perihal (Dropdown Pilihan) |
| `pic` | String | Nama PIC / penanggungjawab |
| `petugas` | String | Nama Petugas PBT yang ditugaskan (Dropdown 8 PBT) |
| `kabupaten` | String | Kabupaten asal permohonan |
| `catatan` | Array<String> | Opsi instruksi disposisi yang dicentang |
| `catatan_lain` | String (Optional) | Teks instruksi manual jika *"Lain-lain"* dicentang |
| `link_dokumen` | String (URL) | Link Google Drive PDF berkas surat masuk |
| `status` | Boolean | Status penyelesaian tugas PBT (`true` = Selesai, `false` = Belum) |
| `tanggal_disposisi`| String (Date) | Tanggal disposisi ditetapkan oleh Admin |
| `disposisi_oleh` | String | Nama Admin Koordinator yang memproses disposisi |
| `pembayaran` | String (Optional) | Status pembayaran untuk Bendahara (`Belum Dibayar`, `DP 50%`, `Lunas`, `Dicicil`, `Dibatalkan`) |
| `catatan_text` | String (Optional) | Catatan teks tambahan |
| `nip_oleh` | String (Optional) | NIP petugas yang menandai |
| `created_at` | String (Timestamp) | Tanggal & waktu data dibuat |
| `updated_at` | String (Timestamp) | Tanggal & waktu data terakhir diperbarui |

#### A. Dropdown Kategori Perihal `hal`:
Form input surat kini menggunakan dropdown kategori perihal yang disederhanakan:
- Pemeriksaan Lapang
- PCB Sertifikasi Benih
- PCB Label Ulang
- Pendaftaran Sertifikat Rekomendasi/ Kompetensi Produsen & Pengedar
- Penilaian Ulang Produsen/Pengedar
- Lainnya *(jika dipilih, memunculkan kolom input teks manual untuk perihal custom)*

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
| `surat_dari` | String | Asal Produsen / kelompok tani / produsen pemohon |
| `hal_type` | String | Jenis perihal: `Sertifikasi` atau `Wasar` |
| `hal` | String | Rincian kategori perihal (Dropdown Pilihan) |
| `kabupaten` | String | Kabupaten asal permohonan publik |
| `link_dokumen` | String (URL/DataURL) | Link Google Drive PDF atau file terkompresi base64 |
| `status` | String | Status review: `pending` | `processed` | `rejected` |
| `created_at` | String (Timestamp) | Tanggal & waktu permohonan dibuat |
| `updated_at` | String (Timestamp) | Tanggal & waktu permohonan terakhir diperbarui |

---

## 👥 Manajemen Hak Akses (Role-Based Access Control / RBAC)

### 1. Role: PBT (Pengawas Benih Tanaman)
* **Hak Akses:**
  * Login ke sistem dengan email & password.
  * Proses login mengawait autentikasi Firebase Auth untuk memastikan sesi valid sebelum mengakses data.
  * Melihat data surat/disposisi yang **secara khusus ditugaskan kepada namanya** (`petugas == currentUser.pbt_name`).
  * **Interaktif Status:** Bebas mencentang/mengubah status penyelesaian tugas (`status: true/false`).
  * **Restriksi:** Tidak dapat mengubah data utama surat atau menghapus berkas.

### 2. Role: Operator Surat
  * **Hak Akses:**
      * Login ke sistem dengan email & password.
      * Proses login mengawait autentikasi Firebase Auth untuk memastikan sesi valid sebelum mengakses data.
      * Menginput data surat masuk baru (`surat_dari`, `nomor_surat`, `tanggal_surat`, `diterima_tanggal`, `nomor_agenda`, `sifat`, `hal`, `link_dokumen`).
      * Melihat rekapitulasi seluruh data surat.
      * Mengedit data surat sebelum diproses lebih lanjut oleh Admin.
      * Mendownload lembar disposisi `.docx` siap cetak.
      * **Review Permohonan Publik:** Meninjau daftar permohonan surat dari publik (tanpa login) di halaman **"Permohonan Publik"** dan mengubah status menjadi `processed` atau `rejected`.
      * **Konfirmasi Hapus:** Dialog konfirmasi custom sebelum menghapus data surat.

### 3. Role: Admin (Koordinator UPT PSBTPH Malang)
  * **Hak Akses:**
      * Akses penuh ke seluruh fitur dan data sistem.
      * Login mengawait Firebase Auth, memastikan sesi admin valid sebelum menjalankan akses penuh.
      * **Manajemen & Approval User:** Menyetujui registrasi pengguna baru, memilih role (`admin`, `operator`, `pbt`, `bendahara`), menetapkan pemetaan nama PBT, serta **menghapus akun pengguna aktif**.
      * **Proses Disposisi:** Menentukan petugas PBT (`petugas`), mencentang instruksi disposisi (`catatan`), mengisi catatan manual, dan menetapkan tanggal disposisi.
      * Mengedit, menghapus, serta mendownload dokumen disposisi `.docx`.
      * **Review Permohonan Publik:** Sama seperti Operator, Admin juga dapat meninjau dan mengubah status permohonan surat publik menjadi `processed` atau `rejected`.
      * **Konfirmasi Hapus:** Dialog konfirmasi custom sebelum menghapus data surat.
      * **Konfirmasi Logout:** Dialog konfirmasi sebelum keluar dari sistem.

### 4. Role: Bendahara (Pengelola Keuangan)
  * **Hak Akses:**
    * Login ke sistem dengan email & password.
    * Proses login mengawait autentikasi Firebase Auth untuk memastikan sesi valid.
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

## 🔽 Dropdown Role Switcher (Navbar)

Dropdown simulasi switch role di navbar telah **dihapus** untuk memastikan aplikasi hanya berjalan dalam mode Firebase Live. Semua akses data kini bergantung pada autentikasi Firebase Auth yang valid.

### Perubahan yang Diterapkan:
- Menghapus tombol **Quick Login Demo** dari halaman login
- Menghapus dropdown **Simulasi Switch Role (Demo)** dari navbar
- Menghapus file `src/data/mockData.ts` yang berisi data dummy
- Aplikasi kini hanya memuat data dari Cloud Firestore atau LocalStorage fallback jika Firebase tidak aktif

### Lokasi File yang Berubah:
- [`src/components/Navbar.tsx`](src/components/Navbar.tsx) — menghapus dropdown role switcher
- [`src/components/LoginRegister.tsx`](src/components/LoginRegister.tsx) — menghapus tombol Quick Login Demo
- [`src/context/AuthContext.tsx`](src/context/AuthContext.tsx) — menghapus fungsi `switchDemoRole` dan import mock data
- [`src/data/mockData.ts`](src/data/mockData.ts) — **file dihapus**

---

## 📝 Form Permohonan Surat Publik (Tanpa Login)

Aplikasi menyediakan form permohonan surat khusus untuk publik yang dapat diakses **tanpa perlu login atau membuat akun**. Form ini tersedia melalui tombol **"Permohonan Surat"** pada halaman login.

### Alur Permohonan Publik:
 1. Pengunjung membuka halaman login aplikasi
 2. Klik tab **"Permohonan Surat"** pada tab switcher
 3. Pilih kategori perihal dari dropdown: **Pemeriksaan Lapang**, **PCB Sertifikasi Benih**, **PCB Label Ulang**, **Pendaftaran Sertifikat Rekomendasi/ Kompetensi Produsen & Pengedar**, **Penilaian Ulang Produsen/Pengedar**, atau **Lainnya**
 4. Jika memilih **Lainnya**, isi deskripsi perihal di kolom teks yang muncul
 5. Isi data: nama instansi/pemohon (`surat_dari`), kabupaten, dan lampirkan dokumen PDF via URL Google Drive, upload file, atau kamera
 6. File yang diupload akan dikompres otomatis (maks 2MB) untuk mengoptimalkan ukuran
 7. Verifikasi keamanan: jawab captcha aritmatika sederhana
 8. Setelah 3 detik (timer keamanan), form dapat dikirim
 9. Data disimpan ke koleksi Firestore `public_submissions` dengan **status `pending`**

### Fitur Keamanan Form Publik:
 - **Honeypot field**: kolom tersembunyi untuk deteksi bot
 - **Rate limiting**: batas 1 permohonan per 5 menit per browser (localStorage)
 - **Captcha aritmatika**: verifikasi sederhana untuk mencegah spam
 - **Timer minimum**: form tidak dapat dikirim sebelum 3 detik

 ---

## 📸 Upload Dokumen via Kamera

Form input surat dan form permohonan publik mendukung upload dokumen melalui kamera perangkat seluler.

### Opsi Input Dokumen:
- **Link URL** — memasukkan link Google Drive/URL dokumen
- **Upload File** — memilih file PDF/gambar dari perangkat
- **Kamera** — mengambil foto langsung dari kamera perangkat

### Detail Fitur Kamera:
- Menggunakan input `capture="environment"` untuk mengaktifkan kamera belakang pada perangkat mobile
- Hasil foto otomatis dikompres menggunakan `browser-image-compression` (maks 1MB, lebar/tinggi maks 1920px)
- Preview foto ditampilkan sebelum submit
- Mendukung format JPG dan PNG
- File yang terlalu besar akan ditolak dengan peringatan

### Lokasi Implementasi:
- [`src/components/SuratFormModal.tsx`](src/components/SuratFormModal.tsx) — tombol Kamera di modal input surat
- [`src/components/PublicSuratForm.tsx`](src/components/PublicSuratForm.tsx) — tombol Kamera di form permohonan publik

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

## 📄 Pagination Tabel Data

Semua tabel data di aplikasi kini dilengkapi fitur **pagination** untuk meningkatkan performansi dan kemudahan navigasi saat jumlah data banyak.

### Komponen Pagination:
- **File**: [`src/components/Pagination.tsx`](src/components/Pagination.tsx)
- **Page Size**: 10 data per halaman
- **Fitur**:
  - Navigasi halaman dengan tombol **Sebelum** dan **Berikut**
  - Indikator nomor halaman aktif dengan highlight warna emerald
  - Ellipsis (`...`) untuk menampilkan halaman yang banyak
  - Informasi rentang data: *"Menampilkan 1-10 dari 50 data"*
  - Otomatis disembunyikan jika total data ≤ 10 atau hanya 1 halaman

### Tabel yang Dilengkapi Pagination:
- **SuratList.tsx** — tabel rekapitulasi surat disposisi
- **BendaharaPage.tsx** — tabel kelola pembayaran
- **UserApprovalModal.tsx** — tabel pengguna aktif yang disetujui

### Implementasi:
Setiap komponen tabel menggunakan `.slice()` untuk memotong data sesuai halaman aktif:
```tsx
const [page, setPage] = useState(1);
const PAGE_SIZE = 10;
// Render hanya data di halaman aktif
filteredData.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE)
```

---

## 🖨️ Fitur Mail Merge (Ekspor Dokumen `.docx`)

File service [`src/services/docxtemplater.ts`](src/services/docxtemplater.ts) memuat template XML dokumen Microsoft Word produsen. 

Saat tombol **`.docx`** diklik pada baris tabel:
1. Data dokumen diambil dari Firestore/LocalStorage.
2. `Docxtemplater` memetakan placeholder: `{surat_dari}`, `{nomor_surat}`, `{tanggal_surat}`, `{diterima_tanggal}`, `{nomor_agenda}`, `{sifat}`, `{hal}`, `{petugas}`, `{pic_1}`, `{catatan_text}`, `{tanggal_disposisi}`, `{disposisi_oleh}`.
3. Semua nilai divalidasi sebelum masuk template untuk mencegah `undefined` atau `null` muncul di dokumen.
4. Menghasilkan file `.docx` siap cetak dengan nama file otomatis:  
   `Disposisi_[NoAgenda]_[NamaPBT].docx`.

---

## 🔄 Strategi Pemuatan Data (Firestore-First)

Aplikasi kini menerapkan pendekatan **Firestore sebagai sumber data utama (Source of Truth)**. Berikut adalah alur pemuatan data yang baru:

### Alur Startup Aplikasi:
1. **Initial State**: Semua state data (`usersList`, `disposisiList`, `publicSubmissionsList`) dimulai sebagai array kosong `[]`
2. **Firestore Listener**: `onSnapshot` didaftarkan untuk ketiga koleksi (`users`, `disposisi_surat`, `public_submissions`) segera setelah aplikasi dimulai
3. **Data Real-time**: Setiap perubahan di Firestore langsung diperbarui di UI secara real-time
4. **Status Koneksi**: `isFirebaseActive` diatur menjadi `true` hanya setelah listener Firestore berhasil menerima snapshot pertama

### Fallback ke LocalStorage:
- **Hanya jika** Firebase tidak dikonfigurasi (`firebaseDb === null`) atau listener gagal menerima data
- Aplikasi akan memuat data dari `localStorage` dan menampilkan indikator **"Demo Local"** di navbar
- Semua operasi tulis (create/update/delete) di mode ini hanya menyimpan ke LocalStorage

### Penanganan Error Firestore:
- Jika operasi tulis ke Firestore gagal (error koneksi, izin ditolak, dll), state lokal akan di-**rollback** ke data sebelumnya
- User akan melihat alert dengan pesan error yang jelas
- Data tetap aman di Firestore jika operasi sebelumnya berhasil

## ⚡ Panduan Menjalankan untuk AI Agent / Developer Selanjutnya

### 1. Menjalankan Server Pengembangan (Dev Server):
```bash
npm install
npm run dev
```
Aplikasi akan secara otomatis aktif di `http://localhost:3000`.

### 2. Membangun Bundle Produksi (Build):
```bash
npm run build
```
Hasil build produksi akan tersimpan secara otomatis di folder `dist/`.

### 3. Kredensial Akun Bawaan (Default Credentials):
- 🛡️ **Admin Koordinator**: `admin.malang@psbtph.go.id` | Password: `admin`
- 📋 **Operator Surat**: `operator.malang@psbtph.go.id` | Password: `operator`
- 🌱 **PBT**: `prima.candra@psbtph.go.id` | Password: `pbt`
- 💰 **Bendahara**: `bendahara.malang@psbtph.go.id` | Password: `bendahara`

### 4. Catatan Penting untuk Developer:
- Semua fungsi CRUD (`addDisposisi`, `updateDisposisi`, `deleteDisposisi`, `login`, `registerUser`) kini **async** dan meng-await sinkronisasi ke Firestore
- Jika operasi Firestore gagal, state lokal akan di-**rollback** ke data sebelumnya dan user melihat alert error
- Fitur kamera memerlukan HTTPS atau localhost untuk mengakses kamera perangkat
- Pastikan Firebase sudah dikonfigurasi dengan benar melalui **Firebase Config Modal** sebelum menguji fitur input data
- Jika Firestore belum aktif, data hanya akan disimpan di LocalStorage dan tidak akan tersinkronisasi ke Cloud

---
*Dokumentasi ini dibuat otomatis oleh AI Assistant Antigravity untuk UPT PSBTPH IV Jawa Timur Wilayah Kerja Malang.*
