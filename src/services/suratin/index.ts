import { useQuery } from "@tanstack/react-query";
import ky from "ky";
import type {
  InputExport,
  LetterResponse,
  Letterins,
  LetterinsResponse,
  UpdateLetterResponse,
  UpdateLetterInRequest,
  AgendaResponse,
  NextAgendaResponse
} from "./types";
import { currentTimestamp } from "@/utils/utils";
import { getTokenFromCookies } from "@/services/auth";

const BASE_URL = `${process.env.API_BASE_URL as string}letterin`;
const BASE_URL_AGENDA = `${process.env.API_BASE_URL as string}agenda-letterin`;

const createHeaders = () => ({
  Authorization: `Bearer ${getTokenFromCookies()}`,
});

export const getLetters = async (params?: Record<string, string>) => {
  const res = await ky
    .get(`${BASE_URL}`, {
      headers: createHeaders(),
      searchParams: params,
    })
    .json<LetterinsResponse>();

  return res.data;
};

export const getAllLetters = async () => {
  return getLetters({ order: "desc" });
};

export const getLetterById = async (id: string): Promise<LetterResponse> => {
  return await ky
    .get(`${BASE_URL}/${id}`, { headers: createHeaders() })
    .json<LetterResponse>();
};

export const getNextAgendaNumber = async (): Promise<NextAgendaResponse> => {
  return await ky
    .get(`${BASE_URL}/next-agenda`, { headers: createHeaders() })
    .json<NextAgendaResponse>();
};

export const downloadLetterFile = async (id: string): Promise<string | null> => {
  const res = await ky.get(`${BASE_URL}/download/${id}`, {
    headers: createHeaders(),
  });

  if (res.ok) {
    const blob = await res.blob();
    return URL.createObjectURL(blob);
  } else {
    console.error("Failed to fetch file:", res.statusText);
    return null;
  }
};

export const postLetterins = async (formData: FormData): Promise<LetterResponse> => {
  return await ky
    .post(`${BASE_URL}`, {
      headers: createHeaders(),
      body: formData,
    })
    .json<LetterResponse>();
};

export const updateLetterIn = async (
  id: string,
  data: UpdateLetterInRequest,
): Promise<LetterResponse> => {
  try {
    const formData = new FormData();

    formData.append("noSurat", data.noSurat);
    formData.append("suratDari", data.suratDari);
    formData.append("perihal", data.perihal);
    formData.append("tglSurat", data.tglSurat);
    formData.append("diterimaTgl", data.diterimaTgl);
    formData.append("langsungKe", String(data.langsungKe));
    formData.append("ditujukanKe", data.ditujukanKe);
    formData.append("agenda", String(data.agenda));
    formData.append("classificationId", data.classificationId);
    formData.append("letterTypeId", data.letterTypeId);

    if (data.agenda) {
      if (data.tglMulai) formData.append("tglMulai", data.tglMulai);
      if (data.tglSelesai) formData.append("tglSelesai", data.tglSelesai);
      if (data.jamMulai) formData.append("jamMulai", data.jamMulai);
      if (data.jamSelesai) formData.append("jamSelesai", data.jamSelesai);
      if (data.tempat) formData.append("tempat", data.tempat);
      if (data.acara) formData.append("acara", data.acara);
      if (data.catatan) formData.append("catatan", data.catatan);
    }

    if (data.file) formData.append("file", data.file);

    return await ky
      .patch(`${BASE_URL}/${id}`, {
        headers: createHeaders(),
        body: formData,
      })
      .json<LetterResponse>();
  } catch (error) {
    console.error("Gagal memperbarui surat masuk:", error);
    throw error;
  }
};

