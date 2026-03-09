# Admin Panel Changelog

## Overview
This admin panel is built for a gaming/betting platform with user management, deposits, withdrawals, and game control features. It connects to a remote MySQL database via edge functions.

---

## 📊 Database Table Mapping (Obfuscated Names)

| Frontend Name | DB Table | Key Columns |
|---------------|----------|-------------|
| Users | `shonu_subjects` | id, mobile, code (referral), owncode, ip, status, pwd, createdate, account_frozen, name |
| Wallets | `shonu_kaichila` | balakedara (user_id), motta (balance) |
| Deposits | `thevani` | shonu (id), balakedara (user_id), duravani (mobile), ullekha (utr), motta (amount), dharavahi (order_id), dinankavannuracisi (date), sthiti (0=pending, 1=approved, 2=rejected) |
| Withdrawals | `hintegedukolli` | shonu (id), balakedara (user_id), motta (amount), dharavahi (order_id), dinankavannuracisi (date), sthiti (status), khateshonu (bank_id), tike (remark) |
| Bank Accounts | `khate` | phalanubhavi (holder), kod (ifsc), khatehesaru (bank_name), khatesankhye (account_no), byabaharkarta (user_id), sthiti (status) |
| Bank Cards | `bankcard` | id, userid, name, type, account |
| Demo Users | `demo` | balakedara (user_id), sthiti (status) |
| Agents | `tb_agent` | userid, mobile, type, salary, status |
| Gift Codes | `hodike_nirvahaka` | enserie (code), utilisateurmax (max_users), prix (price), nombredutilisateurs (used_count) |
| Game Settings | `game_win_settings` | game (mode), process_type |

### Betting Tables
| Game | 1min | 3min | 5min | 10min |
|------|------|------|------|-------|
| WinGo | bajikattuttate | bajikattuttate_drei | bajikattuttate_funf | bajikattuttate_zehn |
| K3 | bajikattuttate_kemuru | bajikattuttate_kemuru_drei | bajikattuttate_kemuru_funf | bajikattuttate_kemuru_zehn |
| 5D | bajikattuttate_aidudi | bajikattuttate_aidudi_drei | bajikattuttate_aidudi_funf | bajikattuttate_aidudi_zehn |

### Period Tables
| Game | 1min | 3min | 5min | 10min |
|------|------|------|------|-------|
| WinGo | gelluonduhogu | gelluonduhogu_drei | gelluonduhogu_funf | gelluonduhogu_zehn |
| K3 | gelluonduhogu_kemuru | gelluonduhogu_kemuru_drei | gelluonduhogu_kemuru_funf | gelluonduhogu_kemuru_zehn |
| 5D | gelluonduhogu_aidudi | gelluonduhogu_aidudi_drei | gelluonduhogu_aidudi_funf | gelluonduhogu_aidudi_zehn |

### Prediction Tables
| Game | 1min | 3min | 5min | 10min/30sec |
|------|------|------|------|-------------|
| WinGo | hastacalita_phalitansa | hastacalita_phalitansa_drei | hastacalita_phalitansa_funf | hastacalita_phalitansa_zehn |
| K3 | hastacalita_phalitansa_kemuru | hastacalita_phalitansa_kemuru_drei | hastacalita_phalitansa_kemuru_funf | hastacalita_phalitansa_kemuru_zehn |
| 5D | hastacalita_phalitansa_aidudi | hastacalita_phalitansa_aidudi_drei | hastacalita_phalitansa_aidudi_funf | hastacalita_phalitansa_aidudi_zehn |

---

## 🛠️ Changes & Features Implemented

### Dashboard
- [x] Real-time stats display (Today Users, Recharge, Withdrawal, Balance)
- [x] Stats exclude demo users
- [x] Total bet/win calculation across all game tables
- [x] Game settings control (Game Mode, Process Type)

### User Management
- [x] Manage Users page with search (mobile/ID/IP)
- [x] User detail modal with deposits, withdrawals, bet stats
- [x] Ban/Unban users (account_frozen toggle)
- [x] Check IP - find users with same IP
- [x] Demo User management (add/remove)
- [x] Agent User listing

### Finance
- [x] **Deposit Update** - Approve/reject pending deposits with balance update
- [x] **Withdraw Requests** - View pending with bank details from `khate` table
- [x] **Withdraw Sent** - Approved withdrawals history
- [x] **Withdraw Rejected** - Rejected withdrawals with remark
- [x] Reject withdrawal with wager option

### Game Control
- [x] WinGo / K3 / 5D game pages for all durations
- [x] Live countdown timer
- [x] Current period ID display
- [x] Prediction form (0-9 number selection)
- [x] Current prediction display
- [x] Total bet amount for current period
- [x] Live bets table (real-time user bets)
- [x] Bet summary by number/color
- [x] Period history

