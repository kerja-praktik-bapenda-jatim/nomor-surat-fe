export interface Classification {
  id: string;
  name: string;
  createdAt: string;
  updatedAt: string;
}

export interface LetterType {
  id: string;
  name: string;
  createdAt: string;
  updatedAt: string;
}

export interface Agenda {
  id: string;
  tglMulai: string;
  tglSelesai: string;
  jamMulai: string;
  jamSelesai: string;
  tempat: string;
  acara: string;
  catatan?: string;
  letterIn_id: string;
  createdAt: string;
  updatedAt: string;
}

export interface LetterIn {
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
  filename?: string;
  filePath?: string;
  classificationId: string;
  letterTypeId: string;
  Classification?: Classification;
  LetterType?: LetterType;
  Agenda?: Agenda;
}

export interface Disposisi {
  id: string;
  noDispo: number;
  tglDispo: string;
  dispoKe: string[];
  isiDispo: string;
  letterIn_id: string;
  createdAt: string;
  updatedAt: string;
  LetterIn?: LetterIn;
}

export interface PaginationInfo {
  currentPage: number;
  totalPages: number;
  totalRows: number;
  rowsPerPage: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
  nextPage?: number;
  prevPage?: number;
}

export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
  pagination?: PaginationInfo;
}

export interface CreateLetterInData {
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
  file: File;
  tglMulai?: string;
  tglSelesai?: string;
  jamMulai?: string;
  jamSelesai?: string;
  tempat?: string;
  acara?: string;
  catatan?: string;
}

export interface CreateDisposisiData {
  letterIn_id: string;
  noDispo: number;
  tglDispo: string;
  dispoKe: string[];
  isiDispo: string;
}

export interface CreateAgendaData {
  tglMulai: string;
  tglSelesai: string;
  jamMulai: string;
  jamSelesai: string;
  tempat: string;
  acara: string;
  catatan?: string;
  letterIn_id: string;
}
