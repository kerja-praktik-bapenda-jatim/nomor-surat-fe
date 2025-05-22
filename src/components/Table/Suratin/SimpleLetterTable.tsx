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
        accessorKey: "noSurat",
        header: "Nomor Surat",
        accessorFn: (row) => row.noSurat,
      },
      {
        accessorKey: "classification",
        header: "Klasifikasi / Jenis",
        accessorFn: (row) => `${row.Classification?.name || "Tidak ada"} / ${row.LetterType?.name || "Tidak ada"}`,
      },
      {
        accessorKey: "tglSurat",
        header: "Tanggal Surat",
        accessorFn: (row) => convertUTC(row.tglSurat),
      },
			{
				accessorKey: "suratDari",
				header: "Surat Dari",
				accessorFn: (row) => row.suratDari, 
			},
      {
        accessorKey: "perihal",
        header: "Perihal",
        accessorFn: (row) => row.perihal,
      },
      {
        accessorKey: "diterimaTgl",
        header: "Tanggal Diterima",
        accessorFn: (row) => convertUTC(row.diterimaTgl),
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
