// services/disposisi.ts - REFACTORED CLEAN VERSION

import { useQuery } from "@tanstack/react-query";
import ky from "ky";
import { getTokenFromCookies } from "@/services/auth";

// ========================== CONSTANTS =============================

const BASE_URL = "http://localhost:8080/api/";
const LOCAL_STORAGE_KEYS = {
  DISPOSISI_LIST: "disposisiList",
  LAST_DISPOSISI_NUMBER: "lastDisposisiNumber",
} as const;

// ========================== TYPES =============================

export interface Letter {
  id: string;
  noAgenda: number;
  tahun: number;
  noSurat: string;
  suratDari: string;
  perihal: string;
  tglSurat: string;
  diterimaTgl: string;
  filename?: string; // Added filename property
  Classification?: { id: string; name: string };
  LetterType?: { id: string; name: string };
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
}

export interface CreateDisposisiPayload {
  letterIn_id: string;
  noDispo: number;
  tglDispo: string;
  dispoKe: string[];
  isiDispo: string;
}

export interface LetterDispositionCheck {
  isDisposed: boolean;
  dispositions?: Disposisi[];
  letter?: Letter;
  error?: string;
}

export interface NextDisposisiNumber {
  noDispo: number;
}

// ========================== UTILITIES =============================

const createAuthHeader = () => ({
  Authorization: `Bearer ${getTokenFromCookies()}`
});

const createSearchParam = (tahun: string, noAgenda: string): string => {
  const currentYear = new Date().getFullYear().toString();
  return tahun === currentYear ? noAgenda : `${tahun}/${noAgenda}`;
};

const extractDisposisiNumber = (response: any): number => {
  return response.noDispo ||
         response.no_dispo ||
         response.nextNumber ||
         response.next_number ||
         (typeof response === "number" ? response : 0);
};

const normalizeDispositionsArray = (response: any): any[] => {
  return Array.isArray(response) ? response : (response.data || []);
};

// ========================== LOCAL STORAGE HELPERS =============================

class DisposisiLocalStorage {
  static getLastNumber(): number {
    return parseInt(localStorage.getItem(LOCAL_STORAGE_KEYS.LAST_DISPOSISI_NUMBER) || "0");
  }

  static setLastNumber(number: number): void {
    localStorage.setItem(LOCAL_STORAGE_KEYS.LAST_DISPOSISI_NUMBER, number.toString());
  }

  static getDisposisiList(): Disposisi[] {
    try {
      return JSON.parse(localStorage.getItem(LOCAL_STORAGE_KEYS.DISPOSISI_LIST) || "[]");
    } catch {
      return [];
    }
  }

  static addDisposisi(disposisi: Disposisi): void {
    const list = this.getDisposisiList();
    list.push(disposisi);
    localStorage.setItem(LOCAL_STORAGE_KEYS.DISPOSISI_LIST, JSON.stringify(list));
  }

  static clear(): void {
    localStorage.removeItem(LOCAL_STORAGE_KEYS.DISPOSISI_LIST);
    localStorage.removeItem(LOCAL_STORAGE_KEYS.LAST_DISPOSISI_NUMBER);
  }
}

// ========================== API SERVICES =============================

export class DisposisiApiService {
  static async searchLetterByAgenda(tahun: string, noAgenda: string): Promise<Letter> {
    const searchParam = createSearchParam(tahun, noAgenda);

    return ky
      .get(`${BASE_URL}letterin/search/${searchParam}`, {
        headers: createAuthHeader()
      })
      .json<Letter>();
  }

  static async checkLetterDisposition(tahun: string, noAgenda: string): Promise<LetterDispositionCheck> {
    try {
      const letter = await this.searchLetterByAgenda(tahun, noAgenda);

      try {
        const response = await ky
          .get(`${BASE_URL}disposisi-letterin/check-letter/${letter.id}`, {
            headers: createAuthHeader()
          })
          .json<any>();

        return {
          isDisposed: response.isDisposed || false,
          dispositions: response.dispositions || [],
          letter
        };
      } catch {
        return this.getFallbackLetterDisposition(letter);
      }
    } catch {
      return { isDisposed: false, error: "Surat tidak ditemukan" };
    }
  }

  private static async getFallbackLetterDisposition(letter: Letter): Promise<LetterDispositionCheck> {
    try {
      const response = await ky
        .get(`${BASE_URL}disposisi-letterin`, {
          headers: createAuthHeader(),
          searchParams: { letterIn_id: letter.id, limit: "100" }
        })
        .json<any>();

      const dispositions = normalizeDispositionsArray(response)
        .filter((d: any) => d.letterIn_id === letter.id);

      return {
        isDisposed: dispositions.length > 0,
        dispositions,
        letter
      };
    } catch {
      return { isDisposed: false, letter };
    }
  }

  static async getNextDisposisiNumber(): Promise<NextDisposisiNumber> {
    try {
      // Always use sequential strategy - get max + 1
      const response = await ky
        .get(`${BASE_URL}disposisi-letterin/next-number`, {
          headers: createAuthHeader()
        })
        .json<any>();

      const backendNumber = extractDisposisiNumber(response);

      // Verify this is truly sequential by checking against max
      const maxNumber = await this.getMaxDisposisiNumber();
      const sequentialNumber = Math.max(backendNumber, maxNumber + 1);

      return { noDispo: sequentialNumber };
    } catch {
      return this.generateFallbackNumber();
    }
  }

