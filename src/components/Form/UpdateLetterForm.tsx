"use client";
import { useEffect, useState } from 'react';
import { TextInput, Text, Space, Box, Paper, Center, Loader, Button, FileInput } from '@mantine/core';
import { modals } from '@mantine/modals';
import ky from 'ky';
import { useParams, useRouter } from "next/navigation";
import { convertUTC, getAuthToken } from '@/utils/utils';
import { IconArrowLeft } from '@tabler/icons-react';

export function UpdateLetterForm() {
    const { id } = useParams();
    const router = useRouter();
    const [letter, setLetter] = useState<{ number: string; date: string; filename: string } | null>(null);
    const [formData, setFormData] = useState<{ subject: string; to: string; file: File | null }>({ subject: '', to: '', file: null });
    const [loading, setLoading] = useState(true);
    const token = getAuthToken();

    // Fetch initial letter data
    useEffect(() => {
        const fetchLetterData = async () => {
            if (!id) return;
            try {
                const response = await ky.get(`http://localhost:5000/api/letter/${id}`, {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                }).json();
                setLetter(response);
                setFormData({ subject: response.subject, to: response.to, file: null });
            } catch (error) {
                console.error("Gagal mengambil data surat:", error);
            } finally {
                setLoading(false);
            }
        };
        fetchLetterData();
    }, [id]);

    // Handle input changes
    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
    };

    const handleFileChange = (file: File | null) => {
        setFormData((prev) => ({ ...prev, file }));
    };

    // Submit updated data
    const handleSubmit = async () => {
        const formDataToSend = new FormData();
        formDataToSend.append('subject', formData.subject);
        formDataToSend.append('to', formData.to);
        if (formData.file) formDataToSend.append('file', formData.file);
        try {
            await ky.patch(`http://localhost:5000/api/letter/${id}`, {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
                body: formDataToSend,
            });
            modals.open({
                title: 'Pembaharuan Berhasil',
                centered: true,
                children: (
                    <>
                        <Text size="sm">Data surat berhasil diperbarui.</Text>,
                        <Button onClick={() => { modals.closeAll(); handleBack(); } } mt="md">
                            OK
                        </Button>
                    </>
                )
            })
        } catch (error) {
            console.error("Gagal memperbarui data surat:", error);
        }
    };

    const handleBack = () => {
        router.push(`/dashboard/surat/view/${id}`);
    };

    if (loading) {
        return (
            <Center>
                <Loader size="lg" />
            </Center>
        );
    }

    return (
        <Paper withBorder shadow="md" p="md">
            <Button onClick={handleBack} variant="light" leftSection={<IconArrowLeft />}>
                    Kembali
            </Button>
            <Box>
                <Text component="h2" fw="bold" fz="lg">
                    Update Surat
                </Text>
                <TextInput
                    readOnly
                    name="number"
                    value={letter?.number || ''}
                    label="Nomor Surat"
                    onChange={handleChange}
                />
                <Space h="sm" />

                <TextInput
                    readOnly
                    name="date"
                    value={letter?.date ? convertUTC(letter.date) : ''}
                    label="Tanggal"
                    onChange={handleChange}
                />
                <Space h="sm" />
                
                <TextInput
                    name="to"
                    value={formData.to}
                    label="Kepada"
                    onChange={handleChange}
                />
                <Space h="sm" />
                
                <TextInput
                    name="subject"
                    value={formData.subject}
                    label="Perihal"
                    onChange={handleChange}
                />
                <Space h="sm" />
            
                <FileInput
                    clearable
                    label="File"
                    placeholder="Pilih file"
                    description={letter?.filename ? `File saat ini: ${letter.filename}` : null}
                    value={formData.file}
                    onChange={handleFileChange}
                />
                <Space h="sm" />

                <Button onClick={handleSubmit}>
                    Update Surat
                </Button>
            </Box>
        </Paper>
    );
}
