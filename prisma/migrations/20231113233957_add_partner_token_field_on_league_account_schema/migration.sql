/*
  Warnings:

  - Added the required column `partner_token` to the `LeagueAccount` table without a default value. This is not possible if the table is not empty.
  - Added the required column `partner_token_expire_at` to the `LeagueAccount` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `LeagueAccount` ADD COLUMN `partner_token` VARCHAR(191) NOT NULL,
    ADD COLUMN `partner_token_expire_at` DATETIME(3) NOT NULL;
