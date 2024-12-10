"use client";
import { useState } from 'react';
import { Button, FileInput, TextInput, Text, Space, Box, Paper, CopyButton, Tooltip, ActionIcon, Select, NumberInput } from '@mantine/core';
import { hasLength, useForm } from '@mantine/form';
import { DateInput } from '@mantine/dates';
import { useRouter } from "next/navigation";
import { convertUTC } from '@/utils/utils';
import { IconArrowLeft, IconCheck, IconCopy } from '@tabler/icons-react';
import { postLetters } from '@/services/surat';
import { modals } from '@mantine/modals';
import { useClassifications, useDepartments, useLevels } from '@/services/data';

export function CreateLetterForm() {
    const {
        data: classificationsData,
        isLoading: isClassificationsLoading,
        error: classificationsError,
    } = useClassifications();

    const {
        data: departmentsData,
        isLoading: isDepartmentsLoading,
        error: departmentsError,
    } = useDepartments();

    const {
        data: levelsData,
        isLoading: isLevelsLoading,
        error: levelsError,
    } = useLevels();

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

    const form = useForm({
        mode: 'uncontrolled',
        validate: {
            date: (value) => (value ? null : 'Pilih tanggal'),
            classificationId: (value) => (value ? null : 'Pilih kode klasifikasi'),
            departmentId: (value) => (value ? null : 'Pilih kode bidang'),
            to: hasLength({ min: 3 }, 'Kolom tidak boleh kosong'),
            subject: hasLength({ min: 3 }, 'Kolom tidak boleh kosong'),
            levelId: (value) => (value ? null : 'Pilih sifat surat'),
            attachmentCount: (value) => (value > 0 ? null : 'Jumlah lampiran harus lebih dari 0'),
            description: hasLength({ min: 3 }, 'Kolom tidak boleh kosong'),
            file: (value) => (value ? null : 'Kolom tidak boleh kosong'),
        },
        initialValues: {
            date: new Date(),
            classificationId: '',
            departmentId: "",
            to: '',
            subject: '',
            levelId: "",
            attachmentCount: 0,
            description: "",
            file: null,
        },
    });

    const [loading, setLoading] = useState(false);
    const router = useRouter();
    const handleSubmit = async (values: typeof form.values) => {
        setLoading(true);

        try {
            const formData = new FormData();
            formData.append('date', values.date.toISOString());

            if (values.classificationId) {
                formData.append('classificationId', values.classificationId);
            }
            if (values.departmentId) {
                formData.append('departmentId', values.departmentId);
            }
            if (values.to) {
                formData.append('to', values.to);
            }
            if (values.subject) {
                formData.append('subject', values.subject);
            }
            if (values.levelId) {
                formData.append('levelId', values.levelId);
            }
            if (values.attachmentCount) {
                formData.append('attachmentCount', values.attachmentCount.toString());
            }
            if (values.description) {
                formData.append('description', values.description);
            }
            if (values.file) {
                formData.append('file', values.file);
            }

            const response = await postLetters(formData);
            modals.open({
                title: 'Surat berhasil dibuat',
                centered: true,
                children: (
                    <>
                        <Text size="sm">
                            <strong>Nomor Surat:</strong> {response.number} 
                            <CopyButton value={response.number} timeout={2000}>
                                {({ copied, copy }) => (
                                    <Tooltip label={copied ? 'Disalin' : 'Salin'} withArrow position="right">
                                        <ActionIcon color={copied ? 'teal' : 'gray'} variant="subtle" onClick={copy} ml="xs">
                                            {copied ? <IconCheck size={16} /> : <IconCopy size={16} />}
                                        </ActionIcon>
                                    </Tooltip>
                                )}
                            </CopyButton>
                            <br />
                            <strong>Tanggal:</strong> {convertUTC(response.date)}<br />
                            <strong>Kode Klasifikasi Surat:</strong>{response.classificationId}<br />
                            <strong>Kode Bidang:</strong>{response.departmentId} <br />
                            <strong>Kepada:</strong> {response.to}<br />
                            <strong>Perihal:</strong> {response.subject}<br />
                            <strong>Keterangan:</strong>{response.description} <br />
                            <strong>File:</strong> {response.filename}<br />
                        </Text>
                        <Button onClick={() => { form.reset(); modals.closeAll(); handleBack(); } } mt="md">
                            OK
                        </Button>
                    </>
                )
            })

        } catch (error: any) {
            let errorMessage = "Terjadi kesalahan. Silakan coba lagi.";
            if (error.response){
                const errorData  = await error.response.json();
                errorMessage = errorData.message || errorMessage;
            }
            modals.open({
                title: 'Error',
                centered: true,
                children: (
                    <>
                        <Text size="sm">{errorMessage}</Text>
                        <Button
                            onClick={() => {
                                modals.closeAll();
                            }}
                            mt="md"
                        >
                            OK
                        </Button>
                    </>
                )
            });
        } finally {
            setLoading(false);
        }
    };

    const handleBack = () => {
        router.push('/surat');
    };

    return (
    <>
    <Paper withBorder shadow="md" p="md">
        <Button onClick={handleBack} variant="light" leftSection={<IconArrowLeft />} mb="md">
            Kembali
        </Button>
        <Box component="form" onSubmit={form.onSubmit((values) => handleSubmit(values))}>
            <Text component="h2" fw="bold" fz="lg">
                Buat Surat
            </Text>
            <DateInput
                {...form.getInputProps('date')}
                label="Tanggal"
                placeholder="Pilih tanggal"
                valueFormat="DD-MMMM-YYYY"
                minDate={new Date()}
                readOnly
                clearable
            />
            <Space h="sm" />

            <Select
                {...form.getInputProps('classificationId')}
                label="Kode Klasifikasi Surat"
                placeholder={isClassificationsLoading ? "Memuat data..." : "Pilih atau Cari"}
                data={classificationOptions}
                clearable
                searchable
                nothingFoundMessage="Kode Klasifikasi tidak ditemukan..."
                checkIconPosition="right"
                disabled={isClassificationsLoading || !!classificationsError}
                error={classificationsError ? "Gagal memuat data" : null}
            />

            <Select
                {...form.getInputProps('departmentId')}
                label="Kode Bidang"
                placeholder={isDepartmentsLoading ? "Memuat data..." : "Pilih atau Cari"}
                data={departmentOptions}
                clearable
                searchable
                nothingFoundMessage="Kode Bidang tidak ditemukan..."
                checkIconPosition="right"
                disabled={isDepartmentsLoading || !!departmentsError}
                error={departmentsError ? "Gagal memuat data" : null}
            />

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

            <Select
                {...form.getInputProps('levelId')}
                label="Sifat Surat"
                placeholder={isLevelsLoading ? "Memuat data..." : "Pilih atau Cari"}
                data={levelOptions}
                clearable
                searchable
                nothingFoundMessage="Sifat Surat tidak ditemukan..."
                checkIconPosition="right"
                disabled={isLevelsLoading || !!levelsError}
                error={levelsError ? "Gagal memuat data" : null}
            />

            <NumberInput
                {...form.getInputProps('attachmentCount')}
                label="Jumlah Lampiran"
                placeholder="Jumlah Lampiran"
            />
            <Space h="sm" />

            <TextInput
                {...form.getInputProps('description')}
                label="Keterangan"
                placeholder="Keterangan"
            />
            <Space h="sm" />

            <FileInput
                clearable
                {...form.getInputProps('file')}
                label="Upload File"
                placeholder="Pilih file"
            />
            <Space h="sm" />
                
            <Button type="submit" loading={loading}>
                Submit
            </Button>
        </Box>
    </Paper>
    </>
        
    );
}
