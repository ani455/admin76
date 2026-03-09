import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import mysql from "npm:mysql2@3.6.5/promise";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

let pool: any = null;

async function getPool() {
  if (!pool) {
    pool = await mysql.createConnection({
      host: Deno.env.get("REMOTE_DB_HOST"),
      user: Deno.env.get("REMOTE_DB_USER"),
      database: Deno.env.get("REMOTE_DB_NAME"),
      password: Deno.env.get("REMOTE_DB_PASSWORD"),
      port: 3306,
      connectTimeout: 10000,
    });
  }
  return pool;
}

/*
  TABLE MAPPING (obfuscated names from PHP source):
  ─────────────────────────────────────────────────
  shonu_subjects   = users       (id, mobile, code=referral, owncode, ip, status, pwd, createdate, account_frozen, name)
  shonu_kaichila   = wallets     (balakedara=user_id, motta=balance)
  thevani          = deposits    (shonu=id, balakedara=user_id, duravani=mobile, ullekha=utr/ref, motta=amount, dharavahi=order_id, dinankavannuracisi=date, sthiti=status: 0=pending,1=approved,2=rejected)
  hintegedukolli   = withdrawals (shonu=id, balakedara=user_id, motta=amount, dharavahi=order_id, dinankavannuracisi=date, sthiti=status: 0=pending,1=approved,2=rejected, khateshonu=bank_id, tike=remark, remarks)
  demo             = demo users  (balakedara=user_id, sthiti=status)
  khate            = bank accounts (phalanubhavi=beneficiary, kod=ifsc, khatehesaru=bank_name, khatesankhye=account_no)
  bankcard         = bank cards  (id, userid, name, type, account)
  game_win_settings = game settings (id, game=game_mode, process_type)
  bajikattuttate          = wingo 1min bets
  bajikattuttate_drei     = wingo 3min bets
  bajikattuttate_funf     = wingo 5min bets
  bajikattuttate_zehn     = wingo 10min bets
  bajikattuttate_kemuru*  = k3 bets
  bajikattuttate_aidudi*  = 5d bets
  gelluonduhogu           = wingo 1min periods (atadaaidi=period_id, kramasankhye=serial)
*/

// ─── SECURITY: Input Validation Helpers ───
function sanitizeString(val: any, maxLen = 200): string {
  if (typeof val !== "string") return "";
  return val.trim().slice(0, maxLen);
}

function sanitizeNumber(val: any, min = 0, max = 999999999): number {
  const n = Number(val);
  if (isNaN(n) || !isFinite(n)) return 0;
  return Math.max(min, Math.min(max, n));
}

function validateRequired(params: Record<string, any>, fields: string[]) {
  for (const f of fields) {
    if (params[f] === undefined || params[f] === null || params[f] === "") {
      throw new Error(`Missing required field: ${f}`);
    }
  }
}

// ─── SECURITY: Allowed actions whitelist ───
const ALLOWED_ACTIONS = new Set([
  "admin_login", "dashboard_stats", "get_game_settings", "update_game_settings",
  "get_users", "ban_user", "get_user_detail", "get_pending_deposits", "get_completed_deposits",
  "approve_deposit", "reject_deposit", "get_pending_withdrawals", "get_completed_withdrawals",
  "approve_withdrawal", "reject_withdrawal", "get_game_periods", "set_game_result",
  "unset_game_result", "get_current_prediction", "get_live_bets", "get_bet_summary",
  "get_withdraw_sent", "get_withdraw_rejected", "get_gift_codes", "create_gift_code",
  "delete_gift_code", "add_user_balance", "deduct_user_balance", "get_banned_users",
  "check_same_ip", "user_query", "get_demo_users", "add_demo_user", "remove_demo_user",
  "get_agents", "add_agent", "remove_agent", "get_user_bank_details", "update_bank_detail",
  "change_admin_password", "get_support_queries", "respond_support", "get_illegal_bets",
  "get_usdt_rate", "update_usdt_rate", "get_upline_chain", "get_subordinate_data",
  "get_user_activity",
]);

// ─── SECURITY: Rate limiting for login ───
const loginAttempts = new Map<string, { count: number; lastAttempt: number }>();
const MAX_LOGIN_ATTEMPTS = 5;
const LOGIN_LOCKOUT_MS = 15 * 60 * 1000; // 15 minutes

function checkLoginRateLimit(identifier: string): void {
  const now = Date.now();
  const record = loginAttempts.get(identifier);
  if (record) {
    if (now - record.lastAttempt > LOGIN_LOCKOUT_MS) {
      loginAttempts.delete(identifier);
      return;
    }
    if (record.count >= MAX_LOGIN_ATTEMPTS) {
      throw new Error("Too many login attempts. Please try again later.");
    }
  }
}

function recordLoginAttempt(identifier: string, success: boolean): void {
  if (success) {
    loginAttempts.delete(identifier);
    return;
  }
  const record = loginAttempts.get(identifier) || { count: 0, lastAttempt: 0 };
  record.count++;
  record.lastAttempt = Date.now();
  loginAttempts.set(identifier, record);
}

// Helper: get demo user exclusion subquery
const DEMO_EXCLUDE = "(SELECT balakedara FROM `demo` WHERE `sthiti`='1')";

