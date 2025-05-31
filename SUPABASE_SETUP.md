# Supabase Setup Guide for Tab URL & Title Copier Extension

This guide will help you set up Supabase as the database backend for your Firefox extension.

## 1. Create a Supabase Project

1. Go to [https://supabase.com](https://supabase.com)
2. Sign up or log in to your account
3. Click "New Project"
4. Choose your organization
5. Enter project details:
   - **Name**: `tab-copier-extension` (or any name you prefer)
   - **Database Password**: Choose a strong password
   - **Region**: Choose the region closest to you
6. Click "Create new project"
7. Wait for the project to be set up (usually takes 1-2 minutes)

## 2. Get Your Project Credentials

1. In your Supabase dashboard, go to **Settings** → **API**
2. Copy the following values:
   - **Project URL** (looks like `https://xxxxxxxxxxxxx.supabase.co`)
   - **Anon public key** (the `anon` key under "Project API keys")

## 3. Configure the Extension

1. Open the [`supabase-config.js`](supabase-config.js) file in your project
2. Replace the placeholder values with your actual credentials:

```javascript
const SUPABASE_CONFIG = {
  // Replace with your actual Supabase project URL
  url: 'https://your-project-ref.supabase.co',
  
  // Replace with your actual anon public key
  anonKey: 'your-anon-public-key-here',
  
  // Database table name (keep as is)
  tableName: 'link_batches'
};
```

## 4. Set Up the Database Schema

1. In your Supabase dashboard, go to **SQL Editor**
2. Click "New query"
3. Copy the contents of [`supabase-setup.sql`](supabase-setup.sql) file
4. Paste it into the SQL editor
5. Click "Run" to execute the SQL commands

This will create:
- The `link_batches` table to store your tab data
- Proper Row Level Security (RLS) policies
- Necessary indexes for performance
- A view for easier data querying

## 5. Enable Anonymous Authentication

1. In your Supabase dashboard, go to **Authentication** → **Settings**
2. Scroll down to "Auth Providers"
3. Find "Anonymous" and make sure it's **enabled**
4. This allows the extension to work without requiring user registration

## 6. Test the Extension

1. Load the extension in Firefox:
   - Go to `about:debugging`
   - Click "This Firefox"
   - Click "Load Temporary Add-on"
   - Select the `manifest.json` file from your project
2. Click the extension icon in the toolbar
3. You should see:
   - A green indicator showing "Connected to cloud storage"
   - The "Save to Cloud" checkbox should be enabled and checked
4. Open some tabs and click "Copy Tabs as CSV"
5. The extension should copy the data to clipboard AND save it to Supabase

## 7. Verify Data in Supabase

1. In your Supabase dashboard, go to **Table Editor**
2. Select the `link_batches` table
3. You should see your saved tab data with:
   - Unique `id` for each batch
   - `user_id` from anonymous authentication
   - `created_at` timestamp
   - `links` JSON data containing your tabs

## 8. Security Features

### Row Level Security (RLS)
- Each user can only access their own data
- Anonymous users are isolated from each other
- Data is automatically filtered by user ID

### Content Security Policy
- The extension only connects to your specific Supabase domain
- External scripts are limited to trusted CDNs

### Data Privacy
- URLs and titles are stored securely in your Supabase database
- Anonymous authentication means no personal information is required
- Each browser session gets a unique anonymous user ID

## 9. Troubleshooting

### "Please configure Supabase credentials" message
- Check that you've updated `supabase-config.js` with your actual credentials
- Make sure there are no typos in the URL or API key

### "Authentication failed" message
- Verify that Anonymous authentication is enabled in Supabase
- Check that your API key is correct
- Ensure your Supabase project is active

### "Connection failed" message
- Check your internet connection
- Verify the project URL is correct
- Make sure your Supabase project is running

### Data not saving to cloud
- Ensure the `link_batches` table exists
- Check that RLS policies are properly set up
- Verify the "Save to Cloud" checkbox is enabled

## 10. Optional Enhancements

### View Saved Data
You can query your saved data directly in Supabase:

```sql
SELECT 
  created_at,
  jsonb_array_length(links) as tab_count,
  links
FROM link_batches 
WHERE user_id = auth.uid()
ORDER BY created_at DESC;
```

### Export Data
To export all your data:

```sql
SELECT 
  created_at,
  link->>'url' as url,
  link->>'title' as title
FROM link_batches,
jsonb_array_elements(links) as link
WHERE user_id = auth.uid()
ORDER BY created_at DESC;
```

### Clean Old Data
To remove data older than 30 days:

```sql
DELETE FROM link_batches 
WHERE user_id = auth.uid() 
AND created_at < NOW() - INTERVAL '30 days';
```

## 11. Cost Considerations

Supabase offers a generous free tier:
- **Database**: 500MB included
- **Auth**: 50,000 monthly active users
- **API requests**: 5GB bandwidth

For typical usage of this extension (saving tab data), you're very unlikely to exceed the free tier limits.

## Support

If you encounter issues:
1. Check the browser console for error messages
2. Verify your Supabase dashboard for any service status issues
3. Review this setup guide to ensure all steps were completed
4. Check the [Supabase documentation](https://supabase.com/docs) for additional help