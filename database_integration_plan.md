# Plan: Connecting Firefox Extension to Remote Database (Firebase Firestore)

## 1. Goal

Connect the Firefox extension ("Tab URL & Title Copier") to a remote database to allow users to save their copied tab links. This will provide a persistent storage solution beyond the clipboard.

## 2. Chosen Approach: Firebase as BaaS

We will use Firebase as a Backend-as-a-Service (BaaS) to simplify development and avoid managing a separate backend server.

*   **Database:** Cloud Firestore (NoSQL, document-based)
*   **Authentication:** Firebase Anonymous Authentication (initially, for simplicity)
*   **Backend Logic:** Primarily handled by Firestore security rules and client-side logic in the extension.

## 3. Architecture

```mermaid
graph TD
    A[Firefox Extension (popup.js)] -- HTTPS (Firebase SDK) --> B{Firebase};
    B -- Authenticates --> C[Firebase Authentication (Anonymous)];
    B -- Reads/Writes Data --> D[Cloud Firestore];

    subgraph Firebase Project
        C
        D
    end

    A --> E[User's Browser];
    D -- Stores --> F[Link Data (Collections/Documents)];
```

**Flow:**
1.  User opens the extension popup.
2.  [`popup.js`](popup/popup.js) initializes Firebase and signs the user in anonymously (if not already).
3.  User clicks "Copy Tabs".
4.  [`popup.js`](popup/popup.js) collects tab data (URLs and titles).
5.  [`popup.js`](popup/popup.js) sends this data to Cloud Firestore, associated with the anonymous user's ID.

## 4. Data Model (Firestore)

*   **Root Collection:** `userLinks`
    *   **Document ID:** `firebase_anonymous_uid` (e.g., `anonymousUser123`)
        *   **Subcollection:** `linkBatches`
            *   **Document ID:** Auto-generated (e.g., `batchABC789`)
                *   **Fields:**
                    *   `timestamp`: `firebase.firestore.FieldValue.serverTimestamp()` (Timestamp of when the batch was saved)
                    *   `links`: `Array` of `Objects`
                        *   Each object: `{ url: "string", title: "string" }`

**Example:**
```
userLinks/ (collection)
  L anonymousUser123/ (document - UID)
      L linkBatches/ (subcollection)
          L batchABC789/ (document - auto-ID)
              - timestamp: May 30, 2025 at 8:30:00 AM UTC+2
              - links: [
                  { url: "https://www.example.com", title: "Example Domain" },
                  { url: "https://www.mozilla.org", title: "Mozilla" }
                ]
          L batchDEF456/ (document - auto-ID)
              - timestamp: May 30, 2025 at 8:35:10 AM UTC+2
              - links: [
                  { url: "https://developer.mozilla.org", title: "MDN Web Docs" }
                ]
```

## 5. Phased Implementation Plan

### Phase 1: Firebase Setup & Basic Integration (Anonymous User)

1.  **Firebase Project Setup:**
    *   Create a new Firebase project via the Firebase console.
    *   Add a Web App to the project.
2.  **Enable Services:**
    *   Enable **Cloud Firestore** in the Firebase console.
    *   Enable **Anonymous Authentication** in the Firebase Authentication section.
3.  **Firestore Security Rules (Initial - to be refined):**
    *   Start with rules that allow authenticated (anonymous) users to read/write their own data.
    ```firestore-rules
    rules_version = '2';
    service cloud.firestore {
      match /databases/{database}/documents {
        // Allow users to read and write only their own link batches
        match /userLinks/{userId}/linkBatches/{batchId} {
          allow read, write: if request.auth != null && request.auth.uid == userId;
        }
      }
    }
    ```
4.  **Integrate Firebase SDK into Extension:**
    *   Add the Firebase SDK scripts to [`popup/popup.html`](popup/popup.html) or import as modules in [`popup/popup.js`](popup/popup.js).
    *   Initialize Firebase in [`popup.js`](popup/popup.js) with the project configuration.
5.  **Modify [`popup.js`](popup/popup.js):**
    *   **Anonymous Sign-in:** On popup load, check if a user is signed in. If not, sign them in anonymously using `firebase.auth().signInAnonymously()`. Store the user object.
    *   **Data Saving Logic:**
        *   When the `copyTabsButton` is clicked and tab data is collected:
            *   Get the current anonymous user's UID.
            *   Construct the data object (timestamp, links array).
            *   Use the Firebase SDK to add a new document to the `userLinks/{UID}/linkBatches` subcollection.
    *   **User Feedback:** Provide status messages for successful save or errors.
6.  **Update [`manifest.json`](manifest.json) Content Security Policy (CSP):**
    *   Add Firebase domains to `content_security_policy` to allow connections.
    *   Example (will need specific Firebase domains):
        ```json
        "content_security_policy": "script-src 'self' https://www.gstatic.com/ https://*.firebaseio.com https://apis.google.com; object-src 'self'"
        ```
        *(Note: The exact domains will be confirmed from Firebase documentation during implementation).*

### Phase 2: Enhancements & Security Refinement

1.  **Refine Firestore Security Rules:**
    *   Thoroughly test and tighten security rules to ensure data privacy and prevent unauthorized access (e.g., users can only create, read, update, delete their own link batches).
2.  **Robust Error Handling:**
    *   Implement comprehensive error handling for Firebase operations (network issues, permission errors, etc.) in [`popup.js`](popup/popup.js).
3.  **User Interface for Saved Links (Optional Future Enhancement):**
    *   Consider adding a new section/page in the popup to view, search, or manage saved links.
4.  **Transition to Permanent Accounts (Optional Future Enhancement):**
    *   If user accounts are desired, plan for linking anonymous accounts to permanent authentication methods (e.g., Google, Email/Password).

## 6. Key Security Considerations

*   **Firestore Security Rules:** This is the primary mechanism for protecting user data. Rules must be carefully crafted and tested.
*   **Content Security Policy (CSP):** The `manifest.json` CSP must be correctly configured to prevent XSS and only allow connections to trusted Firebase domains.
*   **API Key Security:** While Firebase API keys for web apps are generally considered public, ensure no sensitive configuration or server-side keys are exposed in the client-side code. Firestore rules handle data access control.
*   **Input Validation:** The data being saved (URLs, titles) comes from `browser.tabs`, which is generally trustworthy. However, ensure any cleaning or transformation doesn't introduce vulnerabilities.

## 7. Next Steps

*   Proceed with Phase 1: Firebase project setup and basic integration.
*   Switch to a "Code" mode for implementation.