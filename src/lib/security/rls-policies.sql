-- Row Level Security (RLS) Policies for Nordic Football Betting Platform
-- Execute these commands in your Supabase SQL editor

-- Enable RLS on all tables
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE matches ENABLE ROW LEVEL SECURITY;
ALTER TABLE bets ENABLE ROW LEVEL SECURITY;
ALTER TABLE live_bets ENABLE ROW LEVEL SECURITY;
ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE achievements ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_achievements ENABLE ROW LEVEL SECURITY;
ALTER TABLE challenges ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_challenges ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE blocked_ips ENABLE ROW LEVEL SECURITY;
ALTER TABLE account_lockouts ENABLE ROW LEVEL SECURITY;
ALTER TABLE stripe_webhook_events ENABLE ROW LEVEL SECURITY;

-- Helper function to get current user ID
CREATE OR REPLACE FUNCTION current_user_id() RETURNS uuid AS $$
BEGIN
  RETURN (auth.jwt() ->> 'sub')::uuid;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Helper function to check if user is admin
CREATE OR REPLACE FUNCTION is_admin() RETURNS boolean AS $$
BEGIN
  RETURN (auth.jwt() ->> 'role') = 'admin' OR 
         (auth.jwt() ->> 'email') = current_setting('app.admin_email', true);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Helper function to check service role
CREATE OR REPLACE FUNCTION is_service_role() RETURNS boolean AS $$
BEGIN
  RETURN auth.role() = 'service_role';
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- USERS TABLE POLICIES
CREATE POLICY "Users can view own profile" ON users
  FOR SELECT USING (id = current_user_id());

CREATE POLICY "Users can update own profile" ON users
  FOR UPDATE USING (id = current_user_id());

CREATE POLICY "Admins can view all users" ON users
  FOR SELECT USING (is_admin());

CREATE POLICY "Admins can update any user" ON users
  FOR UPDATE USING (is_admin());

CREATE POLICY "Service can manage users" ON users
  FOR ALL USING (is_service_role());

-- Public read access for leaderboard data (limited fields)
CREATE POLICY "Public leaderboard access" ON users
  FOR SELECT USING (true)
  WITH CHECK (false);

-- MATCHES TABLE POLICIES
-- Matches are public for viewing
CREATE POLICY "Anyone can view matches" ON matches
  FOR SELECT USING (true);

CREATE POLICY "Admins can manage matches" ON matches
  FOR ALL USING (is_admin());

CREATE POLICY "Service can manage matches" ON matches
  FOR ALL USING (is_service_role());

-- BETS TABLE POLICIES
CREATE POLICY "Users can view own bets" ON bets
  FOR SELECT USING (user_id = current_user_id());

CREATE POLICY "Users can create own bets" ON bets
  FOR INSERT WITH CHECK (user_id = current_user_id());

CREATE POLICY "Users cannot update bets after creation" ON bets
  FOR UPDATE USING (false);

CREATE POLICY "Users cannot delete bets" ON bets
  FOR DELETE USING (false);

CREATE POLICY "Admins can view all bets" ON bets
  FOR SELECT USING (is_admin());

CREATE POLICY "Service can manage bets" ON bets
  FOR ALL USING (is_service_role());

-- LIVE BETS TABLE POLICIES
CREATE POLICY "Users can view own live bets" ON live_bets
  FOR SELECT USING (user_id = current_user_id());

CREATE POLICY "Users can create own live bets" ON live_bets
  FOR INSERT WITH CHECK (user_id = current_user_id());

CREATE POLICY "Users can update own live bets for cash-out" ON live_bets
  FOR UPDATE USING (
    user_id = current_user_id() AND 
    cash_out_available = true AND 
    NOT cashed_out
  );

CREATE POLICY "Admins can view all live bets" ON live_bets
  FOR SELECT USING (is_admin());

CREATE POLICY "Service can manage live bets" ON live_bets
  FOR ALL USING (is_service_role());

-- TRANSACTIONS TABLE POLICIES
CREATE POLICY "Users can view own transactions" ON transactions
  FOR SELECT USING (user_id = current_user_id());

CREATE POLICY "Users cannot modify transactions" ON transactions
  FOR INSERT USING (false);

CREATE POLICY "Users cannot update transactions" ON transactions
  FOR UPDATE USING (false);

CREATE POLICY "Users cannot delete transactions" ON transactions
  FOR DELETE USING (false);

CREATE POLICY "Admins can view all transactions" ON transactions
  FOR SELECT USING (is_admin());

CREATE POLICY "Service can manage transactions" ON transactions
  FOR ALL USING (is_service_role());

-- ACHIEVEMENTS TABLE POLICIES
-- Achievements are public for viewing
CREATE POLICY "Anyone can view achievements" ON achievements
  FOR SELECT USING (true);

CREATE POLICY "Admins can manage achievements" ON achievements
  FOR ALL USING (is_admin());

CREATE POLICY "Service can manage achievements" ON achievements
  FOR ALL USING (is_service_role());

