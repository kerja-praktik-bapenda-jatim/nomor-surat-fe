import { useQuery } from "@tanstack/react-query";
import ky from "ky";
import type {
  InputExport,
  LetterResponse,
  Letters,
  UpdateLetterResponse,
  AgendaResponse,
} from "./types";
import { getTokenFromCookies } from "@/services/auth";

const BASE_URL = `${process.env.API_BASE_URL as string}letterin`;
const BASE_URL_AGENDA = `${process.env.API_BASE_URL as string}agenda`;

const mapLetterResponseToLetters = (data: LetterResponse[]): Letters[] => {
  return data.map((item) => ({
    id: item.id,
    noAgenda: item.noAgenda,
    noSurat: item.noSurat,
    suratDari: item.suratDari,
    perihal: item.perihal,
    tglSurat: item.tglSurat,
    diterimaTgl: item.diterimaTgl,
    langsungKe: item.langsungKe,
    ditujukanKe: item.ditujukanKe,
    agenda: item.agenda,
    upload: item.upload,
    classificationId: item.classificationId,
    letterTypeId: item.letterTypeId,
    createdAt: item.createdAt,
    updatedAt: item.updatedAt,
    Classification: item.Classification,
    LetterType: item.LetterType,
    Agenda: item.Agenda,
    // Add default values for backward compatibility
    CreateUser: { username: "Unknown" },
    UpdateUser: { username: "Unknown" },
  }));
};

export const getLetters = async (params?: Record<string, string>) => {
  const res = await ky
    .get(`${BASE_URL}`, {
      headers: {
        Authorization: `Bearer ${getTokenFromCookies()}`,
      },
      searchParams: params,
    })
    .json<LetterResponse[]>();
  return res;
};

export const getAll = async (): Promise<Letters[]> => {
  const letterResponses = await getLetters({ order: "desc" });
  return mapLetterResponseToLetters(letterResponses);
};

export const getLetterById = async (id: string): Promise<Letters> => {
  const res = await ky
    .get(`${BASE_URL}/${id}`, {
      headers: {
        Authorization: `Bearer ${getTokenFromCookies()}`,
      },
    })
    .json<LetterResponse>();
  return mapLetterResponseToLetters([res])[0];
};

export const downloadLetterFile = async (id: string): Promise<string | null> => {
  const res = await ky.get(`${BASE_URL}/download/${id}`, {
    headers: {
      Authorization: `Bearer ${getTokenFromCookies()}`,
    },
  });

  if (res.ok) {
    const blob = await res.blob();
    return URL.createObjectURL(blob);
  } else {
    console.error("Failed to fetch file:", res.statusText);
    return null;
  }
};

export const postLetters = async (formData: FormData): Promise<Letters> => {
  const res = await ky
    .post(`${BASE_URL}`, {
      headers: {
        Authorization: `Bearer ${getTokenFromCookies()}`,
      },
      body: formData,
    })
    .json<LetterResponse>();
  return mapLetterResponseToLetters([res])[0];
};

export const patchLetter = async (
  id: string,
  formData: UpdateLetterResponse,
): Promise<boolean> => {
  try {
    const formDataToSend = new FormData();

    // Letter fields
    formDataToSend.append("noSurat", formData.noSurat);
    formDataToSend.append("suratDari", formData.suratDari);
    formDataToSend.append("perihal", formData.perihal);
    formDataToSend.append("tglSurat", formData.tglSurat);
    formDataToSend.append("diterimaTgl", formData.diterimaTgl);
    formDataToSend.append("langsungKe", String(formData.langsungKe));
    formDataToSend.append("ditujukanKe", formData.ditujukanKe);
    formDataToSend.append("agenda", String(formData.agenda));
    formDataToSend.append("classificationId", formData.classificationId);
    formDataToSend.append("letterTypeId", formData.letterTypeId);

    // Agenda fields (optional, only if agenda is true)
    if (formData.agenda) {
      if (formData.tglMulai) formDataToSend.append("tglMulai", formData.tglMulai);
      if (formData.tglSelesai) formDataToSend.append("tglSelesai", formData.tglSelesai);
      if (formData.jamMulai) formDataToSend.append("jamMulai", formData.jamMulai);
      if (formData.jamSelesai) formDataToSend.append("jamSelesai", formData.jamSelesai);
      if (formData.tempat) formDataToSend.append("tempat", formData.tempat);
      if (formData.acara) formDataToSend.append("acara", formData.acara);
      if (formData.catatan) formDataToSend.append("catatan", formData.catatan);
    }

    // File upload
    if (formData.file) formDataToSend.append("file", formData.file);

    await ky.patch(`${BASE_URL}/${id}`, {
      headers: {
        Authorization: `Bearer ${getTokenFromCookies()}`,
      },
      body: formDataToSend,
    });
    return true;
  } catch (error) {
    console.error("Gagal memperbarui surat:", error);
    throw error;
  }
};

