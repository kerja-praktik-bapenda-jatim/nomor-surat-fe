import ky from "ky";
import {LoginRequest, LoginResponse, RegisterRequest} from "@/services/auth/types";
import Cookies from "js-cookie";

const BASE_URL = "http://localhost:5000/api/auth";

// Utility function to decode JWT and get the expiration
const decodeToken = (token: string) => {
	const payloadBase64 = token.split(".")[1];
	const payloadJson = atob(payloadBase64);
	return JSON.parse(payloadJson);
};

export const login = async (data: LoginRequest) => {
	try {
		const response = await ky.post(`${BASE_URL}/login`, {json: data}).json<LoginResponse>()
		const {exp} = decodeToken(response.token);
		const expirationDate = new Date(exp * 1000);

		Cookies.set("authToken", response.token, {expires: expirationDate});

		return response;
	} catch (err: any) {
		if (err.response) {
			const errorData = await err.response.json();
			throw new Error(errorData?.message || "Login failed. Please try again.");
		}
		throw new Error("An error occurred while logging in.");
	}
}

// export const register = async (data: RegisterRequest) => {
// 	const response = await ky.post(`${BASE_URL}/register`, {json: data}).json<RegisterRes>()
// }

export const logout = () => {
	Cookies.remove("authToken");
}
