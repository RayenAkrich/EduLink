# EduLink Messaging System - Testing Guide

## 🚀 Quick Start

Follow these steps to test the complete messaging workflow:

### Step 1: Seed the Database with Test Data

**Option A: Using the seed script (if database is accessible)**
```powershell
cd backend
npm run seed
```

**Option B: Using SQL directly (recommended if database is remote/Neon)**
1. Go to your Neon database console: https://console.neon.tech
2. Select your project and database
3. Open the SQL Editor
4. Copy the contents of `backend/prisma/seed.sql`
5. Paste and execute it in the SQL Editor

This will create 4 test users and sample messages:
- **User 1 (Demo User)** - ID: 1, Role: parent
- **User 2 (John Teacher)** - ID: 2, Role: enseignant  
- **User 3 (Sarah Parent)** - ID: 3, Role: parent
- **User 4 (Admin User)** - ID: 4, Role: admin

### Step 2: Start the Backend Server

```powershell
cd backend
npm run dev
```

The server will start on `http://localhost:5000`

You should see:
```
Server running on http://localhost:5000
```

### Step 3: Start the Frontend Development Server

Open a **new terminal** and run:

```powershell
cd frontend
npm run dev
```

The frontend will start on `http://localhost:5173` (Vite default port)

### Step 4: Access the Application

Open your browser and navigate to:
```
http://localhost:5173/messages
```

## 🧪 Testing the Messaging Features

### 1. **View Conversations List**
- You should see 3 conversations (with User 2, User 3, and User 4)
- Each conversation shows the last message
- Unread message count is displayed

### 2. **Open a Conversation**
- Click on any conversation to open the chat
- You'll see the message history between you (Demo User) and the selected user

### 3. **Send a Message**
- Type a message in the input field at the bottom
- Click "Send" or press Enter
- The message should appear immediately in the chat
- The conversation list should update with your new message

### 4. **Real-time Updates (Socket.io)**
- Open the app in two different browser windows/tabs
- Send a message from one window
- It should appear in real-time in the other window (if viewing the same conversation)

### 5. **Mark Messages as Read**
- When you open a conversation, unread messages are automatically marked as read
- The unread count in the conversation list should update

## 🔑 Demo Credentials

The app currently uses a demo token for testing:
- **Token**: `demo-token-12345`
- **User ID**: 1 (Demo User)

These are automatically set in localStorage when you load the app.

## 🛠️ Testing Different Users

To test as different users, you can modify `frontend/src/App.tsx`:

```typescript
// Change this section to test as different users
const demoUser = {
  id_user: 2,  // Change to 2, 3, or 4 to test as different users
  nom: "John Teacher",
  email: "john@example.com"
};
```

## 📡 API Endpoints

Test these endpoints using tools like Postman or curl:

### Get Conversations List
```
GET http://localhost:5000/messages/list
Headers: Authorization: Bearer demo-token-12345
```

### Get Conversation with Specific User
```
GET http://localhost:5000/messages/conversation/2
Headers: Authorization: Bearer demo-token-12345
```

### Send Message
```
POST http://localhost:5000/messages/send
Headers: Authorization: Bearer demo-token-12345
Body: {
  "destinataire_id": 2,
  "contenu": "Hello from API!"
}
```

### Mark Messages as Read
```
PATCH http://localhost:5000/messages/read
Headers: Authorization: Bearer demo-token-12345
Body: {
  "otherId": 2
}
```

## 🐛 Troubleshooting

### Database Connection Issues
```powershell
cd backend
npx prisma migrate dev
npx prisma generate
```

### Frontend Not Loading
- Check that backend is running on port 5000
- Check browser console for errors
- Verify Socket.io connection in Network tab

### No Messages Appearing
- Run the seed script again: `npm run seed`
- Check backend terminal for errors
- Verify database connection in `.env` file

### Socket.io Not Connecting
- Check browser console for WebSocket errors
- Verify CORS settings in `backend/src/server.ts`
- Ensure backend server is running

## 🎯 What to Test

✅ **Conversation List**
- [ ] Shows all conversations
- [ ] Displays last message
- [ ] Shows unread count
- [ ] Updates in real-time when new message arrives

✅ **Chat Page**
- [ ] Loads message history
- [ ] Sends new messages
- [ ] Displays sender/receiver correctly
- [ ] Auto-scrolls to bottom
- [ ] Marks messages as read

✅ **Real-time Features**
- [ ] New messages appear without refresh
- [ ] Conversation list updates automatically
- [ ] Socket.io connects successfully

✅ **API**
- [ ] All endpoints return correct data
- [ ] Authentication works with demo token
- [ ] Error handling works properly

## 📝 Notes

- The demo token bypass is for **testing only** - remove it before production
- Real authentication should use JWT with proper user credentials
- Add password hashing (bcrypt) for production use
- Consider adding message attachments, typing indicators, etc.

## 🔄 Reset Test Data

To reset and reseed the database:

```powershell
cd backend
npm run seed
```

This will clear all existing messages and users, then create fresh test data.
