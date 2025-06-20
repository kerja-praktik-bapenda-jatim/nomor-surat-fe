import React, { useState } from 'react';
import {
  Modal,
  Button,
  TextInput,
  Group,
  Stack,
  Text,
  ActionIcon,
  Table,
  Alert,
  Loader,
  Box,
  Divider
} from '@mantine/core';
import { useForm } from '@mantine/form';
import { IconPlus, IconEdit, IconTrash, IconCheck, IconX } from '@tabler/icons-react';
import { modals } from '@mantine/modals';
import { useLetterTypes, createLetterType, updateLetterType, deleteLetterType } from '@/services/lettertype';

interface LetterTypeManagerProps {
  opened: boolean;
  onClose: () => void;
  onLetterTypeAdded?: () => void; // Callback untuk refresh data
}

interface LetterType {
  id: string;
  name: string;
  createdAt: string;
  updatedAt: string;
}

export function LetterTypeManager({ opened, onClose, onLetterTypeAdded }: LetterTypeManagerProps) {
  const { data: letterTypes, isLoading, refetch } = useLetterTypes();
  const [creating, setCreating] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [loadingAction, setLoadingAction] = useState<string | null>(null);

  // Form untuk create
  const createForm = useForm({
    initialValues: {
      name: ''
    },
    validate: {
      name: (value) => value.trim().length < 3 ? 'Nama minimal 3 karakter' : null
    }
  });

  // Form untuk edit
  const editForm = useForm({
    initialValues: {
      name: ''
    },
    validate: {
      name: (value) => value.trim().length < 3 ? 'Nama minimal 3 karakter' : null
    }
  });

  const handleCreate = async (values: { name: string }) => {
    setLoadingAction('create');
    try {
      await createLetterType(values.name);
      createForm.reset();
      setCreating(false);
      await refetch();
      onLetterTypeAdded?.();
      modals.open({
        title: 'Berhasil',
        centered: true,
        children: <Text size="sm">Jenis surat berhasil ditambahkan</Text>
      });
    } catch (error: any) {
      modals.open({
        title: 'Error',
        centered: true,
        children: <Text size="sm">{error.message || 'Gagal menambahkan jenis surat'}</Text>
      });
    } finally {
      setLoadingAction(null);
    }
  };

  const handleUpdate = async (id: string, newName: string, oldName: string) => {
    setLoadingAction(`update-${id}`);
    try {
      await updateLetterType(id, oldName, newName);
      setEditingId(null);
      editForm.reset();
      await refetch();
      onLetterTypeAdded?.();
      modals.open({
        title: 'Berhasil',
        centered: true,
        children: <Text size="sm">Jenis surat berhasil diperbarui</Text>
      });
    } catch (error: any) {
      modals.open({
        title: 'Error',
        centered: true,
        children: <Text size="sm">{error.message || 'Gagal memperbarui jenis surat'}</Text>
      });
    } finally {
      setLoadingAction(null);
    }
  };

  const handleDelete = (id: string, name: string) => {
    modals.openConfirmModal({
      title: 'Konfirmasi Hapus',
      centered: true,
      children: (
        <Text size="sm">
          Apakah Anda yakin ingin menghapus jenis surat "{name}"?
          <br />
          <Text color="red" size="xs" mt="xs">
            Tindakan ini tidak dapat dibatalkan.
          </Text>
        </Text>
      ),
      confirmProps: { children: 'Hapus', color: 'red' },
      cancelProps: { children: 'Batal' },
      onConfirm: async () => {
        setLoadingAction(`delete-${id}`);
        try {
          await deleteLetterType(id);
          await refetch();
          onLetterTypeAdded?.();
          modals.open({
            title: 'Berhasil',
            centered: true,
            children: <Text size="sm">Jenis surat berhasil dihapus</Text>
          });
        } catch (error: any) {
          modals.open({
            title: 'Error',
            centered: true,
            children: <Text size="sm">{error.message || 'Gagal menghapus jenis surat'}</Text>
          });
        } finally {
          setLoadingAction(null);
        }
      }
    });
  };

  const startEdit = (letterType: LetterType) => {
    setEditingId(letterType.id);
    editForm.setValues({ name: letterType.name });
  };

  const cancelEdit = () => {
    setEditingId(null);
    editForm.reset();
  };

  const startCreate = () => {
    setCreating(true);
    createForm.reset();
  };

  const cancelCreate = () => {
    setCreating(false);
    createForm.reset();
  };

  return (
    <Modal
      opened={opened}
      onClose={onClose}
      title="Kelola Jenis Surat"
      size="lg"
      centered
    >
      <Stack gap="md">
        {/* Add New Button */}
        <Group justify="space-between">
          <Text size="sm" c="dimmed">
            Total: {letterTypes?.length || 0} jenis surat
          </Text>
          <Button
            leftSection={<IconPlus size={16} />}
            onClick={startCreate}
            disabled={creating || isLoading}
            size="sm"
          >
            Tambah Jenis Surat
          </Button>
        </Group>

        {/* Create Form */}
        {creating && (
          <Box p="md" style={{ border: '1px solid #e9ecef', borderRadius: 8 }}>
            <Text fw={500} mb="sm">Tambah Jenis Surat Baru</Text>
            <form onSubmit={createForm.onSubmit(handleCreate)}>
              <Group gap="sm">
                <TextInput
                  {...createForm.getInputProps('name')}
                  placeholder="Masukkan nama jenis surat"
                  style={{ flex: 1 }}
                  data-autofocus
                />
                <Button
                  type="submit"
                  loading={loadingAction === 'create'}
                  leftSection={<IconCheck size={16} />}
                  size="sm"
                >
                  Simpan
                </Button>
                <ActionIcon
                  variant="subtle"
                  color="gray"
                  onClick={cancelCreate}
                  disabled={loadingAction === 'create'}
                >
                  <IconX size={16} />
                </ActionIcon>
              </Group>
            </form>
          </Box>
        )}

        <Divider />

        {/* Letter Types List */}
        {isLoading ? (
          <Group justify="center" py="xl">
            <Loader size="sm" />
            <Text size="sm" c="dimmed">Memuat data...</Text>
          </Group>
        ) : letterTypes && letterTypes.length > 0 ? (
          <Box style={{ maxHeight: 400, overflowY: 'auto' }}>
            <Table striped highlightOnHover>
              <Table.Thead>
                <Table.Tr>
                  <Table.Th>No</Table.Th>
                  <Table.Th>Nama Jenis Surat</Table.Th>
                  <Table.Th h={120}>Aksi</Table.Th>
                </Table.Tr>
              </Table.Thead>
              <Table.Tbody>
                {letterTypes.map((letterType: LetterType, index: number) => (
                  <Table.Tr key={letterType.id}>
                    <Table.Td>{index + 1}</Table.Td>
                    <Table.Td>
                      {editingId === letterType.id ? (
                        <form
                          onSubmit={editForm.onSubmit((values) =>
                            handleUpdate(letterType.id, values.name, letterType.name)
                          )}
                        >
                          <Group gap="xs">
                            <TextInput
                              {...editForm.getInputProps('name')}
                              size="xs"
                              style={{ flex: 1 }}
                              data-autofocus
                            />
                            <ActionIcon
                              type="submit"
                              variant="filled"
                              color="blue"
                              size="sm"
                              loading={loadingAction === `update-${letterType.id}`}
                            >
                              <IconCheck size={14} />
                            </ActionIcon>
                            <ActionIcon
                              variant="subtle"
                              color="gray"
                              size="sm"
                              onClick={cancelEdit}
                              disabled={loadingAction === `update-${letterType.id}`}
                            >
                              <IconX size={14} />
                            </ActionIcon>
                          </Group>
                        </form>
                      ) : (
                        letterType.name
                      )}
                    </Table.Td>
                    <Table.Td>
                      {editingId !== letterType.id && (
                        <Group gap="xs">
                          <ActionIcon
                            variant="subtle"
                            color="blue"
                            size="sm"
                            onClick={() => startEdit(letterType)}
                            disabled={editingId !== null || creating}
                          >
                            <IconEdit size={14} />
                          </ActionIcon>
                          <ActionIcon
                            variant="subtle"
                            color="red"
                            size="sm"
                            onClick={() => handleDelete(letterType.id, letterType.name)}
                            disabled={editingId !== null || creating}
                            loading={loadingAction === `delete-${letterType.id}`}
                          >
                            <IconTrash size={14} />
                          </ActionIcon>
                        </Group>
                      )}
                    </Table.Td>
                  </Table.Tr>
                ))}
              </Table.Tbody>
            </Table>
          </Box>
        ) : (
          <Alert color="gray" variant="light">
            <Text size="sm">Belum ada jenis surat. Silakan tambah yang pertama.</Text>
          </Alert>
        )}

        {/* Footer */}
        <Group justify="flex-end" mt="md">
          <Button variant="outline" onClick={onClose}>
            Tutup
          </Button>
        </Group>
      </Stack>
    </Modal>
  );
}
