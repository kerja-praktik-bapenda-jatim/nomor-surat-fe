"use client";

import { useEffect, useState } from 'react';
import {
  Button, TextInput, Text, Box, Paper, Group,
  Checkbox, Grid, Space
} from '@mantine/core';
import { useForm } from '@mantine/form';
import { DateInput, TimeInput } from '@mantine/dates';
import { useRouter } from "next/navigation";
import { IconArrowLeft } from '@tabler/icons-react';
import { modals } from '@mantine/modals';
import { createAgendaSurat } from '@/services/agenda';

export function CreateAgendaForm() {
  const [user, setUser] = useState({ userName: "Guest", departmentName: "Unknown Department", isAdmin: false });

  useEffect(() => {
  }, []);

  const form = useForm({
    initialValues: {
      startDate: new Date(),
      startTime: '',
      endDate: new Date(),
      endTime: '',
      place: '',
      event: '',
      catatan: '',
    },
    validate: {
      startDate: (value) => (value ? null : 'Pilih tanggal awal'),
      startTime: (value) => (value ? null : 'Masukkan jam awal'),
      endDate: (value) => (value ? null : 'Pilih tanggal akhir'),
      endTime: (value) => (value ? null : 'Masukkan jam akhir'),
      place: (value) => (value ? null : 'Masukkan tempat'),
      event: (value) => (value ? null : 'Masukkan acara'),
    },
  });

  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleConfirmSubmit = (values: typeof form.values) => {
    modals.openConfirmModal({
      title: 'Konfirmasi Buat Agenda',
      centered: true,
      children: (
        <Text size="sm">
          Apakah Anda yakin isian sudah benar?
        </Text>
      ),
      confirmProps: { children: 'Entri' },
      cancelProps: { children: 'Batal' },
      onConfirm: () => handleSubmit(values),
    });
  };

  const handleSubmit = async (values: typeof form.values) => {
    setLoading(true);
    try {
      const payload = {
        tglMulai: values.startDate.toISOString(),
        tglSelesai: values.endDate.toISOString(),
        jamMulai: values.startTime,
        jamSelesai: values.endTime,
        tempat: values.place,
        acara: values.event,
        catatan: values.catatan || '',
        letterIn_id: null as any,
      };

      const result = await createAgendaSurat(payload);

      modals.open({
        title: 'Berhasil',
        centered: true,
        children: (
          <>
            <Text size="sm" mb="md">
              Agenda berhasil dibuat
            </Text>
            <Group justify="flex-end" gap="sm">
              <Button
                onClick={() => {
                  form.reset();
                  modals.closeAll();
                  handleBack();
                }}
              >
                Selesai
              </Button>
            </Group>
          </>
        )
      });
    } catch (error: any) {
      console.error(error);
      let errorMessage = 'Terjadi kesalahan. Silakan coba lagi.';

      if (error.response) {
        try {
          const errorData = await error.response.json();
          errorMessage = errorData.message || errorMessage;
        } catch (e) {
          console.error('Failed to parse error response:', e);
        }
      } else if (error.message) {
        errorMessage = error.message;
      }

      modals.open({
        title: 'Error',
        centered: true,
        children: (
          <>
            <Text size="sm">{errorMessage}</Text>
            <Button
              onClick={() => {
                modals.closeAll();
              }}
              mt="md"
            >
              OK
            </Button>
          </>
        )
      });
    } finally {
      setLoading(false);
    }
  };

  const handleBack = () => {
    router.push('/agenda');
  };

  return (
    <>
      <Paper withBorder shadow="md" p="md">
        <Button onClick={handleBack} variant="light" leftSection={<IconArrowLeft />} mb="md">
          Kembali
        </Button>
        <Box component="form" onSubmit={form.onSubmit((values) => handleConfirmSubmit(values))}>
          <Text component="h2" fw="bold" fz="lg">
            Buat Agenda Baru
          </Text>

          <Grid>
            <Grid.Col span={6}>
              <DateInput
                label="Tanggal Awal"
                placeholder="Pilih tanggal"
                valueFormat="DD-MM-YYYY"
                withAsterisk
                clearable
                {...form.getInputProps('startDate')}
              />
            </Grid.Col>

            <Grid.Col span={6}>
              <DateInput
                label="Tanggal Akhir"
                placeholder="Pilih tanggal"
                valueFormat="DD-MM-YYYY"
                withAsterisk
                clearable
                {...form.getInputProps('endDate')}
              />
            </Grid.Col>

            <Grid.Col span={6}>
              <TimeInput
                label="Jam Awal"
                withAsterisk
                {...form.getInputProps('startTime')}
              />
            </Grid.Col>

            <Grid.Col span={6}>
              <TimeInput
                label="Jam Akhir"
                withAsterisk
                {...form.getInputProps('endTime')}
              />
            </Grid.Col>

            <Grid.Col span={6}>
              <TextInput
                label="Tempat"
                placeholder="Tempat"
                withAsterisk
                {...form.getInputProps('place')}
              />
            </Grid.Col>

            <Grid.Col span={6}>
              <TextInput
                label="Acara"
                placeholder="Acara"
                withAsterisk
                {...form.getInputProps('event')}
              />
            </Grid.Col>
          </Grid>

          <TextInput
            {...form.getInputProps('catatan')}
            label="Catatan"
            placeholder="Catatan tambahan (opsional)"
            mt="md"
          />

          <Space h="sm" />

          <Group justify="flex-end" mt="md">
            <Button
              variant="outline"
              onClick={() => {
                form.setValues({
                  startDate: new Date(),
                  startTime: '',
                  endDate: new Date(),
                  endTime: '',
                  place: '',
                  event: '',
                });
              }}
            >
              Reset Form
            </Button>
            <Button type="submit" loading={loading}>
              Submit
            </Button>
          </Group>
        </Box>
      </Paper>
    </>
  );
}
