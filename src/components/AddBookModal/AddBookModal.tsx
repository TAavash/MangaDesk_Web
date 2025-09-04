import React, { useState } from 'react';
import { X, Plus, Upload, Image } from 'lucide-react';
import { Button } from '../ui/button';
import { Book } from '../../types';

interface AddBookModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAdd: (bookData: Omit<Book, 'id' | 'dateAdded'>) => void;
  folderId: string;
}

const GENRE_OPTIONS = [
  'Action', 'Adventure', 'Comedy', 'Drama', 'Fantasy', 'Horror', 
  'Mystery', 'Romance', 'Sci-Fi', 'Slice of Life', 'Sports', 
  'Supernatural', 'Thriller', 'Historical', 'Psychological', 'Seinen',
  'Shounen', 'Shoujo', 'Josei', 'Isekai', 'Mecha', 'Military'
];

export const AddBookModal: React.FC<AddBookModalProps> = ({
  isOpen,
  onClose,
  onAdd,
  folderId
}) => {
  const [formData, setFormData] = useState({
    title: '',
    author: '',
    genre: [] as string[],
    year: '',
    publisher: '',
    language: 'Japanese',
    status: 'plan-to-read' as Book['status'],
    progress: 0,
    totalChapters: 1,
    coverUrl: '',
    rating: 0,
    notes: '',
    tags: [] as string[],
    synopsis: ''
  });

  const [newGenre, setNewGenre] = useState('');
  const [newTag, setNewTag] = useState('');
  const [isEditingProgress, setIsEditingProgress] = useState(false);
  const [tempProgress, setTempProgress] = useState('0');


  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.title.trim()) {
      onAdd({
        ...formData,
        folderId,
        year: formData.year ? parseInt(formData.year) : undefined,
        totalChapters: Math.max(1, formData.totalChapters),
        progress: Math.min(formData.progress, formData.totalChapters),
        genre: formData.genre.length > 0 ? formData.genre : undefined,
        tags: formData.tags.length > 0 ? formData.tags : undefined,
        publisher: formData.publisher || undefined,
        notes: formData.notes || undefined,
        synopsis: formData.synopsis || undefined,
        rating: formData.rating || undefined,
        coverUrl: formData.coverUrl || undefined
      });
      resetForm();
      onClose();
    }
  };

  const resetForm = () => {
    setFormData({
      title: '',
      author: '',
      genre: [],
      year: '',
      publisher: '',
      language: 'Japanese',
      status: 'plan-to-read',
      progress: 0,
      totalChapters: 1,
      coverUrl: '',
      rating: 0,
      notes: '',
      tags: [],
      synopsis: ''
    });
    setNewGenre('');
    setNewTag('');
    setIsEditingProgress(false);
    setTempProgress('0');
  };

  const addGenre = (genre?: string) => {
    const genreToAdd = genre || newGenre.trim();
    if (genreToAdd && !formData.genre.includes(genreToAdd)) {
      setFormData(prev => ({
        ...prev,
        genre: [...prev.genre, genreToAdd]
      }));
      if (!genre) setNewGenre('');
    }
  };

  const removeGenre = (genre: string) => {
    setFormData(prev => ({
      ...prev,
      genre: prev.genre.filter(g => g !== genre)
    }));
  };

  const addTag = () => {
    if (newTag.trim() && !formData.tags.includes(newTag.trim())) {
      setFormData(prev => ({
        ...prev,
        tags: [...prev.tags, newTag.trim()]
      }));
      setNewTag('');
    }
  };

  const removeTag = (tag: string) => {
    setFormData(prev => ({
      ...prev,
      tags: prev.tags.filter(t => t !== tag)
    }));
  };

  const handleProgressEdit = () => {
    setTempProgress(formData.progress.toString());
    setIsEditingProgress(true);
  };

  const saveProgress = () => {
    const newProgress = parseInt(tempProgress) || 0;
    const validProgress = Math.max(0, Math.min(formData.totalChapters, newProgress));
    setFormData(prev => ({ ...prev, progress: validProgress }));
    setTempProgress(validProgress.toString());
    setIsEditingProgress(false);
  };

  const cancelProgressEdit = () => {
    setTempProgress(formData.progress.toString());
    setIsEditingProgress(false);
  };

  const handleProgressKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      saveProgress();
    } else if (e.key === 'Escape') {
      cancelProgressEdit();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl w-full max-w-sm mx-4 shadow-xl max-h-[95vh] overflow-hidden flex flex-col">
        <div className="flex items-center justify-between p-4 border-b border-gray-100 flex-shrink-0">
          <h2 className="text-lg font-bold text-gray-900">Add New Book</h2>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => {
              resetForm();
              onClose();
            }}
            className="h-8 w-8 p-0"
          >
            <X className="w-4 h-4" />
          </Button>
        </div>
        
        <div className="flex-1 overflow-y-auto">
          <form onSubmit={handleSubmit} className="p-4 space-y-4">
            {/* Basic Info */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Title *
              </label>
              <input
                type="text"
                value={formData.title}
                onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                placeholder="Enter book title..."
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Author
              </label>
              <input
                type="text"
                value={formData.author}
                onChange={(e) => setFormData(prev => ({ ...prev, author: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                placeholder="Enter author name..."
              />
            </div>

            {/* Cover Image */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Cover Image URL
              </label>
              <div className="space-y-2">
                <input
                  type="url"
                  value={formData.coverUrl}
                  onChange={(e) => setFormData(prev => ({ ...prev, coverUrl: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                  placeholder="https://example.com/cover.jpg"
                />
              </div>
              {formData.coverUrl && (
                <div className="mt-2 flex justify-center">
                  <img 
                    src={formData.coverUrl} 
                    alt="Cover preview"
                    className="w-16 h-20 object-cover rounded border"
                    onError={(e) => {
                      e.currentTarget.style.display = 'none';
                    }}
                  />
                </div>
              )}
            </div>

            {/* Status and Progress */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Status
                </label>
                <select
                  value={formData.status}
                  onChange={(e) => setFormData(prev => ({ ...prev, status: e.target.value as Book['status'] }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                >
                  <option value="plan-to-read">Plan to Read</option>
                  <option value="reading">Reading</option>
                  <option value="completed">Completed</option>
                  <option value="dropped">Dropped</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Total Chapters
                </label>
                <input
                  type="number"
                  value={formData.totalChapters}
                  onChange={(e) => {
                    const value = e.target.value;
                    if (value === '') {
                      setFormData(prev => ({ ...prev, totalChapters: '' as any }));
                    } else {
                      setFormData(prev => ({ ...prev, totalChapters: Math.max(1, parseInt(value) || 1) }));
                    }
                  }}
                  onBlur={(e) => {
                    if (e.target.value === '' || parseInt(e.target.value) < 1) {
                      setFormData(prev => ({ ...prev, totalChapters: 1 }));
                    }
                  }}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                  min="1"
                  placeholder="1"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Current Progress
              </label>
              {isEditingProgress ? (
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    value={tempProgress}
                    onChange={(e) => setTempProgress(e.target.value)}
                    onKeyDown={handleProgressKeyPress}
                    onBlur={saveProgress}
                    className="flex-1 px-3 py-2 border border-blue-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                    min="0"
                    max={formData.totalChapters}
                    autoFocus
                  />
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={cancelProgressEdit}
                    className="px-2 py-1 text-xs"
                  >
                    Cancel
                  </Button>
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={handleProgressEdit}
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-left text-sm hover:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    {formData.progress} chapters
                  </button>
                </div>
              )}
            </div>

            {/* Additional Info */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Year
                </label>
                <input
                  type="number"
                  value={formData.year}
                  onChange={(e) => setFormData(prev => ({ ...prev, year: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                  placeholder="2024"
                  min="1900"
                  max={new Date().getFullYear()}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Language
                </label>
                <select
                  value={formData.language}
                  onChange={(e) => setFormData(prev => ({ ...prev, language: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                >
                  <option value="Japanese">Japanese</option>
                  <option value="Korean">Korean</option>
                  <option value="Chinese">Chinese</option>
                  <option value="English">English</option>
                  <option value="Other">Other</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Publisher
              </label>
              <input
                type="text"
                value={formData.publisher}
                onChange={(e) => setFormData(prev => ({ ...prev, publisher: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                placeholder="Publisher name..."
              />
            </div>

            {/* Genres */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Genres
              </label>
              
              {/* Quick Select Genres */}
              <div className="mb-2">
                <p className="text-xs text-gray-500 mb-2">Quick select:</p>
                <div className="flex flex-wrap gap-1 max-h-20 overflow-y-auto">
                  {GENRE_OPTIONS.map((genre) => (
                    <button
                      key={genre}
                      type="button"
                      onClick={() => addGenre(genre)}
                      disabled={formData.genre.includes(genre)}
                      className={`px-2 py-1 text-xs rounded-full transition-colors ${
                        formData.genre.includes(genre)
                          ? 'bg-blue-100 text-blue-700 cursor-not-allowed opacity-50'
                          : 'bg-gray-100 text-gray-700 hover:bg-blue-50 hover:text-blue-600'
                      }`}
                    >
                      {genre}
                    </button>
                  ))}
                </div>
              </div>

              {/* Custom Genre Input */}
              <div className="flex gap-2 mb-2">
                <input
                  type="text"
                  value={newGenre}
                  onChange={(e) => setNewGenre(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addGenre())}
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                  placeholder="Add custom genre..."
                />
                <Button
                  type="button"
                  onClick={() => addGenre()}
                  size="sm"
                  className="px-3 py-2 bg-blue-600 hover:bg-blue-700"
                >
                  <Plus className="w-4 h-4" />
                </Button>
              </div>
              
              {/* Selected Genres */}
              {formData.genre.length > 0 && (
                <div className="flex flex-wrap gap-1">
                  {formData.genre.map((genre, index) => (
                    <span
                      key={index}
                      className="px-2 py-1 bg-blue-100 text-blue-700 text-xs rounded-full cursor-pointer hover:bg-blue-200 flex items-center gap-1"
                      onClick={() => removeGenre(genre)}
                    >
                      {genre} <X className="w-3 h-3" />
                    </span>
                  ))}
                </div>
              )}
            </div>

            {/* Tags */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Tags
              </label>
              <div className="flex gap-2 mb-2">
                <input
                  type="text"
                  value={newTag}
                  onChange={(e) => setNewTag(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addTag())}
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                  placeholder="Add tag..."
                />
                <Button
                  type="button"
                  onClick={addTag}
                  size="sm"
                  className="px-3 py-2 bg-blue-600 hover:bg-blue-700"
                >
                  <Plus className="w-4 h-4" />
                </Button>
              </div>
              {formData.tags.length > 0 && (
                <div className="flex flex-wrap gap-1">
                  {formData.tags.map((tag, index) => (
                    <span
                      key={index}
                      className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded-full cursor-pointer hover:bg-gray-200 flex items-center gap-1"
                      onClick={() => removeTag(tag)}
                    >
                      #{tag} <X className="w-3 h-3" />
                    </span>
                  ))}
                </div>
              )}
            </div>

            {/* Synopsis */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Synopsis
              </label>
              <textarea
                value={formData.synopsis}
                onChange={(e) => setFormData(prev => ({ ...prev, synopsis: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none text-sm"
                rows={3}
                placeholder="Brief description of the story..."
              />
            </div>

            {/* Rating */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Rating (1-5)
              </label>
              <input
                type="number"
                value={formData.rating}
                onChange={(e) => setFormData(prev => ({ ...prev, rating: Math.min(5, Math.max(0, parseInt(e.target.value) || 0)) }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                min="0"
                max="5"
              />
            </div>

            {/* Notes */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Notes
              </label>
              <textarea
                value={formData.notes}
                onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none text-sm"
                rows={2}
                placeholder="Your thoughts about this book..."
              />
            </div>
          </form>
        </div>

        {/* Fixed Bottom Buttons */}
        <div className="flex gap-3 p-4 border-t border-gray-100 bg-white flex-shrink-0">
          <Button
            type="button"
            variant="outline"
            onClick={() => {
              resetForm();
              onClose();
            }}
            className="flex-1"
          >
            Cancel
          </Button>
          <Button
            onClick={handleSubmit}
            className="flex-1 bg-blue-600 hover:bg-blue-700"
            disabled={!formData.title.trim()}
          >
            <Plus className="w-4 h-4 mr-2" />
            Add Book
          </Button>
        </div>
      </div>
    </div>
  );
};