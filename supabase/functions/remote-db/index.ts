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

// Helper: get demo user exclusion subquery
const DEMO_EXCLUDE = "(SELECT balakedara FROM `demo` WHERE `sthiti`='1')";

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

        // Total Users (excluding demo)
        const [[totalUsersRow]] = await db.query(
          `SELECT COUNT(*) as cnt FROM shonu_subjects WHERE id NOT IN ${DEMO_EXCLUDE} AND status = 1`
        );

        // Today Users
        const [[todayUsersRow]] = await db.query(
          `SELECT COUNT(*) as cnt FROM shonu_subjects WHERE id NOT IN ${DEMO_EXCLUDE} AND status = 1 AND DATE(createdate) = DATE(?)`,
          [today]
        );

        // User Balance (from wallet table)
        const [[balanceRow]] = await db.query(
          `SELECT COALESCE(SUM(motta), 0) as total FROM shonu_kaichila WHERE balakedara NOT IN ${DEMO_EXCLUDE} AND motta > 0`
        );

        // Today's Recharge (approved deposits today)
        const [[todayRechargeRow]] = await db.query(
          `SELECT COALESCE(SUM(motta), 0) as total FROM thevani WHERE sthiti = '1' AND balakedara NOT IN ${DEMO_EXCLUDE} AND DATE(dinankavannuracisi) = DATE(?)`,
          [today]
        );

        // Today's Withdrawal (approved withdrawals today)
        const [[todayWithdrawRow]] = await db.query(
          `SELECT COALESCE(SUM(motta), 0) as total FROM hintegedukolli WHERE sthiti = '1' AND balakedara NOT IN ${DEMO_EXCLUDE} AND DATE(dinankavannuracisi) = DATE(?)`,
          [today]
        );

        // Pending Recharge
        const [[pendingRechargeRow]] = await db.query(
          `SELECT COALESCE(SUM(motta), 0) as total FROM thevani WHERE sthiti = '0' AND balakedara NOT IN ${DEMO_EXCLUDE}`
        );

        // Success Recharge
        const [[successRechargeRow]] = await db.query(
          `SELECT COALESCE(SUM(motta), 0) as total FROM thevani WHERE sthiti = '1' AND balakedara NOT IN ${DEMO_EXCLUDE}`
        );

        // Total Withdrawal (approved)
        const [[totalWithdrawalRow]] = await db.query(
          `SELECT COALESCE(SUM(motta), 0) as total FROM hintegedukolli WHERE sthiti = '1' AND balakedara NOT IN ${DEMO_EXCLUDE}`
        );

        // Withdrawal Requests (pending)
        const [[pendingWithdrawRow]] = await db.query(
          `SELECT COALESCE(SUM(motta), 0) as total FROM hintegedukolli WHERE sthiti = '0' AND balakedara NOT IN ${DEMO_EXCLUDE}`
        );

        // Today's bets across ALL game tables
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
          } catch (_) { /* table may not exist, skip */ }
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
        // Map to frontend expected format
        result = row ? { game_mode: row.game, process_type: row.process_type } : null;
        break;
      }
      case "update_game_settings": {
        await db.query("UPDATE game_win_settings SET game=?, process_type=? WHERE id=1", [params.game_mode, params.process_type]);
        result = { success: true };
        break;
      }

      // ===== USERS =====
      case "get_users": {
        const { search, page = 1, perPage = 50 } = params;
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
        const { id, status } = params;
        // status=1 is active, account_frozen=1 is frozen
        const newFrozen = status === "active" ? 1 : 0;
        await db.query("UPDATE shonu_subjects SET account_frozen=? WHERE id=?", [newFrozen, id]);
        result = { newStatus: newFrozen === 1 ? "banned" : "active" };
        break;
      }

      // ===== DEPOSITS =====
      case "get_pending_deposits": {
        const { search } = params || {};
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
        const { id, userId, amount } = params;
        // Get current wallet balance
        const [[walletRow]] = await db.query(
          "SELECT motta FROM shonu_kaichila WHERE balakedara = ?", [userId]
        );
        
        if (!walletRow) {
          // Create wallet if doesn't exist
          await db.query("INSERT INTO shonu_kaichila (balakedara, motta) VALUES (?, ?)", [userId, amount]);
        } else {
          const newBalance = Number(walletRow.motta) + Number(amount);
          await db.query("UPDATE shonu_kaichila SET motta = ? WHERE balakedara = ?", [newBalance, userId]);
        }
        
        // Update deposit status
        await db.query("UPDATE thevani SET sthiti = '1' WHERE shonu = ?", [id]);
        result = { success: true };
        break;
      }
      case "reject_deposit": {
        await db.query("UPDATE thevani SET sthiti = '2' WHERE shonu = ?", [params.id]);
        result = { success: true };
        break;
      }

      // ===== WITHDRAWALS =====
      case "get_pending_withdrawals": {
        const { search } = params || {};
        let where = "WHERE w.sthiti = '0'";
        const qp: any[] = [];
        if (search) {
          where += " AND (bc.account LIKE ? OR u.mobile LIKE ?)";
          qp.push(`%${search}%`, `%${search}%`);
        }
        const [rows] = await db.query(
          `SELECT w.shonu as id, w.balakedara as user_id, w.motta as amount,
                  w.dharavahi as order_id, w.dinankavannuracisi as created_at,
                  u.mobile as user_mobile,
                  COALESCE(sk.motta, 0) as user_balance,
                  bc.name as bank_name, bc.account as account_no,
                  k.kod as ifsc
           FROM hintegedukolli w
           LEFT JOIN shonu_subjects u ON u.id = w.balakedara
           LEFT JOIN shonu_kaichila sk ON sk.balakedara = w.balakedara
           LEFT JOIN bankcard bc ON bc.id = w.khateshonu
           LEFT JOIN khate k ON k.shonu = w.khateshonu
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
                  u.mobile as user_mobile,
                  bc.name as bank_name, bc.account as account_no,
                  k.kod as ifsc,
                  CASE w.sthiti WHEN '1' THEN 'approved' WHEN '2' THEN 'rejected' ELSE w.sthiti END as status
           FROM hintegedukolli w
           LEFT JOIN shonu_subjects u ON u.id = w.balakedara
           LEFT JOIN bankcard bc ON bc.id = w.khateshonu
           LEFT JOIN khate k ON k.shonu = w.khateshonu
           WHERE w.sthiti != '0' ORDER BY w.shonu DESC LIMIT 50`
        );
        result = rows;
        break;
      }
      case "approve_withdrawal": {
        // Accept: just update status, do NOT deduct balance (already deducted when user requested)
        const { id } = params;
        const today = new Date().toISOString().slice(0, 19).replace('T', ' ');
        await db.query(
          "UPDATE hintegedukolli SET sthiti = '1', tike = 'Completed', dinankavannuracisi = ? WHERE shonu = ?",
          [today, id]
        );
        result = { success: true };
        break;
      }
      case "reject_withdrawal": {
        // Reject: update status AND refund balance back to user
        const { id } = params;
        const today = new Date().toISOString().slice(0, 19).replace('T', ' ');
        
        // Get withdrawal details
        const [[wRow]] = await db.query("SELECT balakedara, motta FROM hintegedukolli WHERE shonu = ?", [id]);
        if (!wRow) throw new Error("Withdrawal not found");
        
        // Refund balance
        await db.query(
          "UPDATE shonu_kaichila SET motta = ROUND((motta + ?), 2) WHERE balakedara = ?",
          [Number(wRow.motta), wRow.balakedara]
        );
        
        // Update withdrawal status
        await db.query(
          "UPDATE hintegedukolli SET sthiti = '2', tike = 'Rejected', dinankavannuracisi = ? WHERE shonu = ?",
          [today, id]
        );
        result = { success: true };
        break;
      }

      // ===== GAME PERIODS (Wingo 1min example) =====
      case "get_game_periods": {
        const { game_type, duration } = params;
        
        // Map game_type + duration to the correct period table
        let periodTable = "gelluonduhogu"; // default: wingo 1min
        if (game_type === "wingo") {
          if (duration === "3min") periodTable = "gelluonduhogu_drei";
          else if (duration === "5min") periodTable = "gelluonduhogu_funf";
          else if (duration === "10min") periodTable = "gelluonduhogu_zehn";
        } else if (game_type === "k3") {
          periodTable = "gelluonduhogu_kemuru";
          if (duration === "3min") periodTable = "gelluonduhogu_kemuru_drei";
          else if (duration === "5min") periodTable = "gelluonduhogu_kemuru_funf";
          else if (duration === "10min") periodTable = "gelluonduhogu_kemuru_zehn";
        } else if (game_type === "5d") {
          periodTable = "gelluonduhogu_aidudi";
          if (duration === "3min") periodTable = "gelluonduhogu_aidudi_drei";
          else if (duration === "5min") periodTable = "gelluonduhogu_aidudi_funf";
          else if (duration === "10min") periodTable = "gelluonduhogu_aidudi_zehn";
        }

        try {
          const [rows] = await db.query(
            `SELECT * FROM \`${periodTable}\` ORDER BY kramasankhye DESC LIMIT 50`
          );
          // Map to frontend expected format
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
        } catch (_) {
          result = [];
        }
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
