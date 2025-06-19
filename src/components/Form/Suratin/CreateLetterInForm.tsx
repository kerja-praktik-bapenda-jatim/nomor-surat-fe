"use client";
import { useEffect, useState } from 'react';
import { Button, FileInput, TextInput, Text, Space, Box, Paper, Group, Select, Grid, Checkbox, Loader, Alert } from '@mantine/core';
import { hasLength, useForm } from '@mantine/form';
import { DateInput, TimeInput } from '@mantine/dates';
import { useRouter } from "next/navigation";
import { IconArrowLeft, IconInfoCircle } from '@tabler/icons-react';
import { postLetterins, useNextAgendaNumber } from '@/services/suratin';
import { modals } from '@mantine/modals';
import { useClassifications, useLetterTypes } from '@/services/data';
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
    const { data: letterTypesData, isLoading: isLetterTypesLoading } = useLetterTypes();
    // ✅ GUNAKAN HOOK UNTUK GET NEXT AGENDA NUMBER
    const { data: nextAgendaData, isLoading: isNextAgendaLoading, error: nextAgendaError, refetch: refetchNextAgenda } = useNextAgendaNumber();

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

    const [user, setUser] = useState({ userName: "Guest", departmentName: "Unknown Department", isAdmin: false });
    const [agenda, setAgenda] = useState(false);
    const [langsungKe, setLangsungKe] = useState(false);
    const [loading, setLoading] = useState(false);
    const router = useRouter();

    useEffect(() => {
        const user = getCurrentUser();
        setUser(user);
        // ✅ FORCE REFETCH saat component load
        refetchNextAgenda();
    }, [refetchNextAgenda]);

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
                    centered: true,
                    children: <Text size="sm">Hanya file gambar (JPG/PNG/GIF/BMP) dan PDF yang didukung</Text>,
                    withCloseButton: true
                });
                form.setFieldValue('file', null);
                return;
            }

            // ✅ TAMBAH VALIDASI SIZE dengan modal centered
            const maxSize = 2 * 1024 * 1024; // 2MB
            if (file.size > maxSize) {
                modals.open({
                    title: 'File Terlalu Besar',
                    centered: true, // ✅ TAMBAH INI untuk center modal
                    children: (
                        <Text size="sm">
                            Ukuran file maksimal 2MB. File Anda: {(file.size / 1024 / 1024).toFixed(2)}MB
                        </Text>
                    ),
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
        console.log('🚀 Starting form submission...'); // ✅ DEBUG

        try {
            const formData = new FormData();
            console.log('📝 Building form data...'); // ✅ DEBUG

            // ✅ Letter fields TANPA noAgenda (auto-generate di backend)
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
                console.log('📎 File size:', (values.file.size / 1024 / 1024).toFixed(2), 'MB'); // ✅ DEBUG
                formData.append('file', values.file);
            }

            // Agenda fields (hanya jika agenda = true)
            if (agenda) {
                console.log('📅 Adding agenda data...'); // ✅ DEBUG
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

            console.log('🌐 Sending API request...'); // ✅ DEBUG
            const response = await postLetterins(formData);
            console.log('✅ API response received:', response); // ✅ DEBUG

            modals.open({
                title: 'Berhasil',
                centered: true,
                children: (
                    <>
                        <Text size="sm" mb="md">
                            Surat berhasil dibuat
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

		const resetForm = () => {
				console.log('🔄 Resetting form...'); // Debug log

				// Method 1: Set values explicitly
				form.setValues({
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
				});

				// Method 2: Clear all errors
				form.clearErrors();

				// Method 3: Reset local state
				setAgenda(false);
				setLangsungKe(false);

				// Method 4: Force re-render dengan timeout
				setTimeout(() => {
						form.clearErrors();
						refetchNextAgenda();
				}, 100);

				console.log('✅ Form reset completed'); // Debug log
		};

    // ✅ RENDER NOMOR AGENDA DENGAN LOADING YANG LEBIH SMOOTH
    const renderAgendaNumber = () => {
        if (isNextAgendaLoading) {
            return (
                <Box>
                    <Text size="sm" fw={500} mb={5}>Nomor Agenda</Text>
                    <Box h={36} bg="gray.1" style={{ borderRadius: 4, border: '1px solid #dee2e6' }}>
                        <Group gap="xs" h="100%" px="sm">
                            <Loader size="xs" />
                            <Text size="sm" c="dimmed">2025/...</Text>
                        </Group>
                    </Box>
                    <Text size="xs" c="dimmed" mt={2}>Mengambil nomor agenda terbaru...</Text>
                </Box>
            );
        }

        if (nextAgendaError) {
            return (
                <Alert icon={<IconInfoCircle size={16} />} color="red" variant="light">
                    <Group justify="space-between">
                        <Text size="sm">Gagal memuat nomor agenda.</Text>
                        <Button size="xs" variant="light" onClick={() => refetchNextAgenda()}>
                            Coba Lagi
                        </Button>
                    </Group>
                </Alert>
            );
        }

        if (nextAgendaData) {
            return (
                <TextInput
                    value={nextAgendaData.formatted}
                    label="Nomor Agenda"
                    readOnly
                />
            );
        }

        return null;
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
                            {/* ✅ TAMPILKAN NOMOR AGENDA FORMAT 2025/0001 */}
                            {renderAgendaNumber()}
                        </Grid.Col>

                        <Grid.Col span={6}>
                            <TextInput
                                {...form.getInputProps('noSurat')}
                                label="Nomor Surat"
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
                                label="Upload File (Format .pdf, maks 2MB)"
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
														onClick={resetForm}
												>
														Reset Form
												</Button>
												<Button
														type="submit"
														loading={loading}
														disabled={isNextAgendaLoading}
												>
														{loading ? 'Menyimpan...' : 'Submit'}
												</Button>
										</Group>
                </Box>
            </Paper>
        </>
    );
}
