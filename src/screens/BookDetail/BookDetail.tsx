import React, { useState } from 'react';
import { ArrowLeft, Star, Edit3, Trash2, Plus, Minus, Heart, Calendar, Tag, Globe, Building2, RotateCcw, Check, Image } from 'lucide-react';
import { Button } from '../../components/ui/button';
import { StatusBar } from '../../components/StatusBar/StatusBar';
import { Card, CardContent } from '../../components/ui/card';
import { useBooks } from '../../hooks/useBooks';
import { useAuth } from '../../hooks/useAuth';

interface BookDetailProps {
  bookId: string;
  folderId: string;
  onBack: () => void;
}

export const BookDetail: React.FC<BookDetailProps> = ({ bookId, folderId, onBack }) => {
  const { user } = useAuth();
  const { getBook, updateBook, deleteBook } = useBooks(folderId);
  const book = getBook(bookId);
  
  const [isEditing, setIsEditing] = useState(false);
  const [isEditingProgress, setIsEditingProgress] = useState(false);
  const [isEditingTotal, setIsEditingTotal] = useState(false);
  const [editingFields, setEditingFields] = useState({
    title: false,
    author: false,
    synopsis: false,
    year: false,
    publisher: false,
    rating: false
  });
  const [tempValues, setTempValues] = useState({
    title: book?.title || '',
    author: book?.author || '',
    synopsis: book?.synopsis || '',
    year: book?.year?.toString() || '',
    publisher: book?.publisher || '',
    rating: book?.rating?.toString() || '0'
  });
  const [tempProgress, setTempProgress] = useState(book?.progress.toString() || '0');
  const [tempTotal, setTempTotal] = useState(book?.totalChapters.toString() || '1');
  const [isEditingCover, setIsEditingCover] = useState(false);
  const [tempCoverUrl, setTempCoverUrl] = useState(book?.coverUrl || '');

  // Update temp values when book changes
  React.useEffect(() => {
    if (book) {
      setTempValues({
        title: book.title,
        author: book.author || '',
        synopsis: book.synopsis || '',
        year: book.year?.toString() || '',
        publisher: book.publisher || '',
        rating: book.rating?.toString() || '0'
      });
      setTempProgress(book.progress.toString());
      setTempTotal(book.totalChapters.toString());
      setTempCoverUrl(book.coverUrl || '');
    }
  }, [book]);

  if (!book) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600">Book not found</p>
          <Button onClick={onBack} className="mt-4">
            Go Back
          </Button>
        </div>
      </div>
    );
  }

  const updateProgress = (change: number) => {
    const newProgress = Math.max(0, Math.min(book.totalChapters, book.progress + change));
    const updates = { 
      progress: newProgress,
      lastRead: new Date().toISOString().split('T')[0]
    };
    updateBook(book.id, updates);
  };

  const updateStatus = (newStatus: typeof book.status) => {
    const updates: any = { status: newStatus };
    
    // Set finish date if completed
    if (newStatus === 'completed') {
      updates.finishDate = new Date().toISOString().split('T')[0];
      updates.progress = book.totalChapters;
    }
    
    updateBook(book.id, updates);
  };

  const handleProgressEdit = () => {
    setTempProgress(book.progress.toString());
    setIsEditingProgress(true);
  };

  const handleTotalEdit = () => {
    setTempTotal(book.totalChapters.toString());
    setIsEditingTotal(true);
  };

  const saveProgress = () => {
    const newProgress = parseInt(tempProgress) || 0;
    const validProgress = Math.max(0, Math.min(book.totalChapters, newProgress));
    updateBook(book.id, { 
      progress: validProgress,
      lastRead: new Date().toISOString().split('T')[0]
    });
    setTempProgress(validProgress.toString());
    setIsEditingProgress(false);
  };

  const saveTotal = () => {
    const newTotal = parseInt(tempTotal) || 1;
    const validTotal = Math.max(1, newTotal);
    const adjustedProgress = Math.min(book.progress, validTotal);
    updateBook(book.id, {
      totalChapters: validTotal,
      progress: adjustedProgress
    });
    setTempTotal(validTotal.toString());
    setIsEditingTotal(false);
  };

  const cancelProgressEdit = () => {
    setTempProgress(book.progress.toString());
    setIsEditingProgress(false);
  };

  const cancelTotalEdit = () => {
    setTempTotal(book.totalChapters.toString());
    setIsEditingTotal(false);
  };

  const handleProgressKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      saveProgress();
    } else if (e.key === 'Escape') {
      cancelProgressEdit();
    }
  };

  const handleTotalKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      saveTotal();
    } else if (e.key === 'Escape') {
      cancelTotalEdit();
    }
  };

  const handleSliderChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newProgress = parseInt(e.target.value);
    updateBook(book.id, { 
      progress: newProgress,
      lastRead: new Date().toISOString().split('T')[0]
    });
  };

  const toggleFavorite = () => {
    updateBook(book.id, { favorite: !book.favorite });
  };

  const handleDelete = async () => {
    if (window.confirm('Are you sure you want to delete this book?')) {
      await deleteBook(book.id);
      onBack();
    }
  };

  const handleNotesChange = (notes: string) => {
    updateBook(book.id, { notes });
  };

  const handleCoverEdit = () => {
    setTempCoverUrl(book.coverUrl || '');
    setIsEditingCover(true);
  };

  const saveCover = () => {
    updateBook(book.id, { coverUrl: tempCoverUrl || undefined });
    setIsEditingCover(false);
  };

  const cancelCoverEdit = () => {
    setTempCoverUrl(book.coverUrl || '');
    setIsEditingCover(false);
  };

  const progressPercentage = Math.round((book.progress / book.totalChapters) * 100);

  const statusOptions = [
    { value: 'reading', label: 'Reading', color: 'bg-blue-500' },
    { value: 'completed', label: 'Completed', color: 'bg-green-500' },
    { value: 'plan-to-read', label: 'Plan to Read', color: 'bg-yellow-500' },
    { value: 'dropped', label: 'Dropped', color: 'bg-red-500' }
  ];

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="w-full max-w-sm bg-white rounded-3xl shadow-2xl overflow-hidden relative">
        <StatusBar />

        {/* Header */}
        <div className="px-6 py-4 border-b border-gray-100">
          <div className="flex items-center justify-between">
            <Button
              variant="ghost"
              size="sm"
              onClick={onBack}
              className="h-8 w-8 p-0"
            >
              <ArrowLeft className="w-4 h-4" />
            </Button>
            <div className="flex gap-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={toggleFavorite}
                className={`h-8 w-8 p-0 ${book.favorite ? 'text-red-500 hover:bg-red-50' : 'text-gray-400 hover:bg-gray-50'}`}
              >
                <Heart className={`w-4 h-4 ${book.favorite ? 'fill-current' : ''}`} />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsEditing(!isEditing)}
                className="h-8 w-8 p-0"
              >
                <Edit3 className="w-4 h-4" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleDelete}
                className="h-8 w-8 p-0 text-red-600 hover:bg-red-50"
              >
                <Trash2 className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>

        {/* Book Details */}
        <div className="px-6 py-4 space-y-4 max-h-[500px] overflow-y-auto">
          {/* Cover and Basic Info */}
          <div className="flex gap-4">
            <div className="w-20 h-28 bg-gray-200 rounded-lg overflow-hidden flex-shrink-0 relative group">
              {isEditingCover ? (
                <div className="w-full h-full flex flex-col">
                  <input
                    type="url"
                    value={tempCoverUrl}
                    onChange={(e) => setTempCoverUrl(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') saveCover();
                      if (e.key === 'Escape') cancelCoverEdit();
                    }}
                    className="w-full px-1 py-1 text-xs border border-blue-500 rounded focus:outline-none"
                    placeholder="Image URL..."
                    autoFocus
                  />
                  <div className="flex gap-1 mt-1">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={saveCover}
                      className="h-4 w-4 p-0 text-green-600"
                    >
                      <Check className="w-3 h-3" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={cancelCoverEdit}
                      className="h-4 w-4 p-0 text-gray-500"
                    >
                      <RotateCcw className="w-3 h-3" />
                    </Button>
                  </div>
                </div>
              ) : (
                <>
                  {book.coverUrl ? (
                    <img 
                      src={book.coverUrl} 
                      alt={book.title}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        e.currentTarget.style.display = 'none';
                        e.currentTarget.parentElement!.innerHTML = `
                          <div class="w-full h-full bg-gradient-to-br from-blue-400 to-purple-500 flex items-center justify-center">
                            <span class="text-white font-bold">${book.title.charAt(0)}</span>
                          </div>
                        `;
                      }}
                    />
                  ) : (
                    <div className="w-full h-full bg-gradient-to-br from-blue-400 to-purple-500 flex items-center justify-center">
                      <span className="text-white font-bold">
                        {book.title.charAt(0)}
                      </span>
                    </div>
                  )}
                  {isEditing && (
                    <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={handleCoverEdit}
                        className="h-6 w-6 p-0 text-white hover:bg-white/20"
                      >
                        <Image className="w-4 h-4" />
                      </Button>
                    </div>
                  )}
                </>
              )}
            </div>
            
            <div className="flex-1">
              {isEditing && editingFields.title ? (
                <div className="mb-1">
                  <input
                    type="text"
                    value={tempValues.title}
                    onChange={(e) => setTempValues(prev => ({ ...prev, title: e.target.value }))}
                    onBlur={() => {
                      updateBook(book.id, { title: tempValues.title });
                      setEditingFields(prev => ({ ...prev, title: false }));
                    }}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        updateBook(book.id, { title: tempValues.title });
                        setEditingFields(prev => ({ ...prev, title: false }));
                      } else if (e.key === 'Escape') {
                        setTempValues(prev => ({ ...prev, title: book.title }));
                        setEditingFields(prev => ({ ...prev, title: false }));
                      }
                    }}
                    className="text-xl font-bold bg-transparent border-b border-blue-500 focus:outline-none w-full"
                    autoFocus
                  />
                </div>
              ) : (
                <h1 
                  className={`text-xl font-bold text-gray-900 mb-1 ${isEditing ? 'cursor-pointer hover:bg-blue-50 px-1 rounded' : ''}`}
                  onClick={() => isEditing && setEditingFields(prev => ({ ...prev, title: true }))}
                >
                  {book.title}
                </h1>
              )}
              
              {isEditing && editingFields.author ? (
                <div className="mb-2">
                  <input
                    type="text"
                    value={tempValues.author}
                    onChange={(e) => setTempValues(prev => ({ ...prev, author: e.target.value }))}
                    onBlur={() => {
                      updateBook(book.id, { author: tempValues.author });
                      setEditingFields(prev => ({ ...prev, author: false }));
                    }}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        updateBook(book.id, { author: tempValues.author });
                        setEditingFields(prev => ({ ...prev, author: false }));
                      } else if (e.key === 'Escape') {
                        setTempValues(prev => ({ ...prev, author: book.author || '' }));
                        setEditingFields(prev => ({ ...prev, author: false }));
                      }
                    }}
                    className="text-gray-600 bg-transparent border-b border-blue-500 focus:outline-none w-full"
                    placeholder="Author name"
                    autoFocus
                  />
                </div>
              ) : (
                <p 
                  className={`text-gray-600 mb-2 ${isEditing ? 'cursor-pointer hover:bg-blue-50 px-1 rounded' : ''}`}
                  onClick={() => isEditing && setEditingFields(prev => ({ ...prev, author: true }))}
                >
                  {book.author || 'Unknown Author'}
                </p>
              )}
              
              {/* Rating */}
              {isEditing ? (
                <div className="flex items-center gap-2 mb-2">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <Star
                      key={star}
                      className={`w-4 h-4 cursor-pointer ${
                        star <= parseInt(tempValues.rating) 
                          ? 'text-yellow-400 fill-current' 
                          : 'text-gray-300 hover:text-yellow-200'
                      }`}
                      onClick={() => {
                        const newRating = star.toString();
                        setTempValues(prev => ({ ...prev, rating: newRating }));
                        updateBook(book.id, { rating: parseInt(newRating) });
                      }}
                    />
                  ))}
                  <span className="text-sm text-gray-600 ml-1">{tempValues.rating}/5</span>
                </div>
              ) : (
                <div className="flex items-center gap-1 mb-2">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <Star
                      key={star}
                      className={`w-4 h-4 ${
                        star <= book.rating 
                          ? 'text-yellow-400 fill-current' 
                          : 'text-gray-300'
                      }`}
                    />
                  ))}
                  <span className="text-sm text-gray-600 ml-1">{book.rating}/5</span>
                </div>
              )}
              
              {/* Favorite indicator */}
              {book.favorite && (
                <div className="flex items-center gap-1">
                  <Heart className="w-4 h-4 text-red-500 fill-current" />
                  <span className="text-sm text-red-600 font-medium">Favorite</span>
                </div>
              )}
            </div>
          </div>

          {/* Synopsis */}
          <Card>
            <CardContent className="p-4">
              <h3 className="font-semibold text-gray-900 mb-2">Synopsis</h3>
              {isEditing && editingFields.synopsis ? (
                <textarea
                  value={tempValues.synopsis}
                  onChange={(e) => setTempValues(prev => ({ ...prev, synopsis: e.target.value }))}
                  onBlur={() => {
                    updateBook(book.id, { synopsis: tempValues.synopsis });
                    setEditingFields(prev => ({ ...prev, synopsis: false }));
                  }}
                  onKeyDown={(e) => {
                    if (e.key === 'Escape') {
                      setTempValues(prev => ({ ...prev, synopsis: book.synopsis || '' }));
                      setEditingFields(prev => ({ ...prev, synopsis: false }));
                    }
                  }}
                  className="w-full p-2 text-sm text-gray-700 leading-relaxed border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                  rows={4}
                  placeholder="Add a synopsis..."
                  autoFocus
                />
              ) : (
                <p 
                  className={`text-sm text-gray-700 leading-relaxed ${isEditing ? 'cursor-pointer hover:bg-blue-50 px-1 rounded' : ''}`}
                  onClick={() => isEditing && setEditingFields(prev => ({ ...prev, synopsis: true }))}
                >
                  {book.synopsis || 'No synopsis available'}
                </p>
              )}
            </CardContent>
          </Card>

          {/* Book Information */}
          <Card>
            <CardContent className="p-4">
              <h3 className="font-semibold text-gray-900 mb-3">Information</h3>
              <div className="space-y-3">
                {book.genre && book.genre.length > 0 && (
                  <div className="flex items-start gap-2">
                    <Tag className="w-4 h-4 text-gray-500 mt-0.5" />
                    <div>
                      <span className="text-sm font-medium text-gray-700">Genres:</span>
                      <div className="flex flex-wrap gap-1 mt-1">
                        {book.genre.map((g, index) => (
                          <span key={index} className="px-2 py-1 bg-blue-100 text-blue-700 text-xs rounded-full">
                            {g}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                )}

                {book.year && (
                  <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-gray-500" />
                    {isEditing && editingFields.year ? (
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-medium text-gray-700">Year:</span>
                        <input
                          type="number"
                          value={tempValues.year}
                          onChange={(e) => setTempValues(prev => ({ ...prev, year: e.target.value }))}
                          onBlur={() => {
                            updateBook(book.id, { year: parseInt(tempValues.year) || undefined });
                            setEditingFields(prev => ({ ...prev, year: false }));
                          }}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') {
                              updateBook(book.id, { year: parseInt(tempValues.year) || undefined });
                              setEditingFields(prev => ({ ...prev, year: false }));
                            } else if (e.key === 'Escape') {
                              setTempValues(prev => ({ ...prev, year: book.year?.toString() || '' }));
                              setEditingFields(prev => ({ ...prev, year: false }));
                            }
                          }}
                          className="w-20 px-2 py-1 text-sm border border-blue-500 rounded focus:outline-none"
                          min="1900"
                          max={new Date().getFullYear()}
                          autoFocus
                        />
                      </div>
                    ) : (
                      <span 
                        className={`text-sm text-gray-700 ${isEditing ? 'cursor-pointer hover:bg-blue-50 px-1 rounded' : ''}`}
                        onClick={() => isEditing && setEditingFields(prev => ({ ...prev, year: true }))}
                      >
                        <span className="font-medium">Year:</span> {book.year}
                      </span>
                    )}
                  </div>
                )}

                {book.publisher && (
                  <div className="flex items-center gap-2">
                    <Building2 className="w-4 h-4 text-gray-500" />
                    {isEditing && editingFields.publisher ? (
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-medium text-gray-700">Publisher:</span>
                        <input
                          type="text"
                          value={tempValues.publisher}
                          onChange={(e) => setTempValues(prev => ({ ...prev, publisher: e.target.value }))}
                          onBlur={() => {
                            updateBook(book.id, { publisher: tempValues.publisher });
                            setEditingFields(prev => ({ ...prev, publisher: false }));
                          }}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') {
                              updateBook(book.id, { publisher: tempValues.publisher });
                              setEditingFields(prev => ({ ...prev, publisher: false }));
                            } else if (e.key === 'Escape') {
                              setTempValues(prev => ({ ...prev, publisher: book.publisher || '' }));
                              setEditingFields(prev => ({ ...prev, publisher: false }));
                            }
                          }}
                          className="flex-1 px-2 py-1 text-sm border border-blue-500 rounded focus:outline-none"
                          placeholder="Publisher name"
                          autoFocus
                        />
                      </div>
                    ) : (
                      <span 
                        className={`text-sm text-gray-700 ${isEditing ? 'cursor-pointer hover:bg-blue-50 px-1 rounded' : ''}`}
                        onClick={() => isEditing && setEditingFields(prev => ({ ...prev, publisher: true }))}
                      >
                        <span className="font-medium">Publisher:</span> {book.publisher}
                      </span>
                    )}
                  </div>
                )}

                {book.language && (
                  <div className="flex items-center gap-2">
                    <Globe className="w-4 h-4 text-gray-500" />
                    <span className="text-sm text-gray-700">
                      <span className="font-medium">Language:</span> {book.language}
                    </span>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Tags */}
          {book.tags && book.tags.length > 0 && (
            <Card>
              <CardContent className="p-4">
                <h3 className="font-semibold text-gray-900 mb-3">Tags</h3>
                <div className="flex flex-wrap gap-2">
                  {book.tags.map((tag, index) => (
                    <span key={index} className="px-3 py-1 bg-gray-100 text-gray-700 text-sm rounded-full">
                      #{tag}
                    </span>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Status */}
          <Card>
            <CardContent className="p-4">
              <h3 className="font-semibold text-gray-900 mb-3">Status</h3>
              <div className="grid grid-cols-2 gap-2">
                {statusOptions.map((option) => (
                  <button
                    key={option.value}
                    onClick={() => updateStatus(option.value as any)}
                    className={`p-2 rounded-lg text-sm font-medium transition-colors ${
                      book.status === option.value
                        ? 'bg-blue-100 text-blue-700 border-2 border-blue-300'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <div className={`w-2 h-2 rounded-full ${option.color}`} />
                      {option.label}
                    </div>
                  </button>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Progress */}
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-semibold text-gray-900">Reading Progress</h3>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => updateBook(book.id, { 
                    progress: book.totalChapters,
                    status: 'completed',
                    finishDate: new Date().toISOString().split('T')[0]
                  })}
                  className="text-xs text-blue-600 hover:bg-blue-50"
                >
                  Mark Complete
                </Button>
              </div>
              
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <span className="text-sm text-gray-600">Chapter</span>
                  {isEditingProgress ? (
                    <div className="flex items-center gap-1">
                      <input
                        type="number"
                        value={tempProgress}
                        onChange={(e) => setTempProgress(e.target.value)}
                        onKeyDown={handleProgressKeyPress}
                        className="w-16 px-2 py-1 text-sm border border-blue-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                        min="0"
                        max={book.totalChapters}
                        autoFocus
                      />
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={saveProgress}
                        className="h-6 w-6 p-0 text-green-600 hover:bg-green-50"
                      >
                        <Check className="w-3 h-3" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={cancelProgressEdit}
                        className="h-6 w-6 p-0 text-gray-500 hover:bg-gray-50"
                      >
                        <RotateCcw className="w-3 h-3" />
                      </Button>
                    </div>
                  ) : (
                    <button
                      onClick={handleProgressEdit}
                      className="text-sm font-medium text-blue-600 hover:text-blue-700 underline"
                    >
                      {book.progress}
                    </button>
                  )}
                  <span className="text-sm text-gray-600">of</span>
                  {isEditingTotal ? (
                    <div className="flex items-center gap-1">
                      <input
                        type="number"
                        value={tempTotal}
                        onChange={(e) => setTempTotal(e.target.value)}
                        onKeyDown={handleTotalKeyPress}
                        className="w-16 px-2 py-1 text-sm border border-blue-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                        min="1"
                        autoFocus
                      />
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={saveTotal}
                        className="h-6 w-6 p-0 text-green-600 hover:bg-green-50"
                      >
                        <Check className="w-3 h-3" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={cancelTotalEdit}
                        className="h-6 w-6 p-0 text-gray-500 hover:bg-gray-50"
                      >
                        <RotateCcw className="w-3 h-3" />
                      </Button>
                    </div>
                  ) : (
                    <button
                      onClick={handleTotalEdit}
                      className="text-sm font-medium text-blue-600 hover:text-blue-700 underline"
                    >
                      {book.totalChapters}
                    </button>
                  )}
                </div>
                <span className="text-sm font-medium text-blue-600">
                  {progressPercentage}%
                </span>
              </div>

              {/* Combined draggable progress bar */}
              <div className="mb-3">
                <input
                  type="range"
                  min="0"
                  max={book.totalChapters}
                  value={book.progress}
                  onChange={handleSliderChange}
                  className="w-full h-3 bg-gray-200 rounded-lg appearance-none cursor-pointer slider"
                />
                <style jsx>{`
                  .slider::-webkit-slider-thumb {
                    appearance: none;
                    height: 24px;
                    width: 24px;
                    border-radius: 50%;
                    background: #3B82F6;
                    cursor: pointer;
                    box-shadow: 0 2px 4px rgba(0,0,0,0.2);
                  }
                  .slider::-moz-range-thumb {
                    height: 24px;
                    width: 24px;
                    border-radius: 50%;
                    background: #3B82F6;
                    cursor: pointer;
                    border: none;
                    box-shadow: 0 2px 4px rgba(0,0,0,0.2);
                  }
                `}</style>
              </div>

              {/* Quick increment/decrement buttons */}
              <div className="flex items-center justify-center gap-4 mb-3">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => updateProgress(-1)}
                  disabled={book.progress <= 0}
                  className="h-8 w-8 p-0"
                >
                  <Minus className="w-4 h-4" />
                </Button>
                
                <span className="font-medium text-gray-900 min-w-[60px] text-center">
                  {book.progress}
                </span>
                
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => updateProgress(1)}
                  disabled={book.progress >= book.totalChapters}
                  className="h-8 w-8 p-0"
                >
                  <Plus className="w-4 h-4" />
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Notes */}
          <Card>
            <CardContent className="p-4">
              <h3 className="font-semibold text-gray-900 mb-3">Notes</h3>
              <textarea
                value={book.notes || ''}
                onChange={(e) => handleNotesChange(e.target.value)}
                className="w-full p-3 border border-gray-300 rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-blue-500"
                rows={4}
                placeholder="Add your thoughts about this book..."
                readOnly={!isEditing}
              />
            </CardContent>
          </Card>

          {/* Metadata */}
          <Card>
            <CardContent className="p-4">
              <h3 className="font-semibold text-gray-900 mb-3">Reading History</h3>
              <div className="space-y-2 text-sm">
                {book.startDate && (
                  <div className="flex justify-between">
                    <span className="text-gray-600">Started Reading:</span>
                    <span className="text-gray-900">
                      {new Date(book.startDate).toLocaleDateString()}
                    </span>
                  </div>
                )}
                {book.finishDate && (
                  <div className="flex justify-between">
                    <span className="text-gray-600">Finished Reading:</span>
                    <span className="text-gray-900">
                      {new Date(book.finishDate).toLocaleDateString()}
                    </span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span className="text-gray-600">Date Added:</span>
                  <span className="text-gray-900">
                    {new Date(book.dateAdded).toLocaleDateString()}
                  </span>
                </div>
                {book.lastRead && (
                  <div className="flex justify-between">
                    <span className="text-gray-600">Last Read:</span>
                    <span className="text-gray-900">
                      {new Date(book.lastRead).toLocaleDateString()}
                    </span>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Home Indicator */}
        <div className="flex justify-center py-2">
          <div className="w-32 h-1 bg-black rounded-full" />
        </div>
      </div>
    </div>
  );
};