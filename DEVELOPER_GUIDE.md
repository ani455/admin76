# Rivestro Admin Panel — Developer Guide

> **Last updated:** March 2026  
> **Stack:** React 18 + Vite + TypeScript + Tailwind CSS + Supabase Edge Functions + Remote MySQL

---

## 📁 Project Structure

```
├── src/
│   ├── App.tsx                    # Root: routes, providers, auth guard
│   ├── main.tsx                   # Entry point
│   ├── index.css                  # Design system (CSS variables, utility classes)
│   ├── components/
│   │   ├── AdminLayout.tsx        # Shell: sidebar + content area + mobile header
│   │   ├── AdminSidebar.tsx       # Navigation sidebar (menu groups defined here)
│   │   ├── NavLink.tsx            # Reusable nav link component
│   │   └── ui/                    # shadcn/ui components (do not edit directly)
│   ├── hooks/
│   │   ├── useAuth.tsx            # Auth context: login/logout, session in localStorage
│   │   ├── useTheme.tsx           # Dark/light mode toggle
│   │   ├── use-mobile.tsx         # Mobile breakpoint detection
│   │   └── use-toast.ts           # Toast hook
│   ├── lib/
│   │   ├── remoteDb.ts            # API client: calls Edge Function for all DB operations
│   │   └── utils.ts               # Tailwind merge utility
│   ├── pages/                     # All page components (one per route)
│   │   ├── Dashboard.tsx
│   │   ├── LoginPage.tsx
│   │   ├── GameManagerPage.tsx    # Handles all game types via URL params
│   │   ├── ManageUsersPage.tsx    # User list + detail drawer
│   │   ├── DepositUpdatePage.tsx  # Pending/completed deposits
│   │   ├── WithdrawManagePage.tsx # Pending/completed withdrawals
│   │   └── ...                    # Other feature pages
│   └── integrations/supabase/     # Auto-generated (DO NOT EDIT)
│       ├── client.ts
│       └── types.ts
├── supabase/
│   ├── config.toml                # Edge function config (auto-generated)
│   └── functions/
│       └── remote-db/
│           └── index.ts           # ⭐ ALL backend logic lives here
├── .env                           # Auto-generated Supabase env vars
└── DEVELOPER_GUIDE.md             # This file
```

---

## 🔗 Frontend ↔ Backend Connection

### How it works

1. **Frontend** calls `remoteDb(action, params)` from `src/lib/remoteDb.ts`
2. This invokes the **Supabase Edge Function** at `supabase/functions/remote-db/index.ts`
3. The Edge Function connects to an **external MySQL database** (credentials via Supabase secrets)
4. Results flow back as JSON

### Example flow

```typescript
// Frontend (any page)
import { remoteDb } from "@/lib/remoteDb";

const data = await remoteDb("get_users", { search: "john", page: 1 });
// → Calls Edge Function with { action: "get_users", params: { search: "john", page: 1 } }
// → Edge Function queries MySQL and returns { data: { users: [...], total: 42 } }
```

### Adding a new API action

1. Open `supabase/functions/remote-db/index.ts`
2. Add your action name to the `ALLOWED_ACTIONS` set
3. Add a new `case` in the `switch (action)` block
4. Use parameterized queries: `await db.query("SELECT * FROM table WHERE id = ?", [id])`
5. Set `result = yourData` and `break`
6. The function auto-deploys on save

---

## 🗄️ Database (MySQL)

### Table naming convention

The remote MySQL database uses **obfuscated table/column names** from the original PHP source. A mapping is documented at the top of `supabase/functions/remote-db/index.ts`:

| Obfuscated Name | Actual Purpose |
|---|---|
| `shonu_subjects` | Users table |
| `shonu_kaichila` | Wallets (balance) |
| `thevani` | Deposits |
| `hintegedukolli` | Withdrawals |
| `bajikattuttate*` | Bet records (various game/duration tables) |
| `gelluonduhogu*` | Game period records |
| `hastacalita_phalitansa*` | Game prediction settings |
| `nirvahaka_shonu` | Admin users |

> ⚠️ **CRITICAL:** Never rename these tables/columns. They must match the PHP backend exactly.

### Where DB queries happen

**ALL database queries** are in one file: `supabase/functions/remote-db/index.ts`

There is no ORM. Raw parameterized MySQL queries are used via `mysql2/promise`.

### Updating the schema

