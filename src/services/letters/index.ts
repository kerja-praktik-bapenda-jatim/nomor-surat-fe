import {useQuery} from "@tanstack/react-query";
import ky from "ky";
import type {LetterResponse, Letters} from "./types";
import Cookies from "js-cookie";

const token = Cookies.get("authToken")
const BASE_URL = "http://localhost:5000/api/letter";
export const getLetters = async (params?: Record<string, string>) => {
	const res = await ky.get(`${BASE_URL}`, {
		headers: {
			Authorization: `Bearer ${token}`,
		},
		searchParams: params
	}).json<Letters[]>();
	return res;
};

export const getSpareLetters = async () => {
	return getLetters({reserved: "false"});
};

export const getLetterById = async (id: string): Promise<Letters> => {
    const res = await ky.get(`${BASE_URL}/${id}`, {
        headers: {
            Authorization: `Bearer ${token}`,
        },
    }).json<Letters>();
    return res;
};

export const downloadLetterFile = async (id: string): Promise<string | null> => {
    const res = await ky.get(`${BASE_URL}/download/${id}`, {
        headers: {
            Authorization: `Bearer ${token}`,
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
            Authorization: `Bearer ${token}`,
        },
        body: formData,
    }).json<LetterResponse>();
    return res;
};

export const deleteLetter = async (id: string) => {
    try {
        await ky.delete(`${BASE_URL}/${id}`, {
            headers: {
                Authorization: `Bearer ${token}`,
            },
        });
        return true;
    } catch (error) {
        console.error('Gagal menghapus surat:', error);
        return false;
    }
};

export const useLetters = () =>
	useQuery<Letters[]>({
		queryKey: ["Letters"],
		queryFn: () => getLetters(),
	});

export const useSpareLetters = () =>
	useQuery<Letters[]>({
		queryKey: ["SpareLetters"],
		queryFn: () => getSpareLetters(),
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