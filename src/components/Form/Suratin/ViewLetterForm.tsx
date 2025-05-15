"use client";
import { useEffect } from 'react';
import { TextInput, Text, Space, Box, Paper, Center, Loader, Group, Button, Grid } from '@mantine/core';
import { useParams, useRouter } from "next/navigation";
import { convertUTC } from '@/utils/utils';
import { IconArrowLeft, IconEdit, IconTrash } from '@tabler/icons-react';
import { modals } from '@mantine/modals';
import { deleteLetter, useDownloadLetterFile, useLetterById } from '@/services/suratin';

export function ViewLetterForm() {
    const { id } = useParams();
    const letterId = Array.isArray(id) ? id[0] : id;
    const router = useRouter();
    const { data: letter, isLoading: isLetterLoading, error: letterError } = useLetterById(letterId);
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
                const isDeleted = await deleteLetter(letterId);
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
                    View Surat
                </Text>

                <Grid>
                    <Grid.Col span={3}>
                        <TextInput value={letter?.agendaNumber} label="No Agenda" readOnly />
                    </Grid.Col>
                    <Grid.Col span={3}>
                        <TextInput value={letter?.departmentId} label="Kode Bidang" readOnly />
                    </Grid.Col>
                    <Grid.Col span={3}>
                        <TextInput value={letter?.startDate ? convertUTC(letter.startDate) : ''} label="Tanggal Awal" readOnly />
                    </Grid.Col>
                    <Grid.Col span={3}>
                        <TextInput value={letter?.endDate ? convertUTC(letter.endDate) : ''} label="Tanggal Akhir" readOnly />
                    </Grid.Col>

                    <Grid.Col span={6}>
                        <TextInput value={letter?.letterNumber} label="No Surat" readOnly />
                    </Grid.Col>
                    <Grid.Col span={3}>
                        <TextInput value={letter?.startTime} label="Jam Awal" readOnly />
                    </Grid.Col>
                    <Grid.Col span={3}>
                        <TextInput value={letter?.endTime} label="Jam Akhir" readOnly />
                    </Grid.Col>

                    <Grid.Col span={6}>
                        <TextInput
                            value={`${letter?.classificationId || ''} - ${letter?.Classification?.name || ''}`}
                            label="Kode Klasifikasi Surat"
                            readOnly
                        />
                    </Grid.Col>
                    <Grid.Col span={6}>
                        <TextInput value={letter?.place} label="Tempat" readOnly />
                    </Grid.Col>

                    <Grid.Col span={6}>
                        <TextInput value={letter?.from} label="Surat Dari" readOnly />
                    </Grid.Col>
                    <Grid.Col span={6}>
                        <TextInput value={letter?.event} label="Acara" readOnly />
                    </Grid.Col>

                    <Grid.Col span={6}>
                        <TextInput value={letter?.subject} label="Perihal" readOnly />
                    </Grid.Col>
                    <Grid.Col span={6}>
                        <TextInput value={letter?.filename} label="File Digital" readOnly />
                    </Grid.Col>

                    <Grid.Col span={3}>
                        <TextInput value={letter?.letterDate ? convertUTC(letter.letterDate) : ''} label="Tanggal Surat" readOnly />
                    </Grid.Col>
                    <Grid.Col span={3}>
                        <TextInput value={letter?.receivedDate ? convertUTC(letter.receivedDate) : ''} label="Diterima pada" readOnly />
                    </Grid.Col>

                    <Grid.Col span={6}>
                        <TextInput value={letter?.Level?.name} label="Jenis Surat" readOnly />
                    </Grid.Col>

                    <Grid.Col span={3}>
                        <TextInput
                            value={letter?.addToAgenda ? 'Ya' : 'Tidak'}
                            label="Masukkan Agenda"
                            readOnly
                        />
                    </Grid.Col>
                    <Grid.Col span={3}>
                        <TextInput
                            value={letter?.directTo ? 'Ya' : 'Tidak'}
                            label="Langsung Ke"
                            readOnly
                        />
                    </Grid.Col>

                    {letter?.targetDepartment && (
                        <Grid.Col span={6}>
                            <TextInput
                                value={letter.targetDepartment}
                                label="Tujuan Bidang"
                                readOnly
                            />
                        </Grid.Col>
                    )}
                </Grid>

                <Space h="md" />

                {fileUrl ? (
                    <iframe src={fileUrl} width="100%" height="600px" title="Surat File" />
                ) : (
                    <Text>File tidak tersedia untuk ditampilkan.</Text>
                )}
            </Box>
        </Paper>
    );
}
