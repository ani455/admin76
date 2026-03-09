

## Plan: Login ko Remote MySQL Database se Link Karna

### Problem
Abhi login Supabase Auth (`auth.users` table) use kar raha hai. GitHub reference mein login `nirvahaka_shonu` table (remote MySQL DB) se hota hai — username aur MD5 hashed password check hota hai.

### GitHub Reference (maulyikarisalu.php)
```text
Table: nirvahaka_shonu
Columns: nirvahaka_hesaru (username), guptapada (md5 password), sthiti (status=1 means active), unohs (session id)
Query: SELECT * FROM nirvahaka_shonu WHERE nirvahaka_hesaru='username' AND guptapada=md5('password') AND sthiti='1'
```

### Implementation Plan

**1. Add `admin_login` action to Edge Function (`supabase/functions/remote-db/index.ts`)**
- New action `admin_login` that:
  - Takes `username` and `password` from params
  - Queries: `SELECT * FROM nirvahaka_shonu WHERE nirvahaka_hesaru=? AND guptapada=MD5(?) AND sthiti='1'`
  - If match found, returns admin data (username, permissions/unohs)
  - If no match, returns error "Invalid credentials"
- Also add a special hardcoded superadmin check (`zxcv` username) as per GitHub source

**2. Update Login Page (`src/pages/LoginPage.tsx`)**
- Remove Supabase Auth (`supabase.auth.signInWithPassword`)
- Instead call `remoteDb("admin_login", { username, password })`
- On success, store admin session in localStorage (username, unohs, login timestamp)
- Navigate to dashboard

**3. Update Auth Hook (`src/hooks/useAuth.tsx`)**
- Remove Supabase Auth listener dependency
- Instead check localStorage for admin session data
- Provide `user`, `loading`, `signOut` (clears localStorage)
- `signOut` clears localStorage and redirects to login

**4. Update Route Protection**
- Existing protected route logic should work since it checks `useAuth().user`
- Just ensure the auth hook returns a compatible user object from localStorage

### Security Note
- The original PHP system uses MD5 passwords and localStorage sessions — this matches the GitHub reference exactly
- The remote MySQL DB already has the `nirvahaka_shonu` table with admin credentials

### Files to Change
1. `supabase/functions/remote-db/index.ts` — add `admin_login` action
2. `src/pages/LoginPage.tsx` — use remoteDb instead of Supabase Auth
3. `src/hooks/useAuth.tsx` — localStorage-based session instead of Supabase Auth

