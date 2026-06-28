### User relationship with other entities in the system is as follows:

User (1)
   │
   │ owns
   ▼
Channel (1)
   │
   │ has many
   ▼
Video (Many)
   │
   │ has many
   ▼
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