"use client"
import { useState } from 'react';
import { Button, Paper, Text, NativeSelect, Space } from '@mantine/core';
import { useForm } from '@mantine/form';
import { DateInput } from '@mantine/dates';
import { modals } from '@mantine/modals';
import { useDepartments, exportLetters } from '@/services/surat';
import { useRouter } from 'next/navigation';
import { IconArrowLeft } from '@tabler/icons-react';

export function ExportLetterForm() {
    const router = useRouter();
    const { data, isLoading } = useDepartments();
    const form = useForm({
        initialValues: {
            startDate: '',
            endDate: '',
            departmentId: '',
        },
        validate: {
            startDate: (value) => value ? null : 'Tanggal mulai harus dipilih',
            endDate: (value) => value ? null : 'Tanggal akhir harus dipilih',
            departmentId: (value) => value ? null : 'Bidang harus dipilih',
        },
    });

    const [loading, setLoading] = useState(false);

    const handleSubmit = async (values: typeof form.values) => {
        setLoading(true);
        try {
            const response = await exportLetters(values); // Fungsi untuk mengirim request ekspor
            modals.open({
                title: 'Ekspor Surat',
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
        router.push('/surat');
    };

    return (
        <Paper withBorder shadow="md" p="md">
            <Button onClick={handleBack} variant="light" leftSection={<IconArrowLeft />} mb="md">
                    Kembali
            </Button>
            <Text component="h2" fw="bold" fz="lg">
                Ekspor Surat
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
                <NativeSelect
                    {...form.getInputProps('departmentId')}
                    label="Bidang"
                    data={(data || []).map((dept) => ({ value: dept.id, label: dept.name }))}
                    disabled={isLoading || (data && data.length === 0)}
                />
                <Space h="md" />
                <Button type="submit" mt="md" loading={loading}>
                    Ekspor
                </Button>
            </form>
        </Paper>
    );
}
