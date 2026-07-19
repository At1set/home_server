-- AlterTable
ALTER TABLE `users` MODIFY `role` ENUM('user', 'admin', 'owner') NOT NULL DEFAULT 'user';
