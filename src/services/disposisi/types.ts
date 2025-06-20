export interface Disposisi {
  id: string;
  noDispo: number;
  tglDispo: string;
  dispoKe: string[]; // Array untuk multiple departments
  isiDispo: string;
  letterIn_id: string;
  createdAt: string;
  updatedAt: string;
  userId: string;
  updateUserId: string;

  // Relations
  LetterIn: {
    id: string;
    tahun: number;
    noAgenda: number;
    noSurat: string;
    suratDari: string;
    perihal: string;
    tglSurat: string;
    diterimaTgl: string;
    ditujukanKe: string;
    classificationId: string;
    letterTypeId: string;
    Classification: {
      id: string;
      name: string;
    };
    LetterType: {
      id: string;
      name: string;
    };
  };
  CreateUser: {
    username: string;
  };
  UpdateUser: {
    username: string;
  };
}

export interface DisposisiResponse {
  id: string;
  noDispo: number;
  tglDispo: string;
  dispoKe: string[];
  isiDispo: string;
  letterIn_id: string;
  createdAt: string;
  updatedAt: string;
  userId: string;

  // Relations
  LetterIn: {
    id: string;
    tahun: number;
    noAgenda: number;
    noSurat: string;
    suratDari: string;
    perihal: string;
    tglSurat: string;
    diterimaTgl: string;
    ditujukanKe: string;
    classificationId: string;
    letterTypeId: string;
    Classification: {
      id: string;
      name: string;
    };
    LetterType: {
      id: string;
      name: string;
    };
  };
}

// Response wrapper untuk pagination
export interface DisposisiListResponse {
  data: Disposisi[];
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

// Interface untuk create disposisi
export interface CreateDisposisiRequest {
  noDispo?: number; // Optional, bisa auto-generate
  tglDispo: string;
  dispoKe: string[]; // Array of department names
  isiDispo: string;
  letterIn_id: string; // Required - ID dari surat masuk
}

// Interface untuk update disposisi
export interface UpdateDisposisiRequest {
  noDispo?: number;
  tglDispo?: string;
  dispoKe?: string[];
  isiDispo?: string;
  letterIn_id?: string;
}

// Interface untuk response pencarian surat berdasarkan agenda
export interface LetterSearchResponse {
  id: string;
  tahun: number;
  noAgenda: number;
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
  filename: string | null;
  filePath: string | null;
  createdAt: string;
  updatedAt: string;

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

// Interface untuk filter/export disposisi
export interface DisposisiExportRequest {
  startDate: string;
  endDate: string;
  letterIn_id?: string;
  departmentName?: string; // Filter berdasarkan department yang didisposisi
  status?: 'active' | 'completed' | 'all';
}

// Interface untuk statistik disposisi
export interface DisposisiStatsResponse {
  totalDisposisi: number;
  disposisiHariIni: number;
  disposisiMingguIni: number;
  disposisiBulanIni: number;
  departmentStats: {
    departmentName: string;
    count: number;
  }[];
}

// Department options untuk dropdown
export interface DepartmentOption {
  value: string;
  label: string;
}

// Constants untuk department yang bisa dipilih (sesuai dengan form)
export const DEPARTMENT_OPTIONS: DepartmentOption[] = [
  { value: 'SEKRETARIAT', label: 'Sekretariat' },
  { value: 'BIDANG PAJAK DAERAH', label: 'Bidang Pajak Daerah' },
  { value: 'BIDANG PERENCANAAN DAN PENGEMBANGAN', label: 'Bidang Perencanaan dan Pengembangan' },
  { value: 'BIDANG RETRIBUSI DAN PENDAPATAN LAIN-LAIN', label: 'Bidang Retribusi dan Pendapatan Lain-lain' },
  { value: 'BIDANG PENGENDALIAN DAN PEMBINAAN', label: 'Bidang Pengendalian dan Pembinaan' },
];

// Export default untuk mudah import
export default DEPARTMENT_OPTIONS;

// Enum untuk status disposisi (jika diperlukan)
export enum DisposisiStatus {
  DRAFT = 'draft',
  SENT = 'sent',
  COMPLETED = 'completed',
  CANCELLED = 'cancelled'
}

// Interface untuk tracking disposisi (future feature)
export interface DisposisiTracking {
  id: string;
  disposisiId: string;
  departmentName: string;
  status: DisposisiStatus;
  tglTerima?: string;
  tglSelesai?: string;
  catatan?: string;
  createdAt: string;
  updatedAt: string;
}