// ─── SECURITY: Game table name resolver (prevents SQL injection via table names) ───
function getGameTables(game_type: string, duration: string): { betTable: string; periodTable: string; predTable: string } {
  const validGameTypes = ["wingo", "k3", "5d"];
  const validDurations = ["30sec", "1min", "3min", "5min", "10min"];
  
  if (!validGameTypes.includes(game_type)) throw new Error("Invalid game type");
  if (!validDurations.includes(duration)) throw new Error("Invalid duration");

  let betTable = "bajikattuttate";
  let periodTable = "gelluonduhogu";
  let predTable = "hastacalita_phalitansa";

  if (game_type === "wingo") {
    if (duration === "3min") { betTable = "bajikattuttate_drei"; periodTable = "gelluonduhogu_drei"; predTable = "hastacalita_phalitansa_drei"; }
    else if (duration === "5min") { betTable = "bajikattuttate_funf"; periodTable = "gelluonduhogu_funf"; predTable = "hastacalita_phalitansa_funf"; }
    else if (duration === "30sec" || duration === "10min") { betTable = "bajikattuttate_zehn"; periodTable = "gelluonduhogu_zehn"; predTable = "hastacalita_phalitansa_zehn"; }
  } else if (game_type === "k3") {
    betTable = "bajikattuttate_kemuru"; periodTable = "gelluonduhogu_kemuru"; predTable = "hastacalita_phalitansa_kemuru";
    if (duration === "3min") { betTable = "bajikattuttate_kemuru_drei"; periodTable = "gelluonduhogu_kemuru_drei"; predTable = "hastacalita_phalitansa_kemuru_drei"; }
    else if (duration === "5min") { betTable = "bajikattuttate_kemuru_funf"; periodTable = "gelluonduhogu_kemuru_funf"; predTable = "hastacalita_phalitansa_kemuru_funf"; }
    else if (duration === "10min") { betTable = "bajikattuttate_kemuru_zehn"; periodTable = "gelluonduhogu_kemuru_zehn"; predTable = "hastacalita_phalitansa_kemuru_zehn"; }
  } else if (game_type === "5d") {
    betTable = "bajikattuttate_aidudi"; periodTable = "gelluonduhogu_aidudi"; predTable = "hastacalita_phalitansa_aidudi";
    if (duration === "3min") { betTable = "bajikattuttate_aidudi_drei"; periodTable = "gelluonduhogu_aidudi_drei"; predTable = "hastacalita_phalitansa_aidudi_drei"; }
    else if (duration === "5min") { betTable = "bajikattuttate_aidudi_funf"; periodTable = "gelluonduhogu_aidudi_funf"; predTable = "hastacalita_phalitansa_aidudi_funf"; }
    else if (duration === "10min") { betTable = "bajikattuttate_aidudi_zehn"; periodTable = "gelluonduhogu_aidudi_zehn"; predTable = "hastacalita_phalitansa_aidudi_zehn"; }
  }

  return { betTable, periodTable, predTable };
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { action, params = {} } = await req.json();

    // ─── SECURITY: Validate action is whitelisted ───
    if (!action || typeof action !== "string" || !ALLOWED_ACTIONS.has(action)) {
      return new Response(
        JSON.stringify({ error: "Invalid action" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const db = await getPool();
    let result: any;

    switch (action) {
      // ===== DASHBOARD =====
      case "dashboard_stats": {
        const today = sanitizeString(params?.today) || new Date().toISOString().split("T")[0];

        const [[totalUsersRow]] = await db.query(
          `SELECT COUNT(*) as cnt FROM shonu_subjects WHERE id NOT IN ${DEMO_EXCLUDE} AND status = 1`
        );
        const [[todayUsersRow]] = await db.query(
          `SELECT COUNT(*) as cnt FROM shonu_subjects WHERE id NOT IN ${DEMO_EXCLUDE} AND status = 1 AND DATE(createdate) = DATE(?)`,
          [today]
        );
        const [[balanceRow]] = await db.query(
          `SELECT COALESCE(SUM(motta), 0) as total FROM shonu_kaichila WHERE balakedara NOT IN ${DEMO_EXCLUDE} AND motta > 0`
        );
        const [[todayRechargeRow]] = await db.query(
          `SELECT COALESCE(SUM(motta), 0) as total FROM thevani WHERE sthiti = '1' AND balakedara NOT IN ${DEMO_EXCLUDE} AND DATE(dinankavannuracisi) = DATE(?)`,
          [today]
        );
        const [[todayWithdrawRow]] = await db.query(
          `SELECT COALESCE(SUM(motta), 0) as total FROM hintegedukolli WHERE sthiti = '1' AND balakedara NOT IN ${DEMO_EXCLUDE} AND DATE(dinankavannuracisi) = DATE(?)`,
          [today]
        );
        const [[pendingRechargeRow]] = await db.query(
          `SELECT COALESCE(SUM(motta), 0) as total FROM thevani WHERE sthiti = '0' AND balakedara NOT IN ${DEMO_EXCLUDE}`
        );
        const [[successRechargeRow]] = await db.query(
          `SELECT COALESCE(SUM(motta), 0) as total FROM thevani WHERE sthiti = '1' AND balakedara NOT IN ${DEMO_EXCLUDE}`
        );
        const [[totalWithdrawalRow]] = await db.query(
          `SELECT COALESCE(SUM(motta), 0) as total FROM hintegedukolli WHERE sthiti = '1' AND balakedara NOT IN ${DEMO_EXCLUDE}`
        );
        const [[pendingWithdrawRow]] = await db.query(
          `SELECT COALESCE(SUM(motta), 0) as total FROM hintegedukolli WHERE sthiti = '0' AND balakedara NOT IN ${DEMO_EXCLUDE}`
        );

        const betTables = [
          'bajikattuttate', 'bajikattuttate_drei', 'bajikattuttate_funf', 'bajikattuttate_zehn',
          'bajikattuttate_kemuru', 'bajikattuttate_kemuru_drei', 'bajikattuttate_kemuru_funf', 'bajikattuttate_kemuru_zehn',
          'bajikattuttate_aidudi', 'bajikattuttate_aidudi_drei', 'bajikattuttate_aidudi_funf', 'bajikattuttate_aidudi_zehn',
        ];
        let totalBet = 0;
        let totalWin = 0;
        for (const tbl of betTables) {
          try {
            const [[betRow]] = await db.query(
              `SELECT COALESCE(SUM(ketebida), 0) as tb FROM \`${tbl}\` WHERE byabaharkarta NOT IN ${DEMO_EXCLUDE} AND DATE(tiarikala) = DATE(?)`,
              [today]
            );
            totalBet += Number(betRow.tb);
            const [[winRow]] = await db.query(
              `SELECT COALESCE(SUM(sesabida), 0) as tw FROM \`${tbl}\` WHERE phalaphala = 'gagner' AND byabaharkarta NOT IN ${DEMO_EXCLUDE} AND DATE(tiarikala) = DATE(?)`,
              [today]
            );
            totalWin += Number(winRow.tw);
          } catch (_) { /* table may not exist */ }
        }

        result = {
          totalUsers: Number(totalUsersRow.cnt),
          todayUsers: Number(todayUsersRow.cnt),
          userBalance: Number(balanceRow.total),
          todayRecharge: Number(todayRechargeRow.total),
          todayWithdraw: Number(todayWithdrawRow.total),
          pendingRecharge: Number(pendingRechargeRow.total),
          successRecharge: Number(successRechargeRow.total),
          totalWithdrawal: Number(totalWithdrawalRow.total),
          withdrawalRequests: Number(pendingWithdrawRow.total),
          totalBet,
          totalWin,
        };
        break;
      }

      // ===== GAME SETTINGS =====
      case "get_game_settings": {
        const [rows] = await db.query("SELECT * FROM game_win_settings WHERE id=1 LIMIT 1");
        const row = rows[0] || null;
        result = row ? { game_mode: row.game, process_type: row.process_type } : null;
        break;
      }
      case "update_game_settings": {
        const validModes = ["wingo", "k3", "5d"];
        const validProcesses = ["highest_bet_wins", "random", "default"];
        const mode = sanitizeString(params.game_mode);
        const process = sanitizeString(params.process_type);
        if (!validModes.includes(mode)) throw new Error("Invalid game mode");
        if (!validProcesses.includes(process)) throw new Error("Invalid process type");
        await db.query("UPDATE game_win_settings SET game=?, process_type=? WHERE id=1", [mode, process]);
        result = { success: true };
        break;
      }

      // ===== USERS =====
      case "get_users": {
        const search = sanitizeString(params.search, 100);
        const page = sanitizeNumber(params.page || 1, 1, 10000);
        const perPage = sanitizeNumber(params.perPage || 50, 1, 100);
        const offset = (page - 1) * perPage;
        let where = `WHERE shonu_subjects.id NOT IN ${DEMO_EXCLUDE}`;
        const queryParams: any[] = [];

        if (search) {
          where += " AND (shonu_subjects.mobile LIKE ? OR shonu_subjects.code LIKE ? OR shonu_subjects.ip LIKE ? OR shonu_subjects.id LIKE ?)";
          const s = `%${search}%`;
          queryParams.push(s, s, s, s);
        }

        const [[countRow]] = await db.query(`SELECT COUNT(*) as cnt FROM shonu_subjects ${where}`, queryParams);
        const [rows] = await db.query(
          `SELECT 
            shonu_subjects.id, shonu_subjects.mobile, shonu_subjects.code as referral_code,
            shonu_subjects.ip as ip_address, shonu_subjects.status, shonu_subjects.createdate as created_at,
            shonu_subjects.account_frozen,
            COALESCE(shonu_kaichila.motta, 0) as balance,
            (SELECT COALESCE(SUM(motta), 0) FROM thevani WHERE balakedara = shonu_subjects.id AND sthiti='1') as total_recharge,
            (SELECT name FROM bankcard WHERE userid = shonu_subjects.id ORDER BY id ASC LIMIT 1) as name
          FROM shonu_subjects
          LEFT JOIN shonu_kaichila ON shonu_subjects.id = shonu_kaichila.balakedara
          ${where}
          ORDER BY shonu_subjects.id DESC LIMIT ? OFFSET ?`,
          [...queryParams, perPage, offset]
        );

        result = { users: rows, total: Number(countRow.cnt) };
        break;
      }
      case "ban_user": {
        validateRequired(params, ["id"]);
        const { id, status } = params;
        const newFrozen = status === "active" ? 1 : 0;
        await db.query("UPDATE shonu_subjects SET account_frozen=? WHERE id=?", [newFrozen, sanitizeString(String(id))]);
        result = { newStatus: newFrozen === 1 ? "banned" : "active" };
        break;
      }

      // ===== USER DETAIL =====
      case "get_user_detail": {
        validateRequired(params, ["userId"]);
        const userId = sanitizeString(String(params.userId));
        const [[user]] = await db.query(
          `SELECT s.id, s.mobile, s.code as referral_code, s.owncode, s.ip as ip_address, s.status, s.createdate as created_at, s.account_frozen,
                  COALESCE(sk.motta, 0) as balance,
                  (SELECT COALESCE(SUM(motta), 0) FROM thevani WHERE balakedara = s.id AND sthiti='1') as total_recharge,
                  (SELECT COALESCE(SUM(motta), 0) FROM hintegedukolli WHERE balakedara = s.id AND sthiti='1') as total_withdraw,
                  (SELECT COUNT(*) FROM thevani WHERE balakedara = s.id) as deposit_count,
                  (SELECT COUNT(*) FROM hintegedukolli WHERE balakedara = s.id) as withdraw_count,
                  (SELECT name FROM bankcard WHERE userid = s.id ORDER BY id ASC LIMIT 1) as name
           FROM shonu_subjects s
           LEFT JOIN shonu_kaichila sk ON sk.balakedara = s.id
           WHERE s.id = ?`,
          [userId]
        );
        if (!user) throw new Error("User not found");

        const [deposits] = await db.query(
          `SELECT shonu as id, motta as amount, ullekha as utr, dinankavannuracisi as created_at,
                  CASE sthiti WHEN '0' THEN 'pending' WHEN '1' THEN 'approved' WHEN '2' THEN 'rejected' END as status
           FROM thevani WHERE balakedara = ? ORDER BY shonu DESC LIMIT 10`, [userId]
        );
        const [withdrawals] = await db.query(
          `SELECT shonu as id, motta as amount, dinankavannuracisi as created_at,
                  CASE sthiti WHEN '0' THEN 'pending' WHEN '1' THEN 'approved' WHEN '2' THEN 'rejected' END as status
           FROM hintegedukolli WHERE balakedara = ? ORDER BY shonu DESC LIMIT 10`, [userId]
        );
        const [banks] = await db.query("SELECT id, name, type, account FROM bankcard WHERE userid = ?", [userId]);
        const [referrals] = await db.query(
          `SELECT id, mobile, createdate as created_at FROM shonu_subjects WHERE code = ? LIMIT 20`, [user.owncode]
        );

        let totalBetAmount = 0, totalWinAmount = 0, totalBetCount = 0;
        const betTables = [
          'bajikattuttate', 'bajikattuttate_drei', 'bajikattuttate_funf', 'bajikattuttate_zehn',
          'bajikattuttate_kemuru', 'bajikattuttate_kemuru_drei', 'bajikattuttate_kemuru_funf', 'bajikattuttate_kemuru_zehn',
          'bajikattuttate_aidudi', 'bajikattuttate_aidudi_drei', 'bajikattuttate_aidudi_funf', 'bajikattuttate_aidudi_zehn',
        ];
        for (const tbl of betTables) {
          try {
            const [[r]] = await db.query(
              `SELECT COUNT(*) as cnt, COALESCE(SUM(ketebida),0) as tb, COALESCE(SUM(CASE WHEN phalaphala='gagner' THEN sesabida ELSE 0 END),0) as tw
               FROM \`${tbl}\` WHERE byabaharkarta = ?`, [userId]
            );
            totalBetCount += Number(r.cnt);
            totalBetAmount += Number(r.tb);
            totalWinAmount += Number(r.tw);
          } catch (_) {}
        }

        result = {
          user,
          deposits,
          withdrawals,
          banks,
          referrals,
          betStats: { totalBetCount, totalBetAmount, totalWinAmount }
        };
        break;
      }

      // ===== DEPOSITS =====
      case "get_pending_deposits": {
        const search = sanitizeString(params?.search, 100);
        let where = "WHERE d.sthiti = '0'";
        const qp: any[] = [];
        if (search) {
          where += " AND (d.ullekha LIKE ? OR d.duravani LIKE ?)";
          qp.push(`%${search}%`, `%${search}%`);
        }
        const [rows] = await db.query(
          `SELECT d.shonu as id, d.balakedara as user_id, d.duravani as user_mobile,
                  d.ullekha as utr, d.motta as amount, d.dharavahi as order_id,
                  d.dinankavannuracisi as created_at
           FROM thevani d ${where} ORDER BY d.shonu DESC`,
          qp
        );
        result = rows;
        break;
      }
      case "get_completed_deposits": {
        const [rows] = await db.query(
          `SELECT d.shonu as id, d.balakedara as user_id, d.duravani as user_mobile,
                  d.ullekha as utr, d.motta as amount, d.dharavahi as order_id,
                  d.dinankavannuracisi as created_at,
                  CASE d.sthiti WHEN '1' THEN 'approved' WHEN '2' THEN 'rejected' ELSE d.sthiti END as status
           FROM thevani d WHERE d.sthiti != '0' ORDER BY d.shonu DESC LIMIT 50`
        );
        result = rows;
        break;
      }
      case "approve_deposit": {
        validateRequired(params, ["id", "userId", "amount"]);
        const { id, userId } = params;
        const amount = sanitizeNumber(params.amount, 0.01);
        const [[walletRow]] = await db.query(
          "SELECT motta FROM shonu_kaichila WHERE balakedara = ?", [userId]
        );
        if (!walletRow) {
          await db.query("INSERT INTO shonu_kaichila (balakedara, motta) VALUES (?, ?)", [userId, amount]);
        } else {
          const newBalance = Number(walletRow.motta) + amount;
          await db.query("UPDATE shonu_kaichila SET motta = ? WHERE balakedara = ?", [newBalance, userId]);
        }
        await db.query("UPDATE thevani SET sthiti = '1' WHERE shonu = ?", [id]);
        result = { success: true };
        break;
      }
      case "reject_deposit": {
        validateRequired(params, ["id"]);
        await db.query("UPDATE thevani SET sthiti = '2' WHERE shonu = ?", [params.id]);
        result = { success: true };
        break;
      }

      // ===== WITHDRAWALS =====
      case "get_pending_withdrawals": {
        const search = sanitizeString(params?.search, 100);
        let where = "WHERE w.sthiti = '0'";
        const qp: any[] = [];
        if (search) {
          where += " AND (k.khatesankhye LIKE ? OR u.mobile LIKE ? OR k.phalanubhavi LIKE ?)";
          qp.push(`%${search}%`, `%${search}%`, `%${search}%`);
        }
        const [rows] = await db.query(
          `SELECT w.shonu as id, w.balakedara as user_id, w.motta as amount,
                  w.dharavahi as order_id, w.dinankavannuracisi as created_at,
                  w.tike as remark,
                  u.mobile as user_mobile,
                  COALESCE(sk.motta, 0) as user_balance,
                  k.khatehesaru as bank_name, k.khatesankhye as account_no,
                  k.kod as ifsc, k.phalanubhavi as holder_name
           FROM hintegedukolli w
           LEFT JOIN shonu_subjects u ON u.id = w.balakedara
           LEFT JOIN shonu_kaichila sk ON sk.balakedara = w.balakedara
           LEFT JOIN khate k ON k.byabaharkarta = w.balakedara AND k.sthiti = 'active'
           ${where} ORDER BY w.shonu DESC`,
          qp
        );
        result = rows;
        break;
      }
      case "get_completed_withdrawals": {
        const [rows] = await db.query(
          `SELECT w.shonu as id, w.balakedara as user_id, w.motta as amount,
                  w.dharavahi as order_id, w.dinankavannuracisi as created_at,
                  w.tike as remark,
                  u.mobile as user_mobile,
                  k.khatehesaru as bank_name, k.khatesankhye as account_no,
                  k.kod as ifsc, k.phalanubhavi as holder_name,
                  CASE w.sthiti WHEN '1' THEN 'approved' WHEN '2' THEN 'rejected' ELSE w.sthiti END as status
           FROM hintegedukolli w
           LEFT JOIN shonu_subjects u ON u.id = w.balakedara
           LEFT JOIN khate k ON k.byabaharkarta = w.balakedara AND k.sthiti = 'active'
           WHERE w.sthiti != '0' ORDER BY w.shonu DESC LIMIT 100`
        );
        result = rows;
        break;
      }
      case "approve_withdrawal": {
        validateRequired(params, ["id"]);
        const remark = sanitizeString(params.remark, 500);
        const today = new Date().toISOString().slice(0, 19).replace('T', ' ');
        await db.query(
          "UPDATE hintegedukolli SET sthiti = '1', tike = ?, dinankavannuracisi = ? WHERE shonu = ?",
          [remark || 'Completed', today, params.id]
        );
        result = { success: true };
        break;
      }
      case "reject_withdrawal": {
        validateRequired(params, ["id"]);
        const { id, addWager, wagerAmount } = params;
        const remark = sanitizeString(params.remark, 500);
        const today = new Date().toISOString().slice(0, 19).replace('T', ' ');
        
        const [[wRow]] = await db.query("SELECT balakedara, motta FROM hintegedukolli WHERE shonu = ?", [id]);
        if (!wRow) throw new Error("Withdrawal not found");
        
        // Refund balance
        await db.query(
          "UPDATE shonu_kaichila SET motta = ROUND((motta + ?), 2) WHERE balakedara = ?",
          [Number(wRow.motta), wRow.balakedara]
        );
        
        const remarkFinal = addWager && wagerAmount && Number(wagerAmount) > 0
          ? `${remark || 'Rejected'} | Wager: ₹${sanitizeNumber(wagerAmount)}`
          : remark || 'Rejected';
        
        await db.query(
          "UPDATE hintegedukolli SET sthiti = '2', tike = ?, dinankavannuracisi = ? WHERE shonu = ?",
          [remarkFinal, today, id]
        );
        result = { success: true };
        break;
      }

      // ===== GAME PERIODS =====
      case "get_game_periods": {
        const { periodTable } = getGameTables(
          sanitizeString(params.game_type),
          sanitizeString(params.duration)
        );
        try {
          const [rows] = await db.query(`SELECT * FROM \`${periodTable}\` ORDER BY kramasankhye DESC LIMIT 50`);
          result = (rows as any[]).map((r: any) => ({
            id: r.kramasankhye || r.shonu || r.id,
            period_number: r.atadaaidi || r.period_number || "",
            result_number: r.sankhye ?? r.result_number ?? null,
            result_color: r.banna || r.result_color || null,
            big_small: r.doDachota || r.big_small || null,
            total_bet: r.total_bet || 0,
            total_win: r.total_win || 0,
            users_count: r.users_count || 0,
          }));
        } catch (_) { result = []; }
        break;
      }

      // ===== SET GAME RESULT =====
      case "set_game_result": {
        const resultNum = sanitizeNumber(params.result_number, 0, 9);
        const { predTable } = getGameTables(
          sanitizeString(params.game_type),
          sanitizeString(params.duration)
        );
        await db.query(`UPDATE \`${predTable}\` SET sthiti='0'`);
        await db.query(`UPDATE \`${predTable}\` SET sthiti='1' WHERE sankhye=?`, [resultNum]);
        result = { success: true };
        break;
      }

      case "unset_game_result": {
        const { predTable } = getGameTables(
          sanitizeString(params.game_type),
          sanitizeString(params.duration)
        );
        await db.query(`UPDATE \`${predTable}\` SET sthiti='0'`);
        result = { success: true };
        break;
      }

      case "get_current_prediction": {
        const { predTable } = getGameTables(
          sanitizeString(params.game_type),
          sanitizeString(params.duration)
        );
        try {
          const [rows] = await db.query(`SELECT sankhye, banna FROM \`${predTable}\` WHERE sthiti='1' LIMIT 1`);
          result = (rows as any[])[0] || null;
        } catch (_) { result = null; }
        break;
      }

      case "get_live_bets": {
        const { betTable, periodTable } = getGameTables(
          sanitizeString(params.game_type),
          sanitizeString(params.duration)
        );
        try {
          const [[periodRow]] = await db.query(`SELECT atadaaidi FROM \`${periodTable}\` ORDER BY kramasankhye DESC LIMIT 1`);
          if (!periodRow) { result = []; break; }
          const currentPeriod = periodRow.atadaaidi;
          
          const [rows] = await db.query(
            `SELECT b.byabaharkarta as user_id, b.ojana as bet_value_raw, b.ketebida as amount,
                    (SELECT mobile FROM shonu_subjects WHERE id = b.byabaharkarta) as mobile,
                    (SELECT motta FROM shonu_kaichila WHERE balakedara = b.byabaharkarta) as balance
             FROM \`${betTable}\` b
             WHERE b.kalaparichaya = ?
             ORDER BY b.shonu DESC LIMIT 50`,
            [currentPeriod]
          );
          
          result = (rows as any[]).map((r: any) => {
            let val = r.bet_value_raw;
            if (val == 10) val = "Red";
            else if (val == 11) val = "Green";
            else if (val == 12) val = "Violet";
            else if (val == 13) val = "Big";
            else if (val == 14) val = "Small";
            return { ...r, bet_value: String(val) };
          });
        } catch (_) { result = []; }
        break;
      }

      case "get_bet_summary": {
        const { betTable, periodTable } = getGameTables(
          sanitizeString(params.game_type),
          sanitizeString(params.duration)
        );
        try {
          const [[periodRow]] = await db.query(`SELECT atadaaidi FROM \`${periodTable}\` ORDER BY kramasankhye DESC LIMIT 1`);
          if (!periodRow) { result = { total_bet: 0, details: [] }; break; }
          const currentPeriod = periodRow.atadaaidi;
          
          const [[totalRow]] = await db.query(
            `SELECT COALESCE(SUM(ketebida) - (SUM(ketebida)/100*2), 0) as total FROM \`${betTable}\` WHERE kalaparichaya = ?`,
            [currentPeriod]
          );
          
          const details: any[] = [];
          for (let n = 0; n <= 9; n++) {
            const [[numRow]] = await db.query(
              `SELECT COUNT(DISTINCT byabaharkarta) as user_count, COALESCE(SUM(ketebida), 0) as bet_amount
               FROM \`${betTable}\` WHERE kalaparichaya = ? AND ojana = ?`,
              [currentPeriod, n]
            );
            if (Number(numRow.bet_amount) > 0) {
              details.push({
                number: n,
                bet_amount: Number(numRow.bet_amount),
                user_count: Number(numRow.user_count),
                payout: Number(numRow.bet_amount) * 9 * 0.98,
              });
            }
          }
          
          const colorMap = [
            { code: 10, name: "Red" }, { code: 11, name: "Green" }, { code: 12, name: "Violet" },
            { code: 13, name: "Big" }, { code: 14, name: "Small" },
          ];
          for (const c of colorMap) {
            const [[cRow]] = await db.query(
              `SELECT COUNT(DISTINCT byabaharkarta) as user_count, COALESCE(SUM(ketebida), 0) as bet_amount
               FROM \`${betTable}\` WHERE kalaparichaya = ? AND ojana = ?`,
              [currentPeriod, c.code]
            );
            if (Number(cRow.bet_amount) > 0) {
              const multiplier = c.name === "Violet" ? 4.5 : 2;
              details.push({
                number: c.name,
                bet_amount: Number(cRow.bet_amount),
                user_count: Number(cRow.user_count),
                payout: Number(cRow.bet_amount) * multiplier * 0.98,
              });
            }
          }
          
          result = { total_bet: Number(totalRow.total), details };
        } catch (_) { result = { total_bet: 0, details: [] }; }
        break;
      }

      // ===== WITHDRAW SENT/REJECTED =====
      case "get_withdraw_sent": {
        const [rows] = await db.query(
          `SELECT w.shonu as id, w.balakedara as user_id, w.motta as amount,
                  w.dharavahi as order_id, w.dinankavannuracisi as created_at,
                  w.tike as remark,
                  u.mobile as user_mobile,
                  k.khatehesaru as bank_name, k.khatesankhye as account_no,
                  k.kod as ifsc, k.phalanubhavi as holder_name
           FROM hintegedukolli w
           LEFT JOIN shonu_subjects u ON u.id = w.balakedara
           LEFT JOIN khate k ON k.byabaharkarta = w.balakedara AND k.sthiti = 'active'
           WHERE w.sthiti = '1' ORDER BY w.shonu DESC LIMIT 100`
        );
        result = rows;
        break;
      }
      case "get_withdraw_rejected": {
        const [rows] = await db.query(
          `SELECT w.shonu as id, w.balakedara as user_id, w.motta as amount,
                  w.dharavahi as order_id, w.dinankavannuracisi as created_at,
                  w.tike as remark,
                  u.mobile as user_mobile,
                  k.khatehesaru as bank_name, k.khatesankhye as account_no,
                  k.kod as ifsc, k.phalanubhavi as holder_name
           FROM hintegedukolli w
           LEFT JOIN shonu_subjects u ON u.id = w.balakedara
           LEFT JOIN khate k ON k.byabaharkarta = w.balakedara AND k.sthiti = 'active'
           WHERE w.sthiti = '2' ORDER BY w.shonu DESC LIMIT 100`
        );
        result = rows;
        break;
      }

      // ===== GIFT CODES =====
      case "get_gift_codes": {
        const [rows] = await db.query(
          "SELECT enserie as code, utilisateurmax as max_users, prix as price, nombredutilisateurs as used_count, creerunrendezvous as created_at, shonu as status, remark FROM hodike_nirvahaka ORDER BY creerunrendezvous DESC LIMIT 100"
        );
        result = rows;
        break;
      }
      case "create_gift_code": {
        const count = sanitizeNumber(params.count || 1, 1, 50);
        const max_users = sanitizeNumber(params.max_users || 1, 1, 100000);
        const price = sanitizeNumber(params.price || 0, 0);
        const remark = sanitizeString(params.remark, 200);
        const codes: string[] = [];
        const chars = "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ";
        for (let i = 0; i < count; i++) {
          let code = "";
          for (let j = 0; j < 32; j++) code += chars[Math.floor(Math.random() * chars.length)];
          codes.push(code);
          const now = new Date().toISOString().slice(0, 16).replace("T", " ");
          await db.query(
            "INSERT INTO hodike_nirvahaka (enserie, utilisateurmax, prix, nombredutilisateurs, creerunrendezvous, shonu, remark) VALUES (?, ?, ?, 0, ?, '1', ?)",
            [code, max_users, price, now, remark]
          );
        }
        result = { codes };
        break;
      }
      case "delete_gift_code": {
        validateRequired(params, ["code"]);
        await db.query("DELETE FROM hodike_nirvahaka WHERE enserie = ?", [sanitizeString(params.code, 50)]);
        result = { success: true };
        break;
      }

      // ===== BONUS / USER BALANCE =====
      case "add_user_balance": {
        validateRequired(params, ["userId", "amount"]);
        const userId = sanitizeString(String(params.userId));
        const amount = sanitizeNumber(params.amount, 0.01, 10000000);
        const [[wallet]] = await db.query("SELECT motta FROM shonu_kaichila WHERE balakedara = ?", [userId]);
        if (!wallet) {
          await db.query("INSERT INTO shonu_kaichila (balakedara, motta) VALUES (?, ?)", [userId, amount]);
        } else {
          await db.query("UPDATE shonu_kaichila SET motta = ROUND((motta + ?), 2) WHERE balakedara = ?", [amount, userId]);
        }
        result = { success: true };
        break;
      }
      case "deduct_user_balance": {
        validateRequired(params, ["userId", "amount"]);
        const userId = sanitizeString(String(params.userId));
        const amount = sanitizeNumber(params.amount, 0.01, 10000000);
        await db.query("UPDATE shonu_kaichila SET motta = ROUND(GREATEST(motta - ?, 0), 2) WHERE balakedara = ?", [amount, userId]);
        result = { success: true };
        break;
      }

      // ===== BANNED USERS =====
      case "get_banned_users": {
        const [rows] = await db.query(
          `SELECT s.id, s.mobile, s.ip as ip_address, s.createdate as created_at, s.account_frozen,
                  COALESCE(sk.motta, 0) as balance
           FROM shonu_subjects s
           LEFT JOIN shonu_kaichila sk ON sk.balakedara = s.id
           WHERE s.account_frozen = 1 AND s.id NOT IN ${DEMO_EXCLUDE}
           ORDER BY s.id DESC`
        );
        result = rows;
        break;
      }

      // ===== CHECK SAME IP =====
      case "check_same_ip": {
        const ip = sanitizeString(params?.ip, 45);
        let query = `SELECT s.ip as ip_address, COUNT(*) as user_count, GROUP_CONCAT(s.id) as user_ids, GROUP_CONCAT(s.mobile) as mobiles
                     FROM shonu_subjects s WHERE s.id NOT IN ${DEMO_EXCLUDE} AND s.status = 1`;
        const qp: any[] = [];
        if (ip) {
          query += " AND s.ip = ?";
          qp.push(ip);
        }
        query += " GROUP BY s.ip HAVING COUNT(*) > 1 ORDER BY user_count DESC LIMIT 50";
        const [rows] = await db.query(query, qp);
        result = rows;
        break;
      }

      // ===== USERS QUERY =====
      case "user_query": {
        validateRequired(params, ["userId"]);
        const userId = sanitizeString(String(params.userId), 100);
        const [[user]] = await db.query(
          `SELECT s.id, s.mobile, s.code as referral_code, s.owncode, s.ip as ip_address, s.status, s.createdate as created_at, s.account_frozen,
                  COALESCE(sk.motta, 0) as balance,
                  (SELECT COALESCE(SUM(motta), 0) FROM thevani WHERE balakedara = s.id AND sthiti='1') as total_recharge,
                  (SELECT COALESCE(SUM(motta), 0) FROM hintegedukolli WHERE balakedara = s.id AND sthiti='1') as total_withdraw,
                  (SELECT name FROM bankcard WHERE userid = s.id ORDER BY id ASC LIMIT 1) as name
           FROM shonu_subjects s
           LEFT JOIN shonu_kaichila sk ON sk.balakedara = s.id
           WHERE s.id = ? OR s.mobile = ?`,
          [userId, userId]
        );
        if (!user) throw new Error("User not found");
        const [banks] = await db.query("SELECT * FROM bankcard WHERE userid = ?", [user.id]);
        const [referrals] = await db.query(
          `SELECT id, mobile, createdate FROM shonu_subjects WHERE code = ? LIMIT 20`,
          [user.owncode]
        );
        result = { user, banks, referrals };
        break;
      }

      // ===== DEMO USER =====
      case "get_demo_users": {
        const [rows] = await db.query(
          `SELECT d.balakedara as user_id, d.motta as mobile, d.dinankavannuracisi as created_at, d.sthiti as status,
                  COALESCE(sk.motta, 0) as balance
           FROM demo d
           LEFT JOIN shonu_kaichila sk ON sk.balakedara = d.balakedara
           WHERE d.sthiti = '1'
           ORDER BY d.dinankavannuracisi DESC`
        );
        result = rows;
        break;
      }
      case "add_demo_user": {
        validateRequired(params, ["mobile", "password"]);
        const mobile = sanitizeString(params.mobile, 15);
        const password = sanitizeString(params.password, 50);
        if (!/^\d{10,15}$/.test(mobile)) throw new Error("Invalid mobile number");
        
        const [[existing]] = await db.query("SELECT id FROM shonu_subjects WHERE mobile = ?", [mobile]);
        if (existing) throw new Error("Duplicate mobile number");

        const owncode = String(Math.floor(100000000000 + Math.random() * 900000000000));
        const now = new Date().toISOString().slice(0, 19).replace("T", " ");
        const [insertResult]: any = await db.query(
          "INSERT INTO shonu_subjects (mobile, email, password, code, owncode, privacy, status, createdate, ip, pwd) VALUES (?, '', MD5(?), '255860337165', ?, 'on', '1', ?, '127.0.0.1', ?)",
          [mobile, password, owncode, now, password]
        );
        const lastId = insertResult.insertId;
        await db.query("INSERT INTO shonu_kaichila (balakedara, motta, dinankavannuracisi) VALUES (?, '5000', ?)", [lastId, now]);
        await db.query("INSERT INTO demo (balakedara, motta, dinankavannuracisi, sthiti) VALUES (?, ?, ?, '1')", [lastId, mobile, now]);
        result = { success: true, userId: lastId };
        break;
      }
      case "remove_demo_user": {
        validateRequired(params, ["userId"]);
        await db.query("UPDATE demo SET sthiti = '2' WHERE balakedara = ?", [params.userId]);
        result = { success: true };
        break;
      }

      // ===== AGENT USER =====
      case "get_agents": {
        const [rows] = await db.query(
          `SELECT a.userid, a.mobile, a.createdate as created_at, a.type, a.salary, a.status
           FROM tb_agent a WHERE a.status = '1' ORDER BY a.createdate DESC`
        );
        result = rows;
        break;
      }
      case "add_agent": {
        validateRequired(params, ["userId", "salary", "salaryType"]);
        const userId = sanitizeString(String(params.userId));
        const salary = sanitizeNumber(params.salary, 0);
        const salaryType = sanitizeString(params.salaryType, 20);
        const [[userExists]] = await db.query("SELECT id FROM shonu_subjects WHERE id = ?", [userId]);
        if (!userExists) throw new Error("User ID doesn't exist");
        const [[agentExists]] = await db.query("SELECT userid FROM tb_agent WHERE mobile = ? AND status = '1'", [userId]);
        if (agentExists) throw new Error("Agent already exists");
        const now = new Date().toISOString().slice(0, 19).replace("T", " ");
        await db.query(
          "INSERT INTO tb_agent (userid, mobile, createdate, status, type, salary) VALUES (?, ?, ?, '1', ?, ?)",
          [userId, userId, now, salaryType, salary]
        );
        result = { success: true };
        break;
      }
      case "remove_agent": {
        validateRequired(params, ["userId"]);
        await db.query("UPDATE tb_agent SET status = '2' WHERE userid = ?", [params.userId]);
        result = { success: true };
        break;
      }

      // ===== BANK DETAILS MODIFY =====
      case "get_user_bank_details": {
        validateRequired(params, ["userId"]);
        const [rows] = await db.query(
          `SELECT shonu as id, byabaharkarta as user_id, phalanubhavi as name, khatehesaru as bank_name,
                  khatesankhye as account, kod as ifsc, daka as email, duravani as mobile, sthiti as status
           FROM khate WHERE byabaharkarta = ?`, [sanitizeString(String(params.userId))]
        );
        result = rows;
        break;
      }
      case "update_bank_detail": {
        validateRequired(params, ["bankId"]);
        const name = sanitizeString(params.name, 100);
        const account = sanitizeString(params.account, 30);
        const ifsc = sanitizeString(params.ifsc, 20);
        const bankName = sanitizeString(params.bankName, 100);
        await db.query(
          "UPDATE khate SET phalanubhavi = ?, khatesankhye = ?, kod = ?, khatehesaru = ? WHERE shonu = ?",
          [name, account, ifsc, bankName, params.bankId]
        );
        result = { success: true };
        break;
      }

      // ===== ADMIN PASSWORD =====
      case "change_admin_password": {
        validateRequired(params, ["newPassword"]);
        const newPassword = sanitizeString(params.newPassword, 100);
        if (newPassword.length < 6) throw new Error("Password must be at least 6 characters");
        await db.query("UPDATE nirvahaka_shonu SET guptapada = MD5(?) WHERE unohs = '1'", [newPassword]);
        result = { success: true };
        break;
      }

      // ===== SUPPORT =====
      case "get_support_queries": {
        const validTypes: Record<string, string> = {
          deposit: "Deposite Problem",
          withdrawal: "Withdrawal Problem",
          ifsc: "Change IFSC",
          bank: "Change bank name",
          game: "Game Problem",
        };
        const type = sanitizeString(params?.type);
        const probFilter = validTypes[type];
        if (!probFilter) throw new Error("Invalid support type");

        const [rows] = await db.query(
          `SELECT id, userid, deposit_order_no as order_no, bank_account_number as bank_account, ifsc, order_amount as amount, text_content as message, remarks, status, prob as problem_type
           FROM user_support WHERE prob = ? ORDER BY id DESC LIMIT 100`,
          [probFilter]
        );
        result = rows;
        break;
      }
      case "respond_support": {
        validateRequired(params, ["id", "remarks"]);
        const remarks = sanitizeString(params.remarks, 1000);
        await db.query("UPDATE user_support SET remarks = ?, status = 1 WHERE id = ?", [remarks, params.id]);
        result = { success: true };
        break;
      }

      // ===== ILLEGAL BETS =====
      case "get_illegal_bets": {
        const betTables = [
          { table: 'bajikattuttate_zehn', name: 'Wingo 30 sec' },
          { table: 'bajikattuttate', name: 'Wingo 1 min' },
          { table: 'bajikattuttate_drei', name: 'Wingo 3 min' },
          { table: 'bajikattuttate_funf', name: 'Wingo 5 min' },
          { table: 'bajikattuttate_aidudi', name: '5D 1 min' },
          { table: 'bajikattuttate_aidudi_drei', name: '5D 3 min' },
          { table: 'bajikattuttate_aidudi_funf', name: '5D 5 min' },
          { table: 'bajikattuttate_aidudi_zehn', name: '5D 10 min' },
        ];
        const allBets: any[] = [];
        for (const bt of betTables) {
          try {
            const [rows] = await db.query(
              `SELECT byabaharkarta as user_id, kalaparichaya as period_id, '${bt.name}' as game_name FROM \`${bt.table}\``
            );
            allBets.push(...(rows as any[]));
          } catch (_) {}
        }
        const periodMap: Record<string, any[]> = {};
        for (const b of allBets) {
          const key = `${b.period_id}_${b.game_name}`;
          if (!periodMap[key]) periodMap[key] = [];
          periodMap[key].push(b.user_id);
        }
        const illegal: any[] = [];
        for (const [key, users] of Object.entries(periodMap)) {
          const unique = [...new Set(users)];
          if (unique.length > 3) {
            const [period_id] = key.split("_");
            illegal.push({ period_id, game_name: key.replace(`${period_id}_`, ""), user_count: unique.length, users: unique.slice(0, 10) });
          }
        }
        result = illegal.slice(0, 50);
        break;
      }

      // ===== USDT RATE =====
      case "get_usdt_rate": {
        try {
          const [[row]] = await db.query("SELECT * FROM usdt_settings LIMIT 1");
          result = row || { rate: 85 };
        } catch (_) {
          result = { rate: 85 };
        }
        break;
      }
      case "update_usdt_rate": {
        const rate = sanitizeNumber(params?.rate, 1, 999);
        try {
          await db.query("UPDATE usdt_settings SET rate = ? WHERE id = 1", [rate]);
        } catch (_) {
          try {
            await db.query("CREATE TABLE IF NOT EXISTS usdt_settings (id INT PRIMARY KEY, rate DECIMAL(10,2))");
            await db.query("INSERT INTO usdt_settings (id, rate) VALUES (1, ?) ON DUPLICATE KEY UPDATE rate = ?", [rate, rate]);
          } catch (_e) {}
        }
        result = { success: true };
        break;
      }

      // ===== UPLINE CHAIN =====
      case "get_upline_chain": {
        validateRequired(params, ["userId"]);
        const userId = sanitizeString(String(params.userId), 100);
        const [[startUser]] = await db.query(
          `SELECT s.id, s.mobile, s.code as referral_code, s.owncode, COALESCE(sk.motta,0) as balance
           FROM shonu_subjects s LEFT JOIN shonu_kaichila sk ON sk.balakedara = s.id
           WHERE s.id = ? OR s.mobile = ?`, [userId, userId]
        );
        if (!startUser) throw new Error("User not found");

        const chain = [startUser];
        let current = startUser;
        for (let i = 0; i < 20; i++) {
          if (!current.referral_code || current.referral_code === "255860337165") break;
          const [[parent]] = await db.query(
            `SELECT s.id, s.mobile, s.code as referral_code, s.owncode, COALESCE(sk.motta,0) as balance
             FROM shonu_subjects s LEFT JOIN shonu_kaichila sk ON sk.balakedara = s.id
             WHERE s.owncode = ?`, [current.referral_code]
          );
          if (!parent || chain.some(c => c.id === parent.id)) break;
          chain.push(parent);
          current = parent;
        }
        result = chain;
        break;
      }

      // ===== SUBORDINATE DATA =====
      case "get_subordinate_data": {
        validateRequired(params, ["userId"]);
        const userId = sanitizeString(String(params.userId), 100);
        const [[user]] = await db.query("SELECT id, owncode FROM shonu_subjects WHERE id = ? OR mobile = ?", [userId, userId]);
        if (!user) throw new Error("User not found");

        const [referrals] = await db.query(
          `SELECT s.id, s.mobile, s.createdate as created_at, COALESCE(sk.motta,0) as balance,
                  (SELECT COALESCE(SUM(motta),0) FROM thevani WHERE balakedara=s.id AND sthiti='1') as total_recharge,
                  (SELECT COALESCE(SUM(motta),0) FROM hintegedukolli WHERE balakedara=s.id AND sthiti='1') as total_withdraw
           FROM shonu_subjects s LEFT JOIN shonu_kaichila sk ON sk.balakedara=s.id
           WHERE s.code = ? ORDER BY s.id DESC LIMIT 100`, [user.owncode]
        );

        const summary = {
          totalReferrals: (referrals as any[]).length,
          totalRecharge: (referrals as any[]).reduce((s: number, r: any) => s + Number(r.total_recharge), 0),
          totalWithdraw: (referrals as any[]).reduce((s: number, r: any) => s + Number(r.total_withdraw), 0),
          totalBalance: (referrals as any[]).reduce((s: number, r: any) => s + Number(r.balance), 0),
        };

        result = { referrals, summary };
        break;
      }

      // ===== USER ACTIVITY =====
      case "get_user_activity": {
        validateRequired(params, ["userId"]);
        const userId = sanitizeString(String(params.userId), 100);
        const [[user]] = await db.query("SELECT id FROM shonu_subjects WHERE id = ? OR mobile = ?", [userId, userId]);
        if (!user) throw new Error("User not found");
        const uid = user.id;

        const [deposits] = await db.query(
          `SELECT shonu as id, motta as amount, ullekha as utr, dinankavannuracisi as created_at,
                  CASE sthiti WHEN '0' THEN 'pending' WHEN '1' THEN 'approved' WHEN '2' THEN 'rejected' END as status
           FROM thevani WHERE balakedara = ? ORDER BY shonu DESC LIMIT 20`, [uid]
        );
        const [withdrawals] = await db.query(
          `SELECT shonu as id, motta as amount, dinankavannuracisi as created_at,
                  CASE sthiti WHEN '0' THEN 'pending' WHEN '1' THEN 'approved' WHEN '2' THEN 'rejected' END as status
           FROM hintegedukolli WHERE balakedara = ? ORDER BY shonu DESC LIMIT 20`, [uid]
        );

        const betTables = [
          { table: 'bajikattuttate', name: 'Wingo 1min' },
          { table: 'bajikattuttate_drei', name: 'Wingo 3min' },
          { table: 'bajikattuttate_funf', name: 'Wingo 5min' },
          { table: 'bajikattuttate_zehn', name: 'Wingo 30sec' },
          { table: 'bajikattuttate_kemuru', name: 'K3 1min' },
          { table: 'bajikattuttate_kemuru_drei', name: 'K3 3min' },
          { table: 'bajikattuttate_kemuru_funf', name: 'K3 5min' },
          { table: 'bajikattuttate_kemuru_zehn', name: 'K3 10min' },
          { table: 'bajikattuttate_aidudi', name: '5D 1min' },
          { table: 'bajikattuttate_aidudi_drei', name: '5D 3min' },
          { table: 'bajikattuttate_aidudi_funf', name: '5D 5min' },
          { table: 'bajikattuttate_aidudi_zehn', name: '5D 10min' },
        ];
        let totalBetCount = 0, totalBetAmount = 0, totalWinAmount = 0;
        const recentBets: any[] = [];
        for (const bt of betTables) {
          try {
            const [[r]] = await db.query(
              `SELECT COUNT(*) as cnt, COALESCE(SUM(ketebida),0) as tb, COALESCE(SUM(CASE WHEN phalaphala='gagner' THEN sesabida ELSE 0 END),0) as tw
               FROM \`${bt.table}\` WHERE byabaharkarta = ?`, [uid]
            );
            totalBetCount += Number(r.cnt);
            totalBetAmount += Number(r.tb);
            totalWinAmount += Number(r.tw);
            const [bets] = await db.query(
              `SELECT kalaparichaya as period_id, ketebida as bet_amount, sesabida as win_amount, phalaphala as result, tiarikala as date, '${bt.name}' as game_name
               FROM \`${bt.table}\` WHERE byabaharkarta = ? ORDER BY shonu DESC LIMIT 5`, [uid]
            );
            recentBets.push(...(bets as any[]));
          } catch (_) {}
        }
        recentBets.sort((a, b) => (b.date || "").localeCompare(a.date || ""));

        result = {
          deposits,
          withdrawals,
          betStats: { totalBetCount, totalBetAmount, totalWinAmount },
          recentBets: recentBets.slice(0, 30),
        };
        break;
      }

      // ===== ADMIN LOGIN =====
      case "admin_login": {
        validateRequired(params, ["username", "password"]);
        const username = sanitizeString(params.username, 50);
        const password = sanitizeString(params.password, 100);

        // ─── SECURITY: Rate limiting ───
        checkLoginRateLimit(username);

        // Query admin table with MD5 password
        const [rows] = await db.query(
          "SELECT * FROM nirvahaka_shonu WHERE nirvahaka_hesaru = ? AND guptapada = MD5(?) AND sthiti = '1'",
          [username, password]
        );
        const admin = (rows as any[])[0];
        if (!admin) {
          // Check if password is stored as plaintext (legacy)
          const [plainRows] = await db.query(
            "SELECT * FROM nirvahaka_shonu WHERE nirvahaka_hesaru = ? AND guptapada = ? AND sthiti = '1'",
            [username, password]
          );
          const plainAdmin = (plainRows as any[])[0];
          if (plainAdmin) {
            recordLoginAttempt(username, true);
            result = {
              success: true,
              admin: {
                username: plainAdmin.nirvahaka_hesaru,
                unohs: String(plainAdmin.unohs),
                is_superadmin: plainAdmin.unohs === "1" || plainAdmin.unohs === 1,
              },
            };
            break;
          }
          recordLoginAttempt(username, false);
          throw new Error("Invalid credentials");
        }

        recordLoginAttempt(username, true);
        result = {
          success: true,
          admin: {
            username: admin.nirvahaka_hesaru,
            unohs: String(admin.unohs),
            is_superadmin: admin.unohs === "1" || admin.unohs === 1,
          },
        };
        break;
      }

      default:
        throw new Error("Unknown action");
    }

    return new Response(JSON.stringify({ data: result }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (err: any) {
    // ─── SECURITY: Don't leak internal error details ───
    const safeMessage = err.message || "Internal server error";
    return new Response(
      JSON.stringify({ error: safeMessage }),
      { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
