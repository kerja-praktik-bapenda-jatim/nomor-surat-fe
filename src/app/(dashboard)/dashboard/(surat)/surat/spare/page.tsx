"use client"
import { useState } from 'react';
import { Button, Paper, TextInput, Text } from '@mantine/core';
import { useForm } from '@mantine/form';
import ky from 'ky'; // Menggunakan ky untuk fetch API
import { useRouter } from "next/navigation";
import { getAuthToken } from '@/utils/utils';
import { IconArrowLeft } from '@tabler/icons-react';
import {PageContainer} from "@/components/PageContainer/PageContainer";
import {SimpleTableSpareLetter} from "@/components/Table/SimpleSpareLetterTable";

export default function SparePage() {
    const token = getAuthToken('admin');
    const router = useRouter();
    const form = useForm({
        initialValues: {
            spareCounts: '',
        },
        validate: {
        spareCounts: (value) =>
            !Number.isNaN(Number(value)) && Number(value) > 0
            ? null
            : 'Jumlah Harus Lebih dari 0',
        },
    });

    const [loading, setLoading] = useState(false);
    const [submittedValues, setSubmittedValues] = useState<typeof form.values | null>(null);

    const handleSubmit = async (values: typeof form.values) => {
        setLoading(true);
        try {
        // Melakukan POST request ke localhost:5000/api/letter
        const response = await ky.post('http://localhost:5000/api/letter', {
            json: values,
            headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`, // Jika perlu token JWT
            },
        });

        const data = await response.json();
        setSubmittedValues(data); // Menyimpan hasil response
        router.push('/dashboard/surat');
        } catch (error) {
            console.error('Failed to submit:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleBack = () => {
        router.push('/dashboard/surat');
    };

    return (
			<PageContainer title="Spare Surat">
				<Paper withBorder shadow="md" p="md">
					<Button onClick={handleBack} variant="light" leftSection={<IconArrowLeft />} mb="md">
						Kembali
					</Button>
					<Text component="h2" fw="bold" fz="lg">
						Tambah Spare Surat
					</Text>
					<form onSubmit={form.onSubmit(handleSubmit)}>
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
