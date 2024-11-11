"use client"
import { PageContainer } from "@/components/PageContainer/PageContainer";
import { SimpleTableSpareLetter } from "@/components/Table/SimpleSpareLetterTable";
import { SpareLetterForm } from '@/components/Form/SpareLetterForm';

export default function SparePage() {
    return (
        <PageContainer title="Spare Surat">
            <SpareLetterForm />
            <SimpleTableSpareLetter/>
        </PageContainer>
    );
}
