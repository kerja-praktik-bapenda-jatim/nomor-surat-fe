import { useQuery } from "@tanstack/react-query";
import ky from "ky";
import { getTokenFromCookies } from "@/services/auth";
import type {
  Classification,
  LetterType,
  LetterIn,
  Disposisi,
  Agenda,
  ApiResponse,
  CreateLetterInData,
  CreateDisposisiData,
  CreateAgendaData
} from "./types";

const BASE_URL = process.env.API_BASE_URL as string;

const createAuthHeaders = () => ({
  Authorization: `Bearer ${getTokenFromCookies()}`,
});

const createJsonHeaders = () => ({
  ...createAuthHeaders(),
  'Content-Type': 'application/json',
});

export const getClassifications = async (): Promise<Classification[]> => {
  return await ky
    .get(`${BASE_URL}classification`, { headers: createAuthHeaders() })
    .json<Classification[]>();
};

export const getLetterTypes = async (): Promise<LetterType[]> => {
  return await ky
    .get(`${BASE_URL}lettertype`, { headers: createAuthHeaders() })
    .json<LetterType[]>();
};

export const createLetterType = async (name: string): Promise<LetterType> => {
  return await ky
    .post(`${BASE_URL}lettertype`, {
      headers: createJsonHeaders(),
      json: { name },
    })
    .json<LetterType>();
};

export const updateLetterType = async (
  id: string,
  oldName: string,
  newName: string
): Promise<LetterType> => {
  const response = await ky
    .patch(`${BASE_URL}lettertype/${id}`, {
      headers: createJsonHeaders(),
      json: { id: parseInt(id), oldName, newName },
    })
    .json<{ message: string; data: LetterType }>();
  return response.data;
};

export const deleteLetterType = async (id: string): Promise<void> => {
  await ky.delete(`${BASE_URL}lettertype/${id}`, {
    headers: createAuthHeaders(),
  });
};

export const getLetters = async (params?: {
  page?: number;
  limit?: number;
  startDate?: string;
  endDate?: string;
  perihal?: string;
  suratDari?: string;
  classificationId?: string;
  order?: string;
}): Promise<ApiResponse<LetterIn[]>> => {
  const searchParams = new URLSearchParams();
  if (params) {
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== '') {
        searchParams.append(key, value.toString());
      }
    });
  }

  return await ky
    .get(`${BASE_URL}letterin${searchParams.toString() ? `?${searchParams}` : ''}`, {
      headers: createAuthHeaders(),
    })
    .json<ApiResponse<LetterIn[]>>();
};

export const getLetterById = async (id: string): Promise<LetterIn> => {
  return await ky
    .get(`${BASE_URL}letterin/${id}`, { headers: createAuthHeaders() })
    .json<LetterIn>();
};

export const createLetter = async (data: CreateLetterInData): Promise<LetterIn> => {
  const formData = new FormData();
  Object.entries(data).forEach(([key, value]) => {
    if (value !== undefined && value !== null) {
      formData.append(key, value.toString());
    }
  });

  return await ky
    .post(`${BASE_URL}letterin`, {
      headers: createAuthHeaders(),
      body: formData,
    })
    .json<LetterIn>();
};

export const updateLetter = async (id: string, data: Partial<CreateLetterInData>): Promise<LetterIn> => {
  const formData = new FormData();
  Object.entries(data).forEach(([key, value]) => {
    if (value !== undefined && value !== null) {
      formData.append(key, value.toString());
    }
  });

  return await ky
    .patch(`${BASE_URL}letterin/${id}`, {
      headers: createAuthHeaders(),
      body: formData,
    })
    .json<LetterIn>();
};

export const deleteLetter = async (id: string): Promise<void> => {
  await ky.delete(`${BASE_URL}letterin/${id}`, {
    headers: createAuthHeaders(),
  });
};

export const downloadLetterFile = async (id: string): Promise<Blob> => {
  return await ky
    .get(`${BASE_URL}letterin/download/${id}`, { headers: createAuthHeaders() })
    .blob();
};

export const searchLetterByAgenda = async (agendaNumber: string): Promise<LetterIn> => {
  return await ky
    .get(`${BASE_URL}letterin/search/${agendaNumber}`, { headers: createAuthHeaders() })
    .json<LetterIn>();
};

export const getNextAgendaNumber = async (): Promise<{
  tahun: number;
  noAgenda: number;
  formatted: string;
}> => {
  return await ky
    .get(`${BASE_URL}letterin/next-agenda`, { headers: createAuthHeaders() })
    .json();
};

