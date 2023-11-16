/*
  Warnings:

  - You are about to drop the column `userId` on the `Recipient` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[user_id]` on the table `Recipient` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `user_id` to the `Recipient` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE `Recipient` DROP FOREIGN KEY `Recipient_userId_fkey`;

-- AlterTable
ALTER TABLE `Recipient` DROP COLUMN `userId`,
    ADD COLUMN `user_id` VARCHAR(191) NOT NULL;

-- AddForeignKey
ALTER TABLE `Recipient` ADD CONSTRAINT `Recipient_user_id_fkey` FOREIGN KEY (`user_id`) REFERENCES `User`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
