export type UserRole = 'admin' | 'operator' | 'pbt' | 'bendahara';

export interface UserAccount {
  id: string;
  email: string;
  name: string;
  password?: string;
  role: UserRole;
  approved: boolean;
  pbt_name?: string; // If role is PBT, maps to exact PETUGAS_PBT_LIST item
  createdAt: string;
}

export type HalType = 'Sertifikasi' | 'Wasar';

export interface DisposisiSurat {
  id: string;
  surat_dari: string;
  nomor_surat: string;
  tanggal_surat: string; // YYYY-MM-DD
  diterima_tanggal: string; // YYYY-MM-DD
  nomor_agenda: string;
  sifat: string;
  hal: string; // Selected from HAL_SERTIFIKASI or HAL_WASAR
  hal_type: HalType; // Sertifikasi or Wasar category
  pic: string; // Nama PIC
  petugas: string; // Nama Petugas PBT yang ditugaskan
  kabupaten: string;
  catatan: string[]; // Array of selected checkbox texts
  catatan_lain?: string; // Text if "Lain-lain" checked
  link_dokumen: string; // Google Drive PDF URL
  status: boolean; // true = Selesai, false = Belum
  tanggal_disposisi?: string; // YYYY-MM-DD set by Admin
  disposisi_oleh?: string; // Admin name
  pembayaran?: string; // Payment status/info for bendahara (e.g., "Belum Dibayar", "Dibayar", "DP 50%")
  catatan_text?: string;
  nip_oleh?: string;
  created_at: string;
  updated_at: string;
}

export interface PublicSuratSubmission {
  id: string;
  surat_dari: string;
  hal_type: HalType;
  hal: string;
  kabupaten: string;
  link_dokumen: string;
  status: 'pending' | 'processed' | 'rejected';
  created_at: string;
  updated_at: string;
}

export const HAL_SERTIFIKASI = [
  'Pemeriksaan Pendahuluan',
  'Pemeriksaan Fase Vegetatif',
  'Pemeriksaan Fase Berbunga',
  'Pemeriksaan Fase Masak',
  'Pemeriksaan Umbi',
  'Pengambilan Contoh Benih',
  'Pemeriksaan Siap Salur',
] as const;

export const HAL_WASAR = [
  'PCB LU',
  'Penilaian Produsen Pengedar Baru',
  'Penilaian Produsen Ulang',
] as const;

export const PETUGAS_PBT_LIST = [
  'Prima S. Welli Candra, A.Md.',
  'Shofiana Widiningtyas',
  'Dedy Kristiyawan SP.',
  'Tedy Irawan S. TP.',
  'Ary Danar Kisworo, S.P.',
  'Nedya P. Bachtiar, S.P.',
  'Nanang Budi Astanto',
  'Budi Winarto',
] as const;

export const CATATAN_DEFAULT_OPTIONS = [
  'TL sesuai peraturan yang berlaku',
  'Laporkan PBT yang melaksanakan',
  'Laksanakan maksimal 5 hari dari rencana',
  'Lain-lain',
] as const;

export const SIFAT_OPTIONS = [
  'Biasa',
  'Penting',
  'Segera',
  'Rahasia',
] as const;
