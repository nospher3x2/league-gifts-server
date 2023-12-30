/*
  Warnings:

  - You are about to drop the column `sender_account_id` on the `OrderTransaction` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE `OrderTransaction` DROP FOREIGN KEY `OrderTransaction_sender_account_id_fkey`;

-- AlterTable
ALTER TABLE `OrderTransaction` DROP COLUMN `sender_account_id`,
    ADD COLUMN `sender_id` VARCHAR(191) NULL;

-- AddForeignKey
ALTER TABLE `OrderTransaction` ADD CONSTRAINT `OrderTransaction_sender_id_fkey` FOREIGN KEY (`sender_id`) REFERENCES `LeagueAccount`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;
