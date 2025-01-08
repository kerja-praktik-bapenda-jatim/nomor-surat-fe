import { type MRT_ColumnDef, MantineReactTable } from "mantine-react-table";
import { useMemo } from "react";
import { useNota } from "@/services/nota";
import { Nota } from "@/services/nota/types";
import { convertUTC } from "@/utils/utils";
import { useRouter } from "next/navigation";
import { ActionIcon } from "@mantine/core";
import { IconEye } from "@tabler/icons-react";


export const SimpleTableNota = () => {
  const { data } = useNota();
  const router = useRouter();
  //should be memoized or stable
  const columns = useMemo<MRT_ColumnDef<Nota>[]>(
    () => [
      {
        accessorKey: "number",
        header: "Nomor Surat",
      },
      {
        accessorKey: "name",
        header: "Kode Bidang",
        accessorFn: (row) => `${row.departmentId} / ${row.CreateUser.username}`,
      },
      {
        accessorKey: "date",
        header: "Tanggal",
        accessorFn: (row) => convertUTC(row.date),
      },
      {
        accessorKey: "update",
        header: "Update",
        accessorFn: (row) => `${convertUTC(row.updatedAt)} oleh ${row.UpdateUser.username}`,
      },
      {
        accessorKey: "to",
        header: "Kepada",
      },
      {
        accessorKey: "subject",
        header: "Perihal",
      },
      {
        accessorKey: "Level.name",
        header: "Sifat Surat",
      },
      {
        accessorKey: "actions",
        header: "Aksi",
        Cell: ({ row }) => (
          <ActionIcon
            onClick={() => router.push(`/nota/view/${row.original.id}`)}
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
