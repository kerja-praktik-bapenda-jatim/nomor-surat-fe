"use client";

import { useEffect, useState, useCallback } from 'react';
import { useRouter } from "next/navigation";
import {
  Button,
  TextInput,
  Text,
  Box,
  Paper,
  Select,
  Grid,
  Checkbox,
  Textarea,
  Group,
  Alert,
} from '@mantine/core';
import { hasLength, useForm } from '@mantine/form';
import { DateInput } from '@mantine/dates';
import { IconArrowLeft, IconInfoCircle, IconSearch, IconCheck } from '@tabler/icons-react';
import { modals } from '@mantine/modals';

import { useClassifications } from '@/services/data';
import { getCurrentUser, getTokenFromCookies } from '@/services/auth';
import {
  createDisposisi,
  useNextDisposisiNumberWithFallback,
  validateDisposisiData,
  getDisposisiFromLocalStorage,
  useLetterDispositionCheck
} from '@/services/disposisi';

const DEPARTMENT_OPTIONS = [
  { value: 'SEKRETARIAT', label: 'Sekretariat' },
  { value: 'BIDANG PAJAK DAERAH', label: 'Bidang Pajak Daerah' },
  { value: 'BIDANG PERENCANAAN DAN PENGEMBANGAN', label: 'Bidang Perencanaan dan Pengembangan' },
  { value: 'BIDANG RETRIBUSI DAN PENDAPATAN LAIN-LAIN', label: 'Bidang Retribusi dan Pendapatan Lain-lain' },
  { value: 'BIDANG PENGENDALIAN DAN PEMBINAAN', label: 'Bidang Pengendalian dan Pembinaan' },
] as const;

const CURRENT_YEAR = new Date().getFullYear();
const YEAR_OPTIONS = Array.from({ length: 11 }, (_, i) => {
  const year = CURRENT_YEAR - 5 + i;
  return { value: year.toString(), label: year.toString() };
});

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
  filename: string;
}

interface SearchState {
  agenda: string;
  year: string;
  isLoading: boolean;
  isAttempted: boolean;
  isFound: boolean;
  isEnabled: boolean;
  shouldSearch: boolean;
}

interface AppState {
  isSubmitting: boolean;
  isSubmitted: boolean;
  user: {
    userName: string;
    departmentName: string;
    isAdmin: boolean;
  };
}

const createInitialLetterData = (): LetterData => ({
  letterIn_id: '',
  noSurat: '',
  suratDari: '',
  perihal: '',
  tanggalSurat: null,
  diterimaTanggal: null,
  kodeKlasifikasi: '',
  jenisSurat: '',
  filename: '',
});

const createInitialSearchState = (): SearchState => ({
  agenda: '',
  year: CURRENT_YEAR.toString(),
  isLoading: false,
  isAttempted: false,
  isFound: false,
  isEnabled: false,
  shouldSearch: false,
});

const createInitialAppState = (): AppState => ({
  isSubmitting: false,
  isSubmitted: false,
  user: {
    userName: "Guest",
    departmentName: "Unknown Department",
    isAdmin: false,
  },
});

