"use client";
import { PageContainer } from "@/components/PageContainer/PageContainer";
import { SimpleTableLetter } from "@/components/Table/Nota/SimpleLetterTable";
import { Button, Group, Paper } from "@mantine/core";
import { useRouter } from "next/navigation";

export default function NotaPage() {
    const router = useRouter();

    return (
        <PageContainer title="Nota Dinas Saya">
            <Paper withBorder radius="md" p="md">
                <Group>
                    <Button onClick={() => router.push('/nota/add')}>
                        Buat Nota Dinas
                    </Button>
                </Group>
                <SimpleTableLetter />
            </Paper>
        </PageContainer>
    );
}
