import { useQuery } from "@tanstack/react-query";
import ky from "ky";
import { getTokenFromCookies } from "@/services/auth";
import type {
  Letter,
  Disposisi,
  CreateDisposisiPayload,
  LetterDispositionCheck,
  NextDisposisiNumber
} from "./types";

const BASE_URL = "http://localhost:8080/api/";

const LOCAL_STORAGE_KEYS = {
  DISPOSISI_LIST: "disposisiList",
  LAST_DISPOSISI_NUMBER: "lastDisposisiNumber",
} as const;

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

class DisposisiLocalStorage {
  static getLastNumber(): number {
    if (typeof localStorage === 'undefined') return 0;
    return parseInt(localStorage.getItem(LOCAL_STORAGE_KEYS.LAST_DISPOSISI_NUMBER) || "0");
  }

  static setLastNumber(number: number): void {
    if (typeof localStorage === 'undefined') return;
    localStorage.setItem(LOCAL_STORAGE_KEYS.LAST_DISPOSISI_NUMBER, number.toString());
  }

  static getDisposisiList(): Disposisi[] {
    if (typeof localStorage === 'undefined') return [];
    try {
      return JSON.parse(localStorage.getItem(LOCAL_STORAGE_KEYS.DISPOSISI_LIST) || "[]");
    } catch {
      return [];
    }
  }

  static addDisposisi(disposisi: Disposisi): void {
    if (typeof localStorage === 'undefined') return;
    const list = this.getDisposisiList();
    list.push(disposisi);
    localStorage.setItem(LOCAL_STORAGE_KEYS.DISPOSISI_LIST, JSON.stringify(list));
  }

  static clear(): void {
    if (typeof localStorage === 'undefined') return;
    localStorage.removeItem(LOCAL_STORAGE_KEYS.DISPOSISI_LIST);
    localStorage.removeItem(LOCAL_STORAGE_KEYS.LAST_DISPOSISI_NUMBER);
  }
}

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
      const response = await ky
        .get(`${BASE_URL}disposisi-letterin/next-number`, {
          headers: createAuthHeader()
        })
        .json<any>();

      const backendNumber = extractDisposisiNumber(response);
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
      userId: 'offline-user',
      updateUserId: 'offline-user',
      LetterIn: {
        id: payload.letterIn_id,
        tahun: new Date().getFullYear(),
        noAgenda: 0,
        noSurat: '',
        suratDari: '',
        perihal: '',
        tglSurat: '',
        diterimaTgl: '',
        ditujukanKe: '',
        classificationId: '',
        letterTypeId: '',
        Classification: { id: '', name: '' },
        LetterType: { id: '', name: '' }
      },
      CreateUser: { username: 'offline-user' },
      UpdateUser: { username: 'offline-user' }
    };

    DisposisiLocalStorage.addDisposisi(disposisi);
    DisposisiLocalStorage.setLastNumber(payload.noDispo);

    await new Promise(resolve => setTimeout(resolve, 500));

    return disposisi;
  }
}

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

    if (!data.dispoKe || data.dispoKe.length === 0) {
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
    staleTime: 30000,
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
    staleTime: 300000,
  });
};

export const useDisposisiByLetterId = (letterIn_id: string, enabled = true) => {
  return useQuery<Disposisi[]>({
    queryKey: ["disposisi-by-letter", letterIn_id],
    queryFn: () => getDisposisiByLetterId(letterIn_id),
    enabled: enabled && !!letterIn_id,
    retry: 2,
    retryDelay: 1000,
  });
};

export const getDisposisiByLetterId = async (letterIn_id: string): Promise<Disposisi[]> => {
  try {
    console.log(`🔍 Fetching disposisi for letter: ${letterIn_id}`);

    const res = await ky.get(`${BASE_URL}disposisi-letterin/check-letter/${letterIn_id}`, {
      headers: {
        Authorization: `Bearer ${getTokenFromCookies()}`,
      },
      timeout: 10000
    }).json<any>();

    console.log('✅ Disposisi data:', res);

    if (Array.isArray(res)) {
      return res;
    } else if (res.dispositions) {
      return res.dispositions;
    } else if (res.data) {
      return res.data;
    } else {
      return [res];
    }
  } catch (error) {
    console.error('❌ Error fetching disposisi:', error);
    throw error;
  }
};

