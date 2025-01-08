"use client";
import { useEffect, useState } from 'react';
import { TextInput, Text, Space, Box, Paper, Center, Loader, Button, FileInput, NumberInput, Select } from '@mantine/core';
import { modals } from '@mantine/modals';
import { useParams, useRouter } from "next/navigation";
import { convertUTC } from '@/utils/utils';
import { IconArrowLeft } from '@tabler/icons-react';
import { patchNota, useNotaById } from '@/services/nota';
import { UpdateNotaResponse } from '@/services/nota/types';
import { useAccess, useActiveRetentionPeriods, useClassifications, useDepartments, useInactiveRetentionPeriods, useJRADescriptions, useLevels, useStorageLocations } from '@/services/data';
import {getCurrentUser} from "@/services/auth";

export function UpdateLetterForm() {
    const { id } = useParams();
    const letterId = Array.isArray(id) ? id[0] : id;
    const router = useRouter();

    const { data: classificationsData } = useClassifications();
    const { data: departmentsData } = useDepartments();
    const { data: levelsData } = useLevels();
    const { data: accessData } = useAccess();
    const { data: activeRetentionPeriodsData } = useActiveRetentionPeriods();
    const { data: inactiveRetentionPeriodsData } = useInactiveRetentionPeriods();
    const { data: jraDescriptionsData } = useJRADescriptions();
    const { data: storageLocationsData } = useStorageLocations();

    const classificationOptions = classificationsData?.map((classification) => ({
        value: classification.id,
        label: `${classification.id} - ${classification.name}`,
    })) || [];

    const departmentOptions = departmentsData?.map((department) => ({
        value: department.id,
        label: `${department.id} - ${department.name}`,
    })) || [];

    const levelOptions = levelsData?.map((level) => ({
        value: level.id,
        label: level.name,
    })) || [];

    const accessOptions = accessData?.map((access) => ({
        value: access.id,
        label: access.name,
    })) || [];

    const activeRetentionPeriodOptions = activeRetentionPeriodsData?.map((activeRetentionPeriod) => ({
        value: activeRetentionPeriod.id,
        label: activeRetentionPeriod.name,
    })) || [];

    const inactiveRetentionPeriodOptions = inactiveRetentionPeriodsData?.map((inactiveRetentionPeriod ) => ({
        value: inactiveRetentionPeriod.id,
        label: inactiveRetentionPeriod.name,
    })) || [];

    const jraDescriptionOptions = jraDescriptionsData?.map((jraDescription) => ({
        value: jraDescription.id,
        label: jraDescription.name,
    })) || [];

    const storageLocationOptions = storageLocationsData?.map((storageLocation) => ({
        value: storageLocation.id,
        label: storageLocation.name,
    })) || [];

    const { data: letter, isLoading: isLetterLoading, error: letterError } = useNotaById(letterId);
    const [formData, setFormData] = useState<UpdateNotaResponse>({
        subject: '',
        to: '',
        classificationId: '',
        departmentId: '',
        levelId: '',
        attachmentCount: 0,
        description: '',
        accessId: '',
        documentIndexName: '',
        activeRetentionPeriodId: '',
        inactiveRetentionPeriodId: '',
        jraDescriptionId: '',
        storageLocationId: '',
        file: null,
    });

		const [loading, setLoading] = useState(false);
		const [user, setUser] = useState({ userName: "Guest", departmentName: "Unknown Department", isAdmin: false });

		useEffect(() => {
				const user = getCurrentUser();
				setUser(user);
		}, []);

    useEffect(() => {
        if (letter) {
            setFormData({
                subject: letter.subject,
                to: letter.to,
                classificationId: letter.classificationId || '',
                departmentId: letter.departmentId || '',
                levelId: letter.levelId || '',
                attachmentCount: letter.attachmentCount || 0,
                description: letter.description || '',
                accessId: letter.accessId || '',
                documentIndexName: letter.documentIndexName || '',
                activeRetentionPeriodId: letter.activeRetentionPeriodId || '',
                inactiveRetentionPeriodId: letter.inactiveRetentionPeriodId || '',
                jraDescriptionId: letter.jraDescriptionId || '',
                storageLocationId: letter.storageLocationId || '',
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
				setLoading(true)

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
        let errorMessage = error.response?.data?.message || "Terjadi kesalahan saat memperbarui data.";
				if(error instanceof Error) {
						errorMessage = error.message
				}

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
				setLoading(false)
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
										withAsterisk
                />
                <Space h="sm" />

                <Select
                    name="departmentId"
                    label="Kode Bidang"
                    data={departmentOptions}
                    value={formData.departmentId}
                    onChange={(value) => handleSelectChange('departmentId', value)}
                    clearable
										disabled={!user.isAdmin}
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
										withAsterisk
                />
                <Space h="sm" />

                <TextInput
                    name="subject"
                    value={formData.subject}
                    label="Perihal"
                    onChange={handleChange}
										withAsterisk
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
										withAsterisk
                />
                <Space h="sm" />

                <NumberInput
                    name="attachmentCount"
                    label="Jumlah Lampiran"
                    value={formData.attachmentCount}
                    onChange={(value) => handleSelectChange('attachmentCount', value || 0)}
										withAsterisk
                />
                <Space h="sm" />

                <TextInput
                    name="description"
                    value={formData.description}
                    label="Keterangan"
                    onChange={handleChange}
										withAsterisk
                />
                <Space h="sm" />

                <Select
                    name="accessId"
                    label="Hak Akses"
                    data={accessOptions}
                    value={formData.accessId}
                    onChange={(value) => handleSelectChange('accessId', value)}
                    clearable
                    searchable
                    nothingFoundMessage="Hak Akses tidak ditemukan..."
                    checkIconPosition="right"
                />
                <Space h="sm" />

                <TextInput
                    name="documentIndexName"
                    value={formData.documentIndexName}
                    label="Index Nama Berkas"
                    onChange={handleChange}
                />
                <Space h="sm" />

                <Select
                    name="activeRetentionPeriodId"
                    label="Jangka Waktu Simpan Aktif"
                    data={activeRetentionPeriodOptions}
                    value={formData.activeRetentionPeriodId}
                    onChange={(value) => handleSelectChange('activeRetentionPeriodId', value)}
                    clearable
                    searchable
                    nothingFoundMessage="Data tidak ditemukan..."
                    checkIconPosition="right"
                />
                <Space h="sm" />

                <Select
                    name="inactiveRetentionPeriodId"
                    label="Jangka Waktu Simpan Inaktif"
                    data={inactiveRetentionPeriodOptions}
                    value={formData.inactiveRetentionPeriodId}
                    onChange={(value) => handleSelectChange('inactiveRetentionPeriodId', value)}
                    clearable
                    searchable
                    nothingFoundMessage="Data tidak ditemukan..."
                    checkIconPosition="right"
                />
                <Space h="sm" />

                <Select
                    name="jraDescriptionId"
                    label="Keterangan di JRA"
                    data={jraDescriptionOptions}
                    value={formData.jraDescriptionId}
                    onChange={(value) => handleSelectChange('jraDescriptionId', value)}
                    clearable
                    searchable
                    nothingFoundMessage="Keterangan tidak ditemukan..."
                    checkIconPosition="right"
                />
                <Space h="sm" />

                <Select
                    name="storageLocationId"
                    label="Lokasi Simpan"
                    data={storageLocationOptions}
                    value={formData.storageLocationId}
                    onChange={(value) => handleSelectChange('storageLocationId', value)}
                    clearable
                    searchable
                    nothingFoundMessage="Lokasi Simpan tidak ditemukan..."
                    checkIconPosition="right"
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

                <Button onClick={handleSubmit} loading={loading}>
                    Update Surat
                </Button>
            </Box>
        </Paper>
    );
}
