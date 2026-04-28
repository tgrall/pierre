'use client';

import React, { useEffect, useMemo, useState, useCallback } from 'react';
import useNoteFlow from '../lib/useNoteFlow';
import Header from '../components/Header';
import Sidebar from '../components/Sidebar';
import NotesList from '../components/NotesList';
import Editor from '../components/Editor';
import ConfirmDialog from '../components/ConfirmDialog';

export default function Home() {
  const nf = useNoteFlow();
  const [mounted, setMounted] = useState(false);
  const [mobilePanel, setMobilePanel] = useState<'sidebar' | 'list' | 'editor'>('sidebar');
  const [confirmDialog, setConfirmDialog] = useState<{
    isOpen: boolean;
    title: string;
    message: string;
    variant?: 'danger' | 'default';
    onConfirm: () => void;
  }>({ isOpen: false, title: '', message: '', onConfirm: () => {} });

  useEffect(() => {
    setMounted(true);
  }, []);

  // Apply theme to document
  useEffect(() => {
    if (!mounted) return;
    const root = document.documentElement;
    if (nf.settings.theme === 'dark') {
      root.classList.add('dark');
    } else if (nf.settings.theme === 'light') {
      root.classList.remove('dark');
    } else {
      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      if (prefersDark) {
        root.classList.add('dark');
      } else {
        root.classList.remove('dark');
      }
    }
  }, [nf.settings.theme, mounted]);

  // Keyboard shortcuts
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      const isCmd = e.metaKey || e.ctrlKey;
      if (isCmd && e.key === 'n' && !e.shiftKey) {
        e.preventDefault();
        handleCreateNote();
      }
      if (isCmd && e.shiftKey && e.key === 'N') {
        e.preventDefault();
        handleCreateNotebook();
      }
      if (isCmd && e.key === 'f') {
        e.preventDefault();
        const el = document.querySelector<HTMLInputElement>('[data-search-input]');
        el?.focus();
      }
      if (e.key === 'Escape') {
        if (nf.searchQuery) nf.setSearchQuery('');
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  });

  const contextName = useMemo(() => {
    switch (nf.currentView) {
      case 'all': return 'All Notes';
      case 'notebook': {
        const nb = nf.notebooks.find((n) => n.id === nf.selectedNotebookId);
        return nb?.name ?? 'Notebook';
      }
      case 'tag': return nf.selectedTag ? `#${nf.selectedTag}` : 'Tags';
      case 'trash': return 'Trash';
      case 'search': return 'Search Results';
      default: return 'Notes';
    }
  }, [nf.currentView, nf.notebooks, nf.selectedNotebookId, nf.selectedTag]);

  const allTags = useMemo(() => {
    const s = new Set<string>();
    nf.notes.filter((n) => !n.isDeleted).forEach((n) => n.tags.forEach((t) => s.add(t)));
    return Array.from(s).sort();
  }, [nf.notes]);

  const selectedNote = useMemo(() => {
    if (!nf.selectedNoteId) return null;
    return nf.notes.find((n) => n.id === nf.selectedNoteId) ?? null;
  }, [nf.selectedNoteId, nf.notes]);

  const handleCreateNotebook = useCallback(() => {
    const nb = nf.createNotebook('Untitled Notebook');
    nf.selectNotebook(nb.id);
    setMobilePanel('list');
  }, [nf]);

  const handleCreateNote = useCallback(() => {
    const notebookId = nf.selectedNotebookId || nf.notebooks[0]?.id;
    if (!notebookId) {
      const nb = nf.createNotebook('My Notebook');
      nf.createNote(nb.id);
    } else {
      nf.createNote(notebookId);
    }
    setMobilePanel('editor');
  }, [nf]);

  const handleDeleteNotebook = useCallback((id: string) => {
    const nb = nf.notebooks.find((n) => n.id === id);
    setConfirmDialog({
      isOpen: true,
      title: 'Delete Notebook',
      message: `Are you sure you want to delete "${nb?.name}"? All notes will be moved to Trash.`,
      variant: 'danger',
      onConfirm: () => {
        nf.deleteNotebook(id);
        setConfirmDialog((d) => ({ ...d, isOpen: false }));
      },
    });
  }, [nf]);

  const handlePermanentDelete = useCallback((id: string) => {
    setConfirmDialog({
      isOpen: true,
      title: 'Permanently Delete',
      message: 'This note will be permanently deleted. This action cannot be undone.',
      variant: 'danger',
      onConfirm: () => {
        nf.permanentDeleteNote(id);
        setConfirmDialog((d) => ({ ...d, isOpen: false }));
      },
    });
  }, [nf]);

  const handleToggleTheme = useCallback(() => {
    const next = nf.settings.theme === 'dark' ? 'light' : 'dark';
    nf.updateSettings({ theme: next });
  }, [nf]);

  const handleSelectNote = useCallback((id: string) => {
    nf.selectNote(id);
    setMobilePanel('editor');
  }, [nf]);

  const handleSelectNotebook = useCallback((id: string) => {
    nf.selectNotebook(id);
    setMobilePanel('list');
  }, [nf]);

  const handleSelectAllNotes = useCallback(() => {
    nf.selectNotebook(null);
    nf.setCurrentView('all');
    setMobilePanel('list');
  }, [nf]);

  const handleSelectTag = useCallback((tag: string) => {
    nf.selectTag(tag);
    setMobilePanel('list');
  }, [nf]);

  const handleSelectTrash = useCallback(() => {
    nf.setCurrentView('trash');
    setMobilePanel('list');
  }, [nf]);

  if (!mounted) {
    return (
      <div className="h-screen flex items-center justify-center bg-white dark:bg-[#1A1A2E]">
        <div className="text-gray-400 text-lg">Loading NoteFlow...</div>
      </div>
    );
  }

  return (
    <div className="h-screen flex flex-col bg-white dark:bg-[#1A1A2E]">
      <Header
        searchQuery={nf.searchQuery}
        onSearchChange={nf.setSearchQuery}
        theme={nf.settings.theme}
        onToggleTheme={handleToggleTheme}
      />

      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar */}
        <div className={`${mobilePanel === 'sidebar' ? 'flex' : 'hidden'} md:flex w-full md:w-56 lg:w-60 flex-shrink-0 border-r border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-[#16213E] flex-col overflow-y-auto`}>
          <Sidebar
            notebooks={nf.notebooks}
            notes={nf.notes}
            selectedNotebookId={nf.selectedNotebookId}
            currentView={nf.currentView}
            selectedTag={nf.selectedTag}
            onSelectAllNotes={handleSelectAllNotes}
            onSelectNotebook={handleSelectNotebook}
            onSelectTag={handleSelectTag}
            onSelectTrash={handleSelectTrash}
            onCreateNotebook={handleCreateNotebook}
            onRenameNotebook={nf.renameNotebook}
            onDeleteNotebook={handleDeleteNotebook}
          />
        </div>

        {/* Notes List */}
        <div className={`${mobilePanel === 'list' ? 'flex' : 'hidden'} md:flex w-full md:w-64 lg:w-72 flex-shrink-0 border-r border-gray-200 dark:border-gray-700 bg-white dark:bg-[#1A1A2E] flex-col overflow-hidden`}>
          <button
            className="md:hidden flex items-center gap-1 px-3 py-2 text-sm text-indigo-600 dark:text-indigo-400 hover:bg-gray-100 dark:hover:bg-gray-800"
            onClick={() => setMobilePanel('sidebar')}
          >
            ← Back to sidebar
          </button>
          <NotesList
            notes={nf.filteredNotes}
            selectedNoteId={nf.selectedNoteId}
            currentView={nf.currentView}
            contextName={contextName}
            onSelectNote={handleSelectNote}
            onCreateNote={handleCreateNote}
            onDeleteNote={nf.deleteNote}
            onRestoreNote={nf.restoreNote}
            onPermanentDeleteNote={handlePermanentDelete}
            onPinNote={(id) => {
              const note = nf.notes.find((n) => n.id === id);
              if (note) nf.pinNote(id, !note.isPinned);
            }}
            searchQuery={nf.searchQuery}
          />
        </div>

        {/* Editor */}
        <div className={`${mobilePanel === 'editor' ? 'flex' : 'hidden'} md:flex flex-1 flex-col overflow-hidden bg-white dark:bg-[#1A1A2E]`}>
          <button
            className="md:hidden flex items-center gap-1 px-3 py-2 text-sm text-indigo-600 dark:text-indigo-400 hover:bg-gray-100 dark:hover:bg-gray-800"
            onClick={() => setMobilePanel('list')}
          >
            ← Back to notes
          </button>
          <Editor
            note={selectedNote}
            allTags={allTags}
            onUpdateNote={nf.updateNote}
            onAddTag={nf.addTag}
            onRemoveTag={nf.removeTag}
          />
        </div>
      </div>

      <ConfirmDialog
        isOpen={confirmDialog.isOpen}
        title={confirmDialog.title}
        message={confirmDialog.message}
        variant={confirmDialog.variant}
        onConfirm={confirmDialog.onConfirm}
        onCancel={() => setConfirmDialog((d) => ({ ...d, isOpen: false }))}
      />
    </div>
  );
}
