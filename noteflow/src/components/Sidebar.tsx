'use client';

import React, { useState, useRef, useEffect } from 'react';
import {
  BookOpen,
  Tag,
  Trash2,
  Plus,
  MoreVertical,
  FileText,
  ChevronLeft,
} from 'lucide-react';
import type { Notebook, Note } from '../lib/types';

interface SidebarProps {
  notebooks: Notebook[];
  notes: Note[];
  selectedNotebookId: string | null;
  currentView: string;
  selectedTag: string | null;
  onSelectAllNotes: () => void;
  onSelectNotebook: (id: string) => void;
  onSelectTag: (tag: string) => void;
  onSelectTrash: () => void;
  onCreateNotebook: () => void;
  onRenameNotebook: (id: string, name: string) => void;
  onDeleteNotebook: (id: string) => void;
}

export default function Sidebar({
  notebooks,
  notes,
  selectedNotebookId,
  currentView,
  selectedTag,
  onSelectAllNotes,
  onSelectNotebook,
  onSelectTag,
  onSelectTrash,
  onCreateNotebook,
  onRenameNotebook,
  onDeleteNotebook,
}: SidebarProps) {
  const [editingNotebookId, setEditingNotebookId] = useState<string | null>(null);
  const [editingName, setEditingName] = useState('');
  const [contextMenuId, setContextMenuId] = useState<string | null>(null);
  const [contextMenuPos, setContextMenuPos] = useState({ x: 0, y: 0 });
  const editInputRef = useRef<HTMLInputElement>(null);
  const contextMenuRef = useRef<HTMLDivElement>(null);

  const activeNotes = notes.filter((n) => !n.isDeleted);
  const totalCount = activeNotes.length;
  const trashedCount = notes.filter((n) => n.isDeleted).length;

  // Gather all tags with counts
  const tagCounts = activeNotes.reduce<Record<string, number>>((acc, note) => {
    note.tags.forEach((tag) => {
      acc[tag] = (acc[tag] || 0) + 1;
    });
    return acc;
  }, {});
  const tagEntries = Object.entries(tagCounts).sort(([a], [b]) =>
    a.localeCompare(b)
  );

  const notebookNoteCounts = notebooks.reduce<Record<string, number>>((acc, nb) => {
    acc[nb.id] = activeNotes.filter((n) => n.notebookId === nb.id).length;
    return acc;
  }, {});

  // Focus input when editing
  useEffect(() => {
    if (editingNotebookId) editInputRef.current?.focus();
  }, [editingNotebookId]);

  // Close context menu on outside click
  useEffect(() => {
    if (!contextMenuId) return;
    const handler = (e: MouseEvent) => {
      if (
        contextMenuRef.current &&
        !contextMenuRef.current.contains(e.target as Node)
      ) {
        setContextMenuId(null);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [contextMenuId]);

  const startRename = (id: string, currentName: string) => {
    setEditingNotebookId(id);
    setEditingName(currentName);
    setContextMenuId(null);
  };

  const commitRename = () => {
    if (editingNotebookId && editingName.trim()) {
      onRenameNotebook(editingNotebookId, editingName.trim());
    }
    setEditingNotebookId(null);
    setEditingName('');
  };

  const handleContextMenu = (
    e: React.MouseEvent,
    notebookId: string
  ) => {
    e.preventDefault();
    setContextMenuId(notebookId);
    setContextMenuPos({ x: e.clientX, y: e.clientY });
  };

  const itemBase =
    'flex items-center gap-2 px-3 py-1.5 rounded-md text-sm cursor-pointer transition-colors duration-200';
  const itemActive =
    'bg-indigo-50 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300 font-medium';
  const itemInactive =
    'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700/50';

  return (
    <aside className="w-[220px] min-w-[220px] h-full flex flex-col bg-[#F7F7F7] dark:bg-[#16213E] border-r border-gray-200 dark:border-gray-700 transition-colors duration-200 overflow-hidden">
      {/* All Notes */}
      <div className="px-2 pt-3 pb-1">
        <button
          onClick={onSelectAllNotes}
          className={`w-full ${itemBase} ${
            currentView === 'all' ? itemActive : itemInactive
          }`}
        >
          <FileText className="w-4 h-4 shrink-0" />
          <span className="flex-1 text-left truncate">All Notes</span>
          <span className="text-xs text-gray-400 dark:text-gray-500 tabular-nums">
            {totalCount}
          </span>
        </button>
      </div>

      {/* Notebooks */}
      <div className="px-2 pt-3 flex-1 overflow-y-auto">
        <div className="flex items-center justify-between px-3 mb-1">
          <span className="text-[11px] font-semibold uppercase tracking-wider text-gray-400 dark:text-gray-500">
            Notebooks
          </span>
          <button
            onClick={onCreateNotebook}
            className="p-0.5 rounded text-gray-400 hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
            aria-label="New notebook"
          >
            <Plus className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="space-y-0.5">
          {notebooks.map((nb) => (
            <div
              key={nb.id}
              onContextMenu={(e) => handleContextMenu(e, nb.id)}
              onDoubleClick={() => startRename(nb.id, nb.name)}
            >
              {editingNotebookId === nb.id ? (
                <div className="px-3 py-1">
                  <input
                    ref={editInputRef}
                    value={editingName}
                    onChange={(e) => setEditingName(e.target.value)}
                    onBlur={commitRename}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') commitRename();
                      if (e.key === 'Escape') {
                        setEditingNotebookId(null);
                        setEditingName('');
                      }
                    }}
                    className="w-full px-2 py-0.5 text-sm rounded border border-indigo-400 dark:border-indigo-500 bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-200 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                  />
                </div>
              ) : (
                <button
                  onClick={() => onSelectNotebook(nb.id)}
                  className={`w-full ${itemBase} ${
                    currentView === 'notebook' && selectedNotebookId === nb.id
                      ? itemActive
                      : itemInactive
                  }`}
                >
                  <BookOpen className="w-4 h-4 shrink-0" />
                  <span className="flex-1 text-left truncate">{nb.name}</span>
                  <span className="text-xs text-gray-400 dark:text-gray-500 tabular-nums">
                    {notebookNoteCounts[nb.id] || 0}
                  </span>
                </button>
              )}
            </div>
          ))}

          {notebooks.length === 0 && (
            <p className="px-3 py-2 text-xs text-gray-400 dark:text-gray-500 italic">
              No notebooks yet
            </p>
          )}
        </div>

        {/* Tags */}
        {tagEntries.length > 0 && (
          <div className="mt-4">
            <span className="px-3 text-[11px] font-semibold uppercase tracking-wider text-gray-400 dark:text-gray-500">
              Tags
            </span>
            <div className="mt-1 space-y-0.5">
              {tagEntries.map(([tag, count]) => (
                <button
                  key={tag}
                  onClick={() => onSelectTag(tag)}
                  className={`w-full ${itemBase} ${
                    currentView === 'tag' && selectedTag === tag
                      ? itemActive
                      : itemInactive
                  }`}
                >
                  <Tag className="w-3.5 h-3.5 shrink-0" />
                  <span className="flex-1 text-left truncate">{tag}</span>
                  <span className="text-xs text-gray-400 dark:text-gray-500 tabular-nums">
                    {count}
                  </span>
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Trash */}
      <div className="px-2 pb-3 pt-1 border-t border-gray-200 dark:border-gray-700">
        <button
          onClick={onSelectTrash}
          className={`w-full ${itemBase} ${
            currentView === 'trash' ? itemActive : itemInactive
          }`}
        >
          <Trash2 className="w-4 h-4 shrink-0" />
          <span className="flex-1 text-left truncate">Trash</span>
          {trashedCount > 0 && (
            <span className="text-xs text-gray-400 dark:text-gray-500 tabular-nums">
              {trashedCount}
            </span>
          )}
        </button>
      </div>

      {/* Context menu */}
      {contextMenuId && (
        <div
          ref={contextMenuRef}
          style={{ top: contextMenuPos.y, left: contextMenuPos.x }}
          className="fixed z-50 py-1 min-w-[140px] rounded-md border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-800 shadow-lg"
        >
          <button
            onClick={() => {
              const nb = notebooks.find((n) => n.id === contextMenuId);
              if (nb) startRename(nb.id, nb.name);
            }}
            className="w-full px-3 py-1.5 text-left text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
          >
            Rename
          </button>
          <button
            onClick={() => {
              onDeleteNotebook(contextMenuId);
              setContextMenuId(null);
            }}
            className="w-full px-3 py-1.5 text-left text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20"
          >
            Delete
          </button>
        </div>
      )}
    </aside>
  );
}
