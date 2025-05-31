// Supabase Configuration
// Replace these with your actual Supabase project credentials

const SUPABASE_CONFIG = {
  // Your Supabase project URL (replace with your actual URL)
  url: 'https://your-project-ref.supabase.co',
  
  // Your Supabase anon public key (replace with your actual anon key)
  anonKey: 'your-anon-public-key-here',
  
  // Database table name
  tableName: 'link_batches'
};

// Export for use in popup.js
if (typeof module !== 'undefined' && module.exports) {
  module.exports = SUPABASE_CONFIG;
}