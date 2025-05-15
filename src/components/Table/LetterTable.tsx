"use client";

import { Badge, Paper, Rating, Space, Title } from "@mantine/core";
import { MantineReactTable, type MRT_ColumnDef } from "mantine-react-table";
import { useMemo } from "react";
import { useCustomTable } from "@/hooks/use-custom-table";
import { useLetters } from "@/services/surat";
import { Letters } from "@/services/surat/types";

export function LetterTable() {
  const { data, isError, isFetching, isLoading } = useLetters();

  const columns = useMemo<MRT_ColumnDef<Letters>[]>(
    () => [
      {
        accessorKey: "id",
        header: "ID",
      },
      {
        accessorKey: "date",
        header: "Tanggal",
      },
      {
        accessorKey: "number",
        header: "Nomor Surat",
        // accessorFn: (row) => `$${(row.price ?? 0).toFixed(2)}`,
      },
      {
        accessorKey: "subject",
        header: "Perihal",
      },
      {
        accessorKey: "to",
        header: "Kepada",
      },
      {
        accessorKey: "filename",
        header: "File",
      },
    ],
    [],
  );

  const table = useCustomTable<Letters>({
    columns,
    data: data ?? [],
    rowCount: data?.length ?? 0,
    state: {
      isLoading,
      showAlertBanner: isError,
      showProgressBars: isFetching,
    },
  });
  return (
    <Paper withBorder radius="md" p="md" mt="lg">
      {/* <Title order={5}>Surat Keluar Saya</Title> */}
      <Space h="md" />
      <MantineReactTable table={table} />
    </Paper>
  );
}
