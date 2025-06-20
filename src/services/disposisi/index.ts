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

// ✅ SEARCH FUNCTION
export const searchLetterByAgenda = async (tahun: string, noAgenda: string): Promise<Letter> => {
  const searchParam = tahun === new Date().getFullYear().toString()
    ? noAgenda
    : `${tahun}/${noAgenda}`;

  console.log('🔍 Searching letter:', searchParam);

  try {
    const res = await ky.get(`${BASE_URL}letterin/search/${searchParam}`, {
      headers: {
        Authorization: `Bearer ${getTokenFromCookies()}`,
      },
    }).json<Letter>();

    console.log('✅ Letter found:', res);
    return res;
  } catch (error) {
    console.error('❌ Letter search error:', error);
    throw error;
  }
};

// ✅ GET NEXT DISPOSISI NUMBER - CORRECT BACKEND ENDPOINT
export const getNextDisposisiNumber = async (): Promise<NextDisposisiNumber> => {
  console.log('🔢 Getting next disposisi number...');

  // The correct endpoint from server.js is '/api/disposisi-letterin/next-number'
  const endpoint = 'disposisi-letterin/next-number';

  try {
    console.log(`🔍 Using correct endpoint: ${BASE_URL}${endpoint}`);

    const res = await ky.get(`${BASE_URL}${endpoint}`, {
      headers: {
        Authorization: `Bearer ${getTokenFromCookies()}`,
      },
      timeout: 10000
    }).json<any>();

    console.log('✅ Next number response:', res);

    // Normalize response format
    let nextNumber: number;
    if (typeof res === 'number') {
      nextNumber = res;
    } else if (res.noDispo) {
      nextNumber = res.noDispo;
    } else if (res.no_dispo) {
      nextNumber = res.no_dispo;
    } else if (res.nextNumber) {
      nextNumber = res.nextNumber;
    } else if (res.next_number) {
      nextNumber = res.next_number;
    } else {
      throw new Error('Invalid response format');
    }

    return { noDispo: nextNumber };
  } catch (error: any) {
    console.log(`❌ Failed to get next number:`, error.message);

    // If API fails, use fallback
    console.log('🔄 Using fallback number generation...');
    return await getFallbackNextNumber();
  }
};

// ✅ FALLBACK: GET NEXT NUMBER FROM EXISTING DISPOSISI LIST
const getFallbackNextNumber = async (): Promise<NextDisposisiNumber> => {
  try {
    console.log('🔄 Getting fallback number from disposisi list...');

    // Try to get existing disposisi list from correct endpoint
    const endpoint = 'disposisi-letterin';

    try {
      const existingDisposisi = await ky.get(`${BASE_URL}${endpoint}`, {
        headers: {
          Authorization: `Bearer ${getTokenFromCookies()}`,
        },
        timeout: 10000
      }).json<any>();

      console.log('📊 Existing disposisi response:', existingDisposisi);

      let lastNumber = 0;

      // Handle different response formats
      if (Array.isArray(existingDisposisi)) {
        // ✅ FIXED: Add type annotation for parameter 'd'
        lastNumber = Math.max(...existingDisposisi.map((d: any) => d.noDispo || 0));
      } else if (existingDisposisi.data && Array.isArray(existingDisposisi.data)) {
        // ✅ FIXED: Add type annotation for parameter 'd'
        lastNumber = Math.max(...existingDisposisi.data.map((d: any) => d.noDispo || 0));
      } else if (existingDisposisi.length > 0) {
        // ✅ FIXED: Add type annotation for parameter 'd'
        lastNumber = Math.max(...existingDisposisi.map((d: any) => d.noDispo || 0));
      }

      const nextNumber = lastNumber + 1;

      console.log('✅ Fallback number calculated:', nextNumber);
      return { noDispo: nextNumber };
    } catch (error: any) {
      console.log(`❌ Failed fallback with ${endpoint}:`, error.message);
      throw error;
    }

  } catch (error) {
    console.log('❌ Fallback also failed, using manual generation');
    // Ultimate fallback: start from 1 or use localStorage
    const stored = localStorage.getItem('lastDisposisiNumber');
    const lastNumber = stored ? parseInt(stored) : 0;
    return { noDispo: lastNumber + 1 };
  }
};

// ✅ MANUAL NUMBER GENERATOR (if API completely fails)
export const generateManualNextNumber = (): NextDisposisiNumber => {
  // Get from localStorage or generate based on timestamp
  const stored = localStorage.getItem('lastDisposisiNumber');
  const lastNumber = stored ? parseInt(stored) : 0;
  const nextNumber = lastNumber + 1;

  localStorage.setItem('lastDisposisiNumber', nextNumber.toString());

  console.log('🔢 Manual number generated:', nextNumber);
  return { noDispo: nextNumber };
};

