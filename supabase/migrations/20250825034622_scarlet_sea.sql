/*
  # Create MangaDesk Database Schema

  1. New Tables
    - `folders`
      - `id` (uuid, primary key)
      - `name` (text, unique per user)
      - `color` (text, hex color)
      - `user_id` (uuid, references auth.users)
      - `created_at` (timestamp)
      - `updated_at` (timestamp)
    
    - `books`
      - `id` (uuid, primary key)
      - `title` (text, required)
      - `author` (text)
      - `status` (enum: reading, completed, plan-to-read, dropped)
      - `progress` (integer, default 0)
      - `total_chapters` (integer, default 1)
      - `folder_id` (uuid, references folders)
      - `user_id` (uuid, references auth.users)
      - `cover_url` (text)
      - `rating` (integer, 1-5)
      - `notes` (text)
      - `synopsis` (text)
      - `genre` (text array)
      - `tags` (text array)
      - `year` (integer)
      - `publisher` (text)
      - `language` (text)
      - `start_date` (date)
      - `finish_date` (date)
      - `last_read` (date)
      - `favorite` (boolean, default false)
      - `created_at` (timestamp)
      - `updated_at` (timestamp)

  2. Security
    - Enable RLS on all tables
    - Add policies for authenticated users to manage their own data
*/

-- Create custom types
CREATE TYPE book_status AS ENUM ('reading', 'completed', 'plan-to-read', 'dropped');

-- Create folders table
CREATE TABLE IF NOT EXISTS folders (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  color text DEFAULT '#4ECDC4',
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(name, user_id)
);

-- Create books table
CREATE TABLE IF NOT EXISTS books (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  author text,
  status book_status DEFAULT 'plan-to-read',
  progress integer DEFAULT 0 CHECK (progress >= 0),
  total_chapters integer DEFAULT 1 CHECK (total_chapters >= 1),
  folder_id uuid REFERENCES folders(id) ON DELETE CASCADE NOT NULL,
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  cover_url text,
  rating integer CHECK (rating >= 1 AND rating <= 5),
  notes text,
  synopsis text,
  genre text[],
  tags text[],
  year integer CHECK (year >= 1900 AND year <= EXTRACT(YEAR FROM CURRENT_DATE)),
  publisher text,
  language text DEFAULT 'Japanese',
  start_date date,
  finish_date date,
  last_read date,
  favorite boolean DEFAULT false,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  CHECK (progress <= total_chapters)
);

-- Enable Row Level Security
ALTER TABLE folders ENABLE ROW LEVEL SECURITY;
ALTER TABLE books ENABLE ROW LEVEL SECURITY;

-- Create policies for folders
CREATE POLICY "Users can view own folders"
  ON folders
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own folders"
  ON folders
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own folders"
  ON folders
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own folders"
  ON folders
  FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- Create policies for books
CREATE POLICY "Users can view own books"
  ON books
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own books"
  ON books
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own books"
  ON books
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own books"
  ON books
  FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers for updated_at
CREATE TRIGGER update_folders_updated_at
  BEFORE UPDATE ON folders
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_books_updated_at
  BEFORE UPDATE ON books
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Create function to update folder count
CREATE OR REPLACE FUNCTION update_folder_count()
RETURNS TRIGGER AS $$
BEGIN
  -- This will be handled in the application layer for better performance
  RETURN COALESCE(NEW, OLD);
END;
$$ language 'plpgsql';

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_folders_user_id ON folders(user_id);
CREATE INDEX IF NOT EXISTS idx_books_user_id ON books(user_id);
CREATE INDEX IF NOT EXISTS idx_books_folder_id ON books(folder_id);
CREATE INDEX IF NOT EXISTS idx_books_status ON books(status);
CREATE INDEX IF NOT EXISTS idx_books_favorite ON books(favorite);
CREATE INDEX IF NOT EXISTS idx_books_last_read ON books(last_read);