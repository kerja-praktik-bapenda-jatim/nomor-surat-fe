"use client"
import { PageContainer } from "@/components/PageContainer/PageContainer";
import { SimpleTableSpareLetter } from "@/components/Table/Surat/SimpleSpareLetterTable";
import { SpareLetterForm } from '@/components/Form/Surat/SpareLetterForm';

export default function SpareSuratPage() {
    return (
        <PageContainer title="Spare Surat">
            <SpareLetterForm />
            <SimpleTableSpareLetter/>
        </PageContainer>
    );
}