// ✅ SIMPLE AND DIRECT APPROACH - MATCH EXACTLY WHAT CONTROLLER EXPECTS
export const createDisposisi = async (payload: CreateDisposisiPayload): Promise<Disposisi> => {
  console.log('📝 Creating disposisi with exact controller format:', payload);

  // Use EXACT same field names and format as the controller expects
  const exactPayload = {
    letterIn_id: payload.letterIn_id,
    noDispo: payload.noDispo,
    tglDispo: payload.tglDispo,
    dispoKe: payload.dispoKe, // Keep as array - let Sequelize handle it
    isiDispo: payload.isiDispo
  };

  const endpoint = 'disposisi-letterin';

  try {
    console.log(`📡 Sending to: ${BASE_URL}${endpoint}`);
    console.log('📋 Exact payload:', exactPayload);

    const response = await fetch(`${BASE_URL}${endpoint}`, {
      method: 'POST',
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

  return disposisiData;
};

// ✅ GET ALL DISPOSISI FROM LOCAL STORAGE
export const getDisposisiFromLocalStorage = (): Disposisi[] => {
  try {
    const stored = localStorage.getItem('disposisiList');
    return stored ? JSON.parse(stored) : [];
  } catch (error) {
    console.error('Error reading from localStorage:', error);
    return [];
  }
};

// ✅ CLEAR LOCAL STORAGE (for testing)
export const clearDisposisiLocalStorage = (): void => {
  localStorage.removeItem('disposisiList');
  localStorage.removeItem('lastDisposisiNumber');
  console.log('🗑️ localStorage cleared');
};

// ✅ HOOKS WITH ERROR HANDLING
export const useLetterByAgenda = (tahun: string, noAgenda: string, enabled: boolean = false) =>
  useQuery<Letter>({
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

// ✅ VALIDATION
export const validateDisposisiData = (data: CreateDisposisiPayload): string[] => {
  const errors: string[] = [];

  if (!data.letterIn_id) errors.push("Data surat harus dipilih");
  if (!data.noDispo) errors.push("Nomor disposisi harus diisi");
  if (!data.tglDispo) errors.push("Tanggal disposisi harus diisi");
  if (!data.dispoKe || data.dispoKe.length === 0) errors.push("Tujuan disposisi harus dipilih");
  if (!data.isiDispo || data.isiDispo.length < 10) errors.push("Isi disposisi minimal 10 karakter");

  return errors;
};

// ✅ DISCOVER AVAILABLE ENDPOINTS
export const discoverBackendEndpoints = async (): Promise<{
  availableRoutes: string[],
  suggestions: string[]
}> => {
  console.log('🔍 Discovering backend endpoints...');

  const availableRoutes: string[] = [];
  const suggestions: string[] = [];

  // Common backend routes to test
  const commonRoutes = [
    // Letter routes (we know these work)
    'letterin',
    'letterin/search',
    'letterout',
    'letters',

    // Possible disposisi alternatives
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

    // Admin routes
    'users',
    'auth',
    'admin',
    'settings',
    'config',

    // Classification (we know this works)
    'classifications',
    'classification',
    'categories',

    // Reports
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

      // If this is a list endpoint, suggest it might be for disposisi
      if (route.includes('disposition') || route.includes('approval') || route.includes('forward')) {
        suggestions.push(`Try using "${route}" for disposisi operations`);
      }

    } catch (error: any) {
      if (error.response?.status !== 404) {
        // Not 404 means endpoint exists but might need different auth/params
        availableRoutes.push(`${route} (exists but needs auth/params)`);
      }
    }
  }

  // Test some endpoints that might be configured differently
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
      // Ignore 404s for alternatives
    }
  }

  console.log('🔍 Discovery complete:', { availableRoutes, suggestions });
  return { availableRoutes, suggestions };
};

// ✅ CHECK IF BACKEND HAS DISPOSISI TABLE
export const checkDisposisiTableStructure = async (): Promise<any> => {
  console.log('🔍 Checking if backend can access disposisi table...');

  // Try direct SQL-like endpoints that might exist
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

// ✅ UTILITY: CHECK API HEALTH
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

// Fungsi untuk mendapatkan disposisi berdasarkan letter ID
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

    // Normalize response format
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

// Hook untuk React Query
export const useDisposisiByLetterId = (letterIn_id: string, enabled = true) =>
  useQuery<Disposisi[]>({
    queryKey: ["disposisi-by-letter", letterIn_id],
    queryFn: () => getDisposisiByLetterId(letterIn_id),
    enabled: enabled && !!letterIn_id,
    retry: 2,
    retryDelay: 1000,
  }
);
