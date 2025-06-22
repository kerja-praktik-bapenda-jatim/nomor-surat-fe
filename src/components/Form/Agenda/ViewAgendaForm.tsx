"use client";

import {
  Grid,
  Paper,
  Group,
  Stack,
  Text,
  Checkbox,
  Box,
  Loader,
  Alert,
  Button,
  Modal,
} from "@mantine/core";
import {
  IconMapPin,
  IconCalendar,
  IconClock,
  IconAlertCircle,
  IconSpeakerphone,
} from "@tabler/icons-react";
import { useRouter } from "next/navigation";
import { useState, useMemo } from "react";
import { useAgendaSurats } from "@/services/agenda";
import type { AgendaSurat } from "@/services/agenda/types";

export function ViewAgenda({
  selectionMode,
  selectedIds,
  setSelectedIds,
}: {
  selectionMode: boolean;
  selectedIds: string[];
  setSelectedIds: (ids: string[]) => void;
}) {
  const router = useRouter();
  const { data: agendaItems = [], isLoading, error } = useAgendaSurats();
  const [selectedAgenda, setSelectedAgenda] = useState<AgendaSurat | null>(null);
  const [modalOpened, setModalOpened] = useState(false);

  const upcomingAgendaItems = useMemo(() => {
    const now = new Date();
    const currentDate = now.toISOString().split('T')[0];
    const currentTime = now.toTimeString().split(' ')[0];

    const upcomingItems = agendaItems.filter((item) => {
      const itemDate = item.tglMulai ? item.tglMulai.split('T')[0] : '0000-00-00';
      const itemTime = item.jamMulai || '00:00:00';

      if (itemDate > currentDate) {
        return true;
      }

      if (itemDate === currentDate) {
        const formatTime = (timeStr: string) => {
          const parts = timeStr.split(':');
          const hours = parts[0]?.padStart(2, '0') || '00';
          const minutes = parts[1]?.padStart(2, '0') || '00';
          const seconds = parts[2]?.padStart(2, '0') || '00';
          return `${hours}:${minutes}:${seconds}`;
        };

        return formatTime(itemTime) > formatTime(currentTime);
      }

      return false;
    });

    return upcomingItems.sort((a, b) => {
      const dateA = a.tglMulai ? a.tglMulai.split('T')[0] : '0000-00-00';
      const dateB = b.tglMulai ? b.tglMulai.split('T')[0] : '0000-00-00';

      if (dateA !== dateB) {
        return dateA.localeCompare(dateB);
      }

      const timeA = a.jamMulai || '00:00:00';
      const timeB = b.jamMulai || '00:00:00';

      const formatTime = (timeStr: string) => {
        const parts = timeStr.split(':');
        const hours = parts[0]?.padStart(2, '0') || '00';
        const minutes = parts[1]?.padStart(2, '0') || '00';
        const seconds = parts[2]?.padStart(2, '0') || '00';
        return `${hours}:${minutes}:${seconds}`;
      };

      return formatTime(timeA).localeCompare(formatTime(timeB));
    });
  }, [agendaItems]);

  const handleDetailClick = (item: AgendaSurat, e: React.MouseEvent) => {
    e.stopPropagation();
    setSelectedAgenda(item);
    setModalOpened(true);
  };

  const formatDate = (dateString: string) => {
    try {
      if (!dateString) return "Tanggal tidak valid";

      const dateParts = dateString.split('T')[0].split('-');
      const year = parseInt(dateParts[0]);
      const month = parseInt(dateParts[1]) - 1;
      const day = parseInt(dateParts[2]);

      const localDate = new Date(year, month, day);

      return localDate.toLocaleDateString("id-ID", {
        weekday: "long",
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
      }).toUpperCase();
    } catch (error) {
      console.error('Date parsing error:', error);
      return "Tanggal tidak valid";
    }
  };

  const formatTime = (timeString: string) => {
    if (!timeString) return "00:00";

    try {
      const timeParts = timeString.split(":");
      const hours = timeParts[0].padStart(2, '0');
      const minutes = timeParts[1] ? timeParts[1].padStart(2, '0') : '00';

      return `${hours}:${minutes}`;
    } catch (error) {
      console.error('Time parsing error:', error);
      return "00:00";
    }
  };

  const formatDateShort = (dateString: string) => {
    try {
      if (!dateString) return "";

      const dateParts = dateString.split('T')[0].split('-');
      const year = parseInt(dateParts[0]);
      const month = parseInt(dateParts[1]) - 1;
      const day = parseInt(dateParts[2]);

      const localDate = new Date(year, month, day);

      return localDate.toLocaleDateString("id-ID", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
      });
    } catch (error) {
      console.error('Date parsing error:', error);
      return "";
    }
  };

  const formatDateRange = (start: string, end: string) =>
    start === end ? formatDate(start) : `${formatDate(start)} - ${formatDate(end)}`;

  const formatTimeRange = (start: string, end: string) =>
    start === end || !end ? formatTime(start) : `${formatTime(start)} - ${formatTime(end)}`;

  if (isLoading) {
    return (
      <Box ta="center" py="xl">
        <Loader size="md" />
        <Text mt="md" c="dimmed">Memuat agenda...</Text>
      </Box>
    );
  }

  if (error) {
    return (
      <Alert icon={<IconAlertCircle size={16} />} title="Error!" color="red" mb="md">
        Gagal memuat data agenda. Silakan coba lagi.
      </Alert>
    );
  }

  if (agendaItems.length === 0) {
    return (
      <Box ta="center" py="xl">
        <Text c="dimmed" size="lg">Tidak ada agenda yang tersedia</Text>
        <Text c="dimmed" size="sm" mt="xs">Klik "Buat Agenda" untuk membuat agenda baru</Text>
      </Box>
    );
  }

  if (upcomingAgendaItems.length === 0) {
    return (
      <Box ta="center" py="xl">
        <Text c="dimmed" size="lg">Tidak ada agenda yang akan datang</Text>
        <Text c="dimmed" size="sm" mt="xs">Semua agenda sudah berlalu atau klik "Buat Agenda" untuk membuat agenda baru</Text>
      </Box>
    );
  }

  return (
    <>
      <Grid>
        {upcomingAgendaItems.map((item: AgendaSurat) => {
          const isChecked = selectedIds.includes(item.id);

          return (
            <Grid.Col key={item.id} span={{ base: 12, sm: 6, md: 3 }}>
              <Paper
                withBorder
                p="md"
                radius="lg"
                h={270}
                style={{
                  position: "relative",
                  cursor: "default",
                  transition: "all 0.3s ease",
                  display: "flex",
                  flexDirection: "column",
                  background: "linear-gradient(135deg, #fff 0%, #f8fafc 100%)",
                  borderColor: "#e2e8f0",
                  boxShadow: "0 1px 3px rgba(0, 0, 0, 0.1)",
                  overflow: "hidden",
                }}
                className="hover:shadow-lg hover:scale-[1.02]"
              >
                {selectionMode && (
                  <Checkbox
                    checked={isChecked}
                    onChange={(e) => {
                      e.stopPropagation();
                      setSelectedIds(
                        e.currentTarget.checked
                          ? [...selectedIds, item.id]
                          : selectedIds.filter((id) => id !== item.id)
                      );
                    }}
                    style={{
                      position: "absolute",
                      top: 12,
                      right: 12,
                      zIndex: 1,
                    }}
                    size="md"
                  />
                )}

                <Stack gap="sm" style={{ flex: 1, height: "100%" }}>
                  <Group justify="space-between" align="flex-start">
                    <Box
                      style={{
                        background: "linear-gradient(135deg, #ff9500 0%, #ff6b35 100%)",
                        borderRadius: "12px",
                        padding: "8px",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        minWidth: "36px",
                        minHeight: "36px",
                      }}
                    >
                      <IconSpeakerphone size={20} color="white" />
                    </Box>
                  </Group>

                  <Box>
                    <Text fw={700} size="sm" c="#1e293b" style={{
                      whiteSpace: "nowrap",
                      overflow: "hidden",
                      textOverflow: "ellipsis"
                    }}>
                      {formatDate(item.tglMulai)}
                    </Text>
                  </Box>

                  <Group gap={6}>
                    <IconClock size={14} color="#64748b" />
                    <Text size="sm" c="#64748b" fw={500}>
                      {formatTime(item.jamMulai)}
                    </Text>
                  </Group>

                  <Group gap={6}>
                    <IconMapPin size={16} stroke={1.5} color="#000000" />
                    <Text size="sm" c="#000000" fw={500}>
                      {item.tempat}
                    </Text>
                  </Group>

                  <Box style={{ flex: 1, minHeight: "40px" }}>
                    <Text
                      fw={700}
                      size="md"
                      lineClamp={2}
                      c="#0f172a"
                      style={{
                        lineHeight: 1.3,
                        wordBreak: "break-word",
                        hyphens: "auto",
                        overflow: "hidden",
                        textOverflow: "ellipsis"
                      }}
                    >
                      {item.acara || "Agenda tanpa judul"}
                    </Text>
                  </Box>

                  <Button
                    variant="light"
                    color="blue"
                    size="sm"
                    onClick={(e) => handleDetailClick(item, e)}
                    style={{
                      marginTop: "auto",
                      fontWeight: 600,
                    }}
                  >
                    Detail Kegiatan
                  </Button>
                </Stack>
              </Paper>
            </Grid.Col>
          );
        })}
      </Grid>

      <Modal
        opened={modalOpened}
        onClose={() => setModalOpened(false)}
        title={
          <Group>
            <IconSpeakerphone size={20} color="#ff6b35" />
          </Group>
        }
        size="md"
        radius="lg"
        centered
      >
        {selectedAgenda && (
          <Stack gap="md">
            <Box>
              <Text size="sm" c="dimmed" fw={500} mb={4}>
                Kegiatan
              </Text>
              <Text fw={600} size="md" c="#0f172a">
                {selectedAgenda.acara || "Agenda tanpa judul"}
              </Text>
            </Box>

            <Group grow>
              <Box>
                <Text size="sm" c="dimmed" fw={500} mb={4}>
                  Tanggal Mulai
                </Text>
                <Group gap={8}>
                  <IconCalendar size={16} color="#64748b" />
                  <Text size="sm" fw={500}>
                    {formatDate(selectedAgenda.tglMulai)}
                  </Text>
                </Group>
              </Box>

              {selectedAgenda.tglSelesai && (
                <Box>
                  <Text size="sm" c="dimmed" fw={500} mb={4}>
                    Tanggal Selesai
                  </Text>
                  <Group gap={8}>
                    <IconCalendar size={16} color="#64748b" />
                    <Text size="sm" fw={500}>
                      {formatDate(selectedAgenda.tglSelesai)}
                    </Text>
                  </Group>
                </Box>
              )}
            </Group>

            <Group grow>
              <Box>
                <Text size="sm" c="dimmed" fw={500} mb={4}>
                  Jam Mulai
                </Text>
                <Group gap={8}>
                  <IconClock size={16} color="#64748b" />
                  <Text size="sm" fw={500}>
                    {formatTime(selectedAgenda.jamMulai)}
                  </Text>
                </Group>
              </Box>

              {selectedAgenda.jamSelesai && (
                <Box>
                  <Text size="sm" c="dimmed" fw={500} mb={4}>
                    Jam Selesai
                  </Text>
                  <Group gap={8}>
                    <IconClock size={16} color="#64748b" />
                    <Text size="sm" fw={500}>
                      {formatTime(selectedAgenda.jamSelesai)}
                    </Text>
                  </Group>
                </Box>
              )}
            </Group>

            {selectedAgenda.tempat && (
              <Box>
                <Text size="sm" c="dimmed" fw={500} mb={4}>
                  Tempat
                </Text>
                <Group gap={8} align="flex-start">
                  <IconMapPin size={16} color="#64748b" style={{ marginTop: 2 }} />
                  <Text size="sm" fw={500} style={{ flex: 1 }}>
                    {selectedAgenda.tempat}
                  </Text>
                </Group>
              </Box>
            )}

            {selectedAgenda.catatan && (
              <Box>
                <Text size="sm" c="dimmed" fw={500} mb={4}>
                  Catatan
                </Text>
                <Text size="sm" c="#475569" style={{ lineHeight: 1.5 }}>
                  {selectedAgenda.catatan}
                </Text>
              </Box>
            )}

            <Group justify="flex-end" mt="md">
              <Button
                variant="light"
                color="gray"
                onClick={() => setModalOpened(false)}
              >
                Tutup
              </Button>
            </Group>
          </Stack>
        )}
      </Modal>
    </>
  );
}
