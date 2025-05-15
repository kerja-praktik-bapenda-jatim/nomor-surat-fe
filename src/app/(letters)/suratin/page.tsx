"use client";
import { PageContainer } from "@/components/PageContainer/PageContainer";
import { SimpleTableLetter } from "@/components/Table/Suratin/SimpleLetterTable";
import { Button, Group, Paper } from "@mantine/core";
import { IconFileExport, IconFilePlus } from "@tabler/icons-react";
import { useRouter } from "next/navigation";

export default function SuratinPage() {
    const router = useRouter();

    return (
        <PageContainer title="Surat Masuk Saya">
            <Paper withBorder radius="md" p="md">
                <Group>
                    <Button onClick={() => router.push('/suratin/add')} rightSection= {<IconFilePlus />} color="blue">
                        Entri Surat
                    </Button>
                </Group>
                <SimpleTableLetter />
            </Paper>
        </PageContainer>
    );
}
