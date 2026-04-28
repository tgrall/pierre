'use client';

import React from 'react';
import { Search, Sun, Moon, FileText } from 'lucide-react';

interface HeaderProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
  theme: 'dark' | 'light' | 'system';
  onToggleTheme: () => void;
}

export default function Header({
  searchQuery,
  onSearchChange,
  theme,
  onToggleTheme,
}: HeaderProps) {
  return (
    <header className="flex items-center justify-between h-12 px-4 border-b border-gray-200 dark:border-gray-700 bg-white dark:bg-[#1A1A2E] transition-colors duration-200">
      <div className="flex items-center gap-2">
        <FileText className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
        <span className="text-lg font-semibold text-gray-800 dark:text-gray-200">
          NoteFlow
        </span>
      </div>

      <div className="flex items-center gap-3">
        <div className="relative">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 dark:text-gray-500" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Search notes…"
            className="w-56 pl-8 pr-16 py-1.5 text-sm rounded-md border border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-800 text-gray-800 dark:text-gray-200 placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:focus:ring-indigo-400 transition-colors duration-200"
          />
          <kbd className="absolute right-2 top-1/2 -translate-y-1/2 hidden sm:inline-flex items-center px-1.5 py-0.5 text-[10px] font-medium text-gray-400 dark:text-gray-500 bg-gray-100 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded">
            Ctrl+F
          </kbd>
        </div>

        <button
          onClick={onToggleTheme}
          className="p-1.5 rounded-md text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors duration-200"
          aria-label="Toggle theme"
        >
          {theme === 'dark' ? (
            <Sun className="w-4 h-4" />
          ) : (
            <Moon className="w-4 h-4" />
          )}
        </button>
      </div>
    </header>
  );
}
