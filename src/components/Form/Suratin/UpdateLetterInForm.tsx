"use client";
import { useEffect, useState } from 'react';
import { Button, FileInput, TextInput, Text, Space, Box, Paper, Select, Grid, Checkbox, Group, Alert } from '@mantine/core';
import { hasLength, useForm } from '@mantine/form';
import { DateInput, TimeInput } from '@mantine/dates';
import { useRouter, useParams } from "next/navigation";
import { IconArrowLeft, IconInfoCircle } from '@tabler/icons-react';
import { modals } from '@mantine/modals';
import { useClassifications, useLetterTypes } from '@/services/data';
import { getCurrentUser } from '@/services/auth';
import { useLetterById, updateLetterIn } from '@/services/suratin';
import type { UpdateLetterInRequest } from '@/services/suratin/types';

interface FormValues {
    noAgenda: number;
    noSurat: string;
    suratDari: string;
    perihal: string;
    tglSurat: Date;
    diterimaTgl: Date;
    langsungKe: boolean;
    ditujukanKe: string;
    agenda: boolean;
    classificationId: string | null;
    letterTypeId: string | null;
    file: File | null;

    // Agenda fields (conditional)
    tglMulai: Date;
    tglSelesai: Date;
    jamMulai: string;
    jamSelesai: string;
    tempat: string;
    acara: string;
    catatan: string;
}

