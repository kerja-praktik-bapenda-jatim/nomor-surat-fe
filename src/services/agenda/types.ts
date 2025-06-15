// Interface untuk Agenda berdasarkan model Sequelize
export interface AgendaSurat {
  id: string;
  tglMulai: string; // Start date
  tglSelesai: string; // End date
  jamMulai: string; // Start time
  jamSelesai: string; // End time
  tempat: string; // Location/place
  acara: string; // Event/activity name
  catatan: string; // Notes
  letterIn_id: string; // Foreign key to LetterIn
  createdAt: string;
  updatedAt: string;
  // Relasi dengan LetterIn
  LetterIn?: {
    id: string;
    subject: string;
    from: string;
    number: string;
    // tambahkan field LetterIn lainnya sesuai kebutuhan
  };
}

// Interface untuk payload saat membuat Agenda baru
// types.ts - Update interface
export interface CreateAgendaSuratPayload {
  tglMulai: string; // Start date
  tglSelesai: string; // End date
  jamMulai: string; // Start time
  jamSelesai: string; // End time
  tempat: string; // Location/place
  acara: string; // Event/activity name
  catatan?: string; // Notes (optional)
  letterIn_id?: string | null; // Foreign key to LetterIn (optional untuk standalone)
}

// Interface untuk response umum dari API
export interface ApiResponse {
  message: string;
}

// Interface untuk response error
export interface ErrorResponse {
  message: string;
  error?: any;
}
