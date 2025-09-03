@@ .. @@
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
+
+-- Insert admin user if not exists
+DO $$
+BEGIN
+  -- Check if admin user exists in auth.users
+  IF NOT EXISTS (
+    SELECT 1 FROM auth.users WHERE email = 'admin@mangadesk.com'
+  ) THEN
+    -- Insert admin user
+    INSERT INTO auth.users (
+      instance_id,
+      id,
+      aud,
+      role,
+      email,
+      encrypted_password,
+      email_confirmed_at,
+      created_at,
+      updated_at,
+      confirmation_token,
+      email_change,
+      email_change_token_new,
+      recovery_token
+    ) VALUES (
+      '00000000-0000-0000-0000-000000000000',
+      gen_random_uuid(),
+      'authenticated',
+      'authenticated',
+      'admin@mangadesk.com',
+      crypt('admin10', gen_salt('bf')),
+      now(),
+      now(),
+      now(),
+      '',
+      '',
+      '',
+      ''
+    );
+  END IF;
+END $$;