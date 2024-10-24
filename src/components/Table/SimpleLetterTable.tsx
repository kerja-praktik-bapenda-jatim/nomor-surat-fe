"use client";

import { Button, Paper} from "@mantine/core";
import { type MRT_ColumnDef, MantineReactTable } from "mantine-react-table";
import { useMemo } from "react";
import { useLetters } from "@/services/letters";
import { Letters } from "@/services/letters/types";
import { convertUTC } from "@/utils/utils";
import { useRouter } from "next/navigation";


export const SimpleTableLetter = () => {
  const { data } = useLetters();
  const router = useRouter();
  //should be memoized or stable
  const columns = useMemo<MRT_ColumnDef<Letters>[]>(
    () => [
      {
        accessorKey: "number",
        header: "Nomor Surat",
      },
      {
        accessorKey: "id",
        header: "ID",
      },
      {
        accessorKey: "date",
        header: "Tanggal",
        accessorFn: (row) => convertUTC(row.date),
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

  return (
    <Paper withBorder radius="md" p="md">
      <Button 
        fullWidth 
        onClick={() => router.push('http://localhost:3000/dashboard/surat/tambah')} // Add onClick event to navigate
      >
        Buat Surat
      </Button>
      <MantineReactTable
        columns={columns}
        data={data ?? []}
        mantinePaperProps={{ shadow: "0", withBorder: false }}
      />
      
    </Paper>
  );
};
