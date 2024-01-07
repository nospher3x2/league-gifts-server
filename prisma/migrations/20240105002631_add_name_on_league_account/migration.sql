/*
  Warnings:

  - A unique constraint covering the columns `[username]` on the table `LeagueAccount` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE `LeagueAccount` ADD COLUMN `name` VARCHAR(191) NOT NULL DEFAULT '';

-- CreateIndex
CREATE UNIQUE INDEX `LeagueAccount_username_key` ON `LeagueAccount`(`username`);
