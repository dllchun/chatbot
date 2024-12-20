## **Backend Instructions**

### **#Project Overview**

The backend of the chatbot app will handle data persistence, API management, and authentication. The backend will integrate with the **Chatbase API** to retrieve chatbot conversations and implement custom logic to handle WhatsApp numbers, as the original API does not directly associate conversations with WhatsApp. This backend will also provide RESTful endpoints to interact with the frontend.

Key responsibilities of the backend include:
1. Fetching and processing chatbot conversations using the **Chatbase API**.
2. Storing conversation data in the database.
3. Implementing custom logic to associate WhatsApp numbers with conversations if the user has provided them.

---

### **#Feature Requirements**

1. **Integrate Chatbase API**:
   - Use the Chatbase API's **Get Conversations** endpoint to fetch chatbot conversations.
   - Implement filters for chatbot ID, date range, pagination, and sources.

2. **Custom Logic for WhatsApp Numbers**:
   - Since the Chatbase API does not generate WhatsApp-specific messages, add custom logic to infer WhatsApp numbers if the user has filled them in on the frontend (Like the begining the chatbot will ask for the WhatsApp number, if the user has filled it in the next response (check if its 8 digits, we will store in the database)).
   - Store the WhatsApp number in the database (`Conversations` table) and link it to the corresponding conversation.

3. **Backend API Endpoints**:
   - **Fetch Conversations**: Provide a RESTful API for the frontend to fetch conversations with filters.
   - **Update WhatsApp Numbers**: Allow the frontend to update the WhatsApp number associated with a conversation.
   - **Sync Conversations**: Sync and store conversations from the Chatbase API into the database.
   - **Analytics**: Provide a RESTful API for the frontend to fetch analytics data, it will process the data from the backend and display the analytics in a chart, including total conversations, total messages, total users, engagement rate, average response time, region, and more.

4. **Authentication**:
   - Use **Clerk** middleware to secure all API endpoints.

5. **Database Models**:
   - `Users`: Store user information synced from Clerk.
   - `Conversations`: Store conversation data, including messages and WhatsApp numbers.

---

### **#Rules**

1. **Use Chatbase API**:  
   - The `GET https://www.chatbase.co/api/v1/get-conversations` endpoint will be the primary source for fetching chatbot conversations.  
   - Include appropriate headers (`Authorization: Bearer <Your-Secret-Key>`) for authentication.

2. **Custom Logic for WhatsApp**:  
   - If a user has filled in a WhatsApp number, associate it with the corresponding conversation. Store the WhatsApp number in the database for easy retrieval and filtering.

3. **RESTful API Design**:  
   - Ensure each backend API endpoint follows RESTful conventions.  
   - For example:
     - Fetch all conversations: `GET /api/conversations`
     - Update WhatsApp number: `POST /api/conversations/:id/update-whatsapp`

4. **Database Optimization**:  
   - Add indexes to frequently queried fields (`user_id`, `created_at`) for efficient queries.  
   - Use JSONB to store conversation messages for flexibility.

5. **Error Handling**:  
   - Provide clear error responses for invalid requests (e.g., invalid chatbot IDs, missing WhatsApp numbers).  
   - Handle and log internal server errors effectively.

---

### **#Relevant Tools and Docs**

1. **Chatbase API**:  
   - [Chatbase Get Conversations Documentation](https://docs.chatbase.co/docs/get-conversations)  
   - Use this API to fetch conversations and sync them with the backend.

2. **Database**: Supabase  
   - [Supabase Documentation](https://supabase.com/docs)  
   - Supabase will store user and conversation data.

3. **Authentication**: Clerk  
   - [Clerk Documentation](https://clerk.dev/docs)

4. **Backend Framework**: Next.js API Routes  
   - [Next.js API Routes Documentation](https://nextjs.org/docs/api-routes/introduction)  

---

### **#Scalability and Growth**

1. **Database Optimization**:  
   - Add indexes on `user_id` and `created_at` fields in the `Conversations` table.  
   - Use pagination for large datasets to prevent performance issues.

2. **Real-Time Features**:  
   - Plan for real-time updates using WebSockets or Supabase’s real-time capabilities.

3. **Error Logging**:  
   - Integrate a logging system like Sentry to monitor and debug backend errors.

4. **Future Enhancements**:  
   - Add analytics endpoints to track activity trends (e.g., conversation volume, response times).

---

### **#Current File Structure**

.
├── app
│   ├── globals.css
│   ├── layout.tsx
│   └── page.tsx
├── components
│   └── ui
│       └── button.tsx
├── lib
│   └── utils.ts
├── requirement
│   ├── frontend_instruction.md
│   └── backend_instruction.md
├── .gitignore
├── components.json
├── eslint.config.mjs
├── next.config.ts
├── package.json
├── postcss.config.mjs
├── README.md
├── tailwind.config.ts
└── tsconfig.json

---

### **Integration with Chatbase API**

#### **API Endpoint**
`GET https://www.chatbase.co/api/v1/get-conversations`

#### **Request Headers**
```plaintext
Authorization: Bearer <Your-Secret-Key>
```

#### **Request Parameters**
1. `chatbotId`: The ID of the target chatbot (required).  
2. `filteredSources`: A comma-separated string of sources to filter conversations (optional).  
   - Possible values: API, Chatbase site, Instagram, Messenger, Slack, Unspecified, WhatsApp, Widget or Iframe.  
3. `startDate` and `endDate`: Date range to filter conversations (optional).  
4. `page` and `size`: Pagination parameters.

#### **Example Request**
```bash
curl --request GET \
     --url 'https://www.chatbase.co/api/v1/get-conversations?chatbotId=<chatbot-id>&startDate=2023-01-01&endDate=2023-12-12&page=1&size=20' \
     --header 'Authorization: Bearer <Your-Secret-Key>'
```

#### **Response Example**
```json
{
  "data": [
    {
      "id": "string",
      "created_at": "string",
        "messages": [
        {
          "role": "string",
          "content": "string"
        }
      ],
      "chatbot_id": "string",
      "customer": "string",
      "source": "string"
    }
  ]
}
```

#### **Custom Logic for WhatsApp Numbers**
- If a conversation's source is `WhatsApp`, ensure the associated WhatsApp number is stored in the database.  
- If the WhatsApp number is missing, infer it from user-provided input (e.g., frontend forms).

---

This response contains the full **Frontend Instructions** and **Backend Instructions** with the requested revisions, integrations, and file structure. Let me know if further adjustments are needed!