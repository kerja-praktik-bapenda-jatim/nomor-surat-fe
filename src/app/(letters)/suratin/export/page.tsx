"use client";
import { PageContainer } from "@/components/PageContainer/PageContainer";
import { ExportLetterInForm } from "@/components/Form/Suratin/ExportLetterInForm";

export default function ExportSuratMasukPage() {
    return (
        <PageContainer title="Ekspor Surat Masuk">
            <ExportLetterInForm />
        </PageContainer>
    );
}
