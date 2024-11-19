import ky from "ky";
import {LoginRequest, LoginResponse, RegisterRequest, RegisterResponse} from "@/services/auth/types";
import Cookies from "js-cookie";
import {useRouter} from "next/navigation";
import {useEffect} from "react";

const BASE_URL = "http://localhost:5000/api/auth";

const decodeToken = (token: string) => {
	const payloadBase64 = token.split(".")[1];
	const payloadJson = atob(payloadBase64);
	return JSON.parse(payloadJson);
};

export const login = async (data: LoginRequest) => {
	try {
		const response = await ky.post(`${BASE_URL}/login`, {json: data})

		if (response.ok) {
			const data = await response.json<LoginResponse>()
			const {exp, userName, departmentName} = decodeToken(data.token);
			const expirationDate = new Date(exp * 1000);

			Cookies.set("authToken", data.token, {expires: expirationDate});
			localStorage.setItem("userName", userName);
			localStorage.setItem("departmentName", departmentName);

			return data;
		} else {
			throw new Error(response.statusText);
		}
	} catch (err: any) {
		if (err.response) {
			const errorData = await err.response.json();
			throw new Error(errorData?.message || "Login failed. Please try again.");
		}
		throw new Error("An error occurred while logging in.");
	}
}

export const register = async (data: RegisterRequest) => {
	try {
		const response = await ky.post(`${BASE_URL}/register`, {json: data})

		if (response.ok) {
			const data = await response.json<RegisterResponse>()
			return data;
		} else {
			throw new Error(response.statusText);
		}
	} catch (err: any) {
		if (err.response) {
			const errorData = await err.response.json();
			throw new Error(errorData?.message || "Register failed. Please try again.");
		}
		throw new Error("An error occurred while register.");
	}
}


export const useAuthRedirect = () => {
	const router = useRouter();

	useEffect(() => {
		const token = Cookies.get("authToken")

		if (!token) {
			router.push('/login')
		} else {
			const decoded = decodeToken(token)
			if (decoded.exp * 1000 < Date.now()) {
				Cookies.remove("authToken")
				localStorage.clear()
				router.push('/login')
			} else {
				router.push('/surat')
			}
		}
	}, [router]);
}

export const getCurrentUser = () => {
	if (typeof window === "undefined") {
		return {userName: "Guest", departmentName: "Unknown Department"};
	}

	const userName = localStorage.getItem("userName") || "Unknown User";
	const departmentName = localStorage.getItem("departmentName") || "Unknown Department";

	return {userName, departmentName};
};
