"use client";
import { useEffect, useState } from 'react';
import { Button, FileInput, TextInput, Text, Space, Box, Paper, CopyButton, Tooltip, ActionIcon, Select, NumberInput, Grid, Checkbox, Group, Image } from '@mantine/core';
import styles from './CreateLetterForm.module.css';
import { hasLength, useForm } from '@mantine/form';
import { DateInput } from '@mantine/dates';
import { useRouter } from "next/navigation";
import { convertUTC } from '@/utils/utils';
import { IconArrowLeft, IconCheck, IconCopy, IconX } from '@tabler/icons-react';
import { postLetters } from '@/services/suratin';
import { modals } from '@mantine/modals';
import { useAccess, useActiveRetentionPeriods, useClassifications, useDepartments, useInactiveRetentionPeriods, useJRADescriptions, useLevels, useStorageLocations } from '@/services/data';
import { getCurrentUser } from '@/services/auth';
import { TimeInput } from '@mantine/dates';

interface FormValues {
    startDate: Date;
    endDate: Date;
    classificationId: string | null;
    departmentId: string | null;
    place: string;
    from: string;
    event: string;
    subject: string;
    levelId: string | null;
    letterNumber: string;
    agendaNumber: string;
    letterDate: Date;
    receivedDate: Date;
    startTime: string;
    endTime: string;
    file: File | null;
    archiveFile: File | null;
    addToAgenda: boolean;
    directTo: boolean;
    targetDepartment: string | null;
}

