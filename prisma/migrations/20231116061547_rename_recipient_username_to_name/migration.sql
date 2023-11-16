/*
  Warnings:

  - You are about to drop the column `username` on the `Recipient` table. All the data in the column will be lost.
  - Added the required column `name` to the `Recipient` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `Recipient` DROP COLUMN `username`,
    ADD COLUMN `name` VARCHAR(191) NOT NULL;
