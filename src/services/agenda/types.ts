export interface Letters {
  id: string;
  date: string;
  number: string;
  subject: string;
  to: string;
  from: string;
  place: string;
  event: string;
  filename: string;
  reserved: boolean;
  attachmentCount: number;
  description: string;
  departmentId: string;
  lastReserved: string;
  documentIndexName: string;
  createdAt: string;
  updatedAt: string;
  classificationId: string;
  levelId: string;
  updateUserId: string;
  startDate: string;
  endDate: string;
  noSurat: string;
  noAgenda: string;
  tglSurat: string;
  diterimaTgl: string;
  startTime: string;
  endTime: string;
  addToAgenda: boolean;
  directTo: boolean;
  targetDepartment: string | null;
  activeRetentionPeriodId: string;
  inactiveRetentionPeriodId: string;
  jraDescriptionId: string;
  storageLocationId: string;
  accessId: string;
  Level: {
    name: string;
  };
  Classification: {
    name: string;
  };
  StorageLocation: {
    name: string;
  };
  JraDescription: {
    name: string;
  };
  ActiveRetentionPeriod: {
    name: string;
  };
  InactiveRetentionPeriod: {
    name: string;
  };
  Access: {
    name: string;
  };
  Department: {
    name: string;
  };
  CreateUser: {
    username: string;
  };
  UpdateUser: {
    username: string;
  };
  userId: string;
}

export interface LetterResponse {
  id: string;
  date: string;
  reserved: string;
  attachmentCount: number;
  userId: string;
  departmentId: string;
  subject: string;
  to: string;
  from: string;
  place: string;
  event: string;
  classificationId: string;
  levelId: string;
  description: string;
  filename: string;
  updatedAt: string;
  createdAt: string;
  number: string;
  noSurat: string;
  noAgenda: string;
  documentIndexName: string;
  activeRetentionPeriodId: string;
  inactiveRetentionPeriodId: string;
  jraDescriptionId: string;
  storageLocationId: string;
  accessId: string;
  startDate: string;
  endDate: string;
  tglSurat: string;
  diterimaTgl: string;
  startTime: string;
  endTime: string;
  addToAgenda: boolean;
  directTo: boolean;
  targetDepartment: string | null;
  Level: {
    name: string;
  };
  Classification: {
    name: string;
  };
  StorageLocation: {
    name: string;
  };
  JraDescription: {
    name: string;
  };
  ActiveRetentionPeriod: {
    name: string;
  };
  InactiveRetentionPeriod: {
    name: string;
  };
  Access: {
    name: string;
  };
  Department: {
    name: string;
  };
}

export interface UpdateLetterResponse {
  subject: string;
  to: string;
  from: string;
  place: string;
  event: string;
  attachmentCount: number;
  departmentId: string;
  classificationId: string;
  levelId: string;
  description: string;
  accessId: string;
  documentIndexName: string;
  activeRetentionPeriodId: string;
  inactiveRetentionPeriodId: string;
  jraDescriptionId: string;
  storageLocationId: string;
  noSurat: string;
  noAgenda: string;
  startDate: string;
  endDate: string;
  tglSurat: string;
  diterimaTgl: string;
  startTime: string;
  endTime: string;
  addToAgenda: boolean;
  directTo: boolean;
  targetDepartment: string | null;
  file: File | null;
  archiveFile: File | null;
};

export interface SpareLetters {
  date: string | null;
  spareCounts: string;
  departmentId: string;
}

export interface InputExport {
  startDate: string;
  endDate: string;
  departmentId: string;
  classificationId: string;
}
