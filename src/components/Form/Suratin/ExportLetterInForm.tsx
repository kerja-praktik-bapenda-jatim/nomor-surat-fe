"use client";

import { useEffect, useState } from 'react';
import { Button, Paper, Text, Space, Select } from '@mantine/core';
import { useForm } from '@mantine/form';
import { DateInput } from '@mantine/dates';
import { modals } from '@mantine/modals';
import { exportLetters } from '@/services/suratin';
import { useRouter } from 'next/navigation';
import { IconArrowLeft } from '@tabler/icons-react';
import { useClassifications } from '@/services/data';
import { getCurrentUser } from '@/services/auth';

interface ExportFormValues {
    startDate: string;
    endDate: string;
    classificationId: string;
}

export function ExportLetterInForm() {
    const router = useRouter();

    const {
        data: classificationsData,
        isLoading: isClassificationsLoading,
        error: classificationsError,
    } = useClassifications();

    const classificationOptions = classificationsData?.map((classification) => ({
        value: classification.id,
        label: `${classification.id} - ${classification.name}`,
    })) || [];

    const form = useForm<ExportFormValues>({
        initialValues: {
            startDate: '',
            endDate: '',
            classificationId: '',
        },
        validate: {
            startDate: (value) => value ? null : 'Tanggal mulai harus dipilih',
            endDate: (value) => value ? null : 'Tanggal akhir harus dipilih',
        },
    });

    const [loading, setLoading] = useState(false);
    const [user, setUser] = useState({ userName: "Guest", departmentName: "Unknown Department", isAdmin: false });

    useEffect(() => {
        const user = getCurrentUser();
        console.log("isAdmin", user.isAdmin)
        setUser(user);
    }, []);

    const handleSubmit = async (values: ExportFormValues) => {
        setLoading(true);
        try {
            const response = await exportLetters(values);
            modals.open({
                title: 'Ekspor Surat Masuk',
                centered: true,
                children: (
                    <>
                        <Text size="sm">{response.message}</Text>
                        <Button
                            onClick={() => {
                                modals.closeAll();
                                handleBack();
                            }}
                            mt="md"
                        >
                            OK
                        </Button>
                    </>
                ),
            });
        } catch (error: any) {
            modals.open({
                title: 'Error',
                centered: true,
                children: (
                    <>
                        <Text size="sm">{error.message}</Text>
                        <Button
                            onClick={() => {
                                modals.closeAll();
                            }}
                            mt="md"
                        >
                            OK
                        </Button>
                    </>
                ),
            });
        } finally {
            setLoading(false);
        }
    };

    const handleBack = () => {
        router.push('/suratin');
    };

    return (
        <Paper withBorder shadow="md" p="md">
            <Button onClick={handleBack} variant="light" leftSection={<IconArrowLeft />} mb="md">
                Kembali
            </Button>
            <Text component="h2" fw="bold" fz="lg">
                Ekspor Surat Masuk
            </Text>
            <form onSubmit={form.onSubmit(handleSubmit)}>
                <DateInput
                    clearable
                    valueFormat="DD-MM-YYYY"
                    {...form.getInputProps('startDate')}
                    label="Tanggal Mulai"
                    placeholder="Pilih tanggal mulai"
                />
                <Space h="md" />
                <DateInput
                    clearable
                    valueFormat="DD-MM-YYYY"
                    {...form.getInputProps('endDate')}
                    label="Tanggal Akhir"
                    placeholder="Pilih tanggal akhir"
                />
                <Space h="md" />
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
                <Space h="md" />
                <Button type="submit" mt="md" loading={loading}>
                    Ekspor
                </Button>
            </form>
        </Paper>
    );
}
