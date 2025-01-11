"use client";
import { Button, Paper, PasswordInput, Space, Text, TextInput } from "@mantine/core";
import { useRouter } from "next/navigation";
import { useEffect, useState } from 'react';
import { useForm, hasLength } from "@mantine/form";
import { modals } from '@mantine/modals';
import { getCurrentUser } from "@/services/auth";
import { changePassword } from "@/services/user";

export function ChangePasswordForm() {
    const router = useRouter();
    const [loading, setLoading] = useState(false);

    const form = useForm({
        initialValues: {
            username:"",
            oldPassword: "",
            newPassword: "",
            confirmPassword: "",
        },
        validate: {
            newPassword: (value, values) => {
                if (value.length < 3) {
                    return "Password baru minimal 3 karakter";
                }
                if (value === values.oldPassword) {
                    return "Password baru tidak boleh sama dengan password lama";
                }
                return null;
            },
            confirmPassword: (value, values) => value !== values.newPassword ? "Password tidak cocok" : null,
        },
    });

    const [user, setUser] = useState({ userName: "Guest", departmentName: "Unknown Department", isAdmin: false });
    
    useEffect(() => {
        const user = getCurrentUser();
        setUser(user);
    }, []);

    const handleSubmit = async (values: typeof form.values) => {
        setLoading(true);

        try {
            const response = await changePassword(values);
            modals.open({
                title: 'Pembaruan Password Berhasil',
                centered: true,
                children: (
                    <>
                        <Text size="sm">{response.message}</Text>
                        <Button
                            onClick={() => {
                                modals.closeAll();
                                handleBack();
                            }}
                            mt="md"
                        >
                            OK
                        </Button>
                    </>
                ),
            });
        } catch (error: any) {
            modals.open({
                title: 'Pembaruan Password Gagal',
                centered: true,
                children: (
                    <>
                        <Text size="sm">{error.message}</Text>
                        <Button
                            onClick={() => {
                                modals.closeAll();
                            }}
                            mt="md"
                        >
                            OK
                        </Button>
                    </>
                ),
            });
        } finally {
            setLoading(false);
        }
    };

    const handleBack = () => {
        router.push('/surat');
    };

    return (
        <Paper withBorder shadow="md" p={30} mt={30} radius="md">
        <form onSubmit={form.onSubmit(handleSubmit)}>
            <TextInput
                {...form.getInputProps('username')}
                label="Username"
                placeholder="Masukkan username anda"
                required
                disabled={!user.isAdmin}
            />
            <Space h="sm" />

            <PasswordInput
                {...form.getInputProps("oldPassword")}
                label="Password Lama"
                placeholder="Masukkan password lama anda"
                required
            />
            <Space h="sm" />
            
            <PasswordInput
                {...form.getInputProps("newPassword")}
                label="Password Baru"
                placeholder="Masukkan password baru anda"
                required
            />
            <Space h="sm" />

            <PasswordInput
                {...form.getInputProps("confirmPassword")}
                label="Konfirmasi Password"
                placeholder="Masukkan password baru anda"
                required
            />
            <Space h="sm" />

            <Button fullWidth type="submit" loading={loading}>
                Ubah Password
            </Button>
        </form>
        </Paper>
    );
}