export const patchLetter = async (
  id: string,
  formData: UpdateLetterResponse,
): Promise<boolean> => {
  try {
    const formDataToSend = new FormData();

    if (!formData.noSurat || !formData.suratDari || !formData.perihal ||
        !formData.tglSurat || !formData.diterimaTgl || !formData.ditujukanKe ||
        !formData.classificationId || !formData.letterTypeId) {
      throw new Error('Harap isi kolom wajib pada form');
    }

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

    if (formData.agenda) {
      if (formData.tglMulai) formDataToSend.append("tglMulai", formData.tglMulai);
      if (formData.tglSelesai) formDataToSend.append("tglSelesai", formData.tglSelesai);
      if (formData.jamMulai) formDataToSend.append("jamMulai", formData.jamMulai);
      if (formData.jamSelesai) formDataToSend.append("jamSelesai", formData.jamSelesai);
      if (formData.tempat) formDataToSend.append("tempat", formData.tempat);
      if (formData.acara) formDataToSend.append("acara", formData.acara);
      if (formData.catatan) formDataToSend.append("catatan", formData.catatan);
    }

    if (formData.file) formDataToSend.append("file", formData.file);

    await ky.patch(`${BASE_URL}/${id}`, {
      headers: createHeaders(),
      body: formDataToSend,
    });
    return true;
  } catch (error) {
    console.error("Gagal memperbarui surat:", error);
    throw error;
  }
};

export const deleteLetterin = async (id: string) => {
  try {
    await ky.delete(`${BASE_URL}/${id}`, { headers: createHeaders() });
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
    recursive: 'true',
  };

  if (values.classificationId) {
    searchParams.classificationId = values.classificationId;
  }

  if (values.letterTypeId) {
    searchParams.letterTypeId = values.letterTypeId;
  }

  if (values.suratDari) {
    searchParams.suratDari = values.suratDari;
  }

  if (values.perihal) {
    searchParams.perihal = values.perihal;
  }

  try {
    const response = await ky.get(`${BASE_URL}/export`, {
      headers: createHeaders(),
      searchParams,
    });

    const blob = await response.blob();
    const filename = `Surat-Masuk-${currentTimestamp()}.xlsx`;

    const link = document.createElement('a');
    link.href = window.URL.createObjectURL(blob);
    link.setAttribute('download', filename);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    return { message: 'File berhasil diunduh.' };
  } catch (error: any) {
    if (error.response) {
      const errorData = await error.response.json();
      throw new Error(errorData.message || 'Terjadi kesalahan.');
    } else {
      throw new Error('Terjadi kesalahan jaringan.');
    }
  }
};

export const getAgendas = async (params?: Record<string, string>) => {
  return await ky
    .get(`${BASE_URL_AGENDA}`, {
      headers: createHeaders(),
      searchParams: params,
    })
    .json<AgendaResponse[]>();
};

export const getAgendaById = async (id: string): Promise<AgendaResponse> => {
  return await ky
    .get(`${BASE_URL_AGENDA}/${id}`, { headers: createHeaders() })
    .json<AgendaResponse>();
};

export const deleteAgenda = async (id: string) => {
  try {
    await ky.delete(`${BASE_URL_AGENDA}/${id}`, { headers: createHeaders() });
    return true;
  } catch (error) {
    console.error("Gagal menghapus agenda:", error);
    return false;
  }
};

export const useLetters = () =>
  useQuery<Letterins[]>({
    queryKey: ["LettersIn"],
    queryFn: getAllLetters,
    staleTime: 0,
    refetchOnMount: true,
    refetchOnWindowFocus: false,
  });

export const useLetterinById = (id: string) =>
  useQuery<LetterResponse>({
    queryKey: ["Letter", id],
    queryFn: () => getLetterById(id),
    enabled: !!id,
  });

export const useNextAgendaNumber = () =>
  useQuery<NextAgendaResponse>({
    queryKey: ["NextAgenda"],
    queryFn: getNextAgendaNumber,
    refetchOnWindowFocus: false,
    refetchOnMount: true,
    staleTime: 0,
    enabled: true,
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
