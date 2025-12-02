# Entity Relationship Diagram (Mermaid)

```mermaid
erDiagram
    User ||--o{ DirectChat : "user1"
    User ||--o{ DirectChat : "user2"
    User ||--o{ GroupChat : "creates"
    User ||--o{ GroupMember : "joins"
    User ||--o{ Reel : "creates"
    User ||--o{ TaskList : "owns"

    Group ||--o{ GroupChat : "contains"
    Group ||--o{ GroupMember : "has"

    User {
        uuid uuid PK
        string fullName
        string email UK
        string status
        string password
        datetime createdAt
    }

    DirectChat {
        uuid uuid PK
        uuid uuid1 FK
        uuid uuid2 FK
        datetime createdAt
    }

    Group {
        uuid uuid PK
        string name
        string photo
        datetime createdAt
    }

    GroupMember {
        uuid uuid PK
        uuid groupUuid FK
        uuid userUuid FK
        datetime joinedAt
    }

    GroupChat {
        uuid uuid PK
        text textMessage
        datetime createdAt
        uuid createdBy FK
        uuid groupUuid FK
    }

    Reel {
        uuid uuid PK
        text description
        string source
        datetime createdAt
        uuid createdBy FK
    }

    TaskList {
        uuid uuid PK
        uuid uuidUser FK
        text task
        boolean isCompleted
        datetime createdAt
    }
```

## Relationships Explained

### User Relationships

- **User ↔ DirectChat**: A user can be part of multiple direct chats (as user1 or user2)
- **User ↔ GroupMember**: A user can join multiple groups
- **User ↔ GroupChat**: A user can create multiple group chat messages
- **User ↔ Reel**: A user can create multiple reels
- **User ↔ TaskList**: A user can have multiple tasks

### Chat Structure

- **DirectChat**: Represents the conversation container between two users (1-on-1)
- **Group ↔ GroupMember**: A group can have multiple members
- **Group ↔ GroupChat**: A group conversation contains multiple group chat messages

### Key Points

- `GroupMember` table manages group membership (many-to-many relationship between User and Group)
- `GroupChat` table is for **group messages** in groups
- `DirectChat` represents the conversation container between two users
- `Group` represents the conversation container for multiple users
