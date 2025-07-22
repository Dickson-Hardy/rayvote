-- Enable Row Level Security
ALTER DATABASE postgres SET row_security = on;

-- Valid voter IDs table (stores pre-approved unique IDs)
CREATE TABLE valid_voter_ids (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  unique_id TEXT UNIQUE NOT NULL,
  voter_name TEXT, -- Optional: store voter name for reference
  issued_by TEXT, -- Who issued this ID
  is_active BOOLEAN DEFAULT TRUE, -- Can be disabled without deletion
  notes TEXT, -- Any additional notes about this voter
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Users table
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT UNIQUE NOT NULL,
  unique_id TEXT NOT NULL REFERENCES valid_voter_ids(unique_id),
  has_voted BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Votes table
CREATE TABLE votes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  position_id TEXT NOT NULL,
  candidate_id TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, position_id) -- Prevent multiple votes for same position
);

-- Vote counts view for easy aggregation
CREATE VIEW vote_counts AS
SELECT 
  position_id,
  candidate_id,
  COUNT(*) as vote_count
FROM votes 
GROUP BY position_id, candidate_id
ORDER BY position_id, vote_count DESC;

-- Admin view for voter management
CREATE VIEW voter_status AS
SELECT 
  v.unique_id,
  v.voter_name,
  v.is_active,
  u.email,
  u.has_voted,
  u.created_at as registered_at,
  CASE WHEN u.id IS NOT NULL THEN true ELSE false END as has_registered
FROM valid_voter_ids v
LEFT JOIN users u ON v.unique_id = u.unique_id
ORDER BY v.unique_id;

-- Enable Row Level Security
ALTER TABLE valid_voter_ids ENABLE ROW LEVEL SECURITY;
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE votes ENABLE ROW LEVEL SECURITY;

-- RLS Policies for valid_voter_ids table
CREATE POLICY "Anyone can read valid IDs" ON valid_voter_ids
  FOR SELECT USING (is_active = true);

-- RLS Policies for users table
CREATE POLICY "Users can read their own data" ON users
  FOR SELECT USING (true);

CREATE POLICY "Users can insert their own data" ON users
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Users can update their own data" ON users
  FOR UPDATE USING (true);

-- RLS Policies for votes table  
CREATE POLICY "Anyone can read votes" ON votes
  FOR SELECT USING (true);

CREATE POLICY "Users can insert votes" ON votes
  FOR INSERT WITH CHECK (true);

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Triggers to update updated_at
CREATE TRIGGER update_valid_voter_ids_updated_at 
  BEFORE UPDATE ON valid_voter_ids 
  FOR EACH ROW 
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_users_updated_at 
  BEFORE UPDATE ON users 
  FOR EACH ROW 
  EXECUTE FUNCTION update_updated_at_column();

