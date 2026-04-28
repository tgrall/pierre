'use client';

import { v4 as uuidv4 } from 'uuid';
import type { NoteFlowData, Notebook, Note, NoteFlowSettings } from './types';

const STORAGE_KEY = 'noteflow';

const DEFAULT_SETTINGS: NoteFlowSettings = {
  theme: 'system',
  isFirstLaunch: true,
};

// ---------------------------------------------------------------------------
// Sample data
// ---------------------------------------------------------------------------

function createSampleData(): NoteFlowData {
  const now = new Date().toISOString();
  const notebookId = uuidv4();

  const notebook: Notebook = {
    id: notebookId,
    name: 'Getting Started',
    createdAt: now,
    updatedAt: now,
    sortOrder: 0,
  };

  const welcomeNote: Note = {
    id: uuidv4(),
    notebookId,
    title: 'Welcome to NoteFlow',
    content:
      '<h2>Welcome to NoteFlow</h2>' +
      '<p>NoteFlow is your <strong>personal</strong> note-taking companion designed to help you capture ideas quickly and stay organized.</p>' +
      '<h3>Rich Text Editing</h3>' +
      '<p>Format your notes with ease using the built-in <em>TipTap</em> editor:</p>' +
      '<ul>' +
      '<li>Use <strong>bold</strong>, <em>italic</em>, and <u>underline</u> to emphasize text</li>' +
      '<li>Create <code>inline code</code> or full code blocks for technical notes</li>' +
      '<li>Add headings, bullet lists, and numbered lists</li>' +
      '<li>Highlight important passages with <mark>highlights</mark></li>' +
      '</ul>' +
      '<h3>Stay Organized</h3>' +
      '<p>Group related notes into <strong>notebooks</strong>, add <em>tags</em> for cross-cutting topics, and <strong>pin</strong> your most important notes to the top.</p>' +
      '<blockquote><p>Tip: Use the search bar to instantly find any note by title or content.</p></blockquote>',
    plainText:
      'Welcome to NoteFlow\n' +
      'NoteFlow is your personal note-taking companion designed to help you capture ideas quickly and stay organized.\n' +
      'Rich Text Editing\n' +
      'Format your notes with ease using the built-in TipTap editor:\n' +
      'Use bold, italic, and underline to emphasize text\n' +
      'Create inline code or full code blocks for technical notes\n' +
      'Add headings, bullet lists, and numbered lists\n' +
      'Highlight important passages with highlights\n' +
      'Stay Organized\n' +
      'Group related notes into notebooks, add tags for cross-cutting topics, and pin your most important notes to the top.\n' +
      'Tip: Use the search bar to instantly find any note by title or content.',
    tags: ['welcome', 'getting-started'],
    isPinned: true,
    isDeleted: false,
    deletedAt: null,
    createdAt: now,
    updatedAt: now,
    sortOrder: 0,
  };

  const taskNote: Note = {
    id: uuidv4(),
    notebookId,
    title: 'Task Management',
    content:
      '<h2>Task Management</h2>' +
      '<p>NoteFlow supports <strong>task lists</strong> so you can track your to-dos right inside your notes.</p>' +
      '<h3>Today\'s Tasks</h3>' +
      '<ul data-type="taskList">' +
      '<li data-type="taskItem" data-checked="true"><label><input type="checkbox" checked="checked"><span></span></label><div><p>Set up NoteFlow</p></div></li>' +
      '<li data-type="taskItem" data-checked="true"><label><input type="checkbox" checked="checked"><span></span></label><div><p>Create first notebook</p></div></li>' +
      '<li data-type="taskItem" data-checked="false"><label><input type="checkbox"><span></span></label><div><p>Organize notes with tags</p></div></li>' +
      '<li data-type="taskItem" data-checked="false"><label><input type="checkbox"><span></span></label><div><p>Try keyboard shortcuts</p></div></li>' +
      '<li data-type="taskItem" data-checked="false"><label><input type="checkbox"><span></span></label><div><p>Customize your theme</p></div></li>' +
      '</ul>' +
      '<h3>Project Ideas</h3>' +
      '<ul data-type="taskList">' +
      '<li data-type="taskItem" data-checked="false"><label><input type="checkbox"><span></span></label><div><p>Draft blog post outline</p></div></li>' +
      '<li data-type="taskItem" data-checked="false"><label><input type="checkbox"><span></span></label><div><p>Research competitor features</p></div></li>' +
      '<li data-type="taskItem" data-checked="false"><label><input type="checkbox"><span></span></label><div><p>Design landing page mockup</p></div></li>' +
      '</ul>' +
      '<p><em>Click a checkbox to mark a task as complete!</em></p>',
    plainText:
      'Task Management\n' +
      'NoteFlow supports task lists so you can track your to-dos right inside your notes.\n' +
      'Today\'s Tasks\n' +
      'Set up NoteFlow\n' +
      'Create first notebook\n' +
      'Organize notes with tags\n' +
      'Try keyboard shortcuts\n' +
      'Customize your theme\n' +
      'Project Ideas\n' +
      'Draft blog post outline\n' +
      'Research competitor features\n' +
      'Design landing page mockup\n' +
      'Click a checkbox to mark a task as complete!',
    tags: ['tasks', 'productivity'],
    isPinned: false,
    isDeleted: false,
    deletedAt: null,
    createdAt: now,
    updatedAt: now,
    sortOrder: 1,
  };

  const shortcutsNote: Note = {
    id: uuidv4(),
    notebookId,
    title: 'Keyboard Shortcuts',
    content:
      '<h2>Keyboard Shortcuts</h2>' +
      '<p>Speed up your workflow with these <strong>keyboard shortcuts</strong>:</p>' +
      '<h3>General</h3>' +
      '<ul>' +
      '<li><code>Ctrl/⌘ + N</code> — Create a new note</li>' +
      '<li><code>Ctrl/⌘ + Shift + N</code> — Create a new notebook</li>' +
      '<li><code>Ctrl/⌘ + F</code> — Search notes</li>' +
      '<li><code>Ctrl/⌘ + ,</code> — Open settings</li>' +
      '<li><code>Ctrl/⌘ + Delete</code> — Move note to trash</li>' +
      '</ul>' +
      '<h3>Text Formatting</h3>' +
      '<ul>' +
      '<li><code>Ctrl/⌘ + B</code> — <strong>Bold</strong></li>' +
      '<li><code>Ctrl/⌘ + I</code> — <em>Italic</em></li>' +
      '<li><code>Ctrl/⌘ + U</code> — <u>Underline</u></li>' +
      '<li><code>Ctrl/⌘ + E</code> — <code>Inline code</code></li>' +
      '<li><code>Ctrl/⌘ + Shift + H</code> — <mark>Highlight</mark></li>' +
      '<li><code>Ctrl/⌘ + Shift + X</code> — ~~Strikethrough~~</li>' +
      '</ul>' +
      '<h3>Blocks</h3>' +
      '<ul>' +
      '<li><code>Ctrl/⌘ + Shift + 1-6</code> — Heading levels 1-6</li>' +
      '<li><code>Ctrl/⌘ + Shift + 8</code> — Bullet list</li>' +
      '<li><code>Ctrl/⌘ + Shift + 9</code> — Ordered list</li>' +
      '<li><code>Ctrl/⌘ + Shift + C</code> — Code block</li>' +
      '<li><code>Ctrl/⌘ + Shift + B</code> — Blockquote</li>' +
      '</ul>' +
      '<blockquote><p>Pro tip: Most shortcuts follow the same patterns as popular text editors, so they should feel familiar!</p></blockquote>',
    plainText:
      'Keyboard Shortcuts\n' +
      'Speed up your workflow with these keyboard shortcuts:\n' +
      'General\n' +
      'Ctrl/⌘ + N — Create a new note\n' +
      'Ctrl/⌘ + Shift + N — Create a new notebook\n' +
      'Ctrl/⌘ + F — Search notes\n' +
      'Ctrl/⌘ + , — Open settings\n' +
      'Ctrl/⌘ + Delete — Move note to trash\n' +
      'Text Formatting\n' +
      'Ctrl/⌘ + B — Bold\n' +
      'Ctrl/⌘ + I — Italic\n' +
      'Ctrl/⌘ + U — Underline\n' +
      'Ctrl/⌘ + E — Inline code\n' +
      'Ctrl/⌘ + Shift + H — Highlight\n' +
      'Ctrl/⌘ + Shift + X — Strikethrough\n' +
      'Blocks\n' +
      'Ctrl/⌘ + Shift + 1-6 — Heading levels 1-6\n' +
      'Ctrl/⌘ + Shift + 8 — Bullet list\n' +
      'Ctrl/⌘ + Shift + 9 — Ordered list\n' +
      'Ctrl/⌘ + Shift + C — Code block\n' +
      'Ctrl/⌘ + Shift + B — Blockquote\n' +
      'Pro tip: Most shortcuts follow the same patterns as popular text editors, so they should feel familiar!',
    tags: ['tips', 'shortcuts'],
    isPinned: false,
    isDeleted: false,
    deletedAt: null,
    createdAt: now,
    updatedAt: now,
    sortOrder: 2,
  };

  return {
    settings: { ...DEFAULT_SETTINGS, isFirstLaunch: true },
    notebooks: [notebook],
    notes: [welcomeNote, taskNote, shortcutsNote],
  };
}