const useDisposisiForm = () => {
  return useForm<FormValues>({
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
};

const formatDateToLocalString = (date: Date | null): string => {
  return date ?
    new Date(date)
      .toLocaleDateString('id-ID', { day: '2-digit', month: '2-digit', year: 'numeric' })
      .replace(/\//g, '-')
    : '';
};

const logDebug = (message: string, data?: any) => {
  console.log(`🔍 ${message}`, data);
};

const logSuccess = (message: string, data?: any) => {
  console.log(`✅ ${message}`, data);
};

const logError = (message: string, error?: any) => {
  console.error(`❌ ${message}`, error);
};

const logWarning = (message: string, data?: any) => {
  console.warn(`⚠️ ${message}`, data);
};

class ModalHelpers {
  static showWarning(message: string) {
    modals.open({
      title: 'Peringatan',
      centered: true,
      children: <Text size="sm">{message}</Text>,
    });
  }

  static showValidationErrors(errors: string[]) {
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
  }

  static showConfirmSubmit(onConfirm: () => void) {
    modals.openConfirmModal({
      title: 'Konfirmasi Buat Disposisi',
      centered: true,
      children: (
        <Text size="sm">Apakah Anda yakin data disposisi sudah benar?</Text>
      ),
      confirmProps: { children: 'Buat Disposisi' },
      cancelProps: { children: 'Batal' },
      onConfirm,
    });
  }

  static showSuccessResult(
    response: any,
    onCreateAnother: () => void,
    onFinish: () => void
  ) {
    const isLocalStorage = response.id?.startsWith('dispo_');

    modals.open({
      title: isLocalStorage ? 'Berhasil (Mode Offline)' : 'Berhasil',
      centered: true,
      children: (
        <Box>
          <Text size="sm" mb="md">
            Disposisi berhasil {isLocalStorage ? 'disimpan secara lokal' : 'dibuat'}
            dengan nomor: <strong>{response.noDispo}</strong>
          </Text>

          <Group justify="flex-end" gap="sm">
            {isLocalStorage && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => this.showSavedData()}
              >
                Lihat Data
              </Button>
            )}
            <Button onClick={onFinish}>
              Selesai
            </Button>
          </Group>
        </Box>
      )
    });
  }

  static showSavedData() {
    const saved = getDisposisiFromLocalStorage();
    modals.open({
      title: 'Data Tersimpan',
      children: (
        <Box>
          <Text size="sm" mb="sm">Total disposisi tersimpan: {saved.length}</Text>
          {saved.slice(-3).map((item, index) => (
            <Text key={index} size="xs" c="dimmed">
              • No.{item.noDispo} - {formatDateToLocalString(new Date(item.createdAt))}
            </Text>
          ))}
        </Box>
      )
    });
  }

  static showError(error: any) {
    let errorMessage = "Terjadi kesalahan saat membuat disposisi.";

    if (error.message) {
      errorMessage = error.message;
    } else if (error.response) {
      errorMessage = `HTTP ${error.response.status}: ${error.response.statusText}`;
    }

    if (errorMessage.includes('404') || errorMessage.includes('Not Found')) {
      errorMessage += 'Saran: Periksa apakah backend sudah berjalan dan endpoint /api/disposisi tersedia.';
    }

    modals.open({
      title: 'Error Membuat Disposisi',
      centered: true,
      children: (
        <Box>
          <Text size="sm" style={{ whiteSpace: 'pre-line' }}>{errorMessage}</Text>
          <Button onClick={() => modals.closeAll()} mt="md" fullWidth>
            OK
          </Button>
        </Box>
      )
    });
  }

  static showLetterAlreadyDisposed(letterDispositionData: any, resetFormCallback: () => void) {
    modals.open({
      title: '⚠️ Surat Sudah Didisposisikan',
      centered: true,
      size: 'md',
      children: (
        <Box>
          <Alert color="yellow" variant="light" mb="md">
            <Group gap="xs">
              <IconInfoCircle size={20} />
              <Text size="sm" fw={500}>
                Surat ini sudah pernah didisposisikan sebelumnya
              </Text>
            </Group>
          </Alert>

          {letterDispositionData.dispositions && letterDispositionData.dispositions.length > 0 && (
            <Box mb="md">
              <Text size="sm" mb="xs"><strong>Detail Disposisi:</strong></Text>
              {letterDispositionData.dispositions.map((dispositionItem: any, index: number) => (
                <Box key={dispositionItem.id || index} mb="sm" p="sm" style={{ backgroundColor: '#f8f9fa', borderRadius: '4px' }}>
                  <Text size="sm" c="dimmed">Nomor Disposisi: <strong>{dispositionItem.noDispo}</strong></Text>
                  <Text size="sm" c="dimmed">
                    Tanggal: <strong>
                      {dispositionItem.tglDispo ?
                        formatDateToLocalString(new Date(dispositionItem.tglDispo)) :
                        '-'
                      }
                    </strong>
                  </Text>
                  <Text size="sm" c="dimmed">
                    Tujuan: <strong>
                      {Array.isArray(dispositionItem.dispoKe) ?
                        dispositionItem.dispoKe.join(', ') :
                        '-'
                      }
                    </strong>
                  </Text>
                  <Text size="sm" c="dimmed">
                    Isi: <strong>{dispositionItem.isiDispo || '-'}</strong>
                  </Text>
                </Box>
              ))}
            </Box>
          )}

          <Group justify="flex-end" gap="sm">
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                modals.closeAll();
                resetFormCallback();
              }}
            >
              Cari Surat Lain
            </Button>
            <Button
              size="sm"
              onClick={() => modals.closeAll()}
            >
              Tutup
            </Button>
          </Group>
        </Box>
      )
    });
  }
}

