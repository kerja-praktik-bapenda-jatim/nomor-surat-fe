"use client";
import { CreateAgendaForm } from "@/components/Form/Agenda/CreateAgendaForm";
import { PageContainer } from "@/components/PageContainer/PageContainer";

export default function AddSuratPage() {
	return (
		<PageContainer title="">
			<CreateAgendaForm />
		</PageContainer>
	);
}

/*
	agenda surat untuk id 0 = agenda non surat

*/
