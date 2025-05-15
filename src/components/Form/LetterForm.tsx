"use client";
import 'dayjs/locale/id';
import { zodResolver } from "@hookform/resolvers/zod";
import { Box, Button, Paper, Space, Text, TextInput, FileInput } from "@mantine/core";
import { DatesProvider, DatePickerInput, DateInput } from "@mantine/dates";
import { modals } from "@mantine/modals";
import { useForm } from "react-hook-form";
import { z } from "zod";

// Ubah schema sesuai dengan field baru
const schema = z.object({
  date: z.date({ required_error: "Tanggal harus diisi" }),
  to: z.string().min(1, { message: "Kepada harus diisi" }),
  subject: z.string().min(1, { message: "Perihal harus diisi" }),
  file: z.instanceof(File).nullable().optional(),
});

type Letter = z.infer<typeof schema>;

export const LetterForm = () => {
  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<Letter>({
    resolver: zodResolver(schema),
  });

  const onSubmit = (data: Letter) =>
    modals.openConfirmModal({
      title: "Surat berhasil dibuat",
      children: (
        <Text size="sm">
          <strong>Kepada:</strong> {data.to} <br />
          <strong>Perihal:</strong> {data.subject} <br />
          <strong>Tanggal:</strong> {data.date.toLocaleDateString()} <br />
          <strong>File:</strong> {data.file ? data.file.name : "Tidak ada file"}
        </Text>
      ),
      labels: { confirm: "Confirm", cancel: "Cancel" },
      onConfirm: () => console.log("Surat Dikonfirmasi"),
    });

  return (
    <Paper withBorder shadow="md" p="md" w="400px">
      <Box component="form">
        <Text component="h2" fw="bold" fz="lg">
          Buat Surat
        </Text>

        {/* Input untuk tanggal */}
        <DateInput
          label="Tanggal"
          placeholder="Pilih tanggal"
          error={errors.date?.message}
          onChange={(value) => setValue("date", value!)} // setValue untuk menyimpan data tanggal
        />

        <Space h="sm" />

        {/* Input untuk penerima */}
        <TextInput
          label="Kepada"
          error={errors.to?.message}
          {...register("to")}
        />
        <Space h="sm" />

        {/* Input untuk perihal */}
        <TextInput
          label="Perihal"
          error={errors.subject?.message}
          {...register("subject")}
        />
        <Space h="sm" />

        {/* Input untuk file */}
        <FileInput
          label="Upload File"
          error={errors.file?.message}
          placeholder="Pilih file"
          onChange={(file) => setValue("file", file)} // Simpan file ke form
        />
        <Space h="md" />

        <Button onClick={handleSubmit(onSubmit)}>Buat Surat</Button>
      </Box>
    </Paper>
  );
};
