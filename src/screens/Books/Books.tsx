import React, { useState } from 'react';
import { ArrowLeft, Plus, Filter, BookOpen } from 'lucide-react';
import { Button } from '../../components/ui/button';
import { StatusBar } from '../../components/StatusBar/StatusBar';
import { SearchBar } from '../../components/SearchBar/SearchBar';
import { BookCard } from '../../components/BookCard/BookCard';
import { AddBookModal } from '../../components/AddBookModal/AddBookModal';
import { useBooks } from '../../hooks/useBooks';

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
    addBook
  } = useBooks(folderId);

  const [showFilters, setShowFilters] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);

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

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="w-full max-w-sm bg-white rounded-3xl shadow-2xl overflow-hidden relative">
        <StatusBar />

        {/* Header */}
        <div className="px-6 py-4 border-b border-gray-100">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <Button
                variant="ghost"
                size="sm"
                onClick={onBack}
                className="h-8 w-8 p-0"
              >
                <ArrowLeft className="w-4 h-4" />
              </Button>
              <div>
                <h1 className="text-xl font-bold text-gray-900">{folderName}</h1>
                <p className="text-sm text-gray-500">{books.length} books</p>
              </div>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowFilters(!showFilters)}
              className="h-8 w-8 p-0"
            >
              <Filter className="w-4 h-4" />
            </Button>
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
                      ? 'bg-blue-100 text-blue-700 font-medium'
                      : 'text-gray-600 hover:bg-gray-100'
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
        <div className="flex-1 px-6 py-4 space-y-3 max-h-[500px] overflow-y-auto">
          {books.length === 0 ? (
            <div className="text-center py-12">
              <BookOpen className="w-12 h-12 text-gray-300 mx-auto mb-3" />
              <p className="text-gray-500 mb-4">No books in this folder yet</p>
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
              />
            ))
          )}
        </div>

        {/* Bottom Actions */}
        <div className="border-t border-gray-100 px-6 py-4 bg-white">
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
    </div>
  );
};