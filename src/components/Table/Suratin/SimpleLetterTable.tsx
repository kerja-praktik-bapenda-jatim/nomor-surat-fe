import { type MRT_ColumnDef, MantineReactTable } from "mantine-react-table";
import { useMemo } from "react";
import { useLetters } from "@/services/suratin";
import { Letters } from "@/services/suratin/types";
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
        accessorKey: "letterNumber",
        header: "Nomor Surat",
				accessorFn: (row) => row.number,
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
        accessorKey: "from",
        header: "Surat Dari",
				accessorFn: (row) => `${row.from} / ${row.CreateUser.username}`,
      },
      {
        accessorKey: "subject",
        header: "Perihal",
      },
      {
        accessorKey: "actions",
        header: "Aksi",
        Cell: ({ row }) => (
          <ActionIcon
            onClick={() => router.push(`/suratin/view/${row.original.id}`)}
          >
            <IconEye size={14} />
          </ActionIcon>
        ),
      },
    ],
    [router],
  );

  return (
    <MantineReactTable
      columns={columns}
      data={data ?? []}
      mantinePaperProps={{ shadow: "0", withBorder: false }}
      enableColumnOrdering
      enablePagination={false}
      enableStickyHeader
      mantineTableContainerProps={{
        style: {
          maxHeight: 'calc(100vh - 200px)',
        },
      }}
    />
  );
};
