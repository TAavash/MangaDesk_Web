import { useState, useEffect } from 'react';
import { Book } from '../types';
import { supabase } from '../lib/supabase';
import { useAuth } from './useAuth';

export const useBooks = (folderId: string) => {
  const { user } = useAuth();
  const [books, setBooks] = useState<Book[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [loading, setLoading] = useState(true);

  // Fetch books from Supabase
  const fetchBooks = async () => {
    if (!user || !folderId) return;

    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('books')
        .select('*')
        .eq('user_id', user.id)
        .eq('folder_id', folderId)
        .order('created_at', { ascending: false });

      if (error) throw error;

      // Transform database data to match our Book interface
      const transformedBooks: Book[] = data.map(book => ({
        id: book.id,
        title: book.title,
        author: book.author || undefined,
        status: book.status,
        progress: book.progress,
        totalChapters: book.total_chapters,
        folderId: book.folder_id,
        coverUrl: book.cover_url || undefined,
        rating: book.rating || undefined,
        notes: book.notes || undefined,
        synopsis: book.synopsis || undefined,
        genre: book.genre || undefined,
        tags: book.tags || undefined,
        year: book.year || undefined,
        publisher: book.publisher || undefined,
        language: book.language || 'Japanese',
        startDate: book.start_date || undefined,
        finishDate: book.finish_date || undefined,
        lastRead: book.last_read || undefined,
        favorite: book.favorite,
        dateAdded: book.created_at.split('T')[0]
      }));

      setBooks(transformedBooks);
    } catch (error) {
      console.error('Error fetching books:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBooks();
  }, [user, folderId]);

  const filteredBooks = books.filter(book => {
    const matchesSearch = book.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         book.author?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesFilter = filterStatus === 'all' || book.status === filterStatus;
    return matchesSearch && matchesFilter;
  });

  const addBook = async (bookData: Omit<Book, 'id' | 'dateAdded'>) => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('books')
        .insert([
          {
            title: bookData.title,
            author: bookData.author || null,
            status: bookData.status,
            progress: bookData.progress || 0,
            total_chapters: bookData.totalChapters || 1,
            folder_id: bookData.folderId,
            user_id: user.id,
            cover_url: bookData.coverUrl || null,
            rating: bookData.rating || null,
            notes: bookData.notes || null,
            synopsis: bookData.synopsis || null,
            genre: bookData.genre || null,
            tags: bookData.tags || null,
            year: bookData.year || null,
            publisher: bookData.publisher || null,
            language: bookData.language || 'Japanese',
            start_date: bookData.startDate || null,
            finish_date: bookData.finishDate || null,
            last_read: bookData.lastRead || null,
            favorite: bookData.favorite || false
          }
        ])
        .select()
        .single();

      if (error) throw error;

      // Transform and add to local state
      const newBook: Book = {
        id: data.id,
        title: data.title,
        author: data.author || undefined,
        status: data.status,
        progress: data.progress,
        totalChapters: data.total_chapters,
        folderId: data.folder_id,
        coverUrl: data.cover_url || undefined,
        rating: data.rating || undefined,
        notes: data.notes || undefined,
        synopsis: data.synopsis || undefined,
        genre: data.genre || undefined,
        tags: data.tags || undefined,
        year: data.year || undefined,
        publisher: data.publisher || undefined,
        language: data.language || 'Japanese',
        startDate: data.start_date || undefined,
        finishDate: data.finish_date || undefined,
        lastRead: data.last_read || undefined,
        favorite: data.favorite,
        dateAdded: data.created_at.split('T')[0]
      };

      setBooks(prev => [newBook, ...prev]);
    } catch (error) {
      console.error('Error adding book:', error);
    }
  };

  const updateBook = async (id: string, updates: Partial<Book>) => {
    if (!user) return;

    try {
      const { error } = await supabase
        .from('books')
        .update({
          title: updates.title,
          author: updates.author || null,
          status: updates.status,
          progress: updates.progress,
          total_chapters: updates.totalChapters,
          cover_url: updates.coverUrl || null,
          rating: updates.rating || null,
          notes: updates.notes || null,
          synopsis: updates.synopsis || null,
          genre: updates.genre || null,
          tags: updates.tags || null,
          year: updates.year || null,
          publisher: updates.publisher || null,
          language: updates.language,
          start_date: updates.startDate || null,
          finish_date: updates.finishDate || null,
          last_read: updates.lastRead || null,
          favorite: updates.favorite
        })
        .eq('id', id)
        .eq('user_id', user.id);

      if (error) throw error;

      setBooks(prev => prev.map(book => 
        book.id === id ? { ...book, ...updates } : book
      ));
    } catch (error) {
      console.error('Error updating book:', error);
    }
  };

  const deleteBook = async (id: string) => {
    if (!user) return;

    try {
      const { error } = await supabase
        .from('books')
        .delete()
        .eq('id', id)
        .eq('user_id', user.id);

      if (error) throw error;

      setBooks(prev => prev.filter(book => book.id !== id));
    } catch (error) {
      console.error('Error deleting book:', error);
    }
  };

  // Get a single book by ID
  const getBook = (bookId: string): Book | undefined => {
    return books.find(book => book.id === bookId);
  };

  return {
    books: filteredBooks,
    searchQuery,
    setSearchQuery,
    filterStatus,
    setFilterStatus,
    addBook,
    updateBook,
    deleteBook,
    getBook,
    loading,
    refetch: fetchBooks
  };
};