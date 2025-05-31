# Plan: Connecting Firefox Extension to Remote Database (Supabase)

## 1. Goal

Connect the Firefox extension ("Tab URL & Title Copier") to a remote database to allow users to save their copied tab links. This will provide a persistent storage solution beyond the clipboard.

## 2. Chosen Approach: Supabase as BaaS

We will use Supabase as a Backend-as-a-Service (BaaS) to simplify development and avoid managing a separate backend server.

*   **Database:** PostgreSQL (relational database with JSON support)
*   **Authentication:** Supabase Anonymous Authentication (initially, for simplicity)
*   **Backend Logic:** Primarily handled by Row Level Security (RLS) policies and client-side logic in the extension.

## 3. Architecture

```mermaid
graph TD
    A[Firefox Extension (popup.js)] -- HTTPS (Supabase JS) --> B{Supabase};
    B -- Authenticates --> C[Supabase Authentication (Anonymous)];
    B -- Reads/Writes Data --> D[PostgreSQL Database];

    subgraph Supabase Project
        C
        D
    end

    A --> E[User's Browser];
    D -- Stores --> F[Link Data (Tables/Rows)];
```

**Flow:**
1.  User opens the extension popup.
2.  [`popup.js`](popup/popup.js) initializes Supabase and signs the user in anonymously (if not already).
3.  User clicks "Copy Tabs".
4.  [`popup.js`](popup/popup.js) collects tab data (URLs and titles).
5.  [`popup.js`](popup/popup.js) sends this data to Supabase PostgreSQL, associated with the anonymous user's ID.

## 4. Data Model (PostgreSQL)

**Tables:**

### `link_batches` table:
*   **id:** `uuid` (Primary key, auto-generated)
*   **user_id:** `uuid` (Foreign key to auth.users, anonymous user ID)
*   **created_at:** `timestamp with time zone` (Auto-generated timestamp)
*   **links:** `jsonb` (Array of link objects)

**Table Structure:**
```sql
CREATE TABLE link_batches (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  links JSONB NOT NULL
);
```

**Example Data:**
```json
{
  "id": "550e8400-e29b-41d4-a716-446655440000",
  "user_id": "b47c23f5-8f4e-4b9a-9d8c-1234567890ab",
  "created_at": "2025-05-30T08:30:00.000Z",
  "links": [
    { "url": "https://www.example.com", "title": "Example Domain" },
    { "url": "https://www.mozilla.org", "title": "Mozilla" }
  ]
}
```

## 5. Phased Implementation Plan

### Phase 1: Supabase Setup & Basic Integration (Anonymous User)

1.  **Supabase Project Setup:**
    *   Create a new Supabase project via the Supabase dashboard.
    *   Get the project URL and anon public API key.
2.  **Enable Services:**
    *   **PostgreSQL Database** is enabled by default.
    *   Enable **Anonymous Authentication** in the Supabase Auth settings.
3.  **Database Setup:**
    *   Create the `link_batches` table with the schema defined above.
    *   Set up Row Level Security (RLS) policies:
    ```sql
    -- Enable RLS on the table
    ALTER TABLE link_batches ENABLE ROW LEVEL SECURITY;
    
    -- Policy: Users can only access their own data
    CREATE POLICY "Users can only access their own link batches"
    ON link_batches
    FOR ALL
    USING (auth.uid() = user_id);
    ```
4.  **Integrate Supabase SDK into Extension:**
    *   Add the Supabase JavaScript client to [`popup/popup.html`](popup/popup.html) via CDN or bundle.
    *   Initialize Supabase in [`popup.js`](popup/popup.js) with the project URL and anon key.
5.  **Modify [`popup.js`](popup/popup.js):**
    *   **Anonymous Sign-in:** On popup load, check if a user is signed in. If not, sign them in anonymously using `supabase.auth.signInAnonymously()`.
    *   **Data Saving Logic:**
        *   When the `copyTabsButton` is clicked and tab data is collected:
            *   Get the current anonymous user's ID.
            *   Construct the data object (links array).
            *   Use the Supabase SDK to insert a new row into the `link_batches` table.
    *   **User Feedback:** Provide status messages for successful save or errors.
6.  **Update [`manifest.json`](manifest.json) Content Security Policy (CSP):**
    *   Add Supabase domains to `content_security_policy` to allow connections.
    *   Example:
        ```json
        "content_security_policy": "script-src 'self' https://*.supabase.co https://unpkg.com; connect-src 'self' https://*.supabase.co; object-src 'self'"
        ```

### Phase 2: Enhancements & Security Refinement

1.  **Refine Row Level Security Policies:**
    *   Thoroughly test and tighten RLS policies to ensure data privacy and prevent unauthorized access.
    *   Add policies for specific operations (INSERT, SELECT, UPDATE, DELETE) if needed.
2.  **Robust Error Handling:**
    *   Implement comprehensive error handling for Supabase operations (network issues, permission errors, etc.) in [`popup.js`](popup/popup.js).
3.  **User Interface for Saved Links (Optional Future Enhancement):**
    *   Consider adding a new section/page in the popup to view, search, or manage saved links.
    *   Use Supabase's real-time features to sync data across browser instances.
4.  **Transition to Permanent Accounts (Optional Future Enhancement):**
    *   If user accounts are desired, plan for linking anonymous accounts to permanent authentication methods (e.g., Google, Email/Password).

## 6. Key Security Considerations

*   **Row Level Security (RLS):** This is the primary mechanism for protecting user data. Policies must be carefully crafted and tested.
*   **Content Security Policy (CSP):** The `manifest.json` CSP must be correctly configured to prevent XSS and only allow connections to trusted Supabase domains.
*   **API Key Security:** The Supabase anon key is safe to use in client-side code as it only allows operations permitted by RLS policies.
*   **Input Validation:** The data being saved (URLs, titles) comes from `browser.tabs`, which is generally trustworthy. However, ensure any cleaning or transformation doesn't introduce vulnerabilities.

## 7. Key Advantages of Supabase over Firebase

*   **SQL Database:** PostgreSQL provides ACID compliance, complex queries, and familiar SQL syntax.
*   **Real-time Features:** Built-in real-time subscriptions for live data updates.
*   **Open Source:** Self-hostable and no vendor lock-in.
*   **Better Developer Experience:** More intuitive dashboard and debugging tools.
*   **Cost-effective:** More generous free tier and transparent pricing.

## 8. Next Steps

*   Proceed with Phase 1: Supabase project setup and basic integration.
*   Continue with implementation in "Code" mode.