import { useQuery } from "@tanstack/react-query";
import ky from "ky";
import type {InputExport, LetterResponse, Letters, UpdateLetterResponse, UpdateLetterInRequest, AgendaResponse} from "./types";
import { currentTimestamp } from "@/utils/utils";
import { getTokenFromCookies } from "@/services/auth";

const BASE_URL = `${process.env.API_BASE_URL as string}letterin`;
const BASE_URL_AGENDA = `${process.env.API_BASE_URL as string}agenda`;

export const getLetters = async (params?: Record<string, string>) => {
  const res = await ky
    .get(`${BASE_URL}`, {
      headers: {
        Authorization: `Bearer ${getTokenFromCookies()}`,
      },
      searchParams: params,
    })
    .json<Letters[]>();
  return res;
};

export const getAllLetters = async () => {
  return getLetters({ order: "desc" });
};

export const getLetterById = async (id: string): Promise<LetterResponse> => {
  const res = await ky
    .get(`${BASE_URL}/${id}`, {
      headers: {
        Authorization: `Bearer ${getTokenFromCookies()}`,
      },
    })
    .json<LetterResponse>();
  return res;
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

export const postLetters = async (formData: FormData): Promise<LetterResponse> => {
		const res = await ky.post(`${BASE_URL}`, {
				headers: {
						Authorization: `Bearer ${getTokenFromCookies()}`,
				},
				body: formData,
		}).json<LetterResponse>();
		return res;
};

// ✅ PERBAIKAN: Function untuk update surat masuk
export const updateLetterIn = async (
  id: string,
  data: UpdateLetterInRequest,
): Promise<LetterResponse> => {
  try {
    const formData = new FormData();

    // ✅ Letter fields sesuai dengan surat masuk (tanpa noAgenda karena readonly)
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

    // ✅ Agenda fields (optional, only if agenda is true)
    if (data.agenda) {
      if (data.tglMulai) formData.append("tglMulai", data.tglMulai);
      if (data.tglSelesai) formData.append("tglSelesai", data.tglSelesai);
      if (data.jamMulai) formData.append("jamMulai", data.jamMulai);
      if (data.jamSelesai) formData.append("jamSelesai", data.jamSelesai);
      if (data.tempat) formData.append("tempat", data.tempat);
      if (data.acara) formData.append("acara", data.acara);
      if (data.catatan) formData.append("catatan", data.catatan);
    }

    // ✅ File upload (optional)
    if (data.file) formData.append("file", data.file);

    const res = await ky.patch(`${BASE_URL}/${id}`, {
      headers: {
        Authorization: `Bearer ${getTokenFromCookies()}`,
      },
      body: formData,
    }).json<LetterResponse>();

    return res;
  } catch (error) {
    console.error("Gagal memperbarui surat masuk:", error);
    throw error;
  }
};

// ✅ Keep old function for backward compatibility (but fix it)
export const patchLetter = async (
  id: string,
  formData: UpdateLetterResponse,
): Promise<boolean> => {
  try {
    const formDataToSend = new FormData();

    // Validasi field wajib
    if (!formData.noSurat || !formData.suratDari || !formData.perihal ||
        !formData.tglSurat || !formData.diterimaTgl || !formData.ditujukanKe ||
        !formData.classificationId || !formData.letterTypeId) {
      throw new Error('Harap isi kolom wajib pada form');
    }

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
        recursive: 'true',
    };

    // ✅ Parameter untuk surat masuk
    if (values.classificationId) {
        searchParams.classificationId = values.classificationId;
    }

    if (values.letterTypeId) {
        searchParams.letterTypeId = values.letterTypeId;
    }

    // ✅ Tambahan parameter untuk surat masuk jika ada
    if (values.suratDari) {
        searchParams.suratDari = values.suratDari;
    }

    if (values.perihal) {
        searchParams.perihal = values.perihal;
    }

    try {
        const response = await ky.get(`${BASE_URL}/export`, {
            headers: {
                Authorization: `Bearer ${getTokenFromCookies()}`,
            },
            searchParams,
        });

        // Mengonversi respons menjadi Blob untuk file
        const blob = await response.blob();
        const filename = `Surat-Masuk-${currentTimestamp()}.xlsx`; // ✅ Ubah nama file

        // Membuat link untuk mengunduh file
        const link = document.createElement('a');
        link.href = window.URL.createObjectURL(blob);
        link.setAttribute('download', filename);
        document.body.appendChild(link);
        link.click(); // Memicu klik untuk mengunduh file
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

// ✅ SOLUSI 1: Ganti nama function yang sudah ada


// React Query hooks
export const useLetters = () =>
  useQuery<Letters[]>({
    queryKey: ["Letters"],
    queryFn: () => getAllLetters(),
  });

export const useLetterById = (id: string) =>
  useQuery<LetterResponse>({
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
