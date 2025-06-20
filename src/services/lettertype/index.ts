import { useQuery } from "@tanstack/react-query";
import ky from "ky";
import { getTokenFromCookies } from "@/services/auth";

const BASE_URL = process.env.API_BASE_URL as string;

// ✅ Interfaces
export interface Classification {
  id: string;
  name: string;
  createdAt: string;
  updatedAt: string;
}

export interface LetterType {
  id: string;
  name: string;
  createdAt: string;
  updatedAt: string;
}

// ✅ Classification functions
export const getClassifications = async (): Promise<Classification[]> => {
  const res = await ky
    .get(`${BASE_URL}classification`, {
      headers: {
        Authorization: `Bearer ${getTokenFromCookies()}`,
      },
    })
    .json<Classification[]>();
  return res;
};

// ✅ Letter Type functions
export const getLetterTypes = async (): Promise<LetterType[]> => {
  const res = await ky
    .get(`${BASE_URL}lettertype`, {
      headers: {
        Authorization: `Bearer ${getTokenFromCookies()}`,
      },
    })
    .json<LetterType[]>();
  return res;
};

export const createLetterType = async (name: string): Promise<LetterType> => {
  const res = await ky
    .post(`${BASE_URL}lettertype`, {
      headers: {
        Authorization: `Bearer ${getTokenFromCookies()}`,
        'Content-Type': 'application/json',
      },
      json: { name },
    })
    .json<LetterType>();
  return res;
};

export const updateLetterType = async (
  id: string,
  oldName: string,
  newName: string
): Promise<LetterType> => {
  const res = await ky
    .patch(`${BASE_URL}lettertype/${id}`, {
      headers: {
        Authorization: `Bearer ${getTokenFromCookies()}`,
        'Content-Type': 'application/json',
      },
      json: {
        id: parseInt(id),
        oldName,
        newName,
      },
    })
    .json<{ message: string; data: LetterType }>();
  return res.data;
};

export const deleteLetterType = async (id: string): Promise<void> => {
  await ky.delete(`${BASE_URL}lettertype/${id}`, {
    headers: {
      Authorization: `Bearer ${getTokenFromCookies()}`,
    },
  });
};

// ✅ React Query hooks
export const useClassifications = () =>
  useQuery<Classification[]>({
    queryKey: ["classifications"],
    queryFn: () => getClassifications(),
    staleTime: 5 * 60 * 1000, // 5 minutes
    refetchOnMount: false,
    refetchOnWindowFocus: false,
  });

export const useLetterTypes = () =>
  useQuery<LetterType[]>({
    queryKey: ["letterTypes"],
    queryFn: () => getLetterTypes(),
    staleTime: 5 * 60 * 1000, // 5 minutes
    refetchOnMount: false,
    refetchOnWindowFocus: false,
  });
