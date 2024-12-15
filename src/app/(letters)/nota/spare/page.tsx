"use client"
import { PageContainer } from "@/components/PageContainer/PageContainer";
import { SimpleTableSpareLetter } from "@/components/Table/Nota/SimpleSpareLetterTable";
import { SpareNotaForm } from '@/components/Form/Nota/SpareNotaForm';

export default function SpareNotaPage() {
    return (
        <PageContainer title="Spare Nota Dinas">
            <SpareNotaForm />
            <SimpleTableSpareLetter/>
        </PageContainer>
    );
}
