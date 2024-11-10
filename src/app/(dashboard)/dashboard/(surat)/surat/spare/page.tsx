"use client"
import { useState } from 'react';
import { Button, Paper, TextInput, Text } from '@mantine/core';
import { useForm } from '@mantine/form';
import ky from 'ky';
import { useRouter } from "next/navigation";
import { getAuthToken } from '@/utils/utils';
import { IconArrowLeft } from '@tabler/icons-react';
import {PageContainer} from "@/components/PageContainer/PageContainer";
import {SimpleTableSpareLetter} from "@/components/Table/SimpleSpareLetterTable";
import { DateInput } from '@mantine/dates';
import { modals } from '@mantine/modals';

export default function SparePage() {
    const token = getAuthToken();
    const router = useRouter();
    const form = useForm({
        initialValues: {
            date: null,
            spareCounts: '',
        },
        validate: {
            date: (value) => value ? null : 'Tanggal harus dipilih',
            spareCounts: (value) =>
                !Number.isNaN(Number(value)) && Number(value) > 0
                ? null
                : 'Jumlah Harus Lebih dari 0',
        },
    });

    const [loading, setLoading] = useState(false);

    const handleSubmit = async (values: typeof form.values) => {
        setLoading(true);
        try {
            const response = await ky.post('http://localhost:5000/api/letter', {
                json: values,
                headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${token}`,
                },
            }).json();

            modals.open({
                title: 'Penambahan Spare Surat',
                centered: true,
                children: (
                    <>
                        <Text size="sm">{response.message}</Text>,
                        <Button onClick={() => { modals.closeAll();} } mt="md">
                            OK
                        </Button>
                    </>
                )
            })
        } catch (error:any) {
            const errorMessage = error.response ? await error.response.json() : { message: 'Gagal menambahkan spare surat.' };
            modals.open({
                title: 'Error',
                centered: true,
                children: (
                    <>
                        <Text size="sm">{errorMessage.message}</Text>
                        <Button onClick={() => modals.closeAll()} mt="md">
                            OK
                        </Button>
                    </>
                )
            });
        } finally {
            setLoading(false);
        }
    };

    return (
			<PageContainer title="Spare Surat">
				<Paper withBorder shadow="md" p="md">
					<Text component="h2" fw="bold" fz="lg">
						Tambah Spare Surat
					</Text>
					<form onSubmit={form.onSubmit(handleSubmit)}>
                        <DateInput
                            clearable
                            valueFormat="DD-MMMM-YYYY"
                            minDate={new Date(new Date().setDate(new Date().getDate() - 1))}
                            maxDate={new Date()}
                            {...form.getInputProps('date')}
                            label="Tanggal"
                            placeholder="Pilih tanggal"
                        />
						<TextInput
							{...form.getInputProps('spareCounts')}
							label="Jumlah"
							placeholder="1-100"
							disabled={loading} // Disabled saat loading
						/>
						<Button type="submit" mt="md" loading={loading}>
							Submit
						</Button>
					</form>
				</Paper>
				<SimpleTableSpareLetter/>
			</PageContainer>
    );
}
