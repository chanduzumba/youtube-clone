#  YouTube Clone Backend

REST API for the YouTube Clone built using Node.js, Express.js, and MongoDB.

---

## Tech Stack

- Node.js
- Express.js
- MongoDB
- Mongoose
- JWT

---

## Features

- Authentication
- User APIs
- Channel APIs
- Video APIs
- Comment APIs
- Like APIs

---

## Installation

```bash
npm install
```

Run

```bash
npm start
```

---

## Environment Variables

```
PORT=
MONGO_URI=
JWT_SECRET=
```

---

## API Modules

```
Auth
Users
Channels
Videos
Comments

```

---

## Project Structure

```
backend/
│
├── config
├── controllers
├── middleware
├── models
├── routes
├── uploads
├── utils
└── server.js
```

---

## API Documentation

### Authentication

```
POST /api/auth/register
POST /api/auth/login
```

### Videos

```
GET /api/videos
POST /api/videos
PUT /api/videos/:id
DELETE /api/videos/:id
```

### Channels

```
GET /api/channels
POST /api/channels
PUT /api/channels/:id
DELETE /api/channels/:id
```

### Comments

```
GET /api/comments/video/:id
POST /api/comments
PUT /api/comments/:id
DELETE /api/comments/:id
```

### Likes

```
PATCH /api/videos/:id/like
PATCH /api/videos/:id/dislike
PATCH /api/comments/:id/like
PATCH /api/comments/:id/dislike
```
### DNS Set Servers to Avoid Resolution Issues which causes DB connection errors before connecting to MongoDB Atlas. This is especially useful in environments with custom DNS configurations. 
```javascript
const dns = require('dns');
dns.setServers(["8.8.8.8", "8.8.4.4"]);
```

### User relationship with other entities in the system is as follows:
User (1)
   │
   └──────────────┐
                  │
             Channel (One)
                  │
                  └─────────────┐
                                │
                           Video (Many)
                                │
                                └──────────────┐
                                               │
                                          Comment (Many)

### Video relationship with other entities in the system is as follows:
User
 └── uploads
      │
      ▼
Video
 ├── uploader → User
 ├── channel → Channel
 └── comments ← Comment

Channel
 └── has many Videos

### Comment relationship with other entities in the system is as follows:
Comment
 ├── video → Video
 └── user → User

 User
 │
 │ writes
 ▼
Comment
 │
 │ belongs to
 ▼
Video
 │
 │ belongs to
 ▼
Channel