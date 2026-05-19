create extension if not exists "pgcrypto";

create table if not exists public.households (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  currency text not null default 'RUB',
  timezone text not null default 'Europe/Moscow',
  created_by uuid not null references auth.users(id) on delete cascade,
  created_at timestamptz not null default now()
);

create table if not exists public.household_members (
  id uuid primary key default gen_random_uuid(),
  household_id uuid not null references public.households(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  display_name text not null,
  role text not null check (role in ('owner', 'partner')),
  created_at timestamptz not null default now(),
  unique (household_id, user_id)
);

create table if not exists public.household_invites (
  id uuid primary key default gen_random_uuid(),
  household_id uuid not null references public.households(id) on delete cascade,
  email text not null,
  token text not null unique,
  status text not null default 'pending' check (status in ('pending', 'accepted', 'revoked')),
  expires_at timestamptz not null,
  created_by uuid not null references auth.users(id) on delete cascade,
  created_at timestamptz not null default now()
);

create table if not exists public.budget_events (
  id uuid primary key default gen_random_uuid(),
  household_id uuid not null references public.households(id) on delete cascade,
  member_id uuid references public.household_members(id) on delete cascade,
  title text not null,
  amount numeric(14, 2) not null check (amount >= 0),
  occurred_at timestamptz not null,
  direction text not null check (direction in ('income', 'expense')),
  scope text not null check (scope in ('personal', 'shared', 'fund', 'goal')),
  recurrence_rule text,
  created_at timestamptz not null default now()
);

alter table public.households enable row level security;
alter table public.household_members enable row level security;
alter table public.household_invites enable row level security;
alter table public.budget_events enable row level security;

create policy "members can read households"
on public.households for select
using (
  exists (
    select 1 from public.household_members hm
    where hm.household_id = households.id and hm.user_id = auth.uid()
  )
);

create policy "authenticated users can create households"
on public.households for insert
with check (created_by = auth.uid());

create policy "owners can update households"
on public.households for update
using (
  exists (
    select 1 from public.household_members hm
    where hm.household_id = households.id
      and hm.user_id = auth.uid()
      and hm.role = 'owner'
  )
);

create policy "users can join owned or invited households"
on public.household_members for insert
with check (
  user_id = auth.uid()
  and (
    (
      role = 'owner'
      and exists (
        select 1 from public.households h
        where h.id = household_members.household_id
          and h.created_by = auth.uid()
      )
    )
    or (
      role = 'partner'
      and exists (
        select 1 from public.household_invites hi
        where hi.household_id = household_members.household_id
          and lower(hi.email) = lower(auth.jwt() ->> 'email')
          and hi.status = 'pending'
          and hi.expires_at > now()
      )
    )
  )
);

create policy "members can read members"
on public.household_members for select
using (
  exists (
    select 1 from public.household_members hm
    where hm.household_id = household_members.household_id
      and hm.user_id = auth.uid()
  )
);

create policy "owners can manage invites"
on public.household_invites for all
using (
  exists (
    select 1 from public.household_members hm
    where hm.household_id = household_invites.household_id
      and hm.user_id = auth.uid()
      and hm.role = 'owner'
  )
)
with check (
  exists (
    select 1 from public.household_members hm
    where hm.household_id = household_invites.household_id
      and hm.user_id = auth.uid()
      and hm.role = 'owner'
  )
);

create policy "members can manage budget events"
on public.budget_events for all
using (
  exists (
    select 1 from public.household_members hm
    where hm.household_id = budget_events.household_id
      and hm.user_id = auth.uid()
  )
)
with check (
  exists (
    select 1 from public.household_members hm
    where hm.household_id = budget_events.household_id
      and hm.user_id = auth.uid()
  )
);
