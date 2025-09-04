import React from 'react';
import { Star, Clock, CheckCircle, Circle, XCircle, Heart } from 'lucide-react';
import { Book } from '../../types';
import { Card, CardContent } from '../ui/card';

interface BookCardProps {
  book: Book;
  onClick: () => void;
}

export const BookCard: React.FC<BookCardProps> = ({ book, onClick }) => {
  const getStatusIcon = () => {
    switch (book.status) {
      case 'reading':
        return <Clock className="w-4 h-4 text-blue-500" />;
      case 'completed':
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'plan-to-read':
        return <Circle className="w-4 h-4 text-yellow-500" />;
      case 'dropped':
        return <XCircle className="w-4 h-4 text-red-500" />;
      default:
        return <Circle className="w-4 h-4 text-gray-400" />;
    }
  };

  const getStatusColor = () => {
    switch (book.status) {
      case 'reading':
        return 'text-blue-600 bg-blue-50';
      case 'completed':
        return 'text-green-600 bg-green-50';
      case 'plan-to-read':
        return 'text-yellow-600 bg-yellow-50';
      case 'dropped':
        return 'text-red-600 bg-red-50';
      default:
        return 'text-gray-600 bg-gray-50';
    }
  };

  const progressPercentage = Math.round((book.progress / book.totalChapters) * 100);

  return (
    <Card 
      className="group hover:shadow-md transition-all duration-200 cursor-pointer border border-gray-200 hover:border-gray-300 bg-white"
      onClick={onClick}
    >
      <CardContent className="p-0">
        <div className="flex gap-3 p-4">
          {/* Cover Image */}
          <div className="w-12 h-16 bg-gray-200 rounded-lg overflow-hidden flex-shrink-0">
            {book.coverUrl ? (
              <img 
                src={book.coverUrl} 
                alt={book.title}
                className="w-full h-full object-cover"
                onError={(e) => {
                  e.currentTarget.style.display = 'none';
                  e.currentTarget.parentElement!.innerHTML = `
                    <div class="w-full h-full bg-gradient-to-br from-blue-400 to-purple-500 flex items-center justify-center">
                      <span class="text-white font-bold text-sm">${book.title.charAt(0)}</span>
                    </div>
                  `;
                }}
              />
            ) : (
              <div className="w-full h-full bg-gradient-to-br from-blue-400 to-purple-500 flex items-center justify-center">
                <span className="text-white font-bold text-sm">
                  {book.title.charAt(0)}
                </span>
              </div>
            )}
          </div>

          {/* Book Info */}
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between mb-1">
              <h3 className="font-semibold text-gray-900 text-sm leading-tight truncate pr-2">
                {book.title}
              </h3>
              {book.favorite && (
                <Heart className="w-4 h-4 text-red-500 fill-current flex-shrink-0" />
              )}
            </div>
            
            {book.author && (
              <p className="text-xs text-gray-600 mb-2 truncate">
                {book.author}
              </p>
            )}

            {/* Status and Progress */}
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-1">
                {getStatusIcon()}
                <span className={`text-xs px-2 py-1 rounded-full font-medium ${getStatusColor()}`}>
                  {book.status === 'plan-to-read' ? 'Plan to Read' : 
                   book.status.charAt(0).toUpperCase() + book.status.slice(1)}
                </span>
              </div>
              
              {book.rating > 0 && (
                <div className="flex items-center gap-1">
                  <Star className="w-3 h-3 text-yellow-400 fill-current" />
                  <span className="text-xs text-gray-600">{book.rating}</span>
                </div>
              )}
            </div>

            {/* Progress Bar */}
            <div className="space-y-1">
              <div className="flex justify-between items-center">
                <span className="text-xs text-gray-600">
                  Chapter {book.progress} of {book.totalChapters}
                </span>
                <span className="text-xs font-medium text-blue-600">
                  {progressPercentage}%
                </span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-1.5">
                <div 
                  className="bg-blue-600 h-1.5 rounded-full transition-all duration-300"
                  style={{ width: `${progressPercentage}%` }}
                />
              </div>
            </div>

            {/* Last Read */}
            {book.lastRead && (
              <p className="text-xs text-gray-500 mt-1">
                Last read: {new Date(book.lastRead).toLocaleDateString()}
              </p>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};