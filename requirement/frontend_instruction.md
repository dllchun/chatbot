## **Frontend Instructions**

### **#Project Overview**

The frontend of the chatbot app will use **Next.js (App Router)** to create a responsive and user-friendly interface. It will allow users to view and manage chatbot conversations fetched from the **Chatbase API**, and associate WhatsApp numbers with conversations. The design will be mobile-first, leveraging **Tailwind CSS** and **ShadCN components** for consistent styling and UI.

Key responsibilities of the frontend include:
1. Displaying conversations retrieved from the backend.
2. Allowing users to filter and search conversations.
3. Managing WhatsApp number associations through forms and modals.
4. Providing authentication and secure access using **Clerk**.

---

### **#Feature Requirements**

1. **Conversation Page**:  
   - Display a paginated list of conversations retrieved from the backend.
   - Show key conversation details such as:
     - Chatbot ID
     - Source (e.g., WhatsApp, Widget, Instagram)
     - Date of creation
     - Customer identifier
   - Allow users to search and filter conversations by:
     - Date range
     - Source
     - Keyword (search through messages)
   - When user clicks on a conversation from the conversation list, the right container should show the conversation details.
   - Use placeholder conversation details when the conversation is not loaded and API is not ready.
   - The conversation page should have different layout structure (Fixed viewport width and height for the parent container), user can only scroll the listing and the details container.

2. **Chatbot Playground Page**:  
   - Allow users to send messages to the chatbot and see the response.
   - Will use iframe to display the chatbot (https://www.chatbase.co/chatbot-iframe/PTnQaHCF4UkuO5mxwItxv). Allow user to change the chatbot ID and the chatbot name.

3. **Analytics Page**:  
   - Process the data from the backend and display the analytics in a chart.
   - The data will be fetched from the backend using the API endpoint (`GET /api/analytics`).
   - The data will be processed in the frontend and displayed in a chart.
   - The chart will be displayed in the analytics page.

4. **Settings Page**:  
   - Display user profile details fetched from **Clerk**.  
   - Allow users to update profile settings (e.g., name, email, notification preferences).  

5. **Global Components**:  
   - Create reusable components for:
     - **Button**: For actions across the app.
     - **Input**: For forms, including WhatsApp number input.
     - **Modal**: For dialogs such as editing WhatsApp numbers.
     - **Pagination**: For navigating through large lists of conversations.
     - **Loading**: For loading states.
     - **Error**: For error states.
     - **Toast**: For toast messages.
     - **Header**: For the header of the app (with the logo and the user profile, and the menu icon (playground, chatlog, analytics, settings)).

6. **Integration with Backend**:  
   - Fetch conversations from the backend using RESTful APIs.  
   - Submit WhatsApp number updates to the backend.  

7. **Authentication and Authorization**:  
   - Secure all pages using **Clerk** authentication. Redirect unauthenticated users to the login page.

---

### **#Rules**

1. **Next.js App Router**:  
   - Use the App Router for routing and layouts.
   - Organize pages as follows:
     - `/conversations`: Display the list of conversations.
     - `/conversations/[id]`: Show details of a specific conversation.
     - `/settings`: Display user profile settings.

2. **Responsive Design**:  
   - Ensure all pages are optimized for mobile devices first.
   - Use **Tailwind CSS** for styling and utility classes.

3. **Reusable Components**:  
   - Store reusable components in `/components/`.
   - Components should be modular and easy to customize.

4. **State Management**:  
   - Use **React Context** or **Zustand** for managing global states such as filters and selected conversations.

5. **Error Handling**:  
   - Display appropriate error messages for failed API calls (e.g., "Failed to load conversations").
   - Handle edge cases like empty conversation lists gracefully.

---

### **#Relevant Tools and Docs**

1. **Framework**: Next.js (App Router)  
   - [Next.js Documentation](https://nextjs.org/docs)

2. **Styling**: Tailwind CSS  
   - [Tailwind CSS Documentation](https://tailwindcss.com/docs)

3. **UI Library**: ShadCN Components  
   - [ShadCN Components Documentation](https://shadcn.dev/)

4. **Authentication**: Clerk  
   - [Clerk Documentation](https://clerk.dev/docs)

5. **Backend Integration**:  
   - RESTful APIs created in the backend will expose endpoints for fetching and updating conversations.

---

### **#Scalability and Growth**

1. **State Management**:  
   - Use **React Context** or **Zustand** to manage global states like filters, selected conversations, and user preferences.

2. **Pagination and Lazy Loading**:  
   - Implement server-side pagination for conversation lists.  
   - Use lazy loading for conversation details to optimize performance.

3. **Error Boundaries**:  
   - Add global error boundaries to catch and handle unexpected errors gracefully.

4. **Future Enhancements**:  
   - Add support for real-time chat updates using WebSockets or Supabase’s real-time features.  
   - Implement analytics and insights for chatbot performance (e.g., number of messages, most active sources).

---

### **#Current File Structure**
STANDARD-CHATBOT/
├── app/
│   ├── (routes)/
│   │   └── playground/
│   │       ├── api-test/
│   │       │   └── page.tsx
│   │       ├── sync-status/
│   │       │   └── page.tsx
│   │       └── api/
│   │           ├── analytics/
│   │           │   └── route.ts
│   │           ├── conversations-[id]/
│   │           │   └── update-whatsapp/
│   │           │       └── route.ts
│   │           └── sync-status/
│   │               └── test/
│   │                   └── route.ts
│   ├── favicon.ico
│   ├── globals.css
│   ├── layout.tsx
│   └── page.tsx
├── components/
│   ├── layout/
│   │   └── header.tsx
│   └── ui/
│       └── button.tsx
├── config/
│   └── site.ts
├── hooks/
├── lib/
│   ├── api/
│   │   ├── chatbase.ts
│   │   └── supabase.ts
│   ├── services/
│   │   └── cache.ts
│   └── utils/
│       ├── analytics.ts
│       ├── index.ts
│       └── config.ts
├── public/
│   ├── file.svg
│   ├── globe.svg
│   ├── next.svg
│   ├── vercel.svg
│   └── window.svg
├── requirement/
│   ├── backend_instruction.md
│   ├── conversation_page.png
│   ├── frontend_instruction.md
│   └── header.png
├── supabase/
│   └── migrations/
│       ├── 20240000000000_update...
│       ├── 20240000000001_update...
│       ├── 20240000000002_update...
│       ├── 20240000000003_create...
│       └── 20240000000004_create...
├── types/
├── .env
├── .env.local
├── .gitignore
├── components.json
├── eslint.config.mjs
├── functions.sql
├── middleware.ts
├── next-env.d.ts
├── next.config.js
├── package-lock.json
├── package.json
├── postcss.config.mjs
├── README.md
├── schema.sql
├── tailwind.config.ts
├── test-env.js
├── test-supabase.js
└── tsconfig.json

### **Integration with Backend**

#### **Fetch Conversations**
- Use the backend endpoint (`GET /api/conversations`) to retrieve conversations.
- Pass query parameters for filtering (e.g., `startDate`, `endDate`, `source`).

#### **Error Handling for API Calls**
- Show loading spinners while fetching data.  
- Display error messages if the API call fails (e.g., "Failed to fetch conversations").

---
