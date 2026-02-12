🔐 Secure Authentication System (MERN Stack)

A production-ready authentication system built using Next.js, Node.js, Express.js, and MongoDB.

This project implements secure user registration, email verification, JWT-based authentication, multi-device session management, logout controls, password reset, and race-condition-safe session handling.

🚀 Tech Stack
Frontend

Next.js (App Router)

Custom CSS

Backend

Node.js

Express.js

MongoDB (Atlas)

Mongoose

JWT

bcrypt

Nodemailer

UUID

📦 Project Setup
1️⃣ Clone Repository
git clone https://github.com/<your-username>/kalp-auth-assignment.git
cd kalp-auth-assignment

🔧 Backend Setup
cd backend
npm install

Create .env
PORT=5000
MONGO_URI=your_mongodb_connection_string
EMAIL_USER=your_email
EMAIL_PASS=your_app_password
JWT_SECRET=your_super_secret_key
JWT_EXPIRES_IN=1d
BACKEND_URL=http://localhost:5000
FRONTEND_URL=http://localhost:3000

Run Backend
npm run dev


Backend runs at:

http://localhost:5000

💻 Frontend Setup
cd auth-frontend
npm install

Create .env.local
NEXT_PUBLIC_BACKEND_URL=http://localhost:5000

Run Frontend
npm run dev


Frontend runs at:

http://localhost:3000

🔐 Authentication Flow
1️⃣ User Registration

User submits email + password

Password hashed using bcrypt

User saved with isVerified = false

Verification token generated using crypto

Email sent with verification link

2️⃣ Email Verification

User clicks verification link

Token validated from database

If valid:

User marked as verified

Token deleted (single-use)

If expired:

Verification fails

3️⃣ Login Flow

Login intelligently handles 3 scenarios:

Case 1 – User does not exist

Auto-register

Send verification email

Login blocked until verification

Case 2 – User exists but not verified

Resend verification email

Login blocked

Case 3 – User verified

Password verified using bcrypt

JWT generated

Session created in database

Token returned

JWT contains:

{
  userId,
  sessionId
}

🛡 Protected Routes

Middleware performs:

JWT validation

Session existence check

Session active check

If any fails → Access denied.

📱 Session Management Strategy

Each login creates a session record:

Session {
  userId
  sessionId (UUID)
  userAgent
  ip
  isActive
  lastActive
}

Features

Multiple device login support

Track all active sessions

Logout current device

Logout all devices

Password reset invalidates all sessions

Session linked to JWT via sessionId

🔁 Logout Strategy
Logout Current Device

Set session isActive = false

Logout All Devices

Update all sessions of user:

isActive = false

🔐 Password Reset Flow

Reset token generated

Token stored with expiry

Token is single-use

On password reset:

All sessions invalidated

User must login again

⚔ Race Condition Handling (Mandatory Requirement)
🚨 Problem

Two login requests hit the server simultaneously.

Risk:

Duplicate sessions

Data inconsistency

Security flaws

✅ Implemented Solution
1️⃣ Unique Email Constraint
email: { unique: true }


Prevents duplicate users.

2️⃣ Atomic Session Creation

Each login generates:

sessionId = uuidv4()


Each session stored independently.

No overwriting occurs.

3️⃣ JWT + Session Mapping

Middleware validates:

Session.findOne({
  userId,
  sessionId,
  isActive: true
})


If session missing → token invalid.

4️⃣ Data Integrity Maintained

Even if two login requests arrive simultaneously:

Each gets unique sessionId

Both sessions valid

No user duplication

No corrupted state

System remains consistent.

💬 Real-Time Chat Architecture (Design Only)
🏗 High-Level Architecture
Client (Web/Mobile)
        |
   WebSocket Layer
        |
   Chat Service
        |
    MongoDB

🔌 Communication Strategy
REST APIs

Authentication

Fetch chat history

User profile

WebSockets

Real-time messaging

Typing indicators

Presence updates

Read receipts

🗄 Database Schema
User
User {
  _id
  email
  password
  isVerified
}

Conversation
Conversation {
  _id
  participants [userId]
  lastMessage
  updatedAt
}

Message
Message {
  _id
  conversationId
  senderId
  content
  status (sent, delivered, read)
  createdAt
}

📩 Message Flow

Sender sends message

WebSocket event emitted

Server saves message

Receiver receives real-time event

Status updates:

Sent

Delivered

Read

🟢 Presence Handling

WebSocket connection marks user online

Disconnect marks offline

Broadcast updates to contacts

📲 Multi-Device Synchronization

Each device maintains active WebSocket connection

Messages saved once in DB

All devices subscribed to conversation receive updates

Read receipts synced across devices

⚡ Scalability Strategy

Horizontal scaling

Load balancer

Redis Pub/Sub for multi-instance sync

Indexed database queries

Message pagination

Sharding support

🧯 Failure Handling

Message acknowledgement

Retry mechanism

Persistent storage before emit

Graceful reconnection handling

🔒 Security Practices

bcrypt password hashing

JWT expiration

Session validation

Token invalidation

Email verification

CORS configuration

Environment variable protection

🌍 Deployment

Backend deployed on Render :- https://kalp-auth-assignment.onrender.com/


Environment variables configured securely in production.

✅ Evaluation Criteria Covered

✔ Secure authentication
✔ JWT-based login
✔ Multi-device session management
✔ Session invalidation
✔ Race condition handling
✔ Concurrency safety
✔ Real-world system design
✔ Production-level architecture

👩‍💻 Author

Asmi Verma
Full Stack Developer (MERN)
