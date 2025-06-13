export interface Letters {
  id: string;
  noAgenda: number;
  noSurat: string;
  suratDari: string;
  perihal: string;
  tglSurat: string;
  diterimaTgl: string;
  langsungKe: boolean;
  ditujukanKe: string;
  agenda: boolean;
  upload: string | null;
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
  noAgenda: number;
  noSurat: string;
  suratDari: string;
  perihal: string;
  tglSurat: string;
  diterimaTgl: string;
  langsungKe: boolean;
  ditujukanKe: string;
  agenda: boolean;
  upload: string | null;
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

// ✅ PERBAIKAN: Update interface untuk surat masuk
export interface UpdateLetterInRequest {
  noAgenda?: number;
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

// ✅ Keep the old one for backward compatibility jika diperlukan
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

export interface InputExport {
  startDate: string;
  endDate: string;
  classificationId?: string;
  letterTypeId?: string;
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
  };
}
