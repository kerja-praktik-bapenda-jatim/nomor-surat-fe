"use client";

import { Paper, Space, Title } from "@mantine/core";
import { type MRT_ColumnDef, MantineReactTable } from "mantine-react-table";
import { useMemo } from "react";
import { useLetters } from "@/services/letters";
import { Letters } from "@/services/letters/types";
import { convertUTC } from "@/utils/utils";

type Person = {
  name: {
    firstName: string;
    lastName: string;
  };
  address: string;
  city: string;
  state: string;
};

// nested data is ok, see accessorKeys in ColumnDef below
const data: Person[] = [
  {
    name: {
      firstName: "Zachary",
      lastName: "Davis",
    },
    address: "261 Battle Ford",
    city: "Columbus",
    state: "Ohio",
  },
  {
    name: {
      firstName: "Robert",
      lastName: "Smith",
    },
    address: "566 Brakus Inlet",
    city: "Westerville",
    state: "West Virginia",
  },
  {
    name: {
      firstName: "Kevin",
      lastName: "Yan",
    },
    address: "7777 Kuhic Knoll",
    city: "South Linda",
    state: "West Virginia",
  },
  {
    name: {
      firstName: "John",
      lastName: "Upton",
    },
    address: "722 Emie Stream",
    city: "Huntington",
    state: "Washington",
  },
  {
    name: {
      firstName: "Nathan",
      lastName: "Harris",
    },
    address: "1 Kuhic Knoll",
    city: "Ohiowa",
    state: "Nebraska",
  },
];

export const SimpleTableLetter = () => {
  const { data } = useLetters();
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
      {/* <Title order={5}></Title> */}
      {/* <Space h="md" /> */}
      <MantineReactTable
        columns={columns}
        data={data ?? []}
        mantinePaperProps={{ shadow: "0", withBorder: false }}
      />
      
    </Paper>
  );
};
