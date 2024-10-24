"use client";
import { PageContainer } from "@/components/PageContainer/PageContainer";
import { SimpleTableLetter } from "@/components/Table/SimpleLetterTable";
import { Button, Group, Paper } from "@mantine/core";
import { useRouter } from "next/navigation";

export default function SuratPage() {
    const router = useRouter();

    return (
        <PageContainer title="Surat Saya">
            <Paper withBorder radius="md" p="md">
                <Group>
                    <Button onClick={() => router.push('http://localhost:3000/dashboard/surat/tambah')}>
                        Buat Surat
                    </Button>

                    <Button onClick={() => router.push('http://localhost:3000/dashboard/surat/spare')}>
                        Buat Spare Surat
                    </Button>
                </Group>
                <SimpleTableLetter />
            </Paper>
        </PageContainer>
    );
}
