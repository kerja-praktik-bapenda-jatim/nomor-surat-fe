"use client";

import { useEffect, useState, useCallback, useMemo } from 'react';
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
import { IconArrowLeft, IconInfoCircle, IconSearch, IconCheck, IconEdit } from '@tabler/icons-react';
import { modals } from '@mantine/modals';

import { useClassifications } from '@/services/data';
import { getCurrentUser, getTokenFromCookies } from '@/services/auth';
import {
  createDisposisi,
  useNextDisposisiNumberWithFallback,
  validateDisposisiData,
  getDisposisiFromLocalStorage,
  useLetterDispositionCheck,
  updateDisposisi
} from '@/services/disposisi';

// Constants
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

// Interfaces
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
  shouldSearch: boolean;
}

interface AppState {
  isSubmitting: boolean;
  isSubmitted: boolean;
  isEditMode: boolean;
  editingDisposisi: any | null;
  user: {
    userName: string;
    departmentName: string;
    isAdmin: boolean;
  };
}

// Initial state creators
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
  shouldSearch: false,
});

const createInitialAppState = (): AppState => ({
  isSubmitting: false,
  isSubmitted: false,
  isEditMode: false,
  editingDisposisi: null,
  user: {
    userName: "Guest",
    departmentName: "Unknown Department",
    isAdmin: false,
  },
});

