-- team-files: path is <team_id>/<filename>, access follows team membership
create policy "team files read" on storage.objects for select to authenticated
using (bucket_id = 'team-files' and public.is_team_member(((storage.foldername(name))[1])::uuid, auth.uid()));
create policy "team files insert" on storage.objects for insert to authenticated
with check (bucket_id = 'team-files' and public.is_team_member(((storage.foldername(name))[1])::uuid, auth.uid()));
create policy "team files update" on storage.objects for update to authenticated
using (bucket_id = 'team-files' and public.is_team_member(((storage.foldername(name))[1])::uuid, auth.uid()));
create policy "team files delete" on storage.objects for delete to authenticated
using (bucket_id = 'team-files' and public.is_team_member(((storage.foldername(name))[1])::uuid, auth.uid()));

-- avatars: path is <user_id>/<filename>
create policy "avatars read" on storage.objects for select to authenticated
using (bucket_id = 'avatars');
create policy "avatars write own" on storage.objects for insert to authenticated
with check (bucket_id = 'avatars' and (storage.foldername(name))[1] = auth.uid()::text);
create policy "avatars update own" on storage.objects for update to authenticated
using (bucket_id = 'avatars' and (storage.foldername(name))[1] = auth.uid()::text);
create policy "avatars delete own" on storage.objects for delete to authenticated
using (bucket_id = 'avatars' and (storage.foldername(name))[1] = auth.uid()::text);
