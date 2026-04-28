'use client';

import React from 'react';
import {
  Plus,
  Pin,
  Trash2,
  RotateCcw,
  FileText,
  ChevronLeft,
} from 'lucide-react';
import type { Note } from '../lib/types';

interface NotesListProps {
  notes: Note[];
  selectedNoteId: string | null;
  currentView: string;
  contextName: string;
  onSelectNote: (id: string) => void;
  onCreateNote: () => void;
  onDeleteNote: (id: string) => void;
  onRestoreNote: (id: string) => void;
  onPermanentDeleteNote: (id: string) => void;
  onPinNote: (id: string) => void;
  searchQuery: string;
}

function formatRelativeTime(dateStr: string): string {
  const date = new Date(dateStr);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffSec = Math.floor(diffMs / 1000);
  const diffMin = Math.floor(diffSec / 60);
  const diffHour = Math.floor(diffMin / 60);
  const diffDay = Math.floor(diffHour / 24);

  if (diffSec < 60) return 'just now';
  if (diffMin < 60) return `${diffMin} min ago`;
  if (diffHour < 24) return `${diffHour} hour${diffHour > 1 ? 's' : ''} ago`;
  if (diffDay === 1) return 'yesterday';
  if (diffDay < 7) return `${diffDay} days ago`;

  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: date.getFullYear() !== now.getFullYear() ? 'numeric' : undefined,
  });
}

export default function NotesList({
  notes,
  selectedNoteId,
  currentView,
  contextName,
  onSelectNote,
  onCreateNote,
  onDeleteNote,
  onRestoreNote,
  onPermanentDeleteNote,
  onPinNote,
  searchQuery,
}: NotesListProps) {
  const isTrash = currentView === 'trash';

  // Sort: pinned first, then by updatedAt descending
  const sortedNotes = [...notes].sort((a, b) => {
    if (a.isPinned !== b.isPinned) return a.isPinned ? -1 : 1;
    return new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime();
  });

  return (
    <div className="w-[280px] min-w-[280px] h-full flex flex-col bg-white dark:bg-[#1A1A2E] border-r border-gray-200 dark:border-gray-700 transition-colors duration-200">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-gray-200 dark:border-gray-700">
        <h2 className="text-sm font-semibold text-gray-800 dark:text-gray-200 truncate">
          {contextName}
        </h2>
        {!isTrash && (
          <button
            onClick={onCreateNote}
            className="p-1 rounded-md text-gray-500 dark:text-gray-400 hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors duration-200"
            aria-label="New note"
          >
            <Plus className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Notes list */}
      <div className="flex-1 overflow-y-auto">
        {sortedNotes.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full px-6 text-center">
            <FileText className="w-10 h-10 text-gray-300 dark:text-gray-600 mb-3" />
            <p className="text-sm text-gray-500 dark:text-gray-400">
              {isTrash
                ? 'Trash is empty'
                : searchQuery
                  ? 'No notes match your search'
                  : 'No notes yet'}
            </p>
            {!isTrash && !searchQuery && (
              <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">
                Click + to create your first note
              </p>
            )}
          </div>
        ) : (
          <div className="py-1">
            {sortedNotes.map((note) => {
              const isSelected = note.id === selectedNoteId;
              const preview =
                note.plainText.length > 100
                  ? note.plainText.slice(0, 100) + '…'
                  : note.plainText || 'No content';

              return (
                <div
                  key={note.id}
                  onClick={() => onSelectNote(note.id)}
                  className={`group relative px-4 py-2.5 cursor-pointer border-b border-gray-100 dark:border-gray-700/50 transition-colors duration-150 ${
                    isSelected
                      ? 'bg-indigo-50 dark:bg-indigo-900/20 border-l-2 border-l-indigo-500'
                      : 'hover:bg-gray-50 dark:hover:bg-gray-800/30 border-l-2 border-l-transparent'
                  }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <h3
                      className={`text-sm font-medium truncate flex-1 ${
                        isSelected
                          ? 'text-indigo-700 dark:text-indigo-300'
                          : 'text-gray-800 dark:text-gray-200'
                      }`}
                    >
                      {note.title || 'Untitled'}
                    </h3>
                    <div className="flex items-center gap-0.5 shrink-0">
                      {note.isPinned && (
                        <Pin className="w-3 h-3 text-indigo-500 dark:text-indigo-400 fill-current" />
                      )}
                    </div>
                  </div>

                  <p className="mt-0.5 text-xs text-gray-500 dark:text-gray-400 line-clamp-2 leading-relaxed">
                    {preview}
                  </p>

                  <div className="mt-1 flex items-center justify-between">
                    <span className="text-[11px] text-gray-400 dark:text-gray-500">
                      {formatRelativeTime(note.updatedAt)}
                    </span>

                    {/* Action buttons on hover */}
                    <div className="flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
                      {isTrash ? (
                        <>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              onRestoreNote(note.id);
                            }}
                            className="p-1 rounded text-gray-400 hover:text-green-600 dark:hover:text-green-400 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                            title="Restore"
                          >
                            <RotateCcw className="w-3 h-3" />
                          </button>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              onPermanentDeleteNote(note.id);
                            }}
                            className="p-1 rounded text-gray-400 hover:text-red-600 dark:hover:text-red-400 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                            title="Delete permanently"
                          >
                            <Trash2 className="w-3 h-3" />
                          </button>
                        </>
                      ) : (
                        <>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              onPinNote(note.id);
                            }}
                            className="p-1 rounded text-gray-400 hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                            title={note.isPinned ? 'Unpin' : 'Pin'}
                          >
                            <Pin className={`w-3 h-3 ${note.isPinned ? 'fill-current' : ''}`} />
                          </button>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              onDeleteNote(note.id);
                            }}
                            className="p-1 rounded text-gray-400 hover:text-red-600 dark:hover:text-red-400 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                            title="Move to trash"
                          >
                            <Trash2 className="w-3 h-3" />
                          </button>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
