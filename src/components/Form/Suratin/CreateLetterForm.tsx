"use client";
import { useEffect, useState } from 'react';
import { Button, FileInput, TextInput, Text, Space, Box, Paper, CopyButton, Tooltip, ActionIcon, Select, NumberInput, Grid, Checkbox, Group, Image } from '@mantine/core';
import { hasLength, useForm } from '@mantine/form';
import { DateInput, TimeInput } from '@mantine/dates';
import { useRouter } from "next/navigation";
import { convertUTC } from '@/utils/utils';
import { IconArrowLeft, IconCheck, IconCopy } from '@tabler/icons-react';
import { postLetters } from '@/services/suratin';
import { modals } from '@mantine/modals';
import { useClassifications } from '@/services/data';
import { getCurrentUser } from '@/services/auth';

interface FormValues {
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

export function CreateLetterForm() {
    const { data: classificationsData, isLoading: isClassificationsLoading, error: classificationsError } = useClassifications();

    const classificationOptions = classificationsData?.map((classification) => ({
        value: classification.id,
        label: `${classification.id} - ${classification.name}`,
    })) || [];

    const letterTypeOptions = [
        { value: '1', label: 'Surat Biasa' },
        { value: '2', label: 'Surat Penting' },
        { value: '3', label: 'Surat Rahasia' },
        { value: '4', label: 'Surat Segera' },
        { value: '5', label: 'Undangan' },
    ];

    const departmentOptions = [
        { value: 'SEKRETARIAT', label: 'SEKRETARIAT' },
        { value: 'BIDANG PERENCANAAN DAN PENGEMBANGAN', label: 'BIDANG PERENCANAAN DAN PENGEMBANGAN' },
        { value: 'BIDANG PAJAK DAERAH', label: 'BIDANG PAJAK DAERAH' },
        { value: 'BIDANG RETRIBUSI DAN PENDAPATAN LAIN-LAIN', label: 'BIDANG RETRIBUSI DAN PENDAPATAN LAIN-LAIN' },
        { value: 'BIDANG PENGENDALIAN DAN PEMBINAAN', label: 'BIDANG PENGENDALIAN DAN PEMBINAAN' }
    ];

    const [user, setUser] = useState({ userName: "Guest", departmentName: "Unknown Department", isAdmin: false });
    const [agenda, setAgenda] = useState(false);
    const [langsungKe, setLangsungKe] = useState(false);
    const [loading, setLoading] = useState(false);
    const [currentYear, setCurrentYear] = useState(new Date().getFullYear());
    const [noAgenda, setNoAgenda] = useState(1);
    const router = useRouter();

    useEffect(() => {
        const user = getCurrentUser();
        setUser(user);
        fetchLatestNoAgenda(currentYear);
    }, []);

    const fetchLatestNoAgenda = async (year: number) => {
        try {
            const nextNumber = Math.floor(Math.random() * 100) + 1;
            setNoAgenda(nextNumber);
        } catch (error) {
            console.error('Failed to fetch latest agenda number:', error);
            setNoAgenda(1);
        }
    };

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
            file: (value) => (value ? null : 'File tidak boleh kosong'),

            // Agenda validations
            tglMulai: (value) => (agenda && !value ? 'Pilih tanggal mulai' : null),
            tglSelesai: (value) => (agenda && !value ? 'Pilih tanggal selesai' : null),
            jamMulai: (value) => (agenda && !value ? 'Pilih jam mulai' : null),
            jamSelesai: (value) => (agenda && !value ? 'Pilih jam selesai' : null),
            tempat: (value) => (agenda && !value ? 'Tempat tidak boleh kosong' : null),
            acara: (value) => (agenda && !value ? 'Acara tidak boleh kosong' : null),
        },
        initialValues: {
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

    const handleFileChange = (file: File | null) => {
        if (file) {
            const isImage = file.type.match('image.*');
            const isPDF = file.type.match('application/pdf');

            if (!isImage && !isPDF) {
                modals.open({
                    title: 'Format Tidak Didukung',
                    children: <Text size="sm">Hanya file gambar (JPG/PNG/GIF/BMP) dan PDF yang didukung</Text>,
                    withCloseButton: true
                });
                form.setFieldValue('file', null);
                return;
            }

            form.setFieldValue('file', file);
        } else {
            form.setFieldValue('file', null);
        }
    };

    const handleConfirmSubmit = (values: typeof form.values) => {
        modals.openConfirmModal({
            title: 'Konfirmasi Entri Surat Masuk',
            centered: true,
            children: (
                <Text size="sm">
                    Apakah Anda yakin isian sudah benar?
                </Text>
            ),
            confirmProps: { children: 'Entri' },
            cancelProps: { children: 'Batal' },
            onConfirm: () => handleSubmit(values),
        });
    };

    const handleSubmit = async (values: typeof form.values) => {
        setLoading(true);

        try {
            const formData = new FormData();

            // Letter fields sesuai dengan model backend
            formData.append('noAgenda', noAgenda.toString());
            formData.append('noSurat', values.noSurat);
            formData.append('suratDari', values.suratDari);
            formData.append('perihal', values.perihal);
            formData.append('tglSurat', values.tglSurat.toISOString());
            formData.append('diterimaTgl', values.diterimaTgl.toISOString());
            formData.append('langsungKe', values.langsungKe.toString());
            formData.append('ditujukanKe', values.ditujukanKe);
            formData.append('agenda', values.agenda.toString());

            if (values.classificationId) {
                formData.append('classificationId', values.classificationId);
            }
            if (values.letterTypeId) {
                formData.append('letterTypeId', values.letterTypeId);
            }
            if (values.file) {
                formData.append('file', values.file);
            }

            // Agenda fields (hanya jika agenda = true)
            if (agenda) {
                formData.append('tglMulai', values.tglMulai.toISOString());
                formData.append('tglSelesai', values.tglSelesai.toISOString());
                formData.append('jamMulai', values.jamMulai);
                formData.append('jamSelesai', values.jamSelesai);
                formData.append('tempat', values.tempat);
                formData.append('acara', values.acara);
                if (values.catatan) {
                    formData.append('catatan', values.catatan);
                }
            }

            const response = await postLetters(formData);

            modals.open({
                title: 'Surat berhasil dibuat',
                centered: true,
                children: (
                    <>
                        <Text size="sm">
                            <strong>ID Surat:</strong> {response.id}
                            <CopyButton value={response.id} timeout={2000}>
                                {({ copied, copy }) => (
                                    <Tooltip label={copied ? 'Disalin' : 'Salin'} withArrow position="right">
                                        <ActionIcon color={copied ? 'teal' : 'gray'} variant="subtle" onClick={copy} ml="xs">
                                            {copied ? <IconCheck size={16} /> : <IconCopy size={16} />}
                                        </ActionIcon>
                                    </Tooltip>
                                )}
                            </CopyButton>
                            <br />
                            <strong>No Agenda:</strong> {response.noAgenda}<br />
                            <strong>No Surat:</strong> {response.noSurat}<br />
                            <strong>Klasifikasi:</strong> {response.Classification?.name}<br />
                            <strong>Jenis Surat:</strong> {response.LetterType?.name} <br />
                            <strong>Surat Dari:</strong> {response.suratDari} <br />
                            <strong>Perihal:</strong> {response.perihal}<br />
                        </Text>
                        <Button onClick={() => { form.reset(); modals.closeAll(); handleBack(); }} mt="md">
                            OK
                        </Button>
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
                        <Button
                            onClick={() => {
                                modals.closeAll();
                            }}
                            mt="md"
                        >
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

    const resetNoAgenda = () => {
        setNoAgenda(1);
    };

    return (
        <>
            <Paper withBorder shadow="md" p="md">
                <Button onClick={handleBack} variant="light" leftSection={<IconArrowLeft />} mb="md">
                    Kembali
                </Button>
                <Box component="form" onSubmit={form.onSubmit((values) => handleConfirmSubmit(values))}>
                    <Text component="h2" fw="bold" fz="lg">
                        Entri Surat Masuk
                    </Text>

                    <Grid>
                        <Grid.Col span={6}>
                            <Group align="flex-end">
                                <TextInput
                                    value={`${currentYear}/${noAgenda.toString().padStart(4, '0')}`}
                                    label="No Agenda"
                                    readOnly
                                    style={{ flex: 1 }}
                                />
                                <Button
                                    onClick={resetNoAgenda}
                                    variant="outline"
                                    style={{ height: '36px' }}
                                >
                                    Reset
                                </Button>
                            </Group>
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
                                disabled={isClassificationsLoading || !!classificationsError}
                                error={classificationsError ? "Gagal memuat data" : null}
                            />
                        </Grid.Col>

                        <Grid.Col span={6}>
                            <Select
                                {...form.getInputProps('letterTypeId')}
                                label="Jenis Surat"
                                placeholder="Pilih jenis surat"
                                data={letterTypeOptions}
                                clearable
                                searchable
                                withAsterisk
                                nothingFoundMessage="Jenis surat tidak ditemukan..."
                            />
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

                        <Grid.Col span={12}>
                            <FileInput
                                clearable
                                {...form.getInputProps('file')}
                                onChange={handleFileChange}
                                label="Upload File (Format .jpg/.png/.gif/.bmp/.pdf)"
                                placeholder="Pilih file"
                                accept="image/*,.pdf"
                                withAsterisk
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
                                nothingFoundMessage="Bidang tidak ditemukan..."
                                disabled={!langsungKe}
                            />
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
                            onClick={() => {
                                form.reset();
                                setAgenda(false);
                                setLangsungKe(false);
                            }}
                        >
                            Reset
                        </Button>
                        <Button type="submit" loading={loading}>
                            Submit
                        </Button>
                    </Group>
                </Box>
            </Paper>
        </>
    );
}