  private static async getMaxDisposisiNumber(): Promise<number> {
    try {
      const response = await ky
        .get(`${BASE_URL}disposisi-letterin`, {
          headers: createAuthHeader(),
          searchParams: {
            limit: '1',
            sortBy: 'noDispo',
            sortOrder: 'desc'
          }
        })
        .json<any>();

      const data = normalizeDispositionsArray(response);
      return data.length > 0 ? (data[0].noDispo || 0) : 0;
    } catch {
      return 0;
    }
  }

  private static async generateFallbackNumber(): Promise<NextDisposisiNumber> {
    try {
      // Always use max + 1 strategy (no gap filling)
      const response = await ky
        .get(`${BASE_URL}disposisi-letterin`, {
          headers: createAuthHeader()
        })
        .json<any>();

      const data = normalizeDispositionsArray(response);
      const maxNumber = Math.max(...data.map((d: any) => d.noDispo || 0), 0);

      return { noDispo: maxNumber + 1 };
    } catch {
      const localNumber = DisposisiLocalStorage.getLastNumber();
      return { noDispo: localNumber + 1 };
    }
  }

  static generateManualNextNumber(): NextDisposisiNumber {
    const currentNumber = DisposisiLocalStorage.getLastNumber();
    const nextNumber = currentNumber + 1;

    DisposisiLocalStorage.setLastNumber(nextNumber);
    return { noDispo: nextNumber };
  }

  static async createDisposisi(payload: CreateDisposisiPayload): Promise<Disposisi> {
    const response = await fetch(`${BASE_URL}disposisi-letterin`, {
      method: "POST",
      headers: {
        ...createAuthHeader(),
        "Content-Type": "application/json"
      },
      body: JSON.stringify(payload),
    });

    const responseText = await response.text();

    if (!response.ok) {
      const errorData = JSON.parse(responseText);
      throw new Error(errorData.message || `HTTP ${response.status}`);
    }

    const data = JSON.parse(responseText);
    DisposisiLocalStorage.setLastNumber(payload.noDispo);

    return data;
  }

  static async createDisposisiOffline(payload: CreateDisposisiPayload): Promise<Disposisi> {
    const timestamp = new Date().toISOString();
    const disposisi: Disposisi = {
      id: `dispo_${Date.now()}`,
      ...payload,
      createdAt: timestamp,
      updatedAt: timestamp,
    };

    DisposisiLocalStorage.addDisposisi(disposisi);
    DisposisiLocalStorage.setLastNumber(payload.noDispo);

    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 500));

    return disposisi;
  }
}

// ========================== VALIDATION =============================

export class DisposisiValidator {
  static validate(data: CreateDisposisiPayload): string[] {
    const errors: string[] = [];

    if (!data.letterIn_id) {
      errors.push("Data surat harus dipilih");
    }

    if (!data.noDispo) {
      errors.push("Nomor disposisi harus diisi");
    }

    if (!data.tglDispo) {
      errors.push("Tanggal disposisi harus diisi");
    }

    if (!data.dispoKe.length) {
      errors.push("Tujuan disposisi harus dipilih");
    }

    if (!data.isiDispo || data.isiDispo.length < 10) {
      errors.push("Isi disposisi minimal 10 karakter");
    }

    return errors;
  }

  static isValid(data: CreateDisposisiPayload): boolean {
    return this.validate(data).length === 0;
  }
}

// ========================== REACT QUERY HOOKS =============================

export const useLetterByAgenda = (
  tahun: string,
  noAgenda: string,
  enabled: boolean = false
) => {
  return useQuery({
    queryKey: ["letter-by-agenda", tahun, noAgenda],
    queryFn: () => DisposisiApiService.searchLetterByAgenda(tahun, noAgenda),
    enabled: enabled && Boolean(noAgenda),
    retry: 2,
    retryDelay: 1000,
  });
};

export const useLetterDispositionCheck = (
  tahun: string,
  noAgenda: string,
  enabled: boolean = true
) => {
  return useQuery({
    queryKey: ["letter-disposition-check", tahun, noAgenda],
    queryFn: () => DisposisiApiService.checkLetterDisposition(tahun, noAgenda),
    enabled: enabled && Boolean(noAgenda),
    retry: 1,
    staleTime: 30000, // 30 seconds
  });
};

export const useNextDisposisiNumber = () => {
  return useQuery({
    queryKey: ["next-disposisi-number"],
    queryFn: () => DisposisiApiService.getNextDisposisiNumber(),
    enabled: true,
  });
};

export const useNextDisposisiNumberWithFallback = () => {
  return useQuery({
    queryKey: ["next-disposisi-number-fallback"],
    queryFn: async () => {
      try {
        return await DisposisiApiService.getNextDisposisiNumber();
      } catch {
        return DisposisiApiService.generateManualNextNumber();
      }
    },
    retry: false,
    staleTime: 300000, // 5 minutes
  });
};

// ========================== EXPORTS =============================

// Legacy exports for backward compatibility
export const searchLetterByAgenda = DisposisiApiService.searchLetterByAgenda;
export const checkLetterDisposition = DisposisiApiService.checkLetterDisposition;
export const getNextDisposisiNumber = DisposisiApiService.getNextDisposisiNumber;
export const generateManualNextNumber = DisposisiApiService.generateManualNextNumber;
export const createDisposisi = DisposisiApiService.createDisposisi;
export const createDisposisiLocalStorage = DisposisiApiService.createDisposisiOffline;
export const getDisposisiFromLocalStorage = DisposisiLocalStorage.getDisposisiList;
export const clearDisposisiLocalStorage = DisposisiLocalStorage.clear;
export const validateDisposisiData = DisposisiValidator.validate;
