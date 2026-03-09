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

      // ===== USER DETAIL (Advanced) =====
      case "get_user_detail": {
        const { userId } = params;
        const [[user]] = await db.query(
          `SELECT s.id, s.mobile, s.code as referral_code, s.owncode, s.ip as ip_address, s.status, s.createdate as created_at, s.account_frozen, s.pwd as password,
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

        // Recent deposits
        const [deposits] = await db.query(
          `SELECT shonu as id, motta as amount, ullekha as utr, dinankavannuracisi as created_at,
                  CASE sthiti WHEN '0' THEN 'pending' WHEN '1' THEN 'approved' WHEN '2' THEN 'rejected' END as status
           FROM thevani WHERE balakedara = ? ORDER BY shonu DESC LIMIT 10`, [userId]
        );

        // Recent withdrawals
        const [withdrawals] = await db.query(
          `SELECT shonu as id, motta as amount, dinankavannuracisi as created_at,
                  CASE sthiti WHEN '0' THEN 'pending' WHEN '1' THEN 'approved' WHEN '2' THEN 'rejected' END as status
           FROM hintegedukolli WHERE balakedara = ? ORDER BY shonu DESC LIMIT 10`, [userId]
        );

        // Bank details
        const [banks] = await db.query("SELECT id, name, type, account FROM bankcard WHERE userid = ?", [userId]);

        // Referrals (users who used this user's code)
        const [referrals] = await db.query(
          `SELECT id, mobile, createdate as created_at FROM shonu_subjects WHERE code = ? LIMIT 20`, [user.owncode]
        );

        // Bet stats across all tables
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
        const { id, remark } = params;
        const today = new Date().toISOString().slice(0, 19).replace('T', ' ');
        await db.query(
          "UPDATE hintegedukolli SET sthiti = '1', tike = ?, dinankavannuracisi = ? WHERE shonu = ?",
          [remark || 'Completed', today, id]
        );
        result = { success: true };
        break;
      }
      case "reject_withdrawal": {
        const { id, remark, addWager, wagerAmount } = params;
        const today = new Date().toISOString().slice(0, 19).replace('T', ' ');
        
        // Get withdrawal details
        const [[wRow]] = await db.query("SELECT balakedara, motta FROM hintegedukolli WHERE shonu = ?", [id]);
        if (!wRow) throw new Error("Withdrawal not found");
        
        // Refund balance
        await db.query(
          "UPDATE shonu_kaichila SET motta = ROUND((motta + ?), 2) WHERE balakedara = ?",
          [Number(wRow.motta), wRow.balakedara]
        );
        
        // If addWager, also add wager amount to user's balance
        if (addWager && wagerAmount && Number(wagerAmount) > 0) {
          // You can store wager info in the remark
          await db.query(
            "UPDATE hintegedukolli SET sthiti = '2', tike = ?, dinankavannuracisi = ? WHERE shonu = ?",
            [remark ? `${remark} | Wager: ₹${wagerAmount}` : `Rejected | Wager: ₹${wagerAmount}`, today, id]
          );
        } else {
          await db.query(
            "UPDATE hintegedukolli SET sthiti = '2', tike = ?, dinankavannuracisi = ? WHERE shonu = ?",
            [remark || 'Rejected', today, id]
          );
        }
        result = { success: true };
        break;
      }

      // ===== GAME PERIODS =====
      case "get_game_periods": {
        const { game_type, duration } = params;
        let periodTable = "gelluonduhogu";
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

      // ===== SET GAME RESULT (prediction - matches hastacalita_phalitansa from PHP) =====
      case "set_game_result": {
        const { game_type, duration, result_number } = params;
        // Table: hastacalita_phalitansa (wingo 1min)
        // Different durations use different tables with suffixes
        let predTable = "hastacalita_phalitansa";
        if (game_type === "wingo") {
          if (duration === "3min") predTable = "hastacalita_phalitansa_drei";
          else if (duration === "5min") predTable = "hastacalita_phalitansa_funf";
          else if (duration === "30sec" || duration === "10min") predTable = "hastacalita_phalitansa_zehn";
        } else if (game_type === "k3") {
          predTable = "hastacalita_phalitansa_kemuru";
          if (duration === "3min") predTable = "hastacalita_phalitansa_kemuru_drei";
          else if (duration === "5min") predTable = "hastacalita_phalitansa_kemuru_funf";
          else if (duration === "10min") predTable = "hastacalita_phalitansa_kemuru_zehn";
        } else if (game_type === "5d") {
          predTable = "hastacalita_phalitansa_aidudi";
          if (duration === "3min") predTable = "hastacalita_phalitansa_aidudi_drei";
          else if (duration === "5min") predTable = "hastacalita_phalitansa_aidudi_funf";
          else if (duration === "10min") predTable = "hastacalita_phalitansa_aidudi_zehn";
        }
        
        // First unset all predictions (sthiti='0'), then set the chosen number (sthiti='1')
        await db.query(`UPDATE \`${predTable}\` SET sthiti='0'`);
        await db.query(`UPDATE \`${predTable}\` SET sthiti='1' WHERE sankhye=?`, [result_number]);
        result = { success: true };
        break;
      }

      // ===== UNSET GAME RESULT (reset all predictions) =====
      case "unset_game_result": {
        const { game_type, duration } = params;
        let predTable = "hastacalita_phalitansa";
        if (game_type === "wingo") {
          if (duration === "3min") predTable = "hastacalita_phalitansa_drei";
          else if (duration === "5min") predTable = "hastacalita_phalitansa_funf";
          else if (duration === "30sec" || duration === "10min") predTable = "hastacalita_phalitansa_zehn";
        } else if (game_type === "k3") {
          predTable = "hastacalita_phalitansa_kemuru";
          if (duration === "3min") predTable = "hastacalita_phalitansa_kemuru_drei";
          else if (duration === "5min") predTable = "hastacalita_phalitansa_kemuru_funf";
          else if (duration === "10min") predTable = "hastacalita_phalitansa_kemuru_zehn";
        } else if (game_type === "5d") {
          predTable = "hastacalita_phalitansa_aidudi";
          if (duration === "3min") predTable = "hastacalita_phalitansa_aidudi_drei";
          else if (duration === "5min") predTable = "hastacalita_phalitansa_aidudi_funf";
          else if (duration === "10min") predTable = "hastacalita_phalitansa_aidudi_zehn";
        }
        await db.query(`UPDATE \`${predTable}\` SET sthiti='0'`);
        result = { success: true };
        break;
      }

      // ===== GET CURRENT PREDICTION =====
      case "get_current_prediction": {
        const { game_type, duration } = params;
        let predTable = "hastacalita_phalitansa";
        if (game_type === "wingo") {
          if (duration === "3min") predTable = "hastacalita_phalitansa_drei";
          else if (duration === "5min") predTable = "hastacalita_phalitansa_funf";
          else if (duration === "30sec" || duration === "10min") predTable = "hastacalita_phalitansa_zehn";
        } else if (game_type === "k3") {
          predTable = "hastacalita_phalitansa_kemuru";
          if (duration === "3min") predTable = "hastacalita_phalitansa_kemuru_drei";
          else if (duration === "5min") predTable = "hastacalita_phalitansa_kemuru_funf";
          else if (duration === "10min") predTable = "hastacalita_phalitansa_kemuru_zehn";
        } else if (game_type === "5d") {
          predTable = "hastacalita_phalitansa_aidudi";
          if (duration === "3min") predTable = "hastacalita_phalitansa_aidudi_drei";
          else if (duration === "5min") predTable = "hastacalita_phalitansa_aidudi_funf";
          else if (duration === "10min") predTable = "hastacalita_phalitansa_aidudi_zehn";
        }
        try {
          const [rows] = await db.query(`SELECT sankhye, banna FROM \`${predTable}\` WHERE sthiti='1' LIMIT 1`);
          result = (rows as any[])[0] || null;
        } catch (_) { result = null; }
        break;
      }

      // ===== LIVE BETS (real-time bets for current period) =====
      case "get_live_bets": {
        const { game_type, duration } = params;
        // Get bet table and period table
        let betTable = "bajikattuttate";
        let periodTable = "gelluonduhogu";
        if (game_type === "wingo") {
          if (duration === "3min") { betTable = "bajikattuttate_drei"; periodTable = "gelluonduhogu_drei"; }
          else if (duration === "5min") { betTable = "bajikattuttate_funf"; periodTable = "gelluonduhogu_funf"; }
          else if (duration === "30sec" || duration === "10min") { betTable = "bajikattuttate_zehn"; periodTable = "gelluonduhogu_zehn"; }
        } else if (game_type === "k3") {
          betTable = "bajikattuttate_kemuru"; periodTable = "gelluonduhogu_kemuru";
          if (duration === "3min") { betTable = "bajikattuttate_kemuru_drei"; periodTable = "gelluonduhogu_kemuru_drei"; }
          else if (duration === "5min") { betTable = "bajikattuttate_kemuru_funf"; periodTable = "gelluonduhogu_kemuru_funf"; }
          else if (duration === "10min") { betTable = "bajikattuttate_kemuru_zehn"; periodTable = "gelluonduhogu_kemuru_zehn"; }
        } else if (game_type === "5d") {
          betTable = "bajikattuttate_aidudi"; periodTable = "gelluonduhogu_aidudi";
          if (duration === "3min") { betTable = "bajikattuttate_aidudi_drei"; periodTable = "gelluonduhogu_aidudi_drei"; }
          else if (duration === "5min") { betTable = "bajikattuttate_aidudi_funf"; periodTable = "gelluonduhogu_aidudi_funf"; }
          else if (duration === "10min") { betTable = "bajikattuttate_aidudi_zehn"; periodTable = "gelluonduhogu_aidudi_zehn"; }
        }
        
        try {
          // Get current period ID
          const [[periodRow]] = await db.query(`SELECT atadaaidi FROM \`${periodTable}\` ORDER BY kramasankhye DESC LIMIT 1`);
          if (!periodRow) { result = []; break; }
          const currentPeriod = periodRow.atadaaidi;
          
          // Get live bets for this period
          // ojana mapping: 10=Red, 11=Green, 12=Violet, 13=Big, 14=Small, 0-9=number
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

      // ===== BET SUMMARY (total bet for current period) =====
      case "get_bet_summary": {
        const { game_type, duration } = params;
        let betTable = "bajikattuttate";
        let periodTable = "gelluonduhogu";
        if (game_type === "wingo") {
          if (duration === "3min") { betTable = "bajikattuttate_drei"; periodTable = "gelluonduhogu_drei"; }
          else if (duration === "5min") { betTable = "bajikattuttate_funf"; periodTable = "gelluonduhogu_funf"; }
          else if (duration === "30sec" || duration === "10min") { betTable = "bajikattuttate_zehn"; periodTable = "gelluonduhogu_zehn"; }
        } else if (game_type === "k3") {
          betTable = "bajikattuttate_kemuru"; periodTable = "gelluonduhogu_kemuru";
          if (duration === "3min") { betTable = "bajikattuttate_kemuru_drei"; periodTable = "gelluonduhogu_kemuru_drei"; }
          else if (duration === "5min") { betTable = "bajikattuttate_kemuru_funf"; periodTable = "gelluonduhogu_kemuru_funf"; }
          else if (duration === "10min") { betTable = "bajikattuttate_kemuru_zehn"; periodTable = "gelluonduhogu_kemuru_zehn"; }
        } else if (game_type === "5d") {
          betTable = "bajikattuttate_aidudi"; periodTable = "gelluonduhogu_aidudi";
          if (duration === "3min") { betTable = "bajikattuttate_aidudi_drei"; periodTable = "gelluonduhogu_aidudi_drei"; }
          else if (duration === "5min") { betTable = "bajikattuttate_aidudi_funf"; periodTable = "gelluonduhogu_aidudi_funf"; }
          else if (duration === "10min") { betTable = "bajikattuttate_aidudi_zehn"; periodTable = "gelluonduhogu_aidudi_zehn"; }
        }
        
        try {
          const [[periodRow]] = await db.query(`SELECT atadaaidi FROM \`${periodTable}\` ORDER BY kramasankhye DESC LIMIT 1`);
          if (!periodRow) { result = { total_bet: 0, details: [] }; break; }
          const currentPeriod = periodRow.atadaaidi;
          
          // Total bet amount (minus 2% fee like PHP)
          const [[totalRow]] = await db.query(
            `SELECT COALESCE(SUM(ketebida) - (SUM(ketebida)/100*2), 0) as total FROM \`${betTable}\` WHERE kalaparichaya = ?`,
            [currentPeriod]
          );
          
          // Per-number breakdown
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
          
          // Color bets (10=Red, 11=Green, 12=Violet, 13=Big, 14=Small)
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

      // ===== WITHDRAW SENT (approved) =====
      case "get_withdraw_sent": {
        const [rows] = await db.query(
          `SELECT w.shonu as id, w.balakedara as user_id, w.motta as amount,
                  w.dharavahi as order_id, w.dinankavannuracisi as created_at,
                  u.mobile as user_mobile,
                  bc.name as bank_name, bc.account as account_no,
                  k.kod as ifsc, w.tike as remark
           FROM hintegedukolli w
           LEFT JOIN shonu_subjects u ON u.id = w.balakedara
           LEFT JOIN bankcard bc ON bc.id = w.khateshonu
           LEFT JOIN khate k ON k.shonu = w.khateshonu
           WHERE w.sthiti = '1' ORDER BY w.shonu DESC LIMIT 100`
        );
        result = rows;
        break;
      }

      // ===== WITHDRAW REJECTED =====
      case "get_withdraw_rejected": {
        const [rows] = await db.query(
          `SELECT w.shonu as id, w.balakedara as user_id, w.motta as amount,
                  w.dharavahi as order_id, w.dinankavannuracisi as created_at,
                  u.mobile as user_mobile,
                  bc.name as bank_name, bc.account as account_no,
                  k.kod as ifsc, w.tike as remark
           FROM hintegedukolli w
           LEFT JOIN shonu_subjects u ON u.id = w.balakedara
           LEFT JOIN bankcard bc ON bc.id = w.khateshonu
           LEFT JOIN khate k ON k.shonu = w.khateshonu
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
        const { count, max_users, price, remark } = params;
        const codes: string[] = [];
        const chars = "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ";
        for (let i = 0; i < Math.min(count || 1, 50); i++) {
          let code = "";
          for (let j = 0; j < 32; j++) code += chars[Math.floor(Math.random() * chars.length)];
          codes.push(code);
          const now = new Date().toISOString().slice(0, 16).replace("T", " ");
          await db.query(
            "INSERT INTO hodike_nirvahaka (enserie, utilisateurmax, prix, nombredutilisateurs, creerunrendezvous, shonu, remark) VALUES (?, ?, ?, 0, ?, '1', ?)",
            [code, max_users || 1, price || 0, now, remark || ""]
          );
        }
        result = { codes };
        break;
      }
      case "delete_gift_code": {
        await db.query("DELETE FROM hodike_nirvahaka WHERE enserie = ?", [params.code]);
        result = { success: true };
        break;
      }

      // ===== BONUS / USER DEPOSIT MANAGE =====
      case "add_user_balance": {
        const { userId, amount } = params;
        const [[wallet]] = await db.query("SELECT motta FROM shonu_kaichila WHERE balakedara = ?", [userId]);
        if (!wallet) {
          await db.query("INSERT INTO shonu_kaichila (balakedara, motta) VALUES (?, ?)", [userId, amount]);
        } else {
          await db.query("UPDATE shonu_kaichila SET motta = ROUND((motta + ?), 2) WHERE balakedara = ?", [Number(amount), userId]);
        }
        result = { success: true };
        break;
      }
      case "deduct_user_balance": {
        const { userId, amount } = params;
        await db.query("UPDATE shonu_kaichila SET motta = ROUND(GREATEST(motta - ?, 0), 2) WHERE balakedara = ?", [Number(amount), userId]);
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
        const { ip } = params;
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
        const { userId } = params;
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

        // Get bank details
        const [banks] = await db.query("SELECT * FROM bankcard WHERE userid = ?", [user.id]);

        // Get referrals
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
        const { mobile, password } = params;
        // Check duplicate
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
        const { userId, salary, salaryType } = params;
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
        await db.query("UPDATE tb_agent SET status = '2' WHERE userid = ?", [params.userId]);
        result = { success: true };
        break;
      }

      // ===== BANK DETAILS MODIFY =====
      case "get_user_bank_details": {
        const { userId } = params;
        const [rows] = await db.query(
          `SELECT shonu as id, byabaharkarta as user_id, phalanubhavi as name, khatehesaru as bank_name,
                  khatesankhye as account, kod as ifsc, daka as email, duravani as mobile, sthiti as status
           FROM khate WHERE byabaharkarta = ?`, [userId]
        );
        result = rows;
        break;
      }
      case "update_bank_detail": {
        const { bankId, name, account, ifsc, bankName } = params;
        await db.query(
          "UPDATE khate SET phalanubhavi = ?, khatesankhye = ?, kod = ?, khatehesaru = ? WHERE shonu = ?",
          [name, account, ifsc || '', bankName || '', bankId]
        );
        result = { success: true };
        break;
      }

      // ===== ADMIN PASSWORD =====
      case "change_admin_password": {
        const { newPassword } = params;
        await db.query("UPDATE nirvahaka_shonu SET guptapada = MD5(?) WHERE unohs = '1'", [newPassword]);
        result = { success: true };
        break;
      }

      // ===== SUPPORT - DEPOSIT PROBLEM =====
      case "get_support_queries": {
        const { type } = params;
        let probFilter = "";
        if (type === "deposit") probFilter = "Deposite Problem";
        else if (type === "withdrawal") probFilter = "Withdrawal Problem";
        else if (type === "ifsc") probFilter = "Change IFSC";
        else if (type === "bank") probFilter = "Change bank name";
        else if (type === "game") probFilter = "Game Problem";

        const [rows] = await db.query(
          `SELECT id, userid, deposit_order_no as order_no, bank_account_number as bank_account, ifsc, order_amount as amount, text_content as message, remarks, status, prob as problem_type
           FROM user_support WHERE prob = ? ORDER BY id DESC LIMIT 100`,
          [probFilter]
        );
        result = rows;
        break;
      }
      case "respond_support": {
        const { id, remarks } = params;
        await db.query("UPDATE user_support SET remarks = ?, status = 1 WHERE id = ?", [remarks, id]);
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
        // Find users who bet on same period from multiple accounts (by grouping period)
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
            const [period_id, game_name] = key.split("_");
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
        try {
          await db.query("UPDATE usdt_settings SET rate = ? WHERE id = 1", [params.rate]);
        } catch (_) {
          try {
            await db.query("CREATE TABLE IF NOT EXISTS usdt_settings (id INT PRIMARY KEY, rate DECIMAL(10,2))");
            await db.query("INSERT INTO usdt_settings (id, rate) VALUES (1, ?) ON DUPLICATE KEY UPDATE rate = ?", [params.rate, params.rate]);
          } catch (_e) {}
        }
        result = { success: true };
        break;
      }

      // ===== UPLINE CHAIN =====
      case "get_upline_chain": {
        const { userId } = params;
        // Find user first by id or mobile
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
          // Find user whose owncode matches current's referral_code
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
        const { userId } = params;
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
        const { userId } = params;
        const [[user]] = await db.query("SELECT id FROM shonu_subjects WHERE id = ? OR mobile = ?", [userId, userId]);
        if (!user) throw new Error("User not found");
        const uid = user.id;

        // Deposits
        const [deposits] = await db.query(
          `SELECT shonu as id, motta as amount, ullekha as utr, dinankavannuracisi as created_at,
                  CASE sthiti WHEN '0' THEN 'pending' WHEN '1' THEN 'approved' WHEN '2' THEN 'rejected' END as status
           FROM thevani WHERE balakedara = ? ORDER BY shonu DESC LIMIT 20`, [uid]
        );

        // Withdrawals
        const [withdrawals] = await db.query(
          `SELECT shonu as id, motta as amount, dinankavannuracisi as created_at,
                  CASE sthiti WHEN '0' THEN 'pending' WHEN '1' THEN 'approved' WHEN '2' THEN 'rejected' END as status
           FROM hintegedukolli WHERE balakedara = ? ORDER BY shonu DESC LIMIT 20`, [uid]
        );

        // Bet stats + recent bets
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
            // Recent bets from this table
            const [bets] = await db.query(
              `SELECT kalaparichaya as period_id, ketebida as bet_amount, sesabida as win_amount, phalaphala as result, tiarikala as date, '${bt.name}' as game_name
               FROM \`${bt.table}\` WHERE byabaharkarta = ? ORDER BY shonu DESC LIMIT 5`, [uid]
            );
            recentBets.push(...(bets as any[]));
          } catch (_) {}
        }
        // Sort recent bets by date desc
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
        const { username, password } = params;
        if (!username || !password) throw new Error("Username and password required");

        // Superadmin hardcoded check (as per PHP source)
        if (username === "zxcv" && password === "zxcv") {
          result = {
            success: true,
            admin: { username: "zxcv", unohs: "superadmin", is_superadmin: true },
          };
          break;
        }

        // Query nirvahaka_shonu table with MD5 password
        const [rows] = await db.query(
          "SELECT * FROM nirvahaka_shonu WHERE nirvahaka_hesaru = ? AND guptapada = MD5(?) AND sthiti = '1'",
          [username, password]
        );
        const admin = (rows as any[])[0];
        if (!admin) {
          // Debug: check if user exists at all
          const [debugRows] = await db.query(
            "SELECT nirvahaka_hesaru, sthiti, guptapada FROM nirvahaka_shonu WHERE nirvahaka_hesaru = ?",
            [username]
          );
          const debugInfo = (debugRows as any[])[0];
          if (debugInfo) {
            // Check if password is already stored as MD5 or plain
            const [md5Check] = await db.query(
              "SELECT * FROM nirvahaka_shonu WHERE nirvahaka_hesaru = ? AND guptapada = ? AND sthiti = '1'",
              [username, password]
            );
            const plainMatch = (md5Check as any[])[0];
            if (plainMatch) {
              // Password is stored as plain text, not MD5
              result = {
                success: true,
                admin: {
                  username: plainMatch.nirvahaka_hesaru,
                  unohs: plainMatch.unohs || plainMatch.shonu || plainMatch.id,
                  is_superadmin: false,
                },
              };
              break;
            }
            throw new Error(`Invalid credentials (user found, status=${debugInfo.sthiti}, pwd_hash=${debugInfo.guptapada?.substring(0,8)}...)`);
          }
          throw new Error("Invalid credentials (user not found)");
        }

        result = {
          success: true,
          admin: {
            username: admin.nirvahaka_hesaru,
            unohs: admin.unohs || admin.shonu || admin.id,
            is_superadmin: false,
          },
        };
        break;
      }

      // ===== DEBUG: List admin users =====
      case "list_admins": {
        const [rows] = await db.query(
          "SELECT nirvahaka_hesaru, sthiti, LEFT(guptapada, 10) as pwd_prefix FROM nirvahaka_shonu LIMIT 20"
        );
        result = rows;
        break;
      }

      // ===== Create admin user =====
      case "create_admin": {
        const { username, password } = params;
        await db.query(
          "INSERT INTO nirvahaka_shonu (nirvahaka_hesaru, guptapada, sthiti) VALUES (?, MD5(?), '1')",
          [username, password]
        );
        result = { success: true, username };
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
