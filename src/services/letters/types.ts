export interface Letters {
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

export interface LetterResponse{
  id: string;
  date: string;
  reserved: string;
  userId: string;
  subject: string;
  to: string;
  filename: string;
  filePath: string;
  updatedAt: string;
  createdAt: string;
  number: string;
}