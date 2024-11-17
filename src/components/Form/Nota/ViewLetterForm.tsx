"use client";
import { useEffect} from 'react';
import { TextInput, Text, Space, Box, Paper, Center, Loader, Group, Button } from '@mantine/core';
import { useParams, useRouter } from "next/navigation";
import { convertUTC } from '@/utils/utils';
import { IconArrowLeft, IconEdit, IconTrash } from '@tabler/icons-react';
import { modals } from '@mantine/modals';
import { deleteNota, useDownloadNotaFile, useNotaById } from '@/services/nota';

export function ViewLetterForm() {
    const { id } = useParams();
    const letterId = Array.isArray(id) ? id[0] : id;
    const router = useRouter();
    const { data: letter, isLoading: isLetterLoading, error: letterError } = useNotaById(letterId);
    const { data: fileUrl, isLoading: isFileLoading, error: fileError } = useDownloadNotaFile(letterId);
    
    useEffect(() => {
        return () => {
            if (fileUrl) {
                URL.revokeObjectURL(fileUrl);
            }
        };
    }, [fileUrl]);

    const handleEdit = () => {
        router.push(`/nota/edit/${id}`);
    };

    const handleBack = () => {
        router.push('/nota');
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
                const isDeleted = await deleteNota(letterId);
                if (isDeleted) {
                    router.push('/nota');
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
                    <Button color="blue" onClick={handleEdit} leftSection={<IconEdit />}>
                        Edit
                    </Button>
                    <Button color="red" onClick={openDeleteModal} leftSection={<IconTrash />}>
                        Hapus
                    </Button>
                </Group>
            </Group>
            <Box>
                <Text component="h2" fw="bold" fz="lg">
                    View Nota Dinas
                </Text>
                <TextInput value={letter?.number} label="Nomor Surat" readOnly />
                <Space h="sm" />

                <TextInput value={letter?.date ? convertUTC(letter.date) : ''} label="Tanggal" readOnly />
                <Space h="sm" />
                
                <TextInput value={letter?.to} label="Kepada" readOnly />
                <Space h="sm" />
                
                <TextInput value={letter?.subject} label="Perihal" readOnly />
                <Space h="sm" />
                
                <TextInput value={letter?.filename} label="File" readOnly />
                <Space h="sm" />
                
                {fileUrl ? (
                    <iframe src={fileUrl} width="100%" height="600px" title="Surat File" />
                ) : (
                    <Text>File tidak tersedia untuk ditampilkan.</Text>
                )}
            </Box>
        </Paper>
    );
}
