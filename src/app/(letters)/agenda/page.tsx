'use client'
import { useRouter } from "next/navigation";
import {
  Group,
  Paper,
  Text,
  Box,
  Grid,
  Container,
  Button,
  Title,
  Menu,
  ActionIcon,
  rem
} from "@mantine/core";
import { IconSpeakerphone, IconDots, IconTrash } from "@tabler/icons-react";
import { useState } from "react"; // Tambahkan ini

export default function SuratPage() {
  const router = useRouter();
  const [agendaItems, setAgendaItems] = useState([ // Gunakan state
    {
      id: 1,
      date: "JUMAT, 07/03/25",
      time: "07.30",
      title: "KEGIATAN LEADERSHIP UPDATE FORUM (LI-IF) TAHUN 2025"
    },
    {
      id: 2,
      date: "JUMAT, 07/03/25",
      time: "07.30",
      title: "KEGIATAN LEADERSHIP UPDATE FORUM (LI-IF) TAHUN 2025"
    },
    {
      id: 3,
      date: "JUMAT, 07/03/25",
      time: "07.30",
      title: "KEGIATAN LEADERSHIP UPDATE FORUM (LI-IF) TAHUN 2025"
    },
  ]);

  const handleAgendaClick = (id: number) => {
    console.log(`Clicked agenda item ${id}`);
  };

  const handleDeleteAgenda = (id: number) => {
    // Filter out the item to be deleted
    const updatedAgendaItems = agendaItems.filter(item => item.id !== id);
    setAgendaItems(updatedAgendaItems);

    // Jika Anda menyimpan data ke API, tambahkan kode berikut:
    // deleteAgendaFromAPI(id).then(() => {
    //   setAgendaItems(updatedAgendaItems);
    // }).catch(error => {
    //   console.error('Error deleting agenda:', error);
    // });

    console.log(`Deleted agenda item ${id}`);
  };

  return (
    <>
      <Title order={1} mb="lg">Agenda</Title>

      <Container size="xl" p={0}>
        <Box mb="xl">
          <Group justify="flex-end">
            <Button
              variant="outline"
              color="blue"
              onClick={() => router.push('/agenda/add')}
            >
              Tambah Agenda
            </Button>
            <Button
              variant="outline"
              color="red"
              onClick={() => {
                // Jika Anda ingin menghapus semua agenda
                if (confirm('Apakah Anda yakin ingin menghapus semua agenda?')) {
                  setAgendaItems([]);
                }
              }}
            >
              Hapus Semua Agenda
            </Button>
          </Group>
        </Box>

        {agendaItems.length === 0 ? (
          <Text ta="center" c="dimmed" py="xl">Tidak ada agenda</Text>
        ) : (
          <Grid>
            {agendaItems.map((item) => (
              <Grid.Col
                key={item.id}
                span={{ base: 12, sm: 6, md: 4, lg: 3 }}
              >
                <Paper
                  p="md"
                  withBorder
                  style={{
                    cursor: 'pointer',
                    height: '100%',
                    display: 'flex',
                    flexDirection: 'column',
                    position: 'relative'
                  }}
                  onClick={() => handleAgendaClick(item.id)}
                >
                  <Menu position="bottom-end" withinPortal>
                    <Menu.Target>
                      <ActionIcon
                        variant="subtle"
                        color="gray"
                        onClick={(e) => e.stopPropagation()}
                        style={{
                          position: 'absolute',
                          top: rem(8),
                          right: rem(8),
                          zIndex: 1
                        }}
                      >
                        <IconDots style={{ width: rem(16), height: rem(16) }} />
                      </ActionIcon>
                    </Menu.Target>
                    <Menu.Dropdown>
                      <Menu.Item
                        leftSection={<IconTrash style={{ width: rem(14), height: rem(14) }} />}
                        color="red"
                        onClick={(e) => {
                          e.stopPropagation();
                          if (confirm('Apakah Anda yakin ingin menghapus agenda ini?')) {
                            handleDeleteAgenda(item.id);
                          }
                        }}
                      >
                        Hapus Agenda
                      </Menu.Item>
                    </Menu.Dropdown>
                  </Menu>

                  <Group mb="xs">
                    <IconSpeakerphone size={32} stroke={1.5} />
                    <Box>
                      <Text fw={700}>{item.date}</Text>
                      <Text size="sm">{item.time}</Text>
                    </Box>
                  </Group>

                  <Text
                    fw={500}
                    style={{
                      flexGrow: 1,
                      display: 'flex',
                      alignItems: 'center'
                    }}
                  >
                    {item.title}
                  </Text>
                </Paper>
              </Grid.Col>
            ))}
          </Grid>
        )}
      </Container>
    </>
  );
}	