-- Insert the valid voter IDs
INSERT INTO valid_voter_ids (unique_id, issued_by, notes) VALUES
('10382-GCN', 'system', 'GCN Class of 2009 Alumni'),
('18495-GCN', 'system', 'GCN Class of 2009 Alumni'),
('26731-GCN', 'system', 'GCN Class of 2009 Alumni'),
('10947-GCN', 'system', 'GCN Class of 2009 Alumni'),
('73284-GCN', 'system', 'GCN Class of 2009 Alumni'),
('48219-GCN', 'system', 'GCN Class of 2009 Alumni'),
('84926-GCN', 'system', 'GCN Class of 2009 Alumni'),
('36572-GCN', 'system', 'GCN Class of 2009 Alumni'),
('59041-GCN', 'system', 'GCN Class of 2009 Alumni'),
('72839-GCN', 'system', 'GCN Class of 2009 Alumni'),
('14372-GCN', 'system', 'GCN Class of 2009 Alumni'),
('93710-GCN', 'system', 'GCN Class of 2009 Alumni'),
('32857-GCN', 'system', 'GCN Class of 2009 Alumni'),
('98243-GCN', 'system', 'GCN Class of 2009 Alumni'),
('61724-GCN', 'system', 'GCN Class of 2009 Alumni'),
('28490-GCN', 'system', 'GCN Class of 2009 Alumni'),
('86517-GCN', 'system', 'GCN Class of 2009 Alumni'),
('34582-GCN', 'system', 'GCN Class of 2009 Alumni'),
('71963-GCN', 'system', 'GCN Class of 2009 Alumni'),
('23091-GCN', 'system', 'GCN Class of 2009 Alumni'),
('89315-GCN', 'system', 'GCN Class of 2009 Alumni'),
('67341-GCN', 'system', 'GCN Class of 2009 Alumni'),
('14790-GCN', 'system', 'GCN Class of 2009 Alumni'),
('52483-GCN', 'system', 'GCN Class of 2009 Alumni'),
('19836-GCN', 'system', 'GCN Class of 2009 Alumni'),
('82039-GCN', 'system', 'GCN Class of 2009 Alumni'),
('46925-GCN', 'system', 'GCN Class of 2009 Alumni'),
('35617-GCN', 'system', 'GCN Class of 2009 Alumni'),
('98206-GCN', 'system', 'GCN Class of 2009 Alumni'),
('67981-GCN', 'system', 'GCN Class of 2009 Alumni'),
('30871-GCN', 'system', 'GCN Class of 2009 Alumni'),
('56490-GCN', 'system', 'GCN Class of 2009 Alumni'),
('83724-GCN', 'system', 'GCN Class of 2009 Alumni'),
('12984-GCN', 'system', 'GCN Class of 2009 Alumni'),
('79306-GCN', 'system', 'GCN Class of 2009 Alumni'),
('25174-GCN', 'system', 'GCN Class of 2009 Alumni'),
('91728-GCN', 'system', 'GCN Class of 2009 Alumni'),
('68491-GCN', 'system', 'GCN Class of 2009 Alumni'),
('34015-GCN', 'system', 'GCN Class of 2009 Alumni'),
('97528-GCN', 'system', 'GCN Class of 2009 Alumni'),
('18294-GCN', 'system', 'GCN Class of 2009 Alumni'),
('26798-GCN', 'system', 'GCN Class of 2009 Alumni'),
('58147-GCN', 'system', 'GCN Class of 2009 Alumni'),
('39847-GCN', 'system', 'GCN Class of 2009 Alumni'),
('75120-GCN', 'system', 'GCN Class of 2009 Alumni'),
('46279-GCN', 'system', 'GCN Class of 2009 Alumni'),
('84016-GCN', 'system', 'GCN Class of 2009 Alumni'),
('62471-GCN', 'system', 'GCN Class of 2009 Alumni'),
('37924-GCN', 'system', 'GCN Class of 2009 Alumni'),
('90823-GCN', 'system', 'GCN Class of 2009 Alumni'),
('29741-GCN', 'system', 'GCN Class of 2009 Alumni'),
('73820-GCN', 'system', 'GCN Class of 2009 Alumni'),
('15890-GCN', 'system', 'GCN Class of 2009 Alumni'),
('98320-GCN', 'system', 'GCN Class of 2009 Alumni'),
('64287-GCN', 'system', 'GCN Class of 2009 Alumni'),
('39018-GCN', 'system', 'GCN Class of 2009 Alumni'),
('57129-GCN', 'system', 'GCN Class of 2009 Alumni'),
('48019-GCN', 'system', 'GCN Class of 2009 Alumni'),
('62418-GCN', 'system', 'GCN Class of 2009 Alumni'),
('31827-GCN', 'system', 'GCN Class of 2009 Alumni'),
('26934-GCN', 'system', 'GCN Class of 2009 Alumni'),
('87310-GCN', 'system', 'GCN Class of 2009 Alumni'),
('49872-GCN', 'system', 'GCN Class of 2009 Alumni'),
('20839-GCN', 'system', 'GCN Class of 2009 Alumni'),
('67245-GCN', 'system', 'GCN Class of 2009 Alumni'),
('73948-GCN', 'system', 'GCN Class of 2009 Alumni'),
('14298-GCN', 'system', 'GCN Class of 2009 Alumni'),
('86147-GCN', 'system', 'GCN Class of 2009 Alumni'),
('90382-GCN', 'system', 'GCN Class of 2009 Alumni'),
('74836-GCN', 'system', 'GCN Class of 2009 Alumni'),
('25784-GCN', 'system', 'GCN Class of 2009 Alumni'),
('39714-GCN', 'system', 'GCN Class of 2009 Alumni'),
('56029-GCN', 'system', 'GCN Class of 2009 Alumni'),
('43127-GCN', 'system', 'GCN Class of 2009 Alumni'),
('94306-GCN', 'system', 'GCN Class of 2009 Alumni'),
('62381-GCN', 'system', 'GCN Class of 2009 Alumni'),
('59240-GCN', 'system', 'GCN Class of 2009 Alumni'),
('37962-GCN', 'system', 'GCN Class of 2009 Alumni'),
('42781-GCN', 'system', 'GCN Class of 2009 Alumni'),
('98041-GCN', 'system', 'GCN Class of 2009 Alumni'),
('37485-GCN', 'system', 'GCN Class of 2009 Alumni'),
('14620-GCN', 'system', 'GCN Class of 2009 Alumni'),
('81902-GCN', 'system', 'GCN Class of 2009 Alumni'),
('26497-GCN', 'system', 'GCN Class of 2009 Alumni'),
('35910-GCN', 'system', 'GCN Class of 2009 Alumni'),
('70584-GCN', 'system', 'GCN Class of 2009 Alumni'),
('62918-GCN', 'system', 'GCN Class of 2009 Alumni'),
('80471-GCN', 'system', 'GCN Class of 2009 Alumni'),
('18694-GCN', 'system', 'GCN Class of 2009 Alumni'),
('25409-GCN', 'system', 'GCN Class of 2009 Alumni'),
('91730-GCN', 'system', 'GCN Class of 2009 Alumni'),
('36074-GCN', 'system', 'GCN Class of 2009 Alumni'),
('47209-GCN', 'system', 'GCN Class of 2009 Alumni'),
('61927-GCN', 'system', 'GCN Class of 2009 Alumni'),
('86413-GCN', 'system', 'GCN Class of 2009 Alumni'),
('94275-GCN', 'system', 'GCN Class of 2009 Alumni'),
('78310-GCN', 'system', 'GCN Class of 2009 Alumni'),
('28579-GCN', 'system', 'GCN Class of 2009 Alumni'),
('32061-GCN', 'system', 'GCN Class of 2009 Alumni'),
('60487-GCN', 'system', 'GCN Class of 2009 Alumni');
