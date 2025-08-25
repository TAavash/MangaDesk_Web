export interface Folder {
  id: string;
  name: string;
  count: number;
  color?: string;
}

export interface Book {
  id: string;
  title: string;
  author?: string;
  genre?: string[];
  year?: number;
  publisher?: string;
  language?: string;
  status: 'reading' | 'completed' | 'plan-to-read' | 'dropped';
  progress?: number;
  totalChapters?: number;
  folderId: string;
  coverUrl?: string;
  rating?: number;
  notes?: string;
  tags?: string[];
  startDate?: string;
  finishDate?: string;
  dateAdded: string;
  lastRead?: string;
  favorite?: boolean;
  synopsis?: string;
}