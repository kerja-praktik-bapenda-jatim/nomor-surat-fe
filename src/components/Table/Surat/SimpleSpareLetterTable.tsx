import {MantineReactTable, type MRT_ColumnDef} from "mantine-react-table";
import {useMemo} from "react";
import {useSpareLetters} from "@/services/surat";
import {Letters} from "@/services/surat/types";
import {convertUTC} from "@/utils/utils";
import {useRouter} from "next/navigation";
import {ActionIcon} from "@mantine/core";
import {IconEye} from "@tabler/icons-react";


export const SimpleTableSpareLetter = () => {
	const {data} = useSpareLetters();
	const router = useRouter();
	//should be memoized or stable
	const columns = useMemo<MRT_ColumnDef<Letters>[]>(
		() => [
			{
				accessorKey: "number",
				header: "Nomor Surat",
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
				accessorKey: "reserved",
				header: "Status",
				accessorFn: (row) => (row.reserved ? "Tidak Tersedia" : "Tersedia"),
			},
			{
				accessorKey: "actions",
				header: "Aksi",
				Cell: ({row}) => (
					<ActionIcon
						onClick={() => router.push(`/surat/view/${row.original.id}`)}
					>
						<IconEye size={14}/>
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
			mantinePaperProps={{shadow: "0", withBorder: false}}
		/>
	);
};
