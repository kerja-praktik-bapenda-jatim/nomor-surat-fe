"use client";

import { PageContainer } from "@/components/PageContainer/PageContainer";
import { LetterTable } from '@/components/Table/LetterTable';
import { SimpleTableLetter } from "@/components/Table/SimpleLetterTable";

export default function SuratPage() {
    return (
        <PageContainer title="">
            <SimpleTableLetter />
        </PageContainer>

    );
}
