import { useState, useEffect } from 'react';
import { Folder } from '../types';
import { supabase } from '../lib/supabase';
import { useAuth } from './useAuth';

export const useFolders = () => {
  const { user } = useAuth();
  const [folders, setFolders] = useState<Folder[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(true);

  // Fetch folders from Supabase
  const fetchFolders = async () => {
    if (!user) return;

    try {
      setLoading(true);
      
      // Get folders with book counts
      const { data: foldersData, error: foldersError } = await supabase
        .from('folders')
        .select(`
          id,
          name,
          color,
          created_at,
          updated_at
        `)
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (foldersError) throw foldersError;

      // Get book counts for each folder
      const foldersWithCounts = await Promise.all(
        (foldersData || []).map(async (folder) => {
          const { count } = await supabase
            .from('books')
            .select('*', { count: 'exact', head: true })
            .eq('folder_id', folder.id)
            .eq('user_id', user.id);

          return {
            id: folder.id,
            name: folder.name,
            color: folder.color || '#4ECDC4',
            count: count || 0
          };
        })
      );

      setFolders(foldersWithCounts);
    } catch (error) {
      console.error('Error fetching folders:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFolders();
  }, [user]);

  const filteredFolders = folders.filter(folder =>
    folder.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const addFolder = async (name: string) => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('folders')
        .insert([
          {
            name,
            user_id: user.id,
            color: '#4ECDC4'
          }
        ])
        .select()
        .single();

      if (error) throw error;

      const newFolder: Folder = {
        id: data.id,
        name: data.name,
        color: data.color,
        count: 0
      };

      setFolders(prev => [newFolder, ...prev]);
    } catch (error) {
      console.error('Error adding folder:', error);
    }
  };

  const updateFolder = async (id: string, updates: Partial<Folder>) => {
    if (!user) return;

    try {
      const { error } = await supabase
        .from('folders')
        .update({
          name: updates.name,
          color: updates.color
        })
        .eq('id', id)
        .eq('user_id', user.id);

      if (error) throw error;

      setFolders(prev => prev.map(folder => 
        folder.id === id ? { ...folder, ...updates } : folder
      ));
    } catch (error) {
      console.error('Error updating folder:', error);
    }
  };

  const deleteFolder = async (id: string) => {
    if (!user) return;

    try {
      // Check if folder has books
      const { count } = await supabase
        .from('books')
        .select('*', { count: 'exact', head: true })
        .eq('folder_id', id)
        .eq('user_id', user.id);

      if (count && count > 0) {
        if (!window.confirm(`This folder contains ${count} books. Are you sure you want to delete it? All books will be permanently deleted.`)) {
          return;
        }
      }

      const { error } = await supabase
        .from('folders')
        .delete()
        .eq('id', id)
        .eq('user_id', user.id);

      if (error) throw error;

      setFolders(prev => prev.filter(folder => folder.id !== id));
    } catch (error) {
      console.error('Error deleting folder:', error);
    }
  };

  return {
    folders: filteredFolders,
    searchQuery,
    setSearchQuery,
    isEditing,
    setIsEditing,
    addFolder,
    updateFolder,
    deleteFolder,
    loading,
    refetch: fetchFolders
  };
};