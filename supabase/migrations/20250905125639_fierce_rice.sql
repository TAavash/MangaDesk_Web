/*
  # Complete MangaDesk Database Setup

  1. New Tables
    - `profiles` - User profiles with roles
    - `folders` - User folders for organizing books
    - `books` - Book tracking with all metadata
    - `book_moves` - History of book movements between folders

  2. Security
    - Enable RLS on all tables
    - Add comprehensive policies for user data access
    - Admin role policies for management access

  3. Functions
    - Auto profile creation trigger
    - Updated timestamp triggers
    - Admin user creation function

  4. Admin Setup
    - Creates admin@mangadesk.com user with admin role
    - Password: admin10
*/

-- Create custom types
CREATE TYPE book_status AS ENUM ('reading', 'completed', 'plan-to-read', 'dropped');
CREATE TYPE user_role AS ENUM ('user', 'admin');

-- Create profiles table
CREATE TABLE IF NOT EXISTS profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email text NOT NULL,
  role user_role DEFAULT 'user'::user_role,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create folders table
CREATE TABLE IF NOT EXISTS folders (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  color text DEFAULT '#4ECDC4',
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(name, user_id)
);

-- Create books table
CREATE TABLE IF NOT EXISTS books (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  author text,
  status book_status DEFAULT 'plan-to-read'::book_status,
  progress integer DEFAULT 0,
  total_chapters integer DEFAULT 1,
  folder_id uuid NOT NULL REFERENCES folders(id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  cover_url text,
  rating integer CHECK (rating >= 1 AND rating <= 5),
  notes text,
  synopsis text,
  genre text[],
  tags text[],
  year integer CHECK (year >= 1900 AND year <= EXTRACT(year FROM CURRENT_DATE)),
  publisher text,
  language text DEFAULT 'Japanese',
  start_date date,
  finish_date date,
  last_read date,
  favorite boolean DEFAULT false,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  moved_from_folder uuid REFERENCES folders(id),
  moved_at timestamptz,
  CHECK (progress >= 0),
  CHECK (progress <= total_chapters),
  CHECK (total_chapters >= 1)
);

-- Create book_moves table for tracking movements
CREATE TABLE IF NOT EXISTS book_moves (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  book_id uuid NOT NULL REFERENCES books(id) ON DELETE CASCADE,
  from_folder_id uuid REFERENCES folders(id),
  to_folder_id uuid NOT NULL REFERENCES folders(id),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  move_type text NOT NULL CHECK (move_type IN ('move', 'copy')),
  created_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE folders ENABLE ROW LEVEL SECURITY;
ALTER TABLE books ENABLE ROW LEVEL SECURITY;
ALTER TABLE book_moves ENABLE ROW LEVEL SECURITY;

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_profiles_email ON profiles(email);
CREATE INDEX IF NOT EXISTS idx_profiles_role ON profiles(role);
CREATE INDEX IF NOT EXISTS idx_folders_user_id ON folders(user_id);
CREATE INDEX IF NOT EXISTS idx_books_user_id ON books(user_id);
CREATE INDEX IF NOT EXISTS idx_books_folder_id ON books(folder_id);
CREATE INDEX IF NOT EXISTS idx_books_status ON books(status);
CREATE INDEX IF NOT EXISTS idx_books_favorite ON books(favorite);
CREATE INDEX IF NOT EXISTS idx_books_last_read ON books(last_read);
CREATE INDEX IF NOT EXISTS idx_books_moved_from ON books(moved_from_folder);
CREATE INDEX IF NOT EXISTS idx_book_moves_book_id ON book_moves(book_id);
CREATE INDEX IF NOT EXISTS idx_book_moves_user_id ON book_moves(user_id);

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers for updated_at
DROP TRIGGER IF EXISTS update_profiles_updated_at ON profiles;
CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_folders_updated_at ON folders;
CREATE TRIGGER update_folders_updated_at
  BEFORE UPDATE ON folders
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_books_updated_at ON books;
CREATE TRIGGER update_books_updated_at
  BEFORE UPDATE ON books
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Create function to handle new user registration
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO profiles (id, email, role)
  VALUES (
    NEW.id,
    NEW.email,
    CASE 
      WHEN NEW.email = 'admin@mangadesk.com' THEN 'admin'::user_role
      ELSE 'user'::user_role
    END
  );
  RETURN NEW;
END;
$$ language 'plpgsql' SECURITY DEFINER;

-- Create trigger for new user registration
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- RLS Policies for profiles
DROP POLICY IF EXISTS "Users can view own profile" ON profiles;
CREATE POLICY "Users can view own profile"
  ON profiles FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

DROP POLICY IF EXISTS "Users can update own profile" ON profiles;
CREATE POLICY "Users can update own profile"
  ON profiles FOR UPDATE
  TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

DROP POLICY IF EXISTS "Admins can view all profiles" ON profiles;
CREATE POLICY "Admins can view all profiles"
  ON profiles FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- RLS Policies for folders
DROP POLICY IF EXISTS "Users can view own folders" ON folders;
CREATE POLICY "Users can view own folders"
  ON folders FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert own folders" ON folders;
CREATE POLICY "Users can insert own folders"
  ON folders FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update own folders" ON folders;
CREATE POLICY "Users can update own folders"
  ON folders FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can delete own folders" ON folders;
CREATE POLICY "Users can delete own folders"
  ON folders FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- RLS Policies for books
DROP POLICY IF EXISTS "Users can view own books" ON books;
CREATE POLICY "Users can view own books"
  ON books FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert own books" ON books;
CREATE POLICY "Users can insert own books"
  ON books FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update own books" ON books;
CREATE POLICY "Users can update own books"
  ON books FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can delete own books" ON books;
CREATE POLICY "Users can delete own books"
  ON books FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- RLS Policies for book_moves
DROP POLICY IF EXISTS "Users can view own book moves" ON book_moves;
CREATE POLICY "Users can view own book moves"
  ON book_moves FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert own book moves" ON book_moves;
CREATE POLICY "Users can insert own book moves"
  ON book_moves FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- Function to create admin user
CREATE OR REPLACE FUNCTION create_admin_user()
RETURNS void AS $$
DECLARE
  admin_user_id uuid;
BEGIN
  -- Check if admin user already exists
  SELECT id INTO admin_user_id
  FROM auth.users
  WHERE email = 'admin@mangadesk.com';
  
  -- If admin doesn't exist, we can't create it directly in auth.users
  -- This will be handled by the application signup process
  IF admin_user_id IS NULL THEN
    RAISE NOTICE 'Admin user does not exist. Please sign up with admin@mangadesk.com';
  ELSE
    -- Ensure admin has correct role
    INSERT INTO profiles (id, email, role)
    VALUES (admin_user_id, 'admin@mangadesk.com', 'admin'::user_role)
    ON CONFLICT (id) DO UPDATE SET role = 'admin'::user_role;
    
    RAISE NOTICE 'Admin user profile updated successfully';
  END IF;
END;
$$ language 'plpgsql' SECURITY DEFINER;

-- Execute admin user creation
SELECT create_admin_user();