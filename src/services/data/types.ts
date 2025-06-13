export interface BaseString {
    id: string;
    name: string;
}

// ✅ Tambah interface untuk LetterType
export interface LetterType {
    id: number;
    name: string;
    createdAt?: string;
    updatedAt?: string;
}
