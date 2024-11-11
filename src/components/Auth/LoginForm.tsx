"use client";

import {
	Anchor,
	Button,
	Card,
	Checkbox,
	Group,
	PasswordInput,
	TextInput,
	Text, LoadingOverlay
} from "@mantine/core";
import {useRouter} from "next/navigation";
import React, {useState} from "react";
import {login} from "@/services/auth";

export function LoginForm() {
	const router = useRouter();

	const [username, setUsername] = useState<string>('');
	const [password, setPassword] = useState<string>('');
	const [loading, setLoading] = useState<boolean>(false);
	const [error, setError] = useState<string | null>(null);


	const handleLogin = async () => {
		try {
			await login({username, password});

			// On success, redirect to the dashboard
			router.push("/surat");
		} catch (err) {
			// Set the error message if an error occurs
			if (err instanceof Error) {
				setError(err.message); // Get the error message from the service
			} else {
				setError("Login failed. Please try again.");
			}
		} finally {
			setLoading(false);
		}
	};

	return (
		<Card withBorder shadow="md" p={30} mt={30} radius="md">
			<LoadingOverlay visible={loading}/>
			<TextInput
				label="Username"
				placeholder="johndoe"
				required
				value={username}
				onChange={(e) => setUsername(e.target.value)}
			/>
			<PasswordInput
				label="Password"
				placeholder="Your password"
				required
				mt="md"
				value={password}
				onChange={(e) => setPassword(e.target.value)}
			/>
			<Group mt="md" justify="space-between">
				<Checkbox label="Remember me"/>
				<Anchor size="sm" href="#">
					Forgot Password?
				</Anchor>
			</Group>

			{error && <Text color="red" size="sm" mt="sm">{error}</Text>}

			<Text c="dimmed" size="sm" mt={10} align="center">
				Don&apos;t have an account?{" "}
				<Anchor size="sm" href="/register">
					Sign Up
				</Anchor>
			</Text>
			<Button fullWidth mt="xl" onClick={handleLogin}>
				Sign In
			</Button>
		</Card>
	);
}
