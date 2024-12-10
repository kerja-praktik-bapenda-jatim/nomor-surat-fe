"use client"; 
import { ExportNotaForm } from "@/components/Form/Nota/ExportForm";
import { PageContainer } from "@/components/PageContainer/PageContainer";

export default function AddSuratPage() {
    return (
        <PageContainer title="Export Nota Dinas">
            <ExportNotaForm />
        </PageContainer>
    );
}
