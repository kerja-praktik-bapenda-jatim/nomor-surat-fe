"use client"; 
import { CreateNotaForm } from "@/components/Form/Nota/CreateNotaForm";
import { PageContainer } from "@/components/PageContainer/PageContainer";

export default function AddNotaPage() {
  return (
    <PageContainer title="Nota Dinas">
      <CreateNotaForm />
    </PageContainer>
  );
}
