"use client"
import { useState } from 'react';
import { Box, Button, Paper, TextInput, Text } from '@mantine/core';
import { useForm } from '@mantine/form';
import ky from 'ky'; // Menggunakan ky untuk fetch API
import { useRouter } from "next/navigation";

export default function SparePage() {
    const token = 'eyJhbGciOiJIUzM4NCIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiJlOTVlN2ExYi1jYjNkLTRiMjQtYmU2OC1lOWJkMDU1N2YyNTQiLCJpc0FkbWluIjp0cnVlLCJpYXQiOjE3Mjk3ODM2MzksImV4cCI6MTczMDM4ODQzOX0.4CFCvhQJypzgxfDoKOBdolpCB9Hj-cjLZQbnjzR9Yr16s-Q4nbUIjk1AXD1c72i9';
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
        router.push('http://localhost:3000/dashboard/surat');
        } catch (error) {
            console.error('Failed to submit:', error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <Paper withBorder shadow="md" p="md">
            <Text component="h2" fw="bold" fz="lg">
                Tambah Spare Surat
            </Text>
            <form onSubmit={form.onSubmit(handleSubmit)}> {/* Hanya satu form */}
                <TextInput
                    {...form.getInputProps('spareCounts')}
                    label="Jumlah"
                    placeholder="1-100"
                    disabled={loading} // Disabled saat loading
                />
                <Button type="submit" mt="md" loading={loading}> {/* Loading button */}
                    Submit
                </Button>
            </form>
        </Paper>
    );
}
