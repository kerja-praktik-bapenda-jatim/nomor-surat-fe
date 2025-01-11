import ky from "ky";
import {ChangePasswordRequest} from "@/services/user/types";
import Cookies from "js-cookie";

const BASE_URL = `${process.env.API_BASE_URL as string}user`;

const decodeToken = (token: string) => {
    const payloadBase64 = token.split(".")[1];
    const payloadJson = atob(payloadBase64);
    return JSON.parse(payloadJson);
}

export const getTokenFromCookies = () => {
    return Cookies.get("authToken")
}

export async function changePassword(data: ChangePasswordRequest): Promise<{ message: string }> {
    try {
        const response = await ky.patch(`${BASE_URL}`, {
            headers: {
                Authorization: `Bearer ${getTokenFromCookies()}`,
            },
            json: data,
        }).json();
        return response as { message: string };
    } catch (error: any) {
        throw error.response ? await error.response.json() : { message: 'Gagal mengubah password' };
    }
}