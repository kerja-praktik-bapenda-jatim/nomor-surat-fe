"use client";

import { PageContainer } from "@/components/PageContainer/PageContainer";
import { LetterTable } from '@/components/Table/LetterTable';

export default function SuratPage() {
    return (
        <PageContainer title="Surat Saya">
            <LetterTable />
        </PageContainer>

    );
}
