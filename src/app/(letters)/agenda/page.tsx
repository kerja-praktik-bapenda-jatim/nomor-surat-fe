'use client';
import { PageContainer } from "@/components/PageContainer/PageContainer";
import { Button, Group, Paper, Alert, Text } from "@mantine/core";
import { IconCalendarPlus, IconTrash, IconInfoCircle, IconX } from "@tabler/icons-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { notifications } from '@mantine/notifications';
import { ViewAgenda } from "@/components/Form/Agenda/ViewAgendaForm";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { deleteAgendaSuratById } from "@/services/agenda";

export default function AgendaPage() {
  const router = useRouter();
  const queryClient = useQueryClient();

  const [selectionMode, setSelectionMode] = useState(false);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  const deleteAgendaMutation = useMutation({
    mutationFn: deleteAgendaSuratById,
    onSuccess: () => {
      notifications.show({
        title: 'Berhasil',
        message: 'Agenda berhasil dihapus',
        color: 'green'
      });
      queryClient.invalidateQueries({ queryKey: ["AgendaSurats"] });
    },
    onError: (error: any) => {
      notifications.show({
        title: 'Error',
        message: error.message || 'Gagal menghapus agenda',
        color: 'red'
      });
    }
  });

  const handleDeleteSelected = () => {
    // Validasi: Cek apakah ada agenda yang dipilih
    if (selectedIds.length === 0) {
      notifications.show({
        title: 'Peringatan',
        message: 'Pilih minimal satu agenda untuk dihapus',
        color: 'yellow'
      });
      return;
    }

    // Konfirmasi penghapusan
    if (confirm(`Hapus ${selectedIds.length} agenda yang dipilih?`)) {
      selectedIds.forEach((id) => deleteAgendaMutation.mutate(id));
      setSelectedIds([]);
      setSelectionMode(false);
    }
  };

  return (
    <PageContainer title="Agenda Surat">
      <Paper withBorder radius="md" p="md">
        <Group mb="md">
          {selectionMode ? (
            <>
              <Button
                onClick={handleDeleteSelected}
                color="red"
                loading={deleteAgendaMutation.isPending}
                rightSection={<IconTrash size={16} />}
              >
                Hapus
              </Button>
              <Button
                onClick={() => {
                  setSelectionMode(false);
                  setSelectedIds([]);
                }}
                variant="outline"
								rightSection={<IconX size={16} />}
              >
                Batal
              </Button>
            </>
          ) : (
            <>
              <Button
                onClick={() => router.push('/agenda/add')}
                rightSection={<IconCalendarPlus />}
                color="blue"
              >
                Buat Agenda
              </Button>
              <Button
                onClick={() => {
                  setSelectionMode(true);
                  // Langsung tampilkan notifikasi instruksi
                  notifications.show({
                    title: 'Mode Hapus Agenda',
                    message: 'Pilih agenda yang ingin dihapus dengan mencentang kotak di pojok kanan card',
                    color: 'blue',
                    autoClose: 4000
                  });
                }}
                rightSection={<IconTrash size={16} />}
                color="red"
                variant="outline"
              >
                Hapus Agenda
              </Button>
            </>
          )}
        </Group>

        {/* Card peringatan saat selection mode aktif tapi tidak ada yang dipilih */}
        {selectionMode && selectedIds.length === 0 && (
          <Alert
            icon={<IconInfoCircle size={16} />}
            title="Mode Hapus Agenda"
            color="blue"
            mb="md"
            style={{
              background: "linear-gradient(135deg, #e3f2fd 0%, #f8fafc 100%)",
              border: "1px solid #2196f3",
            }}
          >
            <Text size="sm" c="dimmed">
              Silakan pilih agenda yang ingin dihapus dengan mencentang kotak di pojok kanan atas setiap card agenda
            </Text>
          </Alert>
        )}

        {/* Card konfirmasi saat ada agenda yang dipilih */}
        {selectionMode && selectedIds.length > 0 && (
          <Alert
            icon={<IconTrash size={16} />}
            title={`${selectedIds.length} Agenda Dipilih`}
            color="red"
            mb="md"
            style={{
              background: "linear-gradient(135deg, #ffebee 0%, #f8fafc 100%)",
              border: "1px solid #f44336",
            }}
          >
            <Text size="sm" c="dimmed">
              Klik tombol "Hapus" untuk menghapus agenda yang telah dipilih
            </Text>
          </Alert>
        )}

        <ViewAgenda
          selectionMode={selectionMode}
          selectedIds={selectedIds}
          setSelectedIds={setSelectedIds}
        />
      </Paper>
    </PageContainer>
  );
}
