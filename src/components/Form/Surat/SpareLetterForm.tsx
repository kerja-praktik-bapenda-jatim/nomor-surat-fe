"use client"
import { useState } from 'react';
import { Button, Paper, TextInput, Text, NativeSelect, Space } from '@mantine/core';
import { useForm } from '@mantine/form';
import { DateInput } from '@mantine/dates';
import { modals } from '@mantine/modals';
import { addSpareLetter, useDepartments } from '@/services/surat';

export function SpareLetterForm() {
    const { data, isLoading } = useDepartments();
    const form = useForm({
        initialValues: {
            date: null,
            spareCounts: '',
            departmentId: '',
        },
        validate: {
            date: (value) => value ? null : 'Tanggal harus dipilih',
            spareCounts: (value) =>
                !Number.isNaN(Number(value)) && Number(value) > 0
                ? null
                : 'Jumlah Harus Lebih dari 0',
            departmentId: (value) => value ? null : 'Bidang harus dipilih',
        },
    });

    const [loading, setLoading] = useState(false);

    const handleSubmit = async (values: typeof form.values) => {
        setLoading(true);
        try {
            const response = await addSpareLetter(values);
            modals.open({
                title: 'Penambahan Spare Surat',
                centered: true,
                children: (
                    <>
                        <Text size="sm">{response.message}</Text>,
                        <Button
                            onClick={() => {
                                modals.closeAll();
                                setTimeout(() => {
                                    window.location.reload();
                                }, 100);
                            }}
                            mt="md"
                        >
                            OK
                        </Button>
                    </>
                ),
            });
        } catch (error:any) {
            modals.open({
                title: 'Error',
                centered: true,
                children: (
                    <>
                        <Text size="sm">{error.message}</Text>
                        <Button
                            onClick={() => {
                                modals.closeAll();
                                setTimeout(() => {
                                    window.location.reload();
                                }, 100);
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

    return (
        <Paper withBorder shadow="md" p="md">
            <Text component="h2" fw="bold" fz="lg">
                Tambah Spare Surat
            </Text>
            <form onSubmit={form.onSubmit(handleSubmit)}>
                <DateInput
                    clearable
                    valueFormat="DD-MMMM-YYYY"
                    minDate={new Date(new Date().setDate(new Date().getDate() - 1))}
                    maxDate={new Date()}
                    {...form.getInputProps('date')}
                    label="Tanggal"
                    placeholder="Pilih tanggal"
                />
                <Space h="md" />
                <NativeSelect
                    {...form.getInputProps('departmentId')}
                    label="Bidang"
                    data={(data || []).map((dept) => ({ value: dept.id, label: dept.name }))}
                    disabled={isLoading || (data && data.length === 0)}
                />
                <Space h="md" />
                <TextInput
                    {...form.getInputProps('spareCounts')}
                    label="Jumlah"
                    placeholder="1-100"
                    disabled={loading}
                />
                <Space h="md" />
                <Button type="submit" mt="md" loading={loading}>
                    Submit
                </Button>
            </form>
        </Paper>
    );
}
