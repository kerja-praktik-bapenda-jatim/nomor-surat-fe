"use client";
import { useState } from 'react';
import { Button, FileInput, TextInput, Text, Space, Box, Paper, CopyButton, Tooltip, ActionIcon } from '@mantine/core';
import { hasLength, useForm } from '@mantine/form';
import { DateInput } from '@mantine/dates';
import { useRouter } from "next/navigation";
import { convertUTC } from '@/utils/utils';
import { IconArrowLeft, IconCheck, IconCopy } from '@tabler/icons-react';
import { postLetters } from '@/services/letters';
import { modals } from '@mantine/modals';

export function CreateLetterForm() {
    const form = useForm({
        mode: 'uncontrolled',
        validate: {
            date: (value) => (value ? null : 'Kolom tidak boleh kosong'),
            to: hasLength({ min: 3 }, 'Kolom tidak boleh kosong'),
            subject: hasLength({ min: 3 }, 'Kolom tidak boleh kosong'),
            file: (value) => (value ? null : 'Kolom tidak boleh kosong'),
        },
        initialValues: {
            date: new Date(),
            to: '',
            subject: '',
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

            if (values.to) {
                formData.append('to', values.to);
            }
            if (values.subject) {
                formData.append('subject', values.subject);

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
                            <strong>Kepada:</strong> {response.to}<br />
                            <strong>Perihal:</strong> {response.subject}<br />
                            <strong>File:</strong> {response.filename}<br />
                        </Text>
                        <Button onClick={() => { form.reset(); modals.closeAll(); handleBack(); } } mt="md">
                            OK
                        </Button>
                    </>
                )
            })

        } catch (error: any) {
            if (error.response) {
                const apiError = await error.response.json();
                console.error("Error:", apiError);
            } else {
                console.error("Error tidak terdeteksi dari response:", error);
            }
        } finally {
            setLoading(false);
        }
    };

    const handleBack = () => {
        router.push('/dashboard/surat');
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
                clearable
                valueFormat="DD-MMMM-YYYY"
                minDate={new Date()}
                {...form.getInputProps('date')}
                label="Tanggal"
                placeholder="Pilih tanggal"
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
