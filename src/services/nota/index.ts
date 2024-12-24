import {useQuery} from "@tanstack/react-query";
import ky from "ky";
import type {NotaResponse, Nota, SpareNota, UpdateNotaResponse, InputExport} from "./types";
import Cookies from "js-cookie";
import { currentTimestamp } from "@/utils/utils";

const token = Cookies.get("authToken")
const BASE_URL = "http://localhost:5000/api/nota";

export const getNota = async (params?: Record<string, string>) => {
	const res = await ky.get(`${BASE_URL}`, {
		headers: {
			Authorization: `Bearer ${token}`,
		},
		searchParams: params
	}).json<Nota[]>();
	return res;
};

export const getSpareNota = async () => {
	return getNota({reserved: "false"});
};

export const getNotaById = async (id: string): Promise<NotaResponse> => {
    const res = await ky.get(`${BASE_URL}/${id}`, {
        headers: {
            Authorization: `Bearer ${token}`,
        },
    }).json<NotaResponse>();
    return res;
};

export const downloadNotaFile = async (id: string): Promise<string | null> => {
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

export const postNota = async (formData: FormData): Promise<NotaResponse> => {
    const res = await ky.post(`${BASE_URL}`, {
        headers: {
            Authorization: `Bearer ${token}`,
        },
        body: formData,
    }).json<NotaResponse>();
    return res;
};

export const addSpareNota = async (payload: SpareNota): Promise<{ message: string }> => {
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

export const patchNota = async (id: string, formData: UpdateNotaResponse): Promise<boolean> => {
    try {
        const formDataToSend = new FormData();
        formDataToSend.append('subject', formData.subject);
        formDataToSend.append('to', formData.to);
        formDataToSend.append('classificationId', formData.classificationId);
        formDataToSend.append('levelId', formData.levelId);
        formDataToSend.append('attachmentCount',formData.attachmentCount)
        formDataToSend.append('description', formData.description);
        formDataToSend.append('accessId', formData.accessId);
        formDataToSend.append('documentIndexName', formData.documentIndexName);
        formDataToSend.append('activeRetentionPeriodId', formData.activeRetentionPeriodId);
        formDataToSend.append('inactiveRetentionPeriodId', formData.inactiveRetentionPeriodId);
        formDataToSend.append('jraDescriptionId', formData.jraDescriptionId);
        formDataToSend.append('storageLocationId', formData.storageLocationId);
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

export const deleteNota = async (id: string) => {
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

export const exportNota = async (values: InputExport) => {
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
                Authorization: `Bearer ${token}`,
            },
            searchParams,
        });

        // Mengonversi respons menjadi Blob untuk file
        const blob = await response.blob();
        const filename = `Nota-Dinas-${currentTimestamp()}.xlsx`
        // Membuat link untuk mengunduh file
        const link = document.createElement('a');
        link.href = window.URL.createObjectURL(blob);
        link.setAttribute('download', filename);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);

        return { message: `${filename} berhasil diunduh.` };
    } catch (error: any) {
        if (error.response) {
            const errorData = await error.response.json();
            throw new Error(errorData.message || 'Terjadi kesalahan.');
        } else {
            throw new Error('Terjadi kesalahan jaringan.');
        }
    }
};

export const useNota = () =>
	useQuery<Nota[]>({
		queryKey: ["Nota"],
		queryFn: () => getNota(),
	});

export const useSpareNota = () =>
	useQuery<Nota[]>({
		queryKey: ["SpareNota"],
		queryFn: () => getSpareNota(),
	});

export const useNotaById = (id: string) =>
	useQuery<NotaResponse>({
		queryKey: ["Nota", id],
		queryFn: () => getNotaById(id),
		enabled: !!id,
	});

export const useDownloadNotaFile = (id: string) => 
	useQuery<string | null>({
		queryKey: ["NotaFile", id],
		queryFn: () => downloadNotaFile(id),
		enabled: !!id,
	});