Since this connects to an external MySQL database (not Supabase's Postgres), schema changes must be done:
1. Directly on the remote MySQL server
2. Then update the Edge Function queries accordingly

The Supabase Postgres database (`admin_users`, `bets`, etc. in `types.ts`) is **not actively used** — all data comes from the remote MySQL.

---

## 🧭 Navigation: Adding a Sidebar Option

### Step 1: Add the menu item

Open `src/components/AdminSidebar.tsx` and find the `menuGroups` array:

```typescript
const menuGroups: MenuGroup[] = [
  {
    title: "Finance",        // Group name
    icon: Wallet,            // Group icon
    items: [
      { title: "USDT Rate", path: "/finance/usdt-rate", icon: DollarSign },
      // Add your new item here:
      { title: "My New Page", path: "/finance/my-new-page", icon: SomeIcon },
    ],
  },
  // ...
];
```

### Step 2: Create the page component

Create `src/pages/MyNewPage.tsx`:

```tsx
import { motion } from "framer-motion";

export default function MyNewPage() {
  return (
    <div>
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="text-2xl font-bold text-foreground font-display">My New Page</h1>
        <p className="text-sm text-muted-foreground mt-1">Description</p>
      </motion.div>
      {/* Your content */}
    </div>
  );
}
```

### Step 3: Register the route

Open `src/App.tsx` and add inside `<Route element={<ProtectedRoutes />}>`:

```tsx
import MyNewPage from "./pages/MyNewPage";
// ...
<Route path="/finance/my-new-page" element={<MyNewPage />} />
```

---

## 🎨 Design System

### CSS Variables (index.css)

All colors are HSL-based CSS variables. Use semantic tokens:

```tsx
// ✅ Correct
<div className="bg-card text-foreground border-border" />
<span className="text-muted-foreground" />
<button className="bg-primary text-primary-foreground" />

// ❌ Wrong — never hardcode colors
<div className="bg-gray-900 text-white" />
```

### Utility CSS classes

| Class | Purpose |
|---|---|
| `.glass-card-solid` | Card with gradient background + border |
| `.glass-table` | Table wrapper with card background |
| `.admin-table` | Styled table with themed headers |
| `.search-input` | Styled search input field |
| `.select-dark` | Styled select dropdown |
| `.btn-neon` | Primary action button with glow |
| `.btn-danger` | Destructive action button |
| `.badge-success/danger/warning/info` | Status badges |
| `.page-enter` | Page entrance animation |

### Component patterns

```tsx
// Stats card
<div className="glass-card-solid rounded-xl p-4">
  <p className="text-[10px] text-muted-foreground uppercase">Label</p>
  <p className="text-xl font-bold text-foreground">Value</p>
</div>

// Table
<div className="glass-table rounded-2xl overflow-hidden">
  <table className="admin-table">
    <thead><tr><th>Column</th></tr></thead>
    <tbody><tr><td>Data</td></tr></tbody>
  </table>
</div>

// Animated entrance
<motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
  Content
</motion.div>
```

---

## 🔐 Authentication

### How it works

- Admin logs in via `LoginPage.tsx` → calls `remoteDb("admin_login", { username, password })`
- On success, session is stored in `localStorage` (key: `rivestro_admin_session`)
- Session expires after **24 hours**
- `ProtectedRoutes` in `App.tsx` checks auth and redirects to `/login` if not authenticated
- `useAuth()` hook provides `user`, `signIn()`, `signOut()`

### Security notes

- Login has **rate limiting** (5 attempts per 15 minutes per username)
- Action whitelist prevents arbitrary function calls
- All inputs are sanitized via `sanitizeString()` and `sanitizeNumber()`
- All SQL queries use **parameterized statements** (no string interpolation)

---

## 🚀 Deployment

### Auto-deploy

- Edge Functions deploy automatically when code is saved in Lovable
- Frontend is built and deployed via Lovable's publish flow
- Published URL: `https://admin76.lovable.app`

### Environment secrets (configured in Lovable Cloud)

| Secret | Purpose |
|---|---|
| `REMOTE_DB_HOST` | MySQL server hostname |
| `REMOTE_DB_USER` | MySQL username |
| `REMOTE_DB_NAME` | MySQL database name |
| `REMOTE_DB_PASSWORD` | MySQL password |

---

## 📋 Common Tasks

### Adding a new data view page

1. Add backend action in `remote-db/index.ts` (add to `ALLOWED_ACTIONS` + `switch`)
2. Create page component in `src/pages/`
3. Add route in `src/App.tsx`
4. Add sidebar link in `src/components/AdminSidebar.tsx`

### Modifying an existing query

1. Find the action name (e.g., `"get_users"`) in the page component
2. Search for that action in `supabase/functions/remote-db/index.ts`
3. Edit the SQL query (always use `?` placeholders)
4. The function redeploys automatically

### Adding input validation

```typescript
// In the Edge Function
case "my_action": {
  validateRequired(params, ["userId", "amount"]);
  const userId = sanitizeString(String(params.userId));
  const amount = sanitizeNumber(params.amount, 0.01, 1000000);
  // ... use sanitized values in queries
}
```

---

## ⚠️ Important Rules

1. **Never edit** `src/integrations/supabase/client.ts` or `types.ts` — auto-generated
2. **Never edit** `.env` or `supabase/config.toml` — auto-generated
3. **Always use parameterized queries** — never interpolate user input into SQL
4. **Keep obfuscated table names** — they must match the PHP source exactly
5. **Use design tokens** — never hardcode colors in components
6. **Test on mobile** — all pages must be responsive
