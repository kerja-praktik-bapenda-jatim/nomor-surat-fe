"use client";
import { useEffect, useState } from 'react';
import { TextInput, Text, Space, Box, Paper, Center, Loader, Button, FileInput, Select, NumberInput } from '@mantine/core';
import { modals } from '@mantine/modals';
import { useParams, useRouter } from "next/navigation";
import { patchLetter, useLetterById } from '@/services/surat';
import { UpdateLetterResponse } from '@/services/surat/types';
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

    const { data: letter, isLoading } = useLetterById(letterId);

    const [formData, setFormData] = useState<UpdateLetterResponse>({
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
            subject: letter.subject || '',
            to: letter.to || '',
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
        if (!letterId) return;

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
        router.push(`/surat/view/${letterId}`);
    };

    if (isLoading) {
        return (
        <Center>
            <Loader size="lg" />
        </Center>
        );
    }

    return (
        <Paper withBorder shadow="md" p="md">
        <Button onClick={handleBack} variant="light" leftSection="←" mb="md">
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
            />
            <Space h="sm" />

            <Select
            name="classificationId"
            label="Kode Klasifikasi Surat"
            data={classificationOptions}
            value={formData.classificationId}
            onChange={(value) => handleSelectChange('classificationId', value)}
            />
            <Space h="sm" />

            <Select
            readOnly
            name="departmentId"
            label="Kode Bidang"
            data={departmentOptions}
            value={formData.departmentId}
            onChange={(value) => handleSelectChange('departmentId', value)}
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