// ---------------------------------------------------------------------------
// Persistence helpers
// ---------------------------------------------------------------------------

export function loadData(): NoteFlowData {
  if (typeof window === 'undefined') {
    return createSampleData();
  }

  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      return JSON.parse(raw) as NoteFlowData;
    }
  } catch {
    console.error('Failed to load NoteFlow data from localStorage');
  }

  // First launch – seed with sample data
  const sample = createSampleData();
  saveData(sample);
  return sample;
}

export function saveData(data: NoteFlowData): void {
  if (typeof window === 'undefined') return;

  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  } catch {
    console.error('Failed to save NoteFlow data to localStorage');
  }
}

// ---------------------------------------------------------------------------
// Notebook CRUD
// ---------------------------------------------------------------------------

export function createNotebook(data: NoteFlowData, name: string): { data: NoteFlowData; notebook: Notebook } {
  const now = new Date().toISOString();
  const maxSort = data.notebooks.reduce((max, nb) => Math.max(max, nb.sortOrder), -1);

  const notebook: Notebook = {
    id: uuidv4(),
    name,
    createdAt: now,
    updatedAt: now,
    sortOrder: maxSort + 1,
  };

  const updated: NoteFlowData = {
    ...data,
    notebooks: [...data.notebooks, notebook],
  };

  saveData(updated);
  return { data: updated, notebook };
}