export function UpdateLetterInForm() {
    const { id } = useParams();
    const letterId = Array.isArray(id) ? id[0] : id;
    const router = useRouter();

    const { data: classificationsData, isLoading: isClassificationsLoading } = useClassifications();
    const { data: letterTypesData, isLoading: isLetterTypesLoading } = useLetterTypes();
    const { data: letter, isLoading } = useLetterById(letterId);

    const classificationOptions = classificationsData?.map((classification) => ({
        value: classification.id,
        label: `${classification.id} - ${classification.name}`,
    })) || [];

    const letterTypeOptions = letterTypesData?.map((letterType) => ({
        value: letterType.id.toString(),
        label: letterType.name,
    })) || [];

    const departmentOptions = [
        { value: 'SEKRETARIAT', label: 'SEKRETARIAT' },
        { value: 'BIDANG PERENCANAAN DAN PENGEMBANGAN', label: 'BIDANG PERENCANAAN DAN PENGEMBANGAN' },
        { value: 'BIDANG PAJAK DAERAH', label: 'BIDANG PAJAK DAERAH' },
        { value: 'BIDANG RETRIBUSI DAN PENDAPATAN LAIN-LAIN', label: 'BIDANG RETRIBUSI DAN PENDAPATAN LAIN-LAIN' },
        { value: 'BIDANG PENGENDALIAN DAN PEMBINAAN', label: 'BIDANG PENGENDALIAN DAN PEMBINAAN' }
    ];

    const [loading, setLoading] = useState(false);
    const [langsungKe, setLangsungKe] = useState(false);
    const [agenda, setAgenda] = useState(false);
    const [currentYear] = useState(new Date().getFullYear());
    const [hasExistingFile, setHasExistingFile] = useState(false);

    const form = useForm<FormValues>({
        mode: 'uncontrolled',
        validate: {
            noSurat: hasLength({ min: 1 }, 'Nomor surat tidak boleh kosong'),
            suratDari: hasLength({ min: 3 }, 'Surat dari tidak boleh kosong'),
            perihal: hasLength({ min: 3 }, 'Perihal tidak boleh kosong'),
            tglSurat: (value) => (value ? null : 'Pilih tanggal surat'),
            diterimaTgl: (value) => (value ? null : 'Pilih tanggal diterima'),
            ditujukanKe: (value) => (langsungKe && !value ? 'Tujuan tidak boleh kosong' : null),
            classificationId: (value) => (value ? null : 'Pilih klasifikasi'),
            letterTypeId: (value) => (value ? null : 'Pilih jenis surat'),

            // Agenda validations
            tglMulai: (value) => (agenda && !value ? 'Pilih tanggal mulai' : null),
            tglSelesai: (value) => (agenda && !value ? 'Pilih tanggal selesai' : null),
            jamMulai: (value) => (agenda && !value ? 'Pilih jam mulai' : null),
            jamSelesai: (value) => (agenda && !value ? 'Pilih jam selesai' : null),
            tempat: (value) => (agenda && !value ? 'Tempat tidak boleh kosong' : null),
            acara: (value) => (agenda && !value ? 'Acara tidak boleh kosong' : null),
        },
        initialValues: {
            noAgenda: 0,
            noSurat: '',
            suratDari: '',
            perihal: '',
            tglSurat: new Date(),
            diterimaTgl: new Date(),
            langsungKe: false,
            ditujukanKe: '',
            agenda: false,
            classificationId: null,
            letterTypeId: null,
            file: null,

            // Agenda fields
            tglMulai: new Date(),
            tglSelesai: new Date(),
            jamMulai: '',
            jamSelesai: '',
            tempat: '',
            acara: '',
            catatan: '',
        },
    });

    // ✅ Load existing data to form dengan fix untuk classification & letterType
    useEffect(() => {
        if (letter && classificationsData && letterTypesData) {
            console.log('Loading letter data:', letter);
            console.log('Classifications available:', classificationsData.length);
            console.log('Letter types available:', letterTypesData.length);

            form.setValues({
                noAgenda: letter.noAgenda || 0,
                noSurat: letter.noSurat || '',
                suratDari: letter.suratDari || '',
                perihal: letter.perihal || '',
                tglSurat: letter.tglSurat ? new Date(letter.tglSurat) : new Date(),
                diterimaTgl: letter.diterimaTgl ? new Date(letter.diterimaTgl) : new Date(),
                langsungKe: letter.langsungKe || false,
                ditujukanKe: letter.ditujukanKe || '',
                agenda: letter.agenda || false,

                // ✅ Fix: Pastikan ID match dengan options
                classificationId: letter.classificationId || null,
                letterTypeId: letter.letterTypeId ? letter.letterTypeId.toString() : null,

                file: null,

                // Agenda fields from relation
                tglMulai: letter.Agenda?.tglMulai ? new Date(letter.Agenda.tglMulai) : new Date(),
                tglSelesai: letter.Agenda?.tglSelesai ? new Date(letter.Agenda.tglSelesai) : new Date(),
                jamMulai: letter.Agenda?.jamMulai || '',
                jamSelesai: letter.Agenda?.jamSelesai || '',
                tempat: letter.Agenda?.tempat || '',
                acara: letter.Agenda?.acara || '',
                catatan: letter.Agenda?.catatan || '',
            });

            setLangsungKe(letter.langsungKe || false);
            setAgenda(letter.agenda || false);

            // ✅ Check if file exists
            setHasExistingFile(!!letter.upload);

            console.log('Form values set:', {
                classificationId: letter.classificationId,
                letterTypeId: letter.letterTypeId,
                hasFile: !!letter.upload
            });
        }
    }, [letter, classificationsData, letterTypesData]);

    const handleSubmit = async (values: typeof form.values) => {
        setLoading(true);

        try {
            const updateData: UpdateLetterInRequest = {
                // ✅ No Agenda tidak perlu dikirim karena readonly
                noSurat: values.noSurat,
                suratDari: values.suratDari,
                perihal: values.perihal,
                tglSurat: values.tglSurat.toISOString(),
                diterimaTgl: values.diterimaTgl.toISOString(),
                langsungKe: values.langsungKe,
                ditujukanKe: values.ditujukanKe,
                agenda: values.agenda,
                classificationId: values.classificationId || '',
                letterTypeId: values.letterTypeId || '',
                file: values.file, // ✅ Hanya kirim jika user upload file baru
            };

            // Add agenda fields if agenda is true
            if (values.agenda) {
                updateData.tglMulai = values.tglMulai.toISOString();
                updateData.tglSelesai = values.tglSelesai.toISOString();
                updateData.jamMulai = values.jamMulai;
                updateData.jamSelesai = values.jamSelesai;
                updateData.tempat = values.tempat;
                updateData.acara = values.acara;
                updateData.catatan = values.catatan;
            }

            const response = await updateLetterIn(letterId, updateData);

						modals.open({
								title: 'Berhasil',
								centered: true,
								children: (
										<>
												<Text size="sm" mb="md">
														Surat berhasil diperbarui
												</Text>
												<Group justify="flex-end" gap="sm">
														<Button
																onClick={() => {
																		form.reset();
																		modals.closeAll();
																		handleBack();
																}}
														>
																Selesai
														</Button>
												</Group>
										</>
								)
						});

        } catch (error: any) {
            let errorMessage = "Terjadi kesalahan. Silakan coba lagi.";
            if (error.response) {
                try {
                    const errorData = await error.response.json();
                    errorMessage = errorData.message || errorMessage;
                } catch (e) {
                    console.error('Failed to parse error response:', e);
                }
            }
            modals.open({
                title: 'Error',
                centered: true,
                children: (
                    <>
                        <Text size="sm">{errorMessage}</Text>
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

    if (isLoading || isClassificationsLoading || isLetterTypesLoading) {
        return (
            <Paper withBorder shadow="md" p="md">
                <Text>Loading...</Text>
            </Paper>
        );
    }

    return (
        <Paper withBorder shadow="md" p="md">
            <Button onClick={handleBack} variant="light" leftSection={<IconArrowLeft />} mb="md">
                Kembali
            </Button>
            <Box component="form" onSubmit={form.onSubmit(handleSubmit)}>
                <Text component="h2" fw="bold" fz="lg">
                    Edit Surat Masuk
                </Text>

                <Grid>
                    {/* ✅ No Agenda - READONLY */}
                    <Grid.Col span={6}>
                        <TextInput
                            // value={`${currentYear}/${form.values.noAgenda.toString().padStart(4, '0')}`}
														value={letter?.noAgenda?.toString()}
                            label="No Agenda"
                            readOnly
                            // style={{
                            //     backgroundColor: '#f8f9fa',
                            //     color: '#6c757d'
                            // }}
                        />
                    </Grid.Col>

                    <Grid.Col span={6}>
                        <TextInput
                            {...form.getInputProps('noSurat')}
                            label="No Surat"
                            placeholder="Masukkan nomor surat"
                            withAsterisk
                        />
                    </Grid.Col>

										<Grid.Col span={6}>
												<Select
														{...form.getInputProps('classificationId')}
														label="Klasifikasi Surat"
														placeholder={isClassificationsLoading ? "Memuat data..." : "Pilih klasifikasi"}
														data={classificationOptions}
														clearable
														searchable
														withAsterisk
														nothingFoundMessage="Klasifikasi tidak ditemukan..."
														disabled={isClassificationsLoading}
														// ✅ Tampilkan data yang sudah ada dengan renderOption custom
														renderOption={({ option }) => (
																<div>
																		{option.label}
																</div>
														)}
														// ✅ Atau gunakan defaultValue jika data sudah di-load
														defaultValue={letter?.classificationId}
												/>

												{/* ✅ Optional: Tampilkan data saat ini di bawah select */}
												{letter?.Classification && (
														<Text size="xs" c="dimmed" mt={4}>
																Saat ini: {letter.Classification.id} - {letter.Classification.name}
														</Text>
												)}
										</Grid.Col>

										<Grid.Col span={6}>
												<Select
														{...form.getInputProps('letterTypeId')}
														label="Jenis Surat"
														placeholder={isLetterTypesLoading ? "Memuat data..." : "Pilih jenis surat"}
														data={letterTypeOptions}
														clearable
														searchable
														withAsterisk
														nothingFoundMessage="Jenis surat tidak ditemukan..."
														disabled={isLetterTypesLoading}
														// ✅ Tampilkan data yang sudah ada dengan renderOption custom
														renderOption={({ option }) => (
																<div>
																		{option.label}
																</div>
														)}
														// ✅ Atau gunakan defaultValue jika data sudah di-load
														defaultValue={letter?.letterTypeId?.toString()}
												/>

												{/* ✅ Optional: Tampilkan data saat ini di bawah select */}
												{letter?.LetterType && (
														<Text size="xs" c="dimmed" mt={4}>
																Saat ini: {letter.LetterType.name}
														</Text>
												)}
										</Grid.Col>

                    <Grid.Col span={6}>
                        <TextInput
                            {...form.getInputProps('suratDari')}
                            label="Surat Dari"
                            placeholder="Asal surat"
                            withAsterisk
                        />
                    </Grid.Col>

                    <Grid.Col span={6}>
                        <TextInput
                            {...form.getInputProps('perihal')}
                            label="Perihal"
                            placeholder="Perihal surat"
                            withAsterisk
                        />
                    </Grid.Col>

                    <Grid.Col span={6}>
                        <DateInput
                            {...form.getInputProps('tglSurat')}
                            label="Tanggal Surat"
                            placeholder="Pilih tanggal"
                            valueFormat="DD-MM-YYYY"
                            clearable
                            withAsterisk
                        />
                    </Grid.Col>

                    <Grid.Col span={6}>
                        <DateInput
                            {...form.getInputProps('diterimaTgl')}
                            label="Tanggal Diterima"
                            placeholder="Pilih tanggal"
                            valueFormat="DD-MM-YYYY"
                            clearable
                            withAsterisk
                        />
                    </Grid.Col>

                    {/* ✅ File Upload dengan informasi file existing */}
                    <Grid.Col span={12}>
                        {hasExistingFile && (
                            <Alert icon={<IconInfoCircle size={16} />} title="File Existing" color="blue" mb="sm">
                                File sudah ada. Upload file baru hanya jika ingin mengganti file lama.
                            </Alert>
                        )}
                        <FileInput
                            clearable
                            {...form.getInputProps('file')}
                            label="Upload File Baru (Opsional)"
                            placeholder={hasExistingFile ? "Pilih file untuk mengganti file lama" : "Pilih file"}
                            accept="image/*,.pdf"
                            description={hasExistingFile ? "File saat ini: Tersedia" : "Belum ada file"}
                        />
                    </Grid.Col>

                    <Grid.Col span={4}>
                        <Checkbox
                            checked={langsungKe}
                            label="Langsung Ke"
                            onChange={(e) => {
                                const isChecked = e.currentTarget.checked;
                                form.setFieldValue('langsungKe', isChecked);
                                setLangsungKe(isChecked);
                                if (!isChecked) {
                                    form.setFieldValue('ditujukanKe', '');
                                }
                            }}
                        />
                    </Grid.Col>

										<Grid.Col span={8}>
												<Select
														{...form.getInputProps('ditujukanKe')}
														placeholder={langsungKe ? "Pilih tujuan" : ""}
														data={departmentOptions}
														clearable
														searchable
														withAsterisk={langsungKe}
														disabled={!langsungKe}
														nothingFoundMessage="Bidang tidak ditemukan..."
														// ✅ Tampilkan data yang sudah ada dengan renderOption custom
														renderOption={({ option }) => (
																<div>
																		{option.label}
																</div>
														)}
														// ✅ Atau gunakan defaultValue jika data sudah di-load
														defaultValue={letter?.ditujukanKe}
												/>

												{/* ✅ Optional: Tampilkan data saat ini di bawah select */}
												{letter?.ditujukanKe && langsungKe && (
														<Text size="xs" c="dimmed" mt={4}>
																Saat ini: {letter.ditujukanKe}
														</Text>
												)}
										</Grid.Col>

                    <Grid.Col span={12}>
                        <Checkbox
                            checked={agenda}
                            label="Masukkan ke Agenda"
                            onChange={(e) => {
                                const isChecked = e.currentTarget.checked;
                                form.setFieldValue('agenda', isChecked);
                                setAgenda(isChecked);
                            }}
                        />
                    </Grid.Col>

                    {/* Agenda Fields - hanya muncul jika agenda = true */}
                    {agenda && (
                        <>
                            <Grid.Col span={12}>
                                <Text fw="bold" size="md" mt="md" mb="sm">Informasi Agenda</Text>
                            </Grid.Col>

                            <Grid.Col span={6}>
                                <DateInput
                                    {...form.getInputProps('tglMulai')}
                                    label="Tanggal Mulai"
                                    placeholder="Pilih tanggal"
                                    valueFormat="DD-MM-YYYY"
                                    clearable
                                    withAsterisk
                                />
                            </Grid.Col>

                            <Grid.Col span={6}>
                                <DateInput
                                    {...form.getInputProps('tglSelesai')}
                                    label="Tanggal Selesai"
                                    placeholder="Pilih tanggal"
                                    valueFormat="DD-MM-YYYY"
                                    clearable
                                    withAsterisk
                                />
                            </Grid.Col>

                            <Grid.Col span={6}>
                                <TimeInput
                                    {...form.getInputProps('jamMulai')}
                                    label="Jam Mulai"
                                    withAsterisk
                                />
                            </Grid.Col>

                            <Grid.Col span={6}>
                                <TimeInput
                                    {...form.getInputProps('jamSelesai')}
                                    label="Jam Selesai"
                                    withAsterisk
                                />
                            </Grid.Col>

                            <Grid.Col span={6}>
                                <TextInput
                                    {...form.getInputProps('tempat')}
                                    label="Tempat"
                                    placeholder="Lokasi kegiatan"
                                    withAsterisk
                                />
                            </Grid.Col>

                            <Grid.Col span={6}>
                                <TextInput
                                    {...form.getInputProps('acara')}
                                    label="Acara"
                                    placeholder="Nama kegiatan"
                                    withAsterisk
                                />
                            </Grid.Col>

                            <Grid.Col span={12}>
                                <TextInput
                                    {...form.getInputProps('catatan')}
                                    label="Catatan"
                                    placeholder="Catatan tambahan (opsional)"
                                />
                            </Grid.Col>
                        </>
                    )}
                </Grid>

                <Space h="sm" />

                <Group justify="flex-end" mt="md">
                    <Button
                        variant="outline"
                        onClick={handleBack}
                    >
                        Batal
                    </Button>
                    <Button type="submit" loading={loading}>
                        Update
                    </Button>
                </Group>
            </Box>
        </Paper>
    );
}