export function DisposisiLetterForm() {
  const [letterData, setLetterData] = useState<LetterData>(createInitialLetterData);
  const [searchState, setSearchState] = useState<SearchState>(createInitialSearchState);
  const [appState, setAppState] = useState<AppState>(createInitialAppState);
  const [isiDisposisiText, setIsiDisposisiText] = useState<string>('');

  const router = useRouter();
  const form = useDisposisiForm();

  const { data: classificationsData, isLoading: isClassificationsLoading } = useClassifications();

  const {
    data: nextDisposisiData,
    isLoading: isNextDisposisiLoading,
    refetch: refetchNextDisposisi
  } = useNextDisposisiNumberWithFallback();

  const {
    data: letterDispositionData,
    isLoading: isCheckingDisposition,
    error: dispositionCheckError,
    refetch: refetchLetterCheck
  } = useLetterDispositionCheck(
    searchState.year,
    searchState.agenda,
    searchState.shouldSearch && Boolean(searchState.agenda)
  );

  const updateSearchState = useCallback((updates: Partial<SearchState>) => {
    setSearchState(prev => ({ ...prev, ...updates }));
  }, []);

  const updateAppState = useCallback((updates: Partial<AppState>) => {
    setAppState(prev => ({ ...prev, ...updates }));
  }, []);

  useEffect(() => {
    const currentUser = getCurrentUser();
    updateAppState({ user: currentUser });
    refetchNextDisposisi();

    logDebug('Component mounted, resetting search state...');
    setSearchState(createInitialSearchState());
    setLetterData(createInitialLetterData());

    logDebug('Testing disposisi-letterin endpoint...');
    fetch('http://localhost:8080/api/disposisi-letterin/next-number', {
      headers: { 'Authorization': `Bearer ${getTokenFromCookies()}` }
    })
      .then(res => res.json())
      .then(data => logSuccess('Disposisi endpoint test successful:', data))
      .catch(err => logError('Disposisi endpoint test failed:', err));
  }, [refetchNextDisposisi]);

  useEffect(() => {
    if (nextDisposisiData?.noDispo && !form.getValues().noDisposisi) {
      logDebug('Setting initial nomor disposisi:', nextDisposisiData.noDispo);
      form.setFieldValue('noDisposisi', nextDisposisiData.noDispo);
    }
  }, [nextDisposisiData?.noDispo]);

  const resetForm = useCallback(() => {
    logDebug('Resetting disposisi form...');

    form.reset();
    setLetterData(createInitialLetterData());
    setSearchState(createInitialSearchState());
    updateAppState({ isSubmitted: false });
    setIsiDisposisiText('');

    setTimeout(() => {
      refetchNextDisposisi();
    }, 100);

    logSuccess('Disposisi form reset completed');
  }, [refetchNextDisposisi]);

  useEffect(() => {
    if (letterDispositionData && searchState.shouldSearch) {
      logDebug('Letter disposition check result:', letterDispositionData);

      if (letterDispositionData.error) {
        updateSearchState({ isFound: false, isAttempted: true });
        setLetterData(createInitialLetterData());
        return;
      }

      if (letterDispositionData.letter) {
        setLetterData({
          letterIn_id: letterDispositionData.letter.id || '',
          noSurat: letterDispositionData.letter.noSurat || '',
          suratDari: letterDispositionData.letter.suratDari || '',
          perihal: letterDispositionData.letter.perihal || '',
          tanggalSurat: letterDispositionData.letter.tglSurat ? new Date(letterDispositionData.letter.tglSurat) : null,
          diterimaTanggal: letterDispositionData.letter.diterimaTgl ? new Date(letterDispositionData.letter.diterimaTgl) : null,
          kodeKlasifikasi: letterDispositionData.letter.Classification?.name || '',
          jenisSurat: letterDispositionData.letter.LetterType?.name || '',
          filename: letterDispositionData.letter.filename || '',
        });

        updateSearchState({ isFound: true, isAttempted: true });

        if (letterDispositionData.isDisposed) {
          logWarning('Letter already disposed, showing warning');

          setTimeout(() => {
            ModalHelpers.showLetterAlreadyDisposed(letterDispositionData, () => {
              form.reset();
              setLetterData(createInitialLetterData());
              setSearchState(createInitialSearchState());
              updateAppState({ isSubmitted: false });
              setIsiDisposisiText('');
              setTimeout(() => refetchNextDisposisi(), 100);
            });
          }, 100);
        } else {
          logSuccess('Letter found and not disposed, ready for disposition');
        }
      }
    }
  }, [letterDispositionData, searchState.shouldSearch]);

  useEffect(() => {
    if (dispositionCheckError && searchState.shouldSearch) {
      logError('Letter disposition check error, clearing data');
      updateSearchState({ isFound: false, isAttempted: true });
      setLetterData(createInitialLetterData());
    }
  }, [dispositionCheckError, searchState.shouldSearch]);

  const handleSearchLetter = useCallback(async () => {
    if (!searchState.agenda.trim()) {
      ModalHelpers.showWarning('Masukkan nomor agenda terlebih dahulu');
      return;
    }

    logDebug('Starting manual search...', { year: searchState.year, agenda: searchState.agenda });

    updateSearchState({
      isLoading: true,
      isFound: false,
      isAttempted: false,
      shouldSearch: false,
    });

    updateAppState({ isSubmitted: false });
    setLetterData(createInitialLetterData());

    try {
      await new Promise(resolve => setTimeout(resolve, 100));

      logDebug('Triggering disposition check...');
      updateSearchState({
        shouldSearch: true,
        isAttempted: true
      });

      logSuccess('Manual search initiated');
    } catch (error) {
      logError('Search error:', error);
      updateSearchState({
        isAttempted: true,
        shouldSearch: false
      });
    } finally {
      updateSearchState({ isLoading: false });
    }
  }, [searchState.agenda, searchState.year]);

  const handleAgendaChange = useCallback((value: string) => {
    updateSearchState({
      agenda: value,
      shouldSearch: false,
      isAttempted: false,
      isFound: false
    });
    setLetterData(createInitialLetterData());
  }, []);

  const handleIsiDisposisiChange = useCallback((event: React.ChangeEvent<HTMLTextAreaElement>) => {
    const value = event.currentTarget.value;
    setIsiDisposisiText(value);
    form.setFieldValue('isiDisposisi', value);
  }, []);

  const handleConfirmSubmit = useCallback((values: FormValues) => {
    if (letterDispositionData?.isDisposed) {
      ModalHelpers.showWarning('Surat ini sudah didisposisikan. Silakan pilih surat lain.');
      return;
    }

    const submitValues = {
      ...values,
      isiDisposisi: isiDisposisiText
    };

    const errors = validateDisposisiData({
      letterIn_id: letterData.letterIn_id,
      tglDispo: submitValues.tanggalDisposisi.toISOString(),
      dispoKe: submitValues.tujuanDisposisi,
      isiDispo: submitValues.isiDisposisi,
      noDispo: submitValues.noDisposisi as number,
    });

    if (errors.length > 0) {
      ModalHelpers.showValidationErrors(errors);
      return;
    }

    ModalHelpers.showConfirmSubmit(() => handleSubmit(submitValues));
  }, [letterData.letterIn_id, letterDispositionData?.isDisposed, isiDisposisiText]);

  const handleBack = useCallback(() => {
    router.push('/suratin');
  }, [router]);

  const handleSubmit = useCallback(async (values: FormValues) => {
    updateAppState({ isSubmitting: true });
    logDebug('Starting disposisi creation...');

    try {
      const requestData = {
        letterIn_id: letterData.letterIn_id,
        noDispo: values.noDisposisi as number,
        tglDispo: values.tanggalDisposisi.toISOString(),
        dispoKe: values.tujuanDisposisi,
        isiDispo: values.isiDisposisi.trim(),
      };

      logDebug('Sending disposisi data:', requestData);
      const response = await createDisposisi(requestData);
      logSuccess('Disposisi created:', response);

      updateAppState({ isSubmitted: true });

      logDebug('Refreshing next disposisi number...');
      await refetchNextDisposisi();

      ModalHelpers.showSuccessResult(
        response,
        () => {
          modals.closeAll();
          resetForm();
        },
        () => {
          modals.closeAll();
          handleBack();
        }
      );

    } catch (error: any) {
      logError('Submit error details:', error);
      ModalHelpers.showError(error);
    } finally {
      updateAppState({ isSubmitting: false });
    }
  }, [letterData.letterIn_id, refetchNextDisposisi, resetForm, handleBack]);

  const renderDisposisiNumber = () => {
    const displayNumber = form.values.noDisposisi || nextDisposisiData?.noDispo;

    if (displayNumber) {
      return (
        <Box>
          <Text size="sm" fw={500} mb={5}>Nomor Disposisi</Text>
          <TextInput
            value={displayNumber.toString()}
            placeholder="Nomor sequential"
            readOnly
          />
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

  const renderSearchSection = () => (
    <Grid mb="md">
      <Grid.Col span={4}>
        <TextInput
          value={searchState.agenda}
          onChange={(event) => handleAgendaChange(event.currentTarget.value)}
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
          value={searchState.year}
          onChange={(value) => updateSearchState({
            year: value || CURRENT_YEAR.toString(),
            shouldSearch: false,
            isAttempted: false,
            isFound: false
          })}
          label="Tahun"
          placeholder="Pilih tahun"
          data={YEAR_OPTIONS}
          searchable
        />
      </Grid.Col>

      <Grid.Col span={4}>
        <Button
          fullWidth
          variant="outline"
          mt="24"
          onClick={handleSearchLetter}
          loading={searchState.isLoading || isCheckingDisposition}
          leftSection={<IconSearch size={16} />}
          style={{
            backgroundColor: '#f2f2f2',
            borderColor: '#a2a2a2',
            color: '#000',
          }}
        >
          {searchState.isLoading || isCheckingDisposition ? 'Mencari...' : 'Cari'}
        </Button>
      </Grid.Col>
    </Grid>
  );

  const renderDispositionStatus = () => {
    if (!searchState.isAttempted || !letterDispositionData) return null;

    if (letterDispositionData.isDisposed) {
      return (
        <Alert color="red" variant="light" mb="md">
          <Group gap="xs">
            <IconInfoCircle size={16} />
            <Text size="sm" fw={500}>
              ⚠️ Surat sudah didisposisikan
            </Text>
          </Group>
          <Text size="xs" c="dimmed" mt="xs">
            Surat ini tidak dapat didisposisi lagi karena sudah pernah didisposisi sebelumnya.
          </Text>
        </Alert>
      );
    }

    if (searchState.isFound && letterData.letterIn_id) {
      return (
        <Alert color="green" variant="light" mb="md">
          <Group gap="xs">
            <IconCheck size={16} />
            <Text size="sm" fw={500}>
              ✅ Surat dapat didisposisi
            </Text>
          </Group>
          <Text size="xs" c="dimmed" mt="xs">
            Surat ditemukan dan belum pernah didisposisi. Anda dapat melanjutkan proses disposisi.
          </Text>
        </Alert>
      );
    }

    return null;
  };

  const renderLetterDataSection = () => (
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
            value={formatDateToLocalString(letterData.tanggalSurat)}
            label="Tanggal Surat"
            placeholder="Akan terisi otomatis setelah pencarian"
            readOnly
          />
        </Grid.Col>
        <Grid.Col span={6}>
          <TextInput
            value={formatDateToLocalString(letterData.diterimaTanggal)}
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

      <TextInput
        value={letterData.filename}
        label="File Digital"
        placeholder="Akan terisi otomatis setelah pencarian"
        readOnly
        mb="md"
      />
    </Box>
  );

  const renderDisposisiSection = () => (
    <Box mb="lg">
      <Text fw={600} mb="md" c="green">Data Disposisi</Text>

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

        <Checkbox.Group {...form.getInputProps('tujuanDisposisi')}>
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
        value={isiDisposisiText}
        onChange={handleIsiDisposisiChange}
        error={form.errors.isiDisposisi}
        label="Isi Disposisi"
        placeholder="Tulis isi disposisi di sini"
        autosize
        minRows={4}
        mb="xs"
      />
      <Text size="xs" c="dimmed" mb="md">
        {isiDisposisiText.length}/500 karakter
      </Text>
    </Box>
  );

  const renderActionButtons = () => (
    <Group justify="flex-start" gap="md" mt="lg">
      <Button
        type="submit"
        loading={appState.isSubmitting}
        disabled={!searchState.isFound || letterDispositionData?.isDisposed}
      >
        {appState.isSubmitting ? 'Menyimpan...' : 'Simpan'}
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
  );

  return (
    <Paper withBorder shadow="md" p="md">
      <Button onClick={handleBack} variant="light" leftSection={<IconArrowLeft />} mb="md">
        Kembali
      </Button>

      <Box component="form" onSubmit={form.onSubmit(handleConfirmSubmit)}>
        <Text component="h2" fw="bold" fz="lg" mb="md">
          Disposisi Surat
        </Text>

        {renderSearchSection()}
        {renderDispositionStatus()}
        {searchState.isAttempted && !searchState.isFound && !searchState.isLoading && !isCheckingDisposition && (
          <Alert color="yellow" variant="light" mb="md">
            <Group gap="xs">
              <IconInfoCircle size={16} />
              <Text size="sm">
                Surat dengan nomor agenda <strong>{searchState.agenda}</strong> tahun <strong>{searchState.year}</strong> tidak ditemukan.
              </Text>
            </Group>
          </Alert>
        )}
        {renderLetterDataSection()}
        {renderDisposisiSection()}
        {renderActionButtons()}
      </Box>
    </Paper>
  );
}
