export interface Letter {
  id: string;
  noAgenda: number;
  tahun: number;
  noSurat: string;
  suratDari: string;
  perihal: string;
  tglSurat: string;
  diterimaTgl: string;
  filename?: string;
  Classification?: { id: string; name: string };
  LetterType?: { id: string; name: string };
}

export interface CreateDisposisiPayload {
  letterIn_id: string;
  noDispo: number;
  tglDispo: string;
  dispoKe: string[];
  isiDispo: string;
}

export interface LetterDispositionCheck {
  isDisposed: boolean;
  dispositions?: Disposisi[];
  letter?: Letter;
  error?: string;
}

export interface NextDisposisiNumber {
  noDispo: number;
}

export interface Disposisi {
  id: string;
  noDispo: number;
  tglDispo: string;
  dispoKe: string[];
  isiDispo: string;
  letterIn_id: string;
  createdAt: string;
  updatedAt: string;
  userId: string;
  updateUserId: string;
  LetterIn: LetterInDetail;
  CreateUser: UserBasic;
  UpdateUser: UserBasic;
}

export interface LetterInDetail {
  id: string;
  tahun: number;
  noAgenda: number;
  noSurat: string;
  suratDari: string;
  perihal: string;
  tglSurat: string;
  diterimaTgl: string;
  ditujukanKe: string;
  classificationId: string;
  letterTypeId: string;
  Classification: Classification;
  LetterType: LetterType;
}

export interface UserBasic {
  username: string;
}

export interface Classification {
  id: string;
  name: string;
}

export interface LetterType {
  id: string;
  name: string;
}

export interface DisposisiResponse {
  id: string;
  noDispo: number;
  tglDispo: string;
  dispoKe: string[];
  isiDispo: string;
  letterIn_id: string;
  createdAt: string;
  updatedAt: string;
  userId: string;
  LetterIn: LetterInDetail;
}

export interface DisposisiListResponse {
  data: Disposisi[];
  pagination: PaginationInfo;
  success: boolean;
}

export interface PaginationInfo {
  currentPage: number;
  totalPages: number;
  totalRows: number;
  rowsPerPage: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
  nextPage: number | null;
  prevPage: number | null;
}

export interface LetterSearchResponse {
  id: string;
  tahun: number;
  noAgenda: number;
  noSurat: string;
  suratDari: string;
  perihal: string;
  tglSurat: string;
  diterimaTgl: string;
  langsungKe: boolean;
  ditujukanKe: string;
  agenda: boolean;
  classificationId: string;
  letterTypeId: string;
  filename: string | null;
  filePath: string | null;
  createdAt: string;
  updatedAt: string;
  Classification: Classification;
  LetterType: LetterType;
  Agenda?: AgendaInfo;
}

export interface AgendaInfo {
  id: string;
  tglMulai: string;
  tglSelesai: string;
  jamMulai: string;
  jamSelesai: string;
  tempat: string;
  acara: string;
  catatan: string;
  letterIn_id: string;
}

export interface CreateDisposisiRequest {
  noDispo?: number;
  tglDispo: string;
  dispoKe: string[];
  isiDispo: string;
  letterIn_id: string;
}

export interface UpdateDisposisiRequest {
  noDispo?: number;
  tglDispo?: string;
  dispoKe?: string[];
  isiDispo?: string;
  letterIn_id?: string;
}

export interface DisposisiExportRequest {
  startDate: string;
  endDate: string;
  letterIn_id?: string;
  departmentName?: string;
  status?: DisposisiStatusFilter;
}

export interface DisposisiStatsResponse {
  totalDisposisi: number;
  disposisiHariIni: number;
  disposisiMingguIni: number;
  disposisiBulanIni: number;
  departmentStats: DepartmentStats[];
}

export interface DepartmentStats {
  departmentName: string;
  count: number;
}

export enum DisposisiStatus {
  DRAFT = 'draft',
  SENT = 'sent',
  COMPLETED = 'completed',
  CANCELLED = 'cancelled'
}

export type DisposisiStatusFilter = 'active' | 'completed' | 'all';

export interface DepartmentOption {
  value: string;
  label: string;
}

export const DEPARTMENT_OPTIONS: readonly DepartmentOption[] = [
  { value: 'SEKRETARIAT', label: 'Sekretariat' },
  { value: 'BIDANG PAJAK DAERAH', label: 'Bidang Pajak Daerah' },
  { value: 'BIDANG PERENCANAAN DAN PENGEMBANGAN', label: 'Bidang Perencanaan dan Pengembangan' },
  { value: 'BIDANG RETRIBUSI DAN PENDAPATAN LAIN-LAIN', label: 'Bidang Retribusi dan Pendapatan Lain-lain' },
  { value: 'BIDANG PENGENDALIAN DAN PEMBINAAN', label: 'Bidang Pengendalian dan Pembinaan' },
] as const;

export interface DisposisiTracking {
  id: string;
  disposisiId: string;
  departmentName: string;
  status: DisposisiStatus;
  tglTerima?: string;
  tglSelesai?: string;
  catatan?: string;
  createdAt: string;
  updatedAt: string;
}

export type DisposisiFormData = Omit<CreateDisposisiRequest, 'letterIn_id'> & {
  letterIn_id?: string;
};

export type DisposisiWithoutRelations = Omit<Disposisi, 'LetterIn' | 'CreateUser' | 'UpdateUser'>;
export type DepartmentValue = typeof DEPARTMENT_OPTIONS[number]['value'];

export const isValidDepartment = (value: string): value is DepartmentValue => {
  return DEPARTMENT_OPTIONS.some(option => option.value === value);
};

export const isDisposisiComplete = (disposisi: Disposisi): boolean => {
  return Boolean(
    disposisi.noDispo &&
    disposisi.tglDispo &&
    disposisi.dispoKe.length > 0 &&
    disposisi.isiDispo &&
    disposisi.letterIn_id
  );
};

export const createEmptyDisposisi = (): DisposisiFormData => ({
  noDispo: 0,
  tglDispo: new Date().toISOString().split('T')[0],
  dispoKe: [],
  isiDispo: '',
});

export const createDefaultPagination = (): PaginationInfo => ({
  currentPage: 1,
  totalPages: 1,
  totalRows: 0,
  rowsPerPage: 10,
  hasNextPage: false,
  hasPrevPage: false,
  nextPage: null,
  prevPage: null,
});

export default DEPARTMENT_OPTIONS;
