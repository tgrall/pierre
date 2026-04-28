'use client';

import { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import type { NoteFlowData, Notebook, Note, NoteFlowSettings } from './types';
import * as store from './store';

export type CurrentView = 'all' | 'notebook' | 'tag' | 'trash' | 'search';

export interface UseNoteFlowReturn {
  // State
  notebooks: Notebook[];
  notes: Note[];
  settings: NoteFlowSettings;
  selectedNotebookId: string | null;
  selectedNoteId: string | null;
  searchQuery: string;
  selectedTag: string | null;
  currentView: CurrentView;
  filteredNotes: Note[];

  // Notebook CRUD
  createNotebook: (name: string) => Notebook;
  renameNotebook: (notebookId: string, name: string) => void;
  deleteNotebook: (notebookId: string) => void;

  // Note CRUD
  createNote: (notebookId: string, title?: string) => Note;
  updateNote: (noteId: string, changes: Partial<Pick<Note, 'title' | 'content' | 'plainText' | 'tags' | 'isPinned' | 'sortOrder' | 'notebookId'>>) => void;
  deleteNote: (noteId: string) => void;
  restoreNote: (noteId: string) => void;
  permanentDeleteNote: (noteId: string) => void;
  pinNote: (noteId: string, isPinned: boolean) => void;
  addTag: (noteId: string, tag: string) => void;
  removeTag: (noteId: string, tag: string) => void;

  // Navigation
  selectNotebook: (notebookId: string | null) => void;
  selectNote: (noteId: string | null) => void;
  setSearchQuery: (query: string) => void;
  selectTag: (tag: string | null) => void;
  setCurrentView: (view: CurrentView) => void;

  // Settings
  updateSettings: (changes: Partial<NoteFlowSettings>) => void;
}

function useNoteFlow(): UseNoteFlowReturn {
  const [data, setData] = useState<NoteFlowData | null>(null);
  const [selectedNotebookId, setSelectedNotebookId] = useState<string | null>(null);
  const [selectedNoteId, setSelectedNoteId] = useState<string | null>(null);
  const [searchQuery, setSearchQueryRaw] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [selectedTag, setSelectedTag] = useState<string | null>(null);
  const [currentView, setCurrentView] = useState<CurrentView>('all');

  // Refs for debounce timers
  const saveTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const searchTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // ---------------------------------------------------------------------------
  // Initialise from localStorage on mount
  // ---------------------------------------------------------------------------
  useEffect(() => {
    const loaded = store.loadData();
    setData(loaded);

    // Auto-select first notebook if available
    if (loaded.notebooks.length > 0) {
      setSelectedNotebookId(loaded.notebooks[0].id);
    }
  }, []);

  // ---------------------------------------------------------------------------
  // Debounced save (500 ms)
  // ---------------------------------------------------------------------------
  const scheduleAutoSave = useCallback((updated: NoteFlowData) => {
    if (saveTimerRef.current) clearTimeout(saveTimerRef.current);
    saveTimerRef.current = setTimeout(() => {
      store.saveData(updated);
    }, 500);
  }, []);

  // Cleanup timers on unmount
  useEffect(() => {
    return () => {
      if (saveTimerRef.current) clearTimeout(saveTimerRef.current);
      if (searchTimerRef.current) clearTimeout(searchTimerRef.current);
    };
  }, []);

  // ---------------------------------------------------------------------------
  // Search debounce (300 ms)
  // ---------------------------------------------------------------------------
  const setSearchQuery = useCallback((query: string) => {
    setSearchQueryRaw(query);

    if (searchTimerRef.current) clearTimeout(searchTimerRef.current);
    searchTimerRef.current = setTimeout(() => {
      setDebouncedSearch(query);
    }, 300);

    if (query.length > 0) {
      setCurrentView('search');
    } else {
      // Restore previous view context
      if (selectedTag) {
        setCurrentView('tag');
      } else if (selectedNotebookId) {
        setCurrentView('notebook');
      } else {
        setCurrentView('all');
      }
    }
  }, [selectedTag, selectedNotebookId]);

  // ---------------------------------------------------------------------------
  // Helper: apply mutation and persist immediately
  // ---------------------------------------------------------------------------
  const mutate = useCallback(
    (mutator: (current: NoteFlowData) => NoteFlowData) => {
      setData((prev) => {
        if (!prev) return prev;
        const next = mutator(prev);
        // Immediate save for CRUD; debounced auto-save for content edits
        store.saveData(next);
        return next;
      });
    },
    [],
  );

  const mutateDebounced = useCallback(
    (mutator: (current: NoteFlowData) => NoteFlowData) => {
      setData((prev) => {
        if (!prev) return prev;
        const next = mutator(prev);
        scheduleAutoSave(next);
        return next;
      });
    },
    [scheduleAutoSave],
  );

  // ---------------------------------------------------------------------------
  // Notebook CRUD
  // ---------------------------------------------------------------------------
  const createNotebook = useCallback(
    (name: string): Notebook => {
      let created: Notebook | null = null;
      mutate((d) => {
        const result = store.createNotebook(d, name);
        created = result.notebook;
        return result.data;
      });
      return created!;
    },
    [mutate],
  );

  const renameNotebook = useCallback(
    (notebookId: string, name: string) => {
      mutate((d) => store.renameNotebook(d, notebookId, name));
    },
    [mutate],
  );

  const deleteNotebook = useCallback(
    (notebookId: string) => {
      mutate((d) => store.deleteNotebook(d, notebookId));
      if (selectedNotebookId === notebookId) {
        setSelectedNotebookId(null);
        setSelectedNoteId(null);
        setCurrentView('all');
      }
    },
    [mutate, selectedNotebookId],
  );

  // ---------------------------------------------------------------------------
  // Note CRUD
  // ---------------------------------------------------------------------------
  const createNote = useCallback(
    (notebookId: string, title?: string): Note => {
      let created: Note | null = null;
      mutate((d) => {
        const result = store.createNote(d, notebookId, title);
        created = result.note;
        return result.data;
      });
      setSelectedNoteId(created!.id);
      return created!;
    },
    [mutate],
  );

  const updateNote = useCallback(
    (
      noteId: string,
      changes: Partial<Pick<Note, 'title' | 'content' | 'plainText' | 'tags' | 'isPinned' | 'sortOrder' | 'notebookId'>>,
    ) => {
      // Content edits use debounced save; metadata edits save immediately
      const isContentEdit = 'content' in changes || 'plainText' in changes;
      const apply = isContentEdit ? mutateDebounced : mutate;
      apply((d) => store.updateNote(d, noteId, changes));
    },
    [mutate, mutateDebounced],
  );

  const deleteNote = useCallback(
    (noteId: string) => {
      mutate((d) => store.deleteNote(d, noteId));
      if (selectedNoteId === noteId) {
        setSelectedNoteId(null);
      }
    },
    [mutate, selectedNoteId],
  );

  const restoreNote = useCallback(
    (noteId: string) => {
      mutate((d) => store.restoreNote(d, noteId));
    },
    [mutate],
  );

  const permanentDeleteNote = useCallback(
    (noteId: string) => {
      mutate((d) => store.permanentDeleteNote(d, noteId));
      if (selectedNoteId === noteId) {
        setSelectedNoteId(null);
      }
    },
    [mutate, selectedNoteId],
  );

  const pinNote = useCallback(
    (noteId: string, isPinned: boolean) => {
      mutate((d) => store.pinNote(d, noteId, isPinned));
    },
    [mutate],
  );

  const addTag = useCallback(
    (noteId: string, tag: string) => {
      mutate((d) => store.addTag(d, noteId, tag));
    },
    [mutate],
  );

  const removeTag = useCallback(
    (noteId: string, tag: string) => {
      mutate((d) => store.removeTag(d, noteId, tag));
    },
    [mutate],
  );

  // ---------------------------------------------------------------------------
  // Navigation
  // ---------------------------------------------------------------------------
  const selectNotebook = useCallback((notebookId: string | null) => {
    setSelectedNotebookId(notebookId);
    setSelectedNoteId(null);
    setSelectedTag(null);
    setSearchQueryRaw('');
    setDebouncedSearch('');
    setCurrentView(notebookId ? 'notebook' : 'all');
  }, []);

  const selectNote = useCallback((noteId: string | null) => {
    setSelectedNoteId(noteId);
  }, []);

  const selectTag = useCallback((tag: string | null) => {
    setSelectedTag(tag);
    setSelectedNoteId(null);
    setSelectedNotebookId(null);
    setSearchQueryRaw('');
    setDebouncedSearch('');
    setCurrentView(tag ? 'tag' : 'all');
  }, []);

  // ---------------------------------------------------------------------------
  // Settings
  // ---------------------------------------------------------------------------
  const updateSettingsFn = useCallback(
    (changes: Partial<NoteFlowSettings>) => {
      mutate((d) => store.updateSettings(d, changes));
    },
    [mutate],
  );

  // ---------------------------------------------------------------------------
  // Filtered notes
  // ---------------------------------------------------------------------------
  const filteredNotes = useMemo(() => {
    if (!data) return [];

    let result: Note[];

    switch (currentView) {
      case 'trash':
        result = data.notes.filter((n) => n.isDeleted);
        break;

      case 'notebook':
        result = data.notes.filter(
          (n) => !n.isDeleted && n.notebookId === selectedNotebookId,
        );
        break;

      case 'tag':
        result = data.notes.filter(
          (n) => !n.isDeleted && selectedTag && n.tags.includes(selectedTag),
        );
        break;

      case 'search': {
        const q = debouncedSearch.toLowerCase().trim();
        if (!q) {
          result = data.notes.filter((n) => !n.isDeleted);
        } else {
          result = data.notes.filter(
            (n) =>
              !n.isDeleted &&
              (n.title.toLowerCase().includes(q) ||
                n.plainText.toLowerCase().includes(q) ||
                n.tags.some((t) => t.toLowerCase().includes(q))),
          );
        }
        break;
      }

      case 'all':
      default:
        result = data.notes.filter((n) => !n.isDeleted);
        break;
    }

    // Sort: pinned first, then by sortOrder, then by updatedAt desc
    return result.sort((a, b) => {
      if (a.isPinned !== b.isPinned) return a.isPinned ? -1 : 1;
      if (a.sortOrder !== b.sortOrder) return a.sortOrder - b.sortOrder;
      return new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime();
    });
  }, [data, currentView, selectedNotebookId, selectedTag, debouncedSearch]);

  // ---------------------------------------------------------------------------
  // Return value
  // ---------------------------------------------------------------------------
  return {
    notebooks: data?.notebooks ?? [],
    notes: data?.notes ?? [],
    settings: data?.settings ?? { theme: 'system', isFirstLaunch: true },
    selectedNotebookId,
    selectedNoteId,
    searchQuery,
    selectedTag,
    currentView,
    filteredNotes,

    createNotebook,
    renameNotebook,
    deleteNotebook,

    createNote,
    updateNote,
    deleteNote,
    restoreNote,
    permanentDeleteNote,
    pinNote,
    addTag,
    removeTag,

    selectNotebook,
    selectNote,
    setSearchQuery,
    selectTag,
    setCurrentView,

    updateSettings: updateSettingsFn,
  };
}

export { useNoteFlow };
export default useNoteFlow;
