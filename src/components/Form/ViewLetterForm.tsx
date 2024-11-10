"use client";
import { useEffect, useState } from 'react';
import { TextInput, Text, Space, Box, Paper, Center, Loader, Group, Button, ActionIcon} from '@mantine/core';
import ky from 'ky';
import { useParams, useRouter } from "next/navigation";
import { convertUTC, getAuthToken } from '@/utils/utils';
import { IconArrowLeft, IconEdit, IconTrash } from '@tabler/icons-react';
import { modals } from '@mantine/modals';

export function ViewLetterForm() {
    const { id } = useParams();
    const router = useRouter();
    const [letter, setLetter] = useState<{ number: string; date: string; to: string; subject: string; filename: string } | null>(null);
    const [fileUrl, setFileUrl] = useState<string | null>(null);
    const [loading, setLoading] = useState(true);
    const token = getAuthToken();

    useEffect(() => {
        const fetchLetterData = async () => {
            if (!id) return;
            try {
                const response = await ky.get(`http://localhost:5000/api/letter/${id}`, {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                }).json();
                // const data = await response;
                setLetter(response);
            } catch (error) {
                console.error("Gagal mengambil data surat:", error);
            } finally {
                setLoading(false);
            }
        };

        const fetchFile = async () => {
            try {
                const response = await ky.get(`http://localhost:5000/api/letter/download/${id}`, {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                });
                if (response.ok) {
                    const blob = await response.blob();
                    const url = URL.createObjectURL(blob);
                    setFileUrl(url);
                } else {
                    console.error("Gagal mengambil file:", response.statusText);
                }
            } catch (error) {
                console.error("Error fetching file:", error);
            }
        };

        fetchLetterData();
        fetchFile();

        return () => {
            // Hapus URL dari blob saat komponen di-unmount untuk menghindari memory leaks
            if (fileUrl) {
                URL.revokeObjectURL(fileUrl);
            }
        };
    }, [id]);

    const handleEdit = () => {
        router.push(`/dashboard/surat/edit/${id}`); // Navigasi ke halaman edit
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
            onConfirm: handleDelete,
        });
    };

    const handleDelete = async () => {
        try {
            await ky.delete(`http://localhost:5000/api/letter/${id}`, {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });
            // Jika penghapusan berhasil, arahkan kembali ke halaman daftar surat
            router.push('/dashboard/surat');
        } catch (error) {
            console.error('Gagal menghapus surat:', error);
        }
    };

    const handleBack = () => {
        router.push('/dashboard/surat');
    };

    if (loading) {
        return (
            <Center>
                <Loader size="lg" />
            </Center>
        );
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
                    View Surat
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
