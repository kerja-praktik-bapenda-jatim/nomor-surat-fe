import { type MRT_ColumnDef, MantineReactTable } from "mantine-react-table";
import { useMemo, useEffect } from "react";
import { useLetters } from "@/services/suratin";
import { Letterins } from "@/services/suratin/types";
import { convertUTC } from "@/utils/utils";
import { useRouter } from "next/navigation";
import { ActionIcon } from "@mantine/core";
import { IconEye } from "@tabler/icons-react";
import { useQueryClient } from "@tanstack/react-query";
import { Button, Group } from "@mantine/core";

export const SimpleTableLetterIn = () => {
  const { data, isLoading, error } = useLetters();
  const router = useRouter();
  const queryClient = useQueryClient();

  console.log("Surat masuk data:", data);

  // ✅ Clear cache surat keluar saat masuk ke halaman surat masuk
  useEffect(() => {
    queryClient.invalidateQueries({ queryKey: ["LettersOut"] });
    queryClient.removeQueries({ queryKey: ["LettersOut"] });
  }, [queryClient]);

  //should be memoized or stable
  const columns = useMemo<MRT_ColumnDef<Letterins>[]>(
    () => [
      {
        accessorKey: "noAgenda",
        header: "Nomor Agenda",
        accessorFn: (row) => row.noAgenda,
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
				Cell: ({ row }) => {
					const router = useRouter();

					return (
						<Group>
							<Button
								size="xs"
								variant="light"
								color="blue"
								radius="xl"
								onClick={() => router.push(`/suratin/view/${row.original.id}`)}
							>
								Lihat
							</Button>
							<Button
								size="xs"
								variant="light"
								color="red"
								radius="xl"
								onClick={() =>
									window.open(`/suratin/print/${row.original.noAgenda}`, "_blank")
								}
							>
								Cetak
							</Button>
						</Group>
					);
				},
			}
    ],
    [router],
  );

  // ✅ Show loading state
  if (isLoading) {
    return <div>Loading...</div>;
  }

  // ✅ Show error state
  if (error) {
    return <div>Error: {error.message}</div>;
  }

  return (
    <MantineReactTable
      columns={columns}
      data={data ?? []}
      mantinePaperProps={{ shadow: "0", withBorder: false }}
      enableColumnOrdering
      enablePagination={true}
      enableStickyHeader
      mantineTableContainerProps={{
        style: {
          maxHeight: 'calc(100vh - 200px)',
        },
      }}
    />
  );
};
