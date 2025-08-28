import React, { useState } from 'react';
import { ArrowLeft, Plus, Filter, BookOpen, Settings } from 'lucide-react';
import { Button } from '../../components/ui/button';
import { StatusBar } from '../../components/StatusBar/StatusBar';
import { SearchBar } from '../../components/SearchBar/SearchBar';
import { BookCard } from '../../components/BookCard/BookCard';
import { AddBookModal } from '../../components/AddBookModal/AddBookModal';
import { useBooks } from '../../hooks/useBooks';
import { useFolders } from '../../hooks/useFolders';

interface BooksProps {
  folderId: string;
  folderName: string;
  onBack: () => void;
  onBookClick: (bookId: string) => void;
}

export const Books: React.FC<BooksProps> = ({ 
  folderId, 
  folderName, 
  onBack, 
  onBookClick 
}) => {
  const {
    books,
    searchQuery,
    setSearchQuery,
    filterStatus,
    setFilterStatus,
    addBook,
    moveBook,
    copyBook
  } = useBooks(folderId);

  const { folders } = useFolders();
  const [showFilters, setShowFilters] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showManageMode, setShowManageMode] = useState(false);
  const [showMoveModal, setShowMoveModal] = useState(false);
  const [showCopyModal, setShowCopyModal] = useState(false);
  const [selectedBookId, setSelectedBookId] = useState<string | null>(null);

  const statusOptions = [
    { value: 'all', label: 'All Books' },
    { value: 'reading', label: 'Currently Reading' },
    { value: 'completed', label: 'Completed' },
    { value: 'plan-to-read', label: 'Plan to Read' },
    { value: 'dropped', label: 'Dropped' }
  ];

  const getStatusCount = (status: string) => {
    if (status === 'all') return books.length;
    return books.filter(book => book.status === status).length;
  };

  const handleMoveBook = async (targetFolderId: string) => {
    if (!selectedBookId) return;
    
    const success = await moveBook(selectedBookId, targetFolderId);
    if (success) {
      setShowMoveModal(false);
      setSelectedBookId(null);
      alert('Book moved successfully!');
    } else {
      alert('Failed to move book');
    }
  };

  const handleCopyBook = async (targetFolderId: string) => {
    if (!selectedBookId) return;
    
    const success = await copyBook(selectedBookId, targetFolderId);
    if (success) {
      setShowCopyModal(false);
      setSelectedBookId(null);
      alert('Book copied successfully!');
    } else {
      alert('Failed to copy book');
    }
  };

  const availableFolders = folders.filter(folder => folder.id !== folderId);
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-black flex items-center justify-center p-4">
      <div className="w-full max-w-sm bg-white dark:bg-black rounded-3xl shadow-2xl overflow-hidden relative border dark:border-gray-800">
        <StatusBar />

        {/* Header */}
        <div className="px-6 py-4 border-b border-gray-100 dark:border-gray-800">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <Button
                variant="ghost"
                size="sm"
                onClick={onBack}
                className="h-8 w-8 p-0"
              >
                <ArrowLeft className="w-4 h-4 text-gray-600 dark:text-gray-300" />
              </Button>
              <div>
                <h1 className="text-xl font-bold text-gray-900 dark:text-white">{folderName}</h1>
                <p className="text-sm text-gray-500 dark:text-gray-400">{books.length} books</p>
              </div>
            </div>
            <div className="flex gap-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowManageMode(!showManageMode)}
                className={`h-8 w-8 p-0 ${showManageMode ? 'bg-blue-100 dark:bg-blue-900' : ''}`}
              >
                <Settings className="w-4 h-4 text-gray-600 dark:text-gray-300" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowFilters(!showFilters)}
                className="h-8 w-8 p-0"
              >
                <Filter className="w-4 h-4 text-gray-600 dark:text-gray-300" />
              </Button>
            </div>
          </div>

          <SearchBar
            value={searchQuery}
            onChange={setSearchQuery}
            placeholder="Search books..."
          />

          {/* Filter Tabs */}
          {showFilters && (
            <div className="mt-4 space-y-2">
              {statusOptions.map((option) => (
                <button
                  key={option.value}
                  onClick={() => setFilterStatus(option.value)}
                  className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-colors ${
                    filterStatus === option.value
                      ? 'bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300 font-medium'
                      : 'text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800'
                  }`}
                >
                  <span>{option.label}</span>
                  <span className="float-right text-xs opacity-60">
                    {getStatusCount(option.value)}
                  </span>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Books List */}
        <div className="flex-1 px-6 py-4 space-y-3 max-h-[500px] overflow-y-auto bg-white dark:bg-black">
          {books.length === 0 ? (
            <div className="text-center py-12">
              <BookOpen className="w-12 h-12 text-gray-300 dark:text-gray-600 mx-auto mb-3" />
              <p className="text-gray-500 dark:text-gray-400 mb-4">No books in this folder yet</p>
              <Button 
                onClick={() => setShowAddModal(true)}
                className="bg-blue-600 hover:bg-blue-700"
              >
                <Plus className="w-4 h-4 mr-2" />
                Add Your First Book
              </Button>
            </div>
          ) : (
            books.map((book) => (
              <BookCard
                key={book.id}
                book={book}
                onClick={() => onBookClick(book.id)}
                showActions={showManageMode}
                onMove={(bookId) => {
                  setSelectedBookId(bookId);
                  setShowMoveModal(true);
                }}
                onCopy={(bookId) => {
                  setSelectedBookId(bookId);
                  setShowCopyModal(true);
                }}
              />
            ))
          )}
        </div>

        {/* Bottom Actions */}
        <div className="border-t border-gray-100 dark:border-gray-800 px-6 py-4 bg-white dark:bg-black">
          <Button
            className="w-full bg-blue-600 hover:bg-blue-700"
            onClick={() => setShowAddModal(true)}
          >
            <Plus className="w-4 h-4 mr-2" />
            Add New Book
          </Button>
        </div>

        {/* Home Indicator */}
        <div className="flex justify-center py-2">
          <div className="w-32 h-1 bg-black rounded-full" />
        </div>
      </div>

      {/* Add Book Modal */}
      <AddBookModal
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
        onAdd={addBook}
        folderId={folderId}
      />

      {/* Move Book Modal */}
      {showMoveModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 w-full max-w-sm mx-4 shadow-xl">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">Move Book</h2>
            <p className="text-gray-600 dark:text-gray-300 mb-4">Select a folder to move this book to:</p>
            
            <div className="space-y-2 max-h-60 overflow-y-auto">
              {availableFolders.map((folder) => (
                <button
                  key={folder.id}
                  onClick={() => handleMoveBook(folder.id)}
                  className="w-full text-left p-3 rounded-lg border border-gray-200 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <div 
                      className="w-3 h-3 rounded-full"
                      style={{ backgroundColor: folder.color }}
                    />
                    <span className="text-gray-900 dark:text-white font-medium">{folder.name}</span>
                    <span className="text-sm text-gray-500 dark:text-gray-400 ml-auto">
                      {folder.count} books
                    </span>
                  </div>
                </button>
              ))}
            </div>
            
            <div className="flex gap-3 mt-6">
              <Button
                variant="outline"
                onClick={() => {
                  setShowMoveModal(false);
                  setSelectedBookId(null);
                }}
                className="flex-1"
              >
                Cancel
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Copy Book Modal */}
      {showCopyModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 w-full max-w-sm mx-4 shadow-xl">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">Copy Book</h2>
            <p className="text-gray-600 dark:text-gray-300 mb-4">Select a folder to copy this book to:</p>
            
            <div className="space-y-2 max-h-60 overflow-y-auto">
              {folders.map((folder) => (
                <button
                  key={folder.id}
                  onClick={() => handleCopyBook(folder.id)}
                  className="w-full text-left p-3 rounded-lg border border-gray-200 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <div 
                      className="w-3 h-3 rounded-full"
                      style={{ backgroundColor: folder.color }}
                    />
                    <span className="text-gray-900 dark:text-white font-medium">{folder.name}</span>
                    <span className="text-sm text-gray-500 dark:text-gray-400 ml-auto">
                      {folder.count} books
                    </span>
                  </div>
                </button>
              ))}
            </div>
            
            <div className="flex gap-3 mt-6">
              <Button
                variant="outline"
                onClick={() => {
                  setShowCopyModal(false);
                  setSelectedBookId(null);
                }}
                className="flex-1"
              >
                Cancel
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};