export function renameNotebook(data: NoteFlowData, notebookId: string, name: string): NoteFlowData {
  const now = new Date().toISOString();
  const updated: NoteFlowData = {
    ...data,
    notebooks: data.notebooks.map((nb) =>
      nb.id === notebookId ? { ...nb, name, updatedAt: now } : nb,
    ),
  };

  saveData(updated);
  return updated;
}

export function deleteNotebook(data: NoteFlowData, notebookId: string): NoteFlowData {
  const now = new Date().toISOString();
  const updated: NoteFlowData = {
    ...data,
    notebooks: data.notebooks.filter((nb) => nb.id !== notebookId),
    // Soft-delete all notes in that notebook
    notes: data.notes.map((note) =>
      note.notebookId === notebookId
        ? { ...note, isDeleted: true, deletedAt: now, updatedAt: now }
        : note,
    ),
  };

  saveData(updated);
  return updated;
}

// ---------------------------------------------------------------------------
// Note CRUD
// ---------------------------------------------------------------------------

export function createNote(
  data: NoteFlowData,
  notebookId: string,
  title = 'Untitled Note',
): { data: NoteFlowData; note: Note } {
  const now = new Date().toISOString();
  const notebookNotes = data.notes.filter((n) => n.notebookId === notebookId && !n.isDeleted);
  const maxSort = notebookNotes.reduce((max, n) => Math.max(max, n.sortOrder), -1);

  const note: Note = {
    id: uuidv4(),
    notebookId,
    title,
    content: '',
    plainText: '',
    tags: [],
    isPinned: false,
    isDeleted: false,
    deletedAt: null,
    createdAt: now,
    updatedAt: now,
    sortOrder: maxSort + 1,
  };

  const updated: NoteFlowData = {
    ...data,
    notes: [...data.notes, note],
  };

  saveData(updated);
  return { data: updated, note };
}

export function updateNote(
  data: NoteFlowData,
  noteId: string,
  changes: Partial<Pick<Note, 'title' | 'content' | 'plainText' | 'tags' | 'isPinned' | 'sortOrder' | 'notebookId'>>,
): NoteFlowData {
  const now = new Date().toISOString();
  const updated: NoteFlowData = {
    ...data,
    notes: data.notes.map((note) =>
      note.id === noteId ? { ...note, ...changes, updatedAt: now } : note,
    ),
  };

  saveData(updated);
  return updated;
}

export function deleteNote(data: NoteFlowData, noteId: string): NoteFlowData {
  const now = new Date().toISOString();
  const updated: NoteFlowData = {
    ...data,
    notes: data.notes.map((note) =>
      note.id === noteId
        ? { ...note, isDeleted: true, deletedAt: now, updatedAt: now }
        : note,
    ),
  };

  saveData(updated);
  return updated;
}

export function restoreNote(data: NoteFlowData, noteId: string): NoteFlowData {
  const now = new Date().toISOString();
  const updated: NoteFlowData = {
    ...data,
    notes: data.notes.map((note) =>
      note.id === noteId
        ? { ...note, isDeleted: false, deletedAt: null, updatedAt: now }
        : note,
    ),
  };

  saveData(updated);
  return updated;
}

export function permanentDeleteNote(data: NoteFlowData, noteId: string): NoteFlowData {
  const updated: NoteFlowData = {
    ...data,
    notes: data.notes.filter((note) => note.id !== noteId),
  };

  saveData(updated);
  return updated;
}

export function pinNote(data: NoteFlowData, noteId: string, isPinned: boolean): NoteFlowData {
  return updateNote(data, noteId, { isPinned });
}

export function addTag(data: NoteFlowData, noteId: string, tag: string): NoteFlowData {
  const note = data.notes.find((n) => n.id === noteId);
  if (!note || note.tags.includes(tag)) return data;

  return updateNote(data, noteId, { tags: [...note.tags, tag] });
}

export function removeTag(data: NoteFlowData, noteId: string, tag: string): NoteFlowData {
  const note = data.notes.find((n) => n.id === noteId);
  if (!note) return data;

  return updateNote(data, noteId, { tags: note.tags.filter((t) => t !== tag) });
}

// ---------------------------------------------------------------------------
// Settings
// ---------------------------------------------------------------------------

export function updateSettings(data: NoteFlowData, changes: Partial<NoteFlowSettings>): NoteFlowData {
  const updated: NoteFlowData = {
    ...data,
    settings: { ...data.settings, ...changes },
  };

  saveData(updated);
  return updated;
}
