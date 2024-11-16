"use client"
import { PageContainer } from "@/components/PageContainer/PageContainer";
import { SimpleTableSpareLetter } from "@/components/Table/Nota/SimpleSpareLetterTable";
import { SpareLetterForm } from '@/components/Form/Nota/SpareLetterForm';

export default function SpareNotaPage() {
    return (
        <PageContainer title="Spare Surat">
            <SpareLetterForm />
            <SimpleTableSpareLetter/>
        </PageContainer>
    );
}