export const deleteLetter = async (id: string) => {
  try {
    await ky.delete(`${BASE_URL}/${id}`, {
      headers: {
        Authorization: `Bearer ${getTokenFromCookies()}`,
      },
    });
    return true;
  } catch (error) {
    console.error("Gagal menghapus surat:", error);
    return false;
  }
};

export const exportLetters = async (values: InputExport) => {
  const searchParams: Record<string, string> = {
    startDate: values.startDate,
    endDate: values.endDate,
  };

  if (values.classificationId) {
    searchParams.classificationId = values.classificationId;
  }

  if (values.letterTypeId) {
    searchParams.letterTypeId = values.letterTypeId;
  }

  try {
    const response = await ky.get(`${BASE_URL}/export`, {
      headers: {
        Authorization: `Bearer ${getTokenFromCookies()}`,
      },
      searchParams,
    });

    const blob = await response.blob();
    const filename = `Surat-Masuk-${new Date().toISOString()}.xlsx`;
    const link = document.createElement("a");
    link.href = window.URL.createObjectURL(blob);
    link.setAttribute("download", filename);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    return { message: "File berhasil diunduh." };
  } catch (error: any) {
    if (error.response) {
      const errorData = await error.response.json();
      throw new Error(errorData.message || "Terjadi kesalahan.");
    } else {
      throw new Error("Terjadi kesalahan jaringan.");
    }
  }
};

// Agenda-specific functions
export const getAgendas = async (params?: Record<string, string>) => {
  const res = await ky
    .get(`${BASE_URL_AGENDA}`, {
      headers: {
        Authorization: `Bearer ${getTokenFromCookies()}`,
      },
      searchParams: params,
    })
    .json<AgendaResponse[]>();
  return res;
};

export const getAgendaById = async (id: string): Promise<AgendaResponse> => {
  const res = await ky
    .get(`${BASE_URL_AGENDA}/${id}`, {
      headers: {
        Authorization: `Bearer ${getTokenFromCookies()}`,
      },
    })
    .json<AgendaResponse>();
  return res;
};

export const deleteAgenda = async (id: string) => {
  try {
    await ky.delete(`${BASE_URL_AGENDA}/${id}`, {
      headers: {
        Authorization: `Bearer ${getTokenFromCookies()}`,
      },
    });
    return true;
  } catch (error) {
    console.error("Gagal menghapus agenda:", error);
    return false;
  }
};

// React Query hooks
export const useLetters = () =>
  useQuery<Letters[]>({
    queryKey: ["Letters"],
    queryFn: () => getAll(),
  });

export const useLetterById = (id: string) =>
  useQuery<Letters>({
    queryKey: ["Letter", id],
    queryFn: () => getLetterById(id),
    enabled: !!id,
  });

export const useDownloadLetterFile = (id: string) =>
  useQuery<string | null>({
    queryKey: ["LetterFile", id],
    queryFn: () => downloadLetterFile(id),
    enabled: !!id,
  });

export const useAgendas = () =>
  useQuery<AgendaResponse[]>({
    queryKey: ["Agendas"],
    queryFn: () => getAgendas(),
  });

export const useAgendaById = (id: string) =>
  useQuery<AgendaResponse>({
    queryKey: ["Agenda", id],
    queryFn: () => getAgendaById(id),
    enabled: !!id,
  });
