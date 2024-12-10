import {useQuery} from "@tanstack/react-query";
import ky from "ky";
import type {InputExport, LetterResponse, Letters, SpareLetters, UpdateLetterResponse} from "./types";
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

export const getLetterById = async (id: string): Promise<LetterResponse> => {
    const res = await ky.get(`${BASE_URL}/${id}`, {
        headers: {
            Authorization: `Bearer ${token}`,
        },
    }).json<LetterResponse>();
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

export const addSpareLetter = async (payload: SpareLetters): Promise<{ message: string }> => {
    try {
        const response = await ky.post(`${BASE_URL}`, {
            json: payload,
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${token}`,
            },
        }).json();
        return response as { message: string };
    } catch (error: any) {
        console.error("Gagal menambahkan spare surat:", error);
        throw error.response ? await error.response.json() : { message: 'Gagal menambahkan spare surat.' };
    }
};

export const patchLetter = async (id: string, formData: UpdateLetterResponse): Promise<boolean> => {
    try {
        const formDataToSend = new FormData();
        formDataToSend.append('subject', formData.subject);
        formDataToSend.append('to', formData.to);
        formDataToSend.append('classificationId', formData.classificationId);
        formDataToSend.append('levelId', formData.levelId);
        formDataToSend.append('attachmentCount',formData.attachmentCount)
        formDataToSend.append('description', formData.description);
        if (formData.file) formDataToSend.append('file', formData.file);

        await ky.patch(`${BASE_URL}/${id}`, {
            headers: {
                Authorization: `Bearer ${token}`,
            },
            body: formDataToSend,
        });
        return true;
    } catch (error) {
        console.error("Gagal memperbarui surat:", error);
        return false;
    }
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

export const exportLetters = async (values: InputExport) => {
    // Kirim request ke API untuk ekspor data
    const response = await ky.get(`${BASE_URL}/export`, {
        headers: {
            Authorization: `Bearer ${token}`,
        },
        searchParams: {
            startDate: values.startDate,
            endDate: values.endDate,
            departmentId: values.departmentId,
        },
    });

    // Mengonversi respons menjadi Blob untuk file
    const blob = await response.blob();

    // Membuat link untuk mengunduh file
    const link = document.createElement('a');
    link.href = window.URL.createObjectURL(blob);
    link.setAttribute('download', "Surat_Keluar.xlsx");
    document.body.appendChild(link);
    link.click(); // Memicu klik untuk mengunduh file
    document.body.removeChild(link);

    return { message: 'File berhasil diunduh.' };
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