export interface Letterins {
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
  filename: string | null;
  filePath: string | null;
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

export interface LetterResponse {
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
  filename: string | null;
  filePath: string | null;
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

export interface NextAgendaResponse {
  tahun: number;
  noAgenda: number;
  formatted: string;
}

export interface UpdateLetterInRequest {
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
  tglMulai?: string;
  tglSelesai?: string;
  jamMulai?: string;
  jamSelesai?: string;
  tempat?: string;
  acara?: string;
  catatan?: string;
}

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
    tahun: number;
    noAgenda: number;
  };
}

export interface InputExport {
  startDate: string;
  endDate: string;
  classificationId?: string;
  letterTypeId?: string;
  suratDari?: string;
  perihal?: string;
}
