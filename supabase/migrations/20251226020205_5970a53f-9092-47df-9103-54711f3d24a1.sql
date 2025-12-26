
-- Create enums
CREATE TYPE public.app_role AS ENUM ('admin', 'owner', 'seller');
CREATE TYPE public.item_status AS ENUM ('open', 'claimed', 'done');
CREATE TYPE public.seller_status AS ENUM ('waitlisted', 'active', 'paused');
CREATE TYPE public.claim_status AS ENUM ('active', 'released', 'completed');
CREATE TYPE public.pickup_preference AS ENUM ('seller_pickup', 'buyer_pickup');
CREATE TYPE public.timing_preference AS ENUM ('asap', 'within_week', 'flexible');

-- Profiles table (basic user info)
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  phone TEXT,
  first_name TEXT,
  last_name TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- User roles table (security: separate from profiles)
CREATE TABLE public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  role app_role NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (user_id, role)
);

-- Sellers table
CREATE TABLE public.sellers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL UNIQUE,
  status seller_status NOT NULL DEFAULT 'waitlisted',
  claims_used INTEGER NOT NULL DEFAULT 0,
  active_claim_id UUID,
  service_area TEXT,
  proof_link TEXT,
  proof_screenshot_url TEXT,
  applied_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  activated_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Items table
CREATE TABLE public.items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  photo_url TEXT NOT NULL,
  item_name TEXT,
  brand TEXT,
  location TEXT NOT NULL,
  min_price DECIMAL(10,2) NOT NULL,
  pickup_preference pickup_preference NOT NULL,
  timing timing_preference DEFAULT 'flexible',
  note TEXT,
  status item_status NOT NULL DEFAULT 'open',
  owner_confirmed_terms BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Claims table
CREATE TABLE public.claims (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  item_id UUID REFERENCES public.items(id) ON DELETE CASCADE NOT NULL,
  seller_id UUID REFERENCES public.sellers(id) ON DELETE CASCADE NOT NULL,
  status claim_status NOT NULL DEFAULT 'active',
  contact_revealed BOOLEAN NOT NULL DEFAULT false,
  seller_confirmed_terms BOOLEAN NOT NULL DEFAULT false,
  outcome TEXT,
  claimed_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  released_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Admin notifications table
CREATE TABLE public.admin_notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  type TEXT NOT NULL,
  title TEXT NOT NULL,
  message TEXT,
  related_user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  related_item_id UUID REFERENCES public.items(id) ON DELETE SET NULL,
  related_claim_id UUID REFERENCES public.claims(id) ON DELETE SET NULL,
  is_read BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Update sellers active_claim_id foreign key
ALTER TABLE public.sellers 
  ADD CONSTRAINT fk_active_claim 
  FOREIGN KEY (active_claim_id) REFERENCES public.claims(id) ON DELETE SET NULL;

-- Enable RLS on all tables
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sellers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.claims ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.admin_notifications ENABLE ROW LEVEL SECURITY;

-- Security definer function to check roles (prevents RLS recursion)
CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role app_role)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = _user_id AND role = _role
  )
$$;

-- Updated_at trigger function
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply updated_at triggers
CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_sellers_updated_at BEFORE UPDATE ON public.sellers
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_items_updated_at BEFORE UPDATE ON public.items
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_claims_updated_at BEFORE UPDATE ON public.claims
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Handle new user signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, email, first_name, last_name, phone)
  VALUES (
    NEW.id,
    NEW.email,
    NEW.raw_user_meta_data ->> 'first_name',
    NEW.raw_user_meta_data ->> 'last_name',
    NEW.raw_user_meta_data ->> 'phone'
  );
  RETURN NEW;
END;
$$;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- RLS Policies for profiles
CREATE POLICY "Users can view own profile" ON public.profiles
  FOR SELECT TO authenticated USING (auth.uid() = id);
CREATE POLICY "Users can update own profile" ON public.profiles
  FOR UPDATE TO authenticated USING (auth.uid() = id);
CREATE POLICY "Admins can view all profiles" ON public.profiles
  FOR SELECT TO authenticated USING (public.has_role(auth.uid(), 'admin'));

-- RLS Policies for user_roles
CREATE POLICY "Users can view own roles" ON public.user_roles
  FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Admins can manage all roles" ON public.user_roles
  FOR ALL TO authenticated USING (public.has_role(auth.uid(), 'admin'));

-- RLS Policies for sellers
CREATE POLICY "Sellers can view own record" ON public.sellers
  FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Sellers can update own record" ON public.sellers
  FOR UPDATE TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Anyone can apply as seller" ON public.sellers
  FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Admins can manage all sellers" ON public.sellers
  FOR ALL TO authenticated USING (public.has_role(auth.uid(), 'admin'));

-- RLS Policies for items
CREATE POLICY "Anyone can view open items" ON public.items
  FOR SELECT TO authenticated USING (status = 'open' OR owner_id = auth.uid());
CREATE POLICY "Owners can insert own items" ON public.items
  FOR INSERT TO authenticated WITH CHECK (auth.uid() = owner_id);
CREATE POLICY "Owners can update own items" ON public.items
  FOR UPDATE TO authenticated USING (auth.uid() = owner_id);
CREATE POLICY "Admins can manage all items" ON public.items
  FOR ALL TO authenticated USING (public.has_role(auth.uid(), 'admin'));

-- RLS Policies for claims
CREATE POLICY "Sellers can view own claims" ON public.claims
  FOR SELECT TO authenticated USING (
    seller_id IN (SELECT id FROM public.sellers WHERE user_id = auth.uid())
  );
CREATE POLICY "Owners can view claims on their items" ON public.claims
  FOR SELECT TO authenticated USING (
    item_id IN (SELECT id FROM public.items WHERE owner_id = auth.uid())
  );
CREATE POLICY "Active sellers can create claims" ON public.claims
  FOR INSERT TO authenticated WITH CHECK (
    seller_id IN (SELECT id FROM public.sellers WHERE user_id = auth.uid() AND status = 'active')
  );
CREATE POLICY "Sellers can update own claims" ON public.claims
  FOR UPDATE TO authenticated USING (
    seller_id IN (SELECT id FROM public.sellers WHERE user_id = auth.uid())
  );
CREATE POLICY "Admins can manage all claims" ON public.claims
  FOR ALL TO authenticated USING (public.has_role(auth.uid(), 'admin'));

-- RLS Policies for admin_notifications
CREATE POLICY "Admins can manage notifications" ON public.admin_notifications
  FOR ALL TO authenticated USING (public.has_role(auth.uid(), 'admin'));
