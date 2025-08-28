import React from 'react';
import { ChevronRight, Star, Clock, MoreVertical } from 'lucide-react';
import { Book } from '../../types';
import { Card, CardContent } from '../ui/card';
import { Button } from '../ui/button';

interface BookCardProps {
  book: Book;
  onClick: () => void;
  onMove?: (bookId: string) => void;
  showMoveOption?: boolean;
}

export const BookCard: React.FC<BookCardProps> = ({ book, onClick, onMove, showMoveOption }) => {
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'reading': return 'bg-blue-500';
      case 'completed': return 'bg-green-500';
      case 'plan-to-read': return 'bg-yellow-500';
      case 'dropped': return 'bg-red-500';
      default: return 'bg-gray-500';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'reading': return 'Reading';
      case 'completed': return 'Completed';
      case 'plan-to-read': return 'Plan to Read';
      case 'dropped': return 'Dropped';
      default: return status;
    }
  };

  const progressPercentage = book.totalChapters 
    ? Math.round((book.progress || 0) / book.totalChapters * 100)
    : 0;

  return (
    <Card className="group hover:shadow-md transition-all duration-200 border border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600 bg-white dark:bg-gray-800">
      <CardContent className="p-0">
        <div 
          className="flex items-center gap-3 p-4 cursor-pointer"
          onClick={onClick}
        >
          {/* Book Cover */}
          <div className="w-12 h-16 bg-gray-200 rounded-md overflow-hidden flex-shrink-0">
            {book.coverUrl ? (
              <img 
                src={book.coverUrl} 
                alt={book.title}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full bg-gradient-to-br from-blue-400 to-purple-500 flex items-center justify-center">
                <span className="text-white text-xs font-bold">
                  {book.title.charAt(0)}
                </span>
              </div>
            )}
          </div>

          {/* Book Info */}
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold text-gray-900 dark:text-white truncate text-sm">
              {book.title}
            </h3>
            {book.author && (
              <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                {book.author}
              </p>
            )}
            
            {/* Status and Progress */}
            <div className="flex items-center gap-2 mt-1">
              <span className={`inline-block w-2 h-2 rounded-full ${getStatusColor(book.status)}`} />
              <span className="text-xs text-gray-600 dark:text-gray-300">
                {getStatusText(book.status)}
              </span>
              {book.progress && book.totalChapters && (
                <span className="text-xs text-gray-500 dark:text-gray-400">
                  • {book.progress}/{book.totalChapters}
                </span>
              )}
            </div>

            {/* Progress Bar */}
{book.status === 'reading' && book.totalChapters && (
  <div className="mt-2">
    <div className="w-full bg-gray-200 rounded-full h-1">
      <div
        className="bg-blue-500 h-1 rounded-full"
        style={{ width: `${progressPercentage}%` }}
      />
    </div>
    <span className="text-xs text-gray-500 dark:text-gray-400 mt-1 block">
      {progressPercentage}% complete
    </span>
  </div>
)}


            {/* Rating */}
            {book.rating && (
              <div className="flex items-center gap-1 mt-1">
                <Star className="w-3 h-3 text-yellow-400 fill-current" />
                <span className="text-xs text-gray-600 dark:text-gray-300">{book.rating}/5</span>
              </div>
            )}
          </div>

          {/* Last Read */}
          <div className="flex flex-col items-end gap-1">
            {book.lastRead && (
              <div className="flex items-center gap-1">
                <Clock className="w-3 h-3 text-gray-400 dark:text-gray-500" />
                <span className="text-xs text-gray-500 dark:text-gray-400">
                  {new Date(book.lastRead).toLocaleDateString()}
                </span>
              </div>
            )}
            <ChevronRight className="w-4 h-4 text-gray-400 group-hover:text-gray-600 transition-colors" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
};