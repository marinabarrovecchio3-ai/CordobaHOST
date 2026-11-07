-- Esquema de CórdobaHOST: propiedades, administradores y fotos.
-- Se aplica una sola vez en el proyecto de Supabase.

create table public.propiedades (
  id uuid primary key default gen_random_uuid(),
  nombre text not null,
  zona text not null,
  tipo text not null,
  descripcion text not null default '',
  precio integer not null check (precio >= 0),
  limpieza integer not null default 0 check (limpieza >= 0), -- cargo por estadía; 0 = sin cargo
  huespedes_min integer not null default 1 check (huespedes_min >= 1),
  huespedes_max integer not null check (huespedes_max >= 1),
  dormitorios integer not null default 1 check (dormitorios >= 0),
  banos integer not null default 1 check (banos >= 0),
  mascotas boolean not null default false,
  pileta boolean not null default false,
  cochera boolean not null default false,
  cochera_camioneta boolean not null default false,
  aire boolean not null default false,
  ropa_blanca boolean not null default false,
  fotos text[] not null default '{}',
  destacado boolean not null default false,
  activo boolean not null default true,
  orden integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint huespedes_rango check (huespedes_min <= huespedes_max),
  constraint camioneta_requiere_cochera check (not cochera_camioneta or cochera)
);

-- Emails que pueden entrar al panel de administración
create table public.admins (
  email text primary key check (email = lower(email))
);

-- En un esquema privado para que no quede expuesta en la API
create schema if not exists private;
grant usage on schema private to anon, authenticated;

create function private.is_admin()
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1 from public.admins
    where email = lower(coalesce(auth.jwt() ->> 'email', ''))
  );
$$;

revoke execute on function private.is_admin() from public;
grant execute on function private.is_admin() to anon, authenticated;

create function public.set_updated_at()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger propiedades_updated_at
before update on public.propiedades
for each row execute function public.set_updated_at();

alter table public.propiedades enable row level security;
alter table public.admins enable row level security;

-- Cualquiera ve las propiedades activas; los admins ven todas
create policy "ver propiedades" on public.propiedades
  for select to anon, authenticated
  using (activo or (select private.is_admin()));

create policy "admins crean" on public.propiedades
  for insert to authenticated with check ((select private.is_admin()));
create policy "admins editan" on public.propiedades
  for update to authenticated using ((select private.is_admin())) with check ((select private.is_admin()));
create policy "admins borran" on public.propiedades
  for delete to authenticated using ((select private.is_admin()));

-- Cada usuario sólo puede consultar si su propio email es admin
create policy "ver mi admin" on public.admins
  for select to authenticated
  using (email = lower(coalesce(auth.jwt() ->> 'email', '')));

-- Fotos: bucket público de lectura; sólo admins suben y borran
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('fotos', 'fotos', true, 5242880, array['image/jpeg', 'image/png', 'image/webp']);

create policy "admins suben fotos" on storage.objects
  for insert to authenticated
  with check (bucket_id = 'fotos' and (select private.is_admin()));
create policy "admins borran fotos" on storage.objects
  for delete to authenticated
  using (bucket_id = 'fotos' and (select private.is_admin()));
