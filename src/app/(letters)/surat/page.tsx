"use client";
import { PageContainer } from "@/components/PageContainer/PageContainer";
import { SimpleTableLetter } from "@/components/Table/Surat/SimpleLetterTable";
import { Button, Group, Paper } from "@mantine/core";
import { useRouter } from "next/navigation";

export default function SuratPage() {
    const router = useRouter();

    return (
        <PageContainer title="Surat Saya">
            <Paper withBorder radius="md" p="md">
                <Group>
                    <Button onClick={() => router.push('/surat/add')}>
                        Buat Surat
                    </Button>
                </Group>
                <SimpleTableLetter />
            </Paper>
        </PageContainer>
    );
}
