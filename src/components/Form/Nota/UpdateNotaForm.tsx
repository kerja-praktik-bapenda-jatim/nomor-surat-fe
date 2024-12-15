"use client";
import { useEffect, useState } from 'react';
import { TextInput, Text, Space, Box, Paper, Center, Loader, Button, FileInput, NumberInput, Select } from '@mantine/core';
import { modals } from '@mantine/modals';
import { useParams, useRouter } from "next/navigation";
import { convertUTC } from '@/utils/utils';
import { IconArrowLeft } from '@tabler/icons-react';
import { patchNota, useNotaById } from '@/services/nota';
import { UpdateNotaResponse } from '@/services/nota/types';
import { useClassifications, useDepartments, useLevels } from '@/services/data';

export function UpdateLetterForm() {
    const { id } = useParams();
    const letterId = Array.isArray(id) ? id[0] : id;
    const router = useRouter();

    const { data: classificationsData } = useClassifications();
    const { data: departmentsData } = useDepartments();
    const { data: levelsData } = useLevels();

    const classificationOptions = classificationsData?.map(({ id, name }) => ({
        value: id, label: `${id} - ${name}`
    })) || [];

    const departmentOptions = departmentsData?.map(({ id, name }) => ({
        value: id, label: `${id} - ${name}`
    })) || [];

    const levelOptions = levelsData?.map(({ id, name }) => ({
        value: id, label: name
    })) || [];
    
    const { data: letter, isLoading: isLetterLoading, error: letterError } = useNotaById(letterId);
    const [formData, setFormData] = useState<UpdateNotaResponse>({
        subject: '',
        to: '',
        classificationId: '',
        departmentId: '',
        levelId: '',
        attachmentCount: '',
        description: '',
        file: null,
    });

    useEffect(() => {
        if (letter) {
            setFormData({
                subject: letter.subject,
                to: letter.to,
                classificationId: letter.classificationId || '',
                departmentId: letter.departmentId || '',
                levelId: letter.levelId || '',
                attachmentCount: letter.attachmentCount || '',
                description: letter.description || '',
                file: null,
            });
        }
    }, [letter]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
    };

    const handleSelectChange = (name: string, value: string | number | null) => {
        setFormData((prev) => ({ ...prev, [name]: value || '' }));
    };

    const handleFileChange = (file: File | null) => {
        setFormData((prev) => ({ ...prev, file }));
    };

    const handleSubmit = async () => {
        if (!id) return;
        try {
            const updateSuccess = await patchNota(letterId, formData);
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
        } catch (error: any) {
        // Tangani error dari backend
        const errorMessage = error.response?.data?.message || "Terjadi kesalahan saat memperbarui data.";
    
        modals.open({
            title: 'Pembaharuan Gagal',
            centered: true,
            children: (
            <>
                <Text size="sm">{errorMessage}</Text>
                <Button onClick={() => modals.closeAll()} mt="md">
                OK
                </Button>
            </>
            ),
        });
        }
    };

    const handleBack = () => {
        router.push(`/nota/view/${id}`);
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
            <Button onClick={handleBack} variant="light" leftSection={<IconArrowLeft />} mb="md">
                    Kembali
            </Button>
            <Box>
                <Text component="h2" fw="bold" fz="lg">
                    Update Nota Dinas
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
                
                <Select
                    name="classificationId"
                    label="Kode Klasifikasi Surat"
                    data={classificationOptions}
                    value={formData.classificationId}
                    onChange={(value) => handleSelectChange('classificationId', value)}
                    clearable
                    searchable
                    nothingFoundMessage="Kode Klasifikasi Surat ditemukan..."
                    checkIconPosition="right"
                />
                <Space h="sm" />

                <Select
                    readOnly
                    name="departmentId"
                    label="Kode Bidang"
                    data={departmentOptions}
                    value={formData.departmentId}
                    onChange={(value) => handleSelectChange('departmentId', value)}
                    clearable
                    searchable
                    nothingFoundMessage="Kode Bidang tidak ditemukan..."
                    checkIconPosition="right"
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

                <Select
                    name="levelId"
                    label="Sifat Surat"
                    data={levelOptions}
                    value={formData.levelId}
                    onChange={(value) => handleSelectChange('levelId', value)}
                    clearable
                    searchable
                    nothingFoundMessage="Sifat Surat tidak ditemukan..."
                    checkIconPosition="right"
                />
                <Space h="sm" />

                <NumberInput
                    name="attachmentCount"
                    label="Jumlah Lampiran"
                    value={formData.attachmentCount}
                    onChange={(value) => handleSelectChange('attachmentCount', value || 0)}
                />
                <Space h="sm" />

                <TextInput
                    name="description"
                    value={formData.description}
                    label="Keterangan"
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
