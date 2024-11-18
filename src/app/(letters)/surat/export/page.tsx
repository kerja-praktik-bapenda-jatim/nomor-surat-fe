"use client"; 
import { ExportLetterForm } from "@/components/Form/Surat/exportForm";
import { PageContainer } from "@/components/PageContainer/PageContainer";

export default function AddSuratPage() {
    return (
        <PageContainer title="Export Surat Saya">
            <ExportLetterForm />
        </PageContainer>
    );
}
