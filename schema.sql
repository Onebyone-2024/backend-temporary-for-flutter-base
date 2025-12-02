-- Database Schema for Social Media Backend
-- Generated from Prisma Schema

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Users Table
CREATE TABLE users (
    uuid UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    full_name VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    status VARCHAR(100),
    password VARCHAR(255) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Direct Chats Table
CREATE TABLE direct_chats (
    uuid UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    uuid_1 UUID NOT NULL REFERENCES users(uuid) ON DELETE CASCADE,
    uuid_2 UUID NOT NULL REFERENCES users(uuid) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(uuid_1, uuid_2)
);

-- Groups Table
CREATE TABLE groups (
    uuid UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    photo VARCHAR(500),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Chats Table
CREATE TABLE chats (
    uuid UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    text_message TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    created_by UUID NOT NULL REFERENCES users(uuid) ON DELETE CASCADE,
    group_uuid UUID REFERENCES groups(uuid) ON DELETE CASCADE
);

-- Reels Table
CREATE TABLE reels (
    uuid UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    description TEXT,
    source VARCHAR(500) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    created_by UUID NOT NULL REFERENCES users(uuid) ON DELETE CASCADE
);

-- Task Lists Table
CREATE TABLE task_lists (
    uuid UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    task TEXT NOT NULL,
    is_completed BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    created_by UUID NOT NULL REFERENCES users(uuid) ON DELETE CASCADE
);

-- Indexes for better performance
CREATE INDEX idx_direct_chats_users ON direct_chats(uuid_1, uuid_2);
CREATE INDEX idx_chats_created_by ON chats(created_by);
CREATE INDEX idx_chats_group ON chats(group_uuid);
CREATE INDEX idx_reels_created_by ON reels(created_by);
CREATE INDEX idx_task_lists_created_by ON task_lists(created_by);
CREATE INDEX idx_users_email ON users(email);

-- Comments
COMMENT ON TABLE users IS 'User accounts with authentication';
COMMENT ON TABLE direct_chats IS 'One-on-one chat rooms between two users';
COMMENT ON TABLE groups IS 'Group chat rooms';
COMMENT ON TABLE chats IS 'Chat messages for both direct and group chats';
COMMENT ON TABLE reels IS 'Video reels posted by users';
COMMENT ON TABLE task_lists IS 'Task/todo lists created by users';
