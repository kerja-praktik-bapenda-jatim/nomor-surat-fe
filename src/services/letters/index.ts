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

export const postLetters = async (formData: FormData): Promise<LetterResponse> => {
    const res = await ky.post(`${BASE_URL}`, {
        headers: {
            Authorization: `Bearer ${token}`,
        },
        body: formData,
    }).json<LetterResponse>();
    return res;
};

export const useLetters = () =>
	useQuery<Letters[]>({
		queryKey: ["Letters"],
		queryFn: () => getLetters(),
	});

export const getSpareLetters = async () => {
	return getLetters({reserved: "false"});
};

export const useSpareLetters = () =>
	useQuery<Letters[]>({
		queryKey: ["SpareLetters"],
		queryFn: () => getSpareLetters(),
	});