### Bank Details
- [x] Search bank info by user ID
- [x] Display bank name, account no, IFSC, holder name
- [x] Edit bank details

### Gift Codes
- [x] Create gift codes (bulk generation)
- [x] Delete gift codes
- [x] View all codes with usage stats

### Balance Management
- [x] Add balance to user
- [x] Deduct balance from user
- [x] Bonus management page

---

## 🐛 Bugs Fixed

### Date: Latest Session

1. **Bank Details Page**
   - Fixed status display logic (numeric 1/0 vs string 'active')
   - Fixed data fetching from `khate` table

2. **Deposit Update Page**
   - Redesigned UI with tabs (Pending/Completed)
   - Added mobile-responsive card view
   - Stats cards for pending count, completed count, total value

3. **Withdraw Requests Page**
   - Fixed bank info display - corrected SQL JOIN to use `khate` table
   - Added remark field support
   - Added wager requirement option on rejection
   - Balance refund on rejection

4. **Withdraw Sent/Rejected Pages**
   - Fixed SQL JOIN - using `khate` table for bank info (previously mixed with `bankcard`)

5. **Game Control UI**
   - Fixed bet summary to handle color bets (Red, Green, Violet, Big, Small)
   - Fixed number color display for string-based bets

---

## 📁 Project Structure

```
src/
├── components/
│   ├── AdminLayout.tsx      # Main layout with sidebar
│   ├── AdminSidebar.tsx     # Navigation sidebar
│   └── ui/                  # Shadcn UI components
├── hooks/
│   ├── useAuth.tsx          # Authentication hook
│   └── useTheme.tsx         # Theme toggle hook
├── lib/
│   └── remoteDb.ts          # Edge function caller
├── pages/
│   ├── Dashboard.tsx        # Main dashboard
│   ├── DepositUpdatePage.tsx
│   ├── WithdrawManagePage.tsx
│   ├── WithdrawSentPage.tsx
│   ├── WithdrawRejectPage.tsx
│   ├── GameManagerPage.tsx  # WinGo/K3/5D game control
│   ├── ManageUsersPage.tsx
│   ├── BankDetailsPage.tsx
│   ├── GiftCodePage.tsx
│   └── ...
└── integrations/
    └── supabase/
        └── client.ts        # Supabase client

supabase/
└── functions/
    └── remote-db/
        └── index.ts         # Edge function with all DB operations
```

---

## 🔧 Edge Function Actions

| Action | Description |
|--------|-------------|
| `dashboard_stats` | Get all dashboard statistics |
| `get_game_settings` | Get game mode and process type |
| `update_game_settings` | Update game settings |
| `get_users` | List users with pagination and search |
| `get_user_detail` | Get full user details with history |
| `ban_user` | Toggle user ban status |
| `get_pending_deposits` | List pending deposits |
| `get_completed_deposits` | List approved/rejected deposits |
| `approve_deposit` | Approve deposit and add balance |
| `reject_deposit` | Reject deposit |
| `get_pending_withdrawals` | List pending withdrawals with bank info |
| `get_completed_withdrawals` | List processed withdrawals |
| `approve_withdrawal` | Approve withdrawal with remark |
| `reject_withdrawal` | Reject with balance refund + optional wager |
| `get_withdraw_sent` | List approved withdrawals |
| `get_withdraw_rejected` | List rejected withdrawals |
| `get_game_periods` | Get period history for game |
| `set_game_result` | Set prediction for next period |
| `unset_game_result` | Clear prediction |
| `get_current_prediction` | Get active prediction |
| `get_live_bets` | Get current period bets |
| `get_bet_summary` | Get bet breakdown by number/color |
| `get_bank_details` | Get user bank info from `khate` |
| `update_bank_detail` | Update bank info |
| `get_gift_codes` | List all gift codes |
| `create_gift_code` | Create new gift code(s) |
| `delete_gift_code` | Delete gift code |
| `add_user_balance` | Add balance to user wallet |
| `deduct_user_balance` | Deduct from user wallet |
| `get_banned_users` | List frozen accounts |
| `check_same_ip` | Find users sharing same IP |
| `get_demo_users` | List demo accounts |
| `add_demo_user` | Create demo user |
| `remove_demo_user` | Disable demo user |
| `get_agents` | List agent users |

---

## ✅ Tests

```
✓ src/test/example.test.ts (1 test) - PASSED
Test Files: 1 passed (1)
Tests: 1 passed (1)
```

---

## 🎨 UI/UX Features

- Dark/Light theme with smooth transitions
- Glassmorphism cards
- Framer Motion animations
- Mobile-responsive tables (card view on small screens)
- Tailwind CSS with design tokens
- Sora + Space Grotesk typography
- Color-coded badges (success, danger, warning, info)
- Real-time data refresh (2-5 second intervals)
