ALTER TABLE "relationships.dev" 
DROP CONSTRAINT "relationships.dev_user1_fkey",
  ADD CONSTRAINT "relationships.dev_user1_fkey"
  FOREIGN KEY (user1) 
  REFERENCES "users.dev"(email)
  ON DELETE CASCADE;

ALTER TABLE "relationships.dev" 
DROP CONSTRAINT "relationships.dev_user2_fkey",
  ADD CONSTRAINT "relationships.dev_user2_fkey"
  FOREIGN KEY (user2) 
  REFERENCES "users.dev"(email)
  ON DELETE CASCADE;

ALTER TABLE "messages.dev" 
DROP CONSTRAINT "messages.dev_author_fkey",
  ADD CONSTRAINT "messages.dev_author_fkey"
  FOREIGN KEY (author) 
  REFERENCES "users.dev"(email)
  ON DELETE CASCADE;

ALTER TABLE "messages2.dev" 
DROP CONSTRAINT "messages2.dev_receiver_fkey",
  ADD CONSTRAINT "messages2.dev_receiver_fkey"
  FOREIGN KEY (receiver) 
  REFERENCES "users.dev"(email)
  ON DELETE CASCADE;

ALTER TABLE "messages2.dev" 
DROP CONSTRAINT "messages2.dev_sender_fkey",
  ADD CONSTRAINT "messages2.dev_sender_fkey"
  FOREIGN KEY (sender) 
  REFERENCES "users.dev"(email)
  ON DELETE CASCADE;