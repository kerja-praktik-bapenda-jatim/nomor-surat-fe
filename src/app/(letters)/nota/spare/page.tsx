"use client"
import { PageContainer } from "@/components/PageContainer/PageContainer";
import { SimpleTableSpareNota } from "@/components/Table/Nota/SimpleSpareNotaTable";
import { SpareNotaForm } from '@/components/Form/Nota/SpareNotaForm';

export default function SpareNotaPage() {
    return (
        <PageContainer title="Spare Nota Dinas">
            <SpareNotaForm />
            <SimpleTableSpareNota/>
        </PageContainer>
    );
}
