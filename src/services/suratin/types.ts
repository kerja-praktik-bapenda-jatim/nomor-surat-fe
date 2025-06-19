export interface Letterins {
  id: string;
  tahun: number; // ✅ Tambah field tahun
  noAgenda: number;
  noSurat: string;
  suratDari: string;
  perihal: string;
  tglSurat: string;
  diterimaTgl: string;
  langsungKe: boolean;
  ditujukanKe: string;
  agenda: boolean;
  filename: string | null;
  filePath: string | null;
  classificationId: string;
  letterTypeId: string;
  createdAt: string;
  updatedAt: string;
  userId: string;
  updateUserId: string;

  // Relations
  Classification: {
    id: string;
    name: string;
  };
  LetterType: {
    id: string;
    name: string;
  };
  Agenda?: {
    id: string;
    tglMulai: string;
    tglSelesai: string;
    jamMulai: string;
    jamSelesai: string;
    tempat: string;
    acara: string;
    catatan: string;
    letterIn_id: string;
  };
  CreateUser: {
    username: string;
  };
  UpdateUser: {
    username: string;
  };
}

export interface LetterResponse {
  id: string;
  tahun: number; // ✅ Tambah field tahun
  noAgenda: number;
  noSurat: string;
  suratDari: string;
  perihal: string;
  tglSurat: string;
  diterimaTgl: string;
  langsungKe: boolean;
  ditujukanKe: string;
  agenda: boolean;
  // ✅ HAPUS field upload, ganti dengan filename dan filePath
  filename: string | null;    // ✅ TAMBAH INI
  filePath: string | null;    // ✅ TAMBAH INI
  classificationId: string;
  letterTypeId: string;
  createdAt: string;
  updatedAt: string;
  userId: string;

  // Relations
  Classification: {
    id: string;
    name: string;
  };
  LetterType: {
    id: string;
    name: string;
  };
  Agenda?: {
    id: string;
    tglMulai: string;
    tglSelesai: string;
    jamMulai: string;
    jamSelesai: string;
    tempat: string;
    acara: string;
    catatan: string;
    letterIn_id: string;
  };
}

// ✅ INTERFACE BARU: Response wrapper untuk pagination
export interface LetterinsResponse {
  data: Letterins[];
  pagination: {
    currentPage: number;
    totalPages: number;
    totalRows: number;
    rowsPerPage: number;
    hasNextPage: boolean;
    hasPrevPage: boolean;
    nextPage: number | null;
    prevPage: number | null;
  };
  success: boolean;
}

// ✅ INTERFACE BARU: Response untuk next agenda number
export interface NextAgendaResponse {
  tahun: number;
  noAgenda: number;
  formatted: string; // format: "2025/1"
}

// ✅ PERBAIKAN: Update interface untuk surat masuk (TANPA noAgenda)
export interface UpdateLetterInRequest {
  // noAgenda DIHAPUS karena readonly dan auto-generate
  noSurat: string;
  suratDari: string;
  perihal: string;
  tglSurat: string;
  diterimaTgl: string;
  langsungKe: boolean;
  ditujukanKe: string;
  agenda: boolean;
  classificationId: string;
  letterTypeId: string;
  file?: File | null;

  // Agenda fields (optional, only if agenda is true)
  tglMulai?: string;
  tglSelesai?: string;
  jamMulai?: string;
  jamSelesai?: string;
  tempat?: string;
  acara?: string;
  catatan?: string;
}

// ✅ Keep the old one for backward compatibility (TANPA noAgenda)
export interface UpdateLetterResponse {
  noSurat: string;
  suratDari: string;
  perihal: string;
  tglSurat: string;
  diterimaTgl: string;
  langsungKe: boolean;
  ditujukanKe: string;
  agenda: boolean;
  classificationId: string;
  letterTypeId: string;
  file: File | null;

  // Agenda fields (optional, only if agenda is true)
  tglMulai?: string;
  tglSelesai?: string;
  jamMulai?: string;
  jamSelesai?: string;
  tempat?: string;
  acara?: string;
  catatan?: string;
}

export interface AgendaResponse {
  id: string;
  tglMulai: string;
  tglSelesai: string;
  jamMulai: string;
  jamSelesai: string;
  tempat: string;
  acara: string;
  catatan: string;
  letterIn_id: string;
  createdAt: string;
  updatedAt: string;
  LetterIn: {
    id: string;
    noSurat: string;
    perihal: string;
    suratDari: string;
    tahun: number; // ✅ Tambah tahun
    noAgenda: number; // ✅ Tambah noAgenda
  };
}

// ✅ PERBAIKAN: Interface untuk export
export interface InputExport {
  startDate: string;
  endDate: string;
  classificationId?: string;
  letterTypeId?: string;
  departmentId?: string;
  // ✅ Tambahkan property untuk surat masuk
  suratDari?: string;
  perihal?: string;
}
