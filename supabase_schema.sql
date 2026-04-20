-- Create tables for the Service Management System

-- 1. Customers Table
CREATE TABLE customers (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  contact_number TEXT NOT NULL,
  address TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. Service Centers Table
CREATE TABLE service_centers (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  location TEXT NOT NULL,
  contact_info TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. Products / Service Tickets Table
CREATE TABLE products (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  customer_id UUID REFERENCES customers(id) ON DELETE CASCADE,
  product_type TEXT NOT NULL, -- e.g., 'Set-Top Box', 'Modem'
  serial_number TEXT NOT NULL,
  mac_address TEXT,
  under_warranty BOOLEAN DEFAULT FALSE,
  status TEXT DEFAULT 'Received', -- 'Received', 'In Service', 'Dispatched', 'Completed'
  service_center_id UUID REFERENCES service_centers(id) ON DELETE SET NULL,
  courier_name TEXT,
  tracking_number TEXT,
  dispatch_date DATE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 4. Profiles / Users Table
CREATE TYPE user_role AS ENUM ('admin', 'operator', 'service_center');

CREATE TABLE profiles (
  id UUID REFERENCES auth.users ON DELETE CASCADE PRIMARY KEY,
  email TEXT NOT NULL,
  role user_role DEFAULT 'operator' NOT NULL,
  service_center_id UUID REFERENCES service_centers(id) ON DELETE SET NULL, -- Only for service_center role
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Turn on RLS
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE customers ENABLE ROW LEVEL SECURITY;
ALTER TABLE service_centers ENABLE ROW LEVEL SECURITY;
ALTER TABLE products ENABLE ROW LEVEL SECURITY;

-- Profiles Policies
CREATE POLICY "Users can view their own profile"
  ON profiles FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Admins can view all profiles"
  ON profiles FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid() AND profiles.role = 'admin'
    )
  );

-- Customers Policies
CREATE POLICY "Everyone authenticated can view customers"
  ON customers FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Admins and Operators can manage customers"
  ON customers FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid() AND profiles.role IN ('admin', 'operator')
    )
  );

-- Service Centers Policies
CREATE POLICY "Everyone authenticated can view service centers"
  ON service_centers FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Only admins can manage service centers"
  ON service_centers FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid() AND profiles.role = 'admin'
    )
  );

-- Products Policies
CREATE POLICY "Admins and Operators can view all products"
  ON products FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid() AND profiles.role IN ('admin', 'operator')
    )
  );

CREATE POLICY "Service Centers can view products assigned to them"
  ON products FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid() 
      AND profiles.role = 'service_center'
      AND products.service_center_id = profiles.service_center_id
    )
  );

CREATE POLICY "Admins and Operators can manage all products"
  ON products FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid() AND profiles.role IN ('admin', 'operator')
    )
  );

-- Trigger to create profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, role)
  VALUES (new.id, new.email, 'operator');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();

-- Insert some dummy service centers
INSERT INTO service_centers (name, location, contact_info) VALUES 
('Main Hub Tech Services', 'Downtown', 'contact@mainhub.com'),
('Eastside Repairs', 'East District', 'eastside@repairs.com');
