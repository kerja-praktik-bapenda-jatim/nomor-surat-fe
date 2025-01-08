"use client";
import { PageContainer } from "@/components/PageContainer/PageContainer";
import { SimpleTableNota } from "@/components/Table/Nota/SimpleNotaTable";
import { Button, Group, Paper } from "@mantine/core";
import { IconFileExport, IconFilePlus } from "@tabler/icons-react";
import { useRouter } from "next/navigation";

export default function NotaPage() {
    const router = useRouter();

    return (
        <PageContainer title="Nota Dinas Saya">
            <Paper withBorder radius="md" p="md">
                <Group>
                    <Button onClick={() => router.push('/nota/add')} rightSection= {<IconFilePlus />} color="blue">
                        Buat Nota Dinas
                    </Button>
                    <Button onClick={() => router.push('/nota/export')} rightSection= {<IconFileExport />}>
                        Export Nota Dinas
                    </Button>
                </Group>
                <SimpleTableNota />
            </Paper>
        </PageContainer>
    );
}