export function CreateLetterForm() {
    const { data: classificationsData, isLoading: isClassificationsLoading, error: classificationsError } = useClassifications();
    const { data: departmentsData, isLoading: isDepartmentsLoading, error: departmentsError } = useDepartments();
    const { data: levelsData, isLoading: isLevelsLoading, error: levelsError } = useLevels();
    const { data: accessData, isLoading: isAccessLoading, error: accessError } = useAccess();
    const { data: activeRetentionPeriodsData, isLoading: isActiveRetentionPeriodsLoading, error: activeRetentionPeriodsError } = useActiveRetentionPeriods();
    const { data: inactiveRetentionPeriodsData, isLoading: isInactiveRetentionPeriodsLoading, error: inactiveRetentionPeriodsError } = useInactiveRetentionPeriods();
    const { data: jraDescriptionsData, isLoading: isJRADescriptionsLoading, error: jraDescriptionsError } = useJRADescriptions();
    const { data: storageLocationsData, isLoading: isStorageLocationsLoading, error: storageLocationsError } = useStorageLocations();

    const classificationOptions = classificationsData?.map((classification) => ({
        value: classification.id,
        label: `${classification.id} - ${classification.name}`,
    })) || [];

    const departmentOptions = departmentsData?.map((department) => ({
        value: department.id,
        label: `${department.id} - ${department.name}`,
    })) || [];

    const fivedepartmentOptions = [
        { value: 'SEKRETARIAT', label: 'SEKRETARIAT' },
        { value: 'BIDANG PERENCANAAN DAN PENGEMBANGAN', label: 'BIDANG PERENCANAAN DAN PENGEMBANGAN' },
        { value: 'BIDANG PAJAK DAERAH', label: 'BIDANG PAJAK DAERAH' },
        { value: 'BIDANG RETRIBUSI DAN PENDAPATAN LAIN-LAIN', label: 'BIDANG RETRIBUSI DAN PENDAPATAN LAIN-LAIN' },
        { value: 'BIDANG PENGENDALIAN DAN PEMBINAAN', label: 'BIDANG PENGENDALIAN DAN PEMBINAAN' }
    ];

    const levelOptions = levelsData?.map((level) => ({
        value: level.id,
        label: level.name,
    })) || [];

    const accessOptions = accessData?.map((access) => ({
        value: access.id,
        label: access.name,
    })) || [];

    const activeRetentionPeriodOptions = activeRetentionPeriodsData?.map((activeRetentionPeriod) => ({
        value: activeRetentionPeriod.id,
        label: activeRetentionPeriod.name,
    })) || [];

    const inactiveRetentionPeriodOptions = inactiveRetentionPeriodsData?.map((inactiveRetentionPeriod) => ({
        value: inactiveRetentionPeriod.id,
        label: inactiveRetentionPeriod.name,
    })) || [];

    const jraDescriptionOptions = jraDescriptionsData?.map((jraDescription) => ({
        value: jraDescription.id,
        label: jraDescription.name,
    })) || [];

    const storageLocationOptions = storageLocationsData?.map((storageLocation) => ({
        value: storageLocation.id,
        label: storageLocation.name,
    })) || [];

    const [user, setUser] = useState({ userName: "Guest", departmentName: "Unknown Department", isAdmin: false });
    const [addToAgenda, setAddToAgenda] = useState(false);
    const [directTo, setDirectTo] = useState(false);
    const [loading, setLoading] = useState(false);
    const [currentYear, setCurrentYear] = useState(new Date().getFullYear());
    const [agendaNumber, setAgendaNumber] = useState(1);
    const [filePreview, setFilePreview] = useState<string | null>(null);
    const [showFileReview, setShowFileReview] = useState(false);
    const router = useRouter();

    useEffect(() => {
        const user = getCurrentUser();
        setUser(user);
        fetchLatestAgendaNumber(currentYear);
    }, []);

    const fetchLatestAgendaNumber = async (year: number) => {
        try {
            const nextNumber = Math.floor(Math.random() * 100) + 1;
            setAgendaNumber(nextNumber);
            form.setFieldValue('agendaNumber', `${year}/${nextNumber.toString().padStart(4, '0')}`);
        } catch (error) {
            console.error('Failed to fetch latest agenda number:', error);
            setAgendaNumber(1);
            form.setFieldValue('agendaNumber', `${year}/0001`);
        }
    };

    const handleYearChange = (value: string | null) => {
        if (value) {
            const newYear = parseInt(value);
            setCurrentYear(newYear);
            fetchLatestAgendaNumber(newYear);
        }
    };

    const resetAgendaNumber = () => {
        setAgendaNumber(1);
        form.setFieldValue('agendaNumber', `${currentYear}/0001`);
    };

    const yearOptions = Array.from({ length: 11 }, (_, i) => {
        const year = new Date().getFullYear() - 5 + i;
        return { value: year.toString(), label: year.toString() };
    });

    const handleFileChange = (file: File | null) => {
			if (file) {
					// First update the form value
					form.setValues({ ...form.values, file });

					// Check file type
					const isImage = file.type.match('image.*');
					const isPDF = file.type.match('application/pdf');

					if (!isImage && !isPDF) {
							modals.open({
									title: 'Format Tidak Didukung',
									children: <Text size="sm">Hanya file gambar (JPG/PNG/GIF/BMP) dan PDF yang didukung</Text>,
									withCloseButton: true
							});
							return;
					}

					// Handle preview differently for PDF vs images
					if (isPDF) {
							// For PDF, we'll use object URL for iframe
							const pdfUrl = URL.createObjectURL(file);
							setFilePreview(pdfUrl);
							setShowFileReview(true);
					} else {
							// For images, use FileReader
							const reader = new FileReader();
							reader.onload = (e) => {
									if (e.target?.result) {
											setFilePreview(e.target.result as string);
											setShowFileReview(true);
									}
							};
							reader.onerror = () => {
									modals.open({
											title: 'Error',
											children: <Text size="sm">Gagal membaca file</Text>,
											withCloseButton: true
									});
							};
							reader.readAsDataURL(file);
					}
			} else {
					// Clean up object URL if it was a PDF
					if (form.values.file?.type.match('application/pdf') && filePreview) {
							URL.revokeObjectURL(filePreview);
					}
					form.setValues({ ...form.values, file: null });
					setFilePreview(null);
					setShowFileReview(false);
			}
	};

    const form = useForm<FormValues>({
        mode: 'uncontrolled',
        validate: {
            startDate: (value) => (addToAgenda && !value ? 'Pilih tanggal awal' : null),
            endDate: (value) => (addToAgenda && !value ? 'Pilih tanggal akhir' : null),
            classificationId: (value) => (value ? null : 'Pilih kode klasifikasi'),
            departmentId: (value) => {
                if (user.isAdmin && !value) {
                    return "Kode Bidang diperlukan";
                }
                return null;
            },
            place: hasLength({ min: 3 }, 'Kolom tidak boleh kosong'),
            from: hasLength({ min: 3 }, 'Kolom tidak boleh kosong'),
            event: (value) => (addToAgenda && !value ? 'Kolom tidak boleh kosong' : null),
            subject: hasLength({ min: 3 }, 'Kolom tidak boleh kosong'),
            levelId: (value) => (value ? null : 'Pilih sifat surat'),
            letterNumber: hasLength({ min: 1 }, 'Kolom tidak boleh kosong'),
            agendaNumber: hasLength({ min: 1 }, 'Kolom tidak boleh kosong'),
            letterDate: (value) => (value ? null : 'Pilih tanggal surat'),
            receivedDate: (value) => (value ? null : 'Pilih tanggal diterima'),
            startTime: (value) => (addToAgenda && !value ? 'Pilih jam awal' : null),
            endTime: (value) => (addToAgenda && !value ? 'Pilih jam akhir' : null),
            file: (value) => (value ? null : 'Kolom tidak boleh kosong'),
            targetDepartment: (value) => (directTo && !value ? 'Pilih tujuan bidang' : null),
        },
        initialValues: {
            startDate: new Date(),
            endDate: new Date(),
            classificationId: null,
            departmentId: null,
            place: '',
            from: '',
            event: '',
            subject: '',
            levelId: null,
            letterNumber: '',
            agendaNumber: '',
            letterDate: new Date(),
            receivedDate: new Date(),
            startTime: '',
            endTime: '',
            file: null,
            archiveFile: null,
            addToAgenda: false,
            directTo: false,
            targetDepartment: null,
        },
    });

		const FileReviewModal = () => {
			const file = form.values.file;
			const isPDF = file?.type.match('application/pdf');

			return (
					<Paper p="md" withBorder>
							<Group justify="space-between" mb="md">
									<Text fw="bold">Review File</Text>
									<ActionIcon variant="subtle" onClick={() => setShowFileReview(false)}>
											<IconX size={16} />
									</ActionIcon>
							</Group>

							{filePreview && (
								<Box style={{ maxHeight: '500px', overflow: 'auto' }}>
									{filePreview.endsWith('.pdf') ? (
                                        <iframe
                                            src={filePreview}
                                            className="pdfPreview"
                                            title="PDF Preview"
                                        />
									) : (
										<Image
											src={filePreview}
											alt="File preview"
											fit="contain"
											style={{ maxWidth: '100%', maxHeight: '400px' }}
										/>
									)}
								</Box>
							)}


							<Group justify="flex-end" mt="md">
									<Button
											variant="outline"
											onClick={() => {
													// Clean up object URL if it was a PDF
													if (isPDF && filePreview) {
															URL.revokeObjectURL(filePreview);
													}
													form.setValues({ ...form.values, file: null });
													setFilePreview(null);
													setShowFileReview(false);
											}}
									>
											Ganti File
									</Button>
									<Button onClick={() => setShowFileReview(false)}>
											Konfirmasi
									</Button>
							</Group>
					</Paper>
			);
	};

    const handleConfirmSubmit = (values: typeof form.values) => {
        if (showFileReview && !values.file) {
            modals.open({
                title: 'File Belum Direview',
                centered: true,
                children: (
                    <Text size="sm">
                        Silakan review file terlebih dahulu sebelum submit.
                    </Text>
                ),
                withCloseButton: true,
                closeButtonProps: { children: 'OK' }
            });
            return;
        }

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
            if (addToAgenda) {
                formData.append('startDate', values.startDate.toISOString());
                formData.append('endDate', values.endDate.toISOString());
                if (values.startTime) formData.append('startTime', values.startTime);
                if (values.endTime) formData.append('endTime', values.endTime);
                if (values.event) formData.append('event', values.event);
            }

            if (values.classificationId) {
                formData.append('classificationId', values.classificationId);
            }
            if (values.departmentId) {
                formData.append('departmentId', values.departmentId);
            }
            if (values.place) {
                formData.append('place', values.place);
            }
            if (values.from) {
                formData.append('from', values.from);
            }
            if (values.subject) {
                formData.append('subject', values.subject);
            }
            if (values.levelId) {
                formData.append('levelId', values.levelId);
            }
            if (values.letterNumber) {
                formData.append('letterNumber', values.letterNumber);
            }
            if (values.agendaNumber) {
                formData.append('agendaNumber', values.agendaNumber);
            }
            if (values.letterDate) {
                formData.append('letterDate', values.letterDate.toISOString());
            }
            if (values.receivedDate) {
                formData.append('receivedDate', values.receivedDate.toISOString());
            }
            if (values.file) {
                formData.append('file', values.file);
            }
            if (values.archiveFile) {
                formData.append('archiveFile', values.archiveFile);
            }
            formData.append('addToAgenda', values.addToAgenda.toString());
            formData.append('directTo', values.directTo.toString());
            if (values.targetDepartment) {
                formData.append('targetDepartment', values.targetDepartment);
            }

            const response = await postLetters(formData);
            modals.open({
                title: 'Surat berhasil dibuat',
                centered: true,
                children: (
                    <>
                        <Text size="sm">
                            <strong>Nomor Surat:</strong> {response.number}
                            <CopyButton value={response.number} timeout={2000}>
                                {({ copied, copy }) => (
                                    <Tooltip label={copied ? 'Disalin' : 'Salin'} withArrow position="right">
                                        <ActionIcon color={copied ? 'teal' : 'gray'} variant="subtle" onClick={copy} ml="xs">
                                            {copied ? <IconCheck size={16} /> : <IconCopy size={16} />}
                                        </ActionIcon>
                                    </Tooltip>
                                )}
                            </CopyButton>
                            <br />
                            <strong>Tanggal:</strong> {convertUTC(response.date)}<br />
                            <strong>Kode Klasifikasi Surat:</strong>{response.classificationId}<br />
                            <strong>Kode Bidang:</strong>{response.departmentId} <br />
                            <strong>Surat Dari:</strong>{response.from} <br />
                            <strong>Perihal:</strong> {response.subject}<br />
                            <strong>File:</strong> {response.filename}<br />
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
                const errorData = await error.response.json();
                errorMessage = errorData.message || errorMessage;
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

    return (
        <>
            <Paper withBorder shadow="md" p="md">
                <Button onClick={handleBack} variant="light" leftSection={<IconArrowLeft />} mb="md">
                    Kembali
                </Button>
                <Box component="form" onSubmit={form.onSubmit((values) => handleConfirmSubmit(values))}>
                    <Text component="h2" fw="bold" fz="lg">
                        Entri Surat
                    </Text>

                    {showFileReview && (
                        <Box mb="md">
                            <FileReviewModal />
                        </Box>
                    )}

                    <Grid>
                        <Grid.Col span={6}>
                            <Group align="flex-end">
                                <TextInput
                                    label="No Agenda"
                                    value={form.values.agendaNumber || ''}
                                    readOnly
                                    withAsterisk
                                />
                                <Button
                                    onClick={resetAgendaNumber}
                                    variant="outline"
                                    style={{ height: '36px' }}
                                >
                                    Reset
                                </Button>
                            </Group>
                        </Grid.Col>

                        <Grid.Col span={3}>
                            <DateInput
                                {...form.getInputProps('startDate')}
                                label="Tanggal Awal"
                                placeholder="Pilih tanggal"
                                valueFormat="DD-MMMM-YYYY"
                                clearable
                                withAsterisk
                                disabled={!addToAgenda}
                            />
                        </Grid.Col>
                        <Grid.Col span={3}>
                            <DateInput
                                {...form.getInputProps('endDate')}
                                label="Tanggal Akhir"
                                placeholder="Pilih tanggal"
                                valueFormat="DD-MMMM-YYYY"
                                clearable
                                withAsterisk
                                disabled={!addToAgenda}
                            />
                        </Grid.Col>
                        <Grid.Col span={6}>
                            <TextInput
                                {...form.getInputProps('letterNumber')}
                                label="No Surat"
                                placeholder="000"
                                withAsterisk
                            />
                        </Grid.Col>
                        <Grid.Col span={3}>
                            <TimeInput
                                {...form.getInputProps('startTime')}
                                label="Jam Awal"
                                placeholder=""
                                withAsterisk
                                disabled={!addToAgenda}
                            />
                        </Grid.Col>
                        <Grid.Col span={3}>
                            <TimeInput
                                {...form.getInputProps('endTime')}
                                label="Jam Akhir"
                                placeholder=""
                                withAsterisk
                                disabled={!addToAgenda}
                            />
                        </Grid.Col>
                        <Grid.Col span={6}>
                            <Select
                                {...form.getInputProps('classificationId')}
                                label="Kode Klasifikasi Surat"
                                placeholder={isClassificationsLoading ? "Memuat data..." : "Pilih atau Cari"}
                                data={classificationOptions}
                                clearable
                                searchable
                                withAsterisk
                                nothingFoundMessage="Kode Klasifikasi tidak ditemukan..."
                                checkIconPosition="right"
                                disabled={isClassificationsLoading || !!classificationsError}
                                error={classificationsError ? "Gagal memuat data" : null}
                            />
                        </Grid.Col>
                        <Grid.Col span={6}>
                            <TextInput
                                {...form.getInputProps('place')}
                                label="Tempat"
                                placeholder="Bidang X"
                                withAsterisk
                                disabled={!addToAgenda}
                            />
                        </Grid.Col>
                        <Grid.Col span={6}>
                            <TextInput
                                {...form.getInputProps('from')}
                                label="Surat Dari"
                                placeholder="Bidang X"
                                withAsterisk
                            />
                        </Grid.Col>
                        <Grid.Col span={6}>
                            <TextInput
                                {...form.getInputProps('event')}
                                label="Acara"
                                placeholder="Acara Apa"
                                withAsterisk
                                disabled={!addToAgenda}
                            />
                        </Grid.Col>
                        <Grid.Col span={6}>
                            <TextInput
                                {...form.getInputProps('subject')}
                                label="Perihal"
                                placeholder="Perihal"
                                withAsterisk
                            />
                        </Grid.Col>
                        <Grid.Col span={6}>
                            <TextInput
                                label="File Digital"
                                placeholder="Pilih file pertama = file utama, file lain = lampiran"
                                readOnly
                                styles={{
                                    input: {
                                        borderColor: '#ffffff',
                                    }
                                }}
                            />
                        </Grid.Col>
                        <Grid.Col span={3}>
                            <DateInput
                                {...form.getInputProps('letterDate')}
                                label="Tanggal Surat"
                                placeholder="Pilih tanggal"
                                valueFormat="DD-MMMM-YYYY"
                                clearable
                                withAsterisk
                            />
                        </Grid.Col>
                        <Grid.Col span={3}>
                            <DateInput
                                {...form.getInputProps('receivedDate')}
                                label="Diterima pada"
                                placeholder="Pilih tanggal"
                                valueFormat="DD-MMMM-YYYY"
                                clearable
                                withAsterisk
                            />
                        </Grid.Col>
                        <Grid.Col span={6}>
                            <FileInput
                                clearable
                                {...form.getInputProps('file')}
                                onChange={handleFileChange}
                                label="Upload File (Format .jpg/.png/.gif/.bmp/.pdf)"
                                placeholder="Pilih file"
                                accept="image/*,.pdf"
                            />
                        </Grid.Col>
                        <Grid.Col span={6}>
                            <Select
                                {...form.getInputProps('levelId')}
                                label="Jenis Surat"
                                placeholder={isLevelsLoading ? "Memuat data..." : "Pilih atau Cari"}
                                data={levelOptions}
                                clearable
                                searchable
                                nothingFoundMessage="Sifat Surat tidak ditemukan..."
                                checkIconPosition="right"
                                disabled={isLevelsLoading || !!levelsError}
                                error={levelsError ? "Gagal memuat data" : null}
                            />
                        </Grid.Col>
                        <Grid.Col span={2}>
                            <Button
                                fullWidth
                                variant="outline"
                                mt="xl"
                                style={{
                                    backgroundColor: '#f2f2f2',
                                    borderColor: '#a2a2a2',
                                    color: '#000',
                                }}
                            >
                                Simpan
                            </Button>
                        </Grid.Col>
                        <Grid.Col span={2}>
                            <Button
                                fullWidth
                                variant="outline"
                                mt="xl"
                                style={{
                                    backgroundColor: '#f2f2f2',
                                    borderColor: '#a2a2a2',
                                    color: '#000',
                                }}
                            >
                                Simpan Cetak
                            </Button>
                        </Grid.Col>
                        <Grid.Col span={2}>
                            <Button
                                fullWidth
                                variant="outline"
                                mt="xl"
                                style={{
                                    backgroundColor: '#f2f2f2',
                                    borderColor: '#a2a2a2',
                                    color: '#000',
                                }}
                                onClick={() => form.reset()}
                            >
                                Reset
                            </Button>
                        </Grid.Col>
                        <Grid.Col span={2}>
                            <Checkbox
                                checked={addToAgenda}
                                label="Masukkan Agenda ?"
                                onChange={(e) => {
                                    const isChecked = e.currentTarget.checked;
                                    form.setFieldValue('addToAgenda', isChecked);
                                    setAddToAgenda(isChecked);
                                }}
                            />
                        </Grid.Col>
                        <Grid.Col span={1.5}>
                            <Checkbox
                                checked={directTo}
                                label="Langsung Ke ?"
                                onChange={(e) => {
                                    const isChecked = e.currentTarget.checked;
                                    form.setFieldValue('directTo', isChecked);
                                    setDirectTo(isChecked);
                                    if (!isChecked) {
                                        form.setFieldValue('targetDepartment', null);
                                    }
                                }}
                            />
                        </Grid.Col>
                        <Grid.Col span={2.5}>
                            <Select
                                {...form.getInputProps('targetDepartment')}
                                placeholder={directTo ? (isDepartmentsLoading ? "Memuat data..." : "Tujuan Bidang") : ""}
                                data={fivedepartmentOptions}
                                clearable
                                searchable
                                withAsterisk
                                nothingFoundMessage="Bidang tidak ditemukan..."
                                disabled={!directTo || isDepartmentsLoading || !!departmentsError}
                                error={departmentsError ? "Gagal memuat data" : null}
                            />
                        </Grid.Col>
                    </Grid>

                    <Space h="sm" />

                    <Button type="submit" loading={loading}>
                        Submit
                    </Button>
                </Box>
            </Paper>
        </>
    );
}
