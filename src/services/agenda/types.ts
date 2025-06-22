export interface AgendaSurat {
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
  LetterIn?: {
    id: string;
    perihal: string;
    surat_dari: string;
    no_surat: string;
  };
}

export interface CreateAgendaSuratPayload {
  tglMulai: string;
  tglSelesai: string;
  jamMulai: string;
  jamSelesai: string;
  tempat: string;
  acara: string;
  catatan?: string;
  letterIn_id?: string | null;
}

export interface ApiResponse {
  message: string;
}

export interface ErrorResponse {
  message: string;
  error?: any;
}
