"use client";
import { useEffect, useState } from 'react';
import { Button, FileInput, TextInput, Text, Space, Modal, Box, Paper } from '@mantine/core';
import { hasLength, useForm } from '@mantine/form';
import ky from 'ky';
import { useRouter, useParams } from "next/navigation";
import { useDisclosure } from '@mantine/hooks';
import { convertUTC, getAuthToken } from '@/utils/utils';

export function UpdateLetterForm() {
    const { id } = useParams(); // Mengambil ID surat dari URL
    const [date, setDate] = useState('');
    const [fileName, setFileName] = useState<string | null>(null);

    const form = useForm({
        mode: 'uncontrolled',
        validate: {
            to: hasLength({ min: 3 }, 'Kolom tidak boleh kosong'),
            subject: hasLength({ min: 3 }, 'Kolom tidak boleh kosong'),
            // file: (value) => (value ? null : 'Kolom tidak boleh kosong'),
        },
        initialValues: {
            to: '',
            subject: '',   
        },
    });

    const [loading, setLoading] = useState(false);
    const [opened, { open, close }] = useDisclosure(false);
    const [apiResponse, setApiResponse] = useState<{date: string, subject: string, to: string, number: string} | null>(null);
    const router = useRouter();
    const token = getAuthToken('admin');
    
    // Fungsi untuk mengambil data surat awal
    useEffect(() => {
        const fetchLetterData = async () => {
            if (!id) {
                console.error("ID tidak tersedia.");
                return;
            }
            try {
                const response = await ky.get(`http://localhost:5000/api/letter/${id}`, {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                }).json();

                form.setValues({
                    to: response.to,
                    subject: response.subject,
                    file: response.filename, // Kosongkan karena file tidak bisa di-set sebagai nilai awal
                });

                setDate(response.date);
                setFileName(response.filename);
            } catch (error) {
                console.error("Gagal mengambil data surat:", error);
            }
        };
        fetchLetterData();
    }, [id]);

    // Fungsi untuk submit update surat
    const handleSubmit = async (values: typeof form.values) => {
        console.log("Submit function called", values);
        setLoading(true);

        try {
            console.log("Sending form data to API...");
            const formData = new FormData();
            formData.append('date', new Date(date).toISOString());

            // Validasi apakah 'date' memiliki nilai yang valid
            if (date) {
                const isoDate = new Date(date).toISOString();
                formData.append('date', isoDate);
            } else {
                console.warn("Date is invalid or undefined.");
            }
            
            if (values.to) {
                formData.append('to', values.to);
            }
            if (values.subject) {
                formData.append('subject', values.subject);
            }
            if (values.file) {
                formData.append('file', values.file);
            }

            // Menggunakan PATCH untuk memperbarui data surat
            const response: any = await ky.patch(`http://localhost:5000/api/letter/${id}`, {
                headers: {
                    Authorization: `Bearer ${token}`,
                    'Cache-Control': 'no-cache', // Pastikan tidak menyimpan cache
                },
                body: formData,
            }).json();

            setApiResponse(response);
            open();

        } catch (error: any) {
            console.error("Error:", error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <>
            <Paper withBorder shadow="md" p="md">
                <Box component="form" onSubmit={form.onSubmit((values) => handleSubmit(values))}>
                    <Text component="h2" fw="bold" fz="lg">
                        Edit Surat
                    </Text>
                    
                    <TextInput
                        value={convertUTC(date)}
                        label="Tanggal"
                        readOnly
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
                        description={fileName ? `File saat ini: ${fileName}` : null}
                    />
                    <Space h="sm" />
                        
                    <Button type="submit" mt="md" loading={loading}>
                        Update
                    </Button>
                </Box>

                <Modal opened={opened} onClose={close} title="Surat berhasil diperbarui" centered>
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
            </Paper>
        </>
    );
}