// Utility functions
const formatDateToLocalString = (date: Date | null): string => {
  return date ?
    new Date(date)
      .toLocaleDateString('id-ID', { day: '2-digit', month: '2-digit', year: 'numeric' })
      .replace(/\//g, '-')
    : '';
};

// Form hook
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

// Modal helper class
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

  static showConfirmSubmit(onConfirm: () => void, isEdit: boolean = false) {
    modals.openConfirmModal({
      title: isEdit ? 'Konfirmasi Edit Disposisi' : 'Konfirmasi Buat Disposisi',
      centered: true,
      children: (
        <Text size="sm">
          Apakah Anda yakin data disposisi sudah benar?
        </Text>
      ),
      confirmProps: { children: isEdit ? 'Update Disposisi' : 'Buat Disposisi' },
      cancelProps: { children: 'Batal' },
      onConfirm,
    });
  }

  static showSuccessResult(
    response: any,
    onCreateAnother: () => void,
    onFinish: () => void,
    isEdit: boolean = false
  ) {
    const isLocalStorage = response.id?.startsWith('dispo_');

    modals.open({
      title: isEdit ? 'Berhasil' : (isLocalStorage ? 'Berhasil (Mode Offline)' : 'Berhasil'),
      centered: true,
      children: (
        <Box>
          <Text size="sm" mb="md">
            Disposisi berhasil diperbarui
          </Text>
          <Group justify="flex-end" gap="sm">
            {isLocalStorage && !isEdit && (
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

  static showError(error: any, isEdit: boolean = false) {
    let errorMessage = `Terjadi kesalahan saat ${isEdit ? 'mengupdate' : 'membuat'} disposisi.`;

    if (error.message) {
      errorMessage = error.message;
    } else if (error.response) {
      errorMessage = `HTTP ${error.response.status}: ${error.response.statusText}`;
    }

    if (isEdit && errorMessage.includes('sudah didisposisikan')) {
      errorMessage = 'Tidak dapat mengupdate disposisi. Silakan refresh halaman dan coba lagi.';
    }

    if (errorMessage.includes('404') || errorMessage.includes('Not Found')) {
      errorMessage += ' Saran: Periksa apakah backend sudah berjalan dan endpoint tersedia.';
    }

    modals.open({
      title: `Error ${isEdit ? 'Update' : 'Membuat'} Disposisi`,
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

  static showLetterAlreadyDisposed(
    letterDispositionData: any,
    resetFormCallback: () => void,
    onEditDisposisi: (disposisi: any) => void,
    userIsAdmin: boolean
  ) {
    modals.open({
      title: 'Surat Sudah Didisposisikan',
      centered: true,
      size: 'lg',
      styles: {
        inner: {
          padding: '0',
        },
        content: {
          borderRadius: '12px',
          width: '90vw',
          maxWidth: '800px',
        },
        header: {
          backgroundColor: '#f8f9fa',
          borderBottom: '1px solid #e9ecef',
          borderRadius: '12px 12px 0 0',
          padding: '16px 20px',
        },
        title: {
          fontWeight: 600,
          fontSize: '16px',
          color: '#495057',
        },
        body: {
          padding: '0',
        },
      },
      children: (
        <Box>
          {letterDispositionData.dispositions && letterDispositionData.dispositions.length > 0 && (
            <Box>
              <Box style={{ maxHeight: '400px', overflowY: 'auto', padding: '20px' }}>
                {letterDispositionData.dispositions.map((dispositionItem: any, index: number) => (
                  <Box
                    key={dispositionItem.id || index}
                    mb="lg"
                    style={{
                      backgroundColor: '#ffffff',
                      borderRadius: '8px',
                      border: '1px solid #e9ecef',
                      overflow: 'hidden',
                    }}
                  >
                    <Box
                      p="md"
                      style={{
                        backgroundColor: '#f8f9fa',
                        borderBottom: '1px solid #e9ecef',
                      }}
                    >
                      <Text size="sm" fw={600} c="#495057">
                        Detail Disposisi
                      </Text>
                    </Box>

                    <Box p="md">
                      <Box mb="md">
                        <Text size="xs" fw={500} c="dimmed" mb="xs" style={{ textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                          Nomor Disposisi
                        </Text>
                        <Text size="sm" style={{ lineHeight: 1.5 }}>
                          {dispositionItem.noDispo}
                        </Text>
                      </Box>

                      <Box mb="md">
                        <Text size="xs" fw={500} c="dimmed" mb="xs" style={{ textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                          Tanggal Disposisi
                        </Text>
                        <Text size="sm" style={{ lineHeight: 1.5 }}>
                          {dispositionItem.tglDispo ?
                            formatDateToLocalString(new Date(dispositionItem.tglDispo)) :
                            '-'
                          }
                        </Text>
                      </Box>

                      <Box mb="md">
                        <Text size="xs" fw={500} c="dimmed" mb="xs" style={{ textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                          Tujuan
                        </Text>
                        <Text size="sm" style={{ lineHeight: 1.5 }}>
                          {Array.isArray(dispositionItem.dispoKe) ?
                            dispositionItem.dispoKe.join(', ') :
                            'Tidak ada tujuan'
                          }
                        </Text>
                      </Box>

                      <Box mb="lg">
                        <Text size="xs" fw={500} c="dimmed" mb="xs" style={{ textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                          Isi Disposisi
                        </Text>
                        <Text size="sm" style={{ lineHeight: 1.5, color: '#495057' }}>
                          {dispositionItem.isiDispo || 'Tidak ada isi disposisi'}
                        </Text>
                      </Box>

                      {userIsAdmin ? (
                        <Button
                          size="sm"
                          variant="light"
                          color="blue"
                          leftSection={<IconEdit size={16} />}
                          onClick={() => {
                            modals.closeAll();
                            onEditDisposisi(dispositionItem);
                          }}
                          fullWidth
                          style={{
                            height: '36px',
                            borderRadius: '6px',
                            fontWeight: 500,
                          }}
                        >
                          Edit Disposisi
                        </Button>
                      ) : (
                        <Button
                          size="sm"
                          variant="light"
                          color="gray"
                          disabled
                          fullWidth
                          style={{
                            height: '36px',
                            borderRadius: '6px',
                            fontWeight: 500,
                          }}
                        >
                          Edit (Hanya Admin)
                        </Button>
                      )}
                    </Box>
                  </Box>
                ))}
              </Box>

              <Box
                p="md"
                style={{
                  backgroundColor: '#f8f9fa',
                  borderTop: '1px solid #e9ecef',
                  borderRadius: '0 0 12px 12px',
                }}
              >
                <Group justify="flex-end" gap="sm">
                  <Button
                    variant="outline"
                    color="gray"
                    size="sm"
                    onClick={() => {
                      modals.closeAll();
                      resetFormCallback();
                    }}
                    style={{
                      borderColor: '#ced4da',
                      color: '#6c757d',
                      fontWeight: 500,
                    }}
                  >
                    Cari Surat Lain
                  </Button>
                  <Button
                    onClick={() => modals.closeAll()}
                    size="sm"
                    style={{
                      backgroundColor: '#007bff',
                      fontWeight: 500,
                    }}
                  >
                    Tutup
                  </Button>
                </Group>
              </Box>
            </Box>
          )}
        </Box>
      )
    });
  }
}

// Main component
export function DisposisiLetterForm() {
  // State management
  const [letterData, setLetterData] = useState<LetterData>(createInitialLetterData);
  const [searchState, setSearchState] = useState<SearchState>(createInitialSearchState);
  const [appState, setAppState] = useState<AppState>(createInitialAppState);
  const [isiDisposisiText, setIsiDisposisiText] = useState<string>('');

  const router = useRouter();
  const form = useDisposisiForm();

  // API hooks
  const { data: classificationsData, isLoading: isClassificationsLoading } = useClassifications();
  const {
    data: nextDisposisiData,
    isLoading: isNextDisposisiLoading,
    refetch: refetchNextDisposisi
  } = useNextDisposisiNumberWithFallback();

  const shouldEnableLetterCheck = useMemo(() => {
    return searchState.shouldSearch && Boolean(searchState.agenda.trim());
  }, [searchState.shouldSearch, searchState.agenda]);

  const {
    data: letterDispositionData,
    isLoading: isCheckingDisposition,
    error: dispositionCheckError,
  } = useLetterDispositionCheck(
    searchState.year,
    searchState.agenda,
    shouldEnableLetterCheck
  );

  // State update callbacks
  const updateSearchState = useCallback((updates: Partial<SearchState>) => {
    setSearchState(prev => {
      const newState = { ...prev, ...updates };
      if (JSON.stringify(prev) !== JSON.stringify(newState)) {
        return newState;
      }
      return prev;
    });
  }, []);

  const updateAppState = useCallback((updates: Partial<AppState>) => {
    setAppState(prev => {
      const newState = { ...prev, ...updates };
      if (JSON.stringify(prev) !== JSON.stringify(newState)) {
        return newState;
      }
      return prev;
    });
  }, []);

  // Event handlers
  const handleEditDisposisi = useCallback((disposisi: any) => {
    if (!appState.user.isAdmin) {
      ModalHelpers.showWarning('Akses ditolak. Hanya admin yang dapat mengedit disposisi.');
      return;
    }

    form.setValues({
      noDisposisi: disposisi.noDispo,
      tanggalDisposisi: new Date(disposisi.tglDispo),
      tujuanDisposisi: Array.isArray(disposisi.dispoKe) ? disposisi.dispoKe : [],
      isiDisposisi: disposisi.isiDispo || '',
    });

    setIsiDisposisiText(disposisi.isiDispo || '');
    updateAppState({
      isEditMode: true,
      editingDisposisi: disposisi
    });
  }, [form, updateAppState, appState.user.isAdmin]);

  const handleCancelEdit = useCallback(() => {
    updateAppState({
      isEditMode: false,
      editingDisposisi: null
    });
    form.reset();
    setIsiDisposisiText('');
  }, [form, updateAppState]);

  const resetForm = useCallback(() => {
    form.reset();
    setLetterData(createInitialLetterData());
    setSearchState(createInitialSearchState());
    updateAppState({
      isSubmitted: false,
      isEditMode: false,
      editingDisposisi: null
    });
    setIsiDisposisiText('');

    setTimeout(() => {
      refetchNextDisposisi();
    }, 100);
  }, [form, updateAppState, refetchNextDisposisi]);

  const handleSearchLetter = useCallback(async () => {
    if (!searchState.agenda.trim()) {
      ModalHelpers.showWarning('Masukkan nomor agenda terlebih dahulu');
      return;
    }

    updateSearchState({
      isLoading: true,
      isFound: false,
      isAttempted: false,
      shouldSearch: false,
    });

    updateAppState({
      isSubmitted: false,
      isEditMode: false,
      editingDisposisi: null
    });
    setLetterData(createInitialLetterData());

    try {
      await new Promise(resolve => setTimeout(resolve, 100));
      updateSearchState({
        shouldSearch: true,
        isAttempted: true
      });
    } catch (error) {
      updateSearchState({
        isAttempted: true,
        shouldSearch: false
      });
    } finally {
      updateSearchState({ isLoading: false });
    }
  }, [searchState.agenda, searchState.year, updateSearchState, updateAppState]);

  const handleAgendaChange = useCallback((value: string) => {
    updateSearchState({
      agenda: value,
      shouldSearch: false,
      isAttempted: false,
      isFound: false
    });
    setLetterData(createInitialLetterData());
  }, [updateSearchState]);

  const handleIsiDisposisiChange = useCallback((event: React.ChangeEvent<HTMLTextAreaElement>) => {
    const value = event.currentTarget.value;
    setIsiDisposisiText(value);
    form.setFieldValue('isiDisposisi', value);
  }, [form]);

  const handleConfirmSubmit = useCallback((values: FormValues) => {
    if (letterDispositionData?.isDisposed && !appState.isEditMode) {
      ModalHelpers.showWarning('Surat ini sudah didisposisikan. Silakan pilih surat lain atau edit disposisi yang ada.');
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

    ModalHelpers.showConfirmSubmit(() => handleSubmit(submitValues), appState.isEditMode);
  }, [letterData.letterIn_id, letterDispositionData?.isDisposed, isiDisposisiText, appState.isEditMode]);

  const handleBack = useCallback(() => {
    router.push('/suratin');
  }, [router]);

  const handleSubmit = useCallback(async (values: FormValues) => {
    updateAppState({ isSubmitting: true });

    try {
      const requestData = {
        letterIn_id: letterData.letterIn_id,
        noDispo: values.noDisposisi as number,
        tglDispo: values.tanggalDisposisi.toISOString(),
        dispoKe: values.tujuanDisposisi,
        isiDispo: values.isiDisposisi.trim(),
      };

      let response;
      if (appState.isEditMode && appState.editingDisposisi?.id) {
        response = await updateDisposisi(appState.editingDisposisi.id, requestData);
      } else {
        response = await createDisposisi(requestData);
      }

      updateAppState({ isSubmitted: true });

      if (!appState.isEditMode) {
        await refetchNextDisposisi();
      }

      ModalHelpers.showSuccessResult(
        response,
        () => {
          modals.closeAll();
          resetForm();
        },
        () => {
          modals.closeAll();
          handleBack();
        },
        appState.isEditMode
      );

    } catch (error: any) {
      ModalHelpers.showError(error, appState.isEditMode);
    } finally {
      updateAppState({ isSubmitting: false });
    }
  }, [letterData.letterIn_id, refetchNextDisposisi, resetForm, handleBack, appState.isEditMode, appState.editingDisposisi, updateAppState]);

  // Effects
  useEffect(() => {
    const currentUser = getCurrentUser();
    updateAppState({ user: currentUser });

    fetch('http://localhost:8080/api/disposisi-letterin/next-number', {
      headers: { 'Authorization': `Bearer ${getTokenFromCookies()}` }
    })
      .then(res => res.json())
      .then(data => console.log('✅ Disposisi endpoint test successful:', data))
      .catch(err => console.error('❌ Disposisi endpoint test failed:', err));
  }, [updateAppState]);

  useEffect(() => {
    if (nextDisposisiData?.noDispo && !appState.isEditMode && !form.getValues().noDisposisi) {
      form.setFieldValue('noDisposisi', nextDisposisiData.noDispo);
    }
  }, [nextDisposisiData?.noDispo, appState.isEditMode, form]);

  useEffect(() => {
    if (letterDispositionData && shouldEnableLetterCheck) {
      if (letterDispositionData.error) {
        updateSearchState({ isFound: false, isAttempted: true, shouldSearch: false });
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

        updateSearchState({ isFound: true, isAttempted: true, shouldSearch: false });

        if (letterDispositionData.isDisposed) {
          setTimeout(() => {
            ModalHelpers.showLetterAlreadyDisposed(
              letterDispositionData,
              resetForm,
              handleEditDisposisi,
              appState.user.isAdmin
            );
          }, 100);
        }
      }
    }
  }, [letterDispositionData, shouldEnableLetterCheck, updateSearchState, resetForm, handleEditDisposisi, appState.user.isAdmin]);

  useEffect(() => {
    if (dispositionCheckError && shouldEnableLetterCheck) {
      updateSearchState({ isFound: false, isAttempted: true, shouldSearch: false });
      setLetterData(createInitialLetterData());
    }
  }, [dispositionCheckError, shouldEnableLetterCheck, updateSearchState]);

  // Render methods
  const renderDisposisiNumber = () => {
    if (appState.isEditMode) {
      return (
        <Box>
          <Text size="sm" fw={500} mb={5}>Nomor Disposisi (Mode Edit)</Text>
          <TextInput
            value={form.values.noDisposisi?.toString() || ''}
            placeholder="Nomor disposisi"
            readOnly
            styles={{
              input: {
                backgroundColor: '#fff3cd',
                borderColor: '#ffc107',
                color: '#856404'
              }
            }}
          />
        </Box>
      );
    }

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
          disabled={appState.isEditMode}
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
          disabled={appState.isEditMode}
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
          disabled={appState.isEditMode}
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
    if (appState.isEditMode) {
      return (
        <Alert color="blue" variant="light" mb="md">
          <Group gap="xs">
            <IconEdit size={16} />
            <Text size="sm" fw={500}>
              Mode Edit Disposisi
            </Text>
          </Group>
          <Text size="xs" c="dimmed" mt="xs">
            Anda sedang mengedit disposisi nomor: {appState.editingDisposisi?.noDispo}
          </Text>
          <Group mt="sm">
            <Button
              size="xs"
              variant="light"
              color="red"
              onClick={handleCancelEdit}
            >
              Batal Edit
            </Button>
          </Group>
        </Alert>
      );
    }

    if (!searchState.isAttempted || !letterDispositionData) return null;

    if (letterDispositionData.isDisposed) {
      return (
        <Alert color="red" variant="light" mb="md">
          <Group gap="xs">
            <IconInfoCircle size={16} />
            <Text size="sm" fw={500}>
              Surat sudah didisposisikan
            </Text>
          </Group>
          <Text size="xs" c="dimmed" mt="xs">
            Surat ini sudah pernah didisposisi. {appState.user.isAdmin ? 'Anda dapat mengedit disposisi yang ada.' : 'Hanya admin yang dapat mengedit disposisi.'}
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
              Surat dapat didisposisi
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
      <Text fw={600} mb="md" c="green">
        Data Disposisi {appState.isEditMode ? '(Mode Edit)' : ''}
      </Text>

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
        disabled={(!searchState.isFound || letterDispositionData?.isDisposed) && !appState.isEditMode}
        color={appState.isEditMode ? "blue" : undefined}
      >
        {appState.isSubmitting ?
          (appState.isEditMode ? 'Mengupdate...' : 'Menyimpan...') :
          (appState.isEditMode ? 'Update Disposisi' : 'Simpan')
        }
      </Button>
      <Button
        variant="outline"
        onClick={appState.isEditMode ? handleCancelEdit : resetForm}
        style={{
          backgroundColor: '#f2f2f2',
          borderColor: '#a2a2a2',
          color: '#000',
        }}
      >
        {appState.isEditMode ? 'Batal Edit' : 'Reset'}
      </Button>
    </Group>
  );

  // Main render
  return (
    <Paper withBorder shadow="md" p="md">
      <Button onClick={handleBack} variant="light" leftSection={<IconArrowLeft />} mb="md">
        Kembali
      </Button>

      <Box component="form" onSubmit={form.onSubmit(handleConfirmSubmit)}>
        <Text component="h2" fw="bold" fz="lg" mb="md">
          {appState.isEditMode ? 'Edit Disposisi Surat' : 'Disposisi Surat'}
        </Text>

        {renderSearchSection()}
        {renderDispositionStatus()}

        {searchState.isAttempted && !searchState.isFound && !searchState.isLoading && !isCheckingDisposition && !appState.isEditMode && (
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
