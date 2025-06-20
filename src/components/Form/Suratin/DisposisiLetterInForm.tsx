"use client";
import { useEffect, useState, useCallback } from 'react';
import {
  Button,
  TextInput,
  Text,
  Space,
  Box,
  Paper,
  Select,
  Grid,
  Checkbox,
  Textarea,
  Group,
  Alert,
  Loader
} from '@mantine/core';
import { hasLength, useForm } from '@mantine/form';
import { DateInput } from '@mantine/dates';
import { useRouter } from "next/navigation";
import { IconArrowLeft, IconInfoCircle, IconSearch, IconCheck } from '@tabler/icons-react';
import { modals } from '@mantine/modals';
import { useClassifications } from '@/services/data';
import { getCurrentUser } from '@/services/auth';
import {
  createDisposisi,
  useNextDisposisiNumberWithFallback,
  useLetterByAgenda,
  validateDisposisiData,
  getDisposisiFromLocalStorage
} from '@/services/disposisi';
import { getTokenFromCookies } from '@/services/auth';

// Define DEPARTMENT_OPTIONS locally if import fails
const DEPARTMENT_OPTIONS = [
  { value: 'SEKRETARIAT', label: 'Sekretariat' },
  { value: 'BIDANG PAJAK DAERAH', label: 'Bidang Pajak Daerah' },
  { value: 'BIDANG PERENCANAAN DAN PENGEMBANGAN', label: 'Bidang Perencanaan dan Pengembangan' },
  { value: 'BIDANG RETRIBUSI DAN PENDAPATAN LAIN-LAIN', label: 'Bidang Retribusi dan Pendapatan Lain-lain' },
  { value: 'BIDANG PENGENDALIAN DAN PEMBINAAN', label: 'Bidang Pengendalian dan Pembinaan' },
];

interface FormValues {
  noDisposisi: number | '';
  tanggalDisposisi: Date;
  tujuanDisposisi: string[];
  isiDisposisi: string;
}

interface LetterData {
  letterIn_id: string;
  noSurat: string;
  suratDari: string;
  perihal: string;
  tanggalSurat: Date | null;
  diterimaTanggal: Date | null;
  kodeKlasifikasi: string;
  jenisSurat: string;
}

