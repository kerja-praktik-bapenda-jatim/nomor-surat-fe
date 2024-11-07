"use client";

import {Button, Paper, PasswordInput, Space, TextInput} from "@mantine/core";
import {useRouter} from "next/navigation";
import {useState} from "react";
import {hasLength, useForm} from "@mantine/form";
import {RegisterRequest} from "@/services/auth/types";
import {register} from "@/services/auth";

export function RegisterForm() {
	const router = useRouter();
	const [loading, setLoading] = useState(false);
	const [apiError, setApiError] = useState<string | null>(null);

	const form = useForm({
		initialValues: {
			username: "",
			password: "",
			confirmPassword: "",
		},
		validate: {
			username: hasLength({min: 3}, 'Username must be at least 3 characters long'),
			password: hasLength({min: 6}, 'Password must be at least 6 characters'),
			confirmPassword: (value, values) => value !== values.password ? "Passwords don't match" : null,
		},
	});

	const handleSubmit = async (values: typeof form.values) => {
		setLoading(true);
		setApiError(null); // Reset any previous errors

		try {
			// Creating the request payload as RegisterRequest type
			const registerData: RegisterRequest = {
				username: values.username,
				password: values.password,
			};

			// Call the registerUser service with RegisterRequest data
			const response = await register(registerData);

			router.push("/login");
		} catch (error: any) {
			setApiError(error.message || "Registration failed");
		} finally {
			setLoading(false);
		}
	};

	return (
		<Paper withBorder shadow="md" p={30} mt={30} radius="md">
			<form onSubmit={form.onSubmit(handleSubmit)}>
				<TextInput
					label="Username"
					placeholder="johndoe"
					required
					{...form.getInputProps("username")}
				/>
				<PasswordInput
					label="Password"
					placeholder="Your password"
					required
					{...form.getInputProps("password")}
					mt="md"
				/>
				<PasswordInput
					label="Confirmation password"
					placeholder="Confirm password"
					required
					{...form.getInputProps("confirmPassword")}
					mt="md"
				/>
				<Space h="md"/>
				<Button fullWidth mt="xl" type="submit">
					Sign Up
				</Button>
			</form>
		</Paper>
	);
}
