export interface Nota {
  id: string;
  date: string;
  number: number;
  subject: string;
  to: string;
  filename: string;
  reserved: string;
  attachmentCount: string;
  description: string;
  departmentId: string;
  lastReserved: string;
  createdAt: string;
  updatedAt: string;
  classificationId: string;
  levelId: string;
  Level: {
    name: string;
  },
  Classification: {
    name: string;
  }
  userId: string;
}

export interface NotaResponse{
  id: string;
  date: string;
  reserved: string;
  attachmentCount: string;
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

export interface UpdateNotaResponse{
  subject: string;
  to: string;
  attachmentCount: string;
  departmentId: string;
  classificationId: string;
  levelId: string;
  description: string;
  file: File | null;
};

export interface SpareNota{
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