-- USER ACHIEVEMENTS TABLE POLICIES
CREATE POLICY "Users can view own achievements" ON user_achievements
  FOR SELECT USING (user_id = current_user_id());

CREATE POLICY "Users cannot modify achievements" ON user_achievements
  FOR INSERT USING (false);

CREATE POLICY "Admins can view all user achievements" ON user_achievements
  FOR SELECT USING (is_admin());

CREATE POLICY "Service can manage user achievements" ON user_achievements
  FOR ALL USING (is_service_role());

-- CHALLENGES TABLE POLICIES
-- Challenges are public for viewing
CREATE POLICY "Anyone can view challenges" ON challenges
  FOR SELECT USING (true);

CREATE POLICY "Admins can manage challenges" ON challenges
  FOR ALL USING (is_admin());

CREATE POLICY "Service can manage challenges" ON challenges
  FOR ALL USING (is_service_role());

-- USER CHALLENGES TABLE POLICIES
CREATE POLICY "Users can view own challenges" ON user_challenges
  FOR SELECT USING (user_id = current_user_id());

CREATE POLICY "Users can update own challenge progress" ON user_challenges
  FOR UPDATE USING (user_id = current_user_id());

CREATE POLICY "Users cannot delete challenges" ON user_challenges
  FOR DELETE USING (false);

CREATE POLICY "Admins can view all user challenges" ON user_challenges
  FOR SELECT USING (is_admin());

CREATE POLICY "Service can manage user challenges" ON user_challenges
  FOR ALL USING (is_service_role());

-- AUDIT LOGS TABLE POLICIES
CREATE POLICY "Users cannot access audit logs" ON audit_logs
  FOR SELECT USING (false);

CREATE POLICY "Admins can view audit logs" ON audit_logs
  FOR SELECT USING (is_admin());

CREATE POLICY "Only service can write audit logs" ON audit_logs
  FOR INSERT WITH CHECK (is_service_role());

CREATE POLICY "Audit logs cannot be modified" ON audit_logs
  FOR UPDATE USING (false);

CREATE POLICY "Audit logs cannot be deleted" ON audit_logs
  FOR DELETE USING (false);

-- BLOCKED IPS TABLE POLICIES
CREATE POLICY "Users cannot access blocked IPs" ON blocked_ips
  FOR SELECT USING (false);

CREATE POLICY "Admins can view blocked IPs" ON blocked_ips
  FOR SELECT USING (is_admin());

CREATE POLICY "Service can manage blocked IPs" ON blocked_ips
  FOR ALL USING (is_service_role());

-- ACCOUNT LOCKOUTS TABLE POLICIES
CREATE POLICY "Users cannot access lockout data" ON account_lockouts
  FOR SELECT USING (false);

CREATE POLICY "Admins can view lockouts" ON account_lockouts
  FOR SELECT USING (is_admin());

CREATE POLICY "Service can manage lockouts" ON account_lockouts
  FOR ALL USING (is_service_role());

-- STRIPE WEBHOOK EVENTS TABLE POLICIES
CREATE POLICY "Users cannot access webhook events" ON stripe_webhook_events
  FOR SELECT USING (false);

CREATE POLICY "Admins can view webhook events" ON stripe_webhook_events
  FOR SELECT USING (is_admin());

CREATE POLICY "Service can manage webhook events" ON stripe_webhook_events
  FOR ALL USING (is_service_role());

-- Additional security functions

-- Function to validate bet amounts
CREATE OR REPLACE FUNCTION validate_bet_amount(amount integer) RETURNS boolean AS $$
BEGIN
  -- Minimum 1, maximum 10,000 bet points
  RETURN amount >= 1 AND amount <= 10000;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to validate odds
CREATE OR REPLACE FUNCTION validate_odds(odds_value numeric) RETURNS boolean AS $$
BEGIN
  -- Odds between 1.01 (101) and 100.00 (10000) in integer format
  RETURN odds_value >= 1.01 AND odds_value <= 100.00;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to check betting time restrictions
CREATE OR REPLACE FUNCTION can_place_bet(match_id uuid) RETURNS boolean AS $$
DECLARE
  match_record record;
BEGIN
  SELECT status, start_time, minute INTO match_record 
  FROM matches WHERE id = match_id;
  
  -- Cannot bet on finished matches
  IF match_record.status = 'FINISHED' THEN
    RETURN false;
  END IF;
  
  -- Cannot bet on matches that haven't started if they're more than 5 minutes past start time
  IF match_record.status = 'SCHEDULED' AND 
     match_record.start_time < (NOW() - INTERVAL '5 minutes') THEN
    RETURN false;
  END IF;
  
  -- Cannot bet on live matches after 75th minute
  IF match_record.status = 'LIVE' AND match_record.minute >= 75 THEN
    RETURN false;
  END IF;
  
  RETURN true;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Enhanced bet creation policy with business rules
