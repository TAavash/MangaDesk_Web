/*
  # Create Admin User and Update Schema

  1. New Features
    - Add admin user with email: admin@mangadesk.com
    - Add role field to user profiles
    - Add password change functionality
    - Add book transfer capabilities

  2. Security
    - Enable RLS on profiles table
    - Add policies for user management
*/

-- Create profiles table for user roles
CREATE TABLE IF NOT EXISTS profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email text NOT NULL,
  role text DEFAULT 'user' CHECK (role IN ('user', 'admin')),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Enable RLS on profiles
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- Create policies for profiles
CREATE POLICY "Users can view own profile"
  ON profiles
  FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "Users can update own profile"
  ON profiles
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

CREATE POLICY "Admins can view all profiles"
  ON profiles
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Create function to handle new user registration
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO profiles (id, email, role)
  VALUES (
    NEW.id,
    NEW.email,
    CASE 
      WHEN NEW.email = 'admin@mangadesk.com' THEN 'admin'
      ELSE 'user'
    END
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger for new user registration
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- Add book transfer functionality
ALTER TABLE books ADD COLUMN IF NOT EXISTS moved_from_folder uuid REFERENCES folders(id);
ALTER TABLE books ADD COLUMN IF NOT EXISTS moved_at timestamptz;

-- Create function to move books between folders
CREATE OR REPLACE FUNCTION move_book_to_folder(
  book_id uuid,
  new_folder_id uuid,
  user_id uuid
)
RETURNS boolean AS $$
BEGIN
  -- Check if user owns both the book and the target folder
  IF NOT EXISTS (
    SELECT 1 FROM books b
    JOIN folders f ON f.id = new_folder_id
    WHERE b.id = book_id 
    AND b.user_id = user_id 
    AND f.user_id = user_id
  ) THEN
    RETURN false;
  END IF;

  -- Update book folder
  UPDATE books 
  SET 
    moved_from_folder = folder_id,
    folder_id = new_folder_id,
    moved_at = now(),
    updated_at = now()
  WHERE id = book_id AND user_id = user_id;

  RETURN true;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_profiles_role ON profiles(role);
CREATE INDEX IF NOT EXISTS idx_profiles_email ON profiles(email);
CREATE INDEX IF NOT EXISTS idx_books_moved_from ON books(moved_from_folder);

-- Update triggers for profiles
CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON profiles
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();