import { type MRT_ColumnDef, MantineReactTable } from "mantine-react-table";
import { useMemo } from "react";
import { useLetters } from "@/services/surat";
import { Letters } from "@/services/surat/types";
import { convertUTC } from "@/utils/utils";
import { useRouter } from "next/navigation";
import { ActionIcon } from "@mantine/core";
import { IconEye } from "@tabler/icons-react";


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
        accessorKey: "classificationId",
        header: "Kode Klasifikasi Arsip",
      },
      {
        accessorKey: "departmentId",
        header: "Kode Bidang",
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
        accessorKey: "Level.name",
        header: "Sifat Surat",
      },
      {
        accessorKey: "filename",
        header: "File",
      },
      {
        accessorKey: "actions",
        header: "Aksi",
        Cell: ({ row }) => (
          <ActionIcon
            onClick={() => router.push(`/surat/view/${row.original.id}`)}
          >
            <IconEye size={14} />
          </ActionIcon>
        ),
      },
    ],
    [],
  );

  return (
    <MantineReactTable
      columns={columns}
      data={data ?? []}
      mantinePaperProps={{ shadow: "0", withBorder: false }}
    />
  );
};
