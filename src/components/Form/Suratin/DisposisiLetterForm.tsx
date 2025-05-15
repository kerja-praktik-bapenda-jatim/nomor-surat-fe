"use client";
import { useEffect, useState } from 'react';
import { Button, FileInput, TextInput, Text, Space, Box, Paper, CopyButton, Tooltip, ActionIcon, Select, NumberInput, Grid, Checkbox, Textarea, Group } from '@mantine/core';
import { hasLength, useForm } from '@mantine/form';
import { DateInput } from '@mantine/dates';
import { useRouter } from "next/navigation";
import { convertUTC } from '@/utils/utils';
import { IconArrowLeft, IconCheck, IconCopy } from '@tabler/icons-react';
import { postLetters } from '@/services/surat';
import { modals } from '@mantine/modals';
import { useAccess, useActiveRetentionPeriods, useClassifications, useDepartments, useInactiveRetentionPeriods, useJRADescriptions, useLevels, useStorageLocations, } from '@/services/data';
import { getCurrentUser } from '@/services/auth';
import { TimeInput } from '@mantine/dates';

export function DisposisiLetterForm() {
    const { data: classificationsData, isLoading: isClassificationsLoading, error: classificationsError } = useClassifications();
    const { data: departmentsData, isLoading: isDepartmentsLoading, error: departmentsError } = useDepartments();
    const { data: levelsData, isLoading: isLevelsLoading, error: levelsError } = useLevels();

    const classificationOptions = classificationsData?.map((classification) => ({
        value: classification.id,
        label: `${classification.id} - ${classification.name}`,
    })) || [];

    const departmentOptions = departmentsData?.map((department) => ({
        value: department.id,
        label: `${department.id} - ${department.name}`,
    })) || [];

    const levelOptions = levelsData?.map((level) => ({
        value: level.id,
        label: level.name,
    })) || [];

    const [user, setUser] = useState({ userName: "Guest", departmentName: "Unknown Department", isAdmin: false });

    useEffect(() => {
        const user = getCurrentUser();
        setUser(user);
    }, []);

    const form = useForm({
        mode: 'uncontrolled',
        initialValues: {
            noAgenda: '',
            noSurat: '',
            kodeKlasifikasi: '',
            perihal: '',
            tanggalSurat: new Date(),
            diterimaTanggal: new Date(),
            jenisSurat: '',
            file: null,
            bidangTujuan: '',
            isiDisposisi: '',
        },
    });

    const [loading, setLoading] = useState(false);
    const router = useRouter();

    const handleSubmit = async (values: typeof form.values) => {
        setLoading(true);
        try {
            // Handle form submission logic here
            console.log(values);
            modals.open({
                title: 'Disposisi berhasil dibuat',
                centered: true,
                children: (
                    <>
                        <Text size="sm">
                            Disposisi surat telah berhasil dibuat.
                        </Text>
                        <Button onClick={() => { form.reset(); modals.closeAll(); }} mt="md">
                            OK
                        </Button>
                    </>
                )
            });
        } catch (error) {
            modals.open({
                title: 'Error',
                centered: true,
                children: (
                    <>
                        <Text size="sm">Terjadi kesalahan. Silakan coba lagi.</Text>
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

    const handleBack = () => {
        router.push('/suratin');
    };

    return (
        <Paper withBorder shadow="md" p="md">
            <Button onClick={handleBack} variant="light" leftSection={<IconArrowLeft />} mb="md">
                Kembali
            </Button>

            <Box component="form" onSubmit={form.onSubmit(handleSubmit)}>
                <Text component="h2" fw="bold" fz="lg" mb="md">
                    Disposisi Surat
                </Text>

                <Grid>
                    {/* No Agenda */}
                    <Grid.Col span={3}>
                        <TextInput
                            {...form.getInputProps('noAgenda')}
                            label="No Agenda"
                            placeholder="819"
                        />
                    </Grid.Col>
                    <Grid.Col span={3}>
                        <Button
                            fullWidth
                            variant="outline"
                            mt="24"
                            style={{
                                backgroundColor: '#f2f2f2',
                                borderColor: '#a2a2a2',
                                color: '#000',
                            }}
                        >
                            Cari
                        </Button>
                    </Grid.Col>

		                {/* No Disposisi */}
										<Grid.Col span={3}>
                        <TextInput
                            {...form.getInputProps('noDisposisi')}
                            label="No Disposisi"
                            placeholder="819"
                        />
                    </Grid.Col>
                    <Grid.Col span={3}>
                        <Button
                            fullWidth
                            variant="outline"
                            mt="24"
                            style={{
                                backgroundColor: '#f2f2f2',
                                borderColor: '#a2a2a2',
                                color: '#000',
                            }}
                        >
                            Ambil Nomor
                        </Button>
                    </Grid.Col>

                    {/* No Surat */}
                    <Grid.Col span={6}>
                        <TextInput
                            {...form.getInputProps('noSurat')}
                            label="No Surat"
                            placeholder="001"
                        />
                    </Grid.Col>

										{/* Tanggal Disposisi */}
										<Grid.Col span={6}>
                        <TextInput
                            {...form.getInputProps('tanggalDisposisi')}
                            label="Tanggal Disposisi"
                            placeholder="001"
                        />
                    </Grid.Col>

                    {/* Kode Klasifikasi */}
                    <Grid.Col span={6}>
                        <Select
                            {...form.getInputProps('kodeKlasifikasi')}
                            label="Kode Klasifikasi Surat"
                            placeholder="Pilih kode klasifikasi"
                            data={classificationOptions}
                            searchable
                        />
                    </Grid.Col>

										{/* Perihal */}
                    <Grid.Col span={6}>
                        <TextInput
                            {...form.getInputProps('perihal')}
                            label="Perihal"
                            placeholder="Perpojakan dan Tarif"
                        />
                    </Grid.Col>

                    {/* Surat Dari */}
                    <Grid.Col span={6}>
                        <TextInput
                            {...form.getInputProps('perihal')}
                            label="Surat Dari"
                            placeholder="Bidang Pojak Daerah"
                        />
                    </Grid.Col>

										{/* Tanggal */}
										<Grid.Col span={3}>
                        <DateInput
                            {...form.getInputProps('tanggalSurat')}
                            label="Tanggal Surat"
                            placeholder="Pilih tanggal"
                            valueFormat="DD/MM/YYYY"
                        />
                    </Grid.Col>
                    <Grid.Col span={3}>
                        <DateInput
                            {...form.getInputProps('diterimaTanggal')}
                            label="Diterima Tanggal"
                            placeholder="Pilih tanggal"
                            valueFormat="DD/MM/YYYY"
                        />
                    </Grid.Col>

                    {/* Jenis Surat */}
                    <Grid.Col span={6}>
                        <Select
                            {...form.getInputProps('jenisSurat')}
                            label="Jenis Surat"
                            placeholder="Pilih jenis surat"
                            data={levelOptions}
                            searchable
                        />
                    </Grid.Col>

										{/* Isi Disposisi */}
										<Grid.Col span={6}>
												<Textarea
														{...form.getInputProps('isiDisposisi')}
														label="Isi Disposisi"
														placeholder="Tulis isi disposisi di sini"
														autosize
														// minRows={4}
												/>
										</Grid.Col>

                    {/* Didisposisikan ke */}
										<Grid.Col span={6}>
											<Checkbox.Group
												label="Didisposisikan Ke"
												description="Pilih tujuan disposisi (bisa lebih dari satu)" {...form.getInputProps('tujuanDisposisi')}
											>
												<Group mt="xs">
													<Checkbox value="SEKRETARIAT" label="SEKRETARIAT" />
													<Checkbox value="BIDANG PAJAK DAERAH" label="BIDANG PAJAK DAERAH" />
													<Checkbox value="BIDANG PERENCANAAN DAN PENGEMBANGAN" label="BIDANG PERENCANAAN DAN PENGEMBANGAN" />
													<Checkbox value="BIDANG RETRIBUSI DAN PENDAPATAN LAIN-LAIN" label="BIDANG RETRIBUSI DAN PENDAPATAN LAIN-LAIN" />
													<Checkbox value="BIDANG PENGENDALIAN DAN PEMBINAAN" label="BIDANG PENGENDALIAN DAN PEMBINAAN" />
												</Group>
											</Checkbox.Group>
										</Grid.Col>


                    {/* Action Buttons */}
                    <Grid.Col span={2}>
                        <Button
                            fullWidth
                            type="submit"
                            loading={loading}
                            mt="md"
                        >
                            Simpan
                        </Button>
                    </Grid.Col>
                    <Grid.Col span={2}>
                        <Button
                            fullWidth
                            variant="outline"
                            mt="md"
                            style={{
                                backgroundColor: '#f2f2f2',
                                borderColor: '#a2a2a2',
                                color: '#000',
                            }}
                        >
                            Reset
                        </Button>
                    </Grid.Col>
                </Grid>
            </Box>
        </Paper>
    );
}
