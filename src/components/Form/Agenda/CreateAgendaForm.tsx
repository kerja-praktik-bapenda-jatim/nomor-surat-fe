"use client";
import { useEffect, useState } from 'react';
import { Button, FileInput, TextInput, Text, Space, Box, Paper, Group, CopyButton, Tooltip, ActionIcon, Select, NumberInput, Grid, Checkbox } from '@mantine/core';
import { useForm } from '@mantine/form';
import { DateInput, TimeInput } from '@mantine/dates';
import { useRouter } from "next/navigation";
import { IconArrowLeft } from '@tabler/icons-react';  // Add this import

export function CreateAgendaForm() {		//cancel merge to suratin, add to suratin, + keterangan di surat
  const [user, setUser] = useState({ userName: "Guest", departmentName: "Unknown Department", isAdmin: false });

  useEffect(() => {
    // Simulasi ambil user
  }, []);

  const form = useForm({
    mode: 'uncontrolled',
    validate: {
      startDate: (value) => (value ? null : 'Pilih tanggal awal'),
      startTime: (value) => (value ? null : 'Masukkan jam awal'),
      place: (value) => (value ? null : 'Masukkan tempat'),
      event: (value) => (value ? null : 'Masukkan acara'),
      endDate: (value) => (value ? null : 'Pilih tanggal akhir'),
      endTime: (value) => (value ? null : 'Masukkan jam akhir'),
    },
    initialValues: {
      startDate: null,
      startTime: '',
      place: '',
      event: '',
      endDate: null,
      endTime: '',
    },
  });

  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (values: typeof form.values) => {
    setLoading(true);
    try {
      console.log(values);
      await new Promise(resolve => setTimeout(resolve, 1000));
      router.push('/agenda');
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleBack = () => {
    router.push('/agenda');
  };

  return (
    <Paper withBorder shadow="md" p="xl">

      <Box component="form" onSubmit={form.onSubmit((values) => handleSubmit(values))}>
        <Text component="h2" fw="bold" fz="lg">
          Agenda
        </Text>

				<Button onClick={handleBack} variant="light" leftSection={<IconArrowLeft />} mb="md">
        	Kembali
      	</Button>

        {/* <h1 style={{ fontWeight: 'bold', fontSize: '1.5rem' }}>Agenda</h1> */}


        {/* Tanggal & Jam */}
        <Group grow mb="md">
          <Box>
            <DateInput
              {...form.getInputProps('startDate')}
              label="Tanggal Awal"
              placeholder="Tanggal Awal"
              valueFormat="DD/MM/YYYY"
              withAsterisk
            />
            <TimeInput
              {...form.getInputProps('startTime')}
              label="Jam Awal"
              placeholder="Jam Awal"
              withAsterisk
              mt="sm"
            />
          </Box>
          <Box>
            <DateInput
              {...form.getInputProps('endDate')}
              label="Tanggal Akhir"
              placeholder="Tanggal Akhir"
              valueFormat="DD/MM/YYYY"
              withAsterisk
            />
            <TimeInput
              {...form.getInputProps('endTime')}
              label="Jam Akhir"
              placeholder="Jam Akhir"
              withAsterisk
              mt="sm"
            />
          </Box>
        </Group>

        <TextInput
          {...form.getInputProps('place')}
          label="Tempat"
          placeholder="Tempat"
          withAsterisk
          mb="sm"
        />
        <TextInput
          {...form.getInputProps('event')}
          label="Acara"
          placeholder="Acara"
          withAsterisk
          mb="md"
        />

        <Button
          type="submit"
          loading={loading}
          color="green"
          radius="md"
        >
          Simpan
        </Button>
      </Box>
    </Paper>
  );
}
