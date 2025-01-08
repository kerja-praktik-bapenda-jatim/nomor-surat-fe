export interface Letters {
  id: string;
  date: string;
  number: number;
  subject: string;
  to: string;
  filename: string;
  reserved: boolean;
  attachmentCount: string;
  description: string;
  departmentId: string;
  lastReserved: string;
  documentIndexName: string;
  createdAt: string;
  updatedAt: string;
  classificationId: string;
  levelId: string;
  updateUserId: string;
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
  CreateUser: {
    username: string;
  };
  UpdateUser: {
    username: string;
  };
  userId: string;
}

export interface LetterResponse{
  id: string;
  date: string;
  reserved: string;
  attachmentCount: number;
  userId: string;
  departmentId: string;
  subject: string;
  to: string;
  classificationId: string;
  levelId: string;
  description: string;
  filename: string;
  updatedAt: string;
  createdAt: string;
  number: string;
  documentIndexName: string;
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
}

export interface UpdateLetterResponse{
  subject: string;
  to: string;
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
  file: File | null;
};

export interface SpareLetters{
  date: string | null;
  spareCounts: string;
  departmentId: string;
}

export interface InputExport{
  startDate: string;
  endDate: string;
  departmentId: string;
  classificationId: string;
}