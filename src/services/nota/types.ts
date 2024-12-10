export interface Nota {
  id: string;
  date: string;
  number: number;
  subject: string;
  to: string;
  filename: string;
  reserved: string;
  createdAt: string;
  updatedAt: string;
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
  filePath: string;
  updatedAt: string;
  createdAt: string;
  number: string;
  Level: {
    name: string;
  };
  Classification: {
    name: string;
  };
}

export interface UpdateNotaResponse{
  subject: string;
  to: string;
  file: File | null;
};

export interface SpareNota{
  date: string | null;
  spareCounts: string;
}

export interface InputExport{
  startDate: string;
  endDate: string;
}