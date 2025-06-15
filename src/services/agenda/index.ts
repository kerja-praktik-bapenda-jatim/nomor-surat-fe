import {useQuery} from "@tanstack/react-query";
import ky from "ky";
import type {AgendaSurat, CreateAgendaSuratPayload} from "./types";
import {getTokenFromCookies} from "@/services/auth";

const BASE_URL = `${process.env.API_BASE_URL as string}agenda-letterin`;

// Helper function untuk format tanggal sebelum dikirim ke backend
const formatDateForBackend = (dateString: string): string => {
  if (!dateString) return "";

  try {
    // Jika sudah dalam format YYYY-MM-DD, return as is
    if (dateString.match(/^\d{4}-\d{2}-\d{2}$/)) {
      return dateString;
    }

    // Jika format lain, convert ke YYYY-MM-DD
    const date = new Date(dateString);
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');

    return `${year}-${month}-${day}`;
  } catch (error) {
    console.error('Error formatting date:', error);
    return dateString;
  }
};

export const getAgendaSurats = async (): Promise<AgendaSurat[]> => {
	const res = await ky.get(`${BASE_URL}`, {
		headers: {
			Authorization: `Bearer ${getTokenFromCookies()}`,
		},
	}).json<AgendaSurat[]>();
	return res;
};

export const getAgendaSuratById = async (id: string): Promise<AgendaSurat> => {
    const res = await ky.get(`${BASE_URL}/${id}`, {
        headers: {
            Authorization: `Bearer ${getTokenFromCookies()}`,
        },
    }).json<AgendaSurat>();
    return res;
};

export const createAgendaSurat = async (payload: CreateAgendaSuratPayload): Promise<AgendaSurat> => {
    // Format tanggal sebelum dikirim ke backend
    const formattedPayload = {
        ...payload,
        tglMulai: formatDateForBackend(payload.tglMulai),
        tglSelesai: formatDateForBackend(payload.tglSelesai),
        // Pastikan format time dalam HH:MM
        jamMulai: payload.jamMulai.length === 5 ? payload.jamMulai : payload.jamMulai + ':00',
        jamSelesai: payload.jamSelesai.length === 5 ? payload.jamSelesai : payload.jamSelesai + ':00',
    };

    console.log('Sending payload to backend:', formattedPayload);

    const res = await ky.post(`${BASE_URL}`, {
        headers: {
            Authorization: `Bearer ${getTokenFromCookies()}`,
            'Content-Type': 'application/json',
        },
        json: formattedPayload,
    }).json<AgendaSurat>();
    return res;
};

export const deleteAgendaSuratById = async (id: string): Promise<{ message: string }> => {
    const res = await ky.delete(`${BASE_URL}/${id}`, {
        headers: {
            Authorization: `Bearer ${getTokenFromCookies()}`,
        },
    }).json<{ message: string }>();
    return res;
};

export const deleteAllAgendaSurat = async (truncate: boolean = false): Promise<{ message: string }> => {
    const res = await ky.delete(`${BASE_URL}`, {
        headers: {
            Authorization: `Bearer ${getTokenFromCookies()}`,
            'Content-Type': 'application/json',
        },
        json: { truncate },
    }).json<{ message: string }>();
    return res;
};

// React Query Hooks
export const useAgendaSurats = () =>
	useQuery<AgendaSurat[]>({
		queryKey: ["AgendaSurats"],
		queryFn: () => getAgendaSurats(),
	});

export const useAgendaSuratById = (id: string) =>
	useQuery<AgendaSurat>({
		queryKey: ["AgendaSurat", id],
		queryFn: () => getAgendaSuratById(id),
		enabled: !!id,
	});

export const createStandaloneAgenda = async (payload: Omit<CreateAgendaSuratPayload, 'letterIn_id'> & { letterIn_id?: string | null }): Promise<AgendaSurat> => {
    // Format tanggal sebelum dikirim ke backend
    const formattedPayload = {
        ...payload,
        tglMulai: formatDateForBackend(payload.tglMulai),
        tglSelesai: formatDateForBackend(payload.tglSelesai),
        jamMulai: payload.jamMulai.length === 5 ? payload.jamMulai : payload.jamMulai + ':00',
        jamSelesai: payload.jamSelesai.length === 5 ? payload.jamSelesai : payload.jamSelesai + ':00',
        letterIn_id: null, // Force NULL untuk standalone
    };

    const res = await ky.post(`${BASE_URL}`, {
        headers: {
            Authorization: `Bearer ${getTokenFromCookies()}`,
            'Content-Type': 'application/json',
        },
        json: formattedPayload,
    }).json<AgendaSurat>();
    return res;
};
