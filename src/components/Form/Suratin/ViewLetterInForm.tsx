"use client";

import { useEffect } from 'react';
import { TextInput, Text, Space, Box, Paper, Center, Loader, Group, Button, Grid } from '@mantine/core';
import { useParams, useRouter } from "next/navigation";
import { convertUTC } from '@/utils/utils';
import { IconArrowLeft, IconEdit, IconTrash } from '@tabler/icons-react';
import { modals } from '@mantine/modals';
import { deleteLetterin, useDownloadLetterFile, useLetterinById } from '@/services/suratin';

export function ViewLetterInForm() {
    const { id } = useParams();
    const letterId = Array.isArray(id) ? id[0] : id;
    const router = useRouter();
    const { data: letter, isLoading: isLetterLoading, error: letterError } = useLetterinById(letterId);
    const { data: fileUrl, isLoading: isFileLoading, error: fileError } = useDownloadLetterFile(letterId);

    useEffect(() => {
        return () => {
            if (fileUrl) {
                URL.revokeObjectURL(fileUrl);
            }
        };
    }, [fileUrl]);

    const handleEdit = () => {
        router.push(`/suratin/edit/${id}`);
    };

    const handleBack = () => {
        router.push('/suratin');
    };

    const openDeleteModal = () => {
        modals.openConfirmModal({
            title: 'Hapus Surat',
            centered: true,
            children: (
                <Text size="sm">
                    Apakah Anda yakin ingin menghapus surat ini? Tindakan ini tidak dapat dibatalkan.
                </Text>
            ),
            labels: { confirm: 'Hapus', cancel: 'Batal' },
            confirmProps: { color: 'red' },
            onCancel: () => console.log('Penghapusan dibatalkan'),
            onConfirm: async () => {
                const isDeleted = await deleteLetterin(letterId);
                if (isDeleted) {
                    router.push('/suratin');
                } else {
                    console.error('Gagal menghapus surat');
                }
            },
        });
    };

    if (isLetterLoading) {
        return (
            <Center>
                <Loader size="lg" />
            </Center>
        );
    }
    if (letterError) {
        return <Text>Error: {letterError.message}</Text>;
    }

    return (
        <Paper withBorder shadow="md" p="md">
            <Group justify="apart" mb="md">
                <Button onClick={handleBack} variant="light" leftSection={<IconArrowLeft />}>
                    Kembali
                </Button>
                <Group>
                    <Button color="yellow" onClick={handleEdit} leftSection={<IconEdit />}>
                        Edit
                    </Button>
                    <Button color="red" onClick={openDeleteModal} leftSection={<IconTrash />}>
                        Hapus
                    </Button>
                </Group>
            </Group>
            <Box>
                <Text component="h2" fw="bold" fz="lg">
                    View Surat Masuk
                </Text>

                <Grid>
                    <Grid.Col span={3}>
                        <TextInput value={letter?.noAgenda?.toString() || ''} label="No Agenda" readOnly />
                    </Grid.Col>
                    <Grid.Col span={3}>
                        <TextInput
                            value={letter?.Classification?.name || 'Tidak ada'}
                            label="Klasifikasi"
                            readOnly
                        />
                    </Grid.Col>
                    <Grid.Col span={3}>
                        <TextInput
                            value={letter?.tglSurat ? convertUTC(letter.tglSurat) : ''}
                            label="Tanggal Surat"
                            readOnly
                        />
                    </Grid.Col>
                    <Grid.Col span={3}>
                        <TextInput
                            value={letter?.diterimaTgl ? convertUTC(letter.diterimaTgl) : ''}
                            label="Tanggal Diterima"
                            readOnly
                        />
                    </Grid.Col>

                    <Grid.Col span={6}>
                        <TextInput value={letter?.noSurat || ''} label="No Surat" readOnly />
                    </Grid.Col>
                    <Grid.Col span={6}>
                        <TextInput
                            value={letter?.LetterType?.name || 'Tidak ada'}
                            label="Jenis Surat"
                            readOnly
                        />
                    </Grid.Col>

                    <Grid.Col span={6}>
                        <TextInput value={letter?.suratDari || ''} label="Surat Dari" readOnly />
                    </Grid.Col>
                    <Grid.Col span={6}>
                        <TextInput value={letter?.perihal || ''} label="Perihal" readOnly />
                    </Grid.Col>

                    <Grid.Col span={6}>
                        <TextInput value={letter?.ditujukanKe || ''} label="Ditujukan Ke" readOnly />
                    </Grid.Col>
                    <Grid.Col span={6}>
                        <TextInput
                            value={letter?.filename || 'Tidak ada file'}
                            label="File Digital"
                            readOnly
                        />
                    </Grid.Col>

                    <Grid.Col span={3}>
                        <TextInput
                            value={letter?.langsungKe ? 'Ya' : 'Tidak'}
                            label="Langsung Ke"
                            readOnly
                        />
                    </Grid.Col>
                    <Grid.Col span={3}>
                        <TextInput
                            value={letter?.agenda ? 'Ya' : 'Tidak'}
                            label="Masukkan Agenda"
                            readOnly
                        />
                    </Grid.Col>

                    {letter?.agenda && letter?.Agenda && (
                        <>
                            <Grid.Col span={12}>
                                <Text fw="bold" size="md" mt="md" mb="sm">Informasi Agenda</Text>
                            </Grid.Col>
                            <Grid.Col span={3}>
                                <TextInput
                                    value={letter.Agenda.tglMulai ? convertUTC(letter.Agenda.tglMulai) : ''}
                                    label="Tanggal Mulai"
                                    readOnly
                                />
                            </Grid.Col>
                            <Grid.Col span={3}>
                                <TextInput
                                    value={letter.Agenda.tglSelesai ? convertUTC(letter.Agenda.tglSelesai) : ''}
                                    label="Tanggal Selesai"
                                    readOnly
                                />
                            </Grid.Col>
                            <Grid.Col span={3}>
                                <TextInput
                                    value={letter.Agenda.jamMulai || ''}
                                    label="Jam Mulai"
                                    readOnly
                                />
                            </Grid.Col>
                            <Grid.Col span={3}>
                                <TextInput
                                    value={letter.Agenda.jamSelesai || ''}
                                    label="Jam Selesai"
                                    readOnly
                                />
                            </Grid.Col>
                            <Grid.Col span={6}>
                                <TextInput
                                    value={letter.Agenda.tempat || ''}
                                    label="Tempat"
                                    readOnly
                                />
                            </Grid.Col>
                            <Grid.Col span={6}>
                                <TextInput
                                    value={letter.Agenda.acara || ''}
                                    label="Acara"
                                    readOnly
                                />
                            </Grid.Col>
                            <Grid.Col span={12}>
                                <TextInput
                                    value={letter.Agenda.catatan || ''}
                                    label="Catatan"
                                    readOnly
                                />
                            </Grid.Col>
                        </>
                    )}
                </Grid>

                <Space h="md" />

                {fileUrl ? (
                    <iframe src={fileUrl} width="100%" height="600px" title="Surat File" />
                ) : (
                    <Text>Tidak ada file yang tersedia.</Text>
                )}
            </Box>
        </Paper>
    );
}