export const exportLetters = async (params: {
  startDate: string;
  endDate: string;
  classificationId?: string;
}): Promise<Blob> => {
  const searchParams = new URLSearchParams();
  Object.entries(params).forEach(([key, value]) => {
    if (value) searchParams.append(key, value);
  });

  return await ky
    .get(`${BASE_URL}letterin/export?${searchParams}`, { headers: createAuthHeaders() })
    .blob();
};

export const getDispositions = async (params?: {
  page?: number;
  limit?: number;
  letterIn_id?: string;
  year?: string;
  sortBy?: string;
  sortOrder?: string;
}): Promise<ApiResponse<Disposisi[]>> => {
  const searchParams = new URLSearchParams();
  if (params) {
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== '') {
        searchParams.append(key, value.toString());
      }
    });
  }

  return await ky
    .get(`${BASE_URL}disposisi-letterin${searchParams.toString() ? `?${searchParams}` : ''}`, {
      headers: createAuthHeaders(),
    })
    .json<ApiResponse<Disposisi[]>>();
};

export const getDispositionById = async (id: string): Promise<ApiResponse<Disposisi>> => {
  return await ky
    .get(`${BASE_URL}disposisi-letterin/${id}`, { headers: createAuthHeaders() })
    .json<ApiResponse<Disposisi>>();
};

export const createDisposition = async (data: CreateDisposisiData): Promise<ApiResponse<Disposisi>> => {
  return await ky
    .post(`${BASE_URL}disposisi-letterin`, {
      headers: createJsonHeaders(),
      json: data,
    })
    .json<ApiResponse<Disposisi>>();
};

export const updateDisposition = async (id: string, data: Partial<CreateDisposisiData>): Promise<ApiResponse<Disposisi>> => {
  return await ky
    .put(`${BASE_URL}disposisi-letterin/${id}`, {
      headers: createJsonHeaders(),
      json: data,
    })
    .json<ApiResponse<Disposisi>>();
};

export const deleteDisposition = async (id: string): Promise<ApiResponse<void>> => {
  return await ky
    .delete(`${BASE_URL}disposisi-letterin/${id}`, { headers: createAuthHeaders() })
    .json<ApiResponse<void>>();
};

export const getNextDispositionNumber = async (): Promise<ApiResponse<{
  noDispo: number;
  maxExisting: number;
  strategy: string;
  message: string;
}>> => {
  return await ky
    .get(`${BASE_URL}disposisi-letterin/next-number`, { headers: createAuthHeaders() })
    .json();
};

export const checkLetterDisposition = async (letterIn_id: string): Promise<ApiResponse<{
  isDisposed: boolean;
  letterIn_id: string;
  dispositions: Disposisi[];
  count: number;
  message: string;
}>> => {
  return await ky
    .get(`${BASE_URL}disposisi-letterin/check-letter/${letterIn_id}`, { headers: createAuthHeaders() })
    .json();
};

export const getDispositionStats = async (year?: string): Promise<ApiResponse<{
  total: number;
  yearly: number;
  monthly: number;
  today: number;
  year: number;
}>> => {
  const searchParams = year ? `?year=${year}` : '';
  return await ky
    .get(`${BASE_URL}disposisi-letterin/stats${searchParams}`, { headers: createAuthHeaders() })
    .json();
};

export const getAgendas = async (): Promise<Agenda[]> => {
  return await ky
    .get(`${BASE_URL}agenda-surat`, { headers: createAuthHeaders() })
    .json<Agenda[]>();
};

export const getAgendaById = async (id: string): Promise<Agenda> => {
  return await ky
    .get(`${BASE_URL}agenda-surat/${id}`, { headers: createAuthHeaders() })
    .json<Agenda>();
};

export const createAgenda = async (data: CreateAgendaData): Promise<Agenda> => {
  return await ky
    .post(`${BASE_URL}agenda-surat`, {
      headers: createJsonHeaders(),
      json: data,
    })
    .json<Agenda>();
};

export const deleteAgenda = async (id: string): Promise<void> => {
  await ky.delete(`${BASE_URL}agenda-surat/${id}`, {
    headers: createAuthHeaders(),
  });
};

export const useClassifications = () =>
  useQuery<Classification[]>({
    queryKey: ["classifications"],
    queryFn: getClassifications,
    staleTime: 5 * 60 * 1000,
    refetchOnMount: false,
    refetchOnWindowFocus: false,
  });

export const useLetterTypes = () =>
  useQuery<LetterType[]>({
    queryKey: ["letterTypes"],
    queryFn: getLetterTypes,
    staleTime: 5 * 60 * 1000,
    refetchOnMount: false,
    refetchOnWindowFocus: false,
  });
