/*
  Warnings:

  - You are about to alter the column `role` on the `users` table. The data in that column could be lost. The data in that column will be cast from `VarChar(50)` to `Enum(EnumId(0))`.
  - A unique constraint covering the columns `[user_id,device_id]` on the table `sessions` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE `users` MODIFY `role` ENUM('user', 'admin') NOT NULL DEFAULT 'user';

-- CreateIndex
CREATE UNIQUE INDEX `idx_sessions_user_device` ON `sessions`(`user_id`, `device_id`);
