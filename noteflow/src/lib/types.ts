'use client';

export interface Notebook {
  id: string;
  name: string;
  createdAt: string;
  updatedAt: string;
  sortOrder: number;
}

export interface Note {
  id: string;
  notebookId: string;
  title: string;
  content: string; // HTML from TipTap
  plainText: string; // Plain text for search
  tags: string[];
  isPinned: boolean;
  isDeleted: boolean;
  deletedAt: string | null;
  createdAt: string;
  updatedAt: string;
  sortOrder: number;
}

export interface NoteFlowSettings {
  theme: 'dark' | 'light' | 'system';
  isFirstLaunch: boolean;
}

export interface NoteFlowData {
  settings: NoteFlowSettings;
  notebooks: Notebook[];
  notes: Note[];
}
