## InviteAI MVP

Arabic-focused AI invitation generator built with Next.js 14, TailwindCSS, Supabase, Replicate (SDXL), Fabric.js, and Stripe.

### Getting started

1. Install dependencies:

```bash
npm install
```

2. Configure environment variables in `.env.local`:

```bash
NEXT_PUBLIC_SUPABASE_URL=...
NEXT_PUBLIC_SUPABASE_ANON_KEY=...
REPLICATE_API_TOKEN=...
REPLICATE_SDXL_MODEL=stability-ai/sdxl-lightning:dc9d0d8e4a9c4f8e8b9b8e96e65e6a85
NEXT_PUBLIC_STRIPE_PAYMENT_LINK=https://buy.stripe.com/...
```

3. Run dev server:

```bash
npm run dev
```

Open `/editor` to access the main UI.

### Supabase schema

Run this SQL in Supabase:

```sql
create table users (
  id uuid primary key default uuid_generate_v4(),
  email text,
  created_at timestamp with time zone default now()
);

create table designs (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid references users (id),
  created_at timestamp with time zone default now()
);

create table generations (
  id uuid primary key default uuid_generate_v4(),
  design_id uuid references designs (id),
  parent_generation_id uuid references generations (id),
  prompt text,
  image_url text,
  size_preset_id text,
  created_at timestamp with time zone default now()
);

create table downloads (
  id uuid primary key default uuid_generate_v4(),
  generation_id uuid references generations (id),
  paid boolean default false,
  created_at timestamp with time zone default now()
);
```

