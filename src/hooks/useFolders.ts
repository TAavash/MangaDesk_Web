import { useState, useEffect } from "react";
import { supabase } from "../lib/supabase";
import { useAuth } from "./useAuth";

export interface Folder {
  id: string;
  name: string;
  color: string;
  user_id: string;
  created_at: string;
  updated_at: string;
}

export function useFolders() {
  const [folders, setFolders] = useState<Folder[]>([]);
  const [bookCounts, setBookCounts] = useState<Record<string, number>>({});
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [isEditing, setIsEditing] = useState(false);
  const { user } = useAuth();

  useEffect(() => {
    if (user) {
      fetchFolders();
      fetchBookCounts();
    }
  }, [user]);

  const fetchFolders = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('folders')
        .select('*')
        .eq('user_id', user?.id)
        .order('created_at', { ascending: true });

      if (error) throw error;
      setFolders(data || []);
    } catch (error) {
      console.error('Error fetching folders:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchBookCounts = async () => {
    try {
      const { data, error } = await supabase
        .from('books')
        .select('folder_id')
        .eq('user_id', user?.id);

      if (error) throw error;

      const counts: Record<string, number> = {};
      data?.forEach(book => {
        counts[book.folder_id] = (counts[book.folder_id] || 0) + 1;
      });
      
      setBookCounts(counts);
    } catch (error) {
      console.error('Error fetching book counts:', error);
    }
  };
  const addFolder = async (name: string, color: string = '#4ECDC4') => {
    try {
      const { data, error } = await supabase
        .from('folders')
        .insert([{ name, color, user_id: user?.id }])
        .select()
        .single();

      if (error) throw error;
      setFolders(prev => [...prev, data]);
      setBookCounts(prev => ({ ...prev, [data.id]: 0 }));
      return data;
    } catch (error) {
      console.error('Error adding folder:', error);
      throw error;
    }
  };

  const updateFolder = async (id: string, updates: Partial<Folder>) => {
    try {
      const { data, error } = await supabase
        .from('folders')
        .update(updates)
        .eq('id', id)
        .eq('user_id', user?.id)
        .select()
        .single();

      if (error) throw error;
      setFolders(prev => prev.map(folder => 
        folder.id === id ? data : folder
      ));
      return data;
    } catch (error) {
      console.error('Error updating folder:', error);
      throw error;
    }
  };

  const deleteFolder = async (id: string) => {
    try {
      const { error } = await supabase
        .from('folders')
        .delete()
        .eq('id', id)
        .eq('user_id', user?.id);

      if (error) throw error;
      setFolders(prev => prev.filter(folder => folder.id !== id));
      setBookCounts(prev => {
        const newCounts = { ...prev };
        delete newCounts[id];
        return newCounts;
      });
    } catch (error) {
      console.error('Error deleting folder:', error);
      throw error;
    }
  };

  const filteredFolders = folders
    .filter(folder => folder.name.toLowerCase().includes(searchQuery.toLowerCase()))
    .map(folder => ({
      ...folder,
      count: bookCounts[folder.id] || 0
    }));

  return {
    folders: filteredFolders,
    setFolders,
    loading,
    searchQuery,
    setSearchQuery,
    isEditing,
    setIsEditing,
    addFolder,
    updateFolder,
    deleteFolder,
    fetchFolders,
    refreshBookCounts: fetchBookCounts
  };
}