export function DisposisiLetterForm() {
  const { data: classificationsData, isLoading: isClassificationsLoading, error: classificationsError } = useClassifications();

  const [user, setUser] = useState({ userName: "Guest", departmentName: "Unknown Department", isAdmin: false });
  const [loading, setLoading] = useState(false);
  const [searchLoading, setSearchLoading] = useState(false);
  const [letterFound, setLetterFound] = useState(false);
  const [searchAttempted, setSearchAttempted] = useState(false);
  const [enableSearch, setEnableSearch] = useState(false);
  const [searchAgenda, setSearchAgenda] = useState('');
  const [selectedYear, setSelectedYear] = useState('2025');
  const [isSubmitted, setIsSubmitted] = useState(false);

  const [letterData, setLetterData] = useState<LetterData>({
    letterIn_id: '',
    noSurat: '',
    suratDari: '',
    perihal: '',
    tanggalSurat: null,
    diterimaTanggal: null,
    kodeKlasifikasi: '',
    jenisSurat: '',
  });

  const router = useRouter();

  // Generate year options (current year ± 5 years)
  const currentYear = new Date().getFullYear();
  const yearOptions = Array.from({ length: 11 }, (_, i) => {
    const year = currentYear - 5 + i;
    return { value: year.toString(), label: year.toString() };
  });

  // React Query hooks
  const {
    data: nextDisposisiData,
    isLoading: isNextDisposisiLoading,
    error: nextDisposisiError,
    refetch: refetchNextDisposisi
  } = useNextDisposisiNumberWithFallback();

  const {
    data: apiLetterData,
    isLoading: isLetterLoading,
    error: letterError,
    refetch: refetchLetter
  } = useLetterByAgenda(selectedYear, searchAgenda, enableSearch && !!searchAgenda);

  const form = useForm<FormValues>({
    mode: 'uncontrolled',
    validate: {
      noDisposisi: (value) => (!value ? 'Nomor disposisi tidak boleh kosong' : null),
      tanggalDisposisi: (value) => (value ? null : 'Pilih tanggal disposisi'),
      tujuanDisposisi: (value) => (!value || value.length === 0 ? 'Pilih minimal satu tujuan disposisi' : null),
      isiDisposisi: hasLength({ min: 10, max: 500 }, 'Isi disposisi minimal 10 karakter, maksimal 500 karakter'),
    },
    initialValues: {
      noDisposisi: '',
      tanggalDisposisi: new Date(),
      tujuanDisposisi: [],
      isiDisposisi: '',
    },
  });

  // Set nomor disposisi only once when data is available and not set yet
  useEffect(() => {
    if (nextDisposisiData?.noDispo && !form.getValues().noDisposisi) {
      console.log('📝 Setting initial nomor disposisi:', nextDisposisiData.noDispo);
      form.setFieldValue('noDisposisi', nextDisposisiData.noDispo);
    }
  }, [nextDisposisiData?.noDispo]);

  // Handle letter data when found
  useEffect(() => {
    console.log('🔍 Letter data effect triggered:', {
      hasApiData: !!apiLetterData,
      enableSearch,
      searchAttempted,
      letterFound
    });

    if (apiLetterData && enableSearch && searchAttempted && !letterFound) {
      console.log('📝 Setting letter data to state:', apiLetterData);

      setLetterData({
        letterIn_id: apiLetterData.id || '',
        noSurat: apiLetterData.noSurat || '',
        suratDari: apiLetterData.suratDari || '',
        perihal: apiLetterData.perihal || '',
        tanggalSurat: apiLetterData.tglSurat ? new Date(apiLetterData.tglSurat) : null,
        diterimaTanggal: apiLetterData.diterimaTgl ? new Date(apiLetterData.diterimaTgl) : null,
        kodeKlasifikasi: apiLetterData.Classification?.name || '',
        jenisSurat: apiLetterData.LetterType?.name || '',
      });

      setLetterFound(true);

      console.log('✅ Letter found successfully');
    }
  }, [apiLetterData?.id, enableSearch, searchAttempted, letterFound, refetchNextDisposisi]);

  // Handle error clearing
  useEffect(() => {
    if (letterError && enableSearch && searchAttempted && letterFound) {
      console.log('❌ Letter search error, clearing data');
      setLetterFound(false);
      clearLetterData();
    }
  }, [letterError, enableSearch, searchAttempted, letterFound]);

  // Load user and initial disposisi number
  useEffect(() => {
    const currentUser = getCurrentUser();
    setUser(currentUser);
    // Get next disposisi number on component mount
    refetchNextDisposisi();

    // Debug: Test correct endpoint
    console.log('🔍 Testing disposisi-letterin endpoint...');
    fetch('http://localhost:8080/api/disposisi-letterin/next-number', {
      headers: {
        'Authorization': `Bearer ${getTokenFromCookies()}`,
      }
    })
    .then(res => res.json())
    .then(data => {
      console.log('✅ Disposisi endpoint test successful:', data);
    })
    .catch(err => {
      console.log('❌ Disposisi endpoint test failed:', err);
    });
  }, [refetchNextDisposisi]);

  const clearLetterData = () => {
    setLetterData({
      letterIn_id: '',
      noSurat: '',
      suratDari: '',
      perihal: '',
      tanggalSurat: null,
      diterimaTanggal: null,
      kodeKlasifikasi: '',
      jenisSurat: '',
    });
  };

  const handleSearchLetter = useCallback(async () => {
    if (!searchAgenda.trim()) {
      modals.open({
        title: 'Peringatan',
        centered: true,
        children: <Text size="sm">Masukkan nomor agenda terlebih dahulu</Text>,
      });
      return;
    }

    console.log('🔍 Starting search...', { selectedYear, searchAgenda });

    setSearchLoading(true);
    setLetterFound(false);
    setEnableSearch(true);
    setSearchAttempted(false);
    setIsSubmitted(false);
    clearLetterData();

    try {
      console.log('📡 Triggering refetch...');
      await refetchLetter();
      setSearchAttempted(true);
      console.log('✅ Search completed');
    } catch (error) {
      console.error('❌ Search error:', error);
      setSearchAttempted(true);
    } finally {
      setSearchLoading(false);
    }
  }, [searchAgenda, selectedYear, refetchLetter]);

  const handleConfirmSubmit = (values: typeof form.values) => {
    const errors = validateDisposisiData({
      letterIn_id: letterData.letterIn_id,
      tglDispo: values.tanggalDisposisi.toISOString(),
      dispoKe: values.tujuanDisposisi,
      isiDispo: values.isiDisposisi,
      noDispo: values.noDisposisi as number,
    });

    if (errors.length > 0) {
      modals.open({
        title: 'Validasi Error',
        centered: true,
        children: (
          <Box>
            <Text size="sm" mb="sm">Terdapat error pada form:</Text>
            {errors.map((error, index) => (
              <Text key={index} size="sm" c="red">• {error}</Text>
            ))}
          </Box>
        ),
      });
      return;
    }

    modals.openConfirmModal({
      title: 'Konfirmasi Buat Disposisi',
      centered: true,
      children: (
        <Box>
          <Text size="sm" mb="sm">Apakah Anda yakin data disposisi sudah benar?</Text>
        </Box>
      ),
      confirmProps: { children: 'Buat Disposisi' },
      cancelProps: { children: 'Batal' },
      onConfirm: () => handleSubmit(values),
    });
  };

  const handleSubmit = async (values: typeof form.values) => {
    setLoading(true);
    console.log('🚀 Starting disposisi creation...');

    try {
      const requestData = {
        letterIn_id: letterData.letterIn_id,
        noDispo: values.noDisposisi as number,
        tglDispo: values.tanggalDisposisi.toISOString(),
        dispoKe: values.tujuanDisposisi,
        isiDispo: values.isiDisposisi.trim(),
      };

      console.log('📝 Sending disposisi data:', requestData);
      const response = await createDisposisi(requestData);
      console.log('✅ Disposisi created:', response);

      // Set submitted flag and get next number for future disposisi
      setIsSubmitted(true);

      // Get next number for future disposisi forms
// ✅ PERBAIKAN: Refresh nomor disposisi LANGSUNG setelah berhasil
			console.log('🔄 Refreshing next disposisi number...');
			await refetchNextDisposisi();

      // Check if this was saved to localStorage (fallback mode)
      const isLocalStorage = response.id.startsWith('dispo_');

      modals.open({
        title: isLocalStorage ? 'Berhasil (Mode Offline)' : 'Berhasil',
        centered: true,
        children: (
          <Box>
            <Text size="sm" mb="md">
              Disposisi berhasil {isLocalStorage ? 'disimpan secara lokal' : 'dibuat'} dengan nomor: <strong>{response.noDispo}</strong>
            </Text>

            <Group justify="flex-end" gap="sm">
              {isLocalStorage && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    const saved = getDisposisiFromLocalStorage();
                    console.log('💾 Saved disposisi list:', saved);
                    modals.open({
                      title: 'Data Tersimpan',
                      children: (
                        <Box>
                          <Text size="sm" mb="sm">Total disposisi tersimpan: {saved.length}</Text>
                          {saved.slice(-3).map((item, index) => (
                            <Text key={index} size="xs" c="dimmed">
                              • No.{item.noDispo} - {new Date(item.createdAt).toLocaleString('id-ID')}
                            </Text>
                          ))}
                        </Box>
                      )
                    });
                  }}
                >
                  Lihat Data
                </Button>
              )}
              <Button
                variant="outline"
                onClick={() => {
                  modals.closeAll();
                  resetForm();
                }}
              >
                Disposisi Lain
              </Button>
              <Button
                onClick={() => {
                  modals.closeAll();
                  handleBack();
                }}
              >
                Selesai
              </Button>
            </Group>
          </Box>
        )
      });

    } catch (error: any) {
      console.error('❌ Submit error details:', error);

      let errorMessage = "Terjadi kesalahan saat membuat disposisi.";

      if (error.message) {
        errorMessage = error.message;
      } else if (error.response) {
        try {
          const errorData = await error.response.json();
          errorMessage = errorData.message || `HTTP ${error.response.status}: ${error.response.statusText}`;
        } catch (e) {
          errorMessage = `HTTP ${error.response.status}: ${error.response.statusText}`;
        }
      }

      // Add helpful suggestions based on error type
      if (errorMessage.includes('404') || errorMessage.includes('Not Found')) {
        errorMessage += '\n\nSaran: Periksa apakah backend sudah berjalan dan endpoint /api/disposisi tersedia.';
      }

      modals.open({
        title: 'Error Membuat Disposisi',
        centered: true,
        children: (
          <Box>
            <Text size="sm" style={{ whiteSpace: 'pre-line' }}>{errorMessage}</Text>
            <Button
              onClick={() => modals.closeAll()}
              mt="md"
              fullWidth
            >
              OK
            </Button>
          </Box>
        )
      });
    } finally {
      setLoading(false);
    }
  };

  const handleBack = () => {
    router.push('/suratin');
  };

  const resetForm = useCallback(() => {
    console.log('🔄 Resetting disposisi form...');

    // Reset form values
    form.reset();

    // Reset local state
    setSearchAgenda('');
    setSelectedYear('2025');
    setLetterFound(false);
    setSearchAttempted(false);
    setEnableSearch(false);
    setIsSubmitted(false);
    clearLetterData();

    // Get fresh disposisi number for new form
    setTimeout(() => {
      refetchNextDisposisi();
    }, 100);

    console.log('✅ Disposisi form reset completed');
  }, []);

  const renderDisposisiNumber = () => {
    if (form.values.noDisposisi || nextDisposisiData?.noDispo) {
      const displayNumber = form.values.noDisposisi || nextDisposisiData?.noDispo;
      return (
        <Box>
          <Text size="sm" fw={500} mb={5}>Nomor Disposisi</Text>
          <Group gap="xs">
            <TextInput
              value={displayNumber?.toString() || ''}
              placeholder="Nomor sequential"
              style={{ flex: 1 }}
              readOnly
            />
          </Group>
        </Box>
      );
    }

    return (
      <TextInput
        value=""
        label="Nomor Disposisi"
        placeholder="Memuat nomor urut..."
        readOnly
        styles={{
          input: {
            backgroundColor: '#f8f9fa',
            borderColor: '#ced4da',
            color: '#6c757d'
          }
        }}
      />
    );
  };

  return (
    <Paper withBorder shadow="md" p="md">
      <Button onClick={handleBack} variant="light" leftSection={<IconArrowLeft />} mb="md">
        Kembali
      </Button>

      <Box component="form" onSubmit={form.onSubmit((values) => handleConfirmSubmit(values))}>
        <Text component="h2" fw="bold" fz="lg" mb="md">
          Disposisi Surat
        </Text>

        {/* Search Section */}
        <Grid mb="md">
          <Grid.Col span={4}>
            <TextInput
              value={searchAgenda}
              onChange={(event) => setSearchAgenda(event.currentTarget.value)}
              label="Nomor Agenda"
              placeholder="Ketik nomor agenda surat"
              onKeyPress={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  handleSearchLetter();
                }
              }}
            />
          </Grid.Col>

          <Grid.Col span={4}>
            <Select
              value={selectedYear}
              onChange={(value) => setSelectedYear(value || '2025')}
              label="Tahun"
              placeholder="Pilih tahun"
              data={yearOptions}
              searchable
            />
          </Grid.Col>

          <Grid.Col span={4}>
            <Button
              fullWidth
              variant="outline"
              mt="24"
              onClick={handleSearchLetter}
              loading={searchLoading || isLetterLoading}
              leftSection={<IconSearch size={16} />}
              style={{
                backgroundColor: '#f2f2f2',
                borderColor: '#a2a2a2',
                color: '#000',
              }}
            >
              {searchLoading || isLetterLoading ? 'Mencari...' : 'Cari'}
            </Button>
          </Grid.Col>
        </Grid>

        {/* Search attempted but no letter found */}
        {searchAttempted && !letterFound && !searchLoading && !isLetterLoading && (
          <Alert color="yellow" variant="light" mb="md">
            <Group gap="xs">
              <IconInfoCircle size={16} />
              <Text size="sm">
                Surat dengan nomor agenda <strong>{searchAgenda}</strong> tahun <strong>{selectedYear}</strong> tidak ditemukan.
              </Text>
            </Group>
          </Alert>
        )}

        {/* Data Surat Section */}
        <Box mb="lg">
          <TextInput
            value={letterData.noSurat}
            label="No Surat"
            placeholder="Akan terisi otomatis setelah pencarian"
            readOnly
            mb="md"
          />

          <TextInput
            value={letterData.suratDari}
            label="Surat Dari"
            placeholder="Akan terisi otomatis setelah pencarian"
            readOnly
            mb="md"
          />

          <TextInput
            value={letterData.perihal}
            label="Perihal"
            placeholder="Akan terisi otomatis setelah pencarian"
            readOnly
            mb="md"
          />

          <Grid mb="md">
            <Grid.Col span={6}>
              <TextInput
                value={letterData.tanggalSurat ? new Date(letterData.tanggalSurat).toLocaleDateString('id-ID') : ''}
                label="Tanggal Surat"
                placeholder="Akan terisi otomatis setelah pencarian"
                readOnly
              />
            </Grid.Col>
            <Grid.Col span={6}>
              <TextInput
                value={letterData.diterimaTanggal ? new Date(letterData.diterimaTanggal).toLocaleDateString('id-ID') : ''}
                label="Diterima Tanggal"
                placeholder="Akan terisi otomatis setelah pencarian"
                readOnly
              />
            </Grid.Col>
          </Grid>

          <TextInput
            value={letterData.kodeKlasifikasi}
            label="Kode Klasifikasi Surat"
            placeholder="Akan terisi otomatis setelah pencarian"
            readOnly
            mb="md"
          />

          <TextInput
            value={letterData.jenisSurat}
            label="Jenis Surat"
            placeholder="Akan terisi otomatis setelah pencarian"
            readOnly
            mb="md"
          />
        </Box>

        {/* Data Disposisi Section */}
        <Box mb="lg">
          <Text fw={600} mb="md" c="green">Data Disposisi</Text>

          {/* No Disposisi - Auto generated, no button needed */}
          <Box mb="md">
            {renderDisposisiNumber()}
          </Box>

          <DateInput
            {...form.getInputProps('tanggalDisposisi')}
            label="Tanggal Disposisi"
            placeholder="Pilih tanggal"
            valueFormat="DD-MM-YYYY"
            clearable
            mb="md"
          />

          <Box mb="md">
            <Text size="sm" fw={500} mb="sm">Didisposisikan Ke</Text>
            <Text size="xs" c="dimmed" mb="sm">Pilih tujuan disposisi (bisa lebih dari satu)</Text>

            <Checkbox.Group
              {...form.getInputProps('tujuanDisposisi')}
            >
              <Group mt="xs">
                {DEPARTMENT_OPTIONS.map((dept) => (
                  <Checkbox key={dept.value} value={dept.value} label={dept.label} />
                ))}
              </Group>
            </Checkbox.Group>

            {form.errors.tujuanDisposisi && (
              <Text size="xs" c="red" mt="xs">{form.errors.tujuanDisposisi}</Text>
            )}
          </Box>

          <Textarea
            {...form.getInputProps('isiDisposisi')}
            label="Isi Disposisi"
            placeholder="Tulis isi disposisi di sini"
            autosize
            minRows={4}
            mb="xs"
          />
          <Text size="xs" c="dimmed" mb="md">
            {form.values.isiDisposisi.length}/500 karakter
          </Text>
        </Box>

				{/* Action Buttons */}
				<Group justify="flex-start" gap="md" mt="lg">
					<Button
						type="submit"
						loading={loading}
						disabled={!letterFound}
					>
						{loading ? 'Menyimpan...' : 'Simpan'}
					</Button>
					<Button
						variant="outline"
						onClick={resetForm}
						style={{
							backgroundColor: '#f2f2f2',
              borderColor: '#a2a2a2',
              color: '#000',
						}}
					>
						Reset
					</Button>
				</Group>
      </Box>
    </Paper>
  );
}
