-- Run this SQL in your database console to create test data
-- You can execute this at: https://console.neon.tech

-- Clear existing data (optional)
DELETE FROM "Message";
DELETE FROM "User";

-- Reset sequences
ALTER SEQUENCE "User_id_user_seq" RESTART WITH 1;
ALTER SEQUENCE "Message_id_message_seq" RESTART WITH 1;

-- Create test users
INSERT INTO "User" (nom, email, mot_de_passe, role, date_creation) VALUES
('Demo User', 'demo@example.com', 'password123', 'parent', NOW()),
('John Teacher', 'john@example.com', 'password123', 'enseignant', NOW()),
('Sarah Parent', 'sarah@example.com', 'password123', 'parent', NOW()),
('Admin User', 'admin@example.com', 'password123', 'admin', NOW());

-- Create sample messages
INSERT INTO "Message" (expediteur_id, destinataire_id, contenu, date_envoi, lu) VALUES
(2, 1, 'Hello! This is a test message from the teacher.', NOW() - INTERVAL '2 hours', false),
(1, 2, 'Hi! Thanks for your message.', NOW() - INTERVAL '1 hour', true),
(3, 1, 'Hey, how are you doing?', NOW() - INTERVAL '30 minutes', false),
(1, 3, 'I am doing great, thanks!', NOW() - INTERVAL '15 minutes', true),
(4, 1, 'Important admin message for you.', NOW() - INTERVAL '5 minutes', false),
(2, 1, 'Don''t forget about the parent-teacher meeting tomorrow!', NOW() - INTERVAL '3 minutes', false);

-- Verify the data
SELECT * FROM "User";
SELECT * FROM "Message" ORDER BY date_envoi DESC;
