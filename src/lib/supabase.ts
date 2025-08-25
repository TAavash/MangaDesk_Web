import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Types for our database
export interface Database {
  public: {
    Tables: {
      folders: {
        Row: {
          id: string;
          name: string;
          color: string;
          user_id: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          color?: string;
          user_id: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          color?: string;
          user_id?: string;
          created_at?: string;
          updated_at?: string;
        };
      };
      books: {
        Row: {
          id: string;
          title: string;
          author: string | null;
          status: 'reading' | 'completed' | 'plan-to-read' | 'dropped';
          progress: number;
          total_chapters: number;
          folder_id: string;
          user_id: string;
          cover_url: string | null;
          rating: number | null;
          notes: string | null;
          synopsis: string | null;
          genre: string[] | null;
          tags: string[] | null;
          year: number | null;
          publisher: string | null;
          language: string;
          start_date: string | null;
          finish_date: string | null;
          last_read: string | null;
          favorite: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          title: string;
          author?: string | null;
          status?: 'reading' | 'completed' | 'plan-to-read' | 'dropped';
          progress?: number;
          total_chapters?: number;
          folder_id: string;
          user_id: string;
          cover_url?: string | null;
          rating?: number | null;
          notes?: string | null;
          synopsis?: string | null;
          genre?: string[] | null;
          tags?: string[] | null;
          year?: number | null;
          publisher?: string | null;
          language?: string;
          start_date?: string | null;
          finish_date?: string | null;
          last_read?: string | null;
          favorite?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          title?: string;
          author?: string | null;
          status?: 'reading' | 'completed' | 'plan-to-read' | 'dropped';
          progress?: number;
          total_chapters?: number;
          folder_id?: string;
          user_id?: string;
          cover_url?: string | null;
          rating?: number | null;
          notes?: string | null;
          synopsis?: string | null;
          genre?: string[] | null;
          tags?: string[] | null;
          year?: number | null;
          publisher?: string | null;
          language?: string;
          start_date?: string | null;
          finish_date?: string | null;
          last_read?: string | null;
          favorite?: boolean;
          created_at?: string;
          updated_at?: string;
        };
      };
    };
  };
}