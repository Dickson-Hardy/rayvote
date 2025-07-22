# Supabase Migration Instructions

## Setting up the Database

1. **Login to Supabase Dashboard**
   - Go to https://supabase.com/dashboard
   - Navigate to your project: `axctvelfelgdkbkjznmx`

2. **Run the Migration**
   - Go to the SQL Editor in your Supabase dashboard
   - Copy and paste the contents of `supabase/migrations/001_initial_schema.sql`
   - Execute the SQL script

3. **Verify Tables Created**
   After running the migration, you should have:
   - `users` table
   - `votes` table  
   - `vote_counts` view
   - Row Level Security policies
   - Triggers for timestamp updates

## Database Schema

### Users Table
```sql
users (
  id UUID PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  unique_id TEXT NOT NULL,
  has_voted BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP,
  updated_at TIMESTAMP
)
```

### Votes Table
```sql
votes (
  id UUID PRIMARY KEY,
  user_id UUID REFERENCES users(id),
  position_id TEXT NOT NULL,
  candidate_id TEXT NOT NULL,
  created_at TIMESTAMP,
  UNIQUE(user_id, position_id)
)
```

### Vote Counts View
```sql
vote_counts (
  position_id TEXT,
  candidate_id TEXT,
  vote_count INTEGER
)
```

## Testing the Setup

1. **Test User Creation**
   ```sql
   INSERT INTO users (email, unique_id) 
   VALUES ('test@gcn2009.com', '10382-GCN');
   ```

2. **Test Vote Submission**
   ```sql
   INSERT INTO votes (user_id, position_id, candidate_id) 
   VALUES (
     (SELECT id FROM users WHERE email = 'test@gcn2009.com'),
     'president',
     'raphael-iyama'
   );
   ```

3. **Test Vote Counts**
   ```sql
   SELECT * FROM vote_counts;
   ```

## Environment Variables

Make sure your `.env.local` file has:
```
VITE_SUPABASE_URL=https://axctvelfelgdkbkjznmx.supabase.co
VITE_SUPABASE_ANON_KEY=your_anon_key_here
```

## Real-time Subscriptions

The app automatically subscribes to real-time vote updates. No additional setup required if Realtime is enabled in your Supabase project.
