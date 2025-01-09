import {useQuery} from "@tanstack/react-query";
import ky from "ky";
import type {InputExport, LetterResponse, Letters, SpareLetters, UpdateLetterResponse} from "./types";
import Cookies from "js-cookie";
import { currentTimestamp } from "@/utils/utils";
import {getTokenFromCookies} from "@/services/auth";

const BASE_URL = `${process.env.API_BASE_URL as string}letter`;


export const getLetters = async (params?: Record<string, string>) => {
	const res = await ky.get(`${BASE_URL}`, {
		headers: {
			Authorization: `Bearer ${getTokenFromCookies()}`,
		},
		searchParams: params
	}).json<Letters[]>();
	return res;
};

export const getAllLetters = async () => {
	return getLetters({reserved: "true", order: "desc"});
};

export const getSpareLetters = async () => {
	return getLetters({reserved: "false"});
};

export const getLetterById = async (id: string): Promise<LetterResponse> => {
    const res = await ky.get(`${BASE_URL}/${id}`, {
        headers: {
            Authorization: `Bearer ${getTokenFromCookies()}`,
        },
    }).json<LetterResponse>();
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

export const addSpareLetter = async (payload: SpareLetters): Promise<{ message: string }> => {
    try {
        const response = await ky.post(`${BASE_URL}`, {
            json: payload,
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${getTokenFromCookies()}`,
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
        if (
                !formData.subject ||
                !formData.to ||
                !formData.classificationId ||
                !formData.levelId ||
                formData.attachmentCount < 0 ||
                !formData.description
        ) {
                throw new Error('Harap isi kolom wajib pada form');
        }

		formDataToSend.append('subject', formData.subject);
        formDataToSend.append('to', formData.to);
        formDataToSend.append('classificationId', formData.classificationId);
        formDataToSend.append('levelId', formData.levelId);
        formDataToSend.append('attachmentCount', `${formData.attachmentCount}`);
        formDataToSend.append('description', formData.description);
        if(formData.departmentId) {
            formDataToSend.append('departmentId', formData.departmentId);
        }
        if (formData.accessId) {
            formDataToSend.append('accessId', formData.accessId);
        }
        if (formData.documentIndexName) {
            formDataToSend.append('documentIndexName', formData.documentIndexName);
        }
        if (formData.activeRetentionPeriodId) {
            formDataToSend.append('activeRetentionPeriodId', formData.activeRetentionPeriodId);
        }
        if (formData.inactiveRetentionPeriodId) {
            formDataToSend.append('inactiveRetentionPeriodId', formData.inactiveRetentionPeriodId);
        }
        if (formData.jraDescriptionId) {
            formDataToSend.append('jraDescriptionId', formData.jraDescriptionId);
        }
        if (formData.storageLocationId) {
            formDataToSend.append('storageLocationId', formData.storageLocationId);
        }
        if (formData.file) {
            formDataToSend.append('file', formData.file);
        }

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
        console.error('Gagal menghapus surat:', error);
        return false;
    }
};

export const exportLetters = async (values: InputExport) => {
    const searchParams: Record<string, string> = {
        startDate: values.startDate,
        endDate: values.endDate,
        recursive: 'true',
    };

    if (values.departmentId) {
        searchParams.departmentId = values.departmentId;
    }

    if (values.classificationId) {
        searchParams.classificationId = values.classificationId;
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
        const filename = `Surat-Keluar-${currentTimestamp()}.xlsx`
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

export const useLetters = () =>
	useQuery<Letters[]>({
		queryKey: ["Letters"],
		queryFn: () => getAllLetters(),
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
