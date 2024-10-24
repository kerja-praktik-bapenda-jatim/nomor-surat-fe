"use client";
import { useState } from 'react';
import { Button, FileInput, TextInput, Text, Space, Modal, Box, Paper } from '@mantine/core';
import { hasLength, useForm } from '@mantine/form';
import { DateInput } from '@mantine/dates';
import ky from 'ky';
import { useRouter } from "next/navigation";
import { useDisclosure } from '@mantine/hooks';
import { convertUTC } from '@/utils/utils';

export function CreateLetterForm() {
    const form = useForm({
        mode: 'uncontrolled',
        validate: {
            date: (value) => (value ? null : 'Kolom tidak boleh kosong'),
            to: hasLength({ min: 3 }, 'Kolom tidak boleh kosong'),
            subject: hasLength({ min: 3 }, 'Kolom tidak boleh kosong'),
            file: (value) => (value ? null : 'Kolom tidak boleh kosong'),
        },
        initialValues: {
            date: new Date(),
            to: null,
            subject: null,
            file: null,
        },
    });

    const [loading, setLoading] = useState(false);
    const [opened, { open, close }] = useDisclosure(false);
    const [apiResponse, setApiResponse] = useState<{date: string, subject: string, to: string, number: string} | null>(null);
    const router = useRouter();
    interface LetterResponse {
        date: string;
        to: string;
        subject: string;
        number: string;
    }
    const handleSubmit = async (values: typeof form.values) => {
        setLoading(true);
        const token = 'eyJhbGciOiJIUzM4NCIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiJlOTVlN2ExYi1jYjNkLTRiMjQtYmU2OC1lOWJkMDU1N2YyNTQiLCJpc0FkbWluIjp0cnVlLCJpYXQiOjE3Mjk3ODM2MzksImV4cCI6MTczMDM4ODQzOX0.4CFCvhQJypzgxfDoKOBdolpCB9Hj-cjLZQbnjzR9Yr16s-Q4nbUIjk1AXD1c72i9'; // Ganti dengan token JWT yang sesuai

        try {
        const formData = new FormData();
        formData.append('date', values.date.toISOString());

        if (values.to) {
            formData.append('to', values.to);
        }
        if (values.subject) {
            formData.append('subject', values.subject);

        }
        if (values.file) {
            formData.append('file', values.file);
        }

        const response: LetterResponse = await ky.post('http://localhost:5000/api/letter', {
            headers: {
            Authorization: `Bearer ${token}`,
            },
            body: formData,
        }).json();

        const { date, subject, to, number } = response;
        setApiResponse({ date, subject, to, number });
        open();

        } catch (error: any) {
            if (error.response) {
                const apiError = await error.response.json();
                console.error("Error:", apiError);
            } else {
                console.error("Error tidak terdeteksi dari response:", error);
            }
        } finally {
            setLoading(false);
        }
    };

    return (
    <>
    <Paper withBorder shadow="md" p="md">
        <Box component="form">
            <Text component="h2" fw="bold" fz="lg">
                Buat Surat
            </Text>
            <form onSubmit={form.onSubmit((values) => handleSubmit(values))}>
                <DateInput
                    clearable
                    valueFormat="DD-MMMM-YYYY"
                    minDate={new Date()}
                    {...form.getInputProps('date')}
                    label="Tanggal"
                    placeholder="Pilih tanggal"
                />
                <Space h="sm" />

                <TextInput
                    {...form.getInputProps('to')}
                    label="Kepada"
                    placeholder="Kepada"
                />
                <Space h="sm" />

                <TextInput
                    {...form.getInputProps('subject')}
                    label="Perihal"
                    placeholder="Perihal"
                />
                <Space h="sm" />

                <FileInput
                    clearable
                    {...form.getInputProps('file')}
                    label="Upload File"
                    placeholder="Pilih file"
                />
                <Space h="sm" />
                
                <Button type="submit" mt="md" loading={loading}>
                    Submit
                </Button>
            </form>

            <Modal opened={opened} onClose={close} title="Surat berhasil dibuat" centered>
                {apiResponse && (
                    <Text size="sm">
                    <strong>Tanggal:</strong> {convertUTC(apiResponse.date)}<br />
                    <strong>Kepada:</strong> {apiResponse.to}<br />
                    <strong>Perihal:</strong> {apiResponse.subject}<br />
                    <strong>Nomor Surat:</strong> {apiResponse.number}<br />
                    </Text>
                )}
                <Button
                onClick={() => {
                    close();
                    form.reset();
                    router.push('http://localhost:3000/dashboard/surat');
                }}
                >
                OK
                </Button>
            </Modal>
        </Box>
    </Paper>
        </>
        
    );
}
