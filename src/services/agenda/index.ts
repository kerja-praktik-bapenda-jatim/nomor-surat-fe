import { useQuery } from "@tanstack/react-query";
import ky from "ky";
import type { AgendaSurat, CreateAgendaSuratPayload } from "./types";
import { getTokenFromCookies } from "@/services/auth";

const BASE_URL = `${process.env.API_BASE_URL as string}agenda-letterin`;

const createHeaders = () => ({
  Authorization: `Bearer ${getTokenFromCookies()}`,
});

const createJsonHeaders = () => ({
  ...createHeaders(),
  'Content-Type': 'application/json',
});

const formatDateForBackend = (dateString: string): string => {
  if (!dateString) return "";

  try {
    if (dateString.match(/^\d{4}-\d{2}-\d{2}$/)) {
      return dateString;
    }

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

const formatTimeForBackend = (timeString: string): string => {
  return timeString.length === 5 ? timeString : timeString + ':00';
};

const formatPayload = (payload: CreateAgendaSuratPayload): CreateAgendaSuratPayload => ({
  ...payload,
  tglMulai: formatDateForBackend(payload.tglMulai),
  tglSelesai: formatDateForBackend(payload.tglSelesai),
  jamMulai: formatTimeForBackend(payload.jamMulai),
  jamSelesai: formatTimeForBackend(payload.jamSelesai),
});

export const getAgendaSurats = async (): Promise<AgendaSurat[]> => {
  return await ky
    .get(`${BASE_URL}`, { headers: createHeaders() })
    .json<AgendaSurat[]>();
};

export const getAgendaSuratById = async (id: string): Promise<AgendaSurat> => {
  return await ky
    .get(`${BASE_URL}/${id}`, { headers: createHeaders() })
    .json<AgendaSurat>();
};

export const createAgendaSurat = async (payload: CreateAgendaSuratPayload): Promise<AgendaSurat> => {
  const formattedPayload = formatPayload(payload);

  return await ky
    .post(`${BASE_URL}`, {
      headers: createJsonHeaders(),
      json: formattedPayload,
    })
    .json<AgendaSurat>();
};

export const deleteAgendaSuratById = async (id: string): Promise<{ message: string }> => {
  return await ky
    .delete(`${BASE_URL}/${id}`, { headers: createHeaders() })
    .json<{ message: string }>();
};

export const deleteAllAgendaSurat = async (truncate: boolean = false): Promise<{ message: string }> => {
  return await ky
    .delete(`${BASE_URL}`, {
      headers: createJsonHeaders(),
      json: { truncate },
    })
    .json<{ message: string }>();
};

export const createStandaloneAgenda = async (
  payload: Omit<CreateAgendaSuratPayload, 'letterIn_id'> & { letterIn_id?: string | null }
): Promise<AgendaSurat> => {
  const formattedPayload = formatPayload({
    ...payload,
    letterIn_id: null,
  });

  return await ky
    .post(`${BASE_URL}`, {
      headers: createJsonHeaders(),
      json: formattedPayload,
    })
    .json<AgendaSurat>();
};

export const useAgendaSurats = () =>
  useQuery<AgendaSurat[]>({
    queryKey: ["AgendaSurats"],
    queryFn: getAgendaSurats,
  });

export const useAgendaSuratById = (id: string) =>
  useQuery<AgendaSurat>({
    queryKey: ["AgendaSurat", id],
    queryFn: () => getAgendaSuratById(id),
    enabled: !!id,
  });