export const discoverBackendEndpoints = async (): Promise<{
  availableRoutes: string[],
  suggestions: string[]
}> => {
  console.log('🔍 Discovering backend endpoints...');

  const availableRoutes: string[] = [];
  const suggestions: string[] = [];

  const commonRoutes = [
    'letterin',
    'letterin/search',
    'letterout',
    'letters',
    'disposition',
    'dispositions',
    'approval',
    'approvals',
    'forward',
    'forwards',
    'routing',
    'workflow',
    'assignment',
    'assignments',
    'task',
    'tasks',
    'users',
    'auth',
    'admin',
    'settings',
    'config',
    'classifications',
    'classification',
    'categories',
    'reports',
    'analytics',
    'dashboard'
  ];

  for (const route of commonRoutes) {
    try {
      const response = await ky.get(`${BASE_URL}${route}`, {
        headers: { Authorization: `Bearer ${getTokenFromCookies()}` },
        timeout: 3000
      });

      availableRoutes.push(`GET ${route}`);
      console.log(`✅ Found: GET ${route}`);

      if (route.includes('disposition') || route.includes('approval') || route.includes('forward')) {
        suggestions.push(`Try using "${route}" for disposisi operations`);
      }

    } catch (error: any) {
      if (error.response?.status !== 404) {
        availableRoutes.push(`${route} (exists but needs auth/params)`);
      }
    }
  }

  const alternativeTests = [
    { endpoint: 'api/v1/disposisi', description: 'v1 API' },
    { endpoint: 'v1/disposisi', description: 'v1 prefix' },
    { endpoint: 'admin/disposisi', description: 'admin prefix' },
    { endpoint: 'letter/disposisi', description: 'letter prefix' },
    { endpoint: 'workflow/disposisi', description: 'workflow prefix' },
  ];

  for (const { endpoint, description } of alternativeTests) {
    try {
      await ky.get(`http://localhost:8080/${endpoint}`, {
        headers: { Authorization: `Bearer ${getTokenFromCookies()}` },
        timeout: 3000
      });

      availableRoutes.push(`GET ${endpoint} (${description})`);
      suggestions.push(`Found alternative route: ${endpoint}`);

    } catch (error: any) {

    }
  }

  console.log('🔍 Discovery complete:', { availableRoutes, suggestions });
  return { availableRoutes, suggestions };
};

export const checkDisposisiTableStructure = async (): Promise<any> => {
  console.log('🔍 Checking if backend can access disposisi table...');

  const testEndpoints = [
    'admin/tables',
    'admin/schema',
    'admin/database',
    'dev/tables',
    'debug/tables',
    'meta/tables',
    'system/tables'
  ];

  for (const endpoint of testEndpoints) {
    try {
      const response = await ky.get(`${BASE_URL}${endpoint}`, {
        headers: { Authorization: `Bearer ${getTokenFromCookies()}` },
        timeout: 5000
      });

      const data = await response.json();
      console.log(`✅ Found meta endpoint ${endpoint}:`, data);
      return data;

    } catch (error) {
      continue;
    }
  }

  return null;
};

export const checkDisposisiAPI = async (): Promise<boolean> => {
  try {
    await ky.get(`${BASE_URL}disposisi`, {
      headers: {
        Authorization: `Bearer ${getTokenFromCookies()}`,
      },
      searchParams: { limit: 1 }
    });
    return true;
  } catch (error) {
    return false;
  }
};

export const searchLetterByAgenda = DisposisiApiService.searchLetterByAgenda;
export const checkLetterDisposition = DisposisiApiService.checkLetterDisposition;
export const getNextDisposisiNumber = DisposisiApiService.getNextDisposisiNumber;
export const generateManualNextNumber = DisposisiApiService.generateManualNextNumber;
export const createDisposisi = DisposisiApiService.createDisposisi;
export const createDisposisiLocalStorage = DisposisiApiService.createDisposisiOffline;
export const getDisposisiFromLocalStorage = DisposisiLocalStorage.getDisposisiList;
export const clearDisposisiLocalStorage = DisposisiLocalStorage.clear;
export const validateDisposisiData = DisposisiValidator.validate;
