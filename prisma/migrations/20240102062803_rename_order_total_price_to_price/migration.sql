/*
  Warnings:

  - You are about to drop the column `total_price` on the `Order` table. All the data in the column will be lost.
  - Added the required column `price` to the `Order` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `Order` DROP COLUMN `total_price`,
    ADD COLUMN `price` DOUBLE NOT NULL;
