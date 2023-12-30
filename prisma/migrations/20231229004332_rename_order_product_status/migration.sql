/*
  Warnings:

  - You are about to drop the column `order_transaction_item_id` on the `orders_transactions` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE `orders_transactions` DROP COLUMN `order_transaction_item_id`;
