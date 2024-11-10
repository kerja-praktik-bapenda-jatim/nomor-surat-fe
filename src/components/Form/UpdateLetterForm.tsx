"use client";
import { useEffect, useState } from 'react';
import { TextInput, Text, Space, Box, Paper, Center, Loader, Button, FileInput } from '@mantine/core';
import { modals } from '@mantine/modals';
import { useParams, useRouter } from "next/navigation";
import { convertUTC } from '@/utils/utils';
import { IconArrowLeft } from '@tabler/icons-react';
import { patchLetter, useLetterById } from '@/services/letters';
import { UpdateLetterResponse } from '@/services/letters/types';

export function UpdateLetterForm() {
    const { id } = useParams();
    const letterId = Array.isArray(id) ? id[0] : id;
    const router = useRouter();
    const { data: letter, isLoading: isLetterLoading, error: letterError } = useLetterById(letterId);
    const [formData, setFormData] = useState<UpdateLetterResponse>({
        subject: '',
        to: '',
        file: null,
    });

    useEffect(() => {
        if (letter) {
            setFormData({
                subject: letter.subject,
                to: letter.to,
                file: null,
            });
        }
    }, [letter]);

    // Handle input changes
    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
    };

    const handleFileChange = (file: File | null) => {
        setFormData((prev) => ({ ...prev, file }));
    };

    const handleSubmit = async () => {
        if (!id) return;
        const updateSuccess = await patchLetter(letterId, formData);
        if (updateSuccess) {
            modals.open({
                title: 'Pembaharuan Berhasil',
                centered: true,
                children: (
                    <>
                        <Text size="sm">Data surat berhasil diperbarui.</Text>
                        <Button onClick={() => { modals.closeAll(); handleBack(); }} mt="md">
                            OK
                        </Button>
                    </>
                ),
            });
        }
    };

    const handleBack = () => {
        router.push(`/dashboard/surat/view/${id}`);
    };

    if (isLetterLoading) {
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
