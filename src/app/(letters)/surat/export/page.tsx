"use client";
import { ExportLetterForm } from "@/components/Form/Surat/ExportLetterForm";
import { PageContainer } from "@/components/PageContainer/PageContainer";

export default function AddSuratPage() {
    return (
        <PageContainer title="Export Surat Keluar Saya">
            <ExportLetterForm />
        </PageContainer>
    );
}
