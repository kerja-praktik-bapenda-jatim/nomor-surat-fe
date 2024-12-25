"use client";
import { useEffect, useState } from 'react';
import { Button, FileInput, TextInput, Text, Space, Box, Paper, CopyButton, Tooltip, ActionIcon, Select, NumberInput } from '@mantine/core';
import { hasLength, useForm } from '@mantine/form';
import { DateInput } from '@mantine/dates';
import { useRouter } from "next/navigation";
import { convertUTC } from '@/utils/utils';
import { IconArrowLeft, IconCheck, IconCopy } from '@tabler/icons-react';
import { postNota } from '@/services/nota';
import { modals } from '@mantine/modals';
import { useAccess, useActiveRetentionPeriods, useClassifications, useDepartments, useInactiveRetentionPeriods, useJRADescriptions, useLevels, useStorageLocations } from '@/services/data';
import { getCurrentUser } from '@/services/auth';

export function CreateNotaForm() {
    const { data: classificationsData, isLoading: isClassificationsLoading, error: classificationsError } = useClassifications();
    const { data: departmentsData, isLoading: isDepartmentsLoading, error: departmentsError } = useDepartments();
    const { data: levelsData, isLoading: isLevelsLoading, error: levelsError } = useLevels();
    const { data: accessData, isLoading: isAccessLoading, error: accessError } = useAccess();
    const { data: activeRetentionPeriodsData, isLoading: isActiveRetentionPeriodsLoading, error: activeRetentionPeriodsError } = useActiveRetentionPeriods();
    const { data: inactiveRetentionPeriodsData, isLoading: isInactiveRetentionPeriodsLoading, error: inactiveRetentionPeriodsError } = useInactiveRetentionPeriods();
    const { data: jraDescriptionsData, isLoading: isJRADescriptionsLoading, error: jraDescriptionsError } = useJRADescriptions();
    const { data: storageLocationsData, isLoading: isStorageLocationsLoading, error: storageLocationsError } = useStorageLocations();    

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

    const [user, setUser] = useState({ userName: "Guest", departmentName: "Unknown Department", isAdmin: false });
            
        useEffect(() => {
            const user = getCurrentUser();
            setUser(user);
        }, []);

    const form = useForm({
        mode: 'uncontrolled',
        validate: {
            date: (value) => (value ? null : 'Kolom tidak boleh kosong'),
            classificationId: (value) => (value ? null : 'Pilih kode klasifikasi'),
            departmentId: (value) => {
                if (user.isAdmin && !value) {
                    return "Kode Bidang diperlukan";
                }
                return null;
            },
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
            departmentId: '',
            to: '',
            subject: '',
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
            
            formData.append('departmentId', values.departmentId || "");
            
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

            formData.append('accessId', values.accessId  || "");
            formData.append('documentIndexName', values.documentIndexName  || "");
            formData.append('activeRetentionPeriodId', values.activeRetentionPeriodId  || "");
            formData.append('inactiveRetentionPeriodId', values.inactiveRetentionPeriodId  || "");
            formData.append('jraDescriptionId', values.jraDescriptionId  || "");
            formData.append('storageLocationId', values.storageLocationId  || "");

            const response = await postNota(formData);
            modals.open({
                title: 'Nota Dinas berhasil dibuat',
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
            let anyError = error;
            if (error.response){
                anyError = await error.response.json();
            }
            modals.open({
                title: 'Error',
                centered: true,
                children: (
                    <>
                        <Text size="sm">{anyError.message}</Text>
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
        router.push('/nota');
    };

    return (
    <>
    <Paper withBorder shadow="md" p="md">
        <Button onClick={handleBack} variant="light" leftSection={<IconArrowLeft />} mb="md">
            Kembali
        </Button>
        <Box component="form" onSubmit={form.onSubmit((values) => handleSubmit(values))}>
            <Text component="h2" fw="bold" fz="lg">
                Tambah Nota Dinas
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
            <Space h="sm" />

            <Select
                {...form.getInputProps('departmentId')}
                label="Kode Bidang"
                placeholder={isDepartmentsLoading ? "Memuat data..." : "Pilih atau Cari"}
                data={departmentOptions}
                clearable
                searchable
                nothingFoundMessage="Kode Bidang tidak ditemukan..."
                checkIconPosition="right"
                disabled={isDepartmentsLoading || !!departmentsError || !user.isAdmin}
                error={departmentsError ? "Gagal memuat data" : null}
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
            <Space h="sm" />

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
                {...form.getInputProps('file')}
                label="Upload File"
                placeholder="Pilih file"
                clearable
            />
            <Space h="sm" />

            <Select
                {...form.getInputProps('accessId')}
                label="Hak Akses"
                placeholder={isAccessLoading ? "Memuat data..." : "Pilih atau Cari"}
                data={accessOptions}
                clearable
                searchable
                nothingFoundMessage="Hak Akses tidak ditemukan..."
                checkIconPosition="right"
                disabled={isAccessLoading || !!accessError}
                error={accessError ? "Gagal memuat data" : null}
            />
            <Space h="sm" />

            <TextInput
                {...form.getInputProps('documentIndexName')}
                label="Index Nama Berkas"
                placeholder="Index Nama Berkas"
            />
            <Space h="sm" />
            
            <Select
                {...form.getInputProps('activeRetentionPeriodId')}
                label="Jangka Simpan Waktu Aktif"
                placeholder={isActiveRetentionPeriodsLoading ? "Memuat data..." : "Pilih atau Cari"}
                data={activeRetentionPeriodOptions}
                clearable
                searchable
                nothingFoundMessage="Data tidak ditemukan..."
                checkIconPosition="right"
                disabled={isActiveRetentionPeriodsLoading || !!activeRetentionPeriodsError}
                error={activeRetentionPeriodsError ? "Gagal memuat data" : null}
            />
            <Space h="sm" />

            <Select
                {...form.getInputProps('inactiveRetentionPeriodId')}
                label="Jangka Simpan Waktu Inaktif"
                placeholder={isInactiveRetentionPeriodsLoading ? "Memuat data..." : "Pilih atau Cari"}
                data={inactiveRetentionPeriodOptions}
                clearable
                searchable
                nothingFoundMessage="Data tidak ditemukan..."
                checkIconPosition="right"
                disabled={isInactiveRetentionPeriodsLoading || !!inactiveRetentionPeriodsError}
                error={inactiveRetentionPeriodsError ? "Gagal memuat data" : null}
            />
            <Space h="sm" />

            <Select
                {...form.getInputProps('jraDescriptionId')}
                label="Keterangan di JRA"
                placeholder={isJRADescriptionsLoading ? "Memuat data..." : "Pilih atau Cari"}
                data={jraDescriptionOptions}
                clearable
                searchable
                nothingFoundMessage="Keterangan tidak ditemukan..."
                checkIconPosition="right"
                disabled={isJRADescriptionsLoading || !!jraDescriptionsError}
                error={jraDescriptionsError ? "Gagal memuat data" : null}
            />
            <Space h="sm" />

            <Select
                {...form.getInputProps('storageLocationId')}
                label="Lokasi Simpan"
                placeholder={isStorageLocationsLoading ? "Memuat data..." : "Pilih atau Cari"}
                data={storageLocationOptions}
                clearable
                searchable
                nothingFoundMessage="Lokasi simpan tidak ditemukan..."
                checkIconPosition="right"
                disabled={isStorageLocationsLoading || !!storageLocationsError}
                error={storageLocationsError ? "Gagal memuat data" : null}
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
