"use client";
import { useState } from 'react';
import { Button, TextInput, Text, Space, Modal, Box, Paper } from '@mantine/core';
import { useForm } from '@mantine/form';
import ky from 'ky';
import { useRouter, useParams } from "next/navigation";
import { useDisclosure } from '@mantine/hooks';
import { getAuthToken } from '@/utils/utils';

export function UpdateLetterForm({ initialData }: { initialData: { to: string, subject: string } }) {
    const { id } = useParams();
    const form = useForm({
        initialValues: {
            to: initialData.to,
            subject: initialData.subject,
        },
    });

    const [loading, setLoading] = useState(false);
    const [opened, { open, close }] = useDisclosure(false);
    const router = useRouter();
    const token = getAuthToken('admin');

    const handleSubmit = async (values: typeof form.values) => {
        setLoading(true);

        try {
            const response: any = await ky.patch(`http://localhost:5000/api/letter/${id}`, {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
                json: values, // Mengirim hanya 'to' dan 'subject' dalam format JSON
            }).json();

            open();
        } catch (error) {
            console.error("Error:", error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <>
            <Paper withBorder shadow="md" p="md">
                <Box component="form" onSubmit={form.onSubmit(handleSubmit)}>
                    <Text component="h2" fw="bold" fz="lg">
                        Edit Surat
                    </Text>

                    <TextInput {...form.getInputProps('to')} label="Kepada" placeholder="Kepada" />
                    <Space h="sm" />

                    <TextInput {...form.getInputProps('subject')} label="Perihal" placeholder="Perihal" />
                    <Space h="sm" />

                    <Button type="submit" mt="md" loading={loading}>
                        Update
                    </Button>
                </Box>

                <Modal opened={opened} onClose={close} title="Surat berhasil diperbarui" centered>
                    <Text size="sm">Data surat telah berhasil diperbarui.</Text>
                    <Button
                        onClick={() => {
                            close();
                            router.push('/dashboard/surat');
                        }}
                    >
                        OK
                    </Button>
                </Modal>
            </Paper>
        </>
    );
}
