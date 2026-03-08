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

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { action, params } = await req.json();
    const db = await getPool();
    let result: any;

    switch (action) {
      // ===== DASHBOARD =====
      case "dashboard_stats": {
        const today = params?.today || new Date().toISOString().split("T")[0];

        const [[totalUsersRow]] = await db.query("SELECT COUNT(*) as cnt FROM users WHERE is_demo=0");
        const [[todayUsersRow]] = await db.query("SELECT COUNT(*) as cnt FROM users WHERE is_demo=0 AND created_at >= ?", [today]);
        const [[balanceRow]] = await db.query("SELECT COALESCE(SUM(balance),0) as total FROM users WHERE is_demo=0");

        const [[todayRechargeRow]] = await db.query("SELECT COALESCE(SUM(amount),0) as total FROM deposits WHERE status='approved' AND created_at >= ?", [today]);
        const [[todayWithdrawRow]] = await db.query("SELECT COALESCE(SUM(amount),0) as total FROM withdrawals WHERE status='approved' AND created_at >= ?", [today]);
        const [[pendingRechargeRow]] = await db.query("SELECT COALESCE(SUM(amount),0) as total FROM deposits WHERE status='pending'");
        const [[successRechargeRow]] = await db.query("SELECT COALESCE(SUM(amount),0) as total FROM deposits WHERE status='approved'");
        const [[totalWithdrawalRow]] = await db.query("SELECT COALESCE(SUM(amount),0) as total FROM withdrawals WHERE status='approved'");
        const [[pendingWithdrawRow]] = await db.query("SELECT COALESCE(SUM(amount),0) as total FROM withdrawals WHERE status='pending'");

        const [[betRow]] = await db.query("SELECT COALESCE(SUM(amount),0) as totalBet, COALESCE(SUM(CASE WHEN result='win' THEN win_amount ELSE 0 END),0) as totalWin FROM bets WHERE created_at >= ?", [today]);

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
          totalBet: Number(betRow.totalBet),
          totalWin: Number(betRow.totalWin),
        };
        break;
      }

      // ===== GAME SETTINGS =====
      case "get_game_settings": {
        const [rows] = await db.query("SELECT * FROM game_settings WHERE id=1 LIMIT 1");
        result = rows[0] || null;
        break;
      }
      case "update_game_settings": {
        await db.query("UPDATE game_settings SET game_mode=?, process_type=? WHERE id=1", [params.game_mode, params.process_type]);
        result = { success: true };
        break;
      }

      // ===== USERS =====
      case "get_users": {
        const { search, page = 1, perPage = 50 } = params;
        const offset = (page - 1) * perPage;
        let where = "WHERE is_demo=0";
        const queryParams: any[] = [];

        if (search) {
          where += " AND (name LIKE ? OR mobile LIKE ? OR referral_code LIKE ? OR ip_address LIKE ?)";
          const s = `%${search}%`;
          queryParams.push(s, s, s, s);
        }

        const [[countRow]] = await db.query(`SELECT COUNT(*) as cnt FROM users ${where}`, queryParams);
        const [rows] = await db.query(`SELECT * FROM users ${where} ORDER BY created_at DESC LIMIT ? OFFSET ?`, [...queryParams, perPage, offset]);

        result = { users: rows, total: Number(countRow.cnt) };
        break;
      }
      case "ban_user": {
        const { id, status } = params;
        const newStatus = status === "active" ? "banned" : "active";
        await db.query("UPDATE users SET status=? WHERE id=?", [newStatus, id]);
        result = { newStatus };
        break;
      }

      // ===== DEPOSITS =====
      case "get_pending_deposits": {
        const { search } = params || {};
        let where = "WHERE d.status='pending'";
        const qp: any[] = [];
        if (search) {
          where += " AND (d.utr LIKE ? OR u.mobile LIKE ?)";
          qp.push(`%${search}%`, `%${search}%`);
        }
        const [rows] = await db.query(
          `SELECT d.*, u.name as user_name, u.mobile as user_mobile, u.balance as user_balance, u.total_recharge as user_total_recharge
           FROM deposits d JOIN users u ON d.user_id=u.id ${where} ORDER BY d.created_at DESC`,
          qp
        );
        result = rows;
        break;
      }
      case "get_completed_deposits": {
        const [rows] = await db.query(
          `SELECT d.*, u.name as user_name, u.mobile as user_mobile
           FROM deposits d JOIN users u ON d.user_id=u.id WHERE d.status!='pending' ORDER BY d.created_at DESC LIMIT 50`
        );
        result = rows;
        break;
      }
      case "approve_deposit": {
        const { id, userId, amount, currentBalance, currentRecharge } = params;
        const newBalance = currentBalance + amount;
        const newRecharge = currentRecharge + amount;
        await db.query("UPDATE users SET balance=?, total_recharge=? WHERE id=?", [newBalance, newRecharge, userId]);
        await db.query("UPDATE deposits SET status='approved' WHERE id=?", [id]);
        result = { success: true };
        break;
      }
      case "reject_deposit": {
        await db.query("UPDATE deposits SET status='rejected' WHERE id=?", [params.id]);
        result = { success: true };
        break;
      }

      // ===== WITHDRAWALS =====
      case "get_pending_withdrawals": {
        const { search } = params || {};
        let where = "WHERE w.status='pending'";
        const qp: any[] = [];
        if (search) {
          where += " AND (w.account_no LIKE ? OR u.mobile LIKE ?)";
          qp.push(`%${search}%`, `%${search}%`);
        }
        const [rows] = await db.query(
          `SELECT w.*, u.name as user_name, u.mobile as user_mobile, u.balance as user_balance, u.total_withdraw as user_total_withdraw
           FROM withdrawals w JOIN users u ON w.user_id=u.id ${where} ORDER BY w.created_at DESC`,
          qp
        );
        result = rows;
        break;
      }
      case "get_completed_withdrawals": {
        const [rows] = await db.query(
          `SELECT w.*, u.name as user_name, u.mobile as user_mobile
           FROM withdrawals w JOIN users u ON w.user_id=u.id WHERE w.status!='pending' ORDER BY w.created_at DESC LIMIT 50`
        );
        result = rows;
        break;
      }
      case "approve_withdrawal": {
        const { id, userId, amount, currentBalance, currentWithdraw } = params;
        const newBalance = currentBalance - amount;
        if (newBalance < 0) throw new Error("Insufficient user balance!");
        const newWithdraw = currentWithdraw + amount;
        await db.query("UPDATE users SET balance=?, total_withdraw=? WHERE id=?", [newBalance, newWithdraw, userId]);
        await db.query("UPDATE withdrawals SET status='approved' WHERE id=?", [id]);
        result = { success: true };
        break;
      }
      case "reject_withdrawal": {
        await db.query("UPDATE withdrawals SET status='rejected' WHERE id=?", [params.id]);
        result = { success: true };
        break;
      }

      // ===== GAME PERIODS =====
      case "get_game_periods": {
        const { game_type, duration } = params;
        const [rows] = await db.query(
          "SELECT * FROM game_periods WHERE game_type=? AND duration=? ORDER BY created_at DESC LIMIT 50",
          [game_type, duration]
        );
        result = rows;
        break;
      }

      default:
        throw new Error(`Unknown action: ${action}`);
    }

    return new Response(JSON.stringify({ data: result }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error: any) {
    console.error("Remote DB error:", error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
