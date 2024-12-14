export interface Letters {
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

export interface LetterResponse{
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

export interface UpdateLetterResponse{
  subject: string;
  to: string;
  attachmentCount: string;
  departmentId: string;
  classificationId: string;
  levelId: string;
  description: string;
  file: File | null;
};

export interface SpareLetters{
  date: string | null;
  spareCounts: string;
}

export interface InputExport{
  startDate: string;
  endDate: string;
  departmentId: string;
  classificationId: string;
}