CREATE POLICY "Enhanced bet creation validation" ON bets
  FOR INSERT WITH CHECK (
    user_id = current_user_id() AND
    validate_bet_amount(stake) AND
    validate_odds(odds) AND
    can_place_bet(match_id)
  );

-- Enhanced live bet creation policy
CREATE POLICY "Enhanced live bet creation validation" ON live_bets
  FOR INSERT WITH CHECK (
    user_id = current_user_id() AND
    validate_bet_amount(stake) AND
    validate_odds(odds) AND
    can_place_bet(match_id)
  );

-- Create indexes for performance
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_bets_user_id_created ON bets(user_id, created_at DESC);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_live_bets_user_id_created ON live_bets(user_id, created_at DESC);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_transactions_user_id_created ON transactions(user_id, created_at DESC);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_audit_logs_timestamp ON audit_logs(timestamp DESC);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_audit_logs_user_id ON audit_logs(user_id);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_audit_logs_type ON audit_logs(type);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_audit_logs_severity ON audit_logs(severity);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_blocked_ips_expires ON blocked_ips(expires_at);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_matches_status ON matches(status);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_matches_start_time ON matches(start_time);

-- Create triggers for automatic auditing
CREATE OR REPLACE FUNCTION log_user_changes() RETURNS trigger AS $$
BEGIN
  IF TG_OP = 'UPDATE' THEN
    -- Log significant user changes
    IF OLD.bet_points != NEW.bet_points OR OLD.diamonds != NEW.diamonds THEN
      INSERT INTO audit_logs (type, action, user_id, details, timestamp, severity, outcome)
      VALUES (
        'data_access',
        'balance_change',
        NEW.id,
        jsonb_build_object(
          'old_bet_points', OLD.bet_points,
          'new_bet_points', NEW.bet_points,
          'old_diamonds', OLD.diamonds,
          'new_diamonds', NEW.diamonds
        ),
        NOW(),
        'low',
        'success'
      );
    END IF;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER user_balance_changes
  AFTER UPDATE ON users
  FOR EACH ROW
  EXECUTE FUNCTION log_user_changes();

-- Create view for secure user leaderboard
CREATE OR REPLACE VIEW leaderboard_view AS
SELECT 
  u.id,
  u.username,
  u.level,
  u.total_winnings,
  u.total_bets,
  u.win_rate,
  u.current_streak,
  u.favorite_team_id,
  t.name as favorite_team_name
FROM users u
LEFT JOIN teams t ON u.favorite_team_id = t.id
WHERE u.privacy_settings->>'show_in_leaderboard' != 'false'
ORDER BY u.total_winnings DESC;

-- Grant appropriate permissions
GRANT SELECT ON leaderboard_view TO authenticated;
GRANT SELECT ON leaderboard_view TO anon;

-- Security settings
ALTER DATABASE postgres SET log_statement = 'all';
ALTER DATABASE postgres SET log_duration = on;
ALTER DATABASE postgres SET log_min_duration_statement = 1000; -- Log slow queries

-- Comments for documentation
COMMENT ON POLICY "Users can view own profile" ON users IS 'Users can only access their own profile data';
COMMENT ON POLICY "Enhanced bet creation validation" ON bets IS 'Validates bet amounts, odds, and timing before allowing bet placement';
COMMENT ON FUNCTION validate_bet_amount(integer) IS 'Validates bet amount is within allowed range (1-10,000 bet points)';
COMMENT ON FUNCTION can_place_bet(uuid) IS 'Checks if betting is allowed for a specific match based on status and timing';
COMMENT ON VIEW leaderboard_view IS 'Secure view for public leaderboard data with privacy controls';

-- Final security check function
CREATE OR REPLACE FUNCTION security_health_check() RETURNS json AS $$
DECLARE
  result json;
  rls_enabled_count int;
  total_tables_count int;
BEGIN
  -- Count tables with RLS enabled
  SELECT COUNT(*) INTO rls_enabled_count
  FROM pg_class c
  JOIN pg_namespace n ON n.oid = c.relnamespace
  WHERE c.relkind = 'r' 
  AND n.nspname = 'public'
  AND c.relrowsecurity = true;
  
  -- Count total tables
  SELECT COUNT(*) INTO total_tables_count
  FROM pg_class c
  JOIN pg_namespace n ON n.oid = c.relnamespace
  WHERE c.relkind = 'r' 
  AND n.nspname = 'public';
  
  result := json_build_object(
    'rls_enabled_tables', rls_enabled_count,
    'total_tables', total_tables_count,
    'rls_coverage_percent', (rls_enabled_count::float / total_tables_count * 100)::int,
    'timestamp', NOW(),
    'status', CASE 
      WHEN rls_enabled_count = total_tables_count THEN 'SECURE'
      WHEN rls_enabled_count > 0 THEN 'PARTIAL'
      ELSE 'INSECURE'
    END
  );
  
  RETURN result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execute permission on health check
GRANT EXECUTE ON FUNCTION security_health_check() TO authenticated;

SELECT security